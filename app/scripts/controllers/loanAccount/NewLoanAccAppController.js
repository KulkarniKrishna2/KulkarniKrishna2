(function (module) {
    mifosX.controllers = _.extend(module, {
        NewLoanAccAppController: function (scope, routeParams, resourceFactory, location, dateFilter) {
            scope.previewRepayment = false;
            scope.clientId = routeParams.clientId;
            scope.groupId = routeParams.groupId;
            scope.restrictDate = new Date();
            scope.formData = {};
            scope.temp = {};
            scope.chargeFormData = {}; //For charges
            scope.collateralFormData = {}; //For collaterals
            scope.inparams = {resourceType: 'template', activeOnly: 'true'};
            scope.date = {};
            scope.formData.isSubsidyApplicable = false;
            scope.glimMembers = [];
            scope.repeatsOnDayOfMonthOptions = [];
            scope.selectedOnDayOfMonthOptions = [];
            scope.slabBasedCharge = "Slab Based";
            scope.flatCharge = "Flat";
            scope.upfrontFee = "Upfront Fee";
            scope.interestRatesListPerPeriod = [];
            scope.interestRatesListAvailable = false;
            scope.isCenter=false;
            scope.installmentAmountSlabChargeType = 1;
            scope.showIsDeferPaymentsForHalfTheLoanTerm = scope.response.uiDisplayConfigurations.loanAccount.isShowField.isDeferPaymentsForHalfTheLoanTerm;
            var SLAB_BASED = 'slabBasedCharge';
            var UPFRONT_FEE = 'upfrontFee';
            scope.paymentModeOptions = [];
            scope.repaymentTypeOption = [];
            scope.disbursementTypeOption = [];
            scope.applicableOnRepayment = 1;
            scope.applicableOnDisbursement = 2;
            scope.canDisburseToGroupBankAccounts = false;
            scope.allowBankAccountsForGroups = scope.isSystemGlobalConfigurationEnabled('allow-bank-account-for-groups');
            scope.allowDisbursalToGroupBankAccounts = scope.isSystemGlobalConfigurationEnabled('allow-multiple-bank-disbursal');
            scope.parentGroups = [];

            resourceFactory.groupResource.get({groupId: scope.groupId}, function (data) {
                if(data.groupLevel && data.groupLevel==1)
                {
                    scope.isCenter=true;
                }
            });

            for (var i = 1; i <= 28; i++) {
                scope.repeatsOnDayOfMonthOptions.push(i);
            }
            scope.isGLIM = ((location.path()+'').indexOf('newgrouploanindividualmonitoringloanaccount')>-1);
            if(scope.isGLIM){
                scope.formData.clientMembers = [];
            }else{
                scope.formData.clientMembers = undefined;
            }

            scope.date.first = new Date();
            if (scope.clientId) {
                scope.inparams.clientId = scope.clientId;
                scope.formData.clientId = scope.clientId;
            }

            if (scope.groupId) {
                scope.inparams.groupId = scope.groupId;
                scope.formData.groupId = scope.groupId;
            }

            if (scope.clientId && scope.groupId) {
                scope.inparams.templateType = 'jlg';
            }
            else if (scope.groupId) {
                if (scope.isGLIM) {
                    scope.inparams.templateType = 'glim';
                } else {
                    scope.inparams.templateType = 'group';
                }
            }
            else if (scope.clientId) {
                scope.inparams.templateType = 'individual';
            }

             if(scope.response && scope.response.uiDisplayConfigurations.loanAccount){
                 
                 scope.showExternalId = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.externalId;
                 scope.extenalIdReadOnlyType = scope.response.uiDisplayConfigurations.loanAccount.isReadOnlyField.externalId;
                 scope.showRepaymentFrequencyNthDayType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.repaymentFrequencyNthDayType;
                 scope.showRepaymentFrequencyDayOfWeekType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.repaymentFrequencyDayOfWeekType;
                 scope.showBrokenPeriodType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.brokenPeriodMethodType;
            }
            scope.inparams.staffInSelectedOfficeOnly = true;
            if(scope.inparams.templateType == 'individual' || scope.inparams.templateType == 'jlg'){
                scope.inparams.productApplicableForLoanType = 2;
                scope.inparams.entityType = 1;
                scope.inparams.entityId = scope.clientId;
            }else if(scope.inparams.templateType == 'group' || scope.inparams.templateType == 'glim'){
                scope.inparams.productApplicableForLoanType = 3;
            }
            resourceFactory.loanResource.get(scope.inparams, function (data) {
                scope.paymentModeOptions = data.paymentModeOptions;
                scope.products = data.productOptions;
                if (scope.isGLIM) {
                    scope.formData.clientMembers = data.group.clientMembers;
                    for (var i in scope.formData.clientMembers) {
                        scope.formData.clientMembers[i].isClientSelected = true;
                    }
                }
                if (data.clientName) {
                    scope.clientName = data.clientName;
                }
                if (data.group) {
                    scope.groupName = data.group.name;
                }
                if(data.interestRatesListPerPeriod != undefined && data.interestRatesListPerPeriod.length > 0){
                    scope.interestRatesListPerPeriod = data.interestRatesListPerPeriod;
                    scope.interestRatesListAvailable = true;
                }
            });

            resourceFactory.clientParentGroupsResource.getParentGroups({clientId:  scope.clientId}, function (data) {
                scope.parentGroups = data;
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
                scope.inparams.productId = loanProductId;
                scope.interestRatesListPerPeriod = [];
                scope.interestRatesListAvailable = false;
                scope.inparams.fetchRDAccountOnly = scope.response.uiDisplayConfigurations.loanAccount.savingsAccountLinkage.reStrictLinkingToRDAccount;
                resourceFactory.loanResource.get(scope.inparams, function (data) {
                    scope.loanaccountinfo = data;
                    scope.getProductPledges(scope.loanaccountinfo);
                    scope.previewClientLoanAccInfo();
                    scope.canDisburseToGroupBankAccounts = data.product.allowDisbursementToGroupBankAccounts;
                    scope.productLoanCharges = data.product.charges || [];
                    if(scope.productLoanCharges && scope.productLoanCharges.length > 0){
                        for(var i in scope.productLoanCharges){
                            if(scope.productLoanCharges[i].chargeData){
                                for(var j in scope.loanaccountinfo.chargeOptions){
                                    if(scope.productLoanCharges[i].chargeData.id == scope.loanaccountinfo.chargeOptions[j].id){
                                        //if(scope.productLoanCharges[i].isMandatory && scope.productLoanCharges[i].isMandatory == true){
                                            var charge = scope.productLoanCharges[i].chargeData;
                                            charge.chargeId = charge.id;
                                            charge.isMandatory = scope.productLoanCharges[i].isMandatory;
                                            charge.isAmountNonEditable = scope.productLoanCharges[i].isAmountNonEditable;
                                            if(charge.chargeCalculationType.value == scope.slabBasedCharge && charge.slabs.length > 0){
                                                for(var i in charge.slabs) {
                                                    var slabBasedValue = scope.getSlabBasedAmount(charge.slabs[i],scope.formData.principal,scope.formData.numberOfRepayments);
                                                    if(slabBasedValue != null){
                                                        charge.amount = slabBasedValue;
                                                    }
                                                }
                                            }
                                            scope.charges.push(charge);
                                       // }
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    for(var i in scope.charges){
                        if(scope.isGLIM && scope.charges[i].isGlimCharge && scope.charges[i].isGlimCharge == true && scope.charges[i].chargeTimeType.id == 50) {
                            scope.charges[i].glims = [];
                            angular.copy(scope.formData.clientMembers,scope.charges[i].glims);
                        }
                    }
                    if (scope.loanaccountinfo.loanOfficerOptions != undefined && scope.loanaccountinfo.loanOfficerOptions.length > 0 && !scope.formData.loanOfficerId) {
                        resourceFactory.clientResource.get({clientId: routeParams.clientId}, function (data) {
                            if (data.staffId != null) {
                                for (var i in scope.loanaccountinfo.loanOfficerOptions) {
                                    if (scope.loanaccountinfo.loanOfficerOptions[i].id == data.staffId) {
                                        scope.formData.loanOfficerId = data.staffId;
                                        break;
                                    }
                                }
                            }
                        })
                    }

                    if(data.interestRatesListPerPeriod != undefined && data.interestRatesListPerPeriod.length > 0){
                       scope.interestRatesListPerPeriod = data.interestRatesListPerPeriod;
                        scope.interestRatesListAvailable = true;
                    }
                });

                resourceFactory.loanResource.get({resourceType: 'template', templateType: 'collateral', productId: loanProductId, fields: 'id,loanCollateralOptions'}, function (data) {
                    scope.collateralOptions = data.loanCollateralOptions || [];
                });
            }

            if(scope.response && scope.response.uiDisplayConfigurations.loanAccount.isAutoPopulate.interestChargedFromDate){
                scope.$watch('date.second ', function(){
                    if(scope.date.second != '' && scope.date.second != undefined){
                        scope.date.third = scope.date.second;
                    }
                });
            }

            scope.updateSlabBasedAmountOnChangePrincipalOrRepayment = function(){
                if(scope.formData.principal != '' && scope.formData.principal != undefined && scope.formData.numberOfRepayments != '' && scope.formData.numberOfRepayments != undefined){
                    
                    for(var i in scope.charges){
                        if((scope.charges[i].chargeCalculationType.value == scope.slabBasedCharge || scope.charges[i].isSlabBased) && scope.charges[i].slabs.length > 0) {
                                if(scope.isGLIM){
                                    scope.charges[i].amount = scope.updateSlabBasedChargeForGlim(scope.charges[i]);
                                    scope.updateChargeForSlab(scope.charges[i]);
                                }else{
                                    for(var j in scope.charges[i].slabs){
                                        var slabBasedValue = scope.getSlabBasedAmount(scope.charges[i].slabs[j],scope.formData.principal,scope.formData.numberOfRepayments);                                    
                                        if(slabBasedValue != null) {
                                            scope.charges[i].amount = slabBasedValue;
                                            break;
                                        } else {
                                            scope.charges[i].amount = undefined;
                                        }
                                        scope.updateChargeForSlab(scope.charges[i]);
                                    }

                            }
                            
                        }
                    }
                }
            };

            scope.updateSlabBasedChargeForGlim = function(chargeData){
                var clientChargeAmount = 0;
                for(var j=0;j<scope.formData.clientMembers.length;j++){
                    var clientData = scope.formData.clientMembers[j];
                        if(clientData.isClientSelected==true && clientData.transactionAmount){
                            for(var i in chargeData.slabs){
                                var slabBasedValue = scope.getSlabBasedAmount(chargeData.slabs[i],clientData.transactionAmount,scope.formData.numberOfRepayments);
                                if(slabBasedValue != null){
                                    clientChargeAmount = clientChargeAmount + parseFloat(slabBasedValue);
                                }
                            }
                        }
                }
                return clientChargeAmount;                       
            }; 


            scope.previewClientLoanAccInfo = function () {
                scope.previewRepayment = false;
                scope.charges = [];//scope.loanaccountinfo.charges || [];
                scope.formData.disbursementData = scope.loanaccountinfo.disbursementDetails || [];
                scope.collaterals = [];

                if (scope.loanaccountinfo.calendarOptions) {
                    scope.temp.syncRepaymentsWithMeeting = true;
                    if (scope.response && !scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.syncDisbursementWithMeeting) {
                        scope.formData.syncDisbursementWithMeeting = false;
                    } else {
                        scope.formData.syncDisbursementWithMeeting = true;
                    }

                }
                if (scope.response && scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.fundId != null) {
                    scope.formData.fundId = scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.fundId;
                    if(scope.loanaccountinfo.fundOptions){
                        for(var i in scope.loanaccountinfo.fundOptions){
                            if(scope.loanaccountinfo.fundOptions[i].id == scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.fundId){
                                scope.formData.fundId = scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.fundId;
                            }
                        }
                    }
                } else {
                    scope.formData.fundId = scope.loanaccountinfo.fundId;
                }
                scope.multiDisburseLoan = scope.loanaccountinfo.multiDisburseLoan;
                scope.formData.productId = scope.loanaccountinfo.loanProductId;
                if(scope.isGLIM){
                    scope.formData.principal = 0;
                    scope.glimAutoCalPrincipalAmount();
                }else{
                    scope.formData.principal = scope.loanaccountinfo.principal;
                }
                scope.formData.loanTermFrequencyType = scope.loanaccountinfo.termPeriodFrequencyType.id;
                scope.formData.numberOfRepayments = scope.loanaccountinfo.numberOfRepayments;
                scope.formData.repaymentEvery = scope.loanaccountinfo.repaymentEvery;
                scope.formData.repaymentFrequencyType = scope.loanaccountinfo.repaymentFrequencyType.id;
                scope.formData.interestRatePerPeriod = scope.loanaccountinfo.interestRatePerPeriod;
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
                scope.formData.loanOfficerId = scope.loanaccountinfo.loanOfficerId;
                if (scope.loanaccountinfo.brokenPeriodMethodType) {
                    scope.formData.brokenPeriodMethodType = scope.loanaccountinfo.brokenPeriodMethodType.id;
                }else{
                    scope.formData.brokenPeriodMethodType = "";
                }

                if (scope.loanaccountinfo.isInterestRecalculationEnabled && scope.loanaccountinfo.interestRecalculationData.recalculationRestFrequencyDate) {
                    scope.date.recalculationRestFrequencyDate = new Date(scope.loanaccountinfo.interestRecalculationData.recalculationRestFrequencyDate);
                }
                if (scope.loanaccountinfo.isInterestRecalculationEnabled && scope.loanaccountinfo.interestRecalculationData.recalculationCompoundingFrequencyDate) {
                    scope.date.recalculationCompoundingFrequencyDate = new Date(scope.loanaccountinfo.interestRecalculationData.recalculationCompoundingFrequencyDate);
                }

                if(scope.loanaccountinfo.isLoanProductLinkedToFloatingRate) {
                    scope.formData.isFloatingInterestRate = false ;
                    scope.formData.interestRateDifferential = scope.loanaccountinfo.interestRateDifferential;
                }
                scope.formData.collectInterestUpfront = scope.loanaccountinfo.product.collectInterestUpfront;
            }

            scope.addCharge = function () {
                if (scope.chargeFormData.chargeId) {
                    resourceFactory.chargeResource.get({chargeId: this.chargeFormData.chargeId, template: 'true'}, function (data) {
                        data.chargeId = data.id;
                        data.isMandatory = false;
                        if(scope.isGLIM){
                            scope.updateChargeForSlab(data);
                        }
                        else {
                            if(data.chargeCalculationType.value == scope.slabBasedCharge && data.slabs.length > 0){
                                for(var i in data.slabs) {
                                    var slabBasedValue = scope.getSlabBasedAmount(data.slabs[i],scope.formData.principal,scope.formData.numberOfRepayments);
                                    if(slabBasedValue != null){
                                        data.amount = slabBasedValue;
                                    }
                                }
                            } 
                        }
                        scope.charges.push(data);
                        scope.chargeFormData.chargeId = undefined;
                    });
                }
            }

            scope.inRange = function(min,max,value){
                return (value>=min && value<=max);
            };

            scope.getSlabBasedAmount = function(slab, amount , repayment){
                var slabValue = 0;
                slabValue = (slab.type.id == scope.installmentAmountSlabChargeType)?amount:repayment;
                var subSlabvalue = 0;
                subSlabvalue = (slab.type.id != scope.installmentAmountSlabChargeType)?amount:repayment;
                //check for if value fall in slabs
                if(scope.inRange(slab.minValue,slab.maxValue,slabValue)){
                    
                        if(slab.subSlabs != undefined && slab.subSlabs.length>0){
                            for(var i in slab.subSlabs){
                                //check for sub slabs range
                                if(scope.inRange(slab.subSlabs[i].minValue,slab.subSlabs[i].maxValue,subSlabvalue)){
                                    return slab.subSlabs[i].amount;
                                }
                            }

                        }
                        return slab.amount;
                }
                return null;

            };

            scope.updateChargeForSlab = function(data){
                if(scope.isGLIM && scope.formData.clientMembers) {
                    var clientMembers = scope.formData.clientMembers || [];
                    data.glims = [];
                    angular.copy(clientMembers, data.glims);
                    var amount = 0;
                    for(var i in data.glims){
                         if (data.chargeCalculationType.value == scope.slabBasedCharge && data.slabs){
                            for(var j in data.slabs){
                                if(data.glims[i].isClientSelected==true){
                                    var slabBasedValue = scope.getSlabBasedAmount(data.slabs[j],data.glims[i].transactionAmount,scope.formData.numberOfRepayments);
                                    if(slabBasedValue != null){
                                        data.glims[i].upfrontChargeAmount = slabBasedValue;                                
                                         amount = amount + data.glims[i].upfrontChargeAmount;
                                    }                                                                          
                                }
                            }
                        } else if (data.chargeCalculationType.value == scope.flatCharge){
                            if(data.glims[i].isClientSelected==true){
                                data.glims[i].upfrontChargeAmount = data.amount;
                                amount = amount + data.glims[i].upfrontChargeAmount;
                            }
                            
                        }
                    }
                }
                data.amount = amount;
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

            scope.previewRepayments = function () {
                // Make sure charges and collaterals are empty before initializing.
                delete scope.formData.charges;
                delete scope.formData.collateral;

                var reqFirstDate = dateFilter(scope.date.first, scope.df);
                var reqSecondDate = dateFilter(scope.date.second, scope.df);
                var reqThirdDate = dateFilter(scope.date.third, scope.df);
                var reqFourthDate = dateFilter(scope.date.fourth, scope.df);
                if (scope.charges.length > 0) {
                    scope.formData.charges = [];
                    for (var i in scope.charges) {
                        if (scope.charges[i].amount > 0) {
                            scope.formData.charges.push({
                                chargeId: scope.charges[i].chargeId,
                                amount: scope.charges[i].amount,
                                dueDate: dateFilter(scope.charges[i].dueDate, scope.df),
                                upfrontChargesAmount: scope.charges[i].glims
                            });
                        }
                    }
                }

                if (scope.formData.disbursementData.length > 0) {
                    for (var i in scope.formData.disbursementData) {
                        scope.formData.disbursementData[i].expectedDisbursementDate = dateFilter(scope.formData.disbursementData[i].expectedDisbursementDate, scope.df);
                    }
                }

                if (scope.collaterals.length > 0) {
                    scope.formData.collateral = [];
                    for (var i in scope.collaterals) {
                        scope.formData.collateral.push({type: scope.collaterals[i].type, value: scope.collaterals[i].value, description: scope.collaterals[i].description});
                    }
                    ;
                }

                if (scope.temp.syncRepaymentsWithMeeting) {
                    this.formData.calendarId = scope.loanaccountinfo.calendarOptions[0].id;
                }

                this.formData.interestChargedFromDate = reqThirdDate;
                this.formData.repaymentsStartingFromDate = reqFourthDate;
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.loanType = scope.inparams.templateType;
                this.formData.expectedDisbursementDate = reqSecondDate;
                this.formData.submittedOnDate = reqFirstDate;
                this.formData.recalculationRestFrequencyStartDate = dateFilter(scope.recalculationRestFrequencyStartDate, scope.df);
                this.formData.recalculationCompoundingFrequencyStartDate = dateFilter(scope.recalculationCompoundingFrequencyStartDate, scope.df);
                this.formData.loanTermFrequency = scope.loanTerm;
                if(this.formData.interestCalculationPeriodType == 0){
                    this.formData.allowPartialPeriodInterestCalcualtion = false;
                }
                if(scope.formData.repaymentFrequencyType == 2 && scope.formData.repaymentFrequencyNthDayType){
                    scope.formData.repeatsOnDayOfMonth = scope.selectedOnDayOfMonthOptions;
                }else{
                    scope.formData.repeatsOnDayOfMonth = [];
                }
                this.formData.deferPaymentsForHalfTheLoanTerm = scope.formData.deferPaymentsForHalfTheLoanTerm;
                if(scope.formData.loanEMIPackId>0){
                    for(var i in scope.loanaccountinfo.loanEMIPacks){
                        if(scope.loanaccountinfo.loanEMIPacks[i].id == scope.formData.loanEMIPackId){
                                scope.formData.numberOfRepayments = scope.loanaccountinfo.loanEMIPacks[i].numberOfRepayments;
                                scope.formData.fixedEmiAmount = scope.loanaccountinfo.loanEMIPacks[i].fixedEmi;
                                scope.formData.principal = scope.loanaccountinfo.loanEMIPacks[i].sanctionAmount;
                        }
                    }
                }
                resourceFactory.loanResource.save({command: 'calculateLoanSchedule'}, this.formData, function (data) {
                    scope.repaymentscheduleinfo = data;
                    scope.previewRepayment = true;
                });

            }

            scope.loanTermCalculation=function(){
              scope.loanTerm= scope.formData.numberOfRepayments*scope.formData.repaymentEvery;
            }

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
                    if(glimMembers[i].upfrontChargeAmount){
                        totalUpfrontChargeAmount += parseFloat(glimMembers[i].upfrontChargeAmount);
                    }
                }
                scope.charges[index].amount = totalUpfrontChargeAmount;
            };

            scope.submit = function () {
                // Make sure charges, overdue charges and collaterals are empty before initializing.
                delete scope.formData.charges;
                delete scope.formData.overdueCharges;
                delete scope.formData.collateral;
                var reqFirstDate = dateFilter(scope.date.first, scope.df);
                var reqSecondDate = dateFilter(scope.date.second, scope.df);
                var reqThirdDate = dateFilter(scope.date.third, scope.df);
                var reqFourthDate = dateFilter(scope.date.fourth, scope.df);
                var reqFifthDate = dateFilter(scope.date.fifth, scope.df);
                this.formData.loanTermFrequency = scope.loanTerm;
                if (scope.charges.length > 0) {
                    scope.formData.charges = [];
                    for (var i in scope.charges) {
                        if (scope.charges[i].amount > 0) {
                            scope.formData.charges.push({
                                chargeId: scope.charges[i].chargeId,
                                amount: scope.charges[i].amount,
                                dueDate: dateFilter(scope.charges[i].dueDate, scope.df),
                                upfrontChargesAmount: scope.charges[i].glims
                            });
                        }
                    }
                }

                if (scope.loanaccountinfo.overdueCharges && scope.loanaccountinfo.overdueCharges.length > 0) {
                    scope.formData.overdueCharges = [];
                    for (var i in scope.loanaccountinfo.overdueCharges) {
                        if (scope.loanaccountinfo.overdueCharges[i].chargeData.amount > 0) {
                            scope.formData.overdueCharges.push({
                                productChargeId: scope.loanaccountinfo.overdueCharges[i].id,
                                amount: scope.loanaccountinfo.overdueCharges[i].chargeData.amount
                            });
                        }
                    }
                }

                if (scope.formData.disbursementData.length > 0) {
                    for (var i in scope.formData.disbursementData) {
                        scope.formData.disbursementData[i].expectedDisbursementDate = dateFilter(scope.formData.disbursementData[i].expectedDisbursementDate, scope.df);
                    }
                }
                if (scope.collaterals.length > 0) {
                    scope.formData.collateral = [];
                    for (var i in scope.collaterals) {
                        scope.formData.collateral.push({type: scope.collaterals[i].type, value: scope.collaterals[i].value, description: scope.collaterals[i].description});
                    }
                    ;
                }

                if (scope.temp.syncRepaymentsWithMeeting) {
                    this.formData.calendarId = scope.loanaccountinfo.calendarOptions[0].id;
                }
                this.formData.interestChargedFromDate = reqThirdDate;
                this.formData.repaymentsStartingFromDate = reqFourthDate;
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.loanType = scope.inparams.templateType;
                this.formData.expectedDisbursementDate = reqSecondDate;
                this.formData.submittedOnDate = reqFirstDate;
                this.formData.recalculationRestFrequencyStartDate = dateFilter(scope.recalculationRestFrequencyStartDate, scope.df);
                this.formData.recalculationCompoundingFrequencyStartDate = dateFilter(scope.recalculationCompoundingFrequencyStartDate, scope.df);
                this.formData.createStandingInstructionAtDisbursement = scope.formData.createStandingInstructionAtDisbursement;
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
                if(scope.formData.repaymentFrequencyType == 2 && scope.formData.repaymentFrequencyNthDayType){
                    scope.formData.repeatsOnDayOfMonth = scope.selectedOnDayOfMonthOptions;
                }else{
                    scope.formData.repeatsOnDayOfMonth = [];
                }

                if(!scope.loanaccountinfo.isLoanProductLinkedToFloatingRate) {
                    delete scope.formData.interestRateDifferential ;
                    delete scope.formData.isFloatingInterestRate;
                }
                else{
                    if(scope.formData.interestRatePerPeriod != undefined){
                        delete scope.formData.interestRatePerPeriod;
                    }
                }

                resourceFactory.loanResource.save(this.formData, function (data) {
                    location.path('/viewloanaccount/' + data.loanId);
                });
            };

            scope.getProductPledges = function(data){
                scope.pledges = data.loanProductCollateralPledgesOptions;
            };

            scope.changePledge = function(pledgeId){
                resourceFactory.pledgeResource.get({'pledgeId' : pledgeId,association: 'collateralDetails'}, function(data){
                    scope.formData.pledgeId = pledgeId;
                    scope.pledge = data;
                    scope.formData.collateralUserValue = data.userValue;
                });
            };

            scope.canDisburseToGroupsBanks = function(){
                return (scope.canDisburseToGroupBankAccounts && scope.allowBankAccountsForGroups && scope.allowDisbursalToGroupBankAccounts);
            };
            
            scope.cancel = function () {
                if (scope.groupId) {
                    location.path('/viewgroup/' + scope.groupId);
                } else if (scope.clientId) {
                    location.path('/viewclient/' + scope.clientId);
                }
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

            scope.isChargeAmountNonEditable = function (charge) {
                if ((charge.chargeTimeType.value == UPFRONT_FEE
                    && charge.chargeCalculationType.value == SLAB_BASED) || charge.isAmountNonEditable || charge.isSlabBased) {
                    return true;
                }
                return false;
            };

            scope.sortNumber = function(a,b)
            {
                return a - b;
            };
            if(scope.response != undefined){
                scope.submittedOnReadOnlyType = scope.response.uiDisplayConfigurations.loanAccount.isReadOnlyField.submittedOn;
                scope.firstRepaymentDateReadOnlyType = scope.response.uiDisplayConfigurations.loanAccount.isReadOnlyField.firstRepaymentDate;
                scope.showLoanPurpose = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.loanPurpose;
                scope.showPreferredPaymentChannel = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.preferredPaymentChannel;
            }


            
            scope.$watch('disbursementMode', function (newValue, oldValue, scope) {
                scope.disbursementTypeOption = [];
                if(scope.loanaccountinfo && scope.loanaccountinfo.paymentOptions){
                        for(var i in scope.loanaccountinfo.paymentOptions){
                            if((scope.loanaccountinfo.paymentOptions[i].paymentMode== undefined || 
                                scope.loanaccountinfo.paymentOptions[i].paymentMode.id==scope.disbursementMode) && 
                                (scope.loanaccountinfo.paymentOptions[i].applicableOn== undefined || scope.loanaccountinfo.paymentOptions[i].applicableOn.id != scope.applicableOnRepayment)){
                                scope.disbursementTypeOption.push(scope.loanaccountinfo.paymentOptions[i]);
                            }
                        }
                    
                }
            }, true);

            scope.updateSlabBasedChargeForEmiPack = function(principal){
                if(principal){
                    scope.formData.principal = principal;
                    scope.updateSlabBasedAmountOnChangePrincipalOrRepayment();
                }
            }
                
            scope.$watch('repaymentMode', function (newValue, oldValue, scope) {
                scope.repaymentTypeOption = [];
                if(scope.loanaccountinfo && scope.loanaccountinfo.paymentOptions){
                        for(var i in scope.loanaccountinfo.paymentOptions){
                            if((scope.loanaccountinfo.paymentOptions[i].paymentMode== undefined || 
                                scope.loanaccountinfo.paymentOptions[i].paymentMode.id==scope.repaymentMode) && 
                                (scope.loanaccountinfo.paymentOptions[i].applicableOn== undefined || scope.loanaccountinfo.paymentOptions[i].applicableOn.id != scope.applicableOnDisbursement)){
                                scope.repaymentTypeOption.push(scope.loanaccountinfo.paymentOptions[i]);
                            }
                        }
                    
                }
            }, true);
            
        }
    });
    mifosX.ng.application.controller('NewLoanAccAppController', ['$scope', '$routeParams', 'ResourceFactory', '$location', 'dateFilter', mifosX.controllers.NewLoanAccAppController]).run(function ($log) {
        $log.info("NewLoanAccAppController initialized");
    });
}(mifosX.controllers || {}));
