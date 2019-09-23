(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewFinancialYearClosureController: function (scope, routeParams, resourceFactory, API_VERSION, $rootScope, commonUtilService) {
            resourceFactory.financialYearClosuresResource.getOneFinancialYearClosure({id:routeParams.id},function(data){
                scope.financialYearClosureData = data;
            });

            scope.download = function(report){
                var url = $rootScope.hostUrl + API_VERSION + '/' + report.downloadableURL;
                if(report.storageType==1){
                    commonUtilService.downloadFile(url," ");
                }else{
                    window.open(report.downloadableURL);
                }
            }
        }
    });

    mifosX.ng.application.controller('ViewFinancialYearClosureController', ['$scope', '$routeParams', 'ResourceFactory', 'API_VERSION', '$rootScope', 'CommonUtilService', mifosX.controllers.ViewFinancialYearClosureController]).run(function ($log) {
        $log.info("ViewFinancialYearClosureController initialized");
    });
}(mifosX.controllers || {}));