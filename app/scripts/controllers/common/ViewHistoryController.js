(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewHistoryController: function (scope, resourceFactory,location,routeParams,dateFilter, route) {

            resourceFactory.historyResource.get({entityType: routeParams.entityType,entityId: routeParams.entityId}, function (data) {
                scope.historydatas = data;

            });

    }
    });
    mifosX.ng.application.controller('ViewHistoryController', ['$scope', 'ResourceFactory', '$location','$routeParams','dateFilter', '$route', mifosX.controllers.ViewHistoryController]).run(function ($log) {
        $log.info("ViewHistoryController initialized");
    });
}(mifosX.controllers || {}));