(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateAccStateProductMappingController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.formData = {
                locale: scope.optlang.code,
            };
            resourceFactory.AdvancedAccountingProductMappingTemplate.get(function (data) {
                scope.loanProducts = data.loanProducts;
                scope.accStateMappings = data.accStateMappings;
            });

            scope.submit = function () {
                resourceFactory.AdvancedAccountingProductMapping.save(scope.formData, function (data) {
                    location.path('/accountingstate/productmappings');
                });
            }

        }
    });
    mifosX.ng.application.controller('CreateAccStateProductMappingController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.CreateAccStateProductMappingController]).run(function ($log) {
        $log.info("CreateAccStateProductMappingController initialized");
    });
}(mifosX.controllers || {}));
