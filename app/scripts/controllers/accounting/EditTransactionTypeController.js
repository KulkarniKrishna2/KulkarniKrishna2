(function (module) {
    mifosX.controllers = _.extend(module, {
        EditTransactionTypeController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {

            resourceFactory.transactionTypeMappingResource.get({ mappingId: routeParams.mappingId, template: true }, function (data) {
                scope.template = data;
                scope.transactionTypeOptions = data.transactionTypeOptions;
                scope.productTypeOptions = data.productTypeOptions;
                scope.loanProducts = data.loanProducts;
                scope.glAccounts = data.glAccounts;
                scope.savingsProducts = data.savingsProducts;
                scope.formData = {
                    locale: scope.optlang.code,
                    transactionTypeId: data.transactionType.id,
                    fromCreditAccountId: data.fromCreditAccount.id,
                    fromDebitAccountId: data.fromDebitAccount.id,
                    toCreditAccountId: data.toCreditAccount.id,
                    toDebitAccountId: data.toDebitAccount.id
                };
                if (data.productType && data.productData) {
                    scope.formData.productTypeId = data.productType.id;
                    scope.formData.productId = data.productData.id;
                    scope.changeProductType(scope.formData.productTypeId);
                }
            });
            scope.changeProductType = function (productTypeId) {
                if (scope.formData.productTypeId == 1) {
                    scope.productOptions = scope.loanProducts;
                }
                else if (scope.formData.productTypeId == 2) {
                    scope.productOptions = scope.savingsProducts;
                }
            }
            scope.submit = function (id) {
                resourceFactory.transactionTypeMappingResource.update({ mappingId: routeParams.mappingId }, scope.formData, function (data) {
                    location.path('/transactiontypemapping/viewtransactiontype/' + id);
                });
            }
            scope.routeTO = function (id) {
                location.path('/transactiontypemapping/viewtransactiontype/' + id);
            }


        }
    });
    mifosX.ng.application.controller('EditTransactionTypeController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.EditTransactionTypeController]).run(function ($log) {
        $log.info("EditTransactionTypeController initialized");
    });
}(mifosX.controllers || {}));
