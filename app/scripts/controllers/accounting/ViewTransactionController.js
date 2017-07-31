(function (module) {
    mifosX.controllers = _.extend(module, {

        ViewTransactionController: function (scope, routeParams, resourceFactory, location, route, $modal, http, API_VERSION, $rootScope, $sce, $window) {
            scope.flag = false;
            scope.manualEntry = false;
            scope.productName = routeParams.productName;
            scope.clientName = routeParams.clientName;
            scope.accountNo = routeParams.accountNo;
            scope.clientId = routeParams.clientId;
            scope.loanId = routeParams.loanId;
            scope.groupId = routeParams.groupId;
            scope.groupName = routeParams.groupName;
            scope.journalEntryTransactionId = routeParams.transactionId;
            scope.transactionIdStringvalue = routeParams.transactionId.toString();
            scope.bankNonPortfolioId = location.search().id;
            scope.bankPortfolioId = location.search().reconcileId;
            scope.isFromPortfolio = (scope.bankPortfolioId != undefined);
            scope.isFromNonPortfolio = (scope.bankNonPortfolioId != undefined);
            scope.hidePentahoReport = true;
            scope.reportName = 'Journal Voucher';
            scope.reportOutputType = 'PDF';
            scope.dataTableName = 'f_journal_entry';
            scope.transactions = [];
			scope.sections = [];
            if(scope.journalEntryTransactionId != null && scope.journalEntryTransactionId !=""){
                scope.journalEntryTransactionId = scope.journalEntryTransactionId.substring(1,scope.journalEntryTransactionId.length);
            }

            if(!routeParams.isTransactionReferenceNumber) {
                resourceFactory.journalEntriesResource.get({trxid: routeParams.transactionId}, function (data) {
                    scope.transactions.push(data);
                    if (data.reversed == false) {
                        scope.flag = true;
                    }
                    scope.manualEntry = data.manualEntry;
                    scope.transaction = scope.transactions[0];
                    scope.transactionNumber = scope.transaction.transactionId;
                });
            }else{
                resourceFactory.journalEntriesResource.get({transactionId: routeParams.transactionId, transactionDetails:true}, function (data) {
                    scope.transactionNumber = routeParams.transactionId;
                    scope.transactions = data.pageItems;
                    for (var i in data.pageItems) {
                        scope.manualEntry = data.pageItems[i].manualEntry;
                        if (data.pageItems[i].reversed == false) {
                            scope.flag = true;
                        }
                    }
                    scope.transaction =  scope.transactions[0];
                });
            }

            scope.confirmation = function () {
                $modal.open({
                    templateUrl: 'confirmation.html',
                    controller: ConfirmationCtrl,
                    resolve: {
                        id: function () {
                            return scope.trxnid;
                        }
                    }
                });
            };

            var ConfirmationCtrl = function ($scope, $modalInstance, id) {
                $scope.transactionnumber = id.transactionId;
                $scope.redirect = function () {
                    $modalInstance.close('delete');
                    location.path('/viewtransactions/' + id.resourceId);
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.showTransaction = function (transaction) {
                scope.transaction = transaction;
                $modal.open({
                    templateUrl: 'viewjournalentry.html',
                    controller: ViewJournalEntryCtrl,
                    resolve: {
                        transaction: function () {
                            return scope.transaction;
                        }
                    }
                });
            };

            var ViewJournalEntryCtrl = function ($scope, $modalInstance, transaction) {
                $scope.transaction = transaction;
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.reverseTransaction = function (transactionId) {
                $modal.open({
                    templateUrl: 'reverseTransaction.html',
                    controller: ReverseJournalEntriesCtrl,
                    resolve: {
                        transactionId: function () {
                            return transactionId;
                        }
                    }
                });
            }

            var ReverseJournalEntriesCtrl = function ($scope, $modalInstance, transactionId) {
                $scope.data = {
                    reverseComments:""
                };
                $scope.reverse = function () {
                    reverseData = {transactionId: transactionId, comments: $scope.data.reverseComments};
                    resourceFactory.journalEntriesResource.reverse(reverseData, function (data) {
                    $modalInstance.dismiss('cancel');

                    scope.trxnid = data;
                    scope.confirmation();

                    route.reload();

                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.back = function (){
                $window.history.back();
            };
            scope.runReport = function () {
                scope.hidePentahoReport = false;

                var reportURL = $rootScope.hostUrl + API_VERSION + "/runreports/" + encodeURIComponent(scope.reportName);
                reportURL += "?output-type=" + encodeURIComponent(scope.reportOutputType) + "&tenantIdentifier=" + $rootScope.tenantIdentifier + "&locale="
                + scope.optlang.code + "&dateFormat=" + scope.df + "&R_transactionId=" + scope.transactionNumber;

                reportURL = $sce.trustAsResourceUrl(reportURL);

                http.get(reportURL, {responseType: 'arraybuffer'}).
                    success(function (data, status, headers, config) {
                        var contentType = headers('Content-Type');
                        var file = new Blob([data], {type: contentType});
                        var fileContent = URL.createObjectURL(file);

                        scope.baseURL = $sce.trustAsResourceUrl(fileContent);
                    });
            }

            resourceFactory.DataTablesResource.getAllDataTables({apptable: 'f_journal_entry', isFetchBasicData : true}, function (data) {
                scope.journalentrydatatables = data;
            });

            scope.viewDataTable = function (registeredTableName,data){
                if (scope.datatabledetails.isMultirow) {
                    location.path("/viewdatatableentry/"+registeredTableName+"/"+scope.transactionIdStringvalue+"/"+data.row[0].value);
                }else{
                    location.path("/viewsingledatatableentry/"+registeredTableName+"/"+scope.transactionIdStringvalue);
                }
            };

            scope.deleteAll = function (apptableName, entityId) {
                resourceFactory.DataTablesResource.delete({datatablename: apptableName, entityId: entityId, genericResultSet: 'true', command: scope.dataTableName}, {}, function (data) {
                    route.reload();
                });
            };

            scope.dataTableChange = function (datatable) {
                resourceFactory.DataTablesResource.getTableDetails({datatablename: datatable.registeredTableName, entityId: scope.transaction.id, genericResultSet: 'true', command: scope.dataTableName}, function (data) {
                    scope.datatabledetails = data;
                    scope.datatabledetails.isData = data.data.length > 0 ? true : false;
                    scope.datatabledetails.isMultirow = data.columnHeaders[0].columnName == "id" ? true : false;
                    scope.datatabledetails.isColumnData = data.columnData.length > 0 ? true : false;
                    scope.showDataTableAddButton = !scope.datatabledetails.isData || scope.datatabledetails.isMultirow;
                    scope.showDataTableEditButton = scope.datatabledetails.isData && !scope.datatabledetails.isMultirow;
                    scope.singleRow = [];
					scope.isSectioned = false;
                    scope.sections = [];
                    for (var i in data.columnHeaders) {
                        if(data.isData && scope.datatabledetails.columnHeaders[i].columnName == 'journal_entry_id'){
                            data.columnHeaders.splice(i, 1);
                            scope.removeJournalEntryColumnData(data, data.isMultirow);
                        
                        }
                        if (scope.datatabledetails.columnHeaders[i].columnCode) {
                            for (var j in scope.datatabledetails.columnHeaders[i].columnValues) {
                                for (var k in data.data) {
                                    if (data.data[k].row[i] == scope.datatabledetails.columnHeaders[i].columnValues[j].id) {
                                        data.data[k].row[i] = scope.datatabledetails.columnHeaders[i].columnValues[j].value;
                                    }
                                }
                                for(var m in data.columnData){
                                    for(var n in data.columnData[m].row){
                                        if(data.columnData[m].row[n].columnName == scope.datatabledetails.columnHeaders[i].columnName && data.columnData[m].row[n].value == scope.datatabledetails.columnHeaders[i].columnValues[j].id){
                                            data.columnData[m].row[n].value = scope.datatabledetails.columnHeaders[i].columnValues[j].value;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if(data.sectionedColumnList != null && data.sectionedColumnList !=undefined && data.sectionedColumnList.length > 0){
                        scope.isSectioned = true;
                    }
                    if (scope.datatabledetails.isColumnData) {
                        for (var i in data.columnHeaders) {
                            if (!scope.datatabledetails.isMultirow) {
                                var row = {};
                                row.key = data.columnHeaders[i].columnName;
                                for(var j in data.columnData[0].row){
                                    if(data.columnHeaders[i].columnName == data.columnData[0].row[j].columnName){
                                       row.value = data.columnData[0].row[j].value;
                                       break;
                                    }
                                }
                                scope.singleRow.push(row);
                            }
                            var index = scope.datatabledetails.columnData[0].row.findIndex(x => x.columnName==data.columnHeaders[i].columnName);
                            if(index > 0 ){
                                if(data.columnHeaders[i].displayName != undefined && data.columnHeaders[i].displayName != 'null') {
                                    scope.datatabledetails.columnData[0].row[index].displayName = data.columnHeaders[i].displayName;
                                } 
                            }
                        }
                    }
                    for(var l in data.sectionedColumnList){
                        var tempSection = {
                        displayPosition:data.sectionedColumnList[l].displayPosition,
                        displayName: data.sectionedColumnList[l].displayName,
                        cols: []
                        }
                        scope.sections.push(tempSection);
                    }
                    if(scope.isSectioned){
                        if (scope.datatabledetails.isColumnData) {
                            for(var l in data.sectionedColumnList){
                                for (var i in data.sectionedColumnList[l].columns) {
                                    for (var j in data.columnHeaders) {
                                        if(data.sectionedColumnList[l].columns[i].columnName == data.columnHeaders[j].columnName ){
                                            var index = scope.sections.findIndex(x => x.displayName==data.sectionedColumnList[l].displayName);
                                            if (!scope.datatabledetails.isMultirow) {   
                                                var row = {};
                                                if(data.columnHeaders[j].displayName != undefined && data.columnHeaders[j].displayName != 'null') {
                                                    row.key = data.columnHeaders[j].displayName;
                                                } else {
                                                    row.key = data.columnHeaders[j].columnName;
                                                }
                                                row.columnDisplayType = data.columnHeaders[j].columnDisplayType;
                                                for(var k in data.columnData[0].row){
                                                    if(data.columnHeaders[j].columnName == data.columnData[0].row[k].columnName){
                                                        row.value = data.columnData[0].row[k].value;
                                                        break;
                                                    }
                                                }
                                                scope.sections[index].cols.push(row);
                                            }
                                        } 
                                    }
                                }
                            }
                        }
                    }
                });
            };

            scope.viewentitytransaction = function (entityId,transactionId) {
                if (transactionId.toString().indexOf("L") >= 0)
                    location.path('/viewloantrxn/' + entityId + '/trxnId/' + transactionId.toString().replace("L", ""));
                if (transactionId.toString().indexOf("S") >= 0) {
                    resourceFactory.savingsResource.get({accountId: entityId}, function (accountData) {
                        if (accountData.depositType.code == "depositAccountType.fixedDeposit") {
                            location.path('/viewfixeddepositaccounttrxn/' + entityId + '/' + transactionId.toString().replace("S", ""));
                        }
                        if (accountData.depositType.code == "depositAccountType.recurringDeposit") {
                            location.path('/viewrecurringdepositaccounttrxn/' + entityId + '/' + transactionId.toString().replace("S", ""));
                        }
                        if (accountData.depositType.code == "depositAccountType.savingsDeposit") {
                            location.path('/viewsavingtrxn/' + entityId + '/trxnId/' + transactionId.toString().replace("S", ""));
                        }

                    });
                }
                if(transactionId.toString().indexOf("C")>=0)
                    location.path('/viewclient/' + entityId + '/chargeoverview');
            };

            scope.removeJournalEntryColumnData = function(data, isMultiRow){
                if(isMultiRow){
                    for(var i in data.data){
                        data.data[i].row.splice(1, 1);
                    }
                }else{
                    for(var i in data.data){
                        data.data[i].row.splice(0, 1);
                    }
                }
            }
        }
    });
    mifosX.ng.application.controller('ViewTransactionController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', '$modal', '$http', 'API_VERSION', '$rootScope', '$sce', '$window', mifosX.controllers.ViewTransactionController]).run(function ($log) {
        $log.info("ViewTransactionController initialized");
    });
}(mifosX.controllers || {}));
