(function(module) {
    mifosX.controllers = _.extend(module, {
        AssociateToGroupController: function(scope, resourceFactory, location, routeParams, $controller) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.isViewMode = false;
            scope.clientId = scope.taskconfig['clientId'];
            scope.formData={};
            resourceFactory.clientResource.get({clientId: scope.clientId, associations: 'hierarchyLookup'}, function(data) {
                scope.client = data;
                if(scope.client.groups != undefined && scope.client.groups != null && scope.client.groups.length > 0 ){
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
                }
            });

            scope.transfer = function() {
                var index = scope.groups.findIndex(x => x.id == scope.formData.groupId);
                scope.groupId = scope.formData.groupId;
                delete scope.formData.groupId;
                
                scope.groupName = scope.groups[index].name;
                scope.associate = {};
                scope.associate.inheritDestinationGroupLoanOfficer=false;
                scope.associate.locale="en";
                scope.associate.clients = [];
                var client={};
                client.id=scope.clientId;
                scope.associate.clients[0] = client;
                scope.associate.destinationGroupId=scope.groupId;
                resourceFactory.groupResource.save({ groupId: scope.centerId, command: 'transferClients'}, scope.associate, function(data) {
                    scope.isViewMode = true;
                });
            };
        }

    });
    mifosX.ng.application.controller('AssociateToGroupController', ['$scope', 'ResourceFactory', '$location', '$routeParams','$controller', mifosX.controllers.AssociateToGroupController]).run(function($log) {
        $log.info("AssociateToGroupController initialized");
    });
}(mifosX.controllers || {}));