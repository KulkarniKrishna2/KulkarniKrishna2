(function (module) {
    mifosX.controllers = _.extend(module, {
        AccountingStateProductMappingController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal, route) {

            resourceFactory.AdvancedAccountingProductMapping.query(function (data) {
                scope.accStateToProductMappings = data;
            });
            scope.deleteMapping = function (mappingId) {
                resourceFactory.AdvancedAccountingProductMapping.delete({ mappingId: mappingId }, function (data) {
                    route.reload();
                });
            }

        }
    });
    mifosX.ng.application.controller('AccountingStateProductMappingController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', '$route', mifosX.controllers.AccountingStateProductMappingController]).run(function ($log) {
        $log.info("AccountingStateProductMappingController initialized");
    });
}(mifosX.controllers || {}));
