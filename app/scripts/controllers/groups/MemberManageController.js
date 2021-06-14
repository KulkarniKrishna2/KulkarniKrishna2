(function (module) {
    mifosX.controllers = _.extend(module, {
        MemberManageController: function ($q, scope, routeParams, route, location, resourceFactory, $modal) {
            scope.group = [];
            scope.indexOfClientToBeDeleted = "";
            scope.allMembers = [];

            scope.viewClient = function (item) {
                scope.client = item;
            };

            scope.clientOptions = function(value){
                var deferred = $q.defer();
                resourceFactory.clientsSearchResource.getAllClients({displayName: value, orderBy : 'displayName', officeId : scope.group.officeId,
                sortOrder : 'ASC', orphansOnly : true, groupId:routeParams.id}, function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            };

            resourceFactory.groupResource.get({groupId: routeParams.id, associations: 'clientMembers', template: 'true'}, function (data) {
                if(data.groupLevel!=undefined && data.groupLevel==1){
                    scope.center=data;
                }
                else{
                    scope.group = data;
                }
                if(data.clientMembers) {
                    scope.allMembers = data.clientMembers;
                }
            });
            
            scope.add = function () {
            	if(scope.available != ""){
	                scope.associate = {};
	            	scope.associate.clientMembers = [];
	                scope.associate.clientMembers[0] = scope.available.id;
	                resourceFactory.groupResource.save({groupId: routeParams.id, command: 'associateClients'}, scope.associate, function (data) {
                        var temp = {};
                        temp.id = scope.available.id;
                        temp.displayName = scope.available.displayName;
                        scope.allMembers.push(temp);
                        scope.available = "";
	                });
            	}
            };

            scope.remove = function (index,id) {
                scope.indexOfClientToBeDeleted = index;
                $modal.open({
                    templateUrl: 'delete.html',
                    controller: MemberDeleteCtrl
                });
            	scope.disassociate = {};
            	scope.disassociate.clientMembers = [];
            	scope.disassociate.clientMembers.push(id);
            };
            
            var MemberDeleteCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                	resourceFactory.groupResource.save({groupId: routeParams.id, command: 'disassociateClients'}, scope.disassociate, function (data) {
                        scope.allMembers.splice(scope.indexOfClientToBeDeleted, 1);
                        $modalInstance.close('activate');
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
        }
    });
    mifosX.ng.application.controller('MemberManageController', ['$q','$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$modal', mifosX.controllers.MemberManageController]).run(function ($log) {
        $log.info("MemberManageController initialized");
    });
}(mifosX.controllers || {}));
