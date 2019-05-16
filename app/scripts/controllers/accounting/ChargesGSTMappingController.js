(function (module) {
    mifosX.controllers = _.extend(module, {
        ChargesGSTMappingController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.chargesData = [];
            resourceFactory.taxconfigurationsResource.query({ entityType: "charges" }, function (data) {
                scope.chargesData = data;
            });
            scope.addCharge = function () {
                location.path('/gstmapping/addcharges');
            }
            scope.edit = function (entityId) {
                location.path('/editgstmapping/charges/' + entityId);
            }
        }
    });
    mifosX.ng.application.controller('ChargesGSTMappingController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.ChargesGSTMappingController]).run(function ($log) {
        $log.info("ChargesGSTMappingController initialized");
    });
}(mifosX.controllers || {}));