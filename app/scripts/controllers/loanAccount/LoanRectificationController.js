(function (module) {
    mifosX.controllers = _.extend(module, {
        LoanRectificationController: function (scope, resourceFactory, location, routeParams, dateFilter) {
            scope.uiData = {};
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

            resourceFactory.loanTrxnsResource.get({loanId: routeParams.loanId, transactionId: routeParams.transactionId}, function (data) {
                var loanTrxnData = data;
                var loanTrxnDate = dateFilter(loanTrxnData.date, scope.df);
                scope.formData.transactionDate = new Date(loanTrxnDate);
                scope.uiData.minRestrictDate = new Date(loanTrxnDate);
                scope.uiData.maxRestrictDate = new Date();
                scope.formData.valueDate = scope.uiData.maxRestrictDate;
            });

            scope.changeClient = function (client) {
                var fields = client.split(" ");
                scope.formData.toClientId = fields[0];
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
                if(_.isUndefined(routeParams.transactionId)){
                    return;
                }
                var requestFormData = {};
                requestFormData.transactionDate = dateFilter(scope.formData.transactionDate, scope.df);
                requestFormData.valueDate =  dateFilter(scope.formData.valueDate, scope.df);
                requestFormData.toAccountId = scope.formData.toAccountId;
                requestFormData.note =  scope.formData.note;
                requestFormData.locale = scope.optlang.code;
                requestFormData.dateFormat = scope.df;

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