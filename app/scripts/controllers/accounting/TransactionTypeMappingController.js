(function (module) {
    mifosX.controllers = _.extend(module, {
        TransactionTypeMappingController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.transactionTypeMappings = []
            scope.formData = {};
            scope.transactionEntryTypeOptions = [{ id: 1, code: "transactionentrytype.transfer", value: "Transfer" }, { id: 2, code: "transactionentrytype.transfer", value: "Regular" }];
            resourceFactory.transactionTypeMappingTemplateResource.get(function (data) {
                scope.transactionTypeOptions = data.transactionTypeOptions;
                scope.productTypeOptions = data.productTypeOptions;
                scope.loanProducts = data.loanProducts;
                scope.glAccounts = data.glAccounts;
                scope.savingsProducts = data.savingsProducts;
                scope.accountLevelTypeOptions = data.accountLevelTypeOptions;
                scope.transactionMappingOptions = data.transactionMappingOptions;
                scope.bcAccountingTypeOptions = data.bcAccountingTypeOptions;

            });
            scope.changeProductType = function () {
                if (scope.formData.productTypeId == 1) {
                    scope.productOptions = scope.loanProducts;
                }
                else if (scope.formData.productTypeId == 2) {
                    scope.productOptions = scope.savingsProducts;
                }
            };

            scope.searchTransaction = function () {
                var params = {};
                if (scope.formData.transactionTypeId) {
                    params.transactionTypeId = scope.formData.transactionTypeId;
                }
                if (scope.formData.accountingLevelId) {
                    params.accountingLevelId = scope.formData.accountingLevelId;
                }
                if (scope.formData.productTypeId) {
                    params.productTypeId = scope.formData.productTypeId;
                }
                if (scope.formData.productId) {
                    params.productId = scope.formData.productId;
                }
                if (scope.formData.bcAccountingTypeId) {
                    params.bcAccountingTypeId = scope.formData.bcAccountingTypeId;
                }
                if (scope.formData.transactionEntryTypeId) {
                    if (scope.formData.transactionEntryTypeId == 1) {
                        params.istransfer = true;
                    } else if (scope.formData.transactionEntryTypeId == 2) {
                        params.isnotTransfer = true;
                    }
                }
                resourceFactory.transactionTypeMappingResource.getAll(params, function (data) {
                    scope.transactionTypeMappings = data;
                });
            };
            scope.routeTo = function (id) {
                location.path('/transactiontypemapping/viewtransactiontype/' + id);
            };
        }
    });
    mifosX.ng.application.controller('TransactionTypeMappingController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.TransactionTypeMappingController]).run(function ($log) {
        $log.info("TransactionTypeMappingController initialized");
    });
}(mifosX.controllers || {}));
