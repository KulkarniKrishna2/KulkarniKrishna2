(function (module) {
    mifosX.controllers = _.extend(module, {
        UpdateLoanApplicationReference: function (scope, routeParams, resourceFactory, location, dateFilter, $filter) {

            scope.loanApplicationReferenceId = routeParams.loanApplicationReferenceId;

            scope.restrictDate = new Date();
            scope.formData = {};
            scope.chargeFormData = {}; //For charges
            scope.charges = [];
            var SLAB_BASED = 'slabBasedCharge';
            var UPFRONT_FEE = 'upfrontFee';
            scope.slabBasedCharge = 'Slab Based';
            scope.installmentAmountSlabChargeType = 1;
            scope.parentGroups = [];
            scope.canDisburseToGroupBankAccounts = false;
            scope.allowBankAccountsForGroups = scope.isSystemGlobalConfigurationEnabled('allow-bank-account-for-groups');
            scope.allowDisbursalToGroupBankAccounts = scope.isSystemGlobalConfigurationEnabled('allow-multiple-bank-disbursal');
            scope.isMandatoryDisbursementPaymentMode = false;
            scope.formData.disbursementData=[];

            scope.paymentModeOptions = [];
            scope.repaymentTypeOption = [];
            scope.disbursementTypeOption = [];
            scope.applicableOnRepayment = 1;
            scope.applicableOnDisbursement = 2;
            scope.manualPaymentMode = 3;
            scope.isMandatoryExpectedDisbursementDate = false;
            scope.isMandatoryFirstRepaymentDate = false;
            scope.isMandatoryRateOfInterest = false;
            scope.isHiddenExpectedDisbursementDate = true;
            scope.isHiddenFirstRepaymentDate = true;
            scope.isHiddenRateOfInterest = true;
            scope.isHiddenTrancheData = true;
            scope.loanReferenceTrancheData = false;
            scope.previewRepayment = false;
            scope.isMultiDisburse = false;
            scope.showUpfrontAmount = true;
            scope.isMandatoryUpfrontAmountCollection = false;
            scope.isEmiPacksEditable = false;
            scope.showLoanPurposeCustomField = false;
            scope.showLoanTerms = true;

            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createLoanApplication &&
                scope.response.uiDisplayConfigurations.createLoanApplication.isMandatoryField && scope.response.uiDisplayConfigurations.createLoanApplication.isMandatoryField) {
                scope.isMandatoryDisbursementPaymentType = scope.response.uiDisplayConfigurations.createLoanApplication.isMandatoryField.disbursementPaymentType;
                scope.isMandatoryUpfrontAmountCollection = scope.response.uiDisplayConfigurations.createLoanApplication.isMandatoryField.amountForUpfrontCollection;
            }
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createLoanApplication &&
                scope.response.uiDisplayConfigurations.createLoanApplication.isHiddenField && scope.response.uiDisplayConfigurations.createLoanApplication.isHiddenField.upfrontAmount) {
                scope.showUpfrontAmount = !scope.response.uiDisplayConfigurations.createLoanApplication.isHiddenField.upfrontAmount;
            }

            scope.isLoanPurposeRequired = false;

            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createLoanApplication) {
                if (scope.response.uiDisplayConfigurations.createLoanApplication.isHiddenField) {
                    scope.isHiddenExpectedDisbursementDate = scope.response.uiDisplayConfigurations.createLoanApplication.isHiddenField.expectedDisbursementDate;
                    scope.isHiddenFirstRepaymentDate = scope.response.uiDisplayConfigurations.createLoanApplication.isHiddenField.firstRepaymentDate;
                    scope.isHiddenRateOfInterest = scope.response.uiDisplayConfigurations.createLoanApplication.isHiddenField.interestRatePerPeriod;
                    scope.isHiddenTrancheData = scope.response.uiDisplayConfigurations.createLoanApplication.isHiddenField.tranchedata;
                }
                if (scope.response.uiDisplayConfigurations.createLoanApplication.isMandatoryField) {
                    scope.isMandatoryExpectedDisbursementDate = scope.response.uiDisplayConfigurations.createLoanApplication.isMandatoryField.expectedDisbursementDate;
                    scope.isMandatoryFirstRepaymentDate = scope.response.uiDisplayConfigurations.createLoanApplication.isMandatoryField.firstRepaymentDate;
                    scope.isMandatoryRateOfInterest = scope.response.uiDisplayConfigurations.createLoanApplication.isMandatoryField.interestRatePerPeriod;
                    scope.isMandatoryDisbursementPaymentMode = scope.response.uiDisplayConfigurations.createLoanApplication.isMandatoryField.disbursementPaymentMode;
                    scope.isExternalIdOne = scope.response.uiDisplayConfigurations.createLoanApplication.isMandatoryField.externalIdOne;
                }
                if (scope.response.uiDisplayConfigurations.createLoanApplication.isMandatory) {
                    scope.loanReferenceTrancheData = scope.response.uiDisplayConfigurations.createLoanApplication.isMandatory.trancheData;
                    scope.isLoanPurposeRequired = scope.response.uiDisplayConfigurations.createLoanApplication.isMandatory.loanPurposeId;
                }
            }

            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.editLoanApplication) {
                if(scope.response.uiDisplayConfigurations.editLoanApplication.editableFields){
                     scope.isEmiPacksEditable = scope.response.uiDisplayConfigurations.editLoanApplication.editableFields.emiPacks;
                }
            }
            resourceFactory.loanApplicationReferencesResource.getByLoanAppId({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (applicationData) {
                scope.applicationData = applicationData;
                scope.formData.clientId = applicationData.clientId;
                scope.formData.groupId = applicationData.groupId;
                scope.accountType = scope.applicationData.accountType.value.toLowerCase();
                if(scope.applicationData.expectedDisbursalPaymentType){
                    scope.formData.expectedDisbursalPaymentType = scope.applicationData.expectedDisbursalPaymentType.id;
                    if(scope.applicationData.expectedDisbursalPaymentType.paymentMode){
                        scope.disbursementMode = scope.applicationData.expectedDisbursalPaymentType.paymentMode.id;
                    }else{
                        //scope.disbursementMode = scope.manualPaymentMode;
                    }
                }else{
                        //scope.disbursementMode = scope.manualPaymentMode;
                }
                if(scope.applicationData.expectedRepaymentPaymentType){
                    scope.formData.expectedRepaymentPaymentType = scope.applicationData.expectedRepaymentPaymentType.id;
                    if(scope.applicationData.expectedRepaymentPaymentType.paymentMode){
                        scope.repaymentMode = scope.applicationData.expectedRepaymentPaymentType.paymentMode.id;
                    }else{
                        //scope.repaymentMode = scope.manualPaymentMode;
                    }
                }else{
                        //scope.repaymentMode = scope.manualPaymentMode;
                }
                
                if(scope.applicationData.allowUpfrontCollection || scope.applicationData.amountForUpfrontCollection){
                    scope.formData.amountForUpfrontCollection = scope.applicationData.amountForUpfrontCollection;
                }
                scope.canDisburseToGroupBankAccounts = scope.applicationData.allowsDisbursementToGroupBankAccounts;
                resourceFactory.clientParentGroupsResource.getParentGroups({clientId:  scope.formData.clientId}, function (data) {
                    scope.parentGroups = data;
                });
                if(scope.applicationData.discountOnDisbursalAmount){
                    scope.formData.discountOnDisbursalAmount = scope.applicationData.discountOnDisbursalAmount;
                }
                scope.loanProductChange(applicationData.loanProductId, false);
                scope.formData.interestRatePerPeriod=applicationData.interestRatePerPeriod;
                if(applicationData.expectedDisbursementDate != undefined){
                        scope.formData.expectedDisbursementDate=dateFilter(new Date(applicationData.expectedDisbursementDate), scope.df);
                }
                if(applicationData.expectedFirstRepaymentOnDate != undefined){
                        scope.formData.repaymentsStartingFromDate=dateFilter(new Date(applicationData.expectedFirstRepaymentOnDate), scope.df);
                }
                if(applicationData.maxOutstandingLoanBalance){
                        scope.formData.maxOutstandingLoanBalance = approveddata.maxOutstandingLoanBalance;
                }
                scope.formData.isTopup = applicationData.isTopup;
                scope.loanTopupDetailsData = applicationData.loanTopupDetailsData;
            });

            resourceFactory.loanApplicationReferencesTrancheResource.getByLoanAppId({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (applicationTrancheData) {
                    if(applicationTrancheData){
                        scope.formData.disbursementData = applicationTrancheData;
                        for (var i in applicationTrancheData) {
                            scope.formData.disbursementData[i].expectedTrancheDisbursementDate = dateFilter(new Date(applicationTrancheData[i].expectedTrancheDisbursementDate),  scope.df);
                        }
                    }
            });

            var curIndex = 0;
            scope.chargesApplicableToLoanApplication = [];
            scope.loanProductChange = function (loanProductId, isNewCall) {
                scope.inparams = {resourceType: 'template', activeOnly: 'true'};
                scope.inparams.templateType = scope.accountType;
                if (scope.formData.clientId) {
                    scope.inparams.clientId = scope.formData.clientId;
                }
                if (scope.formData.groupId) {
                    scope.inparams.groupId = scope.formData.groupId;
                }
                scope.inparams.staffInSelectedOfficeOnly = true;
                if(scope.inparams.templateType == 'individual' || scope.inparams.templateType == 'jlg'){
                    scope.inparams.productApplicableForLoanType = 2;
                    scope.inparams.entityType = 1;
                    scope.inparams.entityId = scope.clientId;
                }else if(scope.inparams.templateType == 'group' || scope.inparams.templateType == 'glim'){
                    scope.inparams.productApplicableForLoanType = 3;
                }

                scope.inparams.productId = loanProductId;
                scope.previewRepayment = false;

                resourceFactory.loanResource.get(scope.inparams, function (data) {
                    scope.loanaccountinfo = data;
                    scope.loanPurposeOptions = scope.loanaccountinfo.loanPurposeOptions;
                    scope.product = data.product;
                    scope.getDisbursementTypeOtions();
                    scope.getRepaymentTypeOptions();
                    scope.paymentModeOptions = data.paymentModeOptions ;
                    scope.productLoanCharges = data.product.charges || [];
                    for (var i in scope.productLoanCharges) {
                        scope.chargesApplicableToLoanApplication.push(scope.productLoanCharges[i].chargeData);
                    }
                    scope.canDisburseToGroupBankAccounts = data.product.allowDisbursementToGroupBankAccounts;
                    scope.isMultiDisburse = scope.product.multiDisburseLoan;

                    if (scope.formData.isTopup && scope.loanaccountinfo.clientActiveLoanOptions.length > 0 && scope.loanTopupDetailsData.length > 0) {
                        for (var i in scope.loanTopupDetailsData) {
                            var closureLoanId = scope.loanTopupDetailsData[i].closureLoanId;
                            for (var j = 0; j < scope.loanaccountinfo.clientActiveLoanOptions.length; j++) {
                                if (scope.loanaccountinfo.clientActiveLoanOptions[j].id == closureLoanId) {
                                    scope.loanaccountinfo.clientActiveLoanOptions[j].isSelected = true;
                                }
                            };
                        }
                        scope.isAllLoanToClose = (scope.loanaccountinfo.clientActiveLoanOptions.length == scope.loanTopupDetailsData.length);
                
                    }

                    if(scope.isMultiDisburse){
                        scope.formData.maxOutstandingLoanBalance = scope.loanaccountinfo.product.outstandingLoanBalance;
                    }
                    if(scope.loanaccountinfo.loanEMIPacks){
                        var len = scope.loanaccountinfo.loanEMIPacks.length;
                        for(var i = 0; i < len; i++){
                            scope.loanaccountinfo.loanEMIPacks[i].combinedRepayEvery = scope.loanaccountinfo.loanEMIPacks[i].repaymentEvery
                                + ' - ' + $filter('translate')(scope.loanaccountinfo.loanEMIPacks[i].repaymentFrequencyType.value);
                        }
                    }
                    if (data.clientName) {
                        scope.clientName = data.clientName;
                    }
                    if (data.group) {
                        scope.groupName = data.group.name;
                    }
                    if (isNewCall) {
                        if (scope.loanaccountinfo.loanOfficerOptions) {
                            resourceFactory.clientResource.get({clientId: scope.clientId}, function (data) {
                                if (data.staffId != null) {
                                    scope.formData.loanOfficerId = data.staffId;
                                }
                            })
                        }
                        if(scope.loanaccountinfo.loanEMIPacks){
                            scope.formData.loanEMIPackId = scope.loanaccountinfo.loanEMIPacks[0].id;
                            if(scope.isGlobalWorkflowEnabled && !scope.isEmiPacksEditable){
                                scope.setLoanEMIPacks(scope.loanaccountinfo.loanEMIPacks[0]);
                            } 
                            if(scope.showUpfrontAmount && scope.loanaccountinfo.allowUpfrontCollection){
                                scope.formData.amountForUpfrontCollection = scope.loanaccountinfo.loanEMIPacks[0].fixedEmi;
                            }
                        }else{
                            scope.formData.loanAmountRequested = scope.loanaccountinfo.principal;
                            scope.formData.fixedEmiAmount = scope.loanaccountinfo.fixedEmiAmount;
                            scope.formData.numberOfRepayments = scope.loanaccountinfo.numberOfRepayments;
                            scope.formData.repayEvery = scope.loanaccountinfo.repaymentEvery;
                            scope.formData.repaymentPeriodFrequencyEnum = scope.loanaccountinfo.repaymentFrequencyType.id;
                            if(scope.loanaccountinfo.multiDisburseLoan == true && scope.loanaccountinfo.product && scope.loanaccountinfo.product.maxTrancheCount){
                                scope.formData.noOfTranche = parseInt(scope.loanaccountinfo.product.maxTrancheCount);
                            }else{
                                delete scope.formData.noOfTranche;
                            }
                            delete scope.formData.loanEMIPackId;
                        }

                        scope.formData.termFrequency = (scope.loanaccountinfo.repaymentEvery * scope.loanaccountinfo.numberOfRepayments);
                        scope.formData.termPeriodFrequencyEnum = scope.loanaccountinfo.repaymentFrequencyType.id;
                        scope.formData.interestRatePerPeriod = scope.loanaccountinfo.interestRatePerPeriod;
                        scope.charges = [];//scope.loanaccountinfo.charges || [];
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
                                                 if(charge.chargeCalculationType.value == scope.slabBasedCharge){
                                                    for(var i in charge.slabs) {
                                                        var slabBasedValue = scope.getSlabBasedAmount(charge.slabs[i],scope.formData.loanAmountRequested,scope.formData.numberOfRepayments);
                                                        if(slabBasedValue != null){
                                                            //charge.amountOrPercentage = slabBasedValue;
                                                            charge.amount = slabBasedValue;
                                                        }
                                                    }
                                                }
                                                scope.charges.push(charge);
                                            //}
                                            break;
                                        }
                                    }
                                }
                                scope.penalCharges = $filter('filter')(scope.charges, { penalty: true }) || [];
                                scope.feeCharges = $filter('filter')(scope.charges, { penalty: false }) || [];
                            }
                        }
                    }else{
                        if(scope.applicationData.loanEMIPackData){
                            scope.formData.loanEMIPackId = scope.applicationData.loanEMIPackData.id;
                            if(scope.isGlobalWorkflowEnabled && !scope.isEmiPacksEditable){
                                scope.setLoanEMIPacks(scope.applicationData.loanEMIPackData);
                            }
                        }else{
                            scope.formData.loanAmountRequested = scope.applicationData.loanAmountRequested;
                            scope.formData.numberOfRepayments = scope.applicationData.numberOfRepayments;
                            scope.formData.repaymentPeriodFrequencyEnum = scope.applicationData.repaymentPeriodFrequency.id;
                            scope.formData.repayEvery = scope.applicationData.repayEvery;
                            scope.formData.fixedEmiAmount = scope.applicationData.fixedEmiAmount;
                            delete scope.formData.loanEMIPackId;
                        }
                        scope.formData.externalIdOne = scope.applicationData.externalIdOne;
                        scope.formData.externalIdTwo = scope.applicationData.externalIdTwo;
                        scope.formData.loanOfficerId = scope.applicationData.loanOfficerId;
                        scope.formData.loanProductId = scope.applicationData.loanProductId;
                        scope.formData.loanPurposeId = scope.applicationData.loanPurposeId;
                        scope.handleLoanPurpose(scope.formData.loanPurposeId);
                        scope.formData.termPeriodFrequencyEnum = scope.applicationData.termPeriodFrequency.id;
                        scope.formData.termFrequency = scope.applicationData.termFrequency;
                        scope.formData.noOfTranche = scope.applicationData.noOfTranche;
                        scope.formData.submittedOnDate = dateFilter(new Date(scope.applicationData.submittedOnDate),scope.df);
                        
                        resourceFactory.loanApplicationReferencesResource.getChargesByLoanAppId({
                            loanApplicationReferenceId: scope.loanApplicationReferenceId,
                            command: 'loanapplicationcharges'
                        }, function (loanAppChargeData) {
                            scope.loanAppChargeData = loanAppChargeData;
                            for(var i = 0; i < scope.loanAppChargeData.length; i++){
                                if(scope.loanAppChargeData[i].chargeId){
                                    scope.constructExistingCharges(i,scope.loanAppChargeData[i].chargeId);
                                }else{
                                    curIndex++;
                                }
                            }
                        });
                    }
                    for (var i in scope.productLoanCharges) {
                        var charge = scope.productLoanCharges[i].chargeData;
                        var isChargeAdded = scope.chargesApplicableToLoanApplication.some(chargeAdded => JSON.stringify(chargeAdded) === JSON.stringify(scope.productLoanCharges[i].chargeData));
                        if (scope.productLoanCharges[i].chargeData.chargeTimeType.code == "chargeTimeType.specifiedDueDate" && !isChargeAdded) {
                            scope.chargesApplicableToLoanApplication.push(charge);
                        }
                    }
                });
            };

            scope.getSlabBasedAmount = function(slab, amount , repayment){
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
                return null;

            };

            scope.inRange = function(min,max,value){
                return (value>=min && value<=max);
            };

            scope.$watch('formData.loanAmountRequested ', function(){
                scope.updateSlabBasedCharges();
            });

