(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateGLMappingsController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.mappingId = routeParams.mappingId;
            scope.accStateId = routeParams.accStateId;
            scope.formData = {
                locale: scope.optlang.code,
                accStateId: routeParams.accStateId,
            };
            resourceFactory.AdvancedAccountingGLMappingTemplate.get(function (data) {
                scope.accountingMappingOptions = data;
                scope.assetAccountOptions = scope.accountingMappingOptions.assetAccountOptions || [];
                scope.incomeAccountOptions = scope.accountingMappingOptions.incomeAccountOptions || [];
                scope.expenseAccountOptions = scope.accountingMappingOptions.expenseAccountOptions || [];
                scope.liabilityAccountOptions = scope.accountingMappingOptions.liabilityAccountOptions || [];
                scope.incomeAndLiabilityAccountOptions = scope.incomeAccountOptions.concat(scope.liabilityAccountOptions);
                scope.assetAndLiabilityAccountOptions = scope.assetAccountOptions.concat(scope.liabilityAccountOptions);
                scope.assetLiabilityAndIncomeAccountOptions = scope.assetAndLiabilityAccountOptions.concat(scope.incomeAccountOptions);
                scope.glAccountOptions = scope.assetLiabilityAndIncomeAccountOptions.concat(scope.expenseAccountOptions);
            });
            scope.routeTo = function () {
                location.path('/viewaccountingglmappings/' + routeParams.mappingId + '/accstate/' + routeParams.accStateId);
            };

            scope.submit = function () {
                resourceFactory.AdvancedAccountingGLMapping.save(scope.formData, function (data) {
                    scope.routeTo();
                });
            }

        }
    });
    mifosX.ng.application.controller('CreateGLMappingsController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.CreateGLMappingsController]).run(function ($log) {
        $log.info("CreateGLMappingsController initialized");
    });
}(mifosX.controllers || {}));
