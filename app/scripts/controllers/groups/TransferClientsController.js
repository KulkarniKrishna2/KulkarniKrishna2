(function (module) {
    mifosX.controllers = _.extend(module, {
        TransferClientsController: function ($q, scope, routeParams, route, location, resourceFactory) {
            scope.group = [];
            scope.tempData = [];
            scope.selectedClients = [];
            scope.selectedMembers = [];
            scope.formData = {};
            scope.destinationGroup = "";
            scope.groupId = routeParams.id;
            scope.isCenter = false;

            resourceFactory.groupResource.get({groupId: routeParams.id, associations: 'activeClientMembers'}, function (data) {
                scope.data = data;
                if(data.groupLevel && data.groupLevel==1)
                {
                    scope.isCenter=true;
                }
                scope.allMembers = data.activeClientMembers;
            });

            scope.groups = function(value){
                var groupSearchParams = {name : value, orderBy : 'name', officeId : scope.data.officeId,
                    sortOrder : 'ASC'};
                if(!(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.viewGroup
                 && scope.response.uiDisplayConfigurations.viewGroup.searchForActivegroups)){
                    groupSearchParams.status = 'ACTIVE';
                }
                var deferred = $q.defer();
                resourceFactory.groupResource.getAllGroups(groupSearchParams , function(data){
                    scope.group = _.reject(data, function (group) {
                        return group.id == routeParams.id;
                    });
                    deferred.resolve(scope.group);
                });
                return deferred.promise;
            };

            scope.addClient = function () {
                for (var i in this.availableClients) {
                    for (var j in scope.allMembers) {
                        if (scope.allMembers[j].id == this.availableClients) {
                            var temp = {};
                            temp.id = this.allMembers[j].id;
                            temp.displayName = this.allMembers[j].displayName;
                            temp.accountNo = this.allMembers[j].accountNo;
                            scope.selectedMembers.push(temp);
                            scope.allMembers.splice(j, 1);
                        }
                    }
                }
            };
            scope.removeClient = function () {
                for (var i in this.selectedClients) {
                    for (var j in scope.selectedMembers) {
                        if (scope.selectedMembers[j].id == this.selectedClients) {
                            var temp = {};
                            temp.id = this.selectedMembers[j].id;
                            temp.displayName = this.selectedMembers[j].displayName;
                            temp.accountNo = this.selectedMembers[j].accountNo;
                            scope.allMembers.push(temp);
                            scope.selectedMembers.splice(j, 1);
                        }
                    }
                }
            };
            
            scope.viewgroup = function (group) {
                resourceFactory.groupResource.get({groupId: group.id}, function (data) {
                    scope.groupdata = data;
                });
                scope.view = 1;
            };
            scope.transfer = function () {
                this.formData.locale = scope.optlang.code;
                this.formData.clients = [];
                this.formData.destinationGroupId = scope.destinationGroup.id;
                var temp = new Object();
                for (var i = 0; i < scope.selectedMembers.length; i++) {
                    temp = {id: this.selectedMembers[i].id};
                    this.formData.clients.push(temp);
                }
                this.formData.inheritDestinationGroupLoanOfficer = this.formData.inheritDestinationGroupLoanOfficer || false;
                resourceFactory.groupResource.save({groupId: routeParams.id, command: 'transferClients'}, this.formData, function (data) {
                    if(scope.isCenter){
                        location.path('/viewcenter/' + data.resourceId);
                    }else{
                        location.path('/viewgroup/' + data.resourceId);
                    }
                  
                });
            };

            scope.displayNameAndId = function (member){
                 return ( member.accountNo + " " + member.displayName );
            };

            scope.label = function(group){
                if(angular.isDefined(group)){
                    var labelName = group.name+' ('+group.id+')';
                    if(angular.isDefined(group.externalId)){
                        labelName = labelName+' ('+group.externalId+')';
                    }
                    return labelName;
                }
            }

        }
    });
    mifosX.ng.application.controller('TransferClientsController', ['$q', '$scope', '$routeParams', '$route', '$location', 'ResourceFactory',
        mifosX.controllers.TransferClientsController]).run(function ($log) {
        $log.info("TransferClientsController initialized");
    });
}(mifosX.controllers || {}));
