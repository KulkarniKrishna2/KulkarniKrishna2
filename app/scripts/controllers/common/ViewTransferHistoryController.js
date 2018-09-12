(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewTransferHistoryController: function (scope, resourceFactory,location,routeParams,rootScope,dateFilter, route, loanDetailsService) {
            scope.showgroup = false;
            resourceFactory.transferHistoryResource.get({entityType: routeParams.entityType,entityId: routeParams.entityId}, function (data) {
                scope.transferHistoryDatas = data;

            });
            if(routeParams.entityType == 'client'){
                scope.showgroup = true;
            }
            scope.back = function(){
                if(routeParams.entityType == 'client'){
                    location.path('/viewclient/' +routeParams.entityId);
                }else if(routeParams.entityType == 'group'){
                    location.path('/viewgroup/' +routeParams.entityId);
                }else if(routeParams.entityType == 'center'){
                    location.path('/viewcenter/' +routeParams.entityId);
                }

            }
        }
    });
    mifosX.ng.application.controller('ViewTransferHistoryController', ['$scope', 'ResourceFactory', '$location','$routeParams', '$rootScope','dateFilter', '$route', 'LoanDetailsService' , mifosX.controllers.ViewTransferHistoryController]).run(function ($log) {
        $log.info("ViewTransferHistoryController initialized");
    });
}(mifosX.controllers || {}));