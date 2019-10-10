(function (module) {
    mifosX.controllers = _.extend(module, {
        AddLoanEMIPacksController: function (scope, routeParams, resourceFactory, location, $modal, route) {
            scope.loanProductId = routeParams.loanProductId;
            scope.loanTemplate = {};
            scope.loanEMIPacks = [];
            scope.formData = {};
            scope.showAdvancedSettings = false;

            resourceFactory.loanemipacktemplate.getEmiPackTemplate({loanProductId:scope.loanProductId}, function (data) {
                scope.loanTemplate = data;
            });

            scope.submit = function () {
                this.formData.locale = scope.optlang.code;
                if(!this.formData.isActive){
                    this.formData.isActive = false;
                }
                resourceFactory.loanemipack.add({loanProductId:scope.loanProductId},this.formData, function (data) {
                    location.path('/viewloanemipacks/'+scope.loanProductId);
                });
            };
            scope.showOrHideAdvancedSettings = function () {
                scope.showAdvancedSettings = !scope.showAdvancedSettings;
            };

        }
    });
    mifosX.ng.application.controller('AddLoanEMIPacksController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', mifosX.controllers.AddLoanEMIPacksController]).run(function ($log) {
        $log.info("AddLoanEMIPacksController initialized");
    });
}(mifosX.controllers || {}));
