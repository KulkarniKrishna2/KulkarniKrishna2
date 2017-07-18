(function(module) {
    mifosX.controllers = _.extend(module, {
        AssociateToGroupController: function($q, scope, resourceFactory, location, routeParams, $modal) {

            scope.isViewMode = false;
            scope.clientId = scope.taskconfig['clientId'];

            resourceFactory.clientResource.get({clientId: scope.clientId, associations: 'hierarchyLookup'}, function(data) {
                scope.client = data;

                var index = scope.client.groups.findIndex(x => x.groupLevel=="2");
                if(index >= 0){
                    scope.groupId = scope.client.groups[index].id;
                        scope.isViewMode = true;
                        scope.groupName = scope.client.groups[index].name;
                }
                else{
                     index = scope.client.groups.findIndex(x => x.groupLevel=="1");
                     scope.centerId = scope.client.groups[index].id;
                     resourceFactory.centerResource.get({centerId: scope.centerId, template: 'true', associations: 'groupMembers'}, function(data) {
                            scope.groups = data.groupMembers;
                     });
                }
            });

            scope.transfer = function() {
                var index = scope.groups.findIndex(x => x.id == scope.formData.groupId);
                scope.groupId = scope.formData.groupId;
                delete scope.formData.groupId;
                
                scope.groupName = scope.groups[index].name;
                scope.associate = {};
                scope.associate.clientMembers = [];
                scope.associate.clientMembers[0] = scope.clientId;
                resourceFactory.groupResource.save({ groupId: scope.groupId, command: 'associateClients'}, scope.associate, function(data) {
                    scope.isViewMode = true;
                });
            };
        }

    });
    mifosX.ng.application.controller('AssociateToGroupController', ['$q', '$scope', 'ResourceFactory', '$location', '$routeParams', '$modal', mifosX.controllers.AssociateToGroupController]).run(function($log) {
        $log.info("AssociateToGroupController initialized");
    });
}(mifosX.controllers || {}));