(function (module) {
    mifosX.controllers = _.extend(module, {
        EditLoanAccAppController: function (scope, routeParams, resourceFactory, location, dateFilter, commonUtilService) {
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
            scope.repeatsOnDayOfMonthOptions = [-1];
            scope.selectedOnDayOfMonthOptions = [];
            scope.isLoanPurposeEditable= true;
            scope.canAddCharges = true;
            scope.showLoanPurposeWithoutGroup = false;
            scope.showLoanPurposeGroup = true;
            scope.extenalIdReadOnlyType = false;
            scope.loanAccountDpDetailData = {};
            scope.onDayTypeOptions = commonUtilService.onDayTypeOptions();
            
            if (scope.response && scope.response.uiDisplayConfigurations) {
                scope.isProductNameReadOnly = scope.response.uiDisplayConfigurations.editJlgLoan.isReadOnlyField.productName;
                scope.isRestrictEmiPack = scope.response.uiDisplayConfigurations.editJlgLoan.isRestrictEmiPack;
           
                if (scope.response.uiDisplayConfigurations.loanAccount) {
                    scope.showLoanPurposeWithoutGroup = scope.response.uiDisplayConfigurations.loanAccount.loanPurposeGroup.showLoanPurposeWithoutGroup;
                    scope.showLoanPurposeGroup = scope.response.uiDisplayConfigurations.loanAccount.loanPurposeGroup.showLoanPurposeGroup;
                    scope.showIsDeferPaymentsForHalfTheLoanTerm = scope.response.uiDisplayConfigurations.loanAccount.isShowField.isDeferPaymentsForHalfTheLoanTerm;
                    scope.canAddCharges = scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.canAddCharge;
                    scope.fetchRDAccountOnly = scope.response.uiDisplayConfigurations.loanAccount.savingsAccountLinkage.reStrictLinkingToRDAccount;
                    scope.extenalIdReadOnlyType = scope.response.uiDisplayConfigurations.loanAccount.isReadOnlyField.externalId;
                    scope.submittedOnReadOnlyType = scope.response.uiDisplayConfigurations.loanAccount.isReadOnlyField.submittedOn;
                    scope.firstRepaymentDateReadOnlyType = scope.response.uiDisplayConfigurations.loanAccount.isReadOnlyField.firstRepaymentDate;
                    scope.showLoanPurpose = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.loanPurpose;
                    scope.showPreferredPaymentChannel = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.preferredPaymentChannel;
                    scope.isAutoUpdateInterestStartDate = scope.response.uiDisplayConfigurations.loanAccount.isAutoPopulate.interestChargedFromDate;
                }
            }

            for (var i = 1; i <= 28; i++) {
                scope.repeatsOnDayOfMonthOptions.push(i);
            }
            scope.slabBasedCharge = 'Slab Based';
            scope.flatCharge = "Flat";
            scope.upfrontFee = "Upfront Fee";

            scope.interestRatesListPerPeriod = [];
            scope.interestRatesListAvailable = false;
            scope.installmentAmountSlabChargeType = 1;
            scope.paymentModeOptions = [];
            scope.repaymentTypeOption = [];
            scope.disbursementTypeOption = [];
            scope.applicableOnRepayment = 1;
            scope.applicableOnDisbursement = 2;
            scope.manualPaymentMode = 3;

            scope.parentGroups = [];
            scope.canDisburseToGroupBankAccounts = false;
            scope.allowBankAccountsForGroups = scope.isSystemGlobalConfigurationEnabled('allow-bank-account-for-groups');
            scope.allowDisbursalToGroupBankAccounts = scope.isSystemGlobalConfigurationEnabled('allow-multiple-bank-disbursal');
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

            scope.inRange = function(min,max,value){
                return (value>=min && value<=max);
            };

            

            scope.getSlabBasedAmount = function(slabs, amount , repayment ){
                if(slabs){
                    for(var j in slabs){
                        var slab = slabs[j];
                        var slabValue = 0;
                        slabValue = (slab.type.id==scope.installmentAmountSlabChargeType)?amount:repayment;
                        var subSlabvalue = 0;
                        subSlabvalue = (slab.type.id!=scope.installmentAmountSlabChargeType)?amount:repayment;
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
                    }
                }                
                return null;
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
                        if(scope.productLoanCharges[i].chargeData && !scope.productLoanCharges[i].chargeData.penalty){
                            //if(scope.productLoanCharges[i].isMandatory && scope.productLoanCharges[i].isMandatory == true){
                                var isChargeAdded = false;
                                var loanChargeAmount = 0;
                                for(var j in scope.charges){
                                    if(scope.productLoanCharges[i].chargeData.id == scope.charges[j].chargeId){
                                        scope.charges[j].isMandatory = scope.productLoanCharges[i].isMandatory;
                                        scope.charges[j].isAmountNonEditable = scope.productLoanCharges[i].isAmountNonEditable;
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
                                    charge.isAmountNonEditable = scope.productLoanCharges[i].isAmountNonEditable;
                                    if(charge.chargeCalculationType.value == scope.slabBasedCharge){
                                        var slabBasedValue = scope.getSlabBasedAmount(charge.slabs,scope.formData.principal, scope.formData.numberOfRepayments);
                                        if(slabBasedValue != null){
                                            charge.amountOrPercentage = slabBasedValue;
                                        }else{
                                            charge.amountOrPercentage = undefined;
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
                scope.formData.deferPaymentsForHalfTheLoanTerm = scope.loanaccountinfo.deferPaymentsForHalfTheLoanTerm;
                scope.formData.loanIdToClose = scope.loanaccountinfo.closureLoanId;
                if (scope.loanaccountinfo.brokenPeriodMethodType) {
                    scope.formData.brokenPeriodMethodType = scope.loanaccountinfo.brokenPeriodMethodType.id;
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

            scope.changePledge = function(pledgeId){
                resourceFactory.pledgeResource.get({'pledgeId' : pledgeId,association: 'collateralDetails'}, function(data){
                    scope.formData.pledgeId = pledgeId;
                    scope.pledge = data;
                    scope.formData.collateralUserValue = data.userValue;
                });
            };

            scope.getProductPledges = function(data){
                scope.pledges = data.loanProductCollateralPledgesOptions;
                scope.formData.pledgeId = data.pledgeId;
                scope.changePledge(scope.formData.pledgeId);
            };
            
            resourceFactory.loanResource.get({loanId: routeParams.id, template: true, associations: 'charges,collateral,meeting,multiDisburseDetails,loanTopupDetails',staffInSelectedOfficeOnly:true, fetchRDAccountOnly: scope.fetchRDAccountOnly}, function (data) {
                scope.loanaccountinfo = data;
                if(data.loanEMIPackData){
                    scope.formData.loanEMIPackId = data.loanEMIPackData.id;
                }
                if (scope.showLoanPurposeWithoutGroup){
                    scope.loanPurposeOptions = data.loanPurposeOptions;
                }
                scope.paymentModeOptions = data.paymentModeOptions || [];
                if (data.isTopup && scope.loanaccountinfo.clientActiveLoanOptions.length > 0 && data.loanTopupDetailsData.length > 0) {
                    for (var i in data.loanTopupDetailsData) {
                        var closureLoanId = data.loanTopupDetailsData[i].closureLoanId;
                        for (var j = 0; j < scope.loanaccountinfo.clientActiveLoanOptions.length; j++) {
                            if (scope.loanaccountinfo.clientActiveLoanOptions[j].id == closureLoanId) {
                                scope.loanaccountinfo.clientActiveLoanOptions[j].isSelected = true;
                            }
                        };
                    }
                    scope.isAllLoanToClose = (scope.loanaccountinfo.clientActiveLoanOptions.length == data.loanTopupDetailsData.length);
            
                }
                if(scope.loanaccountinfo.expectedDisbursalPaymentType){
                    scope.formData.expectedDisbursalPaymentType = scope.loanaccountinfo.expectedDisbursalPaymentType.id;
                    if(scope.loanaccountinfo.expectedDisbursalPaymentType.paymentMode){
                        scope.disbursementMode = scope.loanaccountinfo.expectedDisbursalPaymentType.paymentMode.id;
                    }else{
                        scope.disbursementMode = scope.manualPaymentMode;
                    }
                }
                if(scope.loanaccountinfo.expectedRepaymentPaymentType){
                    scope.formData.expectedRepaymentPaymentType = scope.loanaccountinfo.expectedRepaymentPaymentType.id;
                    if(scope.loanaccountinfo.expectedRepaymentPaymentType.paymentMode){
                        scope.repaymentMode = scope.loanaccountinfo.expectedRepaymentPaymentType.paymentMode.id;
                    }else{
                        scope.repaymentMode = scope.manualPaymentMode;
                    }
                }

                if(data.interestRatesListPerPeriod != undefined && data.interestRatesListPerPeriod.length > 0){
                        scope.interestRatesListPerPeriod = data.interestRatesListPerPeriod;
                        scope.interestRatesListAvailable = true;
                }
                scope.canDisburseToGroupBankAccounts = scope.loanaccountinfo.allowsDisbursementToGroupBankAccounts;
                if(scope.loanaccountinfo.loanType.value == "GLIM") {
                    resourceFactory.glimResource.getAllByLoan({loanId: routeParams.id, includeOtherGroupMember: true}, function (glimData) {
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
                                if(glimData[i].loanPurpose){
                                    scope.formData.clientMembers[i].loanPurposeId = glimData[i].loanPurpose.id;
                                }                                
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
                }

                scope.getProductPledges(scope.loanaccountinfo);

                resourceFactory.loanResource.get({resourceType: 'template', templateType: 'collateral', productId: data.loanProductId, fields: 'id,loanCollateralOptions'}, function (data) {
                    scope.collateralOptions = data.loanCollateralOptions || [];
                });

                scope.$watch('formData.expectedDisbursementDate ', function(){
                    if (scope.response && scope.response.uiDisplayConfigurations.loanAccount.isAutoPopulate.interestChargedFromDate) {
                        if(scope.formData.expectedDisbursementDate != '' && scope.formData.expectedDisbursementDate != undefined){
                            scope.formData.interestChargedFromDate = scope.formData.expectedDisbursementDate;
                        }
                    }    
                });
                
                if (data.clientId && scope.canDisburseToGroupsBanks()) {
                    scope.clientId = data.clientId;
                    scope.clientName = data.clientName;
                    scope.formData.clientId = scope.clientId;
                    resourceFactory.clientParentGroupsResource.getParentGroups({clientId:  scope.clientId}, function (data) {
                        scope.parentGroups = data;
                    });
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
                
                if(data.loanPurposeId && scope.showLoanPurposeGroup){
                    resourceFactory.loanPurposeGroupResource.getAll({isFetchLoanPurposeDatas : 'true'}, function (loanPurposeGroupsdata) {
                        scope.formData.loanPurposeId = data.loanPurposeId;
                        scope.loanPurposeGroups = loanPurposeGroupsdata;
                        scope.getParentLoanPurpose(data.loanPurposeId);
                    });
                }
                scope.formData.externalId = data.externalId;

                //update collaterals
                if (scope.loanaccountinfo.collateral) {
                    for (var i in scope.loanaccountinfo.collateral) {
                        scope.collaterals.push({type: scope.loanaccountinfo.collateral[i].type.id, name: scope.loanaccountinfo.collateral[i].type.name, value: scope.loanaccountinfo.collateral[i].value, description: scope.loanaccountinfo.collateral[i].description});
                    }
                }

                scope.previewClientLoanAccInfo();

                if(scope.loanaccountinfo.isDpConfigured){
                    resourceFactory.loanAccountDpDetailTemplateResource.get({loanId: routeParams.id},function(data){
                        scope.loanAccountDpDetailData = data;
                        scope.loanAccountDpDetailData.dpDuration = scope.loanAccountDpDetailData.duration;
                        scope.loanAccountDpDetailData.dpCalculateOnAmount = scope.loanAccountDpDetailData.amountOrPercentage;
                        scope.loanAccountDpDetailData.loanDpLimitCalculationType = scope.loanAccountDpDetailData.calculationType.id;
                        scope.loanDpLimitCalculationTypeOptions = scope.loanAccountDpDetailData.calculationTypeOptions;
                        scope.loanAccountDpDetailData.dpStartDate = dateFilter(new Date(scope.loanAccountDpDetailData.startDate),scope.df);
                        scope.constructLoanAccountDpDetailData(scope.loanAccountDpDetailData);
                    });
                }

                resourceFactory.loanDpDetailsTemplateResource.getLoanDpDetailsTemplate({loanProductId: scope.loanaccountinfo.loanProductId},function(data){
                    scope.loanProductDpDetailTemplateData = data;
                });

            });

            scope.constructLoanAccountDpDetailData = function(data){
                scope.loanAccountDpDetailData.frequencyType = data.frequencyType.id;
                if(scope.loanAccountDpDetailData.frequencyType == 1){
                    scope.loanAccountDpDetailData.frequencyDayOfWeekType = data.frequencyDayOfWeekType.id;
                }
                if(scope.loanAccountDpDetailData.frequencyType == 2){
                    scope.loanAccountDpDetailData.frequencyNthDay = data.frequencyNthDay.id;
                    if(scope.loanAccountDpDetailData.frequencyNthDay == -2){
                        scope.loanAccountDpDetailData.frequencyOnDay = data.frequencyOnDay;
                    }else{
                        scope.loanAccountDpDetailData.frequencyDayOfWeekType = data.frequencyDayOfWeekType.id;
                    }
                }    
                scope.loanAccountDpDetailData.frequencyInterval = data.frequencyInterval;
            }

            scope.getParentLoanPurpose = function (loanPurposeId) {
                if(scope.loanPurposeGroups && scope.loanPurposeGroups.length>0){
                    for(var i=0; i< scope.loanPurposeGroups.length; i++){
                        if(scope.loanPurposeGroups[i].loanPurposeDatas && scope.loanPurposeGroups[i].loanPurposeDatas.length >0){

                            for(var j=0; j< scope.loanPurposeGroups[i].loanPurposeDatas.length; j++){
                                if(scope.loanPurposeGroups[i].loanPurposeDatas[j].id == loanPurposeId){
                                    scope.loanPurposeGroupId = scope.loanPurposeGroups[i].id;
                                    scope.isLoanPurposeEditable= false;
                                    scope.onLoanPurposeGroupChange(scope.loanPurposeGroupId,scope.isLoanPurposeEditable);
                                    break;
                                }
                            }
                        }
                    }
                }
            }

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

            scope.$watch('loanaccountinfo.overdueCharges', function(){
                if(angular.isDefined(scope.loanaccountinfo) && angular.isDefined(scope.loanaccountinfo.overdueCharges)){
                   for(var i in scope.loanaccountinfo.overdueCharges){
                    if(scope.loanaccountinfo.overdueCharges[i].chargeData.penalty && (scope.loanaccountinfo.overdueCharges[i].chargeData.isSlabBased || scope.loanaccountinfo.overdueCharges[i].chargeData.chargeCalculationType.value == scope.slabBasedCharge) ){
                        var slabBasedValue = scope.getSlabBasedAmount(scope.loanaccountinfo.overdueCharges[i].chargeData.slabs,scope.formData.principal,scope.formData.numberOfRepayments);
                        if(slabBasedValue != null){
                            scope.loanaccountinfo.overdueCharges[i].chargeData.amount = slabBasedValue;
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
                    scope.canDisburseToGroupBankAccounts = data.product.allowDisbursementToGroupBankAccounts;
                    scope.previewClientLoanAccInfo(refreshLoanCharges);
                    scope.updateSlabBasedCharges();
                    if(data.interestRatesListPerPeriod != undefined && data.interestRatesListPerPeriod.length > 0){
                       scope.interestRatesListPerPeriod = data.interestRatesListPerPeriod;
                       scope.interestRatesListAvailable = true;
                    }
                    if (scope.showLoanPurposeWithoutGroup){
                        scope.loanPurposeOptions = data.loanPurposeOptions;
                    }
                    if(scope.loanaccountinfo.multiDisburseLoan && scope.loanaccountinfo.isDpConfigured){
                        resourceFactory.loanDpDetailsResource.get({loanProductId: loanProductId , isTemplate:true},function(data){
                            scope.loanProductDpDetailData = data;
                            scope.loanDpLimitCalculationTypeOptions = scope.loanProductDpDetailData.calculationTypeOptions;
                            scope.constructLoanAccountDpDetailData(scope.loanProductDpDetailData);
                        });

                    }
                });

                resourceFactory.loanResource.get({resourceType: 'template', templateType: 'collateral', productId: loanProductId, fields: 'id,loanCollateralOptions'}, function (data) {
                    scope.collateralOptions = data.loanCollateralOptions || [];
                });
            }

            

            scope.onLoanPurposeGroupChange = function (loanPurposegroupId,isLoanPurposeEditable) {
                if(isLoanPurposeEditable!=false){
                    scope.formData.loanPurposeId = undefined;
                }
                if(loanPurposegroupId){
                    resourceFactory.loanPurposeGroupResource.get({
                        loanPurposeGroupsId: loanPurposegroupId, isFetchLoanPurposeDatas : 'true'
                    }, function (data) {
                        scope.loanPurposeOptions = data.loanPurposeDatas;
                    });
                }else{
                    scope.loanPurposeOptions = [];
                }
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
                            if(data.chargeCalculationType.value == scope.slabBasedCharge || data.isSlabBased){
                                var slabBasedValue = scope.getSlabBasedAmount(data.slabs,data.glims[i].transactionAmount,scope.formData.numberOfRepayments);
                                    if(slabBasedValue != null){
                                        data.glims[i].upfrontChargeAmount = slabBasedValue; 
                                        amount = amount + data.glims[i].upfrontChargeAmount;
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
                        }
                    }
                    data.amountOrPercentage = amount;
                    return data;

                }else{
                    if(data.chargeCalculationType.value == scope.slabBasedCharge || data.isSlabBased){  
                        var slabBasedValue = scope.getSlabBasedAmount(data.slabs,scope.formData.principal, scope.formData.numberOfRepayments);
                        if(slabBasedValue != null){
                            data.amountOrPercentage = slabBasedValue;
                        }else {
                            data.amountOrPercentage = undefined;
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

            scope.$watch('formData.numberOfRepayments ', function(){
                scope.updateSlabBasedCharges();
            });

            scope.updateSlabBasedCharges = function(){         
                if(scope.formData.principal != '' && scope.formData.principal != undefined){
                    for(var i in scope.charges){
                        if(scope.charges[i].chargeCalculationType.value == scope.slabBasedCharge || scope.charges[i].isSlabBased) {
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
                if (scope.clientId) {
                    scope.formData.clientId = scope.clientId;
                }

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
                if(!_.isUndefined(this.formData.interestChargedFromDate)){
                    this.formData.interestChargedFromDate = dateFilter(this.formData.interestChargedFromDate, scope.df);
                }
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
                delete scope.formData.overdueCharges;
                delete scope.formData.collateral;
                delete scope.formData.loanPurposeGroupId;

                if (scope.formData.disbursementData.length > 0) {
                    for (var i in scope.formData.disbursementData) {
                        if(scope.formData.disbursementData[i].expectedDisbursementDate === ""){
                            scope.formData.disbursementData[i].expectedDisbursementDate = undefined;
                        }else{
                          scope.formData.disbursementData[i].expectedDisbursementDate = dateFilter(scope.formData.disbursementData[i].expectedDisbursementDate, scope.df); 
                        }   
                    }
                }

                scope.formData.charges = [];
                if (scope.charges.length > 0) {
                    for (var i in scope.charges) {
                        if (scope.charges[i].amountOrPercentage > 0 || scope.charges[i].isSlabBased) {
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
                
                if (scope.loanaccountinfo.overdueCharges && scope.loanaccountinfo.overdueCharges.length > 0) {
                    scope.formData.overdueCharges = [];
                    for (var i in scope.loanaccountinfo.overdueCharges) {
                        if (scope.loanaccountinfo.overdueCharges[i].chargeData.amount > 0) {
                            scope.formData.overdueCharges.push({
                                id: scope.loanaccountinfo.overdueCharges[i].id,
                                amount: scope.loanaccountinfo.overdueCharges[i].chargeData.amount
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
                if(!_.isUndefined(this.formData.interestChargedFromDate)){
                    this.formData.interestChargedFromDate = dateFilter(this.formData.interestChargedFromDate, scope.df);
                }
                this.formData.repaymentsStartingFromDate = dateFilter(this.formData.repaymentsStartingFromDate, scope.df);
                this.formData.recalculationRestFrequencyStartDate = dateFilter(scope.recalculationRestFrequencyStartDate, scope.df);
                this.formData.recalculationCompoundingFrequencyStartDate = dateFilter(scope.recalculationCompoundingFrequencyStartDate, scope.df);
                this.formData.createStandingInstructionAtDisbursement = scope.formData.createStandingInstructionAtDisbursement;
                this.formData.loanTermFrequency = scope.loanTerm;
                 if(this.formData.loanEMIPackId && this.formData.loanEMIPackId>0){
                    for(var i in scope.loanaccountinfo.loanEMIPacks){
                        if(scope.loanaccountinfo.loanEMIPacks[i].id==this.formData.loanEMIPackId){
                            this.formData.fixedEmiAmount = scope.loanaccountinfo.loanEMIPacks[i].fixedEmi;
                            this.formData.principal = scope.loanaccountinfo.loanEMIPacks[i].sanctionAmount;
                            this.formData.repaymentEvery = scope.loanaccountinfo.loanEMIPacks[i].repaymentEvery;
                            this.formData.repaymentFrequencyType = scope.loanaccountinfo.loanEMIPacks[i].repaymentFrequencyType.id;
                            this.formData.numberOfRepayments = scope.loanaccountinfo.loanEMIPacks[i].numberOfRepayments;
                            this.formData.repaymentEvery = scope.loanaccountinfo.loanEMIPacks[i].repaymentEvery;
                            this.formData.loanTermFrequencyType = scope.loanaccountinfo.loanEMIPacks[i].repaymentFrequencyType.id;
                            this.formData.loanTermFrequencyType = scope.loanaccountinfo.loanEMIPacks[i].repaymentFrequencyType.id;
                            this.formData.loanTermFrequency = parseInt(scope.loanaccountinfo.loanEMIPacks[i].repaymentEvery*this.formData.numberOfRepayments);  
                        }
                    }
                }

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

                if(this.formData.isTopup==true){
                    this.formData.loanIdToClose = [];
                    for(var i in scope.loanaccountinfo.clientActiveLoanOptions){
                        if(scope.loanaccountinfo.clientActiveLoanOptions[i].isSelected==true){
                            this.formData.loanIdToClose.push(scope.loanaccountinfo.clientActiveLoanOptions[i].id);
                        }
                    }
                }else{
                    this.formData.loanIdToClose = undefined;
                }

                if(!_.isUndefined(this.formData.dpStartDate)){
                    this.formData.dpStartDate = dateFilter(new Date(this.formData.dpStartDate),scope.df);
                }
                if(scope.loanaccountinfo.multiDisburseLoan && scope.loanaccountinfo.isDpConfigured){
                    scope.loanAccountDpDetailData.dpLimitAmount = scope.formData.principal;
                    scope.loanAccountDpDetailData.dpStartDate = dateFilter(scope.loanAccountDpDetailData.dpStartDate, scope.df);
                    scope.loanAccountDpDetailData.locale = scope.optlang.code;
                    scope.loanAccountDpDetailData.dateFormat = scope.df;
                    this.formData.loanAccountDpDetail = scope.loanAccountDpDetailData;
                }

                resourceFactory.loanResource.put({loanId: routeParams.id}, this.formData, function (data) {
                    location.path('/viewloanaccount/' + data.loanId);
                });
            };

            scope.selectAllLoanToClose = function(isAllLoanToClose){
                for(var i in scope.loanaccountinfo.clientActiveLoanOptions){
                    scope.loanaccountinfo.clientActiveLoanOptions[i].isSelected = isAllLoanToClose;
                }
            }

            scope.updateAllCheckbox = function(){
                var isAll = true;
                for(var i in scope.loanaccountinfo.clientActiveLoanOptions){
                    if(scope.loanaccountinfo.clientActiveLoanOptions[i].isSelected == undefined || scope.loanaccountinfo.clientActiveLoanOptions[i].isSelected==false){
                        isAll = false;
                    }
                }
                scope.isAllLoanToClose = isAll;
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

            scope.isChargeAmountNonEditable = function (charge) {
                if ((charge.chargeCalculationType.value == 'slabBasedCharge') || charge.isAmountNonEditable) {
                    return true;
                }
                return false;
            };

            scope.sortNumber = function(a,b)
            {
                return a - b;
            };

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
           
            scope.canDisburseToGroupsBanks = function(){
                return (scope.canDisburseToGroupBankAccounts && scope.allowBankAccountsForGroups && scope.allowDisbursalToGroupBankAccounts);
            };
            scope.updateSlabBasedAmountOnChangePrincipalOrRepayment = function(){
                if(scope.formData.principal != '' && scope.formData.principal != undefined && scope.formData.numberOfRepayments != '' && scope.formData.numberOfRepayments != undefined){
                    for(var i in scope.charges){
                        if((scope.charges[i].chargeCalculationType.value == scope.slabBasedCharge || scope.charges[i].isSlabBased) && scope.charges[i].slabs.length > 0) {
                            if(scope.isGLIM){
                                scope.charges[i].amount = scope.updateSlabBasedChargeForGlim(scope.charges[i]);
                                scope.updateChargeForSlab(scope.charges[i]);
                            }else{
                                var slabBasedValue = scope.getSlabBasedAmount(scope.charges[i].slabs,scope.formData.principal, scope.formData.numberOfRepayments);
                                if(slabBasedValue != null) {
                                    scope.charges[i].amount = slabBasedValue;
                                } else {
                                    scope.charges[i].amount = undefined;
                                }
                                scope.updateChargeForSlab(scope.charges[i]);
                            }

                        }
                    }
                }
            };

            scope.updateSlabBasedChargeForEmiPack = function(loanEMIPack){
                if(loanEMIPack){
                    scope.formData.principal = loanEMIPack.sanctionAmount;
                    scope.formData.numberOfRepayments = loanEMIPack.numberOfRepayments;
                    scope.updateSlabBasedAmountOnChangePrincipalOrRepayment();
                }
            }

            scope.resetLoanAccountDpDetails = function () {
                delete scope.loanAccountDpDetailData.frequencyNthDay;
                delete scope.loanAccountDpDetailData.frequencyDayOfWeekType;
                delete scope.loanAccountDpDetailData.frequencyOnDay;
            };

            scope.resetOnDayAndWeekType = function(){
                delete scope.loanAccountDpDetailData.frequencyDayOfWeekType;
                delete scope.loanAccountDpDetailData.frequencyOnDay;
            };
        }
    });
    mifosX.ng.application.controller('EditLoanAccAppController', ['$scope', '$routeParams', 'ResourceFactory', '$location', 'dateFilter', 'CommonUtilService', mifosX.controllers.EditLoanAccAppController]).run(function ($log) {
        $log.info("EditLoanAccAppController initialized");
    });
}(mifosX.controllers || {}));