(function (module) {
    mifosX.controllers = _.extend(module, {
        ClientGuaranteeController: function (scope, routeParams, resourceFactory, location) {

            scope.clientId = routeParams.clientId;

            scope.routeToLoan = function (id) {
                location.path('/viewloanaccount/' + id);
            };

            resourceFactory.runReportsResource.get({reportSource: 'CLIENTGUARANTEE', genericResultSet: 'false', R_clientId: scope.clientId}, function (data) {
                scope.loans = data;
            });
        }
    });
    mifosX.ng.application.controller('ClientGuaranteeController', ['$scope', '$routeParams', 'ResourceFactory', '$location', mifosX.controllers.ClientGuaranteeController]).run(function ($log) {
        $log.info("ClientGuaranteeController initialized");
    });
}(mifosX.controllers || {}));