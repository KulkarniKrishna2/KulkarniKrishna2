(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewSavingDetailsController: function (scope, routeParams, resourceFactory, location, $modal, route, dateFilter, $sce, $rootScope, API_VERSION,http,  CommonUtilService) {
            scope.report = false;
            scope.savingdocuments = [];
            scope.hidePentahoReport = true;
            scope.showActiveCharges = true;
            scope.formData = {};
            scope.date = {};
            scope.staffData = {};
            scope.fieldOfficers = [];
            scope.savingaccountdetails = [];
            scope.hideAmountTobePaid = true;
            scope.amountToBePaid = 0;
            scope.netOverdraftLimit = 0;
            scope.sections = [];
            scope.requestoffset = 0;
            scope.limit = 10;
            scope.hidePaymentType = true;
            scope.showPostAccrual = false;
            scope.showAccrualTransactionOption = false;
            scope.viewAccrualTransaction = {};
            scope.viewAccrualTransaction.show = false;
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.savingsAccount &&
                scope.response.uiDisplayConfigurations.savingsAccount.overDraft) {
                if(scope.response.uiDisplayConfigurations.savingsAccount.overDraft.isHiddenField &&
                !scope.response.uiDisplayConfigurations.savingsAccount.overDraft.isHiddenField.amountTobePaid) {
                    scope.hideAmountTobePaid = scope.response.uiDisplayConfigurations.savingsAccount.overDraft.isHiddenField.amountTobePaid;
                }
            }
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.savingsAccount &&
                scope.response.uiDisplayConfigurations.savingsAccount.transactions && scope.response.uiDisplayConfigurations.savingsAccount.transactions.isHiddenField) {
                    if(!scope.response.uiDisplayConfigurations.savingsAccount.transactions.isHiddenField.paymentType)
                    scope.hidePaymentType = scope.response.uiDisplayConfigurations.savingsAccount.transactions.isHiddenField.paymentType;
            }
            scope.isDebit = function (savingsTransactionType) {
                return savingsTransactionType.withdrawal == true || savingsTransactionType.feeDeduction == true
                    || savingsTransactionType.overdraftInterest == true || savingsTransactionType.withholdTax == true || savingsTransactionType.amountHold == true || savingsTransactionType.accrual == true;
            };
            
            scope.isHoldOrRelease = function (savingsTransactionType) {
                return  savingsTransactionType.amountHold == true ||  savingsTransactionType.amountRelease == true;
            };

            scope.routeTo = function (transaction) {
                var savingsAccountId = transaction.accountId;
                var transactionId= transaction.id;
                var accountTransfer = transaction.transfer ;
                if(transaction.transactionType.accrual==false){
                    if (accountTransfer) {
                        var transferId = transaction.transfer.id;
                        location.path('/viewaccounttransfers/' + transferId).search('redirectPath','viewsavingaccount').search('accoutId',savingsAccountId).search('transactionId',transactionId);
                    } else {
                        location.path('/viewsavingtrxn/' + savingsAccountId + '/trxnId/' + transactionId);
                    }
                }                
            };

            scope.isRecurringCharge = function (charge) {
                return charge.chargeTimeType.value == 'Monthly Fee' || charge.chargeTimeType.value == 'Annual Fee' || charge.chargeTimeType.value == 'Weekly Fee';
            }

            scope.viewCharge = function (id){
                location.path('/savings/'+scope.savingaccountdetails.id+'/viewcharge/'+id).search({'status':scope.savingaccountdetails.status.value});
            }

            scope.hideTransactions = function(transaction){
                if(scope.viewAccrualTransaction.show==false && transaction.transactionType.accrual==true){
                    return true;
                }
                return false;
            }

            scope.clickEvent = function (eventName, accountId) {
                eventName = eventName || "";
                switch (eventName) {
                    case "modifyapplication":
                        location.path('/editsavingaccount/' + accountId);
                        break;
                    case "approve":
                        if(scope.savingaccountdetails.allowOverdraft){
                            scope.netOverDraftLimit();
                        }
                        location.path('/savingaccount/' + accountId + '/approve/' + scope.netOverdraftLimit);
                        break;
                    case "reject":
                        location.path('/savingaccount/' + accountId + '/reject');
                        break;
                    case "withdrawnbyclient":
                        location.path('/savingaccount/' + accountId + '/withdrawnByApplicant');
                        break;
                    case "undoapproval":
                        location.path('/savingaccount/' + accountId + '/undoapproval');
                        break;
                    case "activate":
                        if(scope.savingaccountdetails.allowOverdraft){
                            scope.netOverDraftLimit();
                        }
                        location.path('/savingaccount/' + accountId + '/activate/'+ scope.netOverdraftLimit);
                        break;
                    case "deposit":
                        location.path('/savingaccount/' + accountId + '/deposit/' +  scope.amountToBePaid);
                        break;
                    case "withdraw":
                        location.path('/savingaccount/' + accountId + '/withdrawal');
                        break;
                    case "addcharge":
                        location.path('/savingaccounts/' + accountId + '/charges');
                        break;
                    case "calculateInterest":
                        resourceFactory.savingsResource.save({accountId: accountId, command: 'calculateInterest'}, {}, function (data) {
                            route.reload();
                        });
                        break;
                    case "postInterest":
                        resourceFactory.savingsResource.save({accountId: accountId, command: 'postInterest'}, {}, function (data) {
                            route.reload();
                        });
                        break;
                    case "postAccrual":
                        resourceFactory.savingsResource.save({accountId: accountId, command: 'postAccrual'}, {}, function (data) {
                            route.reload();
                        });
                        break;    
                    case "applyAnnualFees":
                        location.path('/savingaccountcharge/' + accountId + '/applyAnnualFees/' + scope.annualChargeId);
                        break;
                    case "transferFunds":
                        if (scope.savingaccountdetails.clientId) {
                            location.path('/accounttransfers/fromsavings/' + accountId);
                        }
                        break;
                    case "close":
                        location.path('/savingaccount/' + accountId + '/close');
                        break;
                    case "assignSavingsOfficer":
                        location.path('/assignsavingsofficer/' + accountId);
                        break;
                    case "unAssignSavingsOfficer":
                        location.path('/unassignsavingsofficer/' + accountId);
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
                    case "postInterestAsOn":
                        location.path('/savingaccount/' + accountId + '/postInterestAsOn');
                        break;
                    case "blockAccount":
                        openPopUpWindow('blockAccount.html','block');
                        break;
                    case "unblockAccount":
                        openPopUpWindow('unblockAccount.html','unblock');
                        break;
                    case "blockDebit":
                        openPopUpWindow('blockDebit.html','blockDebit');
                        break;
                    case "unblockDebit":
                        openPopUpWindow('unblockDebit.html','unblockDebit');
                        break;
                    case "blockCredit":
                        openPopUpWindow('blockCredit.html','blockCredit');
                        break;
                    case "unblockCredit":
                        openPopUpWindow('unblockCredit.html','unblockCredit');
                        break;
                    case "holdAmount":
                        location.path('/savingaccount/' + accountId + '/holdAmount');
                        break;
                    case "postAccrualAsOn":
                            location.path('/savingaccount/' + accountId + '/postAccrualAsOn');
                            break;
                    case "reactivate":
                        location.path('/savingaccount/' + accountId + '/reactivate');
                        break;

                }
            };

            function openPopUpWindow(templateUrl, command){
                scope.command = command;
                $modal.open({
                               templateUrl: templateUrl,
                               controller: PopUpActionController
                        });
            }

            var PopUpActionController = function ($scope, $modalInstance) {
                $scope.submitAction = function () {
                    resourceFactory.savingsResource.save({accountId: routeParams.id, command: scope.command}, this.formData, function (data) {
                        $modalInstance.close('submitAction');
                        route.reload();
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.getSavingAccountDetailsTemplateData = function(){
            resourceFactory.savingsResource.get({accountId: routeParams.id, limit: scope.limit, offset:scope.requestoffset, orderBy:'transactionDate', sortOrder:'DESC', associations: 'all', excludeSystemReversed: true}, function (data) {
                scope.savingaccountdetails = data;
                $rootScope.savingsAccount = data.savingsProductName;
                $rootScope.clientId=data.clientId;
                $rootScope.savingsaccountholderclientName=data.clientName;
                $rootScope.accountNumber = data.accountNo;
                $rootScope.groupId = data.groupId;
                $rootScope.groupName = data.groupName;
                scope.convertDateArrayToObject('date');
                if(scope.savingaccountdetails.groupId != undefined) {
                    resourceFactory.groupResource.get({groupId: scope.savingaccountdetails.groupId}, function (data) {
                        scope.groupLevel = data.groupLevel;
                    });
                }
                scope.showonhold = true;
                if(angular.isUndefined(data.onHoldFunds)){
                    scope.showonhold = false;
                }
                scope.isSavingsAmountOnHold = true;
                if(angular.isUndefined(data.savingsAmountOnHold)){
                	 scope.isSavingsAmountOnHold = false;
                }
                
                scope.staffData.staffId = data.staffId;
                scope.date.toDate = new Date();
                scope.date.fromDate = new Date(data.timeline.activatedOnDate);
                
                scope.status = data.status.value;
                if (scope.status == "Submitted and pending approval" || scope.status == "Active" || scope.status == "Approved") {
                    scope.choice = true;
                }
                scope.chargeAction = data.status.value == "Submitted and pending approval" ? true : false;
                scope.chargePayAction = data.status.value == "Active" ? true : false;
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
                            icon: "icon-pencil ",
                            taskPermissionName:"UPDATE_SAVINGSACCOUNT"
                        },
                        {
                            name: "button.approve",
                            icon: "icon-ok-sign",
                            taskPermissionName:"APPROVE_SAVINGSACCOUNT"
                        }
                    ],
                        options: [
                            {
                                name: "button.reject",
                                taskPermissionName:"REJECT_SAVINGSACCOUNT"
                            },
                            {
                                name: "button.withdrawnbyclient",
                                taskPermissionName:"WITHDRAW_SAVINGSACCOUNT"
                            },
                            {
                                name: "button.addcharge",
                                taskPermissionName:"CREATE_SAVINGSACCOUNTCHARGE"
                            }
                        ]
                    };
                }

                if (data.status.value == "Approved") {
                    scope.buttons = { singlebuttons: [
                        {
                            name: "button.undoapproval",
                            icon: "icon-undo",
                            taskPermissionName:"APPROVALUNDO_SAVINGSACCOUNT"
                        },
                        {
                            name: "button.activate",
                            icon: "icon-ok-sign",
                            taskPermissionName:"ACTIVATE_SAVINGSACCOUNT"
                        },
                        {
                            name: "button.addcharge",
                            icon: "icon-plus",
                            taskPermissionName:"CREATE_SAVINGSACCOUNTCHARGE"
                        }
                    ]
                    };
                }
                scope.showPostAccrual = (data.status.value == "Active" && data.accountingRuleType.isAccrualPeriodic==true);
                scope.showAccrualTransactionOption = (data.accountingRuleType.isAccrualPeriodic==true);
                if (data.status.value == "Active") {
                    scope.buttons = { singlebuttons: [
                        {
                            name: "button.postInterestAsOn",
                            icon: "icon-arrow-right",
                            taskPermissionName:"POSTINTERESTASON_SAVINGSACCOUNT"
                        },
                        {
                            name: "button.deposit",
                            icon: "icon-arrow-right",
                            taskPermissionName:"DEPOSIT_SAVINGSACCOUNT"
                        },
                        {
                            name: "button.withdraw",
                            icon: "icon-arrow-left",
                            taskPermissionName:"WITHDRAW_SAVINGSACCOUNT"
                        },
                        {
                            name: "button.calculateInterest",
                            icon: "icon-table",
                            taskPermissionName:"CALCULATEINTEREST_SAVINGSACCOUNT"
                        }
                    ],
                        options: [
                            {
                                name: "button.postInterest",
                                taskPermissionName:"POSTINTEREST_SAVINGSACCOUNT"
                            },
                            {
                                name: "button.addcharge",
                                taskPermissionName:"CREATE_SAVINGSACCOUNTCHARGE"
                            },
                            {
                                name: "button.close",
                                taskPermissionName:"CLOSE_SAVINGSACCOUNT"
                            }
                        ]

                    };
                    if(scope.showPostAccrual){
                        scope.buttons.options.push({
                            name: "button.postAccrual",
                            taskPermissionName:"POSTACCRUAL_SAVINGSACCOUNT"
                        });
                    }
                    if(data.status.value == "Active"){
                        if(data.subStatus.value == "None"){
                            scope.buttons.options.push({
                                name: "button.blockAccount",
                                taskPermissionName:"BLOCK_SAVINGSACCOUNT" 
                            });
                            scope.buttons.options.push({
                                name: "button.blockCredit",
                                taskPermissionName:"BLOCKCREDIT_SAVINGSACCOUNT" 
                            });
                            scope.buttons.options.push({
                                name: "button.blockDebit",
                                taskPermissionName:"BLOCKDEBIT_SAVINGSACCOUNT"  
                            });
                        } 
                        else if(data.subStatus.value == "Block"){
                            scope.buttons.options.push({
                                name: "button.unblockAccount",
                                taskPermissionName:"UNBLOCK_SAVINGSACCOUNT"  
                            });
                            scope.buttons.options.push({
                                name: "button.unblockCredit",
                                taskPermissionName:"UNBLOCKCREDIT_SAVINGSACCOUNT" 
                            });
                            scope.buttons.options.push({
                               name: "button.unblockDebit",
                               taskPermissionName:"UNBLOCKDEBIT_SAVINGSACCOUNT" 
                            });
                        }
                        else if(data.subStatus.value == "BlockCredit"){
                            scope.buttons.options.push({
                                name: "button.blockAccount",
                                taskPermissionName:"BLOCK_SAVINGSACCOUNT" 
                            });
                             scope.buttons.options.push({
                                name: "button.unblockCredit",
                                taskPermissionName:"UNBLOCKCREDIT_SAVINGSACCOUNT" 
                            });
                            scope.buttons.options.push({
                                name: "button.blockDebit",
                                taskPermissionName:"BLOCKDEBIT_SAVINGSACCOUNT"  
                            });
                        }
                        else if(data.subStatus.value == "BlockDebit"){
                            scope.buttons.options.push({
                                name: "button.blockAccount",
                                taskPermissionName:"BLOCK_SAVINGSACCOUNT" 
                            });
                            scope.buttons.options.push({
                                name: "button.blockCredit",
                                taskPermissionName:"BLOCKCREDIT_SAVINGSACCOUNT" 
                            });
                            scope.buttons.options.push({
                                name: "button.unblockDebit",
                                taskPermissionName:"UNBLOCKDEBIT_SAVINGSACCOUNT"  
                            });
                        }
                        scope.buttons.options.push({
                            name: "button.holdAmount",
                            taskPermissionName:"HOLDAMOUNT_SAVINGSACCOUNT" 
                        });
                    }

                    if (data.clientId) {
                        scope.buttons.options.push({
                            name: "button.transferFunds",
                            taskPermissionName:"CREATE_ACCOUNTTRANSFER"
                        });
                    }
                    if (data.charges) {
                        for (var i in scope.charges) {
                            if (scope.charges[i].name == "Annual fee - INR") {
                                scope.buttons.options.push({
                                    name: "button.applyAnnualFees",
                                    taskPermissionName:"APPLYANNUALFEE_SAVINGSACCOUNT"
                                });
                                scope.annualChargeId = scope.charges[i].id;
                            }
                        }
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
                }

                if(data.status.value == "Closed"){
                    scope.buttons = { singlebuttons: [
                        {
                            name: "button.reactivate",
                            icon: "icon-undo",
                            taskPermissionName:"REACTIVATE_SAVINGSACCOUNT"
                        },
                    ]
                }
            }

                if (data.annualFee) {
                    var annualdueDate = [];
                    annualdueDate = data.annualFee.feeOnMonthDay;
                    annualdueDate.push(new Date().getFullYear());
                    scope.annualdueDate = new Date(annualdueDate);
                };
                scope.convertDateArrayToObject('date');
                resourceFactory.DataTablesResource.getAllDataTables({apptable: 'm_savings_account', associatedEntityId: scope.savingaccountdetails.savingsProductId, isFetchBasicData : false}, function (data) {
                    scope.datatables = data;
                });
            });
            }
            scope.getSavingAccountDetailsTemplateData();

            scope.amountTobePaid = function(){
               if( scope.savingaccountdetails.summary && scope.savingaccountdetails.summary.accountBalance < 0 ){
                   var amount =  (scope.savingaccountdetails.summary.accountBalance + scope.savingaccountdetails.overdraftLimit);
                   if( amount < 0) {
                       scope.amountToBePaid = -amount;
                       return  amount;
                   }
                   return 0;
               }
                   return 0;
            };
            /*// Saving notes not yet implemented
            resourceFactory.savingsResource.getAllNotes({accountId: routeParams.id,resourceType:'notes'}, function (data) {
                scope.savingNotes = data;
            });

            scope.saveNote = function () {
                resourceFactory.savingsResource.save({accountId: routeParams.id, resourceType: 'notes'}, this.formData, function (data) {
                    var today = new Date();
                    temp = { id: data.resourceId, note: scope.formData.note, createdByUsername: "test", createdOn: today };
                    scope.savingNotes.push(temp);
                    scope.formData.note = "";
                    scope.predicate = '-id';
                });
            };*/

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

            scope.export = function () {
                scope.report = true;
                scope.printbtn = false;
                scope.viewReport = false;
                scope.viewSavingReport = true;
                scope.viewTransactionReport = false;
            };

            scope.viewJournalEntries = function(){
                location.path("/searchtransaction/").search({savingsId: scope.savingaccountdetails.id});
            };

            scope.viewSavingsTransactionJournalEntries = function(transactionId){
                var transactionId = "S" + transactionId;
                if($rootScope.clientId != undefined && $rootScope.clientId != null && $rootScope.clientId != "" ){
                    location.path('/viewtransactions/' + transactionId).search({productName: $rootScope.savingsAccount,savingsId:routeParams.id,clientId: $rootScope.clientId,
                        accountNo: $rootScope.accountNumber,clientName: $rootScope.savingsaccountholderclientName,isTransactionReferenceNumber:true});
                }else if($rootScope.groupId != undefined){
                    location.path('/viewtransactions/' + transactionId).search({productName: $rootScope.savingsAccount,savingsId:routeParams.id,accountNo: $rootScope.accountNumber,
                        groupId :$rootScope.groupId,groupName :$rootScope.groupName,isTransactionReferenceNumber:true});

                }

            };

            scope.viewDataTable = function (registeredTableName,data){
                if (scope.datatabledetails.isMultirow) {
                    location.path("/viewdatatableentry/"+registeredTableName+"/"+scope.savingaccountdetails.id+"/"+data.row[0].value);
                }else{
                    location.path("/viewsingledatatableentry/"+registeredTableName+"/"+scope.savingaccountdetails.id);
                }
            };

            scope.viewSavingDetails = function () {

                scope.report = false;
                scope.hidePentahoReport = true;
                scope.viewReport = false;

            };

            scope.viewPrintDetails = function () {
                //scope.printbtn = true;
                scope.report = true;
                scope.viewTransactionReport = false;
                scope.viewReport = true;
                scope.hidePentahoReport = true;
                scope.formData.outputType = 'PDF';
                scope.baseURL = $rootScope.hostUrl + API_VERSION + "/runreports/" + encodeURIComponent("Client Saving Transactions");
                scope.baseURL += "?output-type=" + encodeURIComponent(scope.formData.outputType) +"&locale="+scope.optlang.code;

                var reportParams = "";
                scope.startDate = dateFilter(scope.date.fromDate, 'yyyy-MM-dd');
                scope.endDate = dateFilter(scope.date.toDate, 'yyyy-MM-dd');
                var paramName = "R_startDate";
                reportParams += encodeURIComponent(paramName) + "=" + encodeURIComponent(scope.startDate)+ "&";
                paramName = "R_endDate";
                reportParams += encodeURIComponent(paramName) + "=" + encodeURIComponent(scope.endDate)+ "&";
                paramName = "R_savingsAccountId";
                reportParams += encodeURIComponent(paramName) + "=" + encodeURIComponent(scope.savingaccountdetails.accountNo);
                if (reportParams > "") {
                    scope.baseURL += "&" + reportParams;
                }

                // allow untrusted urls for iframe http://docs.angularjs.org/error/$sce/insecurl
                baseURL = $sce.trustAsResourceUrl(scope.baseURL);
                
                http.get(baseURL, {responseType: 'arraybuffer'}).
                    success(function (data, status, headers, config) {
                        var contentType = headers('Content-Type');
                        var file = new Blob([data], {type: contentType});
                        var fileContent = URL.createObjectURL(file);

                        scope.viewReportDetails = $sce.trustAsResourceUrl(fileContent);
                    });
            };

            scope.viewSavingsTransactionReceipts = function (transactionId) {
                scope.report = true;
                scope.viewTransactionReport = true;
                scope.viewSavingReport = true;
                scope.printbtn = false;
                scope.viewReport = true;
                scope.hidePentahoReport = true;
                scope.formData.outputType = 'PDF';
                scope.baseURL = $rootScope.hostUrl + API_VERSION + "/runreports/" + encodeURIComponent("Savings Transaction Receipt");
                scope.baseURL += "?output-type=" + encodeURIComponent(scope.formData.outputType) +"&locale="+scope.optlang.code;

                var reportParams = "";
                var paramName = "R_transactionId";
                reportParams += encodeURIComponent(paramName) + "=" + encodeURIComponent(transactionId);
                if (reportParams > "") {
                    scope.baseURL += "&" + reportParams;
                }
                // allow untrusted urls for iframe http://docs.angularjs.org/error/$sce/insecurl
                scope.viewReportDetails = $sce.trustAsResourceUrl(scope.baseURL);

            };
            scope.printReport = function () {
                window.print();
                window.close();
            };

            scope.deleteAll = function (apptableName, entityId) {
                resourceFactory.DataTablesResource.delete({datatablename: apptableName, entityId: entityId, genericResultSet: 'true'}, {}, function (data) {
                    route.reload();
                });
            };

            scope.modifyTransaction = function (accountId, transactionId) {
                location.path('/savingaccount/' + accountId + '/modifytransaction?transactionId=' + transactionId);
            };

            /***
             * we are using orderBy(https://docs.angularjs.org/api/ng/filter/orderBy) filter to sort fields in ui
             * api returns dates in array format[yyyy, mm, dd], converting the array of dates to date object
             * @param dateFieldName
             */
            scope.convertDateArrayToObject = function(dateFieldName){
                for(var i in scope.savingaccountdetails.transactions){
                    scope.savingaccountdetails.transactions[i][dateFieldName] = new Date(scope.savingaccountdetails.transactions[i].date);
                }
            };
            
            scope.transactionSort = {
                column: 'date',
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
                if(scope.status == 'Active' || scope.status == 'Closed' || scope.status == 'Transfer in progress' ||
                scope.status == 'Transfer on hold' || scope.status == 'Premature Closed' || scope.status == 'Matured'){
                    return true;
                }
                return false;
            };

            scope.netOverDraftLimit = function(){
                if(scope.charges != undefined){
                    var overdraftLimit = scope.savingaccountdetails.overdraftLimit;
                    var totalcharges = 0;
                    for(var b =0 ; b < scope.charges.length ; b++) {
                        if(scope.charges[b].chargeTimeType.value == 'Savings Activation')
                        totalcharges = totalcharges + scope.charges[b].amount;
                    }    
                    scope.netOverdraftLimit = overdraftLimit - totalcharges;                     
                }
            };

            scope.hideId = function(row){
                return  (row.columnName === 'id');
            };

            scope.getSpecificTransactionType = function(transaction){
                if(transaction.isAccountTransfer){
                    return transaction.transactionType.value + " (Account Transfer)";
                }
                return transaction.transactionType.value;
            }

            scope.previousSavingsTransactionsDataRequest= function(){
                if(scope.requestoffset != 0){
                    scope.requestoffset = scope.requestoffset - scope.limit;
                    if(scope.requestoffset <= 0){
                        scope.requestoffset = 0;
                    }
                    scope.getSavingAccountDetailsTemplateData();
                }
            } 

            scope.nextSavingsTransactionsDataRequest= function(){
                if(scope.savingaccountdetails.transactions.length == scope.limit){
                    scope.requestoffset = scope.requestoffset + scope.limit;
                    scope.getSavingAccountDetailsTemplateData();
                }
            } 

            scope.getSavingsDocuments = function () {
                scope.savingdocuments = {};
                resourceFactory.savingsDocumentResource.getSavingsDocuments({ savingsId: routeParams.id }, function (data) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].id) {
                            var savingdocs = {};
                            savingdocs = API_VERSION + '/savings/' + data[i].parentEntityId + '/documents/' + data[i].id + '/attachment';
                            data[i].docUrl = savingdocs;
                        }
                        if (data[i].tagValue) {
                            scope.pushDocumentToTag(data[i], data[i].tagValue);
                        } else {
                            scope.pushDocumentToTag(data[i], 'uploadedDocuments');
                        }
                    }
                });
            };

            scope.pushDocumentToTag = function (document, tagValue) {
                if (scope.savingdocuments.hasOwnProperty(tagValue)) {
                    scope.savingdocuments[tagValue].push(document);
                } else {
                    scope.savingdocuments[tagValue] = [];
                    scope.savingdocuments[tagValue].push(document);
                }
            }

            scope.generateDocument = function (document) {
                resourceFactory.documentsGenerateResource.generate({ entityType: 'savings', entityId: routeParams.id, identifier: document.reportIdentifier }, function (data) {
                    document.id = data.resourceId;
                    var savingdocs = {};
                    savingdocs = API_VERSION + '/' + document.parentEntityType + '/' + document.parentEntityId + '/documents/' + document.id + '/attachment';
                    document.docUrl = savingdocs;
                })
            };

            scope.reGenerateDocument = function (document) {
                resourceFactory.documentsGenerateResource.reGenerate({ entityType: 'savings', entityId: routeParams.id, identifier: document.id }, function (data) {
                    document.id = data.resourceId;
                    var savingdocs = {};
                    savingdocs = API_VERSION + '/' + document.parentEntityType + '/' + document.parentEntityId + '/documents/' + document.id + '/attachment';
                    document.docUrl = savingdocs;
                })
            };

            scope.download = function (file) {
                var url = $rootScope.hostUrl + file.docUrl;
                var fileType = file.fileName.substr(file.fileName.lastIndexOf('.') + 1);
                CommonUtilService.downloadFile(url, fileType, file.fileName);
            }


            scope.deleteDocument = function (document, index, tagValue) {
                resourceFactory.savingsDocumentResource.delete({ savingsId: scope.savingaccountdetails.id, documentId: document.id }, '', function (data) {
                    if (document.reportIdentifier) {
                        delete document.id;
                    } else {
                        scope.savingdocuments[tagValue].splice(index, 1);
                    }
                });
            };


        }
    });
    mifosX.ng.application.controller('ViewSavingDetailsController', ['$scope', '$routeParams', 'ResourceFactory', '$location','$modal', '$route', 'dateFilter', '$sce', '$rootScope', 'API_VERSION', '$http','CommonUtilService', mifosX.controllers.ViewSavingDetailsController]).run(function ($log) {
        $log.info("ViewSavingDetailsController initialized");
    });
}(mifosX.controllers || {}));
