(function (module) {
    mifosX.controllers = _.extend(module, {
        EditLoanProductController: function ($controller, scope, resourceFactory, location, routeParams, dateFilter, commonUtilService) {
            angular.extend(this, $controller('CommonLoanProductController', {$scope: scope}));

            scope.action = routeParams.action;
            if (routeParams.action && routeParams.action === 'clone') {
                scope.isCloneLoanProduct = true;
            };

            scope.formData = {};
            scope.restrictDate = new Date();
            scope.charges = [];
            scope.chargesAppplicableToLoanProduct = [];
            scope.loanProductConfigurableAttributes = [];
            scope.showOrHideValue = "show";
            scope.configureFundOptions = [];
            scope.specificIncomeAccountMapping = [];
            scope.penaltySpecificIncomeaccounts = [];
            scope.codeValueSpecificAccountMappings = [];
            scope.transactionTypeMappings = [];
            scope.repeatsOnDayOfMonthOptions = [];
            scope.selectedOnDayOfMonthOptions = [];
            scope.configureFundOption = {};
            scope.date = {};
            scope.irFlag = false;
            scope.pvFlag = false;
            scope.rvFlag = false;
            scope.tlFlag = false;
            scope.eventBasedFee = 51;
            scope.interestRecalculationOnDayTypeOptions = commonUtilService.onDayTypeOptions();

            scope.INDIVIDUAL_CLIENT = 2;
            scope.isInterestRateDiscountAllowed = true;
            scope.minimumPeriodsBetweenDisbursalAndFirstRepaymentShow = false;
            scope.minimumDaysBetweenDisbursalAndFirstRepaymentShow = false;
            scope.maxPeriodsBetweenDisbursalAndFirstRepaymentShow = false;
            scope.maxDaysBetweenDisbursalAndFirstRepaymentShow = false;
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
            scope.allowBankAccountsForGroups = scope.isSystemGlobalConfigurationEnabled('allow-bank-account-for-groups');
            scope.allowDisbursalToGroupBankAccount = scope.isSystemGlobalConfigurationEnabled('allow-multiple-bank-disbursal');
            scope.allowLoanProductForGroupBankAccount = (scope.allowBankAccountsForGroups && scope.allowDisbursalToGroupBankAccount);
            var deleteFeeAccountMappings = [];
            var deletePenaltyAccountMappings = [];
            scope.transactionTypeMappings = [];
            scope.interestReceivableLabel = "label.input.receivableinterest";
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.loanproduct && scope.response.uiDisplayConfigurations.loanproduct.isHiddenField) {
                scope.isIRDEnabledConfig = !scope.response.uiDisplayConfigurations.loanproduct.isHiddenField.isIRDEnabledConfig;
            }

            resourceFactory.loanProductResource.get({loanProductId: routeParams.id, template: 'true'}, function (data) {
                console.log(data);
                scope.product = data;
                scope.changelabel(scope.product.isPostIRDEnabled);
                scope.assetAccountOptions = scope.product.accountingMappingOptions.assetAccountOptions || [];
                scope.incomeAccountOptions = scope.product.accountingMappingOptions.incomeAccountOptions || [];
                scope.expenseAccountOptions = scope.product.accountingMappingOptions.expenseAccountOptions || [];
                scope.liabilityAccountOptions = data.accountingMappingOptions.liabilityAccountOptions || [];
                scope.incomeAndLiabilityAccountOptions = scope.incomeAccountOptions.concat(scope.liabilityAccountOptions);
                scope.assetAndLiabilityAccountOptions = scope.assetAccountOptions.concat(scope.liabilityAccountOptions);
                scope.assetLiabilityAndIncomeAccountOptions = scope.assetAndLiabilityAccountOptions.concat(scope.incomeAccountOptions);
                if (scope.allowAllGLTypes) {
                    scope.glAccounts = scope.assetLiabilityAndIncomeAccountOptions.concat(scope.expenseAccountOptions) || [];
                    scope.assetAccountOptions = scope.glAccounts;
                    scope.incomeAccountOptions = scope.glAccounts;
                    scope.expenseAccountOptions = scope.glAccounts;
                    scope.liabilityAccountOptions = scope.glAccounts;
                    scope.incomeAndLiabilityAccountOptions = scope.glAccounts;
                    scope.assetAndLiabilityAccountOptions = scope.glAccounts;
                    scope.assetLiabilityAndIncomeAccountOptions = scope.glAccounts;
                }
                scope.isInterestRateDiscountAllowed = scope.product.isInterestRateDiscountingEnabled;
                scope.penaltyOptions = scope.product.penaltyOptions || [];
                scope.chargeOptions = [];
                scope.eventBasedChargeOptions = [];
                for (var i in scope.product.chargeOptions) {
                    var tempCharge = scope.product.chargeOptions[i];
                    if(!tempCharge.penalty){
                        if(tempCharge.chargeTimeType.id==scope.eventBasedFee) {
                            scope.eventBasedChargeOptions.push(tempCharge);
                        } else {
                            scope.chargeOptions.push(tempCharge);
                        }
                    }
                }
                scope.paymentTypeOptions = scope.product.paymentTypeOptions || [];
                scope.charges = [];
                scope.transactionTypeOptions = data.transactionTypeOptions;
                angular.copy(scope.chargeOptions, scope.chargesAppplicableToLoanProduct);
                for(var i in scope.product.charges){
                    if(scope.product.charges[i].chargeData){
                        var charge = scope.product.charges[i].chargeData;
                        charge.isMandatory = scope.product.charges[i].isMandatory;
                        charge.isAmountNonEditable = scope.product.charges[i].isAmountNonEditable;
                        scope.charges.push(charge);
                        for (var i = 0; i < scope.chargeOptions.length; i++) {
                            if (scope.chargeOptions[i].id == charge.id && charge.chargeTimeType.code != "chargeTimeType.specifiedDueDate") {
                                scope.chargesAppplicableToLoanProduct.splice(i, 1);  //removes 1 element at position i
                                break;
                            }
                        }
                    }
                }
                for(var i in scope.product.eventBasedCharges){
                    scope.charges.push(scope.product.eventBasedCharges[i].chargeData);
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
                if (scope.product.minimumDaysBetweenDisbursalAndFirstRepayment || scope.product.maxDaysBetweenDisbursalAndFirstRepayment) {
                    scope.minimumDaysOrrPeriodsBetweenDisbursalAndFirstRepaymentTypeDefaultValue = scope.minDurationType[0];
                    scope.minimumPeriodsBetweenDisbursalAndFirstRepaymentShow = false;
                    scope.maxPeriodsBetweenDisbursalAndFirstRepaymentShow = false;
                    scope.minimumDaysBetweenDisbursalAndFirstRepaymentShow = true;
                    scope.maxDaysBetweenDisbursalAndFirstRepaymentShow = true;
                }
                else {
                    scope.minimumDaysOrrPeriodsBetweenDisbursalAndFirstRepaymentTypeDefaultValue = scope.minDurationType[1];
                    scope.minimumPeriodsBetweenDisbursalAndFirstRepaymentShow = true;
                    scope.maxPeriodsBetweenDisbursalAndFirstRepaymentShow = true;
                    scope.minimumDaysBetweenDisbursalAndFirstRepaymentShow = false;
                    scope.maxDaysBetweenDisbursalAndFirstRepaymentShow = false;
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
                    excludeAdjustedRoundedAmountWithInterest: scope.product.excludeAdjustedRoundedAmountWithInterest,
                    precloseEmiRounding: scope.product.precloseEmiRounding,
                    adjustedInstallmentInMultiplesOf: scope.product.adjustedInstallmentInMultiplesOf,
                    syncExpectedWithDisbursementDate: scope.product.syncExpectedWithDisbursementDate,
                    closeLoanOnOverpayment: scope.product.closeLoanOnOverpayment,
                    minimumDaysBetweenDisbursalAndFirstRepayment: scope.product.minimumDaysBetweenDisbursalAndFirstRepayment,
                    maxDaysBetweenDisbursalAndFirstRepayment: scope.product.maxDaysBetweenDisbursalAndFirstRepayment,
                    minimumDaysBetweenApprovalAndDisbursement: scope.product.minimumDaysBetweenApprovalAndDisbursement,
                    minimumPeriodsBetweenDisbursalAndFirstRepayment: scope.product.minimumPeriodsBetweenDisbursalAndFirstRepayment,
                    maxPeriodsBetweenDisbursalAndFirstRepayment: scope.product.maxPeriodsBetweenDisbursalAndFirstRepayment,
                    minimumDaysOrrPeriodsBetweenDisbursalAndFirstRepaymentType: scope.minimumDaysOrrPeriodsBetweenDisbursalAndFirstRepaymentTypeDefaultValue.id,
                    isMinDurationApplicableForAllDisbursements:scope.product.isMinDurationApplicableForAllDisbursements,
                    loanTenureFrequencyType : scope.loanTenureFrequencyType,
                    weeksInYearType : scope.product.weeksInYearType.id,
                    isFlatInterestRate : scope.product.isFlatInterestRate,
                    considerTenureForIRRCalculation : scope.product.considerTenureForIRRCalculation,
                    percentageOfDisbursementToBeTransferred: scope.product.percentageOfDisbursementToBeTransferred,
                    calculateIrr:scope.product.calculateIrr,
                    isRepaymentAtDisbursement:scope.product.isRepaymentAtDisbursement,
                    borrowerCycleType : scope.product.borrowerCycleType.id,
                    isOverdueAccountingEnabled: scope.product.isOverdueAccountingEnabled,
                    isIRDEnabled: scope.product.isPostIRDEnabled,
                    loanProductGroupId:scope.product.loanProductGroupId,
                    isGlim: scope.product.isGlim,
                    disableAdjustExcessAmount:scope.product.disableAdjustedExcessAmount,
                    brokenPeriodInterestCollectAtDisbursement:scope.product.brokenPeriodInterestCollectAtDisbursement,
                    noOfAdvEmiCollection:scope.product.noOfAdvEmiCollection
                };

                if(scope.product.brokenPeriodDaysInYearType){
                   scope.formData.brokenPeriodDaysInYearType = scope.product.brokenPeriodDaysInYearType.id;
                }
                if(scope.product.brokenPeriodDaysInMonthType){
                    scope.formData.brokenPeriodDaysInMonthType = scope.product.brokenPeriodDaysInMonthType.id;
                }

                if(scope.product.partialPeriodType){
                    scope.existingPartialPeriodType = angular.copy(scope.product.partialPeriodType.id);
                    scope.formData.partialPeriodType = scope.product.partialPeriodType.id;
                }

                if(scope.product.isRepaymentAtDisbursement && scope.product.paymentTypeForRepaymentAtDisbursement){
                    scope.formData.paymentTypeIdForRepaymentAtDisbursement = scope.product.paymentTypeForRepaymentAtDisbursement.id;
                }
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

                scope.formData.isUpfrontInterestEnabled = scope.product.isUpfrontInterestEnabled;

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
                    scope.formData.allowScheduleAfterMaturity = scope.product.interestRecalculationData.allowScheduleAfterMaturity;
                    if(scope.product.interestRecalculationData.compoundingStartDayType){
                        scope.formData.compoundingStartDayType = scope.product.interestRecalculationData.compoundingStartDayType.id;
                    }
                    if (scope.formData.allowScheduleAfterMaturity == true) {
                        scope.formData.frequencyAfterMaturityType = scope.product.interestRecalculationData.frequencyAfterMaturityType.id;
                        scope.formData.frequencyAfterMaturityInterval = scope.product.interestRecalculationData.frequencyAfterMaturityInterval;
                        if (scope.product.interestRecalculationData.frequencyAfterMaturityOnDay != null) {
                            scope.formData.frequencyAfterMaturityNthDayType = -2;
                            scope.formData.frequencyAfterMaturityOnDay = scope.product.interestRecalculationData.frequencyAfterMaturityOnDay;
                        } else {
                            if (scope.product.interestRecalculationData.frequencyAfterMaturityNthDayType != null)
                                scope.formData.frequencyAfterMaturityNthDayType = scope.product.interestRecalculationData.frequencyAfterMaturityNthDayType.id;
                            if (scope.product.interestRecalculationData.frequencyAfterMaturityDayOfWeekType != null)
                                scope.formData.frequencyAfterMaturityDayOfWeekType = scope.product.interestRecalculationData.frequencyAfterMaturityDayOfWeekTypeid;
                        }
                    }

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
                    if (scope.formData.isOverdueAccountingEnabled) {
                        scope.formData.overdueLoanPortfolioAccountId = scope.product.accountingMappings.overdueLoanPortfolioAccount.id;
                        scope.formData.overdueReceivableInterestAccountId = scope.product.accountingMappings.overdueReceivableInterestAccount.id;
                        scope.formData.overdueReceivableFeeAccountId = scope.product.accountingMappings.overdueReceivableFeeAccount.id;
                        scope.formData.overdueReceivablePenaltyAccountId = scope.product.accountingMappings.overdueReceivablePenaltyAccount.id;
                    }
                    if (scope.formData.accountingRule == 3 || scope.formData.accountingRule == 4) {
                        scope.formData.receivableInterestAccountId = scope.product.accountingMappings.receivableInterestAccount.id;
                        scope.formData.receivableFeeAccountId = scope.product.accountingMappings.receivableFeeAccount.id;
                        scope.formData.receivablePenaltyAccountId = scope.product.accountingMappings.receivablePenaltyAccount.id;
                        if (scope.formData.isIRDEnabled) {
                            scope.formData.interestReceivableAndDueAccountId = scope.product.accountingMappings.interestReceivableAndDueAccount.id;
                        }
                    }
                    scope.formData.lossGainWithAdjustmentAccountId = scope.product.accountingMappings.lossGainWithAdjustmentAccount.id;
                    scope.formData.transfersInSuspenseAccountId = scope.product.accountingMappings.transfersInSuspenseAccount.id;
                    scope.formData.valueDateSuspenseAccountId = scope.product.accountingMappings.valueDateSuspenseAccount.id;
                    scope.formData.valueDateSuspensePayableAccountId = scope.product.accountingMappings.valueDateSuspensePayableAccount.id;
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
                    if(scope.product.accountingMappings.hasOwnProperty("excessPaymentLiabilityAccount")){
                      scope.formData.excessPaymentLiabilityAccountId = scope.product.accountingMappings.excessPaymentLiabilityAccount.id;  
                    }
                    if(scope.product.accountingMappings.hasOwnProperty("upfrontInterestLiabilityAccount")){
                        scope.formData.upfrontInterestLiabilityAccountId =scope.product.accountingMappings.upfrontInterestLiabilityAccount.id;
                    }

                    _.each(scope.product.paymentChannelToFundSourceMappings, function (fundSource) {
                        scope.configureFundOptions.push({
                             paymentTypeId: fundSource.paymentType.id,
                            fundSourceAccountId: fundSource.fundSourceAccount.id
                        })
                    });

                   if(!_.isUndefined(scope.product.feeToIncomeAccountMappings)) {
                       for (var count = 0; count < scope.product.feeToIncomeAccountMappings.length; count++) {
                           if (scope.specificIncomeAccountMapping.length > 0) {
                               if (scope.product.feeToIncomeAccountMappings[count].charge.id == scope.specificIncomeAccountMapping[scope.specificIncomeAccountMapping.length - 1].chargeId) {
                                   scope.specificIncomeAccountMapping[scope.specificIncomeAccountMapping.length - 1].fundSourceAccountId = scope.product.feeToIncomeAccountMappings[count].incomeAccount.id;
                               }
                               else {
                                   scope.specificIncomeAccountMapping.push({
                                       chargeId: scope.product.feeToIncomeAccountMappings[count].charge.id,
                                       incomeAccountId: scope.product.feeToIncomeAccountMappings[count].incomeAccount.id
                                   })
                               }
                           } else {
                               scope.specificIncomeAccountMapping.push({
                                   chargeId: scope.product.feeToIncomeAccountMappings[count].charge.id,
                                   incomeAccountId: scope.product.feeToIncomeAccountMappings[count].incomeAccount.id
                               })
                           }
                       }
                   }

                   scope.isNotAllowedToChangeCharge = function(chargeId){
                       var ids = [];
                        for (var count = 0; count < scope.product.feeToIncomeAccountMappings.length; count++) {
                               ids.push(scope.product.feeToIncomeAccountMappings[count].charge.id);
                        }
                        if(ids.includes(chargeId)){
                            return true;
                        }else{
                            return false;
                        }
                    }
                    if(!_.isUndefined(scope.product.penaltyToIncomeAccountMappings)) {
                        for (var count = 0; count < scope.product.penaltyToIncomeAccountMappings.length; count++) {
                            if (scope.penaltySpecificIncomeaccounts.length > 0) {
                                if (scope.product.penaltyToIncomeAccountMappings[count].charge.id == scope.penaltySpecificIncomeaccounts[scope.penaltySpecificIncomeaccounts.length - 1].chargeId) {
                                    scope.penaltySpecificIncomeaccounts[scope.penaltySpecificIncomeaccounts.length - 1].fundSourceAccountId = scope.product.penaltyToIncomeAccountMappings[count].incomeAccount.id;
                                }
                                else {
                                    scope.penaltySpecificIncomeaccounts.push({
                                        chargeId: scope.product.penaltyToIncomeAccountMappings[count].charge.id,
                                        incomeAccountId: scope.product.penaltyToIncomeAccountMappings[count].incomeAccount.id
                                    })
                                }
                            } else {
                                scope.penaltySpecificIncomeaccounts.push({
                                    chargeId: scope.product.penaltyToIncomeAccountMappings[count].charge.id,
                                    incomeAccountId: scope.product.penaltyToIncomeAccountMappings[count].incomeAccount.id
                                })
                            }
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
                    _.each(scope.product.transactionTypeToLoanPortfolioMappings, function (transactionTypeMapping) {
                        scope.transactionTypeMappings.push({
                            transactionTypeId: transactionTypeMapping.transactionType.id,
                            loanPortfolioAccountId: transactionTypeMapping.loanPortfolioAccount.id     
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
                scope.formData.allowDisbursementToGroupBankAccounts = scope.product.allowDisbursementToGroupBankAccounts;
                if(scope.product.repaymentFrequencyNthDayType){
                    scope.formData.repaymentFrequencyNthDayType = scope.product.repaymentFrequencyNthDayType.id;
                }
                if(scope.product.repaymentFrequencyDayOfWeekType){
                    scope.formData.repaymentFrequencyDayOfWeekType = scope.product.repaymentFrequencyDayOfWeekType.id;
                }
                if(scope.product.repeatsOnDayOfMonth && scope.product.repeatsOnDayOfMonth.length>0){
                    scope.available = scope.product.repeatsOnDayOfMonth;
                    scope.addMonthDay();
                }
            });
            scope.variableName = function (minDurationType) {
                if (minDurationType == 1) {
                    scope.minimumDaysBetweenDisbursalAndFirstRepaymentShow = true;
                    scope.maxDaysBetweenDisbursalAndFirstRepaymentShow = true; 
                    scope.minimumPeriodsBetweenDisbursalAndFirstRepaymentShow = false;                   
                    scope.maxPeriodsBetweenDisbursalAndFirstRepaymentshow = false;
                }
                if (minDurationType == 2) {
                    scope.minimumPeriodsBetweenDisbursalAndFirstRepaymentShow = true;
                    scope.maxPeriodsBetweenDisbursalAndFirstRepaymentshow = true;                    
                    scope.minimumDaysBetweenDisbursalAndFirstRepaymentShow = false;
                    scope.maxDaysBetweenDisbursalAndFirstRepaymentShow = false;
                }
            };

            for (var i = 1; i <= 28; i++) {
                scope.repeatsOnDayOfMonthOptions.push(i);
            }

            scope.addMonthDay = function () {
                for (var i in this.available) {
                    for (var j in scope.repeatsOnDayOfMonthOptions) {
                        if (scope.repeatsOnDayOfMonthOptions[j] == this.available[i]) {
                            scope.selectedOnDayOfMonthOptions.push(this.available[i]);
                            scope.repeatsOnDayOfMonthOptions.splice(j, 1);
                            break;
                        }
                    }
                }
                //We need to remove selected items outside of above loop. If we don't remove, we can see empty item appearing
                //If we remove available items in above loop, all items will not be moved to selectedRoles
                scope.available = [];
                scope.selectedOnDayOfMonthOptions.sort(scope.sortNumber);
            };

            scope.sortNumber = function(a,b)
            {
                return a - b;
            };

            scope.removeMonthDay = function () {
                for (var i in this.selected) {
                    for (var j in scope.selectedOnDayOfMonthOptions) {
                        if (scope.selectedOnDayOfMonthOptions[j] == this.selected[i]) {
                            scope.repeatsOnDayOfMonthOptions.push(this.selected[i]);
                            scope.selectedOnDayOfMonthOptions.splice(j, 1);
                            break;
                        }
                    }
                }
                //We need to remove selected items outside of above loop. If we don't remove, we can see empty item appearing
                //If we remove available items in above loop, all items will not be moved to selectedRoles
                scope.selected = [];
                scope.repeatsOnDayOfMonthOptions.sort(scope.sortNumber);
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
                        for (var i = 0; i < scope.chargeOptions.length; i++) {
                            if (scope.chargeOptions[i].id == chargeId && data.chargeTimeType.code != "chargeTimeType.specifiedDueDate") {
                                scope.chargesAppplicableToLoanProduct.splice(i, 1);  //removes 1 element at position i
                                break;
                            }
                        }
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
                var temp = scope.charges[index];
                if (temp.chargeTimeType.code != "chargeTimeType.specifiedDueDate") {
                    scope.chargeOptions.push(temp);
                }
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
                    chargeId:'',
                    incomeAccountId:'',
                    fundSourceAccountId:''

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
                if(scope.specificIncomeAccountMapping[index].chargeId){
                    deleteFeeAccountMappings.push(scope.specificIncomeAccountMapping[index]);
                }
                scope.specificIncomeAccountMapping.splice(index, 1);
            };

            scope.deletePenalty = function (index) {
                if(scope.penaltySpecificIncomeaccounts[index].chargeId){
                    deletePenaltyAccountMappings.push(scope.penaltySpecificIncomeaccounts[index]);
                }  
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

            scope.mapTransaction = function () {
                scope.tlFlag = true;
                scope.transactionTypeMappings.push({
                    transactionTypeId: scope.transactionTypeOptions.length > 0 ? scope.transactionTypeOptions[0].id : '',
                    loanPortfolioAccountId: scope.assetAndLiabilityAccountOptions.length > 0 ? scope.assetAndLiabilityAccountOptions[0].id : '',
                });
            };
            scope.deleteTransaction = function (index) {
                scope.transactionTypeMappings.splice(index, 1);
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

            scope.changeStatus = function () {
                if (scope.formData.isLinkedToFloatingInterestRates == true) {
                    scope.configureInterestRatesChart = false;
                }
            };

            scope.changelabel = function (isIRDEnabled) {
                if (isIRDEnabled) {
                    scope.interestReceivableLabel = "label.input.interest.receivable.and.not.due";
                } else {
                    scope.interestReceivableLabel = "label.input.receivableinterest";
                }
            };
            scope.resetStatus = function () {
                scope.formData.isOverdueAccountingEnabled = false;
                scope.formData.isIRDEnabled = false;
                scope.interestReceivableLabel = "label.input.receivableinterest";
            };


            scope.changeChargeOfFeeSpecificIncomeAccount = function(oldChargeId) {
                scope.existFeeSpecificIncomeAccountMapping = [];
                for (var i in scope.product.feeToIncomeAccountMappings) {
                    if (scope.product.feeToIncomeAccountMappings[i].charge.id == oldChargeId) {
                        if (scope.existFeeSpecificIncomeAccountMapping.length > 0) {
                            scope.existFeeSpecificIncomeAccountMapping[0].fundSourceAccountId = scope.product.feeToIncomeAccountMappings[i].incomeAccount.id;
                        } else {
                            scope.existFeeSpecificIncomeAccountMapping.push({
                                chargeId: scope.product.feeToIncomeAccountMappings[i].charge.id,
                                incomeAccountId: scope.product.feeToIncomeAccountMappings[i].incomeAccount.id
                            })
                            deleteFeeAccountMappings.push(scope.existFeeSpecificIncomeAccountMapping[0]);
                        }
                    }
                };

            };

            scope.changeChargeOfPenaltySpecificIncomeAccount = function(oldChargeId) {
                scope.existPenaltySpecificIncomeaccounts = [];
                for (var i in scope.product.penaltyToIncomeAccountMappings) {
                    if (scope.product.penaltyToIncomeAccountMappings[i].charge.id == oldChargeId) {
                        if (scope.existPenaltySpecificIncomeaccounts.length > 0) {
                            scope.existPenaltySpecificIncomeaccounts[0].fundSourceAccountId = scope.product.penaltyToIncomeAccountMappings[i].incomeAccount.id;
                        } else {
                            scope.existPenaltySpecificIncomeaccounts.push({
                                chargeId: scope.product.penaltyToIncomeAccountMappings[i].charge.id,
                                incomeAccountId: scope.product.penaltyToIncomeAccountMappings[i].incomeAccount.id
                            })
                            deletePenaltyAccountMappings.push(scope.existPenaltySpecificIncomeaccounts[0]);
                        }
                    }
                }
            };

            scope.editChangeDaysInMonthType = function(){
                scope.changeDaysInMonthType();
                if(scope.formData.daysInMonthType === 30 && scope.existingPartialPeriodType){
                    scope.formData.partialPeriodType = angular.copy(scope.existingPartialPeriodType);
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
                //if (this.formData.canDefineInstallmentAmount) {
                    this.formData.canCrossMaturityDateOnFixingEMI = scope.canCrossMaturityDateOnFixingEMI;
                //}

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
                    }
                    if(scope.specificIncomeAccountMapping[i].fundSourceAccountId != null && scope.specificIncomeAccountMapping[i].fundSourceAccountId != ''){
                        var fundSourceAccountId = scope.specificIncomeAccountMapping[i].fundSourceAccountId
                        temp.fundSourceAccountId = fundSourceAccountId;
                    }
                    
                    scope.feeToIncomeAccountMappings.push(temp);
                }

                //map penalties to specific income accounts
                for (var i in scope.penaltySpecificIncomeaccounts) {
                    temp = {
                        chargeId: scope.penaltySpecificIncomeaccounts[i].chargeId,
                        incomeAccountId: scope.penaltySpecificIncomeaccounts[i].incomeAccountId,
                    }
                    if(scope.penaltySpecificIncomeaccounts[i].fundSourceAccountId != null && scope.penaltySpecificIncomeaccounts[i].fundSourceAccountId != ''){
                        var fundSourceAccountId = scope.penaltySpecificIncomeaccounts[i].fundSourceAccountId 
                        temp.fundSourceAccountId = fundSourceAccountId;
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
                //map transaction type to loan portfolio accounts
                scope.transactionTypeToLoanPortfolioMappings = []; 
                for (var i in scope.transactionTypeMappings) {
                    temp = {
                        transactionTypeId: scope.transactionTypeMappings[i].transactionTypeId,
                        loanPortfolioAccountId: scope.transactionTypeMappings[i].loanPortfolioAccountId
                    }
                    scope.transactionTypeToLoanPortfolioMappings.push(temp);
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
                this.formData.transactionTypeToLoanPortfolioMappings = scope.transactionTypeToLoanPortfolioMappings
                this.formData.dateFormat = scope.df;
                this.formData.locale = scope.optlang.code;
                this.formData.startDate = reqFirstDate ? reqFirstDate : ""; 
                this.formData.closeDate = reqSecondDate ? reqSecondDate : ""; 
                this.formData.isInterestRateDiscountAllowed = scope.isInterestRateDiscountAllowed;

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

                if(_.isUndefined(scope.formData.minPrincipal)){
                    this.formData.minPrincipal = null;
                }
                if(_.isUndefined(scope.formData.maxPrincipal)){
                    this.formData.maxPrincipal = null;
                }
                if(_.isUndefined(scope.formData.minInterestRatePerPeriod)){
                    this.formData.minInterestRatePerPeriod = null;
                }
                if(_.isUndefined(scope.formData.maxInterestRatePerPeriod)){
                    this.formData.maxInterestRatePerPeriod = null;
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
                        // delete this.formData.recalculationCompoundingFrequencyNthDayType;
                        delete this.formData.recalculationCompoundingFrequencyDayOfWeekType;
                    } else {
                        delete this.formData.recalculationCompoundingFrequencyOnDayType;
                    }
                } else if (this.formData.recalculationCompoundingFrequencyType == 3) {
                    delete this.formData.recalculationCompoundingFrequencyOnDayType;
                    // delete this.formData.recalculationCompoundingFrequencyNthDayType;
                }

                if (this.formData.recalculationRestFrequencyType == 4) {
                    if (this.formData.recalculationRestFrequencyNthDayType == -2) {
                        // delete this.formData.recalculationRestFrequencyNthDayType;
                        delete this.formData.recalculationRestFrequencyDayOfWeekType;
                    } else {
                        delete this.formData.recalculationRestFrequencyOnDayType;
                    }
                } else if (this.formData.recalculationRestFrequencyType == 3) {
                    delete this.formData.recalculationRestFrequencyOnDayType;
                    // delete this.formData.recalculationRestFrequencyNthDayType;
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
                    this.formData.maxPeriodsBetweenDisbursalAndFirstRepayment = null;
                }
                if (this.formData.minimumDaysBetweenDisbursalAndFirstRepayment > 0 && this.formData.minimumDaysOrrPeriodsBetweenDisbursalAndFirstRepaymentType == 2) {
                    this.formData.minimumDaysBetweenDisbursalAndFirstRepayment = null;
                    this.formData.maxDaysBetweenDisbursalAndFirstRepayment = null;
                }
                if (this.formData.minimumPeriodsBetweenDisbursalAndFirstRepayment > 0 && this.formData.minimumDaysOrrPeriodsBetweenDisbursalAndFirstRepaymentType == 2) {
                    this.formData.minimumDaysBetweenDisbursalAndFirstRepayment = null;
                    this.formData.maxDaysBetweenDisbursalAndFirstRepayment = null;
                }
                if (this.formData.minimumPeriodsBetweenDisbursalAndFirstRepayment > 0 && this.formData.minimumDaysOrrPeriodsBetweenDisbursalAndFirstRepaymentType == 1) {
                    this.formData.minimumPeriodsBetweenDisbursalAndFirstRepayment = null;
                    this.formData.maxPeriodsBetweenDisbursalAndFirstRepayment = null;
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
                this.formData.deleteFeeAccountMappings = deleteFeeAccountMappings;
                this.formData.deletePenaltyAccountMappings = deletePenaltyAccountMappings;

                if (!scope.formData.isOverdueAccountingEnabled || _.isUndefined(scope.formData.isOverdueAccountingEnabled) || _.isNull(scope.formData.isOverdueAccountingEnabled)) {
                    scope.formData.isOverdueAccountingEnabled = false;
                    delete scope.formData.overdueLoanPortfolioAccountId;
                    delete scope.formData.overdueReceivableInterestAccountId;
                    delete scope.formData.overdueReceivableFeeAccountId;
                    delete scope.formData.overdueReceivablePenaltyAccountId;
                }
                if (!scope.formData.isIRDEnabled || _.isUndefined(scope.formData.isIRDEnabled) || _.isNull(scope.formData.isIRDEnabled)) {
                    scope.formData.isIRDEnabled = false;
                    delete scope.formData.interestReceivableAndDueAccountId;
                }

                if(scope.formData.repaymentFrequencyType == 2){
                    if(scope.formData.repaymentFrequencyNthDayType == -2){
                        scope.formData.repeatsOnDayOfMonth = scope.selectedOnDayOfMonthOptions;
                        delete scope.formData.repaymentFrequencyDayOfWeekType;
                    } else {
                        scope.formData.repeatsOnDayOfMonth  = [];
                    }
                } else {
                    delete scope.formData.repaymentFrequencyDayOfWeekType;
                    scope.formData.repeatsOnDayOfMonth  = [];
                }
                if(!(scope.formData.isRepaymentAtDisbursement && scope.formData.isRepaymentAtDisbursement==true)){
                    scope.formData.isUpfrontInterestEnabled = false;
                }

                if(!_.isUndefined(scope.isCloneLoanProduct) && scope.isCloneLoanProduct) {
                    if(!_.isUndefined(this.formData.interestRatesListPerPeriod) && !this.formData.interestRatesListPerPeriod.length > 0){
                        delete  this.formData.interestRatesListPerPeriod;
                    }
                    if(this.formData.minLoanTerm == null){
                        delete  this.formData.minLoanTerm;
                    }
                    if(this.formData.maxLoanTerm == null){
                        delete  this.formData.maxLoanTerm;
                    }
                    console.log(this.formData);
                    resourceFactory.loanProductResource.save(this.formData, function (data) {
                        location.path('/viewloanproduct/' + data.resourceId);
                    });
                }else{
                    console.log(this.formData);
                    resourceFactory.loanProductResource.put({loanProductId: routeParams.id}, this.formData, function (data) {
                        location.path('/viewloanproduct/' + data.resourceId);
                    });
                }
            }
        }
    });
    mifosX.ng.application.controller('EditLoanProductController', ['$controller', '$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', 'CommonUtilService', mifosX.controllers.EditLoanProductController]).run(function ($log) {
        $log.info("EditLoanProductController initialized");
    });
}(mifosX.controllers || {}));
