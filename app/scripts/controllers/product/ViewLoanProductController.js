(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewLoanProductController: function (scope, routeParams, location, anchorScroll, resourceFactory) {
            scope.loanproduct = [];
            scope.isAccountingEnabled = false;
            scope.isAccrualAccountingEnabled = false;
            scope.minimumDaysBetweenDisbursalAndFirstRepaymentShow = false;
            scope.minimumPeriodsBetweenDisbursalAndFirstRepaymentShow = false;
            scope.isInterestRateListPerCycleNotAvailable = true;

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

                scope.loanproduct.charges = [];
                for(var i in scope.loanProductData.charges){
                    if(scope.loanProductData.charges[i].chargeData){
                        var charge = scope.loanProductData.charges[i].chargeData;
                        charge.isMandatory = scope.loanProductData.charges[i].isMandatory;
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
