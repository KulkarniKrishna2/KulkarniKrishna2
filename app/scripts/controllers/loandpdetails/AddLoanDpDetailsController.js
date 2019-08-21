(function (module) {
    mifosX.controllers = _.extend(module, {
        AddLoanDpDetailsController: function (scope, resourceFactory, location, routeParams, commonUtilService) {
            scope.loanProductId = routeParams.id;
            scope.onDayTypeOptions = commonUtilService.onDayTypeOptions();
            scope.formData = {};
            
            resourceFactory.loanDpDetailsTemplateResource.getLoanDpDetailsTemplate({loanProductId:scope.loanProductId},function(data){
                scope.templateData = data;
            });

            scope.resetLoanProductDrawingPowerDetails = function () {
                delete scope.formData.frequencyNthDay;
                delete scope.formData.frequencyDayOfWeekType;
                delete scope.formData.frequencyOnDay;
            };

            scope.resetOnDayAndWeekType = function(){
                delete scope.editFormData.frequencyDayOfWeekType;
                delete scope.editFormData.frequencyOnDay;
            };
            
            scope.submit = function(){
                this.formData.loanProductId = scope.loanProductId;
                this.formData.locale = scope.optlang.code;
                resourceFactory.loanDpDetailsResource.save({loanProductId:scope.loanProductId},this.formData, function (data) {
                    location.path('/viewloandpdetails/loanproduct/' + data.productId);
                });
            }
        }
    });
    mifosX.ng.application.controller('AddLoanDpDetailsController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'CommonUtilService', mifosX.controllers.AddLoanDpDetailsController]).run(function ($log) {
        $log.info("AddLoanDpDetailsController initialized");
    });
}(mifosX.controllers || {}));