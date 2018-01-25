(function (module) {
    mifosX.controllers = _.extend(module, {
        NewLoanApplicationReference: function (scope, routeParams, resourceFactory, location, dateFilter, $filter) {

            scope.clientId = routeParams.clientId;
            scope.groupId = routeParams.groupId;

            scope.restrictDate = new Date();

            scope.formData = {};
            scope.formData.Workflowtype = true;

            scope.paymentOptions = [];

            scope.formData.submittedOnDate = dateFilter(scope.restrictDate,scope.df);

            scope.chargeFormData = {}; //For charges

            var SLAB_BASED = 'slabBasedCharge';
            var UPFRONT_FEE = 'upfrontFee';

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

            scope.deleteCharge = function (index) {
                scope.charges.splice(index, 1);
            }

            scope.submit = function () {
                this.formData.charges = [];
                for (var i = 0; i < scope.charges.length; i++) {
                    var charge = {};
                    if(scope.charges[i].id){
                        charge.chargeId = scope.charges[i].id;
                    }
                    if(scope.charges[i].chargeId){
                        charge.chargeId = scope.charges[i].chargeId;
                    }
                    charge.amount = scope.charges[i].amount;
                    if(scope.charges[i].dueDate){
                        charge.dueDate = dateFilter(scope.charges[i].dueDate,scope.df);
                    }
                    charge.isMandatory = scope.charges[i].isMandatory;
                    charge.isAmountNonEditable = scope.charges[i].isAmountNonEditable;
                    charge.locale = scope.optlang.code;
                    charge.dateFormat = scope.df;
                    this.formData.charges.push(charge);
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