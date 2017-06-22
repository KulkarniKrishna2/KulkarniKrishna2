(function (module) {
    mifosX.controllers = _.extend(module, {
        EditFinancialActivityMappingController: function (scope, resourceFactory, location,routeParams) {
            scope.formData = {};
            scope.accountOptions = [];
            scope.configureFundOptions = [];
            scope.configureFundOption = {};
            scope.financialActivityAccountPaymentTypeMappingData = [];
            scope.fundSourceFlag = false;
            scope.showPaymentDetails = false;
            scope.paymentTypeOptions = [];
            scope.deletedAdvancedMapping = [];
            scope.paymentTypeAccountMapping = {};

            resourceFactory.officeToGLAccountMappingResource.withTemplate({mappingId: routeParams.mappingId},function (data) {
                scope.mapping = data;
                scope.glAccountOptions = data.glAccountOptions;
                scope.formData.financialActivityId = data.financialActivityData.id;
                scope.formData.glAccountId = data.glAccountData.id;
                scope.financialActivityOptions = data.financialActivityOptions;
                scope.updateActivityOptions(scope.formData.financialActivityId);
                if(data.financialActivityAccountPaymentTypeMappingData != undefined) {
                    scope.financialActivityAccountPaymentTypeMappingData = data.financialActivityAccountPaymentTypeMappingData;
                    _.each(scope.financialActivityAccountPaymentTypeMappingData, function (fundSource) {
                        scope.configureFundOptions.push({
                            id : fundSource.id,
                            paymentTypeId: fundSource.paymentTypeData.id,
                            glAccountId: fundSource.gLAccountData.id
                        })
                    });
                }
            });

            resourceFactory.paymentTypeResource.getAll( function (data) {
                scope.paymentTypeOptions = data;
            });

            scope.updateActivityOptions = function(activityId){
                scope.showPaymentDetails = false;
                scope.fundSourceFlag = false;
                if(activityId === 100 || activityId === 104){
                    scope.accountOptions = scope.glAccountOptions.assetAccountOptions;
                }else if(activityId === 200 || activityId === 201){
                    scope.accountOptions = scope.glAccountOptions.liabilityAccountOptions;
                }else if(activityId === 300){
                    scope.accountOptions = scope.glAccountOptions.equityAccountOptions;
                }else if(activityId === 103){
                    scope.showPaymentDetails = true;
                    scope.fundSourceFlag = true;
                    scope.accountOptions = scope.glAccountOptions.assetAccountOptions;
                }
            };

            scope.addConfigureFundSource = function () {
                scope.fundSourceFlag = true;
                scope.configureFundOptions.push({
                    glAccountId: scope.accountOptions[0].id,
                    paymentTypeId: scope.paymentTypeOptions[0].id

                });
            };

            scope.deleteFund = function (index) {
                scope.configureFundOptions.splice(index, 1);
                if(scope.financialActivityAccountPaymentTypeMappingData[index] != undefined){
                    scope.deletedAdvancedMapping.push(scope.financialActivityAccountPaymentTypeMappingData[index].id);
                }
            };

            scope.submit = function () {
                scope.paymentTypeAccountMapping = [];
                if(scope.deletedAdvancedMapping.length > 0) {
                    for (var i in  scope.deletedAdvancedMapping) {
                        temp = {
                            id : scope.deletedAdvancedMapping[i],
                            delete : true
                        }
                        scope.paymentTypeAccountMapping.push(temp);
                    }
                }
                for (var i in scope.configureFundOptions) {
                    temp = {
                        id : scope.configureFundOptions[i].id != undefined ? scope.configureFundOptions[i].id : null,
                        paymentTypeId: scope.configureFundOptions[i].paymentTypeId,
                        glAccountId: scope.configureFundOptions[i].glAccountId
                    }
                    scope.paymentTypeAccountMapping.push(temp);
                }
                scope.formData.advancedFinacialActivityMapping = {};
                if (scope.paymentTypeAccountMapping.length > 0) {
                    scope.formData.advancedFinacialActivityMapping.paymentTypeAccountMapping = scope.paymentTypeAccountMapping;
                } else {
                    delete scope.formData.advancedFinacialActivityMapping;
                }
                resourceFactory.officeToGLAccountMappingResource.update({mappingId: routeParams.mappingId},this.formData, function (data) {
                    location.path('/viewfinancialactivitymapping/' + data.resourceId);
                });
            };
        }
    });
    mifosX.ng.application.controller('EditFinancialActivityMappingController', ['$scope', 'ResourceFactory', '$location','$routeParams', mifosX.controllers.EditFinancialActivityMappingController]).run(function ($log) {
        $log.info("EditFinancialActivityMappingController initialized");
    });
}(mifosX.controllers || {}));
