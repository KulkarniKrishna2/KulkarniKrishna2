/**
 * Created by FinTech on 11-07-2017.
 */
(function (module) {
    mifosX.controllers = _.extend(module, {
        ManagePDCController: function (scope, routeParams, resourceFactory, location, dateFilter, $modal) {
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
                scope.isSearchPDCData = false;
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

            scope.actionToBePerformed = function (action) {
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
                }
            };

        }
    });

    mifosX.ng.application.controller('ManagePDCController', ['$scope', '$routeParams', 'ResourceFactory', '$location', 'dateFilter', '$modal', mifosX.controllers.ManagePDCController]).run(function ($log) {
        $log.info("ManagePDCController initialized");
    });
}(mifosX.controllers || {}));