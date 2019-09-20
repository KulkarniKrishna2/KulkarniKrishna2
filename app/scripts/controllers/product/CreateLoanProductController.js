(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateLoanProductController: function (scope, resourceFactory, location, dateFilter, commonUtilService) {
            scope.restrictDate = new Date();
            scope.formData = {};
            scope.charges = [];
            scope.floatingrateoptions = [];
            scope.loanProductConfigurableAttributes = [];
            scope.showOrHideValue = "show";
            scope.configureFundOptions = [];
            scope.specificIncomeAccountMapping = [];
            scope.penaltySpecificIncomeaccounts = [];
            scope.codeValueSpecificAccountMappings = [];
            scope.codeValueSpecificAccountMapping = [];
            scope.transactionTypeMappings = [];
            scope.configureFundOption = {};
            scope.date = {};
            scope.pvFlag = false;
            scope.rvFlag = false;
            scope.irFlag = false;
            scope.chargeFlag = false;
            scope.penalityFlag = false;
            scope.frFlag = false;
            scope.fiFlag = false;
            scope.piFlag = false;
            scope.tlFlag = false;
            scope.amortization = true;
            scope.arrearsTolerance = true;
            scope.graceOnArrearsAging = true;
            scope.interestCalcPeriod = true;
            scope.interestMethod = true;
            scope.graceOnPrincipalAndInterest = true;
            scope.repaymentFrequency = true;
            scope.transactionProcessingStrategy = true;
            scope.allowAttributeConfiguration = true;
            scope.canCrossMaturityDateOnFixingEMI = true;
            scope.interestRecalculationOnDayTypeOptions = commonUtilService.onDayTypeOptions();
            scope.minimumDaysOrrPeriodsBetweenDisbursalAndFirstRepayment = "minimumDaysBetweenDisbursalAndFirstRepayment";
            scope.interestReceivableLabel ="label.input.receivableinterest";
            scope.minDurationType = [
                    {id :'1',name:"DAYS"},
                    {id :'2',name:"REPAYMENT"}
                ]
            scope.minimumDaysBetweenDisbursalAndFirstRepaymentShow = true;
            scope.minimumPeriodsBetweenDisbursalAndFirstRepaymentshow = false;
            scope.maxDaysBetweenDisbursalAndFirstRepaymentShow = true;
            scope.maxPeriodsBetweenDisbursalAndFirstRepaymentshow = false;
            scope.configureInterestRatesChart = false;
            scope.interestratesListPerPeriod = [];
            scope.interestRate = {};
            scope.allowBankAccountsForGroups = scope.isSystemGlobalConfigurationEnabled('allow-bank-account-for-groups');
            scope.allowDisbursalToGroupBankAccount = scope.isSystemGlobalConfigurationEnabled('allow-multiple-bank-disbursal');
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.loanproduct && scope.response.uiDisplayConfigurations.loanproduct.isHiddenField) {
                scope.isIRDEnabledConfig = !scope.response.uiDisplayConfigurations.loanproduct.isHiddenField.isIRDEnabledConfig;
            }
            scope.allowLoanProductForGroupBankAccount = (scope.allowBankAccountsForGroups && scope.allowDisbursalToGroupBankAccount);
            resourceFactory.loanProductResource.get({resourceType: 'template'}, function (data) {
                scope.product = data;
                scope.assetAccountOptions = scope.product.accountingMappingOptions.assetAccountOptions || [];
                scope.incomeAccountOptions = scope.product.accountingMappingOptions.incomeAccountOptions || [];
                scope.expenseAccountOptions = scope.product.accountingMappingOptions.expenseAccountOptions || [];
                scope.liabilityAccountOptions = scope.product.accountingMappingOptions.liabilityAccountOptions || [];
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
                scope.penaltyOptions = scope.product.penaltyOptions || [];
                scope.chargeOptions = scope.product.chargeOptions || [];
                scope.writeOffReasonOptions = [];
                if(angular.isDefined(scope.product.codeValueOptions) && scope.product.codeValueOptions.length>0){
                    scope.writeOffReasonOptions = scope.product.codeValueOptions;
                }
                scope.overduecharges = [];
                for (var i in scope.penaltyOptions) {
                    if (scope.penaltyOptions[i].chargeTimeType.code == 'chargeTimeType.overdueInstallment') {
                        scope.overduecharges.push(scope.penaltyOptions[i]);
                    }
                }
                scope.formData.currencyCode = scope.product.currencyOptions[0].code;
                scope.formData.includeInBorrowerCycle = 'false';
                scope.formData.digitsAfterDecimal = '2';
                scope.formData.inMultiplesOf = '0';
                scope.formData.repaymentFrequencyType = scope.product.repaymentFrequencyType.id;
                scope.formData.interestRateFrequencyType = scope.product.interestRateFrequencyType.id;
                scope.formData.amortizationType = scope.product.amortizationType.id;
                scope.formData.interestType = scope.product.interestType.id;
                scope.formData.interestCalculationPeriodType = scope.product.interestCalculationPeriodType.id;
                scope.formData.transactionProcessingStrategyId = scope.product.transactionProcessingStrategyOptions[0].id;
                scope.formData.principalVariationsForBorrowerCycle = scope.product.principalVariationsForBorrowerCycle;
                scope.formData.interestRateVariationsForBorrowerCycle = scope.product.interestRateVariationsForBorrowerCycle;
                scope.formData.numberOfRepaymentVariationsForBorrowerCycle = scope.product.numberOfRepaymentVariationsForBorrowerCycle;
                scope.formData.multiDisburseLoan = 'false';
                scope.formData.allowNegativeLoanBalance = false;
                scope.formData.considerFutureDisbursementsInSchedule = false;
                scope.formData.considerAllDisbursementsInSchedule = false;
                scope.formData.accountingRule = '1';
                scope.formData.daysInYearType = scope.product.daysInYearType.id;
                scope.formData.daysInMonthType = scope.product.daysInMonthType.id;
                scope.formData.isInterestRecalculationEnabled = scope.product.isInterestRecalculationEnabled;
                scope.formData.interestRecalculationCompoundingMethod = scope.product.interestRecalculationData.interestRecalculationCompoundingType.id;
                scope.formData.rescheduleStrategyMethod = scope.product.interestRecalculationData.rescheduleStrategyType.id;
                scope.formData.preClosureInterestCalculationStrategy = scope.product.interestRecalculationData.preClosureInterestCalculationStrategy.id;
                if(scope.product.interestRecalculationData.recalculationRestFrequencyType){
                    scope.formData.recalculationRestFrequencyType = scope.product.interestRecalculationData.recalculationRestFrequencyType.id;
                }
                scope.floatingRateOptions = data.floatingRateOptions ;
                scope.formData.isFloatingInterestRateCalculationAllowed = false ;
                scope.formData.isLinkedToFloatingInterestRates = false ;
                scope.formData.allowVariableInstallments = false ;
                scope.product.interestRecalculationNthDayTypeOptions.push({"code" : "onDay", "id" : -2, "value" : "on day"});
                scope.formData.isSubsidyApplicable = false;
                scope.formData.loanTenureFrequencyType = scope.product.repaymentFrequencyType.id;
                scope.formData.weeksInYearType = scope.product.weeksInYearTypeOptions[0].id;
                scope.trancheLoanClosureTypeOptions = scope.product.trancheLoanClosureTypeOptions;
                scope.trancheAmountLimitTypeOptions = scope.product.trancheAmountLimitTypeOptions;
                scope.formData.trancheAmountLimitType = scope.trancheAmountLimitTypeOptions[0].id;
                scope.formData.trancheLoanClosureType = scope.trancheLoanClosureTypeOptions[0].id;
                scope.formData.borrowerCycleType = scope.product.borrowerCycleType.id;
                scope.transactionTypeOptions = data.transactionTypeOptions;
            });

            scope.variableName = function(minDurationType){
                if(minDurationType == 1){
                    scope.minimumDaysBetweenDisbursalAndFirstRepaymentShow = true;
                    scope.minimumPeriodsBetweenDisbursalAndFirstRepaymentshow = false;
                    scope.maxDaysBetweenDisbursalAndFirstRepaymentShow = true;
                    scope.maxPeriodsBetweenDisbursalAndFirstRepaymentshow = false;
                }
                if(minDurationType == 2){
                    scope.minimumPeriodsBetweenDisbursalAndFirstRepaymentshow = true;
                    scope.minimumDaysBetweenDisbursalAndFirstRepaymentShow = false;
                    scope.maxDaysBetweenDisbursalAndFirstRepaymentShow = false;
                    scope.maxPeriodsBetweenDisbursalAndFirstRepaymentshow = true;
                }
            };
            scope.chargeSelected = function (chargeId) {

                if (chargeId) {
                    resourceFactory.chargeResource.get({chargeId: chargeId, template: 'true'}, this.formData, function (data) {
                        data.chargeId = data.id;
                        scope.charges.push(data);
                        //to charge select box empty

                        if (data.penalty) {
                            scope.penalityFlag = true;
                            scope.penalityId = '';
                        } else {
                            scope.chargeFlag = true;
                            scope.chargeId = '';
                        }
                    });
                }
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
                scope.frFlag = true;
                scope.configureFundOptions.push({
                    paymentTypeId: scope.product.paymentTypeOptions.length > 0 ? scope.product.paymentTypeOptions[0].id : '',
                    fundSourceAccountId: scope.assetAccountOptions.length > 0 ? scope.assetAccountOptions[0].id : '',
                    paymentTypeOptions: scope.product.paymentTypeOptions.length > 0 ? scope.product.paymentTypeOptions : [],
                    assetAccountOptions: scope.assetAccountOptions.length > 0 ? scope.assetAccountOptions : []
                });
            };

            scope.mapFees = function () {
                scope.fiFlag = true;
                scope.specificIncomeAccountMapping.push({
                    chargeId: scope.chargeOptions.length > 0 ? scope.chargeOptions[0].id : '',
                    incomeAccountId: scope.incomeAndLiabilityAccountOptions.length > 0 ? scope.incomeAndLiabilityAccountOptions[0].id : '',
                    fundSourceAccountId: scope.assetAccountOptions.length > 0 ? scope.assetAccountOptions[0].id : ''
                });
            };

            scope.mapWriteOffReason = function () {
                scope.writeOffFlag = true;
                scope.codeValueSpecificAccountMappings.push({
                    codeVaueId: scope.writeOffReasonOptions.length > 0 ? scope.writeOffReasonOptions[0].id : '',
                    expenseAccountId: scope.expenseAccountOptions.length > 0 ? scope.expenseAccountOptions[0].id : ''
                });
            };

            scope.addPrincipalVariation = function () {
                scope.pvFlag = true;
                scope.formData.principalVariationsForBorrowerCycle.push({
                    valueConditionType: scope.product.valueConditionTypeOptions[0].id
                });
            };
            scope.addInterestRateVariation = function () {
                scope.irFlag = true;
                scope.formData.interestRateVariationsForBorrowerCycle.push({
                    valueConditionType: scope.product.valueConditionTypeOptions[0].id
                });
            };
            scope.addNumberOfRepaymentVariation = function () {
                scope.rvFlag = true;
                scope.formData.numberOfRepaymentVariationsForBorrowerCycle.push({
                    valueConditionType: scope.product.valueConditionTypeOptions[0].id
                });
            };

            scope.mapPenalty = function () {
                scope.piFlag = true;
                scope.penaltySpecificIncomeaccounts.push({
                    chargeId: scope.penaltyOptions.length > 0 ? scope.penaltyOptions[0].id : '',
                    incomeAccountId: scope.incomeAccountOptions.length > 0 ? scope.incomeAccountOptions[0].id : ''
                });
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

            scope.deleteFund = function (index) {
                scope.configureFundOptions.splice(index, 1);
            };

            scope.deleteFee = function (index) {
                scope.specificIncomeAccountMapping.splice(index, 1);
            };

            scope.deleteCodeValue = function (index) {
                scope.codeValueSpecificAccountMappings.splice(index, 1);
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

            scope.cancel = function () {
                location.path('/loanproducts');
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

            scope.setAttributeValues = function(){
                if(scope.allowAttributeConfiguration == false){
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

            scope.filterCharges = function (currencyCode, multiDisburseLoan) {
                return function (item) {
                    if ((multiDisburseLoan != true) && item.chargeTimeType.id == 12) {
                        return false;
                    }
                    if (item.currency.code != currencyCode) {
                        return false;
                    }
                    return true;
                };
            };

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
                    for (var i in scope.product.templateData.legalFormOptions) {
                        var legal = {};
                        legal.id = scope.product.templateData.legalFormOptions[i].id;
                        legal.name = scope.product.templateData.legalFormOptions[i].value;
                        scope.availableProfileTypeValuesOptions.push(legal);
                    }
                } else if (scope.formData.profileType == 2) {
                    scope.availableProfileTypeValuesOptions = scope.product.templateData.clientTypeOptions;
                } else if (scope.formData.profileType == 3) {
                    scope.availableProfileTypeValuesOptions = scope.product.templateData.clientClassificationOptions;
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

        scope.addInterest = function(){
            if(scope.interestRate.value != undefined && scope.interestratesListPerPeriod.indexOf(scope.interestRate.value) < 0){
                scope.interestratesListPerPeriod.push(scope.interestRate.value);
            }
            scope.interestRate.value = undefined;
        };

        scope.deleteInterestRateFromList = function(index) {
            scope.interestratesListPerPeriod.splice(index, 1);
        };

        scope.addInterestPerCycle = function(index){
            scope.formData.interestRateVariationsForBorrowerCycle[index].minValue = null;
            scope.formData.interestRateVariationsForBorrowerCycle[index].maxValue = null;

            if (scope.formData.interestRateVariationsForBorrowerCycle[index].interestRatesListPerCycle == undefined){
                scope.formData.interestRateVariationsForBorrowerCycle[index].interestRatesListPerCycle = [];
            }
             
            if(scope.formData.interestRateVariationsForBorrowerCycle[index].tempValue != undefined && scope.formData.interestRateVariationsForBorrowerCycle[index].interestRatesListPerCycle.indexOf(scope.formData.interestRateVariationsForBorrowerCycle[index].tempValue) < 0){   
                scope.formData.interestRateVariationsForBorrowerCycle[index].interestRatesListPerCycle.push(scope.formData.interestRateVariationsForBorrowerCycle[index].tempValue);
            }
            
            scope.formData.interestRateVariationsForBorrowerCycle[index].tempValue = undefined;
        };

        scope.deleteInterestFromCycle = function(index,indexOfinterestRate){
            scope.formData.interestRateVariationsForBorrowerCycle[index].interestRatesListPerCycle.splice(indexOfinterestRate, 1);
        };

        scope.changeStatus = function() {
                if(scope.formData.isLinkedToFloatingInterestRates ==  true){
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
        scope.submit = function () {
            var reqFirstDate = dateFilter(scope.date.first, scope.df);
            var reqSecondDate = dateFilter(scope.date.second, scope.df);
            scope.paymentChannelToFundSourceMappings = [];
            scope.feeToIncomeAccountMappings = [];
            scope.penaltyToIncomeAccountMappings = [];
            scope.chargesSelected = [];
            scope.selectedConfigurableAttributes = [];
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
            scope.codeValueSpecificAccountMapping = []; 
            for (var i in scope.codeValueSpecificAccountMappings) {
                temp = {
                    codeValueId: scope.codeValueSpecificAccountMappings[i].codeValueId,
                    expenseAccountId: scope.codeValueSpecificAccountMappings[i].expenseAccountId
                }
                scope.codeValueSpecificAccountMapping.push(temp);
            }
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
                var isChargeAmountNonEditable = false;
                if (scope.charges[i].isMandatory) {
                    isMandatory = scope.charges[i].isMandatory;
                }
                if (scope.charges[i].isChargeAmountNonEditable) {
                    isChargeAmountNonEditable = scope.charges[i].isChargeAmountNonEditable;
                }
                temp = {
                    id: scope.charges[i].id,
                    isMandatory: isMandatory,
                    isAmountNonEditable : isChargeAmountNonEditable
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
            this.formData.codeValueSpecificAccountMapping = scope.codeValueSpecificAccountMapping;
            this.formData.charges = scope.chargesSelected;
            this.formData.allowAttributeOverrides = scope.selectedConfigurableAttributes;
            this.formData.locale = scope.optlang.code;
            this.formData.dateFormat = scope.df;
            this.formData.startDate = reqFirstDate;
            this.formData.closeDate = reqSecondDate;
            this.formData.interestRatesListPerPeriod = scope.interestratesListPerPeriod;
            this.formData.transactionTypeToLoanPortfolioMappings = scope.transactionTypeToLoanPortfolioMappings;

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

            if (!scope.configureInterestRatesChart) {
                delete this.formData.interestRatesListPerPeriod;
                if(scope.irFlag == true){
                        for(var i =0 ; i < this.formData.interestRateVariationsForBorrowerCycle.length ; i++) {
                            this.formData.interestRateVariationsForBorrowerCycle[i].interestRatesListPerCycle = [];
                        }
                    }
            }
            else{
                this.formData.minInterestRatePerPeriod = null;
                this.formData.maxInterestRatePerPeriod = null;
                if(scope.irFlag == true){
                        for(var i =0 ; i < this.formData.interestRateVariationsForBorrowerCycle.length ; i++) {
                            this.formData.interestRateVariationsForBorrowerCycle[i].minValue = null;
                            this.formData.interestRateVariationsForBorrowerCycle[i].maxValue = null;
                        }
                    }
            }

            if (this.formData.isLinkedToFloatingInterestRates) {
                delete scope.formData.interestRatePerPeriod;
                delete scope.formData.minInterestRatePerPeriod;
                delete scope.formData.maxInterestRatePerPeriod;
                delete scope.formData.interestRateFrequencyType;
                delete scope.formData.interestRatesListPerPeriod;
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
                delete this.formData.isSubsidyApplicable;
                delete this.formData.subsidyFundSourceId;
                delete this.formData.subsidyAccountId;
            }
            if (this.formData.adjustFirstEMIAmount) {
                this.formData.adjustInterestForRounding = true;
            }

            if (this.formData.minimumDaysOrrPeriodsBetweenDisbursalAndFirstRepaymentType) {
                delete this.formData.minimumDaysOrrPeriodsBetweenDisbursalAndFirstRepaymentType;
            }

            if (this.formData.minimumDaysBetweenDisbursalAndFirstRepayment) {
                delete this.formData.minimumPeriodsBetweenDisbursalAndFirstRepayment;
            }

            if (this.formData.minimumPeriodsBetweenDisbursalAndFirstRepayment) {
                delete this.formData.minimumDaysBetweenDisbursalAndFirstRepayment;
            }
            if (this.formData.minLoanTerm == null && this.formData.maxLoanTerm == null &&
                this.formData.loanTenureFrequencyType != null) {
                this.formData.loanTenureFrequencyType = null;
            }

            if(this.formData.trancheLoanClosureType == undefined){
                delete this.formData.trancheLoanClosureType;
            }

            if(this.formData.trancheAmountLimitType == undefined){
                delete this.formData.trancheAmountLimitType;
            }

            if(this.formData.canDefineInstallmentAmount){
                this.formData.canCrossMaturityDateOnFixingEMI = scope.canCrossMaturityDateOnFixingEMI;
            }

            scope.formData.selectedProfileTypeValues = undefined;
            if (scope.formData.isEnableRestrictionForClientProfile && scope.formData.isEnableRestrictionForClientProfile.toString() == 'true') {
                if (scope.selectedProfileTypeValuesOptions && scope.selectedProfileTypeValuesOptions.length > 0) {
                    scope.formData.selectedProfileTypeValues = [];
                    for (var i in scope.selectedProfileTypeValuesOptions) {
                        scope.formData.selectedProfileTypeValues.push(scope.selectedProfileTypeValuesOptions[i].id);
                    }
                }
            }
            if (!scope.formData.isOverdueAccountingEnabled || _.isUndefined(scope.formData.isOverdueAccountingEnabled) || _.isNull(scope.formData.isOverdueAccountingEnabled)) {
                delete scope.formData.isOverdueAccountingEnabled;
                delete scope.formData.overdueLoanPortfolioAccountId;
                delete scope.formData.overdueReceivableInterestAccountId;
                delete scope.formData.overdueReceivableFeeAccountId;
                delete scope.formData.overdueReceivablePenaltyAccountId;
            }
            if (!scope.formData.isIRDEnabled || _.isUndefined(scope.formData.isIRDEnabled) || _.isNull(scope.formData.isIRDEnabled)) {
                delete scope.formData.isIRDEnabled;
                delete scope.formData.interestReceivableAndDueAccountId;
            }

            resourceFactory.loanProductResource.save(this.formData, function (data) {
                location.path('/viewloanproduct/' + data.resourceId);
            });
        };
        }
    });
    mifosX.ng.application.controller('CreateLoanProductController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', 'CommonUtilService', mifosX.controllers.CreateLoanProductController]).run(function ($log) {
        $log.info("CreateLoanProductController initialized");
    });
}(mifosX.controllers || {}));
