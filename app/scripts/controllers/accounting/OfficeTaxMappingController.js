(function (module) {
    mifosX.controllers = _.extend(module, {
        OfficeTaxMappingController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.officesData = [];
            resourceFactory.taxconfigurationsResource.query({ entityType: "office" }, function (data) {
                scope.officesData = data;
            });
            scope.addOffice = function () {
                location.path('/gstmapping/createOfficeMappings');
            }
            scope.edit = function (entityId) {
                location.path('/gstmapping/editOfficeMappings/office/' + entityId);
            }
        }
    });
    mifosX.ng.application.controller('OfficeTaxMappingController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.OfficeTaxMappingController]).run(function ($log) {
        $log.info("OfficeTaxMappingController initialized");
    });
}(mifosX.controllers || {}));