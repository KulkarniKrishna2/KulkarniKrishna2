(function (module) {
    mifosX.controllers = _.extend(module, {
        EditAccountingMappingsController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.formData = {
                locale: scope.optlang.code,
            };
            resourceFactory.AdvancedAccountingMappings.get({ mappingId: routeParams.mappingId }, function (data) {
                scope.formData.accMappingName = data.accMappingName;
            });

            scope.submit = function () {
                resourceFactory.AdvancedAccountingMappings.update({ mappingId: routeParams.mappingId }, scope.formData, function (data) {
                    location.path('/accountingstatemappings');
                });
            }

        }
    });
    mifosX.ng.application.controller('EditAccountingMappingsController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.EditAccountingMappingsController]).run(function ($log) {
        $log.info("EditAccountingMappingsController initialized");
    });
}(mifosX.controllers || {}));
