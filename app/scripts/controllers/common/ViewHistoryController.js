(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewHistoryController: function (scope, resourceFactory,location,routeParams,dateFilter, route) {

            resourceFactory.historyResource.get({entityType: routeParams.entityType,entityId: routeParams.entityId}, function (data) {
                scope.historydatas = data;

            });
            scope.back = function(){
                if(routeParams.entityType == 'client'){
                    location.path('/viewclient/' +routeParams.entityId);
                }else if(routeParams.entityType == 'group'){
                    location.path('/viewgroup/' +routeParams.entityId);
                }else if(routeParams.entityType == 'office'){
                    location.path('/viewoffice/' +routeParams.entityId);
                }else if(routeParams.entityType == 'loan'){
                    location.path('/viewloanaccount/' +routeParams.entityId);
                }else if(routeParams.entityType == 'center'){
                    location.path('/viewcenter/' +routeParams.entityId);
                }

            }
    }
    });
    mifosX.ng.application.controller('ViewHistoryController', ['$scope', 'ResourceFactory', '$location','$routeParams','dateFilter', '$route', mifosX.controllers.ViewHistoryController]).run(function ($log) {
        $log.info("ViewHistoryController initialized");
    });
}(mifosX.controllers || {}));