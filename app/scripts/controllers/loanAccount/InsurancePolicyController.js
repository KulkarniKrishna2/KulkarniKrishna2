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
                        scope.showAdd = false;
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
                angular.copy(this.formData, requestFormData);
                var index = scope.insuranceProviderOptions.findIndex(x => x.id == this.formData.providerId);
                if (index > -1) {
                    requestFormData.policyNoLength = scope.insuranceProviderOptions[index].policyNoLength;
                    requestFormData.coiNoLength = scope.insuranceProviderOptions[index].coiNoLength;
                }
                requestFormData.locale = scope.optlang.code;
                for (var i in requestFormData.insurancePolicyDetails) {
                    requestFormData.insurancePolicyDetails[i].insuranceClientTypeId = requestFormData.insurancePolicyDetails[i].insuranceClientType.id
                    requestFormData.insurancePolicyDetails[i].locale = scope.optlang.code;
                    requestFormData.insurancePolicyDetails[i].dateFormat = scope.df;
                    delete requestFormData.insurancePolicyDetails[i].insuranceClientType;
                    if (scope.isUpdate) {
                        delete requestFormData.insurancePolicyDetails[i].insuranceProvider;
                    }
                }
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
            };

            scope.cancel = function () {
                if(_.isUndefined(scope.insurancePolicyDatas)){
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