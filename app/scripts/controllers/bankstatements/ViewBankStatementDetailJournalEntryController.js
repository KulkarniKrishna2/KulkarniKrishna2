(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewBankStatementDetailJournalEntryController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            scope.bankStatementDetails  = [];
            scope.bankStatementId = routeParams.bankStatementId;
            scope.isJournalEntryCreated = true;
            scope.bankName = "";
            scope.bankStatementName = "";
            scope.restrictDate = new Date();
            scope.glAccounts = [];
            scope.changes = [];
            scope.offices = [];
            scope.getBankStatementDetails = function(){
                resourceFactory.bankStatementDetailsResource.getBankStatementDetails({ bankStatementId : routeParams.bankStatementId, command:'journalentry'},function (data) {
                    scope.bankStatementDetails = data.bankStatementDetails;
                    scope.bankName = data.bankName;
                    scope.bankStatementName = data.bankStatementName ;
                    scope.isJournalEntriesCreated(data);
                });
            };


            scope.editBankDetails = function(index){
                    if(scope.bankStatementDetails[index] && scope.bankStatementDetails[index].id){
                        if(scope.offices == undefined || scope.offices.length == 0){
                            resourceFactory.officeResource.getAllOffices(function (data) {
                                scope.offices = data;
                            });
                        }

                        scope.bankStatementDetails[index].editable = true;
                        scope.bankStatementDetails[index].showUpdateButton = true;
                        scope.bankStatementDetails[index].showCanceleButton = true;
                        scope.bankStatementDetails[index].updateCancelled = false;
                        scope.formData = [];
                        scope.formData.amount = scope.bankStatementDetails[index].amount;
                        scope.formData.officeId = scope.bankStatementDetails[index].branch;
                        scope.formData.transactionDate = new Date(dateFilter(scope.bankStatementDetails[index].transactionDate,scope.df));
                        scope.accountingTypes = [{name:"CREDIT", id :1}, {name:"DEBIT", id: 2}];
                        var glCodeAccount = scope.bankStatementDetails[index].glCode;
                        if(scope.bankStatementDetails[index].accountingType.toString() == 'CREDIT'){
                            scope.formData.accountingTypeName = 1;
                        }else{
                            scope.formData.accountingTypeName = 2;
                        }

                        resourceFactory.accountCoaResource.getAllAccountCoas({
                            manualEntriesAllowed: true,
                            usage: 1,
                            disabled: false,
                            limit :1000
                        }, function (glAccountData) {
                            scope.glAccounts = glAccountData;
                                for(var a = 0; a < glAccountData.length; a++ ){
                                    if(glAccountData[a].glCode == glCodeAccount ){
                                     scope.formData.glCode = glAccountData[a].id;
                                     break;
                                }
                             }
                        });
                    }
            };

            scope.updateBankStatementDetail = function(bankStatementDetailId){
                scope.bankDetailsData = {};
                scope.bankDetailsData.locale = scope.optlang.code;
                scope.bankDetailsData.dateFormat = scope.df;
                var reqDate = dateFilter(scope.formData.transactionDate, scope.df);
                for(var x = 0 ; x < scope.glAccounts.length; x++){
                    if(scope.glAccounts[x].id == scope.formData.glCode){
                        scope.bankDetailsData.glCode = scope.glAccounts[x].glCode;
                    }
                }
                scope.bankDetailsData.transactionDate = reqDate;
                if(scope.formData.accountingTypeName == 1){
                    scope.bankDetailsData.accountingType = 'CREDIT';
                }else{
                    scope.bankDetailsData.accountingType = 'DEBIT';
                }
                scope.bankDetailsData.officeId =  scope.formData.officeId;
                if(scope.formData.amount) {
                    scope.bankDetailsData.amount = scope.formData.amount;
                }
                resourceFactory.bankStatementDetailsResource.update({'bankStatementId':routeParams.bankStatementId, 'bankStatementDetailId':bankStatementDetailId},
                    scope.bankDetailsData, function (data) {
                    if(!_.isUndefined(data.resourceId) && data.changes){

                        for( var i= 0;i < scope.bankStatementDetails.length; i++){
                            if(scope.bankStatementDetails[i].id == data.resourceId){
                                if(!_.isUndefined(data.changes.transactionDate)){
                                    scope.bankStatementDetails[i].transactionDate = data.changes.transactionDate,scope.df;
                                }
                                if(!_.isUndefined(data.changes.amount)){
                                    scope.bankStatementDetails[i].amount = data.changes.amount;
                                }
                                if(!_.isUndefined(data.changes.glCode)){
                                    scope.bankStatementDetails[i].glCode = data.changes.glCode;
                                }
                                if(!_.isUndefined(data.changes.officeId)){
                                    for(var y = 0; y < scope.offices.length; y++){
                                        if(scope.offices[y].id == data.changes.officeId){
                                            scope.bankStatementDetails[i].branchName =  scope.offices[y].name;
                                            break;
                                        }
                                    }
                                }
                                if(!_.isUndefined(data.changes.accountingType)){
                                    scope.bankStatementDetails[i].accountingType = data.changes.accountingType;
                                }
                                if(!_.isUndefined(data.changes.glAccount)){
                                    scope.bankStatementDetails[i].glAccount = data.changes.glAccount;
                                }
                                scope.bankStatementDetails[i].editable = false;
                                scope.bankStatementDetails[i].showUpdateButton = false;
                                scope.bankStatementDetails[i].showCanceleButton = false;
                                scope.bankStatementDetails[i].updateCancelled = true;
                            }
                        }
                    }
                });
            };

            scope.cancel = function(index){
                    if(scope.bankStatementDetails[index] && scope.bankStatementDetails[index].id){
                        scope.bankStatementDetails[index].editable = false;
                        scope.bankStatementDetails[index].showUpdateButton = false;
                        scope.bankStatementDetails[index].showCanceleButton = false;
                        scope.bankStatementDetails[index].updateCancelled = true;
                    }
            }


            scope.getBankStatementDetails();

            scope.submit = function() {
                scope.formData = {};
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;
                resourceFactory.bankNonPortfolioResource.createJournalEntries({ bankStatementId : routeParams.bankStatementId},scope.formData,function (data) {
                    scope.getBankStatementDetails();
                    scope.isJournalEntriesCreated(scope.bankStatementDetails);
                });
            };

            scope.isJournalEntriesCreated = function(data){
                scope.isJournalEntryCreated = true;
                var count = 0;
                for(var i=0;i<data.length;i++){
                    if(data[i].hasOwnProperty("transactionId")){
                        count++;
                    }
                }
                scope.isJournalEntryCreated = (count==data.length);
            };

            scope.routeTo = function (id) {
                location.path('/viewtransactions/' + id).search({'id':routeParams.bankStatementId,'isTransactionReferenceNumber' : true});
            };
        }
    });
    mifosX.ng.application.controller('ViewBankStatementDetailJournalEntryController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.ViewBankStatementDetailJournalEntryController]).run(function ($log) {
        $log.info("ViewBankStatementDetailJournalEntryController initialized");
    });
}(mifosX.controllers || {}));