(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateRecurringDepositProductController: function (scope, resourceFactory, location, dateFilter,$modal) {
            scope.formData = {};
            scope.charges = [];
            scope.showOrHideValue = "show";
            scope.configureFundOptions = [];
            scope.specificIncomeaccounts = [];
            scope.penaltySpecificIncomeaccounts = [];
            scope.configureFundOption = {};

            //interest rate details
            scope.chart = {};
            scope.restrictDate = new Date();
            scope.fromDate = {}; //required for date formatting
            scope.endDate = {};//required for date formatting
            scope.isPrimaryGroupingByAmount = false;
            scope.isInterestCalculationFromProductChart = false;
            scope.date = {};
            scope.chargeOptions = [];
            scope.accountingRuleOptions = [];
            scope.repeatsOnDayOfMonthOptions = [];
            scope.selectedOnDayOfMonthOptions = [];
            
            for (var i = 1; i <= 28; i++) {
                scope.repeatsOnDayOfMonthOptions.push(i);
            }

            resourceFactory.recurringDepositProductResource.get({resourceType: 'template'}, function (data) {
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
                scope.formData.preClosurePenalInterestOnTypeId = scope.product.preClosurePenalInterestOnTypeOptions[0].id;
                //scope.formData.interestFreePeriodFrequencyTypeId = scope.product.interestFreePeriodTypeOptions[0].id;

                //set chart template
                scope.chart = scope.product.chartTemplate;
                scope.chart.chartSlabs = [];
                scope.formData.accountingRule = '1';
                scope.formData.autoRenewalEnabled = data.autoRenewalEnabled;
                scope.autoRenewalGracePeriodTypeOptions = data.autoRenewalData.autoRenewalGracePeriodTypeOptions;
                scope.autoRenewalConfigEnumOptions = data.autoRenewalData.autoRenewalConfigEnumOptions;
                _.each(data.accountingRuleOptions, function (accountingRule){
                    if(accountingRule.value != 'ACCRUAL UPFRONT'){
                        scope.accountingRuleOptions.push(accountingRule);
                    }
                });
            });

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
                    paymentTypeId:  scope.paymentTypeOptions.length > 0 ? scope.paymentTypeOptions[0].id : '',
                    fundSourceAccountId: scope.assetAccountOptions.length > 0 ? scope.assetAccountOptions[0].id : '',
                    paymentTypeOptions: scope.paymentTypeOptions,
                    assetAccountOptions: scope.assetAccountOptions
                });
            }

            scope.mapFees = function () {
                if(scope.chargeOptions.length==0){
                    _.each(scope.product.chargeOptions, function (charge){
                        if(charge.penalty==false){
                            scope.chargeOptions.push(charge);
                        }
                    });
                }
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
                location.path('/recurringdepositproducts');
            };

            scope.submit = function () {
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
                this.formData.startDate = dateFilter(scope.date.first, scope.df);
                this.formData.closeDate = dateFilter(scope.date.second, scope.df);
                this.formData.locale = scope.optlang.code;
                this.formData.charts = [];//declare charts array
                this.formData.charts.push(copyChartData(scope.chart));//add chart details
                this.formData.isInterestCalculationFromProductChart = scope.isInterestCalculationFromProductChart;
                if(this.formData.autoRenewalEnabled){
                    this.formData.autoRenewalData.locale = this.formData.locale;
                }
                this.formData.dateFormat = scope.df;
                this.formData.interestPostingRecurrenceOnDay = scope.selectedOnDayOfMonthOptions;
                resourceFactory.recurringDepositProductResource.save(this.formData, function (data) {
                    location.path('/viewrecurringdepositproduct/' + data.resourceId);
                });
            }

            /**
             * Add a new row with default values for entering chart details
             */
            scope.addNewRow = function () {
                var fromPeriod = '';
                var amountRangeFrom = '';
                var periodType = '';
                var toPeriod = '';
                var amountRangeTo = '';
                if (_.isNull(scope.chart.chartSlabs) || _.isUndefined(scope.chart.chartSlabs)) {
                    scope.chart.chartSlabs = [];
                } else {
                    var lastChartSlab = {};
                    if (scope.chart.chartSlabs.length > 0) {
                        lastChartSlab = angular.copy(scope.chart.chartSlabs[scope.chart.chartSlabs.length - 1]);
                    }else{
                        lastChartSlab = null;
                    }
                    if (!(_.isNull(lastChartSlab) || _.isUndefined(lastChartSlab))) {
                        if(scope.isPrimaryGroupingByAmount){
                            if((_.isNull(lastChartSlab.toPeriod) || _.isUndefined(lastChartSlab.toPeriod) || lastChartSlab.toPeriod.length == 0)){
                                amountRangeFrom = _.isNull(lastChartSlab) ? '' : parseFloat(lastChartSlab.amountRangeTo) + 1;
                                fromPeriod = (_.isNull(lastChartSlab.fromPeriod) || _.isUndefined(lastChartSlab.fromPeriod) || lastChartSlab.fromPeriod.length == 0)? '' : 1;
                            }else{
                                amountRangeFrom = lastChartSlab.amountRangeFrom;
                                amountRangeTo = lastChartSlab.amountRangeTo;
                                fromPeriod = _.isNull(lastChartSlab) ? '' : parseInt(lastChartSlab.toPeriod) + 1;
                            }
                        }else{
                            if((_.isNull(lastChartSlab.amountRangeTo) || _.isUndefined(lastChartSlab.amountRangeTo) || lastChartSlab.amountRangeTo.length == 0)){
                                amountRangeFrom = (_.isNull(lastChartSlab.amountRangeFrom) || _.isUndefined(lastChartSlab.amountRangeFrom) || lastChartSlab.amountRangeFrom.length == 0) ? '' : 1;
                                fromPeriod = _.isNull(lastChartSlab) ? '' : parseFloat(lastChartSlab.toPeriod) + 1;
                            }else{
                                fromPeriod = lastChartSlab.fromPeriod;
                                toPeriod = lastChartSlab.toPeriod;
                                amountRangeFrom = _.isNull(lastChartSlab) ? '' : parseInt(lastChartSlab.amountRangeTo) + 1;
                            }
                        }
                        periodType = angular.copy(lastChartSlab.periodType);
                    }
                }


                var chartSlab = {
                    "periodType": periodType,
                    "fromPeriod": fromPeriod,
                    "amountRangeFrom": amountRangeFrom,
                    "incentives":[]
                };
                if(!_.isUndefined(toPeriod) && toPeriod.length > 0){
                    chartSlab.toPeriod = toPeriod;
                }
                if(!_.isUndefined(amountRangeTo) && amountRangeTo.length > 0){
                    chartSlab.amountRangeTo = amountRangeTo;
                }
                scope.chart.chartSlabs.push(chartSlab);
            }

            /**
             * Remove chart details row
             */
            scope.removeRow = function (index) {
                scope.chart.chartSlabs.splice(index, 1);
            }

            /**
             *  create new chart data object
             */

            copyChartData = function () {
                var newChartData = {
                    name: scope.chart.name,
                    description: scope.chart.description,
                    fromDate: dateFilter(scope.fromDate.date, scope.df),
                    endDate: dateFilter(scope.endDate.date, scope.df),
                    isPrimaryGroupingByAmount:scope.isPrimaryGroupingByAmount,
                    //savingsProductId: scope.productId,
                    dateFormat: scope.df,
                    locale: scope.optlang.code,
                    chartSlabs: angular.copy(copyChartSlabs(scope.chart.chartSlabs))
                }

                //remove empty values
                _.each(newChartData, function (v, k) {
                    if (!v)
                        delete newChartData[k];
                });

                return newChartData;
            }

            /**
             *  copy all chart details to a new Array
             * @param chartSlabs
             * @returns {Array}
             */
            copyChartSlabs = function (chartSlabs) {
                var detailsArray = [];
                _.each(chartSlabs, function (chartSlab) {
                    var chartSlabData = copyChartSlab(chartSlab);
                    detailsArray.push(chartSlabData);
                });
                return detailsArray;
            }

            /**
             * create new chart detail object data from chartSlab
             * @param chartSlab
             *
             */

            copyChartSlab = function (chartSlab) {
                var newChartSlabData = {
                    id: chartSlab.id,
                    description: chartSlab.description,
                    fromPeriod: chartSlab.fromPeriod,
                    toPeriod: chartSlab.toPeriod,
                    amountRangeFrom: chartSlab.amountRangeFrom,
                    amountRangeTo: chartSlab.amountRangeTo,
                    annualInterestRate: chartSlab.annualInterestRate,
                    locale: scope.optlang.code,
                    incentives:angular.copy(copyIncentives(chartSlab.incentives))
                }
                if(chartSlab.periodType != undefined) {
                    newChartSlabData.periodType = chartSlab.periodType.id;
                }

                //remove empty values
                _.each(newChartSlabData, function (v, k) {
                    if (!v && v != 0)
                        delete newChartSlabData[k];
                });

                return newChartSlabData;
            }

            scope.incentives = function(index){
                $modal.open({
                    templateUrl: 'incentive.html',
                    controller: IncentiveCtrl,
                    resolve: {
                        data: function () {
                            return scope.chart;
                        },
                        chartSlab: function () {
                            return scope.chart.chartSlabs[index];
                        }
                    }
                });
            }

            /**
             *  copy all chart details to a new Array
             * @param incentiveDatas
             * @returns {Array}
             */
            copyIncentives = function (incentives) {
                var detailsArray = [];
                _.each(incentives, function (incentive) {
                    var incentiveData = copyIncentive(incentive);
                    detailsArray.push(incentiveData);
                });
                return detailsArray;
            }

            /**
             * create new chart detail object data from chartSlab
             * @param incentiveData
             *
             */

            copyIncentive = function (incentiveData) {
                var newIncentiveDataData = {
                    id: incentiveData.id,
                    "entityType":incentiveData.entityType,
                    "attributeName":incentiveData.attributeName.id,
                    "conditionType":incentiveData.conditionType.id,
                    "attributeValue":incentiveData.attributeValue,
                    "incentiveType":incentiveData.incentiveType.id,
                    "amount":incentiveData.amount
                }
                return newIncentiveDataData;
            }

            var IncentiveCtrl = function ($scope, $modalInstance, data,chartSlab) {
                $scope.data = data;
                $scope.chartSlab = chartSlab;
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.addNewRow = function () {
                    var incentive = {
                        "entityType":"2",
                        "attributeName":"",
                        "conditionType":"",
                        "attributeValue":"",
                        "incentiveType":"",
                        "amount":""
                    };

                    $scope.chartSlab.incentives.push(incentive);
                }

                /**
                 * Remove chart details row
                 */
                $scope.removeRow = function (index) {
                    $scope.chartSlab.incentives.splice(index, 1);
                }
            };

            scope.isAccountingEnabled = function () {
                var index = scope.accountingRuleOptions.findIndex(x => x.id == scope.formData.accountingRule && x.value!='NONE');
                if(index > -1){
                    return true;
                }
                return false;
            }

            scope.isAccrualAccountingEnabled = function () {
                var index = scope.accountingRuleOptions.findIndex(x => x.value === 'ACCRUAL PERIODIC');
                if(index > -1){
                    return (scope.formData.accountingRule == scope.accountingRuleOptions[index].id);
                }
                return false;
            }
        }
    });
    mifosX.ng.application.controller('CreateRecurringDepositProductController', ['$scope', 'ResourceFactory', '$location', 'dateFilter','$modal', mifosX.controllers.CreateRecurringDepositProductController]).run(function ($log) {
        $log.info("CreateRecurringDepositProductController initialized");
    });
}(mifosX.controllers || {}));
