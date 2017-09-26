(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateSavingProductController: function (scope, resourceFactory, location, commonUtilService, dateFilter) {
            scope.formData = {};
            scope.charges = [];
            scope.showOrHideValue = "show";
            scope.configureFundOptions = [];
            scope.specificIncomeaccounts = [];
            scope.penaltySpecificIncomeaccounts = [];
            scope.configureFundOption = {};
            scope.showInterestChart = false;
            scope.interestRateChart = [];
            scope.floatingInterestRateChart = [];
            scope.floatingInterestRateChart.effectiveFromDate = new Date ();
            scope.effectiveFromDateRequired = false;
            scope.interestRateRequired = false;
            scope.onDayTypeOptions = commonUtilService.onDayTypeOptions();
            resourceFactory.savingProductResource.get({resourceType: 'template'}, function (data) {
                scope.product = data;
                scope.product.chargeOptions = scope.product.chargeOptions || [];
                scope.assetAccountOptions = scope.product.accountingMappingOptions.assetAccountOptions || [];
                scope.liabilityAccountOptions = scope.product.accountingMappingOptions.liabilityAccountOptions || [];
                scope.incomeAccountOptions = scope.product.accountingMappingOptions.incomeAccountOptions || [];
                scope.expenseAccountOptions = scope.product.accountingMappingOptions.expenseAccountOptions || [];

                scope.formData.currencyCode = data.currencyOptions[0].code;
                scope.formData.digitsAfterDecimal = data.currencyOptions[0].decimalPlaces;
                scope.formData.interestCompoundingPeriodType = data.interestCompoundingPeriodType.id;
                scope.formData.interestPostingPeriodType = data.interestPostingPeriodType.id;
                scope.formData.interestCalculationType = data.interestCalculationType.id;
                scope.formData.interestCalculationDaysInYearType = data.interestCalculationDaysInYearType.id;
                scope.formData.accountingRule = '1';

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
                scope.paymentTypeOptions  = scope.product.paymentTypeOptions || [];
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
                scope.penaltyOptions = scope.product.penaltyOptions || [];
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
                location.path('/savingproducts');
            };

            scope.resetSavingsProductDrawingPowerDetails = function () {
                delete scope.formData.frequencyNthDay;
                delete scope.formData.frequencyDayOfWeekType;
                delete scope.formData.onDayType;
            };

            scope.addFloatingInterestRateChart = function(){
                if(scope.floatingInterestRateChart.effectiveFromDate != undefined && scope.floatingInterestRateChart.interestRate == undefined){
                    scope.interestRateRequired = true;
                }else{
                    scope.interestRateRequired = false;
                }
                if(scope.floatingInterestRateChart.effectiveFromDate == undefined && scope.floatingInterestRateChart.interestRate != undefined){
                    scope.effectiveFromDateRequired = true;
                }else{
                    scope.effectiveFromDateRequired = false;
                }
                if(scope.floatingInterestRateChart.effectiveFromDate != undefined && scope.floatingInterestRateChart.interestRate != undefined) {
                    reqDate = dateFilter(scope.floatingInterestRateChart.effectiveFromDate, scope.df);
                    temp = {
                        effectiveFromDate: reqDate,
                        interestRate: scope.floatingInterestRateChart.interestRate
                    };
                    scope.interestRateChart.push(temp);
                    scope.floatingInterestRateChart.effectiveFromDate = undefined;
                    scope.floatingInterestRateChart.interestRate = undefined;
                }

            };

            scope.deleteInterestChart = function (index) {
                scope.interestRateChart.splice(index, 1);
            };

            scope.updateList = function(checked){
                if(checked == "false"){
                    scope.interestRateChart.splice(0, scope.interestRateChart.length);
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
                if (scope.interestRateChart.length > 0) {
                    this.formData.floatingInterestRateChart = scope.interestRateChart;
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
                        incomeAccountId: scope.specificIncomeaccounts[i].incomeAccountId,
                    }
                    scope.feeToIncomeAccountMappings.push(temp);
                }

                //map penalties to specific income accounts
                for (var i in scope.penaltySpecificIncomeaccounts) {
                    temp = {
                        chargeId: scope.penaltySpecificIncomeaccounts[i].chargeId,
                        incomeAccountId: scope.penaltySpecificIncomeaccounts[i].incomeAccountId,
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
                delete this.formData.isAllowInterestRateChart;
                    resourceFactory.savingProductResource.save(this.formData, function (data) {
                        location.path('/viewsavingproduct/' + data.resourceId);
                    });
            };
        }
    });
    mifosX.ng.application.controller('CreateSavingProductController', ['$scope', 'ResourceFactory', '$location', 'CommonUtilService', 'dateFilter', mifosX.controllers.CreateSavingProductController]).run(function ($log) {
        $log.info("CreateSavingProductController initialized");
    });
}(mifosX.controllers || {}));
