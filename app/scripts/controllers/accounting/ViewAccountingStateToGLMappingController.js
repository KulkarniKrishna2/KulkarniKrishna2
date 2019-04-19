(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewAccountingStateToGLMappingController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.mappingId = routeParams.mappingId;
            scope.accStateId = routeParams.accStateId;
            scope.isEmpty = false;
            var queryParams = { accStateId: routeParams.accStateId };
            resourceFactory.AdvancedAccountingGLMapping.get(queryParams, function (data) {
                scope.accountingMappings = data.glMappings;
                scope.paymentChannelToFundSourceMappings = data.paymentTypeToFundSourceMappings;
                scope.isEmpty = !scope.accountingMappings.hasOwnProperty("fundSourceAccount");
            });
        }
    });
    mifosX.ng.application.controller('ViewAccountingStateToGLMappingController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.ViewAccountingStateToGLMappingController]).run(function ($log) {
        $log.info("ViewAccountingStateToGLMappingController initialized");
    });
}(mifosX.controllers || {}));
