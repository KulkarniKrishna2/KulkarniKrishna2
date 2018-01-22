(function (module) {
    mifosX.controllers = _.extend(module, {
        NewLoanApplicationReference: function (scope, routeParams, resourceFactory, location, dateFilter, $filter) {

            scope.clientId = routeParams.clientId;
            scope.groupId = routeParams.groupId;

            scope.restrictDate = new Date();

            scope.formData = {};

            scope.paymentOptions = [];

            scope.formData.submittedOnDate = dateFilter(scope.restrictDate,scope.df);

            scope.chargeFormData = {}; //For charges

            var SLAB_BASED = 'slabBasedCharge';
            var UPFRONT_FEE = 'upfrontFee';
            scope.slabBasedCharge = "Slab Based";
            scope.installmentAmountSlabChargeType = 1;

            scope.inparams = {resourceType: 'template', activeOnly: 'true'};
            if (scope.clientId && scope.groupId) {
                scope.inparams.templateType = 'jlg';
            } else if (scope.groupId) {
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

                if (data.clientName) {
                    scope.clientName = data.clientName;
                }
                if (data.group) {
                    scope.groupName = data.group.name;
                }
            });

            scope.loanProductChange = function (loanProductId) {

                scope.inparams.productId = loanProductId;

                resourceFactory.loanResource.get(scope.inparams, function (data) {
                    scope.loanaccountinfo = data;
                    if(scope.loanaccountinfo.loanEMIPacks){
                        var len = scope.loanaccountinfo.loanEMIPacks.length;
                        for(var i = 0; i < len; i++){
                            scope.loanaccountinfo.loanEMIPacks[i].combinedRepayEvery = scope.loanaccountinfo.loanEMIPacks[i].repaymentEvery
                                + ' - ' + $filter('translate')(scope.loanaccountinfo.loanEMIPacks[i].repaymentFrequencyType.value);
                        }
                        scope.formData.loanEMIPackId = scope.loanaccountinfo.loanEMIPacks[0].id;
                        scope.formData.loanAmountRequested = scope.loanaccountinfo.loanEMIPacks[0].sanctionAmount;
                        scope.formData.numberOfRepayments = scope.loanaccountinfo.loanEMIPacks[0].numberOfRepayments;
                    }else{
                        scope.formData.loanAmountRequested = scope.loanaccountinfo.principal;
                        scope.formData.fixedEmiAmount = scope.loanaccountinfo.fixedEmiAmount;
                        scope.formData.numberOfRepayments = scope.loanaccountinfo.numberOfRepayments;
                        scope.formData.repayEvery = scope.loanaccountinfo.repaymentEvery;
                        scope.formData.repaymentPeriodFrequencyEnum = scope.loanaccountinfo.repaymentFrequencyType.id;
                        delete scope.formData.loanEMIPackId;
                    }
                    if( scope.loanaccountinfo.paymentOptions){
                        scope.paymentOptions = scope.loanaccountinfo.paymentOptions;
                    }
                    scope.setDefaultGISConfig();
                    if(scope.loanaccountinfo.loanOfficerId){
                        scope.formData.loanOfficerId = scope.loanaccountinfo.loanOfficerId;
                    }

                    if(scope.loanaccountinfo.loanOfficerOptions){
                        resourceFactory.clientResource.get({clientId: scope.clientId}, function (data) {
                            if(data.staffId != null){
                                scope.formData.loanOfficerId =  data.staffId;
                            }
                        })
                    }
                    if(scope.loanaccountinfo.multiDisburseLoan == true && scope.loanaccountinfo.product && scope.loanaccountinfo.product.maxTrancheCount){
                        scope.formData.noOfTranche = parseInt(scope.loanaccountinfo.product.maxTrancheCount);
                    }
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
                });
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

            scope.calculateTermFrequency = function (){
                scope.formData.termFrequency = (scope.formData.repayEvery * scope.formData.numberOfRepayments);
                scope.formData.termPeriodFrequencyEnum =  scope.formData.repaymentPeriodFrequencyEnum;
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
                            if(data.chargeCalculationType.value == scope.slabBasedCharge && data.slabs.length > 0){
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
                        if(scope.charges[i].chargeCalculationType.value == scope.slabBasedCharge && scope.charges[i].slabs.length > 0) {
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



            scope.deleteCharge = function (index) {
                scope.charges.splice(index, 1);
            }

            scope.submit = function () {
                this.formData.charges = [];
                for (var i = 0; i < scope.charges.length; i++) {
                    if(scope.charges[i].amount > 0) {
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
                    }
                }
                this.formData.submittedOnDate = dateFilter(this.formData.submittedOnDate,scope.df);
                this.formData.accountType = scope.inparams.templateType;
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
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
        }
    });
    mifosX.ng.application.controller('NewLoanApplicationReference', ['$scope', '$routeParams', 'ResourceFactory', '$location', 'dateFilter', '$filter', mifosX.controllers.NewLoanApplicationReference]).run(function ($log) {
        $log.info("NewLoanApplicationReference initialized");
    });
}(mifosX.controllers || {}));