(function (module) {
    mifosX.controllers = _.extend(module, {
        AssociateToGroupController: function ($q, scope, resourceFactory, location, routeParams, $modal) {
			
			scope.isViewMode = false;
  			scope.clientId = scope.taskconfig['clientId'];

			resourceFactory.clientResource.get({clientId: scope.clientId, associations:'hierarchyLookup'}, function (data) {
                scope.client = data;
                scope.centerId =  scope.client.groups[0].centerId;
                scope.groupId = scope.client.groups[0].id;
                resourceFactory.centerResource.get({centerId: scope.centerId, template: 'true', associations: 'groupMembers'}, function (data) {
                	scope.groups = data.groupMembers;
                	var index = scope.groups.findIndex(x => x.id==scope.groupId);
                	scope.groups.splice(index, 1);
            	});
			});

            scope.transfer = function () {
				scope.destinationGroupId = this.formData.destinationGroupId;
                var index = scope.groups.findIndex(x => x.id==this.formData.destinationGroupId);
                scope.groupName = scope.groups[index].name;

                this.formData.locale = scope.optlang.code;
                this.formData.clients = [];
                var temp = new Object();
                temp = {id: scope.clientId};
                this.formData.clients.push(temp);
                this.formData.inheritDestinationGroupLoanOfficer = false;
                
                resourceFactory.groupResource.save({groupId: scope.groupId, command: 'transferClients'}, this.formData, function (data) {
                  scope.isViewMode=true;
                });
            };
		}

    });
    mifosX.ng.application.controller('AssociateToGroupController', ['$q','$scope', 'ResourceFactory', '$location', '$routeParams', '$modal', mifosX.controllers.AssociateToGroupController]).run(function ($log) {
        $log.info("AssociateToGroupController initialized");
    });
}(mifosX.controllers || {}));