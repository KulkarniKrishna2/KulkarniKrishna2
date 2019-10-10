(function (module) {
    mifosX.controllers = _.extend(module, {
        EditLoanEMIPacksController: function (scope, routeParams, resourceFactory, location, $modal, route) {
            scope.loanProductId = routeParams.loanProductId;
            scope.loanEMIPackId = routeParams.loanEMIPackId;
            scope.loanTemplate = {};
            scope.loanEMIPacks = [];
            scope.formData = {};
            scope.showAdvancedSettings = false;

            resourceFactory.loanemipacktemplate.getEmiPackTemplate({loanProductId:scope.loanProductId}, function (data) {
                scope.loanTemplate = data;
            });

            resourceFactory.loanemipack.getEmiPack({loanProductId:scope.loanProductId, loanEMIPackId:scope.loanEMIPackId}, function (data) {
                scope.formData = data;
                scope.formData.repaymentFrequencyType = data.repaymentFrequencyType.id;
                if(data.interestRateFrequencyType){
                    scope.formData.interestRateFrequencyTypeId = data.interestRateFrequencyType.id;
                }
                if(scope.formData.interestRatePerPeriod || scope.formData.gracePeriod){
                    scope.showOrHideAdvancedSettings();
                }
            });

            scope.submit = function () {
                this.formData.locale = scope.optlang.code;
                delete scope.formData.id;
                delete scope.formData.loanProductId;
                delete scope.formData.interestRateFrequencyType;
                delete scope.formData.combinedRepayEvery;
                delete scope.formData.loanProductName;
                if(scope.formData.interestRatePerPeriod ==""){
                    delete scope.formData.interestRatePerPeriod;
                    delete scope.formData.interestRateFrequencyTypeId;
                }
                if(scope.formData.gracePeriod ==""){
                    delete scope.formData.gracePeriod;
                }
                if(!this.formData.isActive){
                    this.formData.isActive = false;
                }
                resourceFactory.loanemipack.update({loanProductId:scope.loanProductId, loanEMIPackId:scope.loanEMIPackId},this.formData, function (data) {
                    location.path('/viewloanemipacks/'+scope.loanProductId);
                });
            };

            scope.showOrHideAdvancedSettings = function () {
                scope.showAdvancedSettings = !scope.showAdvancedSettings;
            };
        }
    });
    mifosX.ng.application.controller('EditLoanEMIPacksController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', mifosX.controllers.EditLoanEMIPacksController]).run(function ($log) {
        $log.info("EditLoanEMIPacksController initialized");
    });
}(mifosX.controllers || {}));
