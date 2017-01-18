(function (module) {
    mifosX.controllers = _.extend(module, {
        EditLoanEMIPacksController: function (scope, routeParams, resourceFactory, location, $modal, route) {
            scope.loanProductId = routeParams.loanProductId;
            scope.loanEMIPackId = routeParams.loanEMIPackId;
            scope.loanTemplate = {};
            scope.loanEMIPacks = [];
            scope.formData = {};

            resourceFactory.loanemipacktemplate.getEmiPackTemplate({loanProductId:scope.loanProductId}, function (data) {
                scope.loanTemplate = data;
            });

            resourceFactory.loanemipack.getEmiPack({loanProductId:scope.loanProductId, loanEMIPackId:scope.loanEMIPackId}, function (data) {
                scope.formData.repaymentEvery = data.repaymentEvery;
                scope.formData.repaymentFrequencyType = data.repaymentFrequencyType.id;
                scope.formData.numberOfRepayments = data.numberOfRepayments;
                scope.formData.sanctionAmount = data.sanctionAmount;
                scope.formData.fixedEmi = data.fixedEmi;
                scope.formData.disbursalAmount1 = data.disbursalAmount1;
                scope.formData.disbursalAmount2 = data.disbursalAmount2;
                scope.formData.disbursalAmount3 = data.disbursalAmount3;
                scope.formData.disbursalAmount4 = data.disbursalAmount4;
                scope.formData.disbursalEmi2 = data.disbursalEmi2;
                scope.formData.disbursalEmi3 = data.disbursalEmi3;
                scope.formData.disbursalEmi4 = data.disbursalEmi4;
            });

            scope.submit = function () {
                this.formData.locale = scope.optlang.code;
                resourceFactory.loanemipack.update({loanProductId:scope.loanProductId, loanEMIPackId:scope.loanEMIPackId},this.formData, function (data) {
                    location.path('/viewloanemipacks/'+scope.loanProductId);
                });
            };

        }
    });
    mifosX.ng.application.controller('EditLoanEMIPacksController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', mifosX.controllers.EditLoanEMIPacksController]).run(function ($log) {
        $log.info("EditLoanEMIPacksController initialized");
    });
}(mifosX.controllers || {}));
