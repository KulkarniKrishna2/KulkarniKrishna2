(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewTransactionTypeController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.transactionTypeMappings = {}
            scope.display = false;
            resourceFactory.transactionTypeMappingResource.getOne({ mappingId: routeParams.mappingId }, function (data) {
                scope.transactionTypeMapping = data;
                if (data.productType && data.productData) {
                    scope.display = true;
                }

            });

            scope.edit = function (id) {
                location.path('/transactiontypemapping/edittransactiontype/' + id);
            }

        }
    });
    mifosX.ng.application.controller('ViewTransactionTypeController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.ViewTransactionTypeController]).run(function ($log) {
        $log.info("ViewTransactionTypeController initialized");
    });
}(mifosX.controllers || {}));
