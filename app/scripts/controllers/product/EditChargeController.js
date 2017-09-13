(function (module) {
    mifosX.controllers = _.extend(module, {
        EditChargeController: function (scope, resourceFactory, location, routeParams, dateFilter) {
            scope.template = [];
            scope.showdatefield = false;
            scope.repeatEvery = false;
            scope.first = {};
            scope.flag = false;
	        scope.showPenalty = true ;
            scope.slabs = [];
            scope.slab = {};
            scope.showSlabBasedCharges = false;
            scope.slabBasedChargeCalculation = 6;
            scope.installmentAmountSlabType = 1;
            scope.showOverdueOptions = false;
            scope.showPercentageTyeOptions = false;

            resourceFactory.chargeResource.getCharge({chargeId: routeParams.id, template: true}, function (data) {
                scope.template = data;
                scope.incomeAccountOptions = data.incomeOrLiabilityAccountOptions.incomeAccountOptions || [];
                scope.liabilityAccountOptions = data.incomeOrLiabilityAccountOptions.liabilityAccountOptions || [];
                scope.incomeAndLiabilityAccountOptions = scope.incomeAccountOptions.concat(scope.liabilityAccountOptions);

                if (data.chargeAppliesTo.value === "Loan") {
                    scope.chargeTimeTypeOptions = data.loanChargeTimeTypeOptions;
                    scope.template.chargeCalculationTypeOptions = scope.template.loanChargeCalculationTypeOptions;
                    scope.flag = false;
                    scope.glimChargeCalculationTypeOptions = data.glimChargeCalculationTypeOptions || [];
                    scope.showIsGlimCharge = true;
                    scope.showEmiRoundingGoalSeek = true;
                    scope.showMinimunCapping = true;
                    scope.showMaximumCapping = true;
                } else if (data.chargeAppliesTo.value === "Savings") {
                    scope.chargeTimeTypeOptions = data.savingsChargeTimeTypeOptions;
                    scope.template.chargeCalculationTypeOptions = scope.template.savingsChargeCalculationTypeOptions;
                    scope.flag = true;
                    scope.showIsGlimCharge = false;
                    scope.showEmiRoundingGoalSeek = false;
                    scope.showMinimunCapping = false;
                    scope.showMaximumCapping = false;
                }else if(data.chargeAppliesTo.value === 'Shares') {
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
                }else {
                    scope.flag = true;
                    scope.template.chargeCalculationTypeOptions = data.clientChargeCalculationTypeOptions;
                    scope.chargeTimeTypeOptions = scope.template.clientChargeTimeTypeOptions;
                    scope.showGLAccount = true;
                    scope.showIsGlimCharge = false;
                    scope.showEmiRoundingGoalSeek = false;
                    scope.showMinimunCapping = false;
                    scope.showMaximumCapping = false;
                }

                scope.formData = {
                    name: data.name,
                    active: data.active,
                    penalty: data.penalty,
                    currencyCode: data.currency.code,
                    chargeAppliesTo: data.chargeAppliesTo.id,
                    chargeTimeType: data.chargeTimeType.id,
                    chargeCalculationType: data.chargeCalculationType.id,
                    amount: data.amount,
                    minCap: data.minCap,
                    maxCap: data.maxCap,
                    emiRoundingGoalSeek: data.emiRoundingGoalSeek,
                    isGlimCharge: data.isGlimCharge,
                    glimChargeCalculation: data.glimChargeCalculation.id,
                    slabs: data.slabs,
                    isCapitalized: data.isCapitalized
                };
                scope.slabChargeTypeOptions = data.slabChargeTypeOptions;                

                if(data.chargeCalculationType.id == scope.slabBasedChargeCalculation) {
                    scope.updateSlabOptionsValues(data.slabs);
                    scope.showSlabBasedCharges = true;
                } else {
                    scope.showSlabBasedCharges = false;
                }
                showCapitalizedChargeCheckbox();

                if(data.incomeOrLiabilityAccount){
                    scope.formData.incomeAccountId = data.incomeOrLiabilityAccount.id;
                }

                if(data.taxGroup){
                    scope.formData.taxGroupId = data.taxGroup.id;
                }

                if(data.feeFrequency){
                    scope.addfeefrequency = 'true';
                    scope.formData.feeFrequency = data.feeFrequency.id;
                    scope.formData.feeInterval = data.feeInterval;
                }

                //when chargeAppliesTo is savings, below logic is
                //to display 'Due date' field, if chargeTimeType is
                // 'annual fee' or 'monthly fee'
                if (scope.formData.chargeAppliesTo === 2 || scope.formData.chargeAppliesTo === 3) {
                    if (data.chargeTimeType.value === "Annual Fee" || data.chargeTimeType.value === "Monthly Fee") {
                        scope.showdatefield = true;
                        if (data.feeOnMonthDay) {
                            data.feeOnMonthDay.push(2013);
                            var actDate = dateFilter(data.feeOnMonthDay, 'dd MMMM');
                            scope.first.date = new Date(actDate);
                            //to display "Repeats Every" field ,if chargeTimeType is
                            // 'monthly fee'
                            if (data.chargeTimeType.value === "Monthly Fee") {
                                scope.repeatEvery = true;
                                scope.formData.feeInterval = data.feeInterval;
                            } else {
                                scope.repeatEvery = false;
                            }
                        }
                    } else {
                        scope.showdatefield = false;
                    }
                } else {
                    scope.formData.chargePaymentMode = data.chargePaymentMode.id;
                }

                if(data.percentageType) {
                    scope.formData.percentageType = data.percentageType.id;
                }
                if(data.percentagePeriodType){
                    scope.formData.percentagePeriodType = data.percentagePeriodType.id;
                }
                if(scope.formData.chargeTimeType == 9){
                    scope.showOverdueOptions = true;
                    scope.formData.overdueChargeDetail = {
                        gracePeriod: data.chargeOverdueData.gracePeriod,
                        penaltyFreePeriod: data.chargeOverdueData.penaltyFreePeriod,
                        graceType:data.chargeOverdueData.graceType.id,
                        applyChargeForBrokenPeriod: data.chargeOverdueData.applyChargeForBrokenPeriod,
                        isBasedOnOriginalSchedule: data.chargeOverdueData.isBasedOnOriginalSchedule,
                        considerOnlyPostedInterest: data.chargeOverdueData.considerOnlyPostedInterest,
                        calculateChargeOnCurrentOverdue: data.chargeOverdueData.calculateChargeOnCurrentOverdue,
                        minOverdueAmountRequired: data.chargeOverdueData.minOverdueAmountRequired
                    };
                    scope.percentageTypeOptionDisplay();
                    scope.onfeefrequencychange();
                    scope.onPercentageTypeSelect();
                }

            });

            scope.updateSlabOptionsValues = function(slabs){
                scope.isSubSlabSEnabled = false;
                if(slabs != undefined && slabs.length>0){
                    scope.slabChargeType = slabs[0].type.id;
                    for(var i in slabs){
                        slabs[i].type = slabs[i].type.id;
                        if(slabs[i].subSlabs != undefined && slabs[i].subSlabs.length>0){
                            scope.subSlabChargeType = slabs[i].subSlabs[0].type.id;
                            scope.isSubSlabSEnabled = true;
                            for(var j in slabs[i].subSlabs){
                                slabs[i].subSlabs[j].type = slabs[i].subSlabs[j].type.id;;
                            }
                            
                        }
                    }
                }

            };
            //when chargeAppliesTo is savings, below logic is
            //to display 'Due date' field, if chargeTimeType is
            // 'annual fee' or 'monthly fee'
            scope.chargeTimeChange = function (chargeTimeType) {
                scope.showOverdueOptions = false;
                if(chargeTimeType == 9){
                    scope.showOverdueOptions = true;
                    scope.formData.overdueChargeDetail = {};
                }else{
                    delete  scope.formData.overdueChargeDetail;
                }
                if (scope.formData.chargeAppliesTo === 2 || scope.formData.chargeAppliesTo === 3) {
                    for (var i in scope.template.chargeTimeTypeOptions) {
                        if (chargeTimeType === scope.template.chargeTimeTypeOptions[i].id) {
                            if (scope.template.chargeTimeTypeOptions[i].value == "Annual Fee" || scope.template.chargeTimeTypeOptions[i].value == "Monthly Fee") {
                                scope.showdatefield = true;
                                //to show 'repeats every' field for monthly fee
                                if (scope.template.chargeTimeTypeOptions[i].value == "Monthly Fee") {
                                    scope.repeatEvery = true;
                                } else {
                                    scope.repeatEvery = false;
                                }
                            } else {
                                scope.showdatefield = false;
                            }
                        }
                    }
                }
                showCapitalizedChargeCheckbox();
                scope.percentageTypeOptionDisplay();
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

            scope.getSlabPlaceHolder = function(value,type){
                if(type=="min"){
                    return (value==scope.installmentAmountSlabType)?'label.input.fromloanamount':'label.input.minrepayment';
                }else{
                    return (value==scope.installmentAmountSlabType)?'label.input.toloanamount':'label.input.maxrepayment';
                }
                 
            };

            scope.getSlabBaseChargeLabel = function(slabChargeType){
                return (slabChargeType==scope.installmentAmountSlabType)?'label.amountsbetween':'label.repaymentsbetween';
            }

            scope.deleteSubSlabs = function (slab, index) {
                slab.subSlabs.splice(index, 1);
            }

            scope.addSubSlabs = function(index){
                scope.slabs[index].subSlabs[scope.slabs[index].subSlabs.length]={};
                scope.slabs[index].subSlabs[scope.slabs[index].subSlabs.length].minValue = 0;
                scope.slabs[index].subSlabs[scope.slabs[index].subSlabs.length].maxValue = 0;
                scope.slabs[index].subSlabs[scope.slabs[index].subSlabs.length].amount = 0;

            };

            scope.chargeCalculationType = function (chargeCalculationType) {
                if(chargeCalculationType == scope.slabBasedChargeCalculation) {
                    scope.showSlabBasedCharges = true;
                    scope.formData.amount = undefined;
                } else {
                    scope.showSlabBasedCharges = false;
                    scope.formData.slabs = [];
                }
                showCapitalizedChargeCheckbox();
                scope.percentageTypeOptionDisplay();
                scope.onchangeSetAsCurrentOverdue();
            };
            
            scope.getSubSlabHeading = function(subSlabType){
                if(subSlabType != undefined){
                    return (subSlabType==scope.installmentAmountSlabType)?'label.heading.based.on.installment.amounts':'label.heading.based.on.number.of.repayments';
                }
            };

            function showCapitalizedChargeCheckbox() {
                scope.showCapitalizedChargeCheckbox = false;
                if (scope.showSlabBasedCharges == true && scope.formData.chargeTimeType && scope.formData.chargeTimeType == 8) {
                    scope.showCapitalizedChargeCheckbox = true;
                } else {
                    scope.formData.isCapitalized = false;
                }
            };

            scope.addSlabCharge = function (slab) {
                if(slab.minValue != undefined && slab.maxValue != undefined && slab.amount != undefined) {
                    var slabCharge = {"minValue" : slab.minValue, "maxValue" : slab.maxValue, "amount": slab.amount, "type":scope.slabChargeType};
                    if( scope.formData.slabs == undefined) {
                        scope.formData.slabs = [];
                    }
                    slabCharge.subSlabs = [];
                    scope.slab = {};
                    scope.formData.slabs.push(slabCharge);
                }
            }

            scope.updateSubSlabChargeValues = function(minValue,maxValue,amount,slab,index){
                if(minValue != undefined && maxValue != undefined && amount != undefined) {
                    var slabCharge = slabCharge = {"minValue" : minValue, "maxValue" : maxValue, "amount": amount, "type":scope.subSlabChargeType};
                    slab.subSlabs.push(slabCharge);
                }  

            };

            scope.deleteSubSlabs = function (slab, index) {
                slab.subSlabs.splice(index, 1);
            };

            scope.deleteSlabCharge = function (slab) {
                var index = scope.formData.slabs.indexOf(slab);
                scope.formData.slabs.splice(index, 1);
            }

            scope.submit = function () {
                if (scope.formData.chargeAppliesTo === 2 || scope.formData.chargeAppliesTo === 3) {
                    if (scope.showdatefield === true) {
                        var reqDate = dateFilter(scope.first.date, 'dd MMMM');
                        this.formData.monthDayFormat = 'dd MMM';
                        this.formData.feeOnMonthDay = reqDate;
                    }
                }else if(scope.addfeefrequency == 'false'){
                    scope.formData.feeFrequency = null;
                    scope.formData.feeInterval = null;
                }
                if(this.formData.minCap == undefined) {
                    this.formData.minCap = null;
                }
                if(this.formData.maxCap == undefined) {
                    this.formData.maxCap = null;
                }
                if(scope.formData.chargeCalculationType == scope.slabBasedChargeCalculation){
                    this.formData.amount = null;
                }else {
                    this.formData.isCapitalized = false;
                }
                this.formData.locale = scope.optlang.code;
                this.formData.active = this.formData.active || false;
                this.formData.penalty = this.formData.penalty || false;
                resourceFactory.chargeResource.update({chargeId: routeParams.id}, this.formData, function (data) {
                    location.path('/viewcharge/' + data.resourceId);
                });
            };
        }
    });
    mifosX.ng.application.controller('EditChargeController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.EditChargeController]).run(function ($log) {
        $log.info("EditChargeController initialized");
    });
}(mifosX.controllers || {}));
