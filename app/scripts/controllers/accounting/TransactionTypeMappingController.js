(function (module) {
    mifosX.controllers = _.extend(module, {
        TransactionTypeMappingController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.transactionTypeMappings = []
            resourceFactory.transactionTypeMappingResource.getAll(function (data) {
                scope.transactionTypeMappings = data;
            });
            scope.routeTo = function (id) {
                location.path('/transactiontypemapping/viewtransactiontype/' + id);
            };
        }
    });
    mifosX.ng.application.controller('TransactionTypeMappingController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.TransactionTypeMappingController]).run(function ($log) {
        $log.info("TransactionTypeMappingController initialized");
    });
}(mifosX.controllers || {}));
