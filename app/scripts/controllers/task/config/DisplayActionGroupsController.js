
(function (module) {
    mifosX.controllers = _.extend(module, {
        DisplayActionGroupsController: function (scope, resourceFactory, location, routeParams, dateFilter) {
                   
                   scope.actionGroups = [];
                resourceFactory.actionGroupsResource.getAll({},function (data) {
                    scope.actionGroups = data;
                });

                scope.editActionGroup = function(actionGroupId){
                    location.path('/addactiongroups/'+actionGroupId);
                }

               
        }
    });
    mifosX.ng.application.controller('DisplayActionGroupsController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.DisplayActionGroupsController]).run(function ($log) {
        $log.info("DisplayActionGroupsController initialized");
    });
}(mifosX.controllers || {}));