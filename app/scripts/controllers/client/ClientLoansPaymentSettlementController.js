(function (module) {
    mifosX.controllers = _.extend(module, {
        ClientLoansPaymentSettlementController: function (scope, routeParams, resourceFactory, location) {
            scope.clientId = routeParams.clientId;

            scope.formData = {};

            resourceFactory.paymentTypeResource.getAll(function (data) {
                scope.paymentTypes = data;
            });

            scope.submit = function () {
                scope.formData.locale = scope.optlang.code;
                resourceFactory.clientLoansPaymentSettlementResource.paymentSettlement({ 'clientId': scope.clientId }, scope.formData, function () {
                    location.path('/viewclient/' + scope.clientId);
                });
            };

        }
    });
    mifosX.ng.application.controller('ClientLoansPaymentSettlementController', ['$scope', '$routeParams', 'ResourceFactory', '$location', mifosX.controllers.ClientLoansPaymentSettlementController]).run(function ($log) {
        $log.info("ClientLoansPaymentSettlementController initialized");
    });
}(mifosX.controllers || {}));