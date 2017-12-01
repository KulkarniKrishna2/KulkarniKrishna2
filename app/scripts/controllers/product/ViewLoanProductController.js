(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewLoanProductController: function (scope, routeParams, location, anchorScroll, resourceFactory) {
            scope.loanproduct = [];
            scope.isAccountingEnabled = false;
            scope.isAccrualAccountingEnabled = false;
            scope.isPeriodicAccrualAccountingEnabled = false;
            scope.minimumDaysBetweenDisbursalAndFirstRepaymentShow = false;
            scope.minimumPeriodsBetweenDisbursalAndFirstRepaymentShow = false;
            scope.isInterestRateListPerCycleNotAvailable = true;
            scope.isLimitTrnache = false;

            resourceFactory.loanProductResource.get({loanProductId: routeParams.id, template: 'true'}, function (data) {
                scope.loanproduct = data;
                scope.loanProductData = [];
                angular.copy(scope.loanproduct,scope.loanProductData);
                if (data.accountingRule.id == 2 || data.accountingRule.id == 3 || data.accountingRule.id == 4) {
                    scope.isAccountingEnabled = true;
                }
                if (data.accountingRule.id == 3 || data.accountingRule.id == 4) {
                    scope.isAccrualAccountingEnabled = true;
                }
                if(data.accountingRule.id == 3){
                    scope.isPeriodicAccrualAccountingEnabled = true;
                }

                if(scope.loanproduct.multiDisburseLoan && scope.loanproduct.maxTrancheCount != undefined) {
                        scope.isLimitTrnache = true;
                }
                if(scope.loanproduct.allowAttributeOverrides != null){
                    scope.amortization = scope.loanproduct.allowAttributeOverrides.amortizationType;
                    scope.arrearsTolerance = scope.loanproduct.allowAttributeOverrides.inArrearsTolerance;
                    scope.graceOnArrearsAging = scope.loanproduct.allowAttributeOverrides.graceOnArrearsAgeing;
                    scope.interestCalcPeriod = scope.loanproduct.allowAttributeOverrides.interestCalculationPeriodType;
                    scope.interestMethod = scope.loanproduct.allowAttributeOverrides.interestType;
                    scope.graceOnPrincipalAndInterest = scope.loanproduct.allowAttributeOverrides.graceOnPrincipalAndInterestPayment;
                    scope.repaymentFrequency = scope.loanproduct.allowAttributeOverrides.repaymentEvery;
                    scope.transactionProcessingStrategy = scope.loanproduct.allowAttributeOverrides.transactionProcessingStrategyId;
                }
                if(scope.amortization || scope.arrearsTolerance || scope.graceOnArrearsAging ||
                    scope.interestCalcPeriod || scope.interestMethod || scope.graceOnPrincipalAndInterest ||
                    scope.repaymentFrequency || scope.transactionProcessingStrategy == true){
                    scope.allowAttributeConfiguration = true;
                }
                else{
                    scope.allowAttributeConfiguration = false;
                }

                if(scope.loanproduct.minimumDaysBetweenDisbursalAndFirstRepayment){
                    scope.minimumDaysBetweenDisbursalAndFirstRepaymentShow = true;
                }
                if(scope.loanproduct.minimumPeriodsBetweenDisbursalAndFirstRepayment) {
                    scope.minimumPeriodsBetweenDisbursalAndFirstRepaymentShow = true;
                }
                //construct feesToIncomeMappingData
                var tempChargeId;
                var loopCount = 0;
                scope.feeToIncomeAccountMappingsData = [];
                for(var i in scope.loanproduct.feeToIncomeAccountMappings) {
                    tempChargeId = scope.loanproduct.feeToIncomeAccountMappings[i].charge.id;
                    if (loopCount == 0 ) {
                        scope.feeToIncomeAccountMappingsData.push({
                            feeToIncomeAccountChargeId: scope.loanproduct.feeToIncomeAccountMappings[i].charge.id,
                            feeToIncomeAccountChargeName: scope.loanproduct.feeToIncomeAccountMappings[i].charge.name,
                            feeToIncomeAccountName: scope.loanproduct.feeToIncomeAccountMappings[i].incomeAccount.name,
                            incomeAccountGlCode: scope.loanproduct.feeToIncomeAccountMappings[i].incomeAccount.glCode
                        });
                    }else{
                        if(tempChargeId == scope.feeToIncomeAccountMappingsData[scope.feeToIncomeAccountMappingsData.length-1].feeToIncomeAccountChargeId){
                            scope.feeToIncomeAccountMappingsData[scope.feeToIncomeAccountMappingsData.length-1].feeToDebitAccountName = scope.loanproduct.feeToIncomeAccountMappings[scope.feeToIncomeAccountMappingsData.length-1].incomeAccount.name;
                        }else{
                            scope.feeToIncomeAccountMappingsData.push({
                                feeToIncomeAccountChargeId: scope.loanproduct.feeToIncomeAccountMappings[i].charge.id,
                                feeToIncomeAccountChargeName: scope.loanproduct.feeToIncomeAccountMappings[i].charge.name,
                                feeToIncomeAccountName: scope.loanproduct.feeToIncomeAccountMappings[i].incomeAccount.name
                            });
                        }
                    }
                    loopCount++;
                }

                //Construct penaltiesToIncomeMappingData
                var tempChargeId;
                var loopCount = 0;
                scope.penaltyToIncomeAccountMappingsData = [];
                for(var i in scope.loanproduct.penaltyToIncomeAccountMappings) {
                    tempChargeId = scope.loanproduct.penaltyToIncomeAccountMappings[i].charge.id;
                    if (loopCount == 0 ) {
                        scope.penaltyToIncomeAccountMappingsData.push({
                            chargeId: scope.loanproduct.penaltyToIncomeAccountMappings[i].charge.id,
                            chargeName: scope.loanproduct.penaltyToIncomeAccountMappings[i].charge.name,
                            incomeAccountName: scope.loanproduct.penaltyToIncomeAccountMappings[i].incomeAccount.name,
                            glCode: scope.loanproduct.penaltyToIncomeAccountMappings[i].incomeAccount.glCode
                        });
                    }else{
                        if(tempChargeId == scope.penaltyToIncomeAccountMappingsData[scope.penaltyToIncomeAccountMappingsData.length-1].chargeId){
                            scope.penaltyToIncomeAccountMappingsData[scope.penaltyToIncomeAccountMappingsData.length-1].debitAccountName = scope.loanproduct.penaltyToIncomeAccountMappings[scope.penaltyToIncomeAccountMappingsData.length-1].incomeAccount.name;
                        }else{
                            scope.penaltyToIncomeAccountMappingsData.push({
                                chargeId: scope.loanproduct.penaltyToIncomeAccountMappings[i].charge.id,
                                chargeName: scope.loanproduct.penaltyToIncomeAccountMappings[i].charge.name,
                                incomeAccountName: scope.loanproduct.penaltyToIncomeAccountMappings[i].incomeAccount.name,
                                glCode: scope.loanproduct.penaltyToIncomeAccountMappings[i].incomeAccount.glCode
                            });
                        }
                    }
                    loopCount++;
                }

                scope.loanproduct.charges = [];
                for(var i in scope.loanProductData.charges){
                    if(scope.loanProductData.charges[i].chargeData){
                        var charge = scope.loanProductData.charges[i].chargeData;
                        charge.isMandatory = scope.loanProductData.charges[i].isMandatory;
                        charge.isAmountNonEditable = scope.loanProductData.charges[i].isAmountNonEditable;
                        scope.loanproduct.charges.push(charge);
                    }
                }
                if(scope.loanproduct.applicableForLoanType.id == 2){
                    scope.isEnableRestrictionForClientProfile = false;
                }
                if(scope.loanproduct.loanProductEntityProfileMappingDatas && scope.loanproduct.loanProductEntityProfileMappingDatas[0]
                    && scope.loanproduct.loanProductEntityProfileMappingDatas[0].profileType && scope.loanproduct.loanProductEntityProfileMappingDatas[0].profileType.id){
                    scope.isEnableRestrictionForClientProfile = true;
                    scope.entityProfileMappingData = scope.loanproduct.loanProductEntityProfileMappingDatas[0];
                };
                if(scope.loanproduct.useBorrowerCycle == true && scope.loanproduct.interestRateVariationsForBorrowerCycle.length > 0 &&
                    scope.loanproduct.interestRateVariationsForBorrowerCycle[0].loanInterestRatesListPerCycle.length > 0){
                    scope.isInterestRateListPerCycleNotAvailable = false;
                }
            });

            scope.scrollto = function (link) {
                location.hash(link);
                anchorScroll();

            };

        }
    });
    mifosX.ng.application.controller('ViewLoanProductController', ['$scope', '$routeParams', '$location', '$anchorScroll' , 'ResourceFactory', mifosX.controllers.ViewLoanProductController]).run(function ($log) {
        $log.info("ViewLoanProductController initialized");
    });
}(mifosX.controllers || {}));
