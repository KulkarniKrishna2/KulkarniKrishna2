(function (module) {
    mifosX.controllers = _.extend(module, {
        TransactionTypeMappingController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal, route) {
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
                scope.tempPaymentTypeOptions = data.paymentTypeOptions;
                if (!scope.searchCriteria.transactionType) {
                    scope.searchCriteria.transactionType = [null, null, null, null, null, null, null];
                }
                scope.formData.transactionTypeId = scope.searchCriteria.transactionType[0];
                scope.formData.accountingLevelId = scope.searchCriteria.transactionType[1];
                scope.formData.productTypeId = scope.searchCriteria.transactionType[2];
                scope.formData.productId = scope.searchCriteria.transactionType[3];
                scope.formData.bcAccountingTypeId = scope.searchCriteria.transactionType[4];
                scope.formData.transactionEntryTypeId = scope.searchCriteria.transactionType[5];
                scope.formData.accSubTypeId = scope.searchCriteria.transactionType[6];
                scope.getPaymentOptions();
                scope.changeProductType();
            });
            scope.changeProductType = function () {
                if (scope.formData.productTypeId == 1) {
                    scope.productOptions = scope.loanProducts;
                }
                else if (scope.formData.productTypeId == 2) {
                    scope.productOptions = scope.savingsProducts;
                }
            };
            scope.getPaymentOptions = function () {
                if (scope.formData.bcAccountingTypeId == 3) {
                    scope.paymentTypeOptions = scope.tempPaymentTypeOptions;
                } else {
                    scope.paymentTypeOptions = {};
                    scope.formData.accSubTypeId = null;
                }
            }
            scope.searchTransaction = function () {
                var params = {};
                if (scope.formData.transactionTypeId) {
                    params.transactionTypeId = scope.formData.transactionTypeId;
                    scope.searchCriteria.transactionType[0] = scope.formData.transactionTypeId;
                } else {
                    scope.searchCriteria.transactionType[0] = null;
                }
                if (scope.formData.accountingLevelId) {
                    params.accountingLevelId = scope.formData.accountingLevelId;
                    scope.searchCriteria.transactionType[1] = scope.formData.accountingLevelId;
                } else {
                    scope.searchCriteria.transactionType[1] = null;
                }
                if (scope.formData.productTypeId) {
                    params.productTypeId = scope.formData.productTypeId;
                    scope.searchCriteria.transactionType[2] = scope.formData.productTypeId;
                } else {
                    scope.searchCriteria.transactionType[2] = null;
                }
                if (scope.formData.productId) {
                    params.productId = scope.formData.productId;
                    scope.searchCriteria.transactionType[3] = scope.formData.productId;
                } else {
                    scope.searchCriteria.transactionType[3] = null;
                }
                if (scope.formData.bcAccountingTypeId) {
                    params.bcAccountingTypeId = scope.formData.bcAccountingTypeId;
                    scope.searchCriteria.transactionType[4] = scope.formData.bcAccountingTypeId;
                } else {
                    scope.searchCriteria.transactionType[4] = null;
                }
                if (scope.formData.transactionEntryTypeId) {
                    if (scope.formData.transactionEntryTypeId == 1) {
                        params.istransfer = true;
                        scope.searchCriteria.transactionType[5] = scope.formData.transactionEntryTypeId;
                    } else if (scope.formData.transactionEntryTypeId == 2) {
                        params.isnotTransfer = true;
                        scope.searchCriteria.transactionType[5] = scope.formData.transactionEntryTypeId;
                    } else {
                        scope.searchCriteria.transactionType[5] = null;
                    }
                }
                if (scope.formData.accSubTypeId) {
                    params.accSubType = scope.formData.accSubTypeId;
                    scope.searchCriteria.transactionType[6] = scope.formData.accSubTypeId;

                } else {
                    scope.searchCriteria.transactionType[6] = null;
                }
                resourceFactory.transactionTypeMappingResource.getAll(params, function (data) {
                    scope.transactionTypeMappings = data;
                });
            };
            scope.clearFilters = function () {
                scope.searchCriteria.transactionType = [null, null, null, null, null, null, null];
                route.reload();
            };
            scope.routeTo = function (id) {
                location.path('/transactiontypemapping/viewtransactiontype/' + id);
            };
        }
    });
    mifosX.ng.application.controller('TransactionTypeMappingController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', '$route', mifosX.controllers.TransactionTypeMappingController]).run(function ($log) {
        $log.info("TransactionTypeMappingController initialized");
    });
}(mifosX.controllers || {}));
