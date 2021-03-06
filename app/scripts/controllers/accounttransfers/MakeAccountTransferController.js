(function (module) {
    mifosX.controllers = _.extend(module, {
        MakeAccountTransferController: function (scope, resourceFactory, location, routeParams, dateFilter) {
            scope.restrictDate = new Date();
            scope.transferDate = new Date();
            var params = {fromAccountId: routeParams.accountId};
            var path =location.$$path;
            scope.isRefundByTransfer = false;
            var accountType = routeParams.accountType || '';
            if (accountType == 'fromsavings') params.fromAccountType = 2;
            else if (accountType == 'fromloans') params.fromAccountType = 1;
            else if (path.includes('refundbytransfer')){
                scope.isRefundByTransfer = true;
                params.fromAccountType = 1;
            }
            else params.fromAccountType = 0;

            scope.toOffices = [];
            scope.toClients = [];
            scope.toAccountTypes = [];
            scope.toAccounts = [];
            scope.toOwnAccounts = [];
            
            scope.loansEnabled = false;
            scope.enableOwnAccountTransfer = false;
            scope.enableOtherAccountTransfer = false;
            scope.displayAccountType = params.fromAccountType;
            scope.refundAmount = 0;
            scope.formData = {fromAccountId: params.fromAccountId, fromAccountType: params.fromAccountType};

            scope.back = function () {
                window.history.back();
            };

            if(scope.isRefundByTransfer){
                resourceFactory.loanTrxnsTemplateResource.get({loanId: params.fromAccountId, command: 'refundFromUpfrontInterest'}, function (data) {
                    scope.refundAmount = data.amount || 0;
                });
            }

            resourceFactory.accountTransfersTemplateResource.get(params, function (data) {
                scope.transfer = data;
                scope.toOffices = data.toOfficeOptions;
                scope.toAccountTypes = data.toAccountTypeOptions;
                scope.toTransferActionTypeOptions = data.toTransferActionTypeOptions;
                scope.fromTransferActionTypeOptions = data.fromTransferActionTypeOptions;
                scope.formData.transferAmount  = scope.isRefundByTransfer ? scope.refundAmount : data.transferAmount;
                scope.formData.transferDate=scope.transferDate;

            });

            scope.changeClient = function (client) {
                scope.formData.toClientId = client.id;
                scope.formData.toAccountType = undefined;
                scope.formData.toAccountId = undefined;
                scope.changeEvent();
            };


            scope.setChoice = function () {
                if(scope.account == "ownAccount"){
                    var params = scope.formData;
                    params.transferType = 1;

                    delete params.transferAmount;
                    delete params.transferDate;
                    
                    resourceFactory.accountTransfersTemplateResource.get(params, function (data) {
                        delete params.transferType;
                        scope.transferToOwnaccounts = data;
                        scope.formData.transferDate = new Date();
                     });
          
                    scope.enableOwnAccountTransfer = true;
                    scope.enableOtherAccountTransfer = false;
                }
                
                else{
                    scope.enableOwnAccountTransfer = false;
                    scope.enableOtherAccountTransfer = true;
                    scope.loansEnabled = false;
                }
                scope.descopeElements();
                scope.formData.toOfficeId = undefined;
            };

            scope.transferThisAmount = function(value){
                scope.formData.transferAmount = value;

            };

            scope.getAccounts = function(){
                if(scope.formData.toAccountType == 1){
                    scope.toOwnAccounts = scope.transferToOwnaccounts.toLoanAccountOptions;
                    scope.loansEnabled = true; 
                    scope.nextEMIAmount = undefined;
                    scope.totalOverDueAmount = undefined;
                    scope.overdueWithNextEMIAmount = undefined;
                    scope.totalOutstandingAmount = undefined;
                    scope.nextEMIDate = undefined;
                }
                else{
                    scope.toOwnAccounts = scope.transferToOwnaccounts.toSavingAccountOptions;
                    scope.loansEnabled = false; 
                }
            }

            scope.changeoffice = function() {
                scope.descopeElements();
                scope.toAccountTypes = undefined;
                scope.changeEvent();
            }

            scope.changeEvent = function () {

                var params = scope.formData;
                if(!scope.isRefundByTransfer){
                    delete params.transferAmount;
                }
                delete params.transferDescription;

                if(!scope.loansEnabled){
                    delete params.transferDate;
                    scope.formData.toAccountTransferActionType = undefined;
                    scope.formData.fromAccountTransferActionType = undefined;
                    resourceFactory.accountTransfersTemplateResource.get(params, function (data) {
                        scope.transfer = data;
                        scope.toOffices = data.toOfficeOptions;
                        scope.toAccountTypes = data.toAccountTypeOptions;
                        scope.toClients = data.toClientOptions;
                        scope.toAccounts = data.toAccountOptions;
                        scope.formData.transferAmount  = scope.isRefundByTransfer ? scope.refundAmount : data.transferAmount;
                        scope.formData.transferDate = new Date();
                    });
                } else if(!scope.isRefundByTransfer){
                    resourceFactory.loanTrxnsTemplateResource.get({loanId: scope.formData.toAccountId, command: 'currentstatus'}, function (data) {
                        scope.currentstatus = data;
                        scope.nextEMIAmount = scope.currentstatus.fixedEmiAmount;
                        scope.nextEMIDate= scope.currentstatus.date;
                        scope.totalOutstandingAmount = scope.currentstatus.outstandingLoanBalance;
                        scope.totalOverDueAmount=scope.currentstatus.loanOverdueData.totalOverDue;
                        scope.overdueWithNextEMIAmount = scope.currentstatus.loanOverdueData.overdueWithNextInstallment;     
                    });
                }
            };

            scope.descopeElements = function(){
                scope.formData.toClientData = undefined;
                scope.toAccounts = undefined;
                scope.formData.toClientId = undefined;
                scope.toOwnAccounts = undefined;
                scope.formData.toAccountType = undefined;
                scope.formData.toAccountId = undefined;
                scope.formData.transferAmount  = scope.isRefundByTransfer ? scope.refundAmount : undefined;
                scope.formData.transferDescription = undefined;
                scope.formData.toAccountTransferActionType = undefined;
                scope.formData.fromAccountTransferActionType = undefined;
            };

            scope.changeEventType = function(){
                    scope.formData.toAccounts = undefined;
                    scope.formData.toAccountId = undefined;
                    scope.changeEvent();
            };

            scope.submit = function () {
                var requestFormData = {};
                angular.copy(this.formData, requestFormData);
                delete requestFormData.toClientData;
                requestFormData.locale = scope.optlang.code;
                requestFormData.dateFormat = scope.df;
                if (requestFormData.transferDate) requestFormData.transferDate = dateFilter(requestFormData.transferDate, scope.df);
                requestFormData.fromClientId = scope.transfer.fromClient.id;
                requestFormData.fromOfficeId = scope.transfer.fromClient.officeId;
                 
                if(scope.account == "ownAccount"){
                    requestFormData.toOfficeId = requestFormData.fromOfficeId;
                    requestFormData.toClientId = requestFormData.fromClientId;
                }    
               
                resourceFactory.accountTransferResource.save(requestFormData, function (data) {
                    if (params.fromAccountType == 1) {
                        location.path('/viewloanaccount/' + params.fromAccountId);
                    } else if (params.fromAccountType == 2) {
                        location.path('/viewsavingaccount/' + params.fromAccountId);
                    }
                });
            };
        }
    });
    mifosX.ng.application.controller('MakeAccountTransferController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.MakeAccountTransferController]).run(function ($log) {
        $log.info("MakeAccountTransferController initialized");
    });
}(mifosX.controllers || {}));