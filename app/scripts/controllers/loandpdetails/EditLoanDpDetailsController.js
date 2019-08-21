(function (module) {
    mifosX.controllers = _.extend(module, {
        EditLoanDpDetailsController: function (scope, resourceFactory, location, routeParams, commonUtilService) {
            scope.loanProductId = routeParams.id;
            scope.editFormData = {};
            scope.onDayTypeOptions = commonUtilService.onDayTypeOptions();
           
            resourceFactory.loanDpDetailsTemplateResource.getLoanDpDetailsTemplate({loanProductId:scope.loanProductId},function(data){
                scope.templateData = data;
            });

            resourceFactory.loanDpDetailsResource.get({loanProductId:scope.loanProductId},function(data){
                scope.loanDpDetailData = data;
                scope.editFormData.frequencyType = scope.loanDpDetailData.frequencyType.id;
                if(scope.editFormData.frequencyType == 1){
                    scope.editFormData.frequencyDayOfWeekType = scope.loanDpDetailData.frequencyDayOfWeekType.id;
                }
                if(scope.editFormData.frequencyType == 2){
                    scope.editFormData.frequencyNthDay = scope.loanDpDetailData.frequencyNthDay.id;
                    if(scope.editFormData.frequencyNthDay == -2){
                        scope.editFormData.frequencyOnDay = scope.loanDpDetailData.frequencyOnDay;
                    }else{
                        scope.editFormData.frequencyDayOfWeekType = scope.loanDpDetailData.frequencyDayOfWeekType.id;
                    }
                }    
                scope.editFormData.frequencyInterval = scope.loanDpDetailData.frequencyInterval;

            });
            scope.resetLoanProductDrawingPowerDetails = function () {
                delete scope.editFormData.frequencyNthDay;
                delete scope.editFormData.frequencyDayOfWeekType;
                delete scope.editFormData.frequencyOnDay;
            };

            scope.resetOnDayAndWeekType = function(){
                delete scope.editFormData.frequencyDayOfWeekType;
                delete scope.editFormData.frequencyOnDay;
            };

            scope.submit = function(){
                scope.editFormData.locale = scope.optlang.code;
                resourceFactory.loanDpDetailsResource.updateLoanDpDetails({loanProductId:scope.loanProductId},this.editFormData,function(data){
                    location.path('/viewloandpdetails/loanproduct/'+data.productId);
                });
            }
        }
    });
    mifosX.ng.application.controller('EditLoanDpDetailsController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'CommonUtilService', mifosX.controllers.EditLoanDpDetailsController]).run(function ($log) {
        $log.info("EditLoanDpDetailsController initialized");
    });
}(mifosX.controllers || {}));