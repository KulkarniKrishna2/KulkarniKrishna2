(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewLoanDpDetailsController: function (scope, resourceFactory, location, routeParams, commonUtilService) {
            scope.loanProductId = routeParams.id;
            resourceFactory.loanDpDetailsResource.get({loanProductId:scope.loanProductId},function(data){
                scope.loanProductDrawingPowerDetailsData = data;
            });
            scope.cancel = function(){
                location.path('/loandpdetails');
            }
        }
    });
    mifosX.ng.application.controller('ViewLoanDpDetailsController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'CommonUtilService', mifosX.controllers.ViewLoanDpDetailsController]).run(function ($log) {
        $log.info("ViewLoanDpDetailsController initialized");
    });
}(mifosX.controllers || {}));