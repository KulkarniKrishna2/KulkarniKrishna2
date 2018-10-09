(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateNewTransactionTypeController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.formData = {
                locale: scope.optlang.code
            };
            scope.transactionTypeOptions = [];
            scope.productTypeOptions = [];
            resourceFactory.transactionTypeMappingTemplateResource.get(function (data) {
                scope.transactionTypeOptions = data.transactionTypeOptions;
                scope.productTypeOptions = data.productTypeOptions;
                scope.loanProducts = data.loanProducts;
                scope.glAccounts = data.glAccounts;
                scope.savingsProducts = data.savingsProducts;

            });
            scope.changeProductType = function (productTypeId) {
                if (scope.formData.productTypeId == 1) {
                    scope.productOptions = scope.loanProducts;
                }
                else if (scope.formData.productTypeId == 2) {
                    scope.productOptions = scope.savingsProducts;
                }
            }
            scope.submit = function () {
                resourceFactory.transactionTypeMappingResource.save(scope.formData, function (data) {
                    location.path('/transactiontypemapping');
                });
            }

        }
    });
    mifosX.ng.application.controller('CreateNewTransactionTypeController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.CreateNewTransactionTypeController]).run(function ($log) {
        $log.info("CreateNewTransactionTypeController initialized");
    });
}(mifosX.controllers || {}));