/*            scope.updateSlabBasedAmountOnChangePrincipalOrRepaymentForEmiPack = function(){
                if(scope.formData.loanEMIPackId != undefined){
                    for(var i in scope.loanaccountinfo.loanEMIPacks){
                        if(scope.loanaccountinfo.loanEMIPacks[i].id == scope.formData.loanEMIPackId){
                            var loanAmountRequested = scope.loanaccountinfo.loanEMIPacks[i].sanctionAmount;
                            var numberOfRepayments = scope.loanaccountinfo.loanEMIPacks[i].numberOfRepayments;
                            scope.updateSlabBasedAmountChargeAmount(loanAmountRequested , numberOfRepayments);
                        }
                    }
                }
            }*/

            scope.updateSlabBasedCharges = function(){
                if(scope.formData.loanAmountRequested != '' && scope.formData.loanAmountRequested != undefined){
                    for(var i in scope.charges){
                        if(scope.charges[i].chargeCalculationType.value == scope.slabBasedCharge) {
                            scope.charges[i] = scope.updateChargeForSlab(scope.charges[i]);
                        }
                    }
                }
            };

            scope.updateSlabBasedAmountOnChangePrincipalOrRepaymentForEmiPack = function(){
                if(scope.formData.loanEMIPackId != undefined){
                    for(var i in scope.charges){
                        if(scope.charges[i].chargeCalculationType.value == scope.slabBasedCharge) {
                            scope.charges[i] = scope.updateChargeForSlab(scope.charges[i]);
                        }
                    }
                    if(scope.showUpfrontAmount && scope.loanaccountinfo.allowUpfrontCollection){
                        scope.updateAmountForUpfrontCollection();
                    }
                }
            }
            
            scope.updateAmountForUpfrontCollection = function(){
                for(var i in scope.loanaccountinfo.loanEMIPacks){
                    if(scope.loanaccountinfo.loanEMIPacks[i].id == scope.formData.loanEMIPackId){
                        scope.formData.amountForUpfrontCollection = scope.loanaccountinfo.loanEMIPacks[i].fixedEmi;
                        break;
                    }
                }
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
                                        var slabBasedValue = null;
                                        if (scope.loanaccountinfo.loanEMIPacks != undefined && scope.formData.loanEMIPackId != undefined) {
                                            for (var x in scope.loanaccountinfo.loanEMIPacks) {
                                                if (scope.loanaccountinfo.loanEMIPacks[x].id == scope.formData.loanEMIPackId) {
                                                    var loanAmountRequested = scope.loanaccountinfo.loanEMIPacks[x].sanctionAmount;
                                                    var numberOfRepayments = scope.loanaccountinfo.loanEMIPacks[x].numberOfRepayments;
                                                    slabBasedValue = scope.getSlabBasedAmount(data.slabs[i], loanAmountRequested, numberOfRepayments);
                                                }
                                            }
                                        } else {
                                            slabBasedValue = scope.getSlabBasedAmount(data.slabs[j], data.glims[i].transactionAmount, scope.formData.numberOfRepayments);
                                        }
                                        if (slabBasedValue != null) {
                                            data.glims[i].upfrontChargeAmount = slabBasedValue;
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
                            var slabBasedValue = null;
                            if (scope.loanaccountinfo.loanEMIPacks != undefined && scope.formData.loanEMIPackId != undefined) {
                                for (var x in scope.loanaccountinfo.loanEMIPacks) {
                                    if (scope.loanaccountinfo.loanEMIPacks[x].id == scope.formData.loanEMIPackId) {
                                        var loanAmountRequested = scope.loanaccountinfo.loanEMIPacks[x].sanctionAmount;
                                        var numberOfRepayments = scope.loanaccountinfo.loanEMIPacks[x].numberOfRepayments;
                                        slabBasedValue = scope.getSlabBasedAmount(data.slabs[j], loanAmountRequested, numberOfRepayments);
                                    }
                                }
                            }else {
                                 slabBasedValue = scope.getSlabBasedAmount(data.slabs[j], scope.formData.loanAmountRequested, scope.formData.numberOfRepayments);
                            }
                            if(slabBasedValue != null){
                                data.amount = slabBasedValue;
                                break;
                            }else {
                                data.amount = undefined;
                            }
                        }
                    }
                }
                return data;
            }

            scope.constructExistingCharges = function (index,chargeId) {
                resourceFactory.chargeResource.get({chargeId: chargeId, template: 'true'}, function (data) {
                    data.chargeId = data.id;
                    for(var i = 0; i < scope.productLoanCharges.length; i++){
                        if(data.id == scope.productLoanCharges[i].chargeData.id){
                            data.isAmountNonEditable = scope.productLoanCharges[i].isAmountNonEditable;
                            break;
                        }
                    }
                    scope.charges.push(data);
                    curIndex++;
                    if(curIndex == scope.loanAppChargeData.length){
                        for(var i = 0 ; i < scope.charges.length; i++){
                            for(var j = 0; j < scope.loanAppChargeData.length; j++){
                                if(scope.charges[i].chargeId == scope.loanAppChargeData[j].chargeId){
                                    scope.charges[i].loanAppChargeId = scope.loanAppChargeData[j].loanAppChargeId;
                                    scope.charges[i].loanApplicationReferenceId = scope.loanAppChargeData[j].loanApplicationReferenceId;
                                    if(scope.loanAppChargeData[j].dueDate){
                                        scope.charges[i].dueDate = dateFilter(new Date(scope.loanAppChargeData[j].dueDate),scope.df);
                                    }
                                    scope.charges[i].amount = scope.loanAppChargeData[j].amount;
                                    scope.charges[i].isMandatory = scope.loanAppChargeData[j].isMandatory;
                                    scope.charges[i].isAmountNonEditable = scope.loanAppChargeData[j].isAmountNonEditable;
                                }
                            }
                        }
                        scope.penalCharges = $filter('filter')(scope.charges, { penalty: true }) || [];
                        scope.feeCharges = $filter('filter')(scope.charges, { penalty: false }) || [];
                    }
                    if (data.chargeTimeType.code != "chargeTimeType.specifiedDueDate") {
                        var index = scope.chargesApplicableToLoanApplication.findIndex(x => x.id === data.chargeId);
                        if (index > -1) {
                            scope.chargesApplicableToLoanApplication.splice(index, 1);
                        }
                    }
                });
            };

            scope.calculateTermFrequency = function (){
                scope.formData.termFrequency = (scope.formData.repayEvery * scope.formData.numberOfRepayments);
                scope.formData.termPeriodFrequencyEnum =  scope.formData.repaymentPeriodFrequencyEnum;
            };

            scope.addTranches = function () {
                scope.formData.disbursementData.push({
                });
            };

            scope.deleteTranches = function (index) {
                scope.formData.disbursementData.splice(index, 1);
            };

            scope.addCharge = function () {
                if (scope.chargeFormData.chargeId) {
                    resourceFactory.chargeResource.get({chargeId: this.chargeFormData.chargeId, template: 'true'}, function (data) {
                        data.chargeId = data.id;
                        if(scope.productLoanCharges && scope.productLoanCharges.length > 0){
                            for(var i in scope.productLoanCharges){
                                if(scope.productLoanCharges[i].chargeData){
                                    if(data.chargeId == scope.productLoanCharges[i].chargeData.id){
                                        data.isMandatory = scope.productLoanCharges[i].isMandatory;
                                        data.isAmountNonEditable = scope.productLoanCharges[i].isAmountNonEditable;
                                        break;
                                    }
                                }
                            }
                        }
                        data = scope.updateChargeForSlab(data);
                        scope.charges.push(data);
                        scope.penalCharges = $filter('filter')(scope.charges, { penalty: true }) || [];
                        scope.feeCharges = $filter('filter')(scope.charges, { penalty: false }) || [];
                        scope.chargeFormData.chargeId = undefined;
                        for (var i = 0; i < scope.chargesApplicableToLoanApplication.length; i++) {
                            if (scope.chargesApplicableToLoanApplication[i].id == data.id && data.chargeTimeType.code != "chargeTimeType.specifiedDueDate") {
                                scope.chargesApplicableToLoanApplication.splice(i, 1);  //removes 1 element at position i
                                break;
                            }
                        }
                    });
                }
            }

            scope.deleteCharge = function (index) {
                var deleteCharge = scope.feeCharges[index];
                var indexCharge = scope.charges.findIndex( charge => charge.id === deleteCharge.id);
                scope.charges.splice(indexCharge,1);
                scope.feeCharges = $filter('filter')(scope.charges, { penalty: false }) || [];
                if(deleteCharge.chargeTimeType.code != "chargeTimeType.specifiedDueDate"){
                    scope.chargesApplicableToLoanApplication.push(deleteCharge);
                }
            }

            scope.submit = function () {
                this.formData.accountType = scope.accountType;
                this.formData.charges = [];
                if(scope.formData.expectedDisbursementDate != undefined){
                    this.formData.expectedDisbursementDate=dateFilter(new Date(scope.formData.expectedDisbursementDate),scope.df);
                }
                if(scope.formData.repaymentsStartingFromDate){
                    this.formData.repaymentsStartingFromDate=dateFilter(new Date(scope.formData.repaymentsStartingFromDate),scope.df);
                }
                if(scope.formData.noOfTranche && scope.formData.noOfTranche > 0 && scope.loanReferenceTrancheData){
                    for(var i=0;i<scope.formData.disbursementData.length;i++) {
                        this.formData.disbursementData[i].expectedTrancheDisbursementDate=dateFilter(this.formData.disbursementData[i].expectedTrancheDisbursementDate,scope.df);
                    }
                }else{
                    delete this.formData.disbursementData;
                }
                for(var i = 0 ; i < scope.charges.length; i++) {
                    var charge = {};
                    if (scope.charges[i].loanAppChargeId) {
                        charge.loanAppChargeId = scope.charges[i].loanAppChargeId;
                    }
                    charge.chargeId = scope.charges[i].chargeId;
                    charge.amount = scope.charges[i].amount;
                    if (scope.charges[i].dueDate) {
                        charge.dueDate = dateFilter(scope.charges[i].dueDate, scope.df);
                    }
                    charge.isMandatory = scope.charges[i].isMandatory;
                    charge.isAmountNonEditable = scope.charges[i].isAmountNonEditable;
                    charge.locale = scope.optlang.code;
                    charge.dateFormat = scope.df;
                    this.formData.charges.push(charge);
                }
                this.formData.submittedOnDate = dateFilter(this.formData.submittedOnDate,scope.df);
                this.formData.noOfTranche = parseInt(this.formData.noOfTranche);
                if (this.formData.loanPurposeId == null){
                    delete this.formData.loanPurposeId;
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

                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                resourceFactory.loanApplicationReferencesResource.update({loanApplicationReferenceId: scope.loanApplicationReferenceId}, this.formData, function (data) {
                    location.path('/viewloanapplicationreference/' + scope.loanApplicationReferenceId);
                });
            };

            scope.cancel = function () {
                location.path('/viewloanapplicationreference/' + scope.loanApplicationReferenceId);
            };

            scope.isChargeAmountNonEditable = function (charge) {
                if ((charge.chargeTimeType.value == UPFRONT_FEE || charge.chargeCalculationType.value == SLAB_BASED) || charge.isAmountNonEditable) {
                    return true;
                }
                return false;
            };

            scope.$watch('disbursementMode', function () {
                scope.disbursementTypeOption = [];
                scope.getDisbursementTypeOtions();
            }, true);

            scope.getDisbursementTypeOtions = function(){
                if( scope.loanaccountinfo && scope.loanaccountinfo.paymentOptions){
                        for(var i in scope.loanaccountinfo.paymentOptions){
                            if((scope.loanaccountinfo.paymentOptions[i].paymentMode== undefined || 
                                scope.loanaccountinfo.paymentOptions[i].paymentMode.id==scope.disbursementMode) && 
                                (scope.loanaccountinfo.paymentOptions[i].applicableOn== undefined || scope.loanaccountinfo.paymentOptions[i].applicableOn.id != scope.applicableOnRepayment)){
                                scope.disbursementTypeOption.push(scope.loanaccountinfo.paymentOptions[i]);
                            } else if (scope.formData && !scope.formData.expectedDisbursalPaymentType){
                                    scope.formData.expectedDisbursalPaymentType = undefined;                               
                            }
                        }
                }
            }

            scope.getRepaymentTypeOptions = function(){
                if(scope.loanaccountinfo && scope.loanaccountinfo.paymentOptions){
                        for(var i in scope.loanaccountinfo.paymentOptions){
                            if((scope.loanaccountinfo.paymentOptions[i].paymentMode== undefined || 
                                scope.loanaccountinfo.paymentOptions[i].paymentMode.id==scope.repaymentMode) && 
                                (scope.loanaccountinfo.paymentOptions[i].applicableOn== undefined || scope.loanaccountinfo.paymentOptions[i].applicableOn.id != scope.applicableOnDisbursement)){
                                scope.repaymentTypeOption.push(scope.loanaccountinfo.paymentOptions[i]);
                            }
                        }
                    
                }  
            };

            scope.showBackToPreviewRepayments = function(){
                return (!scope.isHiddenExpectedDisbursementDate && (scope.loanaccountinfo && scope.previewRepayment));
            };

            scope.showPreviewRepayments = function(){
                return (!scope.isHiddenExpectedDisbursementDate && (scope.loanaccountinfo && !scope.previewRepayment));
            };

            scope.previewRepayments = function(data) {
                scope.calculateLoanScheduleData = {};
                angular.copy(this.formData,scope.calculateLoanScheduleData);
                scope.calculateLoanScheduleData.productId = scope.formData.loanProductId ;
                scope.calculateLoanScheduleData.locale = scope.optlang.code;
                scope.calculateLoanScheduleData.dateFormat = scope.df;
                if(scope.formData.expectedDisbursementDate != undefined){
                      scope.calculateLoanScheduleData.expectedDisbursementDate = dateFilter(new Date(scope.formData.expectedDisbursementDate),scope.df);
                }
                if(scope.formData.repaymentsStartingFromDate != undefined){
                    scope.calculateLoanScheduleData.repaymentsStartingFromDate = dateFilter(new Date(scope.formData.repaymentsStartingFromDate),scope.df);
                }
                scope.calculateLoanScheduleData.charges = [];
                for(var i = 0 ; i < scope.charges.length; i++) {
                    var charge = {};
                    charge.chargeId = scope.charges[i].chargeId;
                    charge.amount = scope.charges[i].amount;
                    if (scope.charges[i].dueDate) {
                        charge.dueDate = dateFilter(scope.charges[i].dueDate, scope.df);
                    }
                    scope.calculateLoanScheduleData.charges.push(charge);
                }

                if (this.formData.syncRepaymentsWithMeeting) {
                    this.formData.calendarId = scope.loanaccountinfo.calendarOptions[0].id;
                    scope.calculateLoanScheduleData.syncRepaymentsWithMeeting = this.formData.syncRepaymentsWithMeeting;
                }

                if (scope.loanaccountinfo.calendarOptions) {
                    if (scope.response && !scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.syncDisbursementWithMeeting) {
                        scope.calculateLoanScheduleData.syncDisbursementWithMeeting = false;
                    } else {
                        scope.calculateLoanScheduleData.syncDisbursementWithMeeting = true;
                        this.calculateLoanScheduleData.calendarId = scope.loanaccountinfo.calendarOptions[0].id;
                    }
                }

                if (this.calculateLoanScheduleData.disbursementData.length > 0) {
                    for (var i = 0 ; i<this.calculateLoanScheduleData.disbursementData.length;i++) {
                        this.calculateLoanScheduleData.disbursementData[i].expectedDisbursementDate = dateFilter(this.calculateLoanScheduleData.disbursementData[i].expectedTrancheDisbursementDate, scope.df);
                        this.calculateLoanScheduleData.disbursementData[i].principal = this.calculateLoanScheduleData.disbursementData[i].trancheAmount;
                        delete this.calculateLoanScheduleData.disbursementData[i].expectedTrancheDisbursementDate;
                        delete this.calculateLoanScheduleData.disbursementData[i].trancheAmount;
                    }
                }

                if(this.loanaccountinfo.loanEMIPacks && scope.formData.loanEMIPackId){
                    if(scope.calculateLoanScheduleData.amountForUpfrontCollection && !showUpfrontAmount && !scope.loanaccountinfo.allowUpfrontCollection){
                        delete scope.calculateLoanScheduleData.amountForUpfrontCollection;
                    }
                    if(scope.calculateLoanScheduleData.discountOnDisbursalAmount){
                            delete scope.calculateLoanScheduleData.discountOnDisbursalAmount;
                    }
                    scope.calculateLoanScheduleData.disbursementData = [];
                    for(var i in scope.loanaccountinfo.loanEMIPacks){
                        if(scope.loanaccountinfo.loanEMIPacks[i].id == scope.formData.loanEMIPackId){
                            scope.calculateLoanScheduleData.principal = scope.loanaccountinfo.loanEMIPacks[i].sanctionAmount;
                            scope.calculateLoanScheduleData.fixedEmiAmount = scope.loanaccountinfo.loanEMIPacks[i].fixedEmi;
                            scope.calculateLoanScheduleData.loanTermFrequency = scope.loanaccountinfo.loanEMIPacks[i].numberOfRepayments;
                            scope.calculateLoanScheduleData.repaymentFrequencyType = scope.loanaccountinfo.loanEMIPacks[i].repaymentFrequencyType.id;
                            scope.calculateLoanScheduleData.repaymentEvery = scope.loanaccountinfo.loanEMIPacks[i].repaymentEvery;
                            var disbursementData = {};
                            disbursementData.expectedDisbursementDate = scope.calculateLoanScheduleData.expectedDisbursementDate;
                            disbursementData.principal = scope.calculateLoanScheduleData.principal;
                            scope.calculateLoanScheduleData.disbursementData.push(disbursementData);
                            break;
                        }
                    }
                }else{
                    scope.calculateLoanScheduleData.principal = scope.formData.loanAmountRequested ;
                    scope.calculateLoanScheduleData.loanTermFrequency = scope.formData.termFrequency;
                    scope.calculateLoanScheduleData.repaymentFrequencyType = scope.formData.repaymentPeriodFrequencyEnum;
                    scope.calculateLoanScheduleData.repaymentEvery = scope.formData.repayEvery;  
                    scope.calculateLoanScheduleData.loanTermFrequencyType =  scope.formData.termPeriodFrequencyEnum;
                }

                if(scope.product){
                    this.calculateLoanScheduleData.allowPartialPeriodInterestCalcualtion = scope.loanaccountinfo.product.allowPartialPeriodInterestCalcualtion;
                    this.calculateLoanScheduleData.transactionProcessingStrategyId = this.product.transactionProcessingStrategyId;
                    this.calculateLoanScheduleData.interestCalculationPeriodType = this.product.interestCalculationPeriodType.id;
                    this.calculateLoanScheduleData.interestType = this.product.interestType.id;
                    this.calculateLoanScheduleData.amortizationType = scope.product.amortizationType.id; 
                }

                if(this.formData.interestRatePerPeriod){
                    this.calculateLoanScheduleData.interestRatePerPeriod = this.formData.interestRatePerPeriod;
                }else{
                    this.calculateLoanScheduleData.interestRatePerPeriod = scope.product.interestRatePerPeriod;
                }

                scope.calculateLoanScheduleData.interestRatePerPeriod = scope.formData.interestRatePerPeriod;
               
                delete   scope.calculateLoanScheduleData.loanProductId;
                delete   scope.calculateLoanScheduleData.loanAmountRequested;
                delete   scope.calculateLoanScheduleData.noOfTranche;
                delete   scope.calculateLoanScheduleData.termFrequency;
                delete   scope.calculateLoanScheduleData.repaymentPeriodFrequencyEnum;
                delete   scope.calculateLoanScheduleData.termPeriodFrequencyEnum;
                delete   scope.calculateLoanScheduleData.repayEvery;
                delete   scope.calculateLoanScheduleData.loanEMIPackId;
                if(scope.calculateLoanScheduleData.loanAppChargeId){
                    delete scope.calculateLoanScheduleData.loanAppChargeId;
                }
                resourceFactory.loanApplicationReferencesRepaymentScheduleResource.repaymentSchedule({loanApplicationReferenceId: scope.loanApplicationReferenceId}, scope.calculateLoanScheduleData, function (data) {
                    scope.repaymentscheduleinfo = data;
                    scope.previewRepayment = true;
                });
            };
                
            scope.$watch('repaymentMode', function () {
                scope.repaymentTypeOption = [];
                scope.getRepaymentTypeOptions();                
            }, true);

            scope.canDisburseToGroupsBanks = function(){
                return (scope.canDisburseToGroupBankAccounts && scope.allowBankAccountsForGroups && scope.allowDisbursalToGroupBankAccounts);
            };
            
            scope.setLoanEMIPacks = function(loanEMIPack){
                scope.loanaccountinfo.loanEMIPacks = [];
                scope.loanaccountinfo.loanEMIPacks.push(loanEMIPack);
                scope.loanaccountinfo.loanEMIPacks[0].combinedRepayEvery = scope.loanaccountinfo.loanEMIPacks[0].repaymentEvery
                    + ' - ' + $filter('translate')(scope.loanaccountinfo.loanEMIPacks[0].repaymentFrequencyType.value);
            }

            scope.handleLoanPurpose = function (loanPurposeId) {
                var selectedLoanPurpose = scope.loanPurposeOptions.find(function (loanPurpose) {
                    return loanPurpose.id === loanPurposeId;
                })
                if(selectedLoanPurpose){
                    scope.showLoanPurposeCustomField = selectedLoanPurpose.isCustom;
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
        }
    });
    mifosX.ng.application.controller('UpdateLoanApplicationReference', ['$scope', '$routeParams', 'ResourceFactory', '$location', 'dateFilter', '$filter', mifosX.controllers.UpdateLoanApplicationReference]).run(function ($log) {
        $log.info("UpdateLoanApplicationReference initialized");
    });
}(mifosX.controllers || {}));