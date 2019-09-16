(function (module) {
    mifosX.controllers = _.extend(module, {
        EditActiveLoanController: function (scope, routeParams, resourceFactory, location) {
            scope.showLoanPurpose = true;
            scope.externalIdReadOnlyType = false;
            scope.formData = {};
            scope.loanId = routeParams.id;
            scope.applicableOnDisbursement = 2;
            
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.loanAccount) {
                if(scope.response.uiDisplayConfigurations.loanAccount.isHiddenField){
                    scope.showLoanPurpose = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.loanPurpose;
                    scope.hideFund = scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.fundId;
                }
                if(scope.response.uiDisplayConfigurations.loanAccount.isReadOnlyField){
                    scope.externalIdReadOnlyType = scope.response.uiDisplayConfigurations.loanAccount.isReadOnlyField.externalId;
                    scope.fundIdReadOnlyType = scope.response.uiDisplayConfigurations.loanAccount.isReadOnlyField.fundOption;
                }
                if(scope.response.uiDisplayConfigurations.loanAccount.isMandatory){
                    scope.isExternalIdMandatory = scope.response.uiDisplayConfigurations.loanAccount.isMandatory.externalId;
                    scope.isLoanPurposeMandatory = scope.response.uiDisplayConfigurations.loanAccount.isMandatory.loanPurposeId;
                }
            }

            resourceFactory.activeLoanAccountResource.get({loanId:routeParams.id},function(data){
                scope.activeLoanAccountDetails = data;
                scope.loanPurposeOptions = scope.activeLoanAccountDetails.loanPurposeOptions;
                scope.paymentModeOptions = scope.activeLoanAccountDetails.paymentModeOptions;
                scope.paymentOptions = scope.activeLoanAccountDetails.paymentOptions;
                scope.fundOptions = scope.activeLoanAccountDetails.fundOptions;
                scope.formData.loanPurposeId = scope.activeLoanAccountDetails.loanPurposeId;
                if(scope.activeLoanAccountDetails.expectedRepaymentPaymentType){
                    scope.formData.expectedRepaymentPaymentType = scope.activeLoanAccountDetails.expectedRepaymentPaymentType.id;
                    scope.repaymentMode = scope.activeLoanAccountDetails.expectedRepaymentPaymentType.paymentMode.id;
                }
                scope.formData.externalId = scope.activeLoanAccountDetails.externalId;
                scope.formData.fundId = scope.activeLoanAccountDetails.fundId;
            });

            scope.$watch('repaymentMode', function (newValue, oldValue, scope) {
                scope.repaymentTypeOptions = [];
                if(scope.activeLoanAccountDetails && scope.activeLoanAccountDetails.paymentOptions){
                        for(var i in scope.activeLoanAccountDetails.paymentOptions){
                            if((scope.activeLoanAccountDetails.paymentOptions[i].paymentMode== undefined || 
                                scope.activeLoanAccountDetails.paymentOptions[i].paymentMode.id==scope.repaymentMode) && 
                                (scope.activeLoanAccountDetails.paymentOptions[i].applicableOn== undefined || scope.activeLoanAccountDetails.paymentOptions[i].applicableOn.id != scope.applicableOnDisbursement)){
                                scope.repaymentTypeOptions.push(scope.activeLoanAccountDetails.paymentOptions[i]);
                            }
                        }
                    
                }
            }, true);

            scope.cancel = function () {
                location.path('/viewloanaccount/' + routeParams.id);
            }

            scope.submit = function(){
                resourceFactory.activeLoanAccountResource.update({loanId: routeParams.id}, scope.formData, function (data) {
                    location.path('/viewloanaccount/' + data.loanId);
                });
            }

        }
    });
    mifosX.ng.application.controller('EditActiveLoanController', ['$scope', '$routeParams', 'ResourceFactory', '$location', mifosX.controllers.EditActiveLoanController]).run(function ($log) {
        $log.info("EditActiveLoanController initialized");
    });
}(mifosX.controllers || {}));