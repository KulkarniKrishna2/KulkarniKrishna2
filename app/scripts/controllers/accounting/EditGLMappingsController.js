(function (module) {
    mifosX.controllers = _.extend(module, {
        EditGLMappingsController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.mappingId = routeParams.mappingId;
            scope.accStateId = routeParams.accStateId;
            scope.showOrHideValue = "show";
            scope.configureFundOptions = [];
            scope.paymentTypeOptions = [];
            scope.formData = {
                locale: scope.optlang.code,
                accStateId: routeParams.accStateId,
            };
            var queryParams = { accStateId: routeParams.accStateId, template: true };
            resourceFactory.AdvancedAccountingGLMapping.get(queryParams, function (data) {
                scope.accountingMappings = data.accountingMappingOptions;
                scope.paymentTypeOptions = data.paymentTypeOptions;
                scope.glMappings = data.glMappings;
                scope.paymentTypeToFundSourceMappings = data.paymentTypeToFundSourceMappings;
                scope.assetAccountOptions = scope.accountingMappings.assetAccountOptions || [];
                scope.incomeAccountOptions = scope.accountingMappings.incomeAccountOptions || [];
                scope.expenseAccountOptions = scope.accountingMappings.expenseAccountOptions || [];
                scope.liabilityAccountOptions = scope.accountingMappings.liabilityAccountOptions || [];
                scope.incomeAndLiabilityAccountOptions = scope.incomeAccountOptions.concat(scope.liabilityAccountOptions);
                scope.assetAndLiabilityAccountOptions = scope.assetAccountOptions.concat(scope.liabilityAccountOptions);
                scope.assetLiabilityAndIncomeAccountOptions = scope.assetAndLiabilityAccountOptions.concat(scope.incomeAccountOptions);
                scope.glAccountOptions = scope.assetLiabilityAndIncomeAccountOptions.concat(scope.expenseAccountOptions);
                scope.formData.fundSourceAccountId = scope.glMappings.fundSourceAccount.id;
                scope.formData.loanPortfolioAccountId = scope.glMappings.loanPortfolioAccount.id;
                if (scope.glMappings.overdueLoanPortfolioAccount) {
                    scope.formData.overdueLoanPortfolioAccountId = scope.glMappings.overdueLoanPortfolioAccount.id;
                }
                if (scope.glMappings.overdueReceivableInterestAccount) {
                    scope.formData.overdueReceivableInterestAccountId = scope.glMappings.overdueReceivableInterestAccount.id;
                }
                if (scope.glMappings.overdueReceivableFeeAccount) {
                    scope.formData.overdueReceivableFeeAccountId = scope.glMappings.overdueReceivableFeeAccount.id;
                }
                if (scope.glMappings.overdueReceivablePenaltyAccount) {
                    scope.formData.overdueReceivablePenaltyAccountId = scope.glMappings.overdueReceivablePenaltyAccount.id;
                }
                if (scope.glMappings.receivableInterestAccount) {
                    scope.formData.receivableInterestAccountId = scope.glMappings.receivableInterestAccount.id;
                }
                if (scope.glMappings.receivableFeeAccount) {
                    scope.formData.receivableFeeAccountId = scope.glMappings.receivableFeeAccount.id;
                }
                if (scope.glMappings.receivablePenaltyAccount) {
                    scope.formData.receivablePenaltyAccountId = scope.glMappings.receivablePenaltyAccount.id;
                }
                if (scope.glMappings.interestReceivableAndDueAccount) {
                    scope.formData.interestReceivableAndDueAccountId = scope.glMappings.interestReceivableAndDueAccount.id;
                }
                scope.formData.lossGainWithAdjustmentAccountId = scope.glMappings.lossGainWithAdjustmentAccount.id;
                scope.formData.transfersInSuspenseAccountId = scope.glMappings.transfersInSuspenseAccount.id;
                if (scope.glMappings.valueDateSuspenseAccount) {
                    scope.formData.valueDateSuspenseAccountId = scope.glMappings.valueDateSuspenseAccount.id;
                }
                if (scope.glMappings.valueDateSuspensePayableAccount) {
                    scope.formData.valueDateSuspensePayableAccountId = scope.glMappings.valueDateSuspensePayableAccount.id;
                }
                scope.formData.interestOnLoanAccountId = scope.glMappings.interestOnLoanAccount.id;
                scope.formData.incomeFromFeeAccountId = scope.glMappings.incomeFromFeeAccount.id;
                scope.formData.incomeFromPenaltyAccountId = scope.glMappings.incomeFromPenaltyAccount.id;
                scope.formData.incomeFromRecoveryAccountId = scope.glMappings.incomeFromRecoveryAccount.id;
                scope.formData.writeOffAccountId = scope.glMappings.writeOffAccount.id;
                scope.formData.overpaymentLiabilityAccountId = scope.glMappings.overpaymentLiabilityAccount.id;
                if (scope.glMappings.npaInterestSuspenseAccount) {
                    scope.formData.npaInterestSuspenseAccountId = scope.glMappings.npaInterestSuspenseAccount.id;
                }
                if (scope.glMappings.npaFeeSuspenseAccount) {
                    scope.formData.npaFeeSuspenseAccountId = scope.glMappings.npaFeeSuspenseAccount.id;
                }
                if (scope.glMappings.npaPenaltySuspenseAccount) {
                    scope.formData.npaPenaltySuspenseAccountId = scope.glMappings.npaPenaltySuspenseAccount.id;
                }
                if (scope.paymentTypeToFundSourceMappings && scope.paymentTypeToFundSourceMappings.length > 0) {
                    scope.showOrHideValue = 'hide';
                    scope.frFlag = true;
                    _.each(scope.paymentTypeToFundSourceMappings, function (fundSource) {
                        scope.configureFundOptions.push({
                            paymentTypeId: fundSource.paymentType.id,
                            fundSourceAccountId: fundSource.fundSourceAccount.id,
                            paymentTypeOptions: scope.paymentTypeOptions.length > 0 ? scope.paymentTypeOptions : [],
                            assetAccountOptions: scope.glAccountOptions.length > 0 ? scope.glAccountOptions : []
                        })
                    });
                };
            });
            //advanced accounting rule
            scope.showOrHide = function (showOrHideValue) {

                if (showOrHideValue == "show") {
                    scope.showOrHideValue = 'hide';
                }

                if (showOrHideValue == "hide") {
                    scope.showOrHideValue = 'show';
                }
            };

            scope.addConfigureFundSource = function () {
                scope.frFlag = true;
                scope.configureFundOptions.push({
                    paymentTypeId: scope.paymentTypeOptions.length > 0 ? scope.paymentTypeOptions[0].id : '',
                    fundSourceAccountId: scope.glAccountOptions.length > 0 ? scope.glAccountOptions[0].id : '',
                    paymentTypeOptions: scope.paymentTypeOptions.length > 0 ? scope.paymentTypeOptions : [],
                    assetAccountOptions: scope.glAccountOptions.length > 0 ? scope.glAccountOptions : []
                });
            };

            scope.deleteFund = function (index) {
                scope.configureFundOptions.splice(index, 1);
            };

            scope.routeTo = function () {
                location.path('/viewaccountingglmappings/' + routeParams.mappingId + '/accstate/' + routeParams.accStateId);
            };

            scope.submit = function () {
                scope.paymentChannelToFundSourceMappings = [];
                //configure fund sources for payment channels
                for (var i in scope.configureFundOptions) {
                    temp = {
                        paymentTypeId: scope.configureFundOptions[i].paymentTypeId,
                        fundSourceAccountId: scope.configureFundOptions[i].fundSourceAccountId
                    }
                    scope.paymentChannelToFundSourceMappings.push(temp);
                }
                this.formData.paymentChannelToFundSourceMappings = scope.paymentChannelToFundSourceMappings;
              
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
