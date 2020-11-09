(function (module) {
    mifosX.controllers = _.extend(module, {
        AddFinancialMappingController: function (scope, resourceFactory, location) {
            scope.formData = {};
            scope.showPaymentDetails = false;
            scope.configureFundOptions = [];
            scope.configureFundOption = {};
            scope.fundSourceFlag = false;
            scope.paymentTypeAccountMapping = [];
            scope.interBranchLoanTransaction = 105;
            scope.interBranchSavingsTransaction = 106;

            resourceFactory.officeToGLAccountMappingResource.get({mappingId:'template'}, function (data) {
                scope.formData.financialActivityId = 100;
                scope.glAccountOptions = data.glAccountOptions;
                scope.financialActivityOptions = data.financialActivityOptions;
                scope.accountOptions = scope.glAccountOptions.assetAccountOptions;
            });

            resourceFactory.paymentTypeResource.getAll( function (data) {
                scope.paymentTypes = data;
            });
            scope.updateActivityOptions = function(activityId){
                scope.showPaymentDetails = false;
                scope.fundSourceFlag = false;
                if(activityId === 100 || activityId === 104 || activityId === scope.interBranchLoanTransaction || activityId === scope.interBranchSavingsTransaction){
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
                    assetAccountOptions: scope.accountOptions,
                    paymentTypeOptions: scope.paymentTypes

                });
            };

            scope.deleteFund = function (index) {
                scope.configureFundOptions.splice(index, 1);
            };

            scope.submit = function () {
                scope.paymentTypeAccountMapping = [];
                for (var i in scope.configureFundOptions) {
                    temp = {
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
                resourceFactory.officeToGLAccountMappingResource.create(this.formData, function (data) {
                    location.path('/viewfinancialactivitymapping/' + data.resourceId);
                });
            };

        }
    });
    mifosX.ng.application.controller('AddFinancialMappingController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.AddFinancialMappingController]).run(function ($log) {
        $log.info("AddFinancialMappingController initialized");
    });
}(mifosX.controllers || {}));
