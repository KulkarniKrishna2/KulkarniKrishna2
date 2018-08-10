(function (module) {
    mifosX.controllers = _.extend(module, {
        LoanRectificationController: function (scope, resourceFactory, location, routeParams, dateFilter) {
           
            var params = {fromAccountId: routeParams.loanId};
            params.fromAccountType = 1;
            params.toAccountType = 1;
            params.transferAmount = routeParams.transferAmount;
            scope.toOffices = [];
            scope.toClients = [];
            scope.toAccounts = [];
            scope.toOwnAccounts = [];
            scope.displayAccountType = params.fromAccountType;

            scope.back = function () {
                window.history.back();
            };

            scope.formData = {fromAccountId: params.fromAccountId, fromAccountType: params.fromAccountType, toAccountType: params.toAccountType,transferAmount:params.transferAmount};
            resourceFactory.accountTransfersTemplateResource.get(params, function (data) {
                scope.transfer = data;
                scope.toOffices = data.toOfficeOptions;
            });

            scope.changeClient = function (client) {
                scope.formData.toClientId = client.id;
                scope.formData.toAccountId = undefined;
                scope.changeEvent();
            };


            scope.changeoffice = function() {
                scope.descopeElements();
                scope.changeEvent();
            }

            scope.changeEvent = function () {

                var params = scope.formData;
                delete params.note;
                resourceFactory.accountTransfersTemplateResource.get(params, function (data) {
                    scope.transfer = data;
                    scope.toOffices = data.toOfficeOptions;
                    scope.toClients = data.toClientOptions;
                    scope.toAccounts = data.toAccountOptions;
                });
            };

            scope.descopeElements = function(){
                scope.formData.toClientData = undefined;
                scope.toAccounts = undefined;
                scope.formData.toClientId = undefined;
                scope.formData.toAccountId = undefined;
                scope.formData.transferDescription = undefined;
            };

            scope.changeEventType = function(){
                    scope.formData.toAccounts = undefined;
                    scope.formData.toAccountId = undefined;
                    scope.changeEvent();
            };

            scope.submit = function () {
                var requestFormData = {};
                requestFormData.locale = scope.optlang.code;
                requestFormData.dateFormat = scope.df;
                requestFormData.toAccountId = scope.formData.toAccountId;
                requestFormData.note =  scope.formData.note;

                var paramsdata = {loanId: routeParams.loanId,transactionId: routeParams.transactionId};

                resourceFactory.loanRectifyTrxnsResource.save(paramsdata, requestFormData, function (data) {                            
                    location.path('/viewloanaccount/' + routeParams.loanId);                                
                });
            };
        }
    });
    mifosX.ng.application.controller('LoanRectificationController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.LoanRectificationController]).run(function ($log) {
        $log.info("LoanRectificationController initialized");
    });
}(mifosX.controllers || {}));