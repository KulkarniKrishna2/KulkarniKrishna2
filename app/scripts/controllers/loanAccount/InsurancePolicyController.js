(function (module) {
    mifosX.controllers = _.extend(module, {
        InsurancePolicyController: function (scope, routeParams, resourceFactory, dateFilter) {
            scope.formData = {};
            scope.loanId = routeParams.id;
            scope.showAdd = true;
            scope.isUpdate = false;
            scope.showform = false;
            scope.showDelete = false;

            function fetchAllInsurancePolicies() {
                resourceFactory.insurancePolicyResource.getAll({ loanId: scope.loanId }, function (data) {
                    if (data && data.length > 0) {
                        scope.insurancePolicyDatas = data;
                        scope.insuranceProviderName = data[0].insuranceProvider.name;
                        scope.insuranceProviderId = data[0].insuranceProvider.id;
                        if(data.length < 2) {
                            scope.showAdd = true;
                        } else {
                            scope.insuranceProviderId = undefined;
                            scope.showAdd = false;
                        }
                    }
                });
            }
            fetchAllInsurancePolicies();

            scope.addInsurancePolicy = function () {
                resourceFactory.insurancePolicyTemplateResource.getTemplate({ loanId: scope.loanId }, function (data) {
                    scope.formData.insurancePolicyDetails = scope.getInsurancePolicyDetails(data.insuranceClientTypeOptions);
                    scope.insuranceProviderOptions = data.insuranceProviderOptions;
                    for (var i in scope.formData.insurancePolicyDetails) {
                        scope.formData.insurancePolicyDetails[i].insuredAmount = data.insuredAmount;
                        scope.formData.insurancePolicyDetails[i].effectiveDate = dateFilter(new Date(data.effectiveDate), scope.df);
                        scope.formData.insurancePolicyDetails[i].expiryDate = dateFilter(new Date(data.expiryDate), scope.df);
                    }
                    if(scope.insurancePolicyDatas != null && scope.insurancePolicyDatas.length > 0) {
                        for (var i in scope.insurancePolicyDatas) {
                            if(scope.insurancePolicyDatas[i].insuranceClientType.value == 'INSURED') {
                                var index = scope.formData.insurancePolicyDetails.map(function(item) { return item.insuranceClientType.value; }).indexOf('INSURED');
                                scope.formData.insurancePolicyDetails.splice(index,1);
                            }
                            if(scope.insurancePolicyDatas[i].insuranceClientType.value == 'CO-INSURED') {
                                var index = scope.formData.insurancePolicyDetails.map(function(item) { return item.insuranceClientType.value; }).indexOf('CO-INSURED');
                                scope.formData.insurancePolicyDetails.splice(index,1);
                            }
                        }
                    } 
                });
                scope.showAdd = false;
                scope.isUpdate = false;
                scope.showform = true;
            }

            scope.getInsurancePolicyDetails  = function (insuranceClientTypeOptions) {
                var insurancePolicyDetails = [];
                for (var i in insuranceClientTypeOptions) {
                    var insuranceClientType = {};
                    insuranceClientType = insuranceClientTypeOptions[i]
                    insurancePolicyDetails.push({insuranceClientType});
                }
                return insurancePolicyDetails;
            }
            scope.updateInsurancePolicy = function () {
                resourceFactory.insurancePolicyTemplateResource.getTemplate({ loanId: scope.loanId, isUpdate: true }, function (data) {
                    scope.insuranceClientTypeOptions = data.insuranceClientTypeOptions;
                    scope.insuranceProviderOptions = data.insuranceProviderOptions;
                });
                resourceFactory.insurancePolicyResource.getAll({ loanId: scope.loanId }, function (data) {
                    scope.formData.insurancePolicyDetails = data;
                    for (var i in scope.formData.insurancePolicyDetails) {
                        scope.formData.insurancePolicyDetails[i].effectiveDate = dateFilter(new Date(scope.formData.insurancePolicyDetails[i].effectiveDate), scope.df);
                        scope.formData.insurancePolicyDetails[i].expiryDate = dateFilter(new Date(scope.formData.insurancePolicyDetails[i].expiryDate), scope.df);
                    }
                    scope.formData.providerId = scope.formData.insurancePolicyDetails[0].insuranceProvider.id;
                });
                scope.isUpdate = true;
                scope.showform = true;
                scope.insuranceProviderId = undefined;
            }

            scope.deleteInsurancePolicy = function (loanId) {
                resourceFactory.insurancePolicyResource.delete({ loanId: loanId }, function (response) {
                    if (response != null) {
                        delete scope.insurancePolicyDatas;
                        scope.cancel();
                    }
                });
            }

            scope.insurancePolicySubmit = function () {
                var requestFormData = {};
                var index = scope.insuranceProviderOptions.findIndex(x => x.id == this.formData.providerId);
                if (index > -1) {
                    requestFormData.policyNoLength = scope.insuranceProviderOptions[index].policyNoLength;
                    requestFormData.coiNoLength = scope.insuranceProviderOptions[index].coiNoLength;
                }
                if(!_.isUndefined(scope.insuranceProviderId)){
                    requestFormData.providerId = scope.insuranceProviderId;
                } else {
                    requestFormData.providerId = this.formData.providerId;
                }
                requestFormData.locale = scope.optlang.code;
                requestFormData.insurancePolicyDetails = [];
                for (var i =0 ; i< this.formData.insurancePolicyDetails.length ; i++) {
                    if(this.formData.insurancePolicyDetails[i].isMemberChecked || scope.isUpdate) {
                        var insurancePolicyDetails = new Object();
                        insurancePolicyDetails.insuranceClientTypeId = this.formData.insurancePolicyDetails[i].insuranceClientType.id
                        insurancePolicyDetails.locale = scope.optlang.code;
                        insurancePolicyDetails.dateFormat = scope.df;
                        insurancePolicyDetails.policyNo = this.formData.insurancePolicyDetails[i].policyNo;
                        insurancePolicyDetails.coiNo = this.formData.insurancePolicyDetails[i].coiNo;
                        insurancePolicyDetails.insuredAmount = this.formData.insurancePolicyDetails[i].insuredAmount;
                        insurancePolicyDetails.effectiveDate = this.formData.insurancePolicyDetails[i].effectiveDate;
                        insurancePolicyDetails.expiryDate = this.formData.insurancePolicyDetails[i].expiryDate;
                        if (scope.isUpdate) {
                            insurancePolicyDetails.id = this.formData.insurancePolicyDetails[i].id;
                        }
                        requestFormData.insurancePolicyDetails .push(insurancePolicyDetails);
                    }
                }
                if(requestFormData.insurancePolicyDetails != undefined && requestFormData.insurancePolicyDetails.length > 0) {
                    if (scope.isUpdate) {
                        resourceFactory.insurancePolicyResource.update({
                            'loanId': scope.loanId
                        }, requestFormData, function (data) {
                            if (data != null) {
                                fetchAllInsurancePolicies();
                                scope.resetFormSatus();
                            }
                        });
                    } else {
                        resourceFactory.insurancePolicyResource.create({
                            'loanId': scope.loanId
                        }, requestFormData, function (data) {
                            if (data != null) {
                                fetchAllInsurancePolicies();
                                scope.resetFormSatus();
                            }
                        });
                    }
                } else {
                    scope.errorDetails = [];
                    var errorObj = new Object();
                    errorObj.field = '';
                    errorObj.code = 'error.minimum.one.client.required';
                    errorObj.args = {params: []};
                    errorObj.args.params.push({value: 'error.minimum.one.client.required'});
                    scope.errorDetails.push(errorObj);
                    return;
                }
            };

            scope.cancel = function () {
                if(_.isUndefined(scope.insurancePolicyDatas) ||  scope.insurancePolicyDatas.length < 3){
                    scope.showAdd = true;
                }
                scope.resetFormSatus();
            }
            scope.resetFormSatus = function () {
                scope.isUpdate = false;
                scope.showform = false;
            };
        }
    });

    mifosX.ng.application.controller('InsurancePolicyController', ['$scope', '$routeParams', 'ResourceFactory', 'dateFilter', mifosX.controllers.InsurancePolicyController]).run(function ($log) {
        $log.info("InsurancePolicyController initialized");
    });
}(mifosX.controllers || {}));