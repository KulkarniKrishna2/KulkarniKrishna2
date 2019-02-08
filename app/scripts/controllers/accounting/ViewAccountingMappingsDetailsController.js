(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewAccountingMappingsDetailsController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.mappingId = routeParams.mappingId;
            resourceFactory.AdvancedAccountingMappingDetails.query({ accountingMappingId: routeParams.mappingId }, function (data) {
                scope.accountingMappingDetails = data;
            });

            scope.routeTo = function (accStateId) {
                location.path('/viewaccountingglmappings/' + routeParams.mappingId + '/accstate/' + accStateId);
            };

            scope.editMappingDetails = function (accStateId, subTypeId) {
                if (subTypeId) {
                    location.path('/editaccountingmappingsdetails/' + routeParams.mappingId + '/accstate/' + accStateId + '/subtype/' + subTypeId);
                } else {
                    location.path('/editaccountingmappingsdetails/' + routeParams.mappingId + '/accstate/' + accStateId);
                }
            };
        }
    });
    mifosX.ng.application.controller('ViewAccountingMappingsDetailsController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.ViewAccountingMappingsDetailsController]).run(function ($log) {
        $log.info("ViewAccountingMappingsDetailsController initialized");
    });
}(mifosX.controllers || {}));
