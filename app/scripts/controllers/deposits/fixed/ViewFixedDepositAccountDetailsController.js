(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewFixedDepositAccountDetailsController: function (scope, routeParams, resourceFactory, location, route, dateFilter,$modal) {
            scope.isDebit = function (savingsTransactionType) {
                return savingsTransactionType.withdrawal == true || savingsTransactionType.feeDeduction == true || savingsTransactionType.withholdTax == true || savingsTransactionType.accrual == true;
            };
            scope.showAccrualTransactionOption = false;
            scope.viewAccrualTransaction = {};
            scope.viewAccrualTransaction.show = false;
            scope.sections = [];

            scope.clickEvent = function (eventName, accountId) {
                eventName = eventName || "";
                switch (eventName) {
                    case "modifyapplication":
                        location.path('/editfixeddepositaccount/' + accountId);
                        break;
                    case "approve":
                        location.path('/fixeddepositaccount/' + accountId + '/approve');
                        break;
                    case "reject":
                        location.path('/fixeddepositaccount/' + accountId + '/reject');
                        break;
                    case "withdrawnbyclient":
                        location.path('/fixeddepositaccount/' + accountId + '/withdrawnByApplicant');
                        break;
                    case "undoapproval":
                        location.path('/fixeddepositaccount/' + accountId + '/undoapproval');
                        break;
                    case "activate":
                        location.path('/fixeddepositaccount/' + accountId + '/activate');
                        break;
                    case "addcharge":
                        location.path('/fixeddepositaccount/' + accountId + '/charges');
                        break;
                    case "calculateInterest":
                        resourceFactory.fixedDepositAccountResource.save({accountId: accountId, command: 'calculateInterest'}, {}, function (data) {
                            route.reload();
                        });
                        break;
                    case "postInterest":
                        resourceFactory.fixedDepositAccountResource.save({accountId: accountId, command: 'postInterest'}, {}, function (data) {
                            route.reload();
                        });
                        break;
                    case "postAccrual":
                        resourceFactory.fixedDepositAccountResource.save({accountId: accountId, command: 'postAccrual'}, {}, function (data) {
                            route.reload();
                        });
                        break;
                    case "close":
                        location.path('/fixeddepositaccount/' + accountId + '/close');
                        break;
                    case "prematureClose":
                        location.path('/fixeddepositaccount/' + accountId + '/prematureClose');
                        break;
                    case "enableWithHoldTax":
                        var changes = {
                            withHoldTax:true
                        };
                        resourceFactory.savingsResource.update({accountId: accountId, command: 'updateWithHoldTax'}, changes, function (data) {
                            route.reload();
                        });
                        break;
                    case "disableWithHoldTax":
                        var changes = {
                            withHoldTax:false
                        };
                        resourceFactory.savingsResource.update({accountId: accountId, command: 'updateWithHoldTax'}, changes, function (data) {
                            route.reload();
                        });
                        break;

                }
            };

            scope.hideTransactions = function(transaction){
                if(scope.viewAccrualTransaction.show==false && transaction.transactionType.accrual==true){
                    return true;
                }
                return false;
            }

            scope.routeTo = function (transaction) {
                var accountId = transaction.accountId;
                var transactionId= transaction.id;
                var accountTransfer = transaction.transfer ;
                if(transaction.transactionType.accrual==false){
                    if (accountTransfer) {
                        var transferId = transaction.transfer.id;
                        location.path('/viewaccounttransfers/' + transferId).search('redirectPath','viewfixeddepositaccount').search('accoutId',accountId);
                    } else {
                        location.path('/viewfixeddepositaccounttrxn/' + accountId + '/' + transactionId);
                    }
                }
            };

            resourceFactory.fixedDepositAccountResource.get({accountId: routeParams.id, associations: 'all'}, function (data) {
                scope.savingaccountdetails = data;
                scope.showPostAccrual = (data.status.value == "Active" && data.accountingRuleType.isAccrualPeriodic==true);
                scope.showAccrualTransactionOption = (data.accountingRuleType.isAccrualPeriodic==true);
                scope.depositProductName = data.depositProductName;
                scope.clientId=data.clientId;
                scope.savingsaccountholderclientName=data.clientName;
                scope.accountNumber = data.accountNo;
                scope.convertDateArrayToObject('date');
                scope.chartSlabs = scope.savingaccountdetails.accountChart.chartSlabs;
                scope.status = data.status.value;
                if (scope.status == "Submitted and pending approval" || scope.status == "Active" || scope.status == "Approved") {
                    scope.choice = true;
                }
                scope.chargeAction = data.status.value == "Submitted and pending approval" ? true : false;
                if (scope.savingaccountdetails.charges) {
                    scope.charges = scope.savingaccountdetails.charges;
                    scope.chargeTableShow = true;
                } else {
                    scope.chargeTableShow = false;
                }
                if (data.status.value == "Submitted and pending approval") {
                    scope.buttons = { singlebuttons: [
                        {
                            name: "button.modifyapplication",
                            icon: "icon-pencil "
                        },
                        {
                            name: "button.approve",
                            icon: "icon-ok-sign"
                        }
                    ],
                        options: [
                            {
                                name: "button.reject"
                            },
                            {
                                name: "button.withdrawnbyclient"
                            },
                            {
                                name: "button.addcharge"
                            }
                        ]
                    };
                }

                if (data.status.value == "Approved") {
                    scope.buttons = { singlebuttons: [
                        {
                            name: "button.undoapproval",
                            icon: "icon-undo"
                        },
                        {
                            name: "button.activate",
                            icon: "icon-ok-sign"
                        }
                    ]
                    };
                }

                if (data.status.value == "Active") {
                    scope.buttons = { singlebuttons: [
                        {
                            name: "button.prematureClose",
                            icon: "icon-arrow-left"
                        },
                        {
                            name: "button.calculateInterest",
                            icon: "icon-table"
                        }
                    ],
                        options: [
                            {
                                name: "button.postInterest"
                            },
                            {
                                name: "button.addcharge"
                            }
                        ]

                    };
                    
                    if(scope.showPostAccrual){
                        scope.buttons.options.push({
                            name: "button.postAccrual",
                            taskPermissionName:"POSTACCRUAL_SAVINGSACCOUNT"
                        });
                    }
                    if(data.taxGroup){
                        if(data.withHoldTax){
                            scope.buttons.options.push({
                                name: "button.disableWithHoldTax",
                                taskPermissionName:"UPDATEWITHHOLDTAX_SAVINGSACCOUNT"
                            });
                        }else{
                            scope.buttons.options.push({
                                name: "button.enableWithHoldTax",
                                taskPermissionName:"UPDATEWITHHOLDTAX_SAVINGSACCOUNT"
                            });
                        }
                    }

                }else if (data.status.value == "Matured") {
                    scope.buttons = { singlebuttons: [
                        {
                            name: "button.close",
                            icon: "icon-arrow-right"
                        },
                        {
                            name: "button.calculateInterest",
                            icon: "icon-table"
                        }
                    ],
                        options: [
                            {
                                name: "button.postInterest"
                            },
                            {
                                name: "button.addcharge"
                            }
                        ]

                    };

                }
                scope.convertDateArrayToObject('date');
            });

            scope.transactionSort = {
                column: 'date',
                columnId: 'id',
                descending: true
            };

            scope.changeTransactionSort = function(column) {
                var sort = scope.transactionSort;
                if (sort.column == column) {
                    sort.descending = !sort.descending;
                } else {
                    sort.column = column;
                    sort.descending = true;
                }
            };

            scope.checkStatus = function(){
                var statusList = ['Active', 'Closed', 'Transfer in progress', 'Transfer on hold', 'Premature Closed', 'Matured'];
                if(statusList.indexOf(scope.status) > -1){
                    return true;
                }
                return false;
            };

            scope.viewJournalEntries = function(){
                location.path("/searchtransaction/").search({savingsId: scope.savingaccountdetails.id});
            };

            scope.viewSavingsTransactionJournalEntries = function(transactionId){
                var transactionId = "S" + transactionId;
                if(scope.clientId != undefined && scope.clientId != null && scope.clientId != "" ){
                    location.path('/viewtransactions/' + transactionId).search({productName: scope.depositProductName,savingsId:routeParams.id,clientId: scope.clientId,
                        accountNo: scope.accountNumber,clientName: scope.savingsaccountholderclientName,isTransactionReferenceNumber:true});
                }
            };

            resourceFactory.DataTablesResource.getAllDataTables({apptable: 'm_savings_account'}, function (data) {
                scope.datatables = data;
            });

            scope.dataTableChange = function (datatable) {
                resourceFactory.DataTablesResource.getTableDetails({datatablename: datatable.registeredTableName,
                    entityId: routeParams.id, genericResultSet: 'true'}, function (data) {
                    scope.datatabledetails = data;
                    scope.datatabledetails.isData = data.data.length > 0 ? true : false;
                    scope.datatabledetails.isMultirow = data.columnHeaders[0].columnName == "id" ? true : false;
                    scope.datatabledetails.isColumnData = data.columnData.length > 0 ? true : false;
                    if (scope.datatabledetails.isMultirow == false) {
                        var indexI = data.columnHeaders.findIndex(x => x.columnName === 'savings_account_id');
                        if (indexI > -1) {
                            data.columnHeaders.splice(indexI, 1);
                        }
                    } else if (scope.datatabledetails.isMultirow == true) {
                        for (var m in data.columnData) {
                            var indexJ = data.columnData[m].row.findIndex(x => x.columnName === 'savings_account_id');
                            if (indexJ > -1) {
                                data.columnData[m].row.splice(indexJ, 1);
                            }
                        }
                    }
                    scope.showDataTableAddButton = !scope.datatabledetails.isData || scope.datatabledetails.isMultirow;
                    scope.showDataTableEditButton = scope.datatabledetails.isData && !scope.datatabledetails.isMultirow;
                    scope.singleRow = [];
                    scope.isSectioned = false;
                    scope.sections = [];
                    for (var i in data.columnHeaders) {
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
                                if(data.columnHeaders[i].displayName != undefined && data.columnHeaders[i].displayName != 'null') {
                                    row.key = data.columnHeaders[i].displayName;
                                } else {
                                    row.key = data.columnHeaders[i].columnName;
                                }
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

            scope.deleteAll = function (apptableName, entityId) {
                resourceFactory.DataTablesResource.delete({datatablename: apptableName, entityId: entityId, genericResultSet: 'true'}, {}, function (data) {
                    route.reload();
                });
            };

            scope.modifyTransaction = function (accountId, transactionId) {
                location.path('/fixeddepositaccount/' + accountId + '/modifytransaction?transactionId=' + transactionId);
            };

            scope.incentives = function(index){
                $modal.open({
                    templateUrl: 'incentive.html',
                    controller: IncentiveCtrl,
                    resolve: {
                        chartSlab: function () {
                            return scope.savingaccountdetails.accountChart.chartSlabs[index];
                        }
                    }
                });
            };

            /***
             * we are using orderBy(https://docs.angularjs.org/api/ng/filter/orderBy) filter to sort fields in ui
             * api returns dates in array format[yyyy, mm, dd], converting the array of dates to date object
             * @param dateFieldName
             */
            scope.convertDateArrayToObject = function(dateFieldName){
                if(scope.savingaccountdetails){
                    for(var i in scope.savingaccountdetails.transactions){
                        scope.savingaccountdetails.transactions[i][dateFieldName] = new Date(scope.savingaccountdetails.transactions[i].date);
                    }
                }                
            };

            var IncentiveCtrl = function ($scope, $modalInstance, chartSlab) {
                $scope.chartSlab = chartSlab;
                _.each($scope.chartSlab.incentives, function (incentive) {
                    if(!incentive.attributeValueDesc){
                        incentive.attributeValueDesc = incentive.attributeValue;
                    }
                });
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.hideId = function(row){
                return  (row.columnName === 'id');
            };

            scope.viewDataTable = function(registeredTableName, data) {
                if (scope.datatabledetails.isMultirow) {
                    location.path("/viewdatatableentry/" + registeredTableName + "/" + scope.savingaccountdetails.id + "/" + data.row[0].value);
                } else {
                    location.path("/viewsingledatatableentry/" + registeredTableName + "/" + scope.savingaccountdetails.id);
                }
            };
        }
    });
    mifosX.ng.application.controller('ViewFixedDepositAccountDetailsController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', 'dateFilter','$modal', mifosX.controllers.ViewFixedDepositAccountDetailsController]).run(function ($log) {
        $log.info("ViewFixedDepositAccountDetailsController initialized");
    });
}(mifosX.controllers || {}));
