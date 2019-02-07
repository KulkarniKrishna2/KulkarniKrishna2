(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewAccountingMappingsController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {

            resourceFactory.AdvancedAccountingMappings.query(function (data) {
                scope.accountingMappings = data;
            });
            scope.routeTo = function (mappingId) {
                location.path('/viewaccountingmappingsdetails/' + mappingId);
            };
            scope.editMapping = function (mappingId) {
                location.path('/editaccountingmappings/' + mappingId);
            };
        }
    });
    mifosX.ng.application.controller('ViewAccountingMappingsController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.ViewAccountingMappingsController]).run(function ($log) {
        $log.info("ViewAccountingMappingsController initialized");
    });
}(mifosX.controllers || {}));
