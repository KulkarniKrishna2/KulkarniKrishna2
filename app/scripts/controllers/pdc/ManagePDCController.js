/**
 * Created by FinTech on 11-07-2017.
 */
(function (module) {
    mifosX.controllers = _.extend(module, {
        ManagePDCController: function (scope, routeParams, resourceFactory, location, dateFilter, $modal, excelExportTableService, $timeout) {
            scope.isSearchPDCData = false;
            scope.formData = {};
            resourceFactory.pdcSearchTemplateResource.getSearchTemplate({}, function (data) {
                scope.templateSearchData = data;
                scope.formData.chequeStatus = scope.templateSearchData.chequeStatusOptions[0].id;
            });

            scope.callSearchPDCData = function () {
                if (scope.formData.fromDate) {
                    scope.formData.fromDate = dateFilter(new Date(scope.formData.fromDate), scope.df);
                }
                if (scope.formData.toDate) {
                    scope.formData.toDate = dateFilter(new Date(scope.formData.toDate), scope.df);
                }
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;
                resourceFactory.pdcSearchResource.search({}, scope.formData, function (successData) {
                    scope.isSearchPDCData = true;
                    scope.searchPDCData = successData;
                    for (var i in successData) {
                        scope.chequeStatusObj = successData[i].presentStatus;
                        break;
                    }
                });
            };

            scope.present = "present";
            scope.bounced = "bounced";
            scope.clear = "clear";
            scope.cancel = "cancel";
            scope.return = "return";
            scope.undo = "undo";

            scope.back = function () {
                delete scope.errorDetails;
                scope.isSearchPDCData = false;
                scope.isSelectAllPDC = false;
            };

            scope.isEnableThisAction = function (action) {
                if (action === scope.present && scope.chequeStatusObj.id < 2) {
                    return true;
                } else if (action === scope.bounced && scope.chequeStatusObj.id == 2) {
                    return true;
                } else if (action === scope.clear && scope.chequeStatusObj.id == 2) {
                    return true;
                } else if (action === scope.cancel && scope.chequeStatusObj.id == 1) {
                    return true;
                } else if (action === scope.return && (scope.chequeStatusObj.id == 3 || scope.chequeStatusObj.id == 5)) {
                    return true;
                } else if (action === scope.undo && scope.chequeStatusObj.id > 1) {
                    return true;
                }
                return false;
            };

            scope.routeToViewPDC = function (id, index) {
                location.path('pdc/view/' + id);
            };

            scope.actionToBePerformed = function (action) {
                delete scope.errorDetails;
                var isPDCSelected = false;
                scope.isSingleOperation = false;
                scope.pdcChequeDetails = [];
                for (var i in scope.searchPDCData) {
                    if (scope.searchPDCData[i].isChecked && scope.searchPDCData[i].isChecked.toString() == 'true') {
                        isPDCSelected = true;
                        scope.pdcChequeDetails.push(scope.searchPDCData[i].id);
                    }
                }
                if (isPDCSelected) {
                    scope.action = action;
                    scope.modalInstance = $modal.open({
                        templateUrl: 'actiononpdc.html',
                        controller: 'ActionOnPDCController',
                        size: 'lg',
                        scope: scope,
                        resolve: {}
                    });
                } else {
                    scope.errorDetails = [];
                    var errorObj = new Object();
                    errorObj.args = {
                        params: []
                    };
                    errorObj.args.params.push({value: 'validation.msg.pdc.select.at.least.one.pdc'});
                    scope.errorDetails.push(errorObj);
                }
            };

            scope.exportToPdf = function (print) {
                var printContents = document.getElementById(print).innerHTML;
                var popupWin = window.open('', '_blank', 'width=300,height=300');
                popupWin.document.open();
                popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="styles/repaymentscheduleprintstyle.css" />' +
                    '</head><body onload="window.print()">' + printContents + '<br></body></html>');
                popupWin.document.close();
            };

            scope.exportToExcel = function (tableId) { // ex: '#my-table'
                var exportHref = excelExportTableService.tableToExcel(tableId, 'PDC Report');
                $timeout(function () {
                    window.location.href = exportHref;
                }, 100); // trigger download
            };

            scope.isSelectAllPDC = false;
            scope.checkOrUncheckAllSelectedPDC = function () {
                scope.isSelectAllPDC = !scope.isSelectAllPDC;
                if(scope.isSelectAllPDC){
                    for(var i in scope.searchPDCData){
                        if(scope.searchPDCData[i].chequeDate && scope.searchPDCData[i].chequeAmount){
                            scope.searchPDCData[i].isChecked = true;
                        }
                    }
                }else{
                    for(var i in scope.searchPDCData){
                        if(scope.searchPDCData[i].isChecked){
                            scope.searchPDCData[i].isChecked = false;
                        }
                    }
                }
            };
        }
    });

    mifosX.ng.application.controller('ManagePDCController', ['$scope', '$routeParams', 'ResourceFactory', '$location', 'dateFilter', '$modal', 'ExcelExportTableService', '$timeout', mifosX.controllers.ManagePDCController]).run(function ($log) {
        $log.info("ManagePDCController initialized");
    });
}(mifosX.controllers || {}));