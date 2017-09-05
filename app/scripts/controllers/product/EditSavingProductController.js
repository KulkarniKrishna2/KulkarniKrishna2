(function (module) {
    mifosX.controllers = _.extend(module, {
        EditSavingProductController: function (scope, resourceFactory, location, routeParams, commonUtilService, dateFilter) {
            scope.formData = {};
            scope.charges = [];
            scope.showOrHideValue = "show";
            scope.configureFundOptions = [];
            scope.specificIncomeaccounts = [];
            scope.penaltySpecificIncomeaccounts = [];
            scope.configureFundOption = {};
            scope.onDayTypeOptions = commonUtilService.onDayTypeOptions();
            scope.originalInterestRateChart = [];
            scope.interestRateChart = [];
            scope.updatedInterestRateChart = [];

            scope.formData.isAllowInterestRateChart = false;
            scope.isAllowInterestRateChartDisabled = false;
            resourceFactory.savingProductResource.get({savingProductId: routeParams.id, template: 'true'}, function (data) {
                scope.product = data;
                scope.charges = data.charges;
                scope.assetAccountOptions = scope.product.accountingMappingOptions.assetAccountOptions || [];
                scope.liabilityAccountOptions = scope.product.accountingMappingOptions.liabilityAccountOptions || [];
                scope.incomeAccountOptions = scope.product.accountingMappingOptions.incomeAccountOptions || [];
                scope.expenseAccountOptions = scope.product.accountingMappingOptions.expenseAccountOptions || [];
                scope.formData = {
                    name: data.name,
                    shortName: data.shortName,
                    description: data.description,
                    externalId: data.externalId,
                    currencyCode: data.currency.code,
                    digitsAfterDecimal: data.currency.decimalPlaces,
                    inMultiplesOf: data.currency.inMultiplesOf,
                    nominalAnnualInterestRate: data.nominalAnnualInterestRate,
                    minRequiredOpeningBalance: data.minRequiredOpeningBalance,
                    lockinPeriodFrequency: data.lockinPeriodFrequency,
                    withdrawalFeeForTransfers: data.withdrawalFeeForTransfers == true ? 'true' : 'false',
                    interestCompoundingPeriodType: data.interestCompoundingPeriodType.id,
                    interestPostingPeriodType: data.interestPostingPeriodType.id,
                    interestCalculationType: data.interestCalculationType.id,
                    interestCalculationDaysInYearType: data.interestCalculationDaysInYearType.id,
                    accountingRule: data.accountingRule.id,
                    allowOverdraft: data.allowOverdraft == true ? true : false,
                    overdraftLimit: data.overdraftLimit,
                    nominalAnnualInterestRateOverdraft: data.nominalAnnualInterestRateOverdraft,
                    minOverdraftForInterestCalculation: data.minOverdraftForInterestCalculation,
                    minBalanceForInterestCalculation: data.minBalanceForInterestCalculation,
                    enforceMinRequiredBalance: data.enforceMinRequiredBalance,
                    minRequiredBalance:data.minRequiredBalance,
                    withHoldTax: data.withHoldTax == true ? 'true' : 'false',
                    isDormancyTrackingActive: data.isDormancyTrackingActive == true ? 'true':'false',
                    daysToInactive: data.daysToInactive,
                    daysToDormancy: data.daysToDormancy,
                    daysToEscheat: data.daysToEscheat
                };
                if(data.floatingInterestRateChartData != undefined && data.floatingInterestRateChartData.length > 0){
                    scope.interestRateChart = data.floatingInterestRateChartData;
                    scope.originalInterestRateChart =  data.floatingInterestRateChartData;;
                    for(var i in scope.interestRateChart){
                    var actDate = dateFilter(scope.interestRateChart[i].effectiveFromDate, scope.df);
                        scope.interestRateChart[i].effectiveFromDate = new Date(actDate);
                    }
                    scope.formData.isAllowInterestRateChart = true;
                    scope.isAllowInterestRateChartDisabled = true;
                }

                scope.formData.allowDpLimit = false;
                if (scope.formData.allowOverdraft) {
                    if(data.savingsProductDrawingPowerDetailsData && data.savingsProductDrawingPowerDetailsData.frequencyType){
                        var savingsProductDrawingPowerDetailsData = data.savingsProductDrawingPowerDetailsData;
                        scope.formData.allowDpLimit = true;
                        scope.formData.dpFrequencyType = savingsProductDrawingPowerDetailsData.frequencyType.id;
                        if(savingsProductDrawingPowerDetailsData.frequencyNthDay){
                            scope.formData.dpFrequencyNthDay = savingsProductDrawingPowerDetailsData.frequencyNthDay.id;
                        }
                        if(savingsProductDrawingPowerDetailsData.frequencyDayOfWeekType){
                            scope.formData.dpFrequencyDayOfWeekType = savingsProductDrawingPowerDetailsData.frequencyDayOfWeekType.id;
                        }
                        scope.formData.dpFrequencyOnDay = savingsProductDrawingPowerDetailsData.frequencyOnDay;
                        scope.formData.dpFrequencyInterval = savingsProductDrawingPowerDetailsData.frequencyInterval;
                    }
                }

                if(data.withHoldTax){
                    scope.formData.taxGroupId = data.taxGroup.id;
                }

                if (data.lockinPeriodFrequencyType) {
                    scope.formData.lockinPeriodFrequencyType = data.lockinPeriodFrequencyType.id;
                }

                scope.formData.savingsReferenceAccountId = data.accountingMappings.savingsReferenceAccount.id;
                scope.formData.savingsControlAccountId = data.accountingMappings.savingsControlAccount.id;
                scope.formData.transfersInSuspenseAccountId = data.accountingMappings.transfersInSuspenseAccount.id;
                scope.formData.escheatLiabilityId = data.accountingMappings.escheatLiabilityAccount.id;
                scope.formData.incomeFromFeeAccountId = data.accountingMappings.incomeFromFeeAccount.id;
                scope.formData.incomeFromPenaltyAccountId = data.accountingMappings.incomeFromPenaltyAccount.id;
                scope.formData.interestOnSavingsAccountId = data.accountingMappings.interestOnSavingsAccount.id;
                scope.formData.writeOffAccountId = data.accountingMappings.writeOffAccount.id;
                scope.formData.overdraftPortfolioControlId = data.accountingMappings.overdraftPortfolioControl.id;
                scope.formData.incomeFromInterestId = data.accountingMappings.incomeFromInterest.id;

                _.each(scope.product.paymentChannelToFundSourceMappings, function (fundSource) {
                    scope.configureFundOptions.push({
                        paymentTypeId: fundSource.paymentType.id,
                        fundSourceAccountId: fundSource.fundSourceAccount.id,
                        paymentTypeOptions: scope.product.paymentTypeOptions,
                        assetAccountOptions: scope.assetAccountOptions
                    })
                });

                _.each(scope.product.feeToIncomeAccountMappings, function (fees) {
                    scope.specificIncomeaccounts.push({
                        chargeId: fees.charge.id,
                        incomeAccountId: fees.incomeAccount.id,
                        chargeOptions: scope.product.chargeOptions,
                        incomeAccountOptions: scope.incomeAccountOptions
                    })
                });

                _.each(scope.product.penaltyToIncomeAccountMappings, function (penalty) {
                    scope.penaltySpecificIncomeaccounts.push({
                        chargeId: penalty.charge.id,
                        incomeAccountId: penalty.incomeAccount.id,
                        penaltyOptions: scope.product.penaltyOptions,
                        incomeAccountOptions: scope.incomeAccountOptions
                    })
                });
            });

            //advanced accounting rule
            scope.showOrHide = function (showOrHideValue) {

                if (showOrHideValue == "show") {
                    scope.showOrHideValue = 'hide';
                }

                if (showOrHideValue == "hide") {
                    scope.showOrHideValue = 'show';
                }
            }

            scope.chargeSelected = function (chargeId) {
                if (chargeId) {
                    resourceFactory.chargeResource.get({chargeId: chargeId, template: 'true'}, this.formData, function (data) {
                        data.chargeId = data.id;
                        scope.charges.push(data);
                        //to charge select box empty
                        scope.chargeId = '';
                    });
                }
            }

            scope.deleteCharge = function (index) {
                scope.charges.splice(index, 1);
            }

            scope.addConfigureFundSource = function () {
                scope.paymentTypeOptions = scope.product.paymentTypeOptions || [];
                scope.configureFundOptions.push({
                    paymentTypeId: scope.paymentTypeOptions.length > 0 ? scope.paymentTypeOptions[0].id : '',
                    fundSourceAccountId: scope.assetAccountOptions.length > 0 ? scope.assetAccountOptions[0].id : '',
                    paymentTypeOptions: scope.paymentTypeOptions,
                    assetAccountOptions: scope.assetAccountOptions
                });
            }

            scope.mapFees = function () {
                scope.chargeOptions = scope.product.chargeOptions || [];
                scope.specificIncomeaccounts.push({
                    chargeId: scope.chargeOptions.length > 0 ? scope.chargeOptions[0].id : '',
                    incomeAccountId: scope.incomeAccountOptions.length > 0 ? scope.incomeAccountOptions[0].id : '',
                    chargeOptions: scope.chargeOptions,
                    incomeAccountOptions: scope.incomeAccountOptions
                });
            }

            scope.mapPenalty = function () {
                scope.penaltyOptions =  scope.product.penaltyOptions || [];
                scope.penaltySpecificIncomeaccounts.push({
                    chargeId: scope.penaltyOptions.length > 0 ? scope.penaltyOptions[0].id : '',
                    incomeAccountId: scope.incomeAccountOptions.length > 0 ? scope.incomeAccountOptions[0].id : '',
                    penaltyOptions: scope.penaltyOptions,
                    incomeAccountOptions: scope.incomeAccountOptions
                });
            }

            scope.deleteFund = function (index) {
                scope.configureFundOptions.splice(index, 1);
            }

            scope.deleteFee = function (index) {
                scope.specificIncomeaccounts.splice(index, 1);
            }

            scope.deletePenalty = function (index) {
                scope.penaltySpecificIncomeaccounts.splice(index, 1);
            }

            scope.cancel = function () {
                location.path('/viewsavingproduct/' + routeParams.id);
            };

            scope.resetSavingsProductDrawingPowerDetails = function () {
                delete scope.formData.frequencyNthDay;
                delete scope.formData.frequencyDayOfWeekType;
                delete scope.formData.onDayType;
            };

            referenceId = 0;
            scope.addFloatingInterestRateChart = function(){
                referenceId += 1;
                if(scope.floatingInterestRateChart.effectiveFromDate != undefined && scope.floatingInterestRateChart.interestRate != undefined) {
                    reqDate = dateFilter(scope.floatingInterestRateChart.effectiveFromDate, scope.df);
                    temp = {
                        effectiveFromDate: reqDate,
                        interestRate: scope.floatingInterestRateChart.interestRate,
                        referenceId : referenceId
                    };
                    scope.interestRateChart.push(temp);
                    scope.updatedInterestRateChart.push(temp);
                    scope.floatingInterestRateChart.effectiveFromDate = undefined;
                    scope.floatingInterestRateChart.interestRate = undefined;
                }

            };

            scope.deleteInterestChart = function (index) {
                var tempId;
                if (scope.interestRateChart[index].id != undefined) {
                    tempId = scope.interestRateChart[index].id;
                    temp = {
                        id: tempId,
                        delete: true
                    };
                    scope.updatedInterestRateChart.push(temp);
                } else {
                    for (var i in scope.updatedInterestRateChart) {
                        if (scope.updatedInterestRateChart[i].referenceId == scope.interestRateChart[index].referenceId) {
                            scope.updatedInterestRateChart.splice(i, 1);
                        }
                    }
                }
                scope.interestRateChart.splice(index, 1);


            };

            scope.updateList = function (checked) {
                if (checked == "false") {
                    scope.interestRateChart.splice(0, scope.interestRateChart.length);
                    scope.updatedInterestRateChart.splice(0, scope.updatedInterestRateChart.length);
                    scope.formData.isAllowInterestRateChart = false;
                }
            };

            scope.submit = function () {
                if(scope.formData.isAllowInterestRateChart == "true" && scope.interestRateChart.length == 0){
                    scope.errorDetails = [];
                    var errorObj = new Object();
                    errorObj.args = {
                        params: []
                    };
                    errorObj.args.params.push({value: 'error.minimum.one.floatingRateInterestRate.entry.required'});
                    scope.errorDetails.push(errorObj);
                    return;
                }
                this.formData.floatingInterestRateChart = [];
                if (scope.updatedInterestRateChart.length > 0) {
                    for(var i in scope.updatedInterestRateChart){
                        if(scope.updatedInterestRateChart[i].effectiveFromDate != undefined){
                        var actualDate = dateFilter(scope.updatedInterestRateChart[i].effectiveFromDate, scope.df);
                        scope.updatedInterestRateChart[i].effectiveFromDate = actualDate;
                    }
                    }
                    this.formData.floatingInterestRateChart = scope.updatedInterestRateChart;
                }

                scope.paymentChannelToFundSourceMappings = [];
                scope.feeToIncomeAccountMappings = [];
                scope.penaltyToIncomeAccountMappings = [];
                scope.chargesSelected = [];

                var temp = '';

                //configure fund sources for payment channels
                for (var i in scope.configureFundOptions) {
                    temp = {
                        paymentTypeId: scope.configureFundOptions[i].paymentTypeId,
                        fundSourceAccountId: scope.configureFundOptions[i].fundSourceAccountId
                    }
                    scope.paymentChannelToFundSourceMappings.push(temp);
                }

                //map fees to specific income accounts
                for (var i in scope.specificIncomeaccounts) {
                    temp = {
                        chargeId: scope.specificIncomeaccounts[i].chargeId,
                        incomeAccountId: scope.specificIncomeaccounts[i].incomeAccountId
                    }
                    scope.feeToIncomeAccountMappings.push(temp);
                }

                //map penalties to specific income accounts
                for (var i in scope.penaltySpecificIncomeaccounts) {
                    temp = {
                        chargeId: scope.penaltySpecificIncomeaccounts[i].chargeId,
                        incomeAccountId: scope.penaltySpecificIncomeaccounts[i].incomeAccountId
                    }
                    scope.penaltyToIncomeAccountMappings.push(temp);
                }

                for (var i in scope.charges) {
                    temp = {
                        id: scope.charges[i].id
                    }
                    scope.chargesSelected.push(temp);
                }

                this.formData.paymentChannelToFundSourceMappings = scope.paymentChannelToFundSourceMappings;
                this.formData.feeToIncomeAccountMappings = scope.feeToIncomeAccountMappings;
                this.formData.penaltyToIncomeAccountMappings = scope.penaltyToIncomeAccountMappings;
                this.formData.charges = scope.chargesSelected;
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                if(!this.formData.minRequiredOpeningBalance){
                    this.formData.minRequiredOpeningBalance = 0;
                }
                delete this.formData.isAllowInterestRateChart;
                delete scope.errorDetails;
                resourceFactory.savingProductResource.update({savingProductId: routeParams.id}, this.formData, function (data) {
                    location.path('/viewsavingproduct/' + data.resourceId);
                });
            }
        }
    });
    mifosX.ng.application.controller('EditSavingProductController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'CommonUtilService', 'dateFilter', mifosX.controllers.EditSavingProductController]).run(function ($log) {
        $log.info("EditSavingProductController initialized");
    });
}(mifosX.controllers || {}));
