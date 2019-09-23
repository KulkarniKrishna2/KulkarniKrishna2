(function (module) {
    mifosX.controllers = _.extend(module, {
        FinancialYearClosuresController: function (scope, location, resourceFactory, localStorageService) {
            scope.isReinitiateAllowed = function(status){
                if(status.value === 'Failed'){
                    return true;
                }
                return false;
            }
            
            scope.init = function(){
                resourceFactory.financialYearClosuresResource.getAll({},function(data){
                    scope.financialYearClosures = data;
                });
            }
            scope.init();
            scope.routeByIdAndStatus = function(id, status){
                if(status.value === 'Completed'){
                    location.path("/financialyearclosures/" + id);
                }
            }

            scope.create = function(){
                localStorageService.removeFromLocalStorage('endDate');
                location.path("/financialyearclosures/create");
            }

            scope.reinitiate = function(endDate){
                localStorageService.addToLocalStorage('endDate', endDate);
                location.path("/financialyearclosures/create");
            }
        }
    });

    mifosX.ng.application.controller('FinancialYearClosuresController', ['$scope', '$location', 'ResourceFactory', 'localStorageService', mifosX.controllers.FinancialYearClosuresController]).run(function ($log) {
        $log.info("FinancialYearClosuresController initialized");
    });
}(mifosX.controllers || {}));