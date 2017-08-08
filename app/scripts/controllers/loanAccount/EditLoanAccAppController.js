(function (module) {
    mifosX.controllers = _.extend(module, {
        EditLoanAccAppController: function (scope, routeParams, resourceFactory, location, dateFilter) {

            scope.previewRepayment = false;
            scope.formData = {};
            scope.temp = {};
            scope.chargeFormData = {}; //For charges
            scope.collateralFormData = {}; //For collaterals
            scope.collaterals = [];
            scope.restrictDate = new Date();
            scope.date = {};
            scope.isGLIM = false;
            scope.GLIMData = {};
            scope.clientMembers = [];
            scope.repeatsOnDayOfMonthOptions = [];
            scope.selectedOnDayOfMonthOptions = [];
            scope.fetchRDAccountOnly = scope.response.uiDisplayConfigurations.loanAccount.savingsAccountLinkage.reStrictLinkingToRDAccount;
            for (var i = 1; i <= 28; i++) {
                scope.repeatsOnDayOfMonthOptions.push(i);
            }
            scope.slabBasedCharge = 'Slab Based';
            scope.flatCharge = "Flat";
            scope.upfrontFee = "Upfront Fee";

            scope.interestRatesListPerPeriod = [];
            scope.interestRatesListAvailable = false;

            scope.extenalIdReadOnlyType = scope.response.uiDisplayConfigurations.loanAccount.isReadOnlyField.externalId;
            scope.glimAutoCalPrincipalAmount = function () {
                var totalPrincipalAmount = 0.0;
                for(var i in scope.formData.clientMembers){
                    if(scope.formData.clientMembers[i].isClientSelected && scope.formData.clientMembers[i].transactionAmount){
                        totalPrincipalAmount += parseFloat(scope.formData.clientMembers[i].transactionAmount);
                    }
                }
                scope.formData.principal = totalPrincipalAmount;
            };

            scope.glimAutoCalFlatFeeAmount = function (index, glimMembers) {
                var totalUpfrontChargeAmount = 0.0;
                for(var i in glimMembers){
                    if(glimMembers[i].isClientSelected && glimMembers[i].upfrontChargeAmount){
                        totalUpfrontChargeAmount += parseFloat(glimMembers[i].upfrontChargeAmount);
                    }
                }
                scope.charges[index].amountOrPercentage = totalUpfrontChargeAmount;
            };

            resourceFactory.loanResource.get({loanId: routeParams.id, template: true, associations: 'charges,collateral,meeting,multiDisburseDetails',staffInSelectedOfficeOnly:true, fetchRDAccountOnly: scope.fetchRDAccountOnly}, function (data) {
                scope.loanaccountinfo = data;
                if(scope.loanaccountinfo.expectedDisbursalPaymentType){
                    scope.formData.expectedDisbursalPaymentType = scope.loanaccountinfo.expectedDisbursalPaymentType.id;
                }
                if(scope.loanaccountinfo.expectedRepaymentPaymentType){
                    scope.formData.expectedRepaymentPaymentType = scope.loanaccountinfo.expectedRepaymentPaymentType.id;
                }

                if(data.interestRatesListPerPeriod != undefined && data.interestRatesListPerPeriod.length > 0){
                        scope.interestRatesListPerPeriod = data.interestRatesListPerPeriod;
                        scope.interestRatesListAvailable = true;
                }

                resourceFactory.glimResource.getAllByLoan({loanId: routeParams.id}, function (glimData) {
                    scope.GLIMData = glimData;
                    scope.isGLIM = (glimData.length > 0);
                    if (scope.isGLIM){
                        scope.formData.clientMembers = [];
                        for (var i=0;i<glimData.length;i++) {
                            scope.formData.clientMembers[i] = {};
                            scope.formData.clientMembers[i].id = glimData[i].clientId;
                            scope.formData.clientMembers[i].glimId = glimData[i].id;
                            scope.formData.clientMembers[i].clientName = glimData[i].clientName;
                            scope.formData.clientMembers[i].clientExternalID = glimData[i].clientExternalID;
                            scope.formData.clientMembers[i].transactionAmount = glimData[i].proposedAmount;
                            scope.formData.clientMembers[i].loanPurposeId = glimData[i].loanPurpose.id;
                            scope.formData.clientMembers[i].isClientSelected = glimData[i].isClientSelected;
                            scope.formData.clientMembers[i].accountNo = glimData[i].clientId;
                            scope.formData.clientMembers[i].displayName = glimData[i].clientName;
                            scope.formData.clientMembers[i].upfrontChargeAmount = glimData[i].chargeAmount;
                        }

                        scope.templateType = 'glim';
                        scope.glimAutoCalPrincipalAmount();

                        scope.previewClientLoanAccInfo();
                    }
                });

                scope.getProductPledges(scope.loanaccountinfo);

                resourceFactory.loanResource.get({resourceType: 'template', templateType: 'collateral', productId: data.loanProductId, fields: 'id,loanCollateralOptions'}, function (data) {
                    scope.collateralOptions = data.loanCollateralOptions || [];
                });


                if(scope.response && scope.response.uiDisplayConfigurations.loanAccount.isAutoPopulate.interestChargedFromDate){
                    scope.$watch('formData.expectedDisbursementDate ', function(){
                        if(scope.formData.expectedDisbursementDate != '' && scope.formData.expectedDisbursementDate != undefined){
                            scope.formData.interestChargedFromDate = scope.formData.expectedDisbursementDate;
                        }
                    });
                }

                if (data.clientId) {
                    scope.clientId = data.clientId;
                    scope.clientName = data.clientName;
                    scope.formData.clientId = scope.clientId;
                }

                if (data.group) {
                    scope.groupId = data.group.id;
                    scope.groupName = data.group.name;
                    scope.formData.groupId = scope.groupId;
                }

                if (scope.clientId && scope.groupId) {
                    scope.templateType = 'jlg';
                }
                else if (scope.groupId) {
                    scope.templateType = 'group';
                }
                else if (scope.clientId) {
                    scope.templateType = 'individual';
                }

                scope.formData.loanOfficerId = data.loanOfficerId;
                scope.formData.loanPurposeId = data.loanPurposeId;
                scope.formData.externalId = data.externalId;

                //update collaterals
                if (scope.loanaccountinfo.collateral) {
                    for (var i in scope.loanaccountinfo.collateral) {
                        scope.collaterals.push({type: scope.loanaccountinfo.collateral[i].type.id, name: scope.loanaccountinfo.collateral[i].type.name, value: scope.loanaccountinfo.collateral[i].value, description: scope.loanaccountinfo.collateral[i].description});
                    }
                }

                scope.previewClientLoanAccInfo();

            });

             scope.$watch('productLoanCharges', function(){
                if(angular.isDefined(scope.productLoanCharges) && scope.productLoanCharges.length>0 && scope.isGLIM){
                    for(var i in scope.loanaccountinfo.chargeOptions){
                        if(!scope.loanaccountinfo.chargeOptions[i].isGlimCharge){ 
                            var isProductCharge = false;
                            for(var j in scope.productLoanCharges){
                                if(!scope.loanaccountinfo.chargeOptions[i].id == scope.productLoanCharges[j].chargeData.id){                                
                                   var isProductCharge = true;
                                }
                            }    
                            if(!isProductCharge){
                                scope.loanaccountinfo.chargeOptions.splice(i,1); 
                            }
                        }                        
                    }
                }
            });

            scope.loanProductChange = function (loanProductId) {
                scope.interestRatesListPerPeriod = [];
                scope.interestRatesListAvailable = false;
                var inparams = { resourceType: 'template', productId: loanProductId, templateType: scope.templateType };
                var inparams = { resourceType: 'template', productId: loanProductId, templateType: scope.templateType, fetchRDAccountOnly: scope.fetchRDAccountOnly };
                if (scope.clientId) {
                    inparams.clientId = scope.clientId;
                }
                if (scope.groupId) {
                    inparams.groupId = scope.groupId;
                }

                inparams.staffInSelectedOfficeOnly = true;
                resourceFactory.loanResource.get(inparams, function (data) {
                    scope.loanaccountinfo = data;
                    scope.collaterals = [];
                    var refreshLoanCharges  = true;
                    scope.previewClientLoanAccInfo(refreshLoanCharges);
                    scope.updateSlabBasedCharges();
                    if(data.interestRatesListPerPeriod != undefined && data.interestRatesListPerPeriod.length > 0){
                       scope.interestRatesListPerPeriod = data.interestRatesListPerPeriod;
                       scope.interestRatesListAvailable = true;
                    }
                });

                resourceFactory.loanResource.get({resourceType: 'template', templateType: 'collateral', productId: loanProductId, fields: 'id,loanCollateralOptions'}, function (data) {
                    scope.collateralOptions = data.loanCollateralOptions || [];
                });
            }

            scope.previewClientLoanAccInfo = function (refreshLoanCharges) {
                if ( _.isUndefined(refreshLoanCharges)) {
                    refreshLoanCharges = false; }
                scope.previewRepayment = false;
                for (var i in scope.loanaccountinfo.charges) {
                    if (scope.loanaccountinfo.charges[i].dueDate) {
                        if(scope.loanaccountinfo.charges[i].chargeTimeType.value == "Disbursement" ||
                            scope.loanaccountinfo.charges[i].chargeTimeType.value == "Tranche Disbursement"){
                            scope.loanaccountinfo.charges[i].dueDate = null;
                        }else{
                            scope.loanaccountinfo.charges[i].dueDate = new Date(scope.loanaccountinfo.charges[i].dueDate);
                        }

                    }
                    if(scope.loanaccountinfo.charges[i].chargeCalculationType.value == scope.slabBasedCharge) {
                        scope.loanaccountinfo.charges[i] = scope.updateChargeForSlab( scope.loanaccountinfo.charges[i]);                        
                    }else if ( scope.loanaccountinfo.charges[i].chargeCalculationType.value == scope.flatCharge){
                               resourceFactory.chargeResource.get({chargeId: scope.loanaccountinfo.charges[i].chargeId, template: 'true'}, function (charge) {
                            for ( var k in scope.loanaccountinfo.charges) {
                                    if ( scope.loanaccountinfo.charges[k].chargeId == charge.id){
                                        if (scope.isGLIM){
                                            scope.updateUpfrontChargeData(scope.loanaccountinfo.charges[k],charge);
                                        }
                                }
                            }
                        });  
                    }
                }
                scope.charges = scope.loanaccountinfo.charges || [];
                if(refreshLoanCharges){
                    scope.charges = [];
                }
                scope.productLoanCharges = scope.loanaccountinfo.product.charges || [];
                if(scope.productLoanCharges && scope.productLoanCharges.length > 0){
                    for(var i in scope.productLoanCharges){
                        if(scope.productLoanCharges[i].chargeData){
                            //if(scope.productLoanCharges[i].isMandatory && scope.productLoanCharges[i].isMandatory == true){
                                var isChargeAdded = false;
                                var loanChargeAmount = 0;
                                for(var j in scope.charges){
                                    if(scope.productLoanCharges[i].chargeData.id == scope.charges[j].chargeId){
                                        scope.charges[j].isMandatory = scope.productLoanCharges[i].isMandatory;
                                        isChargeAdded = true;
                                        loanChargeAmount = scope.charges[j].amountOrPercentage;
                                        break;
                                    }
                                }
                                if((refreshLoanCharges &&  scope.productLoanCharges[i].chargeData.penalty == false)  || (isChargeAdded == false &&  scope.productLoanCharges[i].isMandatory == true)){
                                    var charge = scope.productLoanCharges[i].chargeData;
                                    charge.chargeId = charge.id;
                                    charge.id = null;
                                    if(isChargeAdded){
                                        charge.amountOrPercentage = loanChargeAmount;
                                    }else{
                                        charge.amountOrPercentage = charge.amount;
                                    }                                    
                                    charge.isMandatory = scope.productLoanCharges[i].isMandatory;
                                    if(charge.chargeCalculationType.value == scope.slabBasedCharge){
                                        for(var i in charge.slabs) {
                                            if(scope.formData.principal >= charge.slabs[i].fromLoanAmount && scope.formData.principal <= charge.slabs[i].toLoanAmount) {
                                                charge.amountOrPercentage = charge.slabs[i].amount;
                                            }
                                        }
                                    }
                                    scope.charges.push(charge);
                                }
                            //}
                        }
                    }
                }

                scope.formData.disbursementData = scope.loanaccountinfo.disbursementDetails || [];
                if (scope.formData.disbursementData.length > 0) {
                    for (var i in scope.formData.disbursementData) {
                        scope.formData.disbursementData[i].expectedDisbursementDate = new Date(scope.formData.disbursementData[i].expectedDisbursementDate);
                    }
                }

                if (scope.loanaccountinfo.timeline.submittedOnDate) {
                    scope.formData.submittedOnDate = new Date(scope.loanaccountinfo.timeline.submittedOnDate);
                }
                if (scope.loanaccountinfo.timeline.expectedDisbursementDate) {
                    scope.formData.expectedDisbursementDate = new Date(scope.loanaccountinfo.timeline.expectedDisbursementDate);
                }
                if (scope.loanaccountinfo.interestChargedFromDate) {
                    scope.formData.interestChargedFromDate = new Date(scope.loanaccountinfo.interestChargedFromDate);
                }
                if (scope.loanaccountinfo.expectedFirstRepaymentOnDate) {
                    scope.formData.repaymentsStartingFromDate = new Date(scope.loanaccountinfo.expectedFirstRepaymentOnDate);
                }
                if(scope.loanaccountinfo.fundId){
                    scope.formData.fundId = scope.loanaccountinfo.fundId;
                }

                if(scope.loanaccountinfo.isInterestRecalculationEnabled){
                    if (scope.loanaccountinfo.interestRecalculationData.recalculationRestFrequencyStartDate) {
                        scope.recalculationRestFrequencyStartDate = new Date(scope.loanaccountinfo.interestRecalculationData.recalculationRestFrequencyStartDate);
                    }
                    if (scope.loanaccountinfo.interestRecalculationData.recalculationCompoundingFrequencyStartDate) {
                        scope.recalculationCompoundingFrequencyStartDate = new Date(scope.loanaccountinfo.interestRecalculationData.recalculationCompoundingFrequencyStartDate);
                    }
                }

                scope.multiDisburseLoan = scope.loanaccountinfo.multiDisburseLoan;
                scope.formData.productId = scope.loanaccountinfo.loanProductId;
                if(scope.isGLIM){
                    scope.glimAutoCalPrincipalAmount();
                }else{
                    scope.formData.principal = scope.loanaccountinfo.principal;
                }
                scope.formData.loanTermFrequencyType = scope.loanaccountinfo.termPeriodFrequencyType.id;
                scope.formData.numberOfRepayments = scope.loanaccountinfo.numberOfRepayments;
                scope.formData.repaymentEvery = scope.loanaccountinfo.repaymentEvery;
                scope.formData.repaymentFrequencyType = scope.loanaccountinfo.repaymentFrequencyType.id;
                if (scope.loanaccountinfo.repaymentFrequencyNthDayType != null)
                    scope.formData.repaymentFrequencyNthDayType = scope.loanaccountinfo.repaymentFrequencyNthDayType.id;
                if(scope.loanaccountinfo.repaymentFrequencyDayOfWeekType != null)
                    scope.formData.repaymentFrequencyDayOfWeekType = scope.loanaccountinfo.repaymentFrequencyDayOfWeekType.id;
                scope.formData.interestRatePerPeriod = scope.loanaccountinfo.interestRatePerPeriod;
                if(scope.loanaccountinfo.flatInterestRate != null){
                    scope.formData.interestRatePerPeriod = scope.loanaccountinfo.flatInterestRate;
                }
                scope.formData.interestRateFrequencyType = scope.loanaccountinfo.interestRateFrequencyType.id;
                scope.formData.amortizationType = scope.loanaccountinfo.amortizationType.id;
                scope.formData.interestType = scope.loanaccountinfo.interestType.id;
                scope.formData.interestCalculationPeriodType = scope.loanaccountinfo.interestCalculationPeriodType.id;
                scope.formData.allowPartialPeriodInterestCalcualtion = scope.loanaccountinfo.allowPartialPeriodInterestCalcualtion;
                scope.formData.inArrearsTolerance = scope.loanaccountinfo.inArrearsTolerance;
                scope.formData.graceOnPrincipalPayment = scope.loanaccountinfo.graceOnPrincipalPayment;
				scope.formData.recurringMoratoriumOnPrincipalPeriods = scope.loanaccountinfo.recurringMoratoriumOnPrincipalPeriods;
                scope.formData.graceOnInterestPayment = scope.loanaccountinfo.graceOnInterestPayment;
                scope.formData.graceOnArrearsAgeing = scope.loanaccountinfo.graceOnArrearsAgeing;
                scope.formData.transactionProcessingStrategyId = scope.loanaccountinfo.transactionProcessingStrategyId;
                scope.formData.graceOnInterestCharged = scope.loanaccountinfo.graceOnInterestCharged;
                scope.formData.fixedEmiAmount = scope.loanaccountinfo.fixedEmiAmount;
                scope.formData.maxOutstandingLoanBalance = scope.loanaccountinfo.maxOutstandingLoanBalance;
                scope.formData.createStandingInstructionAtDisbursement = scope.loanaccountinfo.createStandingInstructionAtDisbursement;
                scope.formData.isTopup = scope.loanaccountinfo.isTopup;
                scope.formData.loanIdToClose = scope.loanaccountinfo.closureLoanId;
                if (scope.loanaccountinfo.brokenPeriodMethodType) {
                    scope.formData.brokenPeriodMethodType = scope.loanaccountinfo.brokenPeriodMethodType.id;
                }else{
                    scope.formData.brokenPeriodMethodType = "";
                }

                if (scope.loanaccountinfo.meeting && (scope.loanaccountinfo.meeting.title.startsWith("centers") || scope.loanaccountinfo.meeting.title.startsWith("groups"))) {
                    scope.temp.syncRepaymentsWithMeeting = true;
                }

                if (scope.loanaccountinfo.meeting && scope.loanaccountinfo.meeting.title.startsWith("loan_schedule")){
                    scope.formData.repaymentFrequencyNthDayType = scope.loanaccountinfo.meeting.repeatsOnNthDayOfMonth.id;
                    if (scope.loanaccountinfo.meeting.repeatsOnDay) {
                        scope.formData.repaymentFrequencyDayOfWeekType = scope.loanaccountinfo.meeting.repeatsOnDay.id;
                    }
                    if (scope.loanaccountinfo.meeting.repeatsOnDayOfMonth) {
                        scope.available = scope.loanaccountinfo.meeting.repeatsOnDayOfMonth;
                        scope.addMonthDay();
                    }
                }

                if(scope.response && !scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.syncDisbursementWithMeeting){
                    scope.formData.syncDisbursementWithMeeting = false;
                }else{
                    scope.formData.syncDisbursementWithMeeting = scope.loanaccountinfo.syncDisbursementWithMeeting;
                }

                if (scope.loanaccountinfo.linkedAccount) {
                    scope.formData.linkAccountId = scope.loanaccountinfo.linkedAccount.id;
                }
                if (scope.loanaccountinfo.isInterestRecalculationEnabled && scope.loanaccountinfo.interestRecalculationData.recalculationRestFrequencyDate) {
                    scope.date.recalculationRestFrequencyDate = new Date(scope.loanaccountinfo.interestRecalculationData.recalculationRestFrequencyDate);
                }
                if (scope.loanaccountinfo.isInterestRecalculationEnabled && scope.loanaccountinfo.interestRecalculationData.recalculationCompoundingFrequencyDate) {
                    scope.date.recalculationCompoundingFrequencyDate = new Date(scope.loanaccountinfo.interestRecalculationData.recalculationCompoundingFrequencyDate);
                }
                scope.formData.interestRateDifferential = scope.loanaccountinfo.interestRateDifferential ;
                scope.formData.isFloatingInterestRate = scope.loanaccountinfo.isFloatingInterestRate ;
                if(!scope.loanaccountinfo.multiDisburseLoan) {
                    scope.formData.discountOnDisbursalAmount = scope.loanaccountinfo.discountOnDisbursalAmount;
                }
                scope.formData.amountForUpfrontCollection = scope.loanaccountinfo.amountForUpfrontCollection ;
            }

            scope.addCharge = function () {
                if (scope.chargeFormData.chargeId) {
                    resourceFactory.chargeResource.get({chargeId: this.chargeFormData.chargeId, template: 'true'}, function (data) {
                        data.chargeId = data.id;
                        data.id = null;
                        data.amountOrPercentage = data.amount;
                        data.isMandatory = false;
                        data = scope.updateChargeForSlab(data);
                        scope.charges.push(data);
                        
                        scope.chargeFormData.chargeId = undefined;
                    });
                }
            }

            scope.updateUpfrontChargeData = function(data, chargeData){
                if(scope.isGLIM && scope.formData.clientMembers) {
                    var clientMembers = scope.formData.clientMembers || [];
                    data.glims = [];
                    angular.copy(clientMembers, data.glims);
                    var amount = 0;
                    for(var i in data.glims){
                        if (data.chargeCalculationType.value == scope.flatCharge){
                                data.glims[i].upfrontChargeAmount = chargeData.amount;
                                amount = amount + data.glims[i].upfrontChargeAmount;
                        }
                    }
                }
                data.amountOrPercentage = amount;
            }

            scope.updateChargeForSlab = function(data){
                if(scope.isGLIM && scope.formData.clientMembers) {
                    var clientMembers = scope.formData.clientMembers || [];
                    data.glims = [];
                    angular.copy(clientMembers, data.glims);
                    var amount = 0;
                    for(var i in data.glims){
                        if(data.glims[i].isClientSelected){
                            if(data.chargeCalculationType.value == scope.slabBasedCharge){
                                if (data.slabs){
                                    var isInRange = false;
                                    for(var j in data.slabs){
                                       if(data.glims[i].transactionAmount >= data.slabs[j].fromLoanAmount && data.glims[i].transactionAmount <= data.slabs[j].toLoanAmount){
                                                data.glims[i].upfrontChargeAmount = data.slabs[j].amount; 
                                                amount = amount + data.glims[i].upfrontChargeAmount;
                                                isInRange = true;
                                                break;
                                        }
                                    }

                                    if(!isInRange){
                                        data.glims[i].upfrontChargeAmount = undefined;
                                        amount = undefined;   
                                    }
                                }else{
                                    data.glims[i].upfrontChargeAmount = undefined;
                                    amount = undefined;
                                }                                
                            
                            } else if (data.chargeCalculationType.value == scope.flatCharge){
                                    data.glims[i].upfrontChargeAmount = data.amount;
                                    amount = amount + data.glims[i].upfrontChargeAmount;
                                    
                            }
                        }else{
                            data.glims[i].upfrontChargeAmount = 0;
                            amount = 0;
                        }
                    }
                    data.amountOrPercentage = amount;
                    return data;

                }else{
                    if(data.chargeCalculationType.value == scope.slabBasedCharge){                    
                        for(var j in data.slabs){
                            if(scope.formData.principal >= data.slabs[j].fromLoanAmount && scope.formData.principal <= data.slabs[j].toLoanAmount) {
                                data.amountOrPercentage = data.slabs[j].amount;
                                 break;
                            }else {
                                data.amountOrPercentage = undefined;
                            }
                        }
                    }
                }
                return data;
            }

            scope.deleteCharge = function (index) {
                scope.charges.splice(index, 1);
            }

            scope.addTranches = function () {
                scope.formData.disbursementData.push({
                });
            };
            scope.deleteTranches = function (index) {
                scope.formData.disbursementData.splice(index, 1);
            }


            scope.syncRepaymentsWithMeetingchange = function () {
                if (!scope.temp.syncRepaymentsWithMeeting) {
                    scope.formData.syncDisbursementWithMeeting = false;
                }
            };

            scope.syncDisbursementWithMeetingchange = function () {
                if (scope.formData.syncDisbursementWithMeeting) {
                    scope.temp.syncRepaymentsWithMeeting = true;
                }
            };

            scope.$watch('formData.principal ', function(){
                scope.updateSlabBasedCharges();
            });

            scope.updateSlabBasedCharges = function(){         
                if(scope.formData.principal != '' && scope.formData.principal != undefined){
                    for(var i in scope.charges){
                        if(scope.charges[i].chargeCalculationType.value == scope.slabBasedCharge) {
                            scope.charges[i] = scope.updateChargeForSlab(scope.charges[i]);
                        }
                    }
                }
            };

            scope.addCollateral = function () {
                if (scope.collateralFormData.collateralIdTemplate && scope.collateralFormData.collateralValueTemplate) {
                    scope.collaterals.push({type: scope.collateralFormData.collateralIdTemplate.id, name: scope.collateralFormData.collateralIdTemplate.name, value: scope.collateralFormData.collateralValueTemplate, description: scope.collateralFormData.collateralDescriptionTemplate});
                    scope.collateralFormData.collateralIdTemplate = undefined;
                    scope.collateralFormData.collateralValueTemplate = undefined;
                    scope.collateralFormData.collateralDescriptionTemplate = undefined;
                }
            };

            scope.deleteCollateral = function (index) {
                scope.collaterals.splice(index, 1);
            };

            scope.loanTermCalculation=function(){
                scope.loanTerm= scope.formData.numberOfRepayments*scope.formData.repaymentEvery;
            }


            scope.previewRepayments = function () {
                // Make sure charges and collaterals are empty before initializing.
                delete scope.formData.charges;
                delete scope.formData.collateral;

                if (scope.charges.length > 0) {
                    scope.formData.charges = [];
                    for (var i in scope.charges) {
                        if (scope.charges[i].amountOrPercentage > 0) {
                            scope.formData.charges.push({
                                chargeId: scope.charges[i].chargeId,
                                amount: scope.charges[i].amountOrPercentage,
                                dueDate: dateFilter(scope.charges[i].dueDate, scope.df),
                                upfrontChargesAmount: scope.charges[i].glims
                            });
                        }
                    }
                }

                if (scope.formData.disbursementData.length > 0) {
                    for (var i in scope.formData.disbursementData) {
                        scope.formData.disbursementData[i].expectedDisbursementDate = dateFilter(scope.formData.disbursementData[i].expectedDisbursementDate,  scope.df);
                    }
                }

                if (scope.collaterals.length > 0) {
                    scope.formData.collateral = [];
                    for (var i in scope.collaterals) {
                        scope.formData.collateral.push({type: scope.collaterals[i].type, value: scope.collaterals[i].value, description: scope.collaterals[i].description});
                    }
                    
                }

                if (scope.temp.syncRepaymentsWithMeeting) {
                    this.formData.calendarId = scope.loanaccountinfo.calendarOptions[0].id;
                }
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.loanType = scope.templateType;
                this.formData.loanTermFrequency = scope.loanTerm;
                this.formData.expectedDisbursementDate = dateFilter(this.formData.expectedDisbursementDate, scope.df);
                this.formData.submittedOnDate = dateFilter(this.formData.submittedOnDate, scope.df);
                this.formData.interestChargedFromDate = dateFilter(this.formData.interestChargedFromDate, scope.df);
                this.formData.repaymentsStartingFromDate = dateFilter(this.formData.repaymentsStartingFromDate, scope.df);
                this.formData.recalculationRestFrequencyStartDate = dateFilter(scope.recalculationRestFrequencyStartDate, scope.df);
                this.formData.recalculationCompoundingFrequencyStartDate = dateFilter(scope.recalculationCompoundingFrequencyStartDate, scope.df);
                if(!scope.loanaccountinfo.isLoanProductLinkedToFloatingRate) {
                    delete this.formData.interestRateDifferential ;
                    delete this.formData.isFloatingInterestRate ;
                }
                if(scope.formData.repaymentFrequencyType == 2 && scope.formData.repaymentFrequencyNthDayType){
                    scope.formData.repeatsOnDayOfMonth = scope.selectedOnDayOfMonthOptions;
                }else{
                    scope.formData.repeatsOnDayOfMonth = [];
                }
                resourceFactory.loanResource.save({command: 'calculateLoanSchedule'}, this.formData, function (data) {
                    scope.repaymentscheduleinfo = data;
                    scope.previewRepayment = true;
                });
            }

            scope.submit = function () {
                // Make sure charges and collaterals are empty before initializing.
                delete scope.formData.charges;
                delete scope.formData.collateral;

                if (scope.formData.disbursementData.length > 0) {
                    for (var i in scope.formData.disbursementData) {
                        scope.formData.disbursementData[i].expectedDisbursementDate = dateFilter(scope.formData.disbursementData[i].expectedDisbursementDate, scope.df);
                    }
                }

                scope.formData.charges = [];
                if (scope.charges.length > 0) {
                    for (var i in scope.charges) {
                        if (scope.charges[i].amountOrPercentage > 0) {
                            scope.formData.charges.push({
                                id: scope.charges[i].id,
                                chargeId: scope.charges[i].chargeId,
                                amount: scope.charges[i].amountOrPercentage,
                                dueDate: dateFilter(scope.charges[i].dueDate, scope.df),
                                upfrontChargesAmount: scope.charges[i].glims
                            });
                        }
                    }
                }

                scope.formData.collateral = [];
                if (scope.collaterals.length > 0) {
                    for (var i in scope.collaterals) {
                        scope.formData.collateral.push({type: scope.collaterals[i].type, value: scope.collaterals[i].value, description: scope.collaterals[i].description});
                    }
                    ;
                }

                if (scope.temp.syncRepaymentsWithMeeting) {
                    this.formData.calendarId = scope.loanaccountinfo.calendarOptions[0].id;
                }
                delete this.formData.interestRateFrequencyType;
                if(!scope.loanaccountinfo.isLoanProductLinkedToFloatingRate) {
                    delete this.formData.interestRateDifferential ;
                    delete this.formData.isFloatingInterestRate ;
                }
                else{
                    if(scope.formData.interestRatePerPeriod != undefined){
                        delete scope.formData.interestRatePerPeriod;
                    }
                }
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.loanType = scope.templateType;
                this.formData.expectedDisbursementDate = dateFilter(this.formData.expectedDisbursementDate, scope.df);
                this.formData.submittedOnDate = dateFilter(this.formData.submittedOnDate, scope.df);
                this.formData.interestChargedFromDate = dateFilter(this.formData.interestChargedFromDate, scope.df);
                this.formData.repaymentsStartingFromDate = dateFilter(this.formData.repaymentsStartingFromDate, scope.df);
                this.formData.recalculationRestFrequencyStartDate = dateFilter(scope.recalculationRestFrequencyStartDate, scope.df);
                this.formData.recalculationCompoundingFrequencyStartDate = dateFilter(scope.recalculationCompoundingFrequencyStartDate, scope.df);
                this.formData.createStandingInstructionAtDisbursement = scope.formData.createStandingInstructionAtDisbursement;
                this.formData.loanTermFrequency = scope.loanTerm;
                if (scope.loanaccountinfo.product.isFlatInterestRate && scope.formData.discountOnDisbursalAmount == undefined && !scope.loanaccountinfo.multiDisburseLoan) {
                    this.formData.discountOnDisbursalAmount = null;
                }
                if (scope.loanaccountinfo.allowUpfrontCollection && scope.formData.amountForUpfrontCollection == undefined) {
                    this.formData.amountForUpfrontCollection = null;
                }

                if (scope.date.recalculationRestFrequencyDate) {
                    var restFrequencyDate = dateFilter(scope.date.recalculationRestFrequencyDate, scope.df);
                    scope.formData.recalculationRestFrequencyDate = restFrequencyDate;
                }
                if (scope.date.recalculationCompoundingFrequencyDate) {
                    var restFrequencyDate = dateFilter(scope.date.recalculationCompoundingFrequencyDate, scope.df);
                    scope.formData.recalculationCompoundingFrequencyDate = restFrequencyDate;
                }
                if(this.formData.interestCalculationPeriodType == 0){
                    this.formData.allowPartialPeriodInterestCalcualtion = false;
                }
                if(this.formData.fixedEmiAmount == undefined){
                    //this.formData.fixedEmiAmount = null;
                }
                if(scope.formData.repaymentFrequencyType == 2 && scope.formData.repaymentFrequencyNthDayType){
                    scope.formData.repeatsOnDayOfMonth = scope.selectedOnDayOfMonthOptions;
                }else{
                    scope.formData.repeatsOnDayOfMonth = [];
                }
                resourceFactory.loanResource.put({loanId: routeParams.id}, this.formData, function (data) {
                    location.path('/viewloanaccount/' + data.loanId);
                });
            };

            scope.getProductPledges = function(data){
                scope.pledges = data.loanProductCollateralPledgesOptions;
                scope.formData.pledgeId = data.pledgeId;
                scope.changePledge(scope.formData.pledgeId);
            };

            scope.changePledge = function(pledgeId){
                resourceFactory.pledgeResource.get({'pledgeId' : pledgeId,association: 'collateralDetails'}, function(data){
                    scope.formData.pledgeId = pledgeId;
                    scope.pledge = data;
                    scope.formData.collateralUserValue = data.userValue;
                });
            };

            scope.cancel = function () {
                location.path('/viewloanaccount/' + routeParams.id);
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

            scope.sortNumber = function(a,b)
            {
                return a - b;
            };

            scope.submittedOnReadOnlyType = scope.response.uiDisplayConfigurations.loanAccount.isReadOnlyField.submittedOn;
            scope.firstRepaymentDateReadOnlyType = scope.response.uiDisplayConfigurations.loanAccount.isReadOnlyField.firstRepaymentDate;
            scope.showLoanPurpose = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.loanPurpose;
            scope.showPreferredPaymentChannel = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.preferredPaymentChannel;
        }
    });
    mifosX.ng.application.controller('EditLoanAccAppController', ['$scope', '$routeParams', 'ResourceFactory', '$location', 'dateFilter', mifosX.controllers.EditLoanAccAppController]).run(function ($log) {
        $log.info("EditLoanAccAppController initialized");
    });
}(mifosX.controllers || {}));