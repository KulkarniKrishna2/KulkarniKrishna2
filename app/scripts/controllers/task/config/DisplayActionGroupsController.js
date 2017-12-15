
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

            scope.deleteActionGroup = function(actionGroupId){
                resourceFactory.actionGroupsResource.delete({actionGroupId:actionGroupId},this.formData,function (data) {
                    location.path('/displayactiongroups/');
                });
            }

               
        }
    });
    mifosX.ng.application.controller('DisplayActionGroupsController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.DisplayActionGroupsController]).run(function ($log) {
        $log.info("DisplayActionGroupsController initialized");
    });
}(mifosX.controllers || {}));