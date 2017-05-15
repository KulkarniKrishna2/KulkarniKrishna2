(function (module) {
    mifosX.controllers = _.extend(module, {
        MakeAccountTransferController: function (scope, resourceFactory, location, routeParams, dateFilter) {
            scope.restrictDate = new Date();
            scope.transferDate = new Date();
            var params = {fromAccountId: routeParams.accountId};
            var accountType = routeParams.accountType || '';
            if (accountType == 'fromsavings') params.fromAccountType = 2;
            else if (accountType == 'fromloans') params.fromAccountType = 1;
            else params.fromAccountType = 0;

            scope.toOffices = [];
            scope.toClients = [];
            scope.toAccountTypes = [];
            scope.toAccounts = [];
            scope.toOwnAccounts = [];

            scope.loansEnabled = false;
            scope.enableOwnAccountTransfer = false;
            scope.enableOtherAccountTransfer = false;

            scope.back = function () {
                window.history.back();
            };

            scope.formData = {fromAccountId: params.fromAccountId, fromAccountType: params.fromAccountType};
            resourceFactory.accountTransfersTemplateResource.get(params, function (data) {
                scope.transfer = data;
                scope.toOffices = data.toOfficeOptions;
                scope.toAccountTypes = data.toAccountTypeOptions;
                scope.formData.transferAmount = data.transferAmount;
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
                delete params.transferAmount;
                delete params.transferDescription;

                if(!scope.loansEnabled){
                    delete params.transferDate;

                resourceFactory.accountTransfersTemplateResource.get(params, function (data) {
                    scope.transfer = data;
                    scope.toOffices = data.toOfficeOptions;
                    scope.toAccountTypes = data.toAccountTypeOptions;
                    scope.toClients = data.toClientOptions;
                    scope.toAccounts = data.toAccountOptions;
                    scope.formData.transferAmount = data.transferAmount;
                    scope.formData.transferDate = new Date();
                });
            }

                if(scope.loansEnabled){        
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
                scope.formData.transferAmount = undefined;
                scope.formData.transferDescription = undefined;
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
                    requestFormData.toClientId = requestFormData.fromOfficeId;
                }    
               
                resourceFactory.accountTransferResource.save(requestFormData, function (data) {
                    if (params.fromAccountType == 1) {
                        location.path('/viewloanaccount/' + data.loanId);
                    } else if (params.fromAccountType == 2) {
                        location.path('/viewsavingaccount/' + data.savingsId);
                    }
                });
            };
        }
    });
    mifosX.ng.application.controller('MakeAccountTransferController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.MakeAccountTransferController]).run(function ($log) {
        $log.info("MakeAccountTransferController initialized");
    });
}(mifosX.controllers || {}));