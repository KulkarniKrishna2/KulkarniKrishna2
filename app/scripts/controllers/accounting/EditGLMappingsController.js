(function (module) {
    mifosX.controllers = _.extend(module, {
        EditGLMappingsController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.mappingId = routeParams.mappingId;
            scope.accStateId = routeParams.accStateId;
            scope.formData = {
                locale: scope.optlang.code,
                accStateId: routeParams.accStateId,
            };
            var queryParams = { accStateId: routeParams.accStateId, template: true };
            resourceFactory.AdvancedAccountingGLMapping.get(queryParams, function (data) {
                scope.accountingMappings = data;
                scope.assetAccountOptions = scope.accountingMappings.assetAccountOptions || [];
                scope.incomeAccountOptions = scope.accountingMappings.incomeAccountOptions || [];
                scope.expenseAccountOptions = scope.accountingMappings.expenseAccountOptions || [];
                scope.liabilityAccountOptions = scope.accountingMappings.liabilityAccountOptions || [];
                scope.incomeAndLiabilityAccountOptions = scope.incomeAccountOptions.concat(scope.liabilityAccountOptions);
                scope.assetAndLiabilityAccountOptions = scope.assetAccountOptions.concat(scope.liabilityAccountOptions);
                scope.assetLiabilityAndIncomeAccountOptions = scope.assetAndLiabilityAccountOptions.concat(scope.incomeAccountOptions);
                scope.formData.fundSourceAccountId = scope.accountingMappings.fundSourceAccount.id;
                scope.formData.loanPortfolioAccountId = scope.accountingMappings.loanPortfolioAccount.id;
                if (scope.accountingMappings.overdueLoanPortfolioAccount) {
                    scope.formData.overdueLoanPortfolioAccountId = scope.accountingMappings.overdueLoanPortfolioAccount.id;
                }
                if (scope.accountingMappings.overdueReceivableInterestAccount) {
                    scope.formData.overdueReceivableInterestAccountId = scope.accountingMappings.overdueReceivableInterestAccount.id;
                }
                if (scope.accountingMappings.overdueReceivableFeeAccount) {
                    scope.formData.overdueReceivableFeeAccountId = scope.accountingMappings.overdueReceivableFeeAccount.id;
                }
                if (scope.accountingMappings.overdueReceivablePenaltyAccount) {
                    scope.formData.overdueReceivablePenaltyAccountId = scope.accountingMappings.overdueReceivablePenaltyAccount.id;
                }
                if (scope.accountingMappings.receivableInterestAccount) {
                    scope.formData.receivableInterestAccountId = scope.accountingMappings.receivableInterestAccount.id;
                }
                if (scope.accountingMappings.receivableFeeAccount) {
                    scope.formData.receivableFeeAccountId = scope.accountingMappings.receivableFeeAccount.id;
                }
                if (scope.accountingMappings.receivablePenaltyAccount) {
                    scope.formData.receivablePenaltyAccountId = scope.accountingMappings.receivablePenaltyAccount.id;
                }
                if (scope.accountingMappings.interestReceivableAndDueAccount) {
                    scope.formData.interestReceivableAndDueAccountId = scope.accountingMappings.interestReceivableAndDueAccount.id;
                }
                scope.formData.lossGainWithAdjustmentAccountId = scope.accountingMappings.lossGainWithAdjustmentAccount.id;
                scope.formData.transfersInSuspenseAccountId = scope.accountingMappings.transfersInSuspenseAccount.id;
                scope.formData.valueDateSuspenseAccountId = scope.accountingMappings.valueDateSuspenseAccount.id;
                scope.formData.valueDateSuspensePayableAccountId = scope.accountingMappings.valueDateSuspensePayableAccount.id;
                scope.formData.interestOnLoanAccountId = scope.accountingMappings.interestOnLoanAccount.id;
                scope.formData.incomeFromFeeAccountId = scope.accountingMappings.incomeFromFeeAccount.id;
                scope.formData.incomeFromPenaltyAccountId = scope.accountingMappings.incomeFromPenaltyAccount.id;
                scope.formData.incomeFromRecoveryAccountId = scope.accountingMappings.incomeFromRecoveryAccount.id;
                scope.formData.writeOffAccountId = scope.accountingMappings.writeOffAccount.id;
                scope.formData.overpaymentLiabilityAccountId = scope.accountingMappings.overpaymentLiabilityAccount.id;
                if (scope.accountingMappings.npaInterestSuspenseAccount) {
                    scope.formData.npaInterestSuspenseAccountId = scope.accountingMappings.npaInterestSuspenseAccount.id;
                }
                if (scope.accountingMappings.npaFeeSuspenseAccount) {
                    scope.formData.npaFeeSuspenseAccountId = scope.accountingMappings.npaFeeSuspenseAccount.id;
                }
                if (scope.accountingMappings.npaPenaltySuspenseAccount) {
                    scope.formData.npaPenaltySuspenseAccountId = scope.accountingMappings.npaPenaltySuspenseAccount.id;
                }
            });
            scope.routeTo = function () {
                location.path('/viewaccountingglmappings/' + routeParams.mappingId + '/accstate/' + routeParams.accStateId);
            };

            scope.submit = function () {
                resourceFactory.AdvancedAccountingGLMapping.update(scope.formData, function (data) {
                    scope.routeTo();
                });
            }

        }
    });
    mifosX.ng.application.controller('EditGLMappingsController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.EditGLMappingsController]).run(function ($log) {
        $log.info("EditGLMappingsController initialized");
    });
}(mifosX.controllers || {}));
