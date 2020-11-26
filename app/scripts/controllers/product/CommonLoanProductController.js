(function (module) {
    mifosX.controllers = _.extend(module, {
        CommonLoanProductController: function (scope) {

            scope.changeDaysInMonthType = function(){
                if(scope.formData.daysInMonthType != 30){
                    scope.formData.partialPeriodType = undefined;
                }else{
                    scope.formData.partialPeriodType = 1;
                }
            };
        }
    });
    mifosX.ng.application.controller('CommonLoanProductController', ['$scope' ,mifosX.controllers.CommonLoanProductController]).run(function ($log) {
        $log.info("CommonLoanProductController initialized");
    });
}(mifosX.controllers || {}));
