(function (module) {
    mifosX.controllers = _.extend(module, {
        NewLoanApplicationReference: function ($controller,scope, routeParams, resourceFactory, location, dateFilter, $filter) {
            angular.extend(this, $controller('defaultUIConfigController', {$scope: scope,$key:"createLoanApplication"}));
            scope.clientId = routeParams.clientId;
            scope.groupId = routeParams.groupId;

            scope.restrictDate = new Date();

            scope.formData = {};
            scope.formData.Workflowtype = true;

            scope.paymentOptions = [];
            scope.formData.disbursementData=[];
            scope.formData.submittedOnDate = dateFilter(scope.restrictDate,scope.df);

            scope.chargeFormData = {}; //For charges

            var SLAB_BASED = 'slabBasedCharge';
            var UPFRONT_FEE = 'upfrontFee';
            scope.slabBasedCharge = "Slab Based";
            scope.installmentAmountSlabChargeType = 1;
            scope.canDisburseToGroupBankAccounts = false;
            scope.allowBankAccountsForGroups = scope.isSystemGlobalConfigurationEnabled('allow-bank-account-for-groups');
            scope.allowDisbursalToGroupBankAccounts = scope.isSystemGlobalConfigurationEnabled('allow-multiple-bank-disbursal');
            scope.parentGroups = [];
            scope.disbursementToGroupAllowed = (scope.allowBankAccountsForGroups && scope.allowDisbursalToGroupBankAccounts);

            scope.paymentModeOptions = [];
            scope.repaymentTypeOption = [];
            scope.disbursementTypeOption = [];
            scope.applicableOnRepayment = 1;
            scope.applicableOnDisbursement = 2;
            scope.previewRepayment = false;
            scope.isHiddenExpectedDisbursementDate = true;
            scope.isHiddenFirstRepaymentDate = true;
            scope.isHiddenRateOfInterest = true;
            scope.isHiddenTrancheData = true;
            scope.isMandatoryExpectedDisbursementDate = false;
            scope.isMandatoryFirstRepaymentDate = false;
            scope.isMandatoryRateOfInterest = false;
            scope.isMandatoryDisbursementPaymentMode = false;
            scope.isMandatoryDisbursementPaymentType = false;
            scope.loanReferenceTrancheData = false;
            scope.isLoanPurposeRequired = false;
            scope.isLoanOfficerRequired = false;
            scope.showLoanPurposeCustomField = false;
            scope.showLoanTerms = true;
            scope.repeatsOnDayOfMonthOptions = [];
            scope.selectedOnDayOfMonthOptions = [];
            scope.repeatsOnDayOfMonth =[];

            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createLoanApplication) {
                if (scope.response.uiDisplayConfigurations.createLoanApplication.isHiddenField) {
                    scope.isHiddenExpectedDisbursementDate = scope.response.uiDisplayConfigurations.createLoanApplication.isHiddenField.expectedDisbursementDate;
                    scope.isHiddenFirstRepaymentDate = scope.response.uiDisplayConfigurations.createLoanApplication.isHiddenField.firstRepaymentDate;
                    scope.isHiddenRateOfInterest = scope.response.uiDisplayConfigurations.createLoanApplication.isHiddenField.interestRatePerPeriod;
                    scope.isHiddenTrancheData = scope.response.uiDisplayConfigurations.createLoanApplication.isHiddenField.tranchedata;
                    scope.newLoanApplicationLimitAllowed = scope.response.uiDisplayConfigurations.createLoanApplication.newLoanApplicationLimitAllowed;
                }
                if (scope.response.uiDisplayConfigurations.createLoanApplication.isMandatoryField) {
                    scope.isMandatoryExpectedDisbursementDate = scope.response.uiDisplayConfigurations.createLoanApplication.isMandatoryField.expectedDisbursementDate;
                    scope.isMandatoryFirstRepaymentDate = scope.response.uiDisplayConfigurations.createLoanApplication.isMandatoryField.firstRepaymentDate;
                    scope.isMandatoryRateOfInterest = scope.response.uiDisplayConfigurations.createLoanApplication.isMandatoryField.interestRatePerPeriod;
                    scope.isMandatoryDisbursementPaymentMode = scope.response.uiDisplayConfigurations.createLoanApplication.isMandatoryField.disbursementPaymentMode;
                    scope.isMandatoryDisbursementPaymentType = scope.response.uiDisplayConfigurations.createLoanApplication.isMandatoryField.disbursementPaymentType;
                }
                if (scope.response.uiDisplayConfigurations.createLoanApplication.isMandatory) {
                    scope.loanReferenceTrancheData = scope.response.uiDisplayConfigurations.createLoanApplication.isMandatory.trancheData;
                    scope.isLoanPurposeRequired = scope.response.uiDisplayConfigurations.createLoanApplication.isMandatory.loanPurposeId;
                    scope.isLoanOfficerRequired = scope.response.uiDisplayConfigurations.createLoanApplication.isMandatoryField.loanOfficer;
                }
            }

            for (var i = 1; i <= 28; i++) {
                scope.repeatsOnDayOfMonthOptions.push(i);
            }

            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.loanAccount) {
                scope.showRepaymentFrequencyNthDayType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.repaymentFrequencyNthDayType;
                scope.showRepaymentFrequencyDayOfWeekType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.repaymentFrequencyDayOfWeekType;     
            }

            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.loanApplicationDisbursal){
                scope.repaidEveryConfigIsActive = !scope.response.uiDisplayConfigurations.loanApplicationDisbursal.isHiddenField.repaidEvery;
            }

            resourceFactory.clientResource.get({clientId: routeParams.clientId, associations:'hierarchyLookup'}, function (data) {
                if (data.groups.length == 1) {
                    if (data.groups[0].groupLevel == 2) {
                        scope.group = data.groups[0];
                    }
                    if (data.groups[0].groupLevel == 1) {
                        scope.center = data.groups[0];
                    }
                }
            });

            scope.inparams = {resourceType: 'template', activeOnly: 'true'};
            
            if (scope.clientId && scope.groupId && !scope.disbursementToGroupAllowed)  {
                scope.inparams.templateType = 'jlg';
            } else if (scope.groupId && !scope.disbursementToGroupAllowed) {
                scope.inparams.templateType = 'group';
            } else if (scope.clientId) {
                scope.inparams.templateType = 'individual';
            }
            if (scope.clientId) {
                scope.inparams.clientId = scope.clientId;
                scope.formData.clientId = scope.clientId;
            }
            if (scope.groupId) {
                scope.inparams.groupId = scope.groupId;
                scope.formData.groupId = scope.groupId;
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
                scope.loanaccountinfo = data;
                scope.paymentModeOptions = data.paymentModeOptions ;

                if (data.clientName) {
                    scope.clientName = data.clientName;
                }
            });

            resourceFactory.clientParentGroupsResource.getParentGroups({clientId:  scope.clientId}, function (data) {
                scope.parentGroups = data;
            });

            scope.loanProductChange = function (loanProductId) {
                scope.inparams.productId = loanProductId;
                scope.previewRepayment = false;
                scope.formPreviewRepaymentData = {};
                scope.showLoanTerms =!(scope.loanaccountinfo.loanEMIPacks && scope.isLoanEmiPackEnabled)?true:false;
                resourceFactory.loanResource.get(scope.inparams, function (data) {
                    scope.loanaccountinfo = data;
                    scope.loanPurposeOptions = scope.loanaccountinfo.loanPurposeOptions;
                    scope.formData.isTopup = scope.loanaccountinfo.canUseForTopup;
                    scope.product = scope.loanaccountinfo.product;
                 
                    if(scope.loanaccountinfo.loanEMIPacks){
                        var len = scope.loanaccountinfo.loanEMIPacks.length;
                        for(var i = 0; i < len; i++){
                            scope.loanaccountinfo.loanEMIPacks[i].combinedRepayEvery = scope.loanaccountinfo.loanEMIPacks[i].repaymentEvery
                                + ' - ' + $filter('translate')(scope.loanaccountinfo.loanEMIPacks[i].repaymentFrequencyType.value);
                        }
                        scope.formData.loanEMIPackId = scope.loanaccountinfo.loanEMIPacks[0].id;
                        scope.formData.loanAmountRequested = scope.loanaccountinfo.loanEMIPacks[0].sanctionAmount;
                        scope.formData.numberOfRepayments = scope.loanaccountinfo.loanEMIPacks[0].numberOfRepayments;
                        if(scope.showUpfrontAmount && scope.loanaccountinfo.allowUpfrontCollection){
                            scope.formData.amountForUpfrontCollection = scope.loanaccountinfo.loanEMIPacks[0].fixedEmi;
                        }
                    }else{
                        scope.formData.loanAmountRequested = scope.loanaccountinfo.principal;
                        if (scope.loanaccountinfo.fixedEmiAmount) {
                            scope.formData.fixedEmiAmount = scope.loanaccountinfo.fixedEmiAmount;
                        }
                        scope.formData.numberOfRepayments = scope.loanaccountinfo.numberOfRepayments;
                        scope.formData.repayEvery = scope.loanaccountinfo.repaymentEvery;
                        scope.formData.repaymentPeriodFrequencyEnum = scope.loanaccountinfo.repaymentFrequencyType.id;
                        delete scope.formData.loanEMIPackId;
                    }

                    if(scope.canDisburseToGroupsBanks() && scope.inparams.templateType ==='individual'){
                        scope.formData.groupId = undefined;
                    }
                    if(scope.loanaccountinfo.product.repaymentFrequencyNthDayType){
                        scope.formData.repaymentFrequencyNthDayType = scope.loanaccountinfo.product.repaymentFrequencyNthDayType.id;
                    } else {
                        delete scope.formData.repaymentFrequencyNthDayType;
                    }
                    if(scope.loanaccountinfo.product.repaymentFrequencyDayOfWeekType){
                        scope.formData.repaymentFrequencyDayOfWeekType = scope.loanaccountinfo.product.repaymentFrequencyDayOfWeekType.id;
                    } else {
                        delete scope.formData.repaymentFrequencyDayOfWeekType;
                    }
                    if(scope.loanaccountinfo.product.repeatsOnDayOfMonth && scope.loanaccountinfo.product.repeatsOnDayOfMonth.length>0){
                        scope.available = scope.loanaccountinfo.product.repeatsOnDayOfMonth;
                        scope.addMonthDay();
                    } else {
                        scope.available = [];
                        scope.selectedOnDayOfMonthOptions = [];
                    }
                    scope.canDisburseToGroupBankAccounts = scope.loanaccountinfo.allowsDisbursementToGroupBankAccounts;
                    if( scope.loanaccountinfo.paymentOptions){
                        scope.paymentOptions = scope.loanaccountinfo.paymentOptions;
                    }
                    scope.setDefaultGISConfig();
                    if(scope.loanaccountinfo.loanOfficerId){
                        scope.formData.loanOfficerId = scope.loanaccountinfo.loanOfficerId;
                    }

                    if (scope.loanaccountinfo.product.isRepaymentAtDisbursement == true && scope.loanaccountinfo.product.noOfAdvEmiCollection) {
                        scope.formData.noOfAdvEmiCollection = scope.loanaccountinfo.product.noOfAdvEmiCollection;
                    }

                    if(scope.loanaccountinfo.loanOfficerOptions){
                        resourceFactory.clientResource.get({clientId: scope.clientId}, function (data) {
                            if(data.staffId != null){
                                scope.formData.loanOfficerId =  data.staffId;
                            }
                        })
                    }
                    if(scope.loanaccountinfo.multiDisburseLoan == true && scope.loanaccountinfo.product){
                        if(scope.loanaccountinfo.product.maxTrancheCount){
                            scope.formData.noOfTranche = parseInt(scope.loanaccountinfo.product.maxTrancheCount);
                            if (scope.formData.noOfTranche && scope.formData.noOfTranche > 0) {
                                scope.constructTranches();
                            }
                        }
                        scope.formData.maxOutstandingLoanBalance = scope.loanaccountinfo.product.outstandingLoanBalance;
                    }
                    scope.formData.interestRatePerPeriod = scope.loanaccountinfo.product.interestRatePerPeriod;
                    scope.formData.termFrequency = (scope.loanaccountinfo.repaymentEvery * scope.loanaccountinfo.numberOfRepayments);
                    scope.formData.termPeriodFrequencyEnum = scope.loanaccountinfo.repaymentFrequencyType.id;
                    scope.charges = [];//scope.loanaccountinfo.charges || [];
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
                                        if (charge.chargeCalculationType.value == scope.slabBasedCharge && charge.slabs.length > 0) {
                                            for (var x in charge.slabs) {
                                                var slabBasedValue = scope.getSlabBasedAmount(charge.slabs[x], scope.formData.loanAmountRequested, scope.formData.numberOfRepayments);
                                                if (slabBasedValue != null) {
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
                        }
                    }
                    for (var i in scope.charges) {
                        var isChargeAdded = scope.chargeOptionsApplicableToLoanApplication.some(chargeAdded => JSON.stringify(chargeAdded) === JSON.stringify(scope.charges[i]));
                        if (scope.charges[i].chargeTimeType.code == "chargeTimeType.specifiedDueDate" && !isChargeAdded) {
                            scope.chargeOptionsApplicableToLoanApplication.push(scope.charges[i]);
                        }
                    }
                });
            };

            scope.loanTermCalculation=function(){
                scope.loanTerm= scope.formData.numberOfRepayments*scope.formData.repayEvery;
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

            scope.setDefaultGISConfig = function () {
                if(scope.paymentOptions) {
                    if (scope.responseDefaultGisData && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.paymentType) {
                        if (scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.paymentType.expectedDisbursalPaymentType) {
                            for (var i = 0; i < scope.paymentOptions.length; i++) {
                                var paymentTypeName = scope.paymentOptions[i].name;
                                var defaultPaymentTypeName = scope.responseDefaultGisData.
                                    uiDisplayConfigurations.defaultGISConfig.paymentType.expectedDisbursalPaymentType;
                                if (paymentTypeName == defaultPaymentTypeName) {
                                    var paymentOptionId =  scope.paymentOptions[i].id;
                                    scope.formData.expectedDisbursalPaymentType = paymentOptionId;
                                }
                            }
                        }
                        if (scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.paymentType.expectedRepaymentPaymentType) {
                            for (var i = 0; i < scope.paymentOptions.length; i++) {
                                var paymentTypeName = scope.paymentOptions[i].name;
                                var defaultPaymentTypeName = scope.responseDefaultGisData.
                                    uiDisplayConfigurations.defaultGISConfig.paymentType.expectedRepaymentPaymentType;
                                if (paymentTypeName == defaultPaymentTypeName) {
                                    var paymentOptionId =  scope.paymentOptions[i].id;
                                    scope.formData.expectedRepaymentPaymentType = paymentOptionId;
                                }
                            }
                        }
                    }
                }
            };

            scope.handleLoanPurpose = function (loanPurposeId) {
                var selectedLoanPurpose = scope.loanPurposeOptions.find(function (loanPurpose) {
                    return loanPurpose.id === loanPurposeId;
                })
                if(selectedLoanPurpose){
                    scope.showLoanPurposeCustomField = selectedLoanPurpose.isCustom;
                }
            }

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

            scope.constructTranches = function () {
                var noOfTranche = scope.formData.noOfTranche;
                var i = 0;
                while (i < noOfTranche) {
                    var loanApplicationReferenceTrancheDatas = {};
                    scope.formData.disbursementData.push(loanApplicationReferenceTrancheDatas);
                    i++;
                }
            };

            scope.addCharge = function () {
                if (scope.chargeFormData.chargeId) {
                    var chargeId = scope.chargeFormData.chargeId;
                    scope.chargeFormData.chargeId = undefined;
                    resourceFactory.chargeResource.get({chargeId: chargeId, template: 'true'}, function (data) {
                        data.chargeId = data.id;
                        if(scope.isGLIM){
                            scope.updateChargeForSlab(data);
                        }
                        else {
                            if((data.chargeCalculationType.value == scope.slabBasedCharge || data.isSlabBased) && data.slabs.length > 0){
                                for(var i in data.slabs) {
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
                                        slabBasedValue = scope.getSlabBasedAmount(data.slabs[i], scope.formData.loanAmountRequested, scope.formData.numberOfRepayments);
                                    }
                                    if (slabBasedValue != null) {
                                        data.amount = slabBasedValue;
                                    }
                                }
                            }
                        }
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
                        scope.charges.push(data);
                        for (var i = 0; i < scope.chargeOptionsApplicableToLoanApplication.length; i++) {
                            if (scope.chargeOptionsApplicableToLoanApplication[i].id == data.id && data.chargeTimeType.code != "chargeTimeType.specifiedDueDate") {
                                scope.chargeOptionsApplicableToLoanApplication.splice(i, 1);  //removes 1 element at position i
                                break;
                            }
                        }
                    });
                }
            }

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

            scope.inRange = function(min,max,value){
                return (value>=min && value<=max);
            };

            scope.updateSlabBasedAmountOnChangePrincipalOrRepaymentForEmiPack = function(){
                if(scope.formData.loanEMIPackId != undefined){
                    for(var i in scope.loanaccountinfo.loanEMIPacks){
                        if(scope.loanaccountinfo.loanEMIPacks[i].id == scope.formData.loanEMIPackId){
                            var loanAmountRequested = scope.loanaccountinfo.loanEMIPacks[i].sanctionAmount;
                            var numberOfRepayments = scope.loanaccountinfo.loanEMIPacks[i].numberOfRepayments;
                            if(scope.showUpfrontAmount && scope.loanaccountinfo.allowUpfrontCollection){
                                scope.formData.amountForUpfrontCollection = scope.loanaccountinfo.loanEMIPacks[i].fixedEmi;
                            }
                            scope.updateSlabBasedAmountChargeAmount(loanAmountRequested , numberOfRepayments);
                            break;
                        }
                    }
                }
            }

            scope.updateSlabBasedAmountOnChangePrincipalOrRepayment = function(){
                scope.updateSlabBasedAmountChargeAmount(scope.formData.loanAmountRequested, scope.formData.numberOfRepayments);
            };

            scope.updateSlabBasedAmountChargeAmount = function(loanAmountRequested, numberOfRepayments){
                if(loanAmountRequested != '' && loanAmountRequested != undefined && numberOfRepayments != '' && numberOfRepayments != undefined){
                    for(var i in scope.charges){
                        if((scope.charges[i].chargeCalculationType.value == scope.slabBasedCharge || scope.charges[i].isSlabBased) && scope.charges[i].slabs.length > 0) {
                            if(scope.isGLIM){
                                scope.charges[i].amount = scope.updateSlabBasedChargeForGlim(scope.charges[i]);
                                scope.updateChargeForSlab(scope.charges[i]);
                            }else{
                                for(var j in scope.charges[i].slabs){
                                    var slabBasedValue = scope.getSlabBasedAmount(scope.charges[i].slabs[j],loanAmountRequested,numberOfRepayments);
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
            }

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

            scope.chargeOptionsApplicableToLoanApplication = [];
            scope.deleteCharge = function (index) {
                var temp = scope.charges[index];
                if(temp.chargeTimeType.code != "chargeTimeType.specifiedDueDate"){
                    scope.chargeOptionsApplicableToLoanApplication.push(temp);
                }
                scope.charges.splice(index, 1);
            }

            scope.submit = function () {
                this.formData.charges = [];
                for (var i = 0; i < scope.charges.length; i++) {
                    //if(scope.charges[i].amount > 0) {
                    var charge = {};
                    if (scope.charges[i].id) {
                        charge.chargeId = scope.charges[i].id;
                    }
                    if (scope.charges[i].chargeId) {
                        charge.chargeId = scope.charges[i].chargeId;
                    }
                    charge.amount = scope.charges[i].amount;
                    if (scope.charges[i].dueDate) {
                        charge.dueDate = dateFilter(scope.charges[i].dueDate, scope.df);
                    }
                    charge.isMandatory = scope.charges[i].isMandatory;
                    charge.isAmountNonEditable = scope.charges[i].isAmountNonEditable;
                    charge.locale = scope.optlang.code;
                    charge.dateFormat = scope.df;
                    this.formData.charges.push(charge);
                    //}
                }
                if (scope.repaidEveryConfigIsActive) {
                    if (scope.formData.repaymentPeriodFrequencyEnum == 2 && scope.formData.repaymentFrequencyNthDayType) {
                        scope.formData.repeatsOnDayOfMonth = scope.selectedOnDayOfMonthOptions;
                    } else {
                        scope.formData.repeatsOnDayOfMonth = [];
                    }
                }

                if (scope.loanaccountinfo.loanEMIPacks) {
                    delete scope.formData.repeatsOnDayOfMonth;
                    delete scope.formData.loanTermFrequencyType;
                    delete scope.formData.repaymentFrequencyNthDayType;
                }

                if (scope.loanaccountinfo.overdueCharges && scope.loanaccountinfo.overdueCharges.length > 0) {
                    for (var i in scope.loanaccountinfo.overdueCharges) {
                        if (scope.loanaccountinfo.overdueCharges[i].chargeData.amount > 0) {
                            var charge = {};
                            if (scope.loanaccountinfo.overdueCharges[i].chargeData.id) {
                                charge.chargeId = scope.loanaccountinfo.overdueCharges[i].chargeData.id;
                            }
                            charge.amount = scope.loanaccountinfo.overdueCharges[i].chargeData.amount;
                            charge.isMandatory = scope.loanaccountinfo.overdueCharges[i].isMandatory;
                            charge.isAmountNonEditable = scope.loanaccountinfo.overdueCharges[i].isAmountNonEditable;
                            charge.locale = scope.optlang.code;
                            charge.dateFormat = scope.df;
                            this.formData.charges.push(charge);
                        }
                    }
                }
                if(scope.formData.noOfTranche && scope.formData.noOfTranche > 0 && scope.loanReferenceTrancheData){
                    for(var i=0;i<scope.formData.disbursementData.length;i++) {
                        this.formData.disbursementData[i].expectedTrancheDisbursementDate=dateFilter(this.formData.disbursementData[i].expectedTrancheDisbursementDate,scope.df);
                    }
                }else{
                    delete this.formData.disbursementData;
                }
                this.formData.submittedOnDate = dateFilter(this.formData.submittedOnDate, scope.df);
                this.formData.expectedDisbursementDate = dateFilter(this.formData.expectedDisbursementDate, scope.df);
                if (!_.isUndefined(this.formData.submittedOnDate) && _.isUndefined(this.formData.expectedDisbursementDate)) {
                    this.formData.expectedDisbursementDate = this.formData.submittedOnDate;
                } else {
                    this.formData.expectedDisbursementDate = dateFilter(new Date(), scope.df);
                }
                this.formData.repaymentsStartingFromDate = dateFilter(this.formData.repaymentsStartingFromDate, scope.df);
                this.formData.accountType = scope.inparams.templateType;
                if (scope.parentGroups != undefined && scope.parentGroups.length > 0 && !scope.canDisburseToGroupsBanks()) {
                    this.formData.groupId = scope.parentGroups[0].id;
                }
                if(scope.inparams.templateType ==='individual' && !scope.allowGroupBankAccountInDisburse) {
                    delete scope.formData.groupId;
                }
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
                if (scope.repaidEveryConfigIsActive) {
                    scope.formData.userOverriddenTerms = populateUserOverriddenTerms();
                }
                resourceFactory.loanApplicationReferencesResource.save(this.formData, function (data) {
                    // if(data.changes.isProductMappedToWorkFlow === true){
                    //     location.path('/loanapplication/' + data.resourceId+'/workflow');
                    // }else{
                        location.path('/viewloanapplicationreference/' + data.resourceId);
                    // }
                });
            };

            scope.cancel = function () {
                if (scope.groupId) {
                    location.path('/viewgroup/' + scope.groupId);
                } else if (scope.clientId) {
                    location.path('/viewclient/' + scope.clientId);
                }
            };

            scope.isChargeAmountNonEditable = function (charge) {
                if (charge.chargeTimeType.value == UPFRONT_FEE
                    || charge.chargeCalculationType.value == SLAB_BASED || charge.isAmountNonEditable) {
                    return true;
                }
                return false;
            };

            scope.$watch('disbursementModeId', function (newValue, oldValue, scope) {
                scope.changeDisbursalMode();
            }, true);
                
            scope.$watch('repaymentModeId', function (newValue, oldValue, scope) {
                scope.changeRepaymentMode();
            }, true);



            scope.changeDisbursalMode = function(){
                scope.disbursementTypeOption = [];
                if(scope.isMandatoryDisbursementPaymentMode){
                    scope.formData.expectedDisbursalPaymentType = null;
                }
                if(scope.loanaccountinfo && scope.loanaccountinfo.paymentOptions){
                        for(var i in scope.loanaccountinfo.paymentOptions){
                            if((scope.loanaccountinfo.paymentOptions[i].paymentMode== undefined || 
                                scope.loanaccountinfo.paymentOptions[i].paymentMode.id==this.disbursementModeId) && 
                                (scope.loanaccountinfo.paymentOptions[i].applicableOn== undefined || scope.loanaccountinfo.paymentOptions[i].applicableOn.id != scope.applicableOnRepayment)){
                                scope.disbursementTypeOption.push(scope.loanaccountinfo.paymentOptions[i]);
                            }
                        }
                    
                }
            };

            scope.changeRepaymentMode = function(){
                scope.repaymentTypeOption = [];
                if(scope.loanaccountinfo && scope.loanaccountinfo.paymentOptions){
                        for(var i in scope.loanaccountinfo.paymentOptions){
                            if((scope.loanaccountinfo.paymentOptions[i].paymentMode== undefined || 
                                scope.loanaccountinfo.paymentOptions[i].paymentMode.id==this.repaymentModeId) && 
                                (scope.loanaccountinfo.paymentOptions[i].applicableOn== undefined || scope.loanaccountinfo.paymentOptions[i].applicableOn.id != scope.applicableOnDisbursement)){
                                scope.repaymentTypeOption.push(scope.loanaccountinfo.paymentOptions[i]);

                            }
                        }
                }
            };

            scope.canDisburseToGroupsBanks = function(){
                return (scope.canDisburseToGroupBankAccounts && scope.allowBankAccountsForGroups && scope.allowDisbursalToGroupBankAccounts);
            }; 

            scope.showBackToPreviewRepayments = function(){
                return (!scope.isHiddenExpectedDisbursementDate && (scope.loanaccountinfo && scope.previewRepayment));
            };

            scope.showPreviewRepayments = function(){
                return (!scope.isHiddenExpectedDisbursementDate && (scope.loanaccountinfo && !scope.previewRepayment));
            };

            scope.previewRepayments = function () {

                scope.formPreviewRepaymentData = {};
                angular.copy(scope.formData, scope.formPreviewRepaymentData);

                this.formPreviewRepaymentData.productId = scope.formData.loanProductId;
                this.formPreviewRepaymentData.locale = scope.optlang.code;
                this.formPreviewRepaymentData.dateFormat = scope.df;
                this.formPreviewRepaymentData.loanType = scope.inparams.templateType;

               if (scope.loanaccountinfo.calendarOptions) {
                    if (scope.response && !scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.syncDisbursementWithMeeting) {
                        scope.formPreviewRepaymentData.syncDisbursementWithMeeting = false;
                    } else {
                        scope.formPreviewRepaymentData.syncDisbursementWithMeeting = true;
                        this.formPreviewRepaymentData.calendarId = scope.loanaccountinfo.calendarOptions[0].id;
                    }
                }

                if (!_.isUndefined(this.formData.expectedDisbursementDate)) {
                    this.formPreviewRepaymentData.expectedDisbursementDate = dateFilter(this.formData.expectedDisbursementDate, scope.df);
                }
                else {
                    this.formPreviewRepaymentData.expectedDisbursementDate = dateFilter(new Date(), scope.df);
                }
                this.formPreviewRepaymentData.submittedOnDate = dateFilter(scope.formData.submittedOnDate,scope.df);
                this.formPreviewRepaymentData.repaymentsStartingFromDate = dateFilter(this.formData.repaymentsStartingFromDate,scope.df);
                
                this.formPreviewRepaymentData.loanTermFrequencyType = this.formData.termPeriodFrequencyEnum;

                if (this.formPreviewRepaymentData.disbursementData.length > 0) {
                    for (var i = 0 ; i<this.formPreviewRepaymentData.disbursementData.length;i++) {
                        this.formPreviewRepaymentData.disbursementData[i].expectedDisbursementDate = dateFilter(this.formPreviewRepaymentData.disbursementData[i].expectedTrancheDisbursementDate, scope.df);
                        this.formPreviewRepaymentData.disbursementData[i].principal = this.formPreviewRepaymentData.disbursementData[i].trancheAmount;
                        delete this.formPreviewRepaymentData.disbursementData[i].expectedTrancheDisbursementDate;
                        delete this.formPreviewRepaymentData.disbursementData[i].trancheAmount;
                    }
                }       

                if (scope.repaidEveryConfigIsActive) {
                    scope.formPreviewRepaymentData.repaymentFrequencyType = scope.formData.repaymentPeriodFrequencyEnum;
                    scope.formPreviewRepaymentData.repaymentFrequencyDayOfWeekType = scope.formData.repaymentFrequencyDayOfWeekType;
                    scope.formPreviewRepaymentData.repaymentFrequencyNthDayType = scope.formData.repaymentFrequencyNthDayType;
                    scope.formPreviewRepaymentData.loanTermFrequencyType = scope.loanaccountinfo.termPeriodFrequencyType.id;
                    scope.formPreviewRepaymentData.loanTermFrequency = scope.loanTerm;
                    if (scope.formPreviewRepaymentData.repaymentFrequencyType == 2 && scope.formData.repaymentFrequencyNthDayType) {
                        scope.formData.repeatsOnDayOfMonth = scope.selectedOnDayOfMonthOptions;
                    } else {
                        scope.formData.repeatsOnDayOfMonth = [];
                    }
                    if (scope.formData.repeatsOnDayOfMonth) {
                        scope.formPreviewRepaymentData.repeatsOnDayOfMonth = scope.formData.repeatsOnDayOfMonth;
                    }
                    else {
                        delete scope.formPreviewRepaymentData.repeatsOnDayOfMonth;
                    }
                }

                if(this.loanaccountinfo.loanEMIPacks && scope.formData.loanEMIPackId){
                    if(this.formPreviewRepaymentData.amountForUpfrontCollection){
                        delete this.formPreviewRepaymentData.amountForUpfrontCollection;
                    }
                    if(this.formPreviewRepaymentData.discountOnDisbursalAmount){
                            delete this.formPreviewRepaymentData.discountOnDisbursalAmount;
                    }
                    this.formPreviewRepaymentData.disbursementData = [];
                    for(var i in scope.loanaccountinfo.loanEMIPacks){
                        if(scope.loanaccountinfo.loanEMIPacks[i].id == scope.formData.loanEMIPackId){
                            this.formPreviewRepaymentData.principal = scope.loanaccountinfo.loanEMIPacks[i].sanctionAmount;
                            this.formPreviewRepaymentData.fixedEmiAmount = scope.loanaccountinfo.loanEMIPacks[i].fixedEmi;
                            this.formPreviewRepaymentData.loanTermFrequency = scope.loanaccountinfo.loanEMIPacks[i].numberOfRepayments;
                            this.formPreviewRepaymentData.repaymentFrequencyType = scope.loanaccountinfo.loanEMIPacks[i].repaymentFrequencyType.id;
                            this.formPreviewRepaymentData.repaymentEvery = scope.loanaccountinfo.loanEMIPacks[i].repaymentEvery;

                            var disbursementData = {};
                            disbursementData.expectedDisbursementDate = this.formPreviewRepaymentData.expectedDisbursementDate;
                            disbursementData.principal = this.formPreviewRepaymentData.principal;
                            this.formPreviewRepaymentData.disbursementData.push(disbursementData);
                            break;
                        }
                    }
                }else{
                    this.formPreviewRepaymentData.principal = this.formData.loanAmountRequested;
                    this.formPreviewRepaymentData.loanTermFrequency = this.formData.termFrequency;
                    this.formPreviewRepaymentData.repaymentFrequencyType = scope.formData.repaymentPeriodFrequencyEnum;
                    this.formPreviewRepaymentData.repaymentEvery=scope.formData.repayEvery;   
                }

                if (scope.charges.length > 0) {
                    scope.formPreviewRepaymentData.charges = [];
                    for (var i in scope.charges) {
                        if (scope.charges[i].amount > 0) {
                            scope.formPreviewRepaymentData.charges.push({
                                chargeId: scope.charges[i].chargeId,
                                amount: scope.charges[i].amount,
                                dueDate: dateFilter(scope.charges[i].dueDate, scope.df),
                                upfrontChargesAmount: scope.charges[i].glims
                            });
                        }
                    }
                }

               
                if(scope.product){
                    this.formPreviewRepaymentData.allowPartialPeriodInterestCalcualtion = scope.loanaccountinfo.product.allowPartialPeriodInterestCalcualtion;
                    this.formPreviewRepaymentData.transactionProcessingStrategyId = this.product.transactionProcessingStrategyId;
                    this.formPreviewRepaymentData.interestCalculationPeriodType = this.product.interestCalculationPeriodType.id;
                    this.formPreviewRepaymentData.interestType = this.product.interestType.id;
                    this.formPreviewRepaymentData.amortizationType = scope.product.amortizationType.id; 
                }

               
                if(this.formData.interestRatePerPeriod){
                    this.formPreviewRepaymentData.interestRatePerPeriod = this.formData.interestRatePerPeriod;
                }else{
                    this.formPreviewRepaymentData.interestRatePerPeriod = scope.product.interestRatePerPeriod;
                }
                
                delete this.formPreviewRepaymentData.loanProductId;
                delete this.formPreviewRepaymentData.Workflowtype;
                delete this.formPreviewRepaymentData.loanEMIPackId;
                delete this.formPreviewRepaymentData.loanAmountRequested;
                delete this.formPreviewRepaymentData.loanPurposeId;
                delete this.formPreviewRepaymentData.termFrequency;
                delete this.formPreviewRepaymentData.termPeriodFrequencyEnum;
                delete this.formPreviewRepaymentData.repayEvery;
                delete this.formPreviewRepaymentData.repaymentPeriodFrequencyEnum;
                delete this.formPreviewRepaymentData.noOfTranche;
                
                resourceFactory.loanResource.save({command: 'calculateLoanSchedule'}, this.formPreviewRepaymentData, function (data) {
                    scope.repaymentscheduleinfo = data;
                    scope.previewRepayment = true;
                });

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

            scope.selectAllLoanToClose = function(isAllLoanToClose){
                for(var i in scope.loanaccountinfo.clientActiveLoanOptions){
                    scope.loanaccountinfo.clientActiveLoanOptions[i].isSelected = isAllLoanToClose;
                }
            }

            scope.allowTopup = function () {
                return scope.formData.isTopup && scope.loanaccountinfo.clientActiveLoanOptions.length > 0;
            }

            var populateUserOverriddenTerms = function () {
                var userOverriddenTerms = [];
                if (_.isUndefined(scope.loanaccountinfo.loanEMIPacks)) {
                    if (scope.formData.repayEvery != scope.loanaccountinfo.repaymentEvery || scope.formData.repaymentPeriodFrequencyEnum != scope.loanaccountinfo.repaymentFrequencyType.id
                        || ((scope.loanaccountinfo.product.repaymentFrequencyNthDayType && scope.formData.repaymentFrequencyNthDayType != scope.loanaccountinfo.product.repaymentFrequencyNthDayType.id) || (!scope.loanaccountinfo.product.repaymentFrequencyNthDayType && scope.formData.repaymentFrequencyNthDayType))
                        || ((scope.loanaccountinfo.product.repaymentFrequencyDayOfWeekType && scope.formData.repaymentFrequencyDayOfWeekType != scope.loanaccountinfo.product.repaymentFrequencyDayOfWeekType.id) || (!scope.loanaccountinfo.product.repaymentFrequencyDayOfWeekType && scope.formData.repaymentFrequencyDayOfWeekType))) {
                        userOverriddenTerms.push("repaymentDay");
                    } else if (scope.formData.repaymentFrequencyNthDayType && scope.formData.repaymentFrequencyNthDayType == -2) {
                        if (scope.formData.repeatsOnDayOfMonth.length != scope.loanaccountinfo.product.repeatsOnDayOfMonth.length) {
                            userOverriddenTerms.push("repaymentDay");
                        } else {
                            for (var i = 0; i < scope.loanaccountinfo.product.repeatsOnDayOfMonth.length; i++) {
                                if (scope.formData.repeatsOnDayOfMonth.indexOf(scope.loanaccountinfo.product.repeatsOnDayOfMonth[i]) == -1) {
                                    userOverriddenTerms.push("repaymentDay");
                                    break;
                                }
                            }
                        }
                    }
                }
                return userOverriddenTerms;
            }
        }
    });
    mifosX.ng.application.controller('NewLoanApplicationReference', ['$controller','$scope', '$routeParams', 'ResourceFactory', '$location', 'dateFilter', '$filter', mifosX.controllers.NewLoanApplicationReference]).run(function ($log) {
        $log.info("NewLoanApplicationReference initialized");
    });
}(mifosX.controllers || {}));