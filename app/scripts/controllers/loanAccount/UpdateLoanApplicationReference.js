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

            resourceFactory.loanApplicationReferencesResource.getByLoanAppId({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (applicationData) {
                scope.applicationData = applicationData;
                scope.formData.clientId = applicationData.clientId;
                scope.formData.groupId = applicationData.groupId;
                if(scope.applicationData.expectedDisbursalPaymentType){
                    scope.formData.expectedDisbursalPaymentType = scope.applicationData.expectedDisbursalPaymentType.id;
                }
                if(scope.applicationData.expectedRepaymentPaymentType){
                    scope.formData.expectedRepaymentPaymentType = scope.applicationData.expectedRepaymentPaymentType.id;
                }
                if(scope.applicationData.allowUpfrontCollection || scope.applicationData.amountForUpfrontCollection){
                    scope.formData.amountForUpfrontCollection = scope.applicationData.amountForUpfrontCollection;
                }
                scope.loanProductChange(applicationData.loanProductId, false);
            });

            var curIndex = 0;
            scope.loanProductChange = function (loanProductId, isNewCall) {
                scope.inparams = {resourceType: 'template', activeOnly: 'true'};
                if (scope.formData.clientId && scope.formData.groupId) {
                    scope.inparams.templateType = 'jlg';
                } else if (scope.formData.groupId) {
                    scope.inparams.templateType = 'group';
                } else if (scope.formData.clientId) {
                    scope.inparams.templateType = 'individual';
                }
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

                resourceFactory.loanResource.get(scope.inparams, function (data) {
                    scope.loanaccountinfo = data;
                    scope.productLoanCharges = data.product.charges || [];
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
                        }else{
                            scope.formData.loanAmountRequested = scope.loanaccountinfo.principal;
                            scope.formData.fixedEmiAmount = scope.loanaccountinfo.fixedEmiAmount;
                            scope.formData.numberOfRepayments = scope.loanaccountinfo.numberOfRepayments;
                            scope.formData.repayEvery = scope.loanaccountinfo.repaymentEvery;
                            scope.formData.repaymentPeriodFrequencyEnum = scope.loanaccountinfo.repaymentFrequencyType.id;
                            delete scope.formData.loanEMIPackId;
                        }

                        scope.formData.termFrequency = (scope.loanaccountinfo.repaymentEvery * scope.loanaccountinfo.numberOfRepayments);
                        scope.formData.termPeriodFrequencyEnum = scope.loanaccountinfo.repaymentFrequencyType.id;
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
                            }
                        }
                    }else{
                        if(scope.applicationData.loanEMIPackData){
                            scope.formData.loanEMIPackId = scope.applicationData.loanEMIPackData.id;
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
                    }
                });
            };

            scope.calculateTermFrequency = function (){
                scope.formData.termFrequency = (scope.formData.repayEvery * scope.formData.numberOfRepayments);
                scope.formData.termPeriodFrequencyEnum =  scope.formData.repaymentPeriodFrequencyEnum;
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
                        scope.chargeFormData.chargeId = undefined;
                    });
                }
            }

            scope.deleteCharge = function (index) {
                scope.charges.splice(index, 1);
            }

            scope.submit = function () {
                this.formData.accountType = scope.applicationData.accountType.value.toLowerCase();
                this.formData.charges = [];
                for(var i = 0 ; i < scope.charges.length; i++) {
                    if (scope.charges[i].amount > 0) {

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
                }
                this.formData.submittedOnDate = dateFilter(this.formData.submittedOnDate,scope.df);
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
        }
    });
    mifosX.ng.application.controller('UpdateLoanApplicationReference', ['$scope', '$routeParams', 'ResourceFactory', '$location', 'dateFilter', '$filter', mifosX.controllers.UpdateLoanApplicationReference]).run(function ($log) {
        $log.info("UpdateLoanApplicationReference initialized");
    });
}(mifosX.controllers || {}));