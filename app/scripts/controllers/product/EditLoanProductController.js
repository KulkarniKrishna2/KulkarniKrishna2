(function (module) {
    mifosX.controllers = _.extend(module, {
        EditLoanProductController: function (scope, resourceFactory, location, routeParams, dateFilter, commonUtilService) {
            scope.formData = {};
            scope.restrictDate = new Date();
            scope.charges = [];
            scope.loanProductConfigurableAttributes = [];
            scope.showOrHideValue = "show";
            scope.configureFundOptions = [];
            scope.specificIncomeAccountMapping = [];
            scope.penaltySpecificIncomeaccounts = [];
            scope.codeValueSpecificAccountMappings = [];
            scope.configureFundOption = {};
            scope.date = {};
            scope.irFlag = false;
            scope.pvFlag = false;
            scope.rvFlag = false;
            scope.interestRecalculationOnDayTypeOptions = commonUtilService.onDayTypeOptions();

            scope.INDIVIDUAL_CLIENT = 2;

            scope.minimumPeriodsBetweenDisbursalAndFirstRepaymentShow = false;
            scope.minimumDaysBetweenDisbursalAndFirstRepaymentShow = false;
            scope.minDurationType = [
                {id: '1', name: "DAYS"},
                {id: '2', name: "REPAYMENT"}
            ];
            scope.minimumDaysOrrPeriodsBetweenDisbursalAndFirstRepaymentTypeDefaultValue = scope.minDurationType[0];
            scope.loanTenureFrequencyType = -1;
            scope.configureInterestRatesChart = false;
            scope.interestRate = {};
            scope.canCrossMaturityDateOnFixingEMI = true;
            scope.isLimitTrnache = false;
            resourceFactory.loanProductResource.get({loanProductId: routeParams.id, template: 'true'}, function (data) {
                scope.product = data;
                scope.assetAccountOptions = scope.product.accountingMappingOptions.assetAccountOptions || [];
                scope.incomeAccountOptions = scope.product.accountingMappingOptions.incomeAccountOptions || [];
                scope.expenseAccountOptions = scope.product.accountingMappingOptions.expenseAccountOptions || [];
                scope.liabilityAccountOptions = data.accountingMappingOptions.liabilityAccountOptions || [];
                scope.incomeAndLiabilityAccountOptions = scope.incomeAccountOptions.concat(scope.liabilityAccountOptions);
                scope.penaltyOptions = scope.product.penaltyOptions || [];
                scope.chargeOptions = scope.product.chargeOptions || [];
                scope.paymentTypeOptions = scope.product.paymentTypeOptions || [];
                scope.charges = [];
                for(var i in scope.product.charges){
                    if(scope.product.charges[i].chargeData){
                        var charge = scope.product.charges[i].chargeData;
                        charge.isMandatory = scope.product.charges[i].isMandatory;
                        charge.isAmountNonEditable = scope.product.charges[i].isAmountNonEditable;
                        scope.charges.push(charge);
                    }
                }
                scope.writeOffReasonOptions = [];
                if(angular.isDefined(scope.product.codeValueOptions) && scope.product.codeValueOptions.length>0){
                        scope.writeOffReasonOptions = scope.product.codeValueOptions;  
                }
                if (data.startDate) {
                    scope.date.first = new Date(data.startDate);
                }
                if (data.closeDate) {
                    scope.date.second = new Date(data.closeDate);
                }
                scope.overduecharges = [];
                for (var i in scope.penaltyOptions) {
                    if (scope.penaltyOptions[i].chargeTimeType.code == 'chargeTimeType.overdueInstallment') {
                        scope.overduecharges.push(scope.penaltyOptions[i]);
                    }
                }
                scope.product.interestRecalculationNthDayTypeOptions.push({
                    "code": "onDay",
                    "id": -2,
                    "value": "on day"
                });
                if (scope.product.minimumDaysBetweenDisbursalAndFirstRepayment) {
                    scope.minimumDaysOrrPeriodsBetweenDisbursalAndFirstRepaymentTypeDefaultValue = scope.minDurationType[0];
                    scope.minimumPeriodsBetweenDisbursalAndFirstRepaymentShow = false;
                    scope.minimumDaysBetweenDisbursalAndFirstRepaymentShow = true;
                }
                else {
                    scope.minimumDaysOrrPeriodsBetweenDisbursalAndFirstRepaymentTypeDefaultValue = scope.minDurationType[1];
                    scope.minimumPeriodsBetweenDisbursalAndFirstRepaymentShow = true;
                    scope.minimumDaysBetweenDisbursalAndFirstRepaymentShow = false;
                }

                if(scope.product.loanTenureFrequencyType){
                    scope.loanTenureFrequencyType = scope.product.loanTenureFrequencyType.id;
                }
                if(scope.product.interestRatesListPerPeriod != undefined && scope.product.interestRatesListPerPeriod.length > 0)
                    scope.configureInterestRatesChart = true;
                scope.trancheLoanClosureTypeOptions = scope.product.trancheLoanClosureTypeOptions;
                scope.trancheAmountLimitTypeOptions = scope.product.trancheAmountLimitTypeOptions;
                scope.formData = {
                    name: scope.product.name,
                    shortName: scope.product.shortName,
                    description: scope.product.description,
                    externalId:scope.product.externalId,
                    fundId: scope.product.fundId,
                    applicableForLoanType: scope.product.applicableForLoanType.id,
                    includeInBorrowerCycle: scope.product.includeInBorrowerCycle,
                    useBorrowerCycle: scope.product.useBorrowerCycle,
                    currencyCode: scope.product.currency.code,
                    digitsAfterDecimal: scope.product.currency.decimalPlaces,
                    inMultiplesOf: scope.product.currency.inMultiplesOf,
                    principal: scope.product.principal,
                    minPrincipal: scope.product.minPrincipal,
                    maxPrincipal: scope.product.maxPrincipal,
                    numberOfRepayments: scope.product.numberOfRepayments,
                    minNumberOfRepayments: scope.product.minNumberOfRepayments,
                    maxNumberOfRepayments: scope.product.maxNumberOfRepayments,
                    repaymentEvery: scope.product.repaymentEvery,
                    minLoanTerm : scope.product.minLoanTerm,
                    maxLoanTerm : scope.product.maxLoanTerm,
                    repaymentFrequencyType: scope.product.repaymentFrequencyType.id,
                    interestRatePerPeriod: scope.product.interestRatePerPeriod,
                    interestRatesListPerPeriod: scope.product.interestRatesListPerPeriod,
                    minInterestRatePerPeriod: scope.product.minInterestRatePerPeriod,
                    maxInterestRatePerPeriod: scope.product.maxInterestRatePerPeriod,
                    interestRateFrequencyType: scope.product.interestRateFrequencyType.id,
                    amortizationType: scope.product.amortizationType.id,
                    interestType: scope.product.interestType.id,
                    interestCalculationPeriodType: scope.product.interestCalculationPeriodType.id,
                    allowPartialPeriodInterestCalcualtion: scope.product.allowPartialPeriodInterestCalcualtion,
                    inArrearsTolerance: scope.product.inArrearsTolerance,
                    transactionProcessingStrategyId: scope.product.transactionProcessingStrategyId,
                    graceOnPrincipalPayment: scope.product.graceOnPrincipalPayment,
                    recurringMoratoriumOnPrincipalPeriods: scope.product.recurringMoratoriumOnPrincipalPeriods,
                    graceOnInterestPayment: scope.product.graceOnInterestPayment,
                    graceOnInterestCharged: scope.product.graceOnInterestCharged,
                    graceOnArrearsAgeing: scope.product.graceOnArrearsAgeing,
                    overdueDaysForNPA: scope.product.overdueDaysForNPA,
                    accountMovesOutOfNPAOnlyOnArrearsCompletion: scope.product.accountMovesOutOfNPAOnlyOnArrearsCompletion,
                    stopLoanProcessingOnNpa: scope.product.stopLoanProcessingOnNpa,
                    accountingRule: scope.product.accountingRule.id,
                    principalVariationsForBorrowerCycle: [],
                    interestRateVariationsForBorrowerCycle: [],
                    numberOfRepaymentVariationsForBorrowerCycle: [],
                    multiDisburseLoan: scope.product.multiDisburseLoan,
                    allowNegativeLoanBalance : scope.product.allowNegativeLoanBalance,
                    considerFutureDisbursementsInSchedule : scope.product.considerFutureDisbursementsInSchedule,
                    considerAllDisbursementsInSchedule : scope.product.considerAllDisbursementsInSchedule,
                    maxTrancheCount: scope.product.maxTrancheCount,
                    outstandingLoanBalance: scope.product.outstandingLoanBalance,
                    isEmiBasedOnDisbursements: scope.product.isEmiBasedOnDisbursements,
                    daysInYearType: scope.product.daysInYearType.id,
                    daysInMonthType: scope.product.daysInMonthType.id,
                    isInterestRecalculationEnabled: scope.product.isInterestRecalculationEnabled,
                    holdGuaranteeFunds: scope.product.holdGuaranteeFunds,
                    principalThresholdForLastInstallment: scope.product.principalThresholdForLastInstallment,
                    installmentAmountInMultiplesOf: scope.product.installmentAmountInMultiplesOf,
                    canDefineInstallmentAmount: scope.product.canDefineInstallmentAmount,
                    adjustFirstEMIAmount: scope.product.adjustFirstEMIAmount,
                    adjustInterestForRounding: scope.product.adjustInterestForRounding,
                    adjustedInstallmentInMultiplesOf: scope.product.adjustedInstallmentInMultiplesOf,
                    syncExpectedWithDisbursementDate: scope.product.syncExpectedWithDisbursementDate,
                    closeLoanOnOverpayment: scope.product.closeLoanOnOverpayment,
                    minimumDaysBetweenDisbursalAndFirstRepayment: scope.product.minimumDaysBetweenDisbursalAndFirstRepayment,
                    minimumDaysBetweenApprovalAndDisbursement: scope.product.minimumDaysBetweenApprovalAndDisbursement,
                    minimumPeriodsBetweenDisbursalAndFirstRepayment: scope.product.minimumPeriodsBetweenDisbursalAndFirstRepayment,
                    minimumDaysOrrPeriodsBetweenDisbursalAndFirstRepaymentType: scope.minimumDaysOrrPeriodsBetweenDisbursalAndFirstRepaymentTypeDefaultValue.id,
                    isMinDurationApplicableForAllDisbursements:scope.product.isMinDurationApplicableForAllDisbursements,
                    loanTenureFrequencyType : scope.loanTenureFrequencyType,
                    weeksInYearType : scope.product.weeksInYearType.id,
                    isFlatInterestRate : scope.product.isFlatInterestRate,
                    percentageOfDisbursementToBeTransferred: scope.product.percentageOfDisbursementToBeTransferred,
                    calculateIrr:scope.product.calculateIrr
                };
                if(scope.formData.applicableForLoanType == scope.INDIVIDUAL_CLIENT){
                    scope.formData.isEnableRestrictionForClientProfile = 'false';
                }

                //if (scope.formData.canDefineInstallmentAmount) {
                    scope.canCrossMaturityDateOnFixingEMI = scope.product.canCrossMaturityDateOnFixingEMI;
                //}
                if(scope.product.maxInstalmentAmount != undefined) {
                    scope.formData.maxInstalmentAmount = scope.product.maxInstalmentAmount;
                }
                if (scope.formData.multiDisburseLoan) {
                    if (scope.formData.maxTrancheCount != undefined) {
                        scope.isLimitTrnache = true;
                    }
                    scope.formData.trancheLoanClosureType = scope.product.trancheLoanClosureType.id;
                    scope.formData.trancheAmountLimitType = scope.product.trancheAmountLimitType.id;
                }
                if(scope.product.loanProductEntityProfileMappingDatas && scope.product.loanProductEntityProfileMappingDatas[0]
                    && scope.product.loanProductEntityProfileMappingDatas[0].profileType && scope.product.loanProductEntityProfileMappingDatas[0].profileType.id){
                    var entityProfileMappingData = scope.product.loanProductEntityProfileMappingDatas[0];
                    scope.formData.isEnableRestrictionForClientProfile = 'true';
                    scope.formData.profileType = entityProfileMappingData.profileType.id;
                    scope.loadClientProfileTypeDatas();
                    if(entityProfileMappingData.values && entityProfileMappingData.values.length > 0){
                        scope.availableProfileTypeValues = [];
                        for(var i in entityProfileMappingData.values){
                            scope.availableProfileTypeValues.push(entityProfileMappingData.values[i].id);
                        }
                        scope.addProfileType();
                    };
                };


                if(scope.product.installmentCalculationPeriodType){
                    scope.formData.installmentCalculationPeriodType = scope.product.installmentCalculationPeriodType.id
                }

                if(scope.product.brokenPeriodMethodType){
                    scope.formData.brokenPeriodMethodType = scope.product.brokenPeriodMethodType.id;
                }

                if (scope.product.isInterestRecalculationEnabled) {
                    scope.formData.interestRecalculationCompoundingMethod = scope.product.interestRecalculationData.interestRecalculationCompoundingType.id;
                    scope.formData.rescheduleStrategyMethod = scope.product.interestRecalculationData.rescheduleStrategyType.id;
                    scope.formData.recalculationRestFrequencyType = scope.product.interestRecalculationData.recalculationRestFrequencyType.id;
                    scope.formData.recalculationRestFrequencyInterval = scope.product.interestRecalculationData.recalculationRestFrequencyInterval;
                    scope.formData.isArrearsBasedOnOriginalSchedule = scope.product.interestRecalculationData.isArrearsBasedOnOriginalSchedule;
                    scope.formData.preClosureInterestCalculationStrategy = scope.product.interestRecalculationData.preClosureInterestCalculationStrategy.id;
                    if (scope.product.interestRecalculationData.recalculationRestFrequencyOnDay != null) {
                        scope.formData.recalculationRestFrequencyNthDayType = -2;
                        scope.formData.recalculationRestFrequencyOnDayType = scope.product.interestRecalculationData.recalculationRestFrequencyOnDay;
                    } else {
                        if (scope.product.interestRecalculationData.recalculationRestFrequencyNthDay != null)
                            scope.formData.recalculationRestFrequencyNthDayType = scope.product.interestRecalculationData.recalculationRestFrequencyNthDay.id;
                        if (scope.product.interestRecalculationData.recalculationRestFrequencyWeekday != null)
                            scope.formData.recalculationRestFrequencyDayOfWeekType = scope.product.interestRecalculationData.recalculationRestFrequencyWeekday.id;
                    }
                    if (scope.formData.interestRecalculationCompoundingMethod != 0) {
                        scope.formData.recalculationCompoundingFrequencyType = scope.product.interestRecalculationData.recalculationCompoundingFrequencyType.id;
                        scope.formData.recalculationCompoundingFrequencyInterval = scope.product.interestRecalculationData.recalculationCompoundingFrequencyInterval;
                        if (scope.product.interestRecalculationData.recalculationCompoundingFrequencyOnDay != null) {
                            scope.formData.recalculationCompoundingFrequencyNthDayType = -2;
                            scope.formData.recalculationCompoundingFrequencyOnDayType = scope.product.interestRecalculationData.recalculationCompoundingFrequencyOnDay;
                        } else {
                            if (scope.product.interestRecalculationData.recalculationCompoundingFrequencyNthDay != null)
                                scope.formData.recalculationCompoundingFrequencyNthDayType = scope.product.interestRecalculationData.recalculationCompoundingFrequencyNthDay.id;
                            if (scope.product.interestRecalculationData.recalculationCompoundingFrequencyWeekday != null)
                                scope.formData.recalculationCompoundingFrequencyDayOfWeekType = scope.product.interestRecalculationData.recalculationCompoundingFrequencyWeekday.id;
                        }
                    }
                    if (scope.product.interestRecalculationData.isCompoundingToBePostedAsTransaction) {
                        scope.formData.isCompoundingToBePostedAsTransaction = scope.product.interestRecalculationData.isCompoundingToBePostedAsTransaction;
                    }
                    scope.formData.allowCompoundingOnEod = scope.product.interestRecalculationData.allowCompoundingOnEod;
                    scope.formData.isSubsidyApplicable = scope.product.interestRecalculationData.isSubsidyApplicable;
                }
                if (scope.product.allowAttributeOverrides != null) {
                    scope.amortization = scope.product.allowAttributeOverrides.amortizationType;
                    scope.arrearsTolerance = scope.product.allowAttributeOverrides.inArrearsTolerance;
                    scope.graceOnArrearsAging = scope.product.allowAttributeOverrides.graceOnArrearsAgeing;
                    scope.interestCalcPeriod = scope.product.allowAttributeOverrides.interestCalculationPeriodType;
                    scope.interestMethod = scope.product.allowAttributeOverrides.interestType;
                    scope.graceOnPrincipalAndInterest = scope.product.allowAttributeOverrides.graceOnPrincipalAndInterestPayment;
                    scope.repaymentFrequency = scope.product.allowAttributeOverrides.repaymentEvery;
                    scope.transactionProcessingStrategy = scope.product.allowAttributeOverrides.transactionProcessingStrategyId;
                }
                if (scope.amortization || scope.arrearsTolerance || scope.graceOnArrearsAgeing ||
                    scope.interestCalcPeriod || scope.interestMethod || scope.graceOnPrincipalAndInterest ||
                    scope.repaymentFrequency || scope.transactionProcessingStrategy == true) {
                    scope.allowAttributeConfiguration = true;
                }
                else {
                    scope.allowAttributeConfiguration = false;
                }

                if (scope.product.holdGuaranteeFunds) {
                    scope.formData.mandatoryGuarantee = scope.product.productGuaranteeData.mandatoryGuarantee;
                    scope.formData.minimumGuaranteeFromOwnFunds = scope.product.productGuaranteeData.minimumGuaranteeFromOwnFunds;
                    scope.formData.minimumGuaranteeFromGuarantor = scope.product.productGuaranteeData.minimumGuaranteeFromGuarantor;
                }

                _.each(scope.product.principalVariationsForBorrowerCycle, function (variation) {
                    scope.formData.principalVariationsForBorrowerCycle.push({
                        id: variation.id,
                        borrowerCycleNumber: variation.borrowerCycleNumber,
                        valueConditionType: variation.valueConditionType.id,
                        minValue: variation.minValue,
                        maxValue: variation.maxValue,
                        defaultValue: variation.defaultValue
                    })
                });

                _.each(scope.product.interestRateVariationsForBorrowerCycle, function (variation) {
                    scope.formData.interestRateVariationsForBorrowerCycle.push({
                        id: variation.id,
                        borrowerCycleNumber: variation.borrowerCycleNumber,
                        valueConditionType: variation.valueConditionType.id,
                        minValue: variation.minValue,
                        maxValue: variation.maxValue,
                        defaultValue: variation.defaultValue,
                        interestRatesListPerCycle : variation.loanInterestRatesListPerCycle
                    })
                });

                _.each(scope.product.numberOfRepaymentVariationsForBorrowerCycle, function (variation) {
                    scope.formData.numberOfRepaymentVariationsForBorrowerCycle.push({
                        id: variation.id,
                        borrowerCycleNumber: variation.borrowerCycleNumber,
                        valueConditionType: variation.valueConditionType.id,
                        minValue: variation.minValue,
                        maxValue: variation.maxValue,
                        defaultValue: variation.defaultValue
                    })
                });

                scope.setFlag();
                if (scope.formData.accountingRule == 2 || scope.formData.accountingRule == 3 || scope.formData.accountingRule == 4) {
                    scope.formData.fundSourceAccountId = scope.product.accountingMappings.fundSourceAccount.id;
                    scope.formData.loanPortfolioAccountId = scope.product.accountingMappings.loanPortfolioAccount.id;
                    if (scope.formData.accountingRule == 3 || scope.formData.accountingRule == 4) {
                        scope.formData.receivableInterestAccountId = scope.product.accountingMappings.receivableInterestAccount.id;
                        scope.formData.receivableFeeAccountId = scope.product.accountingMappings.receivableFeeAccount.id;
                        scope.formData.receivablePenaltyAccountId = scope.product.accountingMappings.receivablePenaltyAccount.id;
                    }
                    scope.formData.transfersInSuspenseAccountId = scope.product.accountingMappings.transfersInSuspenseAccount.id;
                    scope.formData.interestOnLoanAccountId = scope.product.accountingMappings.interestOnLoanAccount.id;
                    scope.formData.incomeFromFeeAccountId = scope.product.accountingMappings.incomeFromFeeAccount.id;
                    scope.formData.incomeFromPenaltyAccountId = scope.product.accountingMappings.incomeFromPenaltyAccount.id;
                    scope.formData.incomeFromRecoveryAccountId = scope.product.accountingMappings.incomeFromRecoveryAccount.id;
                    scope.formData.writeOffAccountId = scope.product.accountingMappings.writeOffAccount.id;
                    scope.formData.overpaymentLiabilityAccountId = scope.product.accountingMappings.overpaymentLiabilityAccount.id;
                    if (scope.product.accountingMappings.hasOwnProperty("subsidyFundSourceId") && scope.product.accountingMappings.hasOwnProperty("subsidyAccountId")) {
                        scope.formData.subsidyFundSourceId = scope.product.accountingMappings.subsidyFundSourceId.id;
                        scope.formData.subsidyAccountId = scope.product.accountingMappings.subsidyAccountId.id;
                    } else {
                        scope.formData.createSubsidyAccountMappings = true;
                    }

                    _.each(scope.product.paymentChannelToFundSourceMappings, function (fundSource) {
                        scope.configureFundOptions.push({
                             paymentTypeId: fundSource.paymentType.id,
                            fundSourceAccountId: fundSource.fundSourceAccount.id
                        })
                    });

                   for(var count = 0; count < scope.product.feeToIncomeAccountMappings.length; count++) {
                       if (scope.specificIncomeAccountMapping.length > 0) {
                           if(scope.product.feeToIncomeAccountMappings[count].charge.id == scope.specificIncomeAccountMapping[scope.specificIncomeAccountMapping.length - 1].chargeId){
                               scope.specificIncomeAccountMapping[scope.specificIncomeAccountMapping.length - 1].fundSourceAccountId = scope.product.feeToIncomeAccountMappings[count].incomeAccount.id;
                           }
                           else{
                               scope.specificIncomeAccountMapping.push({
                                   chargeId: scope.product.feeToIncomeAccountMappings[count].charge.id,
                                   incomeAccountId: scope.product.feeToIncomeAccountMappings[count].incomeAccount.id
                               })
                           }
                        }else{
                           scope.specificIncomeAccountMapping.push({
                               chargeId: scope.product.feeToIncomeAccountMappings[count].charge.id,
                               incomeAccountId: scope.product.feeToIncomeAccountMappings[count].incomeAccount.id
                           })
                       }
                   }

                    for(var count = 0; count < scope.product.penaltyToIncomeAccountMappings.length; count++) {
                        if (scope.penaltySpecificIncomeaccounts.length > 0) {
                            if(scope.product.penaltyToIncomeAccountMappings[count].charge.id == scope.penaltySpecificIncomeaccounts[scope.penaltySpecificIncomeaccounts.length - 1].chargeId){
                                scope.penaltySpecificIncomeaccounts[scope.penaltySpecificIncomeaccounts.length - 1].fundSourceAccountId = scope.product.penaltyToIncomeAccountMappings[count].incomeAccount.id;
                            }
                            else{
                                scope.penaltySpecificIncomeaccounts.push({
                                    chargeId: scope.product.penaltyToIncomeAccountMappings[count].charge.id,
                                    incomeAccountId: scope.product.penaltyToIncomeAccountMappings[count].incomeAccount.id
                                })
                            }
                        }else{
                            scope.penaltySpecificIncomeaccounts.push({
                                chargeId: scope.product.penaltyToIncomeAccountMappings[count].charge.id,
                                incomeAccountId: scope.product.penaltyToIncomeAccountMappings[count].incomeAccount.id
                            })
                        }
                    }
                   /* _.each(scope.product.penaltyToIncomeAccountMappings, function (penalty) {
                        scope.penaltySpecificIncomeaccounts.push({
                            chargeId: penalty.charge.id,
                            incomeAccountId: penalty.incomeAccount.id
                        })
                    });*/

                    _.each(scope.product.writeOffReasonsToExpenseAccountMappings, function (codeValues) {
                        scope.codeValueSpecificAccountMappings.push({
                            codeValueId: codeValues.codeValue.id,
                            expenseAccountId: codeValues.expenseAccount.id
                        })
                    });

                    if (scope.formData.accountingRule == 3) {
                        scope.formData.npaInterestSuspenseAccountId = scope.product.accountingMappings.npaInterestSuspenseAccount.id;
                        scope.formData.npaFeeSuspenseAccountId = scope.product.accountingMappings.npaFeeSuspenseAccount.id;
                        scope.formData.npaPenaltySuspenseAccountId = scope.product.accountingMappings.npaPenaltySuspenseAccount.id;
                    }
                }

                scope.formData.isLinkedToFloatingInterestRates = data.isLinkedToFloatingInterestRates;
                scope.formData.floatingRatesId = data.floatingRateId;
                scope.formData.interestRateDifferential = data.interestRateDifferential;
                scope.formData.isFloatingInterestRateCalculationAllowed = data.isFloatingInterestRateCalculationAllowed;
                scope.formData.minDifferentialLendingRate = data.minDifferentialLendingRate;
                scope.formData.defaultDifferentialLendingRate = data.defaultDifferentialLendingRate;
                scope.formData.maxDifferentialLendingRate = data.maxDifferentialLendingRate;
                scope.floatingRateOptions = data.floatingRateOptions;
                scope.formData.allowVariableInstallments = scope.product.allowVariableInstallments;
                scope.formData.minimumGap = scope.product.minimumGap;
                scope.formData.maximumGap = scope.product.maximumGap;
                scope.formData.canUseForTopup = scope.product.canUseForTopup;
                scope.formData.allowUpfrontCollection = scope.product.allowUpfrontCollection;
            });
            scope.variableName = function (minDurationType) {
                if (minDurationType == 1) {
                    scope.minimumDaysBetweenDisbursalAndFirstRepaymentShow = true;
                    scope.minimumPeriodsBetweenDisbursalAndFirstRepaymentShow = false;
                }
                if (minDurationType == 2) {
                    scope.minimumPeriodsBetweenDisbursalAndFirstRepaymentShow = true;
                    scope.minimumDaysBetweenDisbursalAndFirstRepaymentShow = false;
                }
            };
            scope.chargeSelected = function (chargeId) {
                if (chargeId) {
                    resourceFactory.chargeResource.get({
                        chargeId: chargeId,
                        template: 'true'
                    }, this.formData, function (data) {
                        data.chargeId = data.id;
                        scope.charges.push(data);
                        //to charge select box empty
                        scope.chargeId = '';
                        scope.penalityId = '';
                    });
                }
            };

            scope.getCodeValues = function(optionsArray,codeValues){
                var codeValuesData = [];
                    for(var  i=0; i<optionsArray.length;i++){
                        for(var j=0;j<codeValues.length;j++){
                            if(codeValues[j].id==optionsArray[i].id){
                                codeValuesData.push(optionsArray[i]);
                            }
                        }
                    }
                return codeValuesData;
            };

            scope.deleteCharge = function (index) {
                scope.charges.splice(index, 1);
            };

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
                scope.paymentTypeOptions = scope.product.paymentTypeOptions || [];
                scope.configureFundOptions.push({
                    paymentTypeId:  scope.paymentTypeOptions.length > 0 ? scope.paymentTypeOptions[0].id : '',
                    fundSourceAccountId:  scope.assetAccountOptions.length > 0 ? scope.assetAccountOptions[0].id : ''
                });
            };

            scope.mapFees = function () {
                scope.specificIncomeAccountMapping.push({
                    chargeId: scope.chargeOptions.length > 0 ? scope.chargeOptions[0].id : '',
                    incomeAccountId: scope.incomeAndLiabilityAccountOptions.length > 0 ? scope.incomeAndLiabilityAccountOptions[0].id : '',
                    fundSourceAccountId: scope.assetAccountOptions.length > 0 ? scope.assetAccountOptions[0].id : ''
                });
            };

            scope.mapPenalty = function () {
                scope.penaltySpecificIncomeaccounts.push({
                    chargeId: scope.penaltyOptions.length > 0 ? scope.penaltyOptions[0].id : '',
                    incomeAccountId: scope.incomeAccountOptions.length > 0 ? scope.incomeAccountOptions[0].id : ''
                });
            };

            scope.mapWriteOffReason = function () {
                scope.codeValueSpecificAccountMappings.push({
                    codeValueId: scope.writeOffReasonOptions.length > 0 ? scope.writeOffReasonOptions[0].id : '',
                    expenseAccountId:  scope.expenseAccountOptions.length > 0 ? scope.expenseAccountOptions[0].id : ''
                });
            };

            scope.addPrincipalVariation = function () {
                scope.pvFlag = true;
                scope.formData.principalVariationsForBorrowerCycle.push({
                    valueConditionType: scope.product.valueConditionTypeOptions[0].id
                })
            };
            scope.addInterestRateVariation = function () {
                scope.irFlag = true;
                scope.formData.interestRateVariationsForBorrowerCycle.push({
                    valueConditionType: scope.product.valueConditionTypeOptions[0].id
                })
            };
            scope.addNumberOfRepaymentVariation = function () {
                scope.rvFlag = true;
                scope.formData.numberOfRepaymentVariationsForBorrowerCycle.push({
                    valueConditionType: scope.product.valueConditionTypeOptions[0].id
                })
            };


            scope.deleteFund = function (index) {
                scope.configureFundOptions.splice(index, 1);
            };

            scope.deleteFee = function (index) {
                scope.specificIncomeAccountMapping.splice(index, 1);
            };

            scope.deletePenalty = function (index) {
                scope.penaltySpecificIncomeaccounts.splice(index, 1);
            };

            scope.deletePrincipalVariation = function (index) {
                scope.formData.principalVariationsForBorrowerCycle.splice(index, 1);
            }; 

            scope.deleteInterestRateVariation = function (index) {
                scope.formData.interestRateVariationsForBorrowerCycle.splice(index, 1);
            };

            scope.deleterepaymentVariation = function (index) {
                scope.formData.numberOfRepaymentVariationsForBorrowerCycle.splice(index, 1);
            };

            scope.isAccountingEnabled = function () {
                if (scope.formData.accountingRule == 2 || scope.formData.accountingRule == 3 || scope.formData.accountingRule == 4) {
                    return true;
                }
                return false;
            }

            scope.isAccrualAccountingEnabled = function () {
                if (scope.formData.accountingRule == 3 || scope.formData.accountingRule == 4) {
                    return true;
                }
                return false;
            }

            scope.isPeriodicAccrualAccountingEnabled = function () {
                if (scope.formData.accountingRule == 3) {
                    return true;
                }
                return false;
            }

            scope.setFlag = function () {
                if (scope.formData.principalVariationsForBorrowerCycle) {
                    scope.pvFlag = true;
                }
                if (scope.formData.numberOfRepaymentVariationsForBorrowerCycle) {
                    scope.rvFlag = true;
                }
                if (scope.formData.interestRateVariationsForBorrowerCycle) {
                    scope.irFlag = true;
                }
            };
            scope.setFlag();

            scope.setAttributeValues = function () {
                if (scope.allowAttributeConfiguration == false) {
                    scope.amortization = false;
                    scope.arrearsTolerance = false;
                    scope.graceOnArrearsAging = false;
                    scope.interestCalcPeriod = false;
                    scope.interestMethod = false;
                    scope.graceOnPrincipalAndInterest = false;
                    scope.repaymentFrequency = false;
                    scope.transactionProcessingStrategy = false;
                }
            }

            scope.deleteCodeValue = function (index) {
                scope.codeValueSpecificAccountMappings.splice(index, 1);
            };

            scope.addInterest = function(){
                if(scope.formData.interestRatesListPerPeriod == undefined){
                    scope.formData.interestRatesListPerPeriod = [];
                }
                if(scope.interestRate.value != undefined && scope.formData.interestRatesListPerPeriod.indexOf(scope.interestRate.value) < 0){
                        scope.formData.interestRatesListPerPeriod.push(scope.interestRate.value);
                }

                scope.interestRate.value = undefined;
            };

            scope.deleteInterestRateFromList = function(index) {
                scope.formData.interestRatesListPerPeriod.splice(index, 1);
            };

            scope.addInterestPerCycle = function(index){
                scope.formData.interestRateVariationsForBorrowerCycle[index].minValue = null;
                scope.formData.interestRateVariationsForBorrowerCycle[index].maxValue = null;
                   
                if(scope.formData.interestRateVariationsForBorrowerCycle[index].interestRatesListPerCycle == undefined){
                    scope.formData.interestRateVariationsForBorrowerCycle[index].interestRatesListPerCycle =   [];
                }
        
                if(scope.formData.interestRateVariationsForBorrowerCycle[index].tempValue != undefined && scope.formData.interestRateVariationsForBorrowerCycle[index].interestRatesListPerCycle.indexOf(scope.formData.interestRateVariationsForBorrowerCycle[index].tempValue) <0){
                    scope.formData.interestRateVariationsForBorrowerCycle[index].interestRatesListPerCycle.push(scope.formData.interestRateVariationsForBorrowerCycle[index].tempValue);
                }

                scope.formData.interestRateVariationsForBorrowerCycle[index].tempValue = undefined
            };

            scope.deleteInterestFromCycle = function(index,indexOfinterestRate) {
                scope.formData.interestRateVariationsForBorrowerCycle[index].interestRatesListPerCycle.splice(indexOfinterestRate, 1);
            }

            scope.resetApplicableForLoanTypeData = function () {
                scope.availableProfileTypeValues = [];
                scope.availableProfileTypeValuesOptions = [];
                scope.selectedProfileTypeValues = [];
                scope.selectedProfileTypeValuesOptions = [];
                scope.formData.isEnableRestrictionForClientProfile = false;
                scope.formData.profileType = undefined;
            };

            scope.loadClientProfileTypeDatas = function () {
                scope.availableProfileTypeValues = [];
                scope.availableProfileTypeValuesOptions = [];
                scope.selectedProfileTypeValues = [];
                scope.selectedProfileTypeValuesOptions = [];
                if (scope.formData.profileType == 1) {
                    var legalFormOptions = [];
                    angular.copy(scope.product.templateData.legalFormOptions,legalFormOptions);
                    for (var i in legalFormOptions) {
                        var legal = {};
                        legal.id = legalFormOptions[i].id;
                        legal.name = legalFormOptions[i].value;
                        scope.availableProfileTypeValuesOptions.push(legal);
                    }
                } else if (scope.formData.profileType == 2) {
                    angular.copy(scope.product.templateData.clientTypeOptions,scope.availableProfileTypeValuesOptions);
                } else if (scope.formData.profileType == 3) {
                    angular.copy(scope.product.templateData.clientClassificationOptions,scope.availableProfileTypeValuesOptions);
                }
            };

            scope.addProfileType = function () {
                for (var i in scope.availableProfileTypeValues) {
                    for (var j in scope.availableProfileTypeValuesOptions) {
                        if (scope.availableProfileTypeValuesOptions[j].id == scope.availableProfileTypeValues[i]) {
                            var temp = {};
                            temp.id = scope.availableProfileTypeValues[i];
                            temp.name = scope.availableProfileTypeValuesOptions[j].name;
                            scope.selectedProfileTypeValuesOptions.push(temp);
                            scope.availableProfileTypeValuesOptions.splice(j, 1);
                        }
                    }
                }
                for (var i in scope.availableProfileTypeValues) {
                    for (var j in scope.selectedProfileTypeValuesOptions) {
                        if (scope.selectedProfileTypeValuesOptions[j].id == scope.availableProfileTypeValues[i]) {
                            scope.availableProfileTypeValues.splice(i, 1);
                        }
                    }
                }
            };

            scope.removeProfileType = function () {
                for (var i in scope.selectedProfileTypeValues) {
                    for (var j in scope.selectedProfileTypeValuesOptions) {
                        if (scope.selectedProfileTypeValuesOptions[j].id == scope.selectedProfileTypeValues[i]) {
                            var temp = {};
                            temp.id = scope.selectedProfileTypeValues[i];
                            temp.name = scope.selectedProfileTypeValuesOptions[j].name;
                            scope.availableProfileTypeValuesOptions.push(temp);
                            scope.selectedProfileTypeValuesOptions.splice(j, 1);
                        }
                    }
                }
                for (var i in scope.selectedProfileTypeValues) {
                    for (var j in scope.availableProfileTypeValuesOptions) {
                        if (scope.availableProfileTypeValuesOptions[j].id == scope.selectedProfileTypeValues[i]) {
                            scope.selectedProfileTypeValues.splice(i, 1);
                        }
                    }
                }
            };

            scope.changeStatus = function() {
                if(scope.formData.isLinkedToFloatingInterestRates ==  true){
                    scope.configureInterestRatesChart = false;
                }
            };

            scope.submit = function () {
                if(this.formData.multiDisburseLoan == false) {
                    this.formData.allowNegativeLoanBalance = false;
                    this.formData.considerFutureDisbursementsInSchedule = false;
                    this.formData.considerAllDisbursementsInSchedule = false;
                    if(this.formData.maxTrancheCount != undefined){
                        delete this.formData.maxTrancheCount;
                    }
                } else if (!scope.isLimitTrnache) {
                    this.formData.maxTrancheCount = null;
                }
                if (this.formData.trancheLoanClosureType == undefined) {
                    delete this.formData.trancheLoanClosureType;
                }

                if (this.formData.trancheAmountLimitType == undefined) {
                    delete this.formData.trancheAmountLimitType;
                }
                if (this.formData.canDefineInstallmentAmount) {
                    this.formData.canCrossMaturityDateOnFixingEMI = scope.canCrossMaturityDateOnFixingEMI;
                }

                scope.paymentChannelToFundSourceMappings = [];
                scope.feeToIncomeAccountMappings = [];
                scope.penaltyToIncomeAccountMappings = [];
                scope.codeValueSpecificAccountMapping = [];
                scope.chargesSelected = [];
                scope.selectedConfigurableAttributes = [];
                var reqFirstDate = dateFilter(scope.date.first, scope.df);
                var reqSecondDate = dateFilter(scope.date.second, scope.df);
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
                for (var i in scope.specificIncomeAccountMapping) {
                    temp = {
                        chargeId: scope.specificIncomeAccountMapping[i].chargeId,
                        incomeAccountId: scope.specificIncomeAccountMapping[i].incomeAccountId,
                        fundSourceAccountId: scope.specificIncomeAccountMapping[i].fundSourceAccountId
                    }
                    scope.feeToIncomeAccountMappings.push(temp);
                }

                //map penalties to specific income accounts
                for (var i in scope.penaltySpecificIncomeaccounts) {
                    temp = {
                        chargeId: scope.penaltySpecificIncomeaccounts[i].chargeId,
                        incomeAccountId: scope.penaltySpecificIncomeaccounts[i].incomeAccountId,
                        fundSourceAccountId: scope.penaltySpecificIncomeaccounts[i].fundSourceAccountId
                    }
                    scope.penaltyToIncomeAccountMappings.push(temp);
                }

                //map code value to specific expense accounts
                for (var i in scope.codeValueSpecificAccountMappings) {
                    temp = {
                        codeValueId: scope.codeValueSpecificAccountMappings[i].codeValueId,
                        expenseAccountId: scope.codeValueSpecificAccountMappings[i].expenseAccountId
                    }
                    scope.codeValueSpecificAccountMapping.push(temp);

                }

                for (var i in scope.charges) {
                    var isMandatory = false;
                    var isAmountNonEditable = false;
                    if(scope.charges[i].isMandatory){
                        isMandatory = scope.charges[i].isMandatory;
                    }
                    if (scope.charges[i].isAmountNonEditable) {
                        isAmountNonEditable = scope.charges[i].isAmountNonEditable;
                    }
                    temp = {
                        id: scope.charges[i].id,
                        isMandatory: isMandatory,
                        isAmountNonEditable : isAmountNonEditable
                    }
                    scope.chargesSelected.push(temp);
                }

                if (scope.allowAttributeConfiguration == false) {
                    scope.amortization = false;
                    scope.arrearsTolerance = false;
                    scope.graceOnArrearsAging = false;
                    scope.interestCalcPeriod = false;
                    scope.interestMethod = false;
                    scope.graceOnPrincipalAndInterest = false;
                    scope.repaymentFrequency = false;
                    scope.transactionProcessingStrategy = false;
                }

                scope.selectedConfigurableAttributes =
                {
                    amortizationType: scope.amortization,
                    interestType: scope.interestMethod,
                    transactionProcessingStrategyId: scope.transactionProcessingStrategy,
                    interestCalculationPeriodType: scope.interestCalcPeriod,
                    inArrearsTolerance: scope.arrearsTolerance,
                    repaymentEvery: scope.repaymentFrequency,
                    graceOnPrincipalAndInterestPayment: scope.graceOnPrincipalAndInterest,
                    graceOnArrearsAgeing: scope.graceOnArrearsAging
                };

                this.formData.paymentChannelToFundSourceMappings = scope.paymentChannelToFundSourceMappings;
                this.formData.feeToIncomeAccountMappings = scope.feeToIncomeAccountMappings;
                this.formData.penaltyToIncomeAccountMappings = scope.penaltyToIncomeAccountMappings;
                this.formData.charges = scope.chargesSelected;
                this.formData.allowAttributeOverrides = scope.selectedConfigurableAttributes;
                this.formData.codeValueSpecificAccountMapping = scope.codeValueSpecificAccountMapping;
                this.formData.dateFormat = scope.df;
                this.formData.locale = scope.optlang.code;
                this.formData.startDate = reqFirstDate;
                this.formData.closeDate = reqSecondDate;

                //Interest recalculation data
                if (this.formData.isInterestRecalculationEnabled) {
                    var restFrequencyDate = dateFilter(scope.date.recalculationRestFrequencyDate, scope.df);
                    scope.formData.recalculationRestFrequencyDate = restFrequencyDate;
                    var compoundingFrequencyDate = dateFilter(scope.date.recalculationCompoundingFrequencyDate, scope.df);
                    scope.formData.recalculationCompoundingFrequencyDate = compoundingFrequencyDate;
                } else {
                    delete scope.formData.interestRecalculationCompoundingMethod;
                    delete scope.formData.rescheduleStrategyMethod;
                    delete scope.formData.recalculationRestFrequencyType;
                    delete scope.formData.recalculationRestFrequencyInterval;
                }

                if (scope.configureInterestRatesChart == false) {
                    this.formData.interestRatesListPerPeriod = [];
                    if(scope.irFlag == true){
                        for(var i =0 ; i < this.formData.interestRateVariationsForBorrowerCycle.length ; i++) {
                            this.formData.interestRateVariationsForBorrowerCycle[i].interestRatesListPerCycle = [];
                        }
                    }
                }
                else {
                    this.formData.minInterestRatePerPeriod = null;
                    this.formData.maxInterestRatePerPeriod = null;
                     if(scope.irFlag == true){
                        for(var i =0 ; i < this.formData.interestRateVariationsForBorrowerCycle.length ; i++) {
                            this.formData.interestRateVariationsForBorrowerCycle[i].minValue = null;
                            this.formData.interestRateVariationsForBorrowerCycle[i].maxValue = null;
                        }
                    }
                    if(scope.formData.isLinkedToFloatingInterestRates == true){
                        this.formData.interestRatesListPerPeriod = [];
                    }
                }
                
                if (this.formData.interestRatesListPerPeriod != undefined) {
                    if (this.formData.interestRatesListPerPeriod.length < 1) {
                        this.formData.interestRatesListPerPeriod = [];
                    }
                }

                if (this.formData.isLinkedToFloatingInterestRates) {
                    delete scope.formData.interestRatePerPeriod;
                    delete scope.formData.minInterestRatePerPeriod;
                    delete scope.formData.maxInterestRatePerPeriod;
                    delete scope.formData.interestRateFrequencyType;
                } else {
                    delete scope.formData.floatingRatesId;
                    delete scope.formData.interestRateDifferential;
                    delete scope.formData.isFloatingInterestRateCalculationAllowed;
                    delete scope.formData.minDifferentialLendingRate;
                    delete scope.formData.defaultDifferentialLendingRate;
                    delete scope.formData.maxDifferentialLendingRate;

                }

                //If Variable Installments is not allowed for this product, remove the corresponding formData
                if (!this.formData.allowVariableInstallments) {
                    delete scope.formData.minimumGap;
                    delete scope.formData.maximumGap;
                }

                if (this.formData.interestCalculationPeriodType == 0) {
                    this.formData.allowPartialPeriodInterestCalcualtion = false;
                }
                if (this.formData.recalculationCompoundingFrequencyType == 4) {
                    if (this.formData.recalculationCompoundingFrequencyNthDayType == -2) {
                        delete this.formData.recalculationCompoundingFrequencyNthDayType;
                        delete this.formData.recalculationCompoundingFrequencyDayOfWeekType;
                    } else {
                        delete this.formData.recalculationCompoundingFrequencyOnDayType;
                    }
                } else if (this.formData.recalculationCompoundingFrequencyType == 3) {
                    delete this.formData.recalculationCompoundingFrequencyOnDayType;
                    delete this.formData.recalculationCompoundingFrequencyNthDayType;
                }

                if (this.formData.recalculationRestFrequencyType == 4) {
                    if (this.formData.recalculationRestFrequencyNthDayType == -2) {
                        delete this.formData.recalculationRestFrequencyNthDayType;
                        delete this.formData.recalculationRestFrequencyDayOfWeekType;
                    } else {
                        delete this.formData.recalculationRestFrequencyOnDayType;
                    }
                } else if (this.formData.recalculationRestFrequencyType == 3) {
                    delete this.formData.recalculationRestFrequencyOnDayType;
                    delete this.formData.recalculationRestFrequencyNthDayType;
                }
                if (!this.formData.isSubsidyApplicable) {
                    //delete this.formData.isSubsidyApplicable ;
                    delete scope.formData.subsidyFundSourceId;
                    delete scope.formData.subsidyAccountId;
                }

                if (this.formData.adjustFirstEMIAmount) {
                    this.formData.adjustInterestForRounding = true;
                }

                if (this.formData.minimumDaysBetweenDisbursalAndFirstRepayment > 0 && this.formData.minimumDaysOrrPeriodsBetweenDisbursalAndFirstRepaymentType == 1) {
                    this.formData.minimumPeriodsBetweenDisbursalAndFirstRepayment = null;
                }
                if (this.formData.minimumDaysBetweenDisbursalAndFirstRepayment > 0 && this.formData.minimumDaysOrrPeriodsBetweenDisbursalAndFirstRepaymentType == 2) {
                    this.formData.minimumDaysBetweenDisbursalAndFirstRepayment = null;
                }
                if (this.formData.minimumPeriodsBetweenDisbursalAndFirstRepayment > 0 && this.formData.minimumDaysOrrPeriodsBetweenDisbursalAndFirstRepaymentType == 2) {
                    this.formData.minimumDaysBetweenDisbursalAndFirstRepayment = null;
                }
                if (this.formData.minimumPeriodsBetweenDisbursalAndFirstRepayment > 0 && this.formData.minimumDaysOrrPeriodsBetweenDisbursalAndFirstRepaymentType == 1) {
                    this.formData.minimumPeriodsBetweenDisbursalAndFirstRepayment = null;
                }
                if (this.formData.minimumDaysOrrPeriodsBetweenDisbursalAndFirstRepaymentType) {
                    delete this.formData.minimumDaysOrrPeriodsBetweenDisbursalAndFirstRepaymentType;
                }

                if (!this.formData.minLoanTerm) {
                    this.formData.minLoanTerm = null;
                }
                if (!this.formData.maxLoanTerm) {
                    this.formData.maxLoanTerm = null;
                }
                if (!this.formData.minNumberOfRepayments) {
                    this.minNumberOfRepayments = null;
                }
                if (!this.formData.maxNumberOfRepayments) {
                    this.maxNumberOfRepayments = null;
                }
                if (this.formData.minLoanTerm == null && this.formData.maxLoanTerm == null &&
                    this.formData.loanTenureFrequencyType != null) {
                    this.formData.loanTenureFrequencyType = null;
                }

                this.formData.selectedProfileTypeValues = undefined;
                if (this.formData.isEnableRestrictionForClientProfile && this.formData.isEnableRestrictionForClientProfile.toString() == 'true') {
                    if (scope.selectedProfileTypeValuesOptions && scope.selectedProfileTypeValuesOptions.length > 0) {
                        this.formData.selectedProfileTypeValues = [];
                        for (var i in scope.selectedProfileTypeValuesOptions) {
                            this.formData.selectedProfileTypeValues.push(scope.selectedProfileTypeValuesOptions[i].id);
                        }
                    }
                }

                resourceFactory.loanProductResource.put({loanProductId: routeParams.id}, this.formData, function (data) {
                    location.path('/viewloanproduct/' + data.resourceId);
                });
            }
        }
    });
    mifosX.ng.application.controller('EditLoanProductController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', 'CommonUtilService', mifosX.controllers.EditLoanProductController]).run(function ($log) {
        $log.info("EditLoanProductController initialized");
    });
}(mifosX.controllers || {}));
