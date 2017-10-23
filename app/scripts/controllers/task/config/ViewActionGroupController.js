
(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewActionGroupController: function (scope, resourceFactory, location, routeParams, dateFilter) {
                   
                   scope.actionGroup = {};
               resourceFactory.actionGroupsResource.get({actionGroupId:routeParams.actionGroupId}, function (data) {
                    scope.actionGroup = data;
               });

                scope.editActionGroup = function(actionGroupId){
                    location.path('/addactiongroups/'+actionGroupId);
                }
               
        }
    });
    mifosX.ng.application.controller('ViewActionGroupController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.ViewActionGroupController]).run(function ($log) {
        $log.info("ViewActionGroupController initialized");
    });
}(mifosX.controllers || {}));