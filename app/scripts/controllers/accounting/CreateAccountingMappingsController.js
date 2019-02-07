(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateAccountingMappingsController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.formData = {
                locale: scope.optlang.code,
            };
            scope.submit = function () {
                resourceFactory.AdvancedAccountingMappings.save(scope.formData, function (data) {
                    location.path('/accountingstatemappings');
                });
            }

        }
    });
    mifosX.ng.application.controller('CreateAccountingMappingsController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.CreateAccountingMappingsController]).run(function ($log) {
        $log.info("CreateAccountingMappingsController initialized");
    });
}(mifosX.controllers || {}));
