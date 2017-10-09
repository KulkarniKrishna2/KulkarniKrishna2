(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateChargeController: function (scope, resourceFactory, location, dateFilter, translate) {
            scope.template = [];
            scope.formData = {};
            scope.first = {};
            scope.isCollapsed = true;
            scope.showdatefield = false;
            scope.repeatEvery = false;
            scope.first.date = new Date();
            scope.translate = translate;
            scope.showOverdueOptions = false;
            scope.showPercentageTyeOptions = false;
            scope.showfeefrequencyinterval = false;
            scope.showPenalty = true ;
            scope.slabs = [];
            scope.slab = {};
            scope.showSlabBasedCharges = false;
            scope.chargeTimeTypeOverdueFees = 9;
            scope.loanChargeCalculationTypePercentageAmountAndFees = 7;
            scope.installmentAmountSlabType = 1;
            scope.installmentNumberSlabType = 2;

            resourceFactory.chargeTemplateResource.get(function (data) {
                scope.template = data;
                scope.showChargePaymentByField = true;
                scope.chargeCalculationTypeOptions = data.chargeCalculationTypeOptions;
                scope.chargeTimeTypeOptions = data.chargeTimeTypeOptions;
                scope.slabChargeTypeOptions = data.slabChargeTypeOptions;
                scope.incomeAccountOptions = data.incomeOrLiabilityAccountOptions.incomeAccountOptions || [];
                scope.liabilityAccountOptions = data.incomeOrLiabilityAccountOptions.liabilityAccountOptions || [];
                scope.incomeAndLiabilityAccountOptions = scope.incomeAccountOptions.concat(scope.liabilityAccountOptions);
                scope.glimChargeCalculationTypeOptions = data.glimChargeCalculationTypeOptions || [];
            });

            scope.sortByFromLoanAmount = function(v1, v2){
                if (v1 && v2) {
                    return v1.fromLoanAmount.localeCompare(v2.fromLoanAmount);
                }
            }

            scope.chargeAppliesToSelected = function (chargeAppliesId) {
                switch(chargeAppliesId) {
                    case 1:
                        scope.showChargePaymentByField = true;
                        scope.chargeCalculationTypeOptions = scope.template.loanChargeCalculationTypeOptions;
                        scope.chargeTimeTypeOptions = scope.template.loanChargeTimeTypeOptions;
                        scope.showGLAccount = false;
                        scope.showIsGlimCharge = true;
                        scope.showEmiRoundingGoalSeek = true;
                        scope.showMinimunCapping = true;
                        scope.showMaximumCapping = true;
                        break ;
                    case 2:
                        scope.showChargePaymentByField = false;
                        scope.chargeCalculationTypeOptions = scope.template.savingsChargeCalculationTypeOptions;
                        scope.chargeTimeTypeOptions = scope.template.savingsChargeTimeTypeOptions;
                        scope.addfeefrequency = false;
                        scope.showGLAccount = false;
                        scope.showIsGlimCharge = false;
                        scope.showEmiRoundingGoalSeek = false;
                        scope.showMinimunCapping = false;
                        scope.showMaximumCapping = false;
                        break ;
                    case 3:
                        scope.showChargePaymentByField = false;
                        scope.chargeCalculationTypeOptions = scope.template.clientChargeCalculationTypeOptions;
                        scope.chargeTimeTypeOptions = scope.template.clientChargeTimeTypeOptions;
                        scope.addfeefrequency = false;
                        scope.showGLAccount = true;
                        scope.showIsGlimCharge = false;
                        scope.showEmiRoundingGoalSeek = false;
                        scope.showMinimunCapping = false;
                        scope.showMaximumCapping = false;
                        break ;
                    case 4:
                        scope.showChargePaymentByField = false;
                        scope.chargeCalculationTypeOptions = scope.template.shareChargeCalculationTypeOptions;
                        scope.chargeTimeTypeOptions = scope.template.shareChargeTimeTypeOptions;
                        scope.addfeefrequency = false;
                        scope.showGLAccount = false;
                        scope.showPenalty = false ;
                        scope.showIsGlimCharge = false;
                        scope.showEmiRoundingGoalSeek = false;
                        scope.showMinimunCapping = false;
                        scope.showMaximumCapping = false;
                        break ;
                }
            }
            //when chargeAppliesTo is savings, below logic is
            //to display 'Due date' field, if chargeTimeType is
            //'annual fee' or 'monthly fee'
            scope.chargeTimeChange = function (chargeTimeType) {
                scope.showOverdueOptions = false;
                if(chargeTimeType == 9){
                    scope.showOverdueOptions = true;
                    scope.formData.overdueChargeDetail = {};
                }else{
                    delete  scope.formData.overdueChargeDetail;
                }
                if (scope.showChargePaymentByField === false) {
                    for (var i in scope.chargeTimeTypeOptions) {
                        if (chargeTimeType === scope.chargeTimeTypeOptions[i].id) {
                            if (scope.chargeTimeTypeOptions[i].value == "Annual Fee" || scope.chargeTimeTypeOptions[i].value == "Monthly Fee" || scope.chargeTimeTypeOptions[i].value == "Daily Fee") {
                                scope.showdatefield = true;
                                scope.repeatsEveryLabel = 'label.input.months';
                                //to show 'repeats every' field for monthly fee
                                if (scope.chargeTimeTypeOptions[i].value == "Monthly Fee") {
                                    scope.repeatEvery = true;
                                } else {
                                    scope.repeatEvery = false;
                                }
                            } else if (scope.chargeTimeTypeOptions[i].value == "Weekly Fee") {
                                scope.repeatEvery = true;
                                scope.showdatefield = false;
                                scope.repeatsEveryLabel = 'label.input.weeks';
                            }
                            else {
                                scope.showdatefield = false;
                                scope.repeatEvery = false;
                            }

                        }
                    }
                }
                showCapitalizedChargeCheckbox();
                scope.percentageTypeOptionDisplay();
            };

            scope.chargeCalculationType = function (chargeCalculationType) {
                if(chargeCalculationType == 6) {
                    scope.showSlabBasedCharges = true;
                } else {
                    scope.showSlabBasedCharges = false;
                }
                showCapitalizedChargeCheckbox();
                scope.percentageTypeOptionDisplay();
                scope.onchangeSetAsCurrentOverdue();
            }

            scope.percentageTypeOptionDisplay= function () {
                scope.showPercentageTyeOptions = scope.showOverdueOptions && scope.formData.chargeCalculationType != 1 &&
                    scope.formData.chargeCalculationType != 6 && scope.addfeefrequency;
                if(!scope.showPercentageTyeOptions){
                    scope.showPercentagePeriodType = false;
                    delete scope.formData.percentageType;
                    delete scope.formData.percentagePeriodType;
                }
            }

            scope.onfeefrequencychange = function(){
                scope.showfeefrequencyinterval = scope.addfeefrequency && scope.formData.feeFrequency != 5;
                if(scope.formData.feeFrequency === 5){
                    delete scope.formData.feeInterval;
                }
                scope.percentageTypeOptionDisplay();
            }

            scope.onPercentageTypeSelect = function(){
                scope.showPercentagePeriodType = scope.showPercentageTyeOptions && scope.formData.percentageType && scope.formData.percentageType === 2;
                if(!scope.showPercentagePeriodType){
                    delete scope.formData.percentagePeriodType;
                }
                scope.onchangeSetAsCurrentOverdue();
            }

            scope.onchangeSetAsCurrentOverdue = function(){
                if(scope.formData.chargeCalculationType == 1 ||  (scope.formData.percentageType != undefined && scope.formData.percentageType == 1) ) {
                    scope.formData.overdueChargeDetail.calculateChargeOnCurrentOverdue = true;
                    scope.formData.overdueChargeDetail.applyChargeForBrokenPeriod = false;
                }
            }

            function showCapitalizedChargeCheckbox() {
                scope.showCapitalizedChargeCheckbox = false;
                if (scope.showSlabBasedCharges == true && scope.formData.chargeTimeType && scope.formData.chargeTimeType == 8) {
                    scope.showCapitalizedChargeCheckbox = true;
                } else {
                    scope.formData.isCapitalized = false;
                }
            };

            scope.getSlabPlaceHolder = function(value,type){
                if(type=="min"){
                    return (value==scope.installmentAmountSlabType)?'label.input.fromloanamount':'label.input.minrepayment';
                }else{
                    return (value==scope.installmentAmountSlabType)?'label.input.toloanamount':'label.input.maxrepayment';
                }
                 
            };            

            scope.getSlabBaseChargeLabel = function(slabChargeType){
                return (slabChargeType==scope.installmentAmountSlabType)?'label.amounts.between':'label.repayments.between';
            };
            
            scope.getSubSlabHeading = function(subSlabType){
                if(subSlabType != undefined){
                    return (subSlabType==scope.installmentAmountSlabType)?'label.heading.based.on.installment.amounts':'label.heading.based.on.number.of.repayments';
                }
            };

            scope.addSlabCharge = function (slab) {
                if(slab.minValue != undefined && slab.maxValue != undefined && slab.amount != undefined) {
                    var slabCharge = {"minValue" : slab.minValue, "maxValue" : slab.maxValue, "amount": slab.amount, "type":scope.slabChargeType};                    
                    slabCharge.subSlabs = [];
                    scope.slabs.push(slabCharge);
                    scope.slabs =  _.sortBy(scope.slabs, 'minValue');
                    scope.slab = {};
                }
            }

            scope.addSubSlabs = function(index){
                scope.slabs[index].subSlabs[scope.slabs[index].subSlabs.length]={};
                scope.slabs[index].subSlabs[scope.slabs[index].subSlabs.length].minValue = 0;
                scope.slabs[index].subSlabs[scope.slabs[index].subSlabs.length].maxValue = 0;
                scope.slabs[index].subSlabs[scope.slabs[index].subSlabs.length].amount = 0;

            };

            scope.updateSubSlabChargeValues = function(subslab,slab,index){
                if(subslab.minValue != undefined && subslab.maxValue != undefined && subslab.amount != undefined) {
                    var slabCharge = slabCharge = {"minValue" : subslab.minValue, "maxValue" : subslab.maxValue, "amount": subslab.amount, "type":scope.subSlabChargeType};
                    slab.subSlabs.push(slabCharge);
                }
            };

            scope.deleteSubSlabs = function (slab, index) {
                slab.subSlabs.splice(index, 1);
            };


            scope.deleteSlabCharge = function (slab) {
                var index = scope.slabs.indexOf(slab);
                scope.slabs.splice(index, 1);
            };


            scope.setChoice = function () {
                if (this.formData.active) {
                    scope.choice = 1;
                }
                else if (!this.formData.active) {
                    scope.choice = 0;
                }
            };

            scope.filterChargeCalculations = function(chargeTimeType) {
                return function (item) {
                    if ((chargeTimeType == 12 && ((item.id == 3) || (item.id == 4))) ||
                        (chargeTimeType != scope.chargeTimeTypeOverdueFees && (item.id == scope.loanChargeCalculationTypePercentageAmountAndFees)))
                    {
                        return false;
                    }
                    return true;
                };
            };

            scope.submit = function () {
                //when chargeTimeType is 'annual' or 'monthly fee' then feeOnMonthDay added to
                //the formData
                var chargeAppliedToLoan = 1;
                var chargeAppliedToClient = 3;
                if (scope.showChargePaymentByField === false) {
                    if (scope.showdatefield === true) {
                        var reqDate = dateFilter(scope.first.date, 'dd MMMM');
                        this.formData.monthDayFormat = 'dd MMM';
                        this.formData.feeOnMonthDay = reqDate;
                    }
                }

                if (scope.slabs.length > 0) {
                    scope.formData.slabs = scope.slabs;
                }

                if( scope.formData.chargeAppliesTo === chargeAppliedToLoan && scope.addfeefrequency == 'false') {
                    scope.formData.feeFrequency = null;
                    scope.formData.feeInterval = null;
                }else if(scope.formData.chargeAppliesTo === chargeAppliedToClient && scope.addfeefrequency == 'false'){
                    scope.formData.feeFrequency = null;
                    scope.formData.feeInterval = 1;
                }

                if (!scope.showChargePaymentByField) {
                    delete this.formData.chargePaymentMode;
                }
                this.formData.active = this.formData.active || false;
                this.formData.isGlimCharge = this.formData.isGlimCharge || false;
                this.formData.emiRoundingGoalSeek = this.formData.emiRoundingGoalSeek || false;
                this.formData.locale = scope.optlang.code;
                this.formData.monthDayFormat = 'dd MMM';
                if(this.formData.emiRoundingGoalSeek != true){
                    this.formData.glimChargeCalculation = undefined;
                }
                resourceFactory.chargeResource.save(this.formData, function (data) {
                    location.path('/viewcharge/' + data.resourceId);
                });
            };
        }
    });
    mifosX.ng.application.controller('CreateChargeController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$translate', mifosX.controllers.CreateChargeController]).run(function ($log) {
        $log.info("CreateChargeController initialized");
    });
}(mifosX.controllers || {}));
