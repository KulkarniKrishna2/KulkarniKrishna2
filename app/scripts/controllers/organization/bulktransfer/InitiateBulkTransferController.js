(function (module) {
    mifosX.controllers = _.extend(module, {
        InitiateBulkTransferController: function (scope,location, resourceFactory, route, dateFilter, $rootScope, routeParams) {
            scope.formData = {};
            scope.toOfficers = [];
            scope.getSelectedCenters = [];
            scope.getSelectedGroups = [];
            scope.getSelectedClients = [];
            scope.fromStaffOptions = [];
            scope.toStaffOptions = [];
            scope.unassignedStaff = {'id':-1,'displayName' : 'Unassigned'};
            scope.showAssignToStaff = false;
            scope.allCenter = {};
            scope.allGroups = {};
            scope.allClients = {};
            scope.recordExists = true;
            scope.isStaffReassignment = false;
            if(routeParams.isStaffReassignment){
               scope.isStaffReassignment = true;
            }

            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
            });
            
             scope.getFromStaffOptions = function (officeId) {
                scope.isOfficeSelected = true;
                scope.fromStaffOptions = [];
                resourceFactory.fieldOfficersResource.retrievefieldOfficers({staffInSelectedOfficeOnly:true,officeId: officeId}, function (data) {
                    scope.fromStaffOptions = data;
                 
                    if(!scope.isStaffReassignment){
                        scope.fromStaffOptions.push(scope.unassignedStaff);
                    }
                    if(scope.formData.toOfficeId==undefined){
                      
                        scope.toStaffOptions = data;
                        if(!scope.isStaffReassignment){
                            scope.toStaffOptions.push(scope.unassignedStaff);
                        }
                    }                    
                });
            };

            scope.getToStaffOptions = function (officeId) {
                scope.toStaffOptions = [];
                resourceFactory.fieldOfficersResource.retrievefieldOfficers({staffInSelectedOfficeOnly:true,officeId: officeId}, function (data) {
                    scope.toStaffOptions = data;
                    scope.toStaffOptions.push(scope.unassignedStaff);
                });
            };

            scope.getDataForTransfer = function () {
                loanAccounts=[];
                scope.selectAll.checked=false;
                scope.reschedule = true;
                resourceFactory.bulkTransferTemplateResource.get({'officeId': scope.formData.fromOfficeId, staffId: scope.formData.fromStaffId}, function (data) {
                    scope.centers = data.centerDataList;
                    scope.groups = data.groups;
                    scope.clients = data.clients;
                    if(scope.centers.length >0 || scope.groups.length > 0 ||  scope.clients.length > 0){
                        scope.showAssignToStaff = true;
                        scope.recordExists = true;
                    }else{
                        scope.showAssignToStaff = false;
                        scope.recordExists = false;
                    }
                });
            };
            
            scope.expandAll = function (center, expanded) {
                center.isExpanded = expanded;
            };

            scope.expandGroup = function (group, expanded) {
                group.isExpanded = expanded;
            };
            scope.expandClient = function (client, expanded) {
                client.isExpanded = expanded;
            };

            scope.addEntity = function (entityArray, selectedEntityArray, entityId) {

                var index = -1;
                index = selectedEntityArray.findIndex(x=>x.id == entityId);
                if (index == -1) {
                    var i = entityArray.findIndex(x=>x.id == entityId);
                    selectedEntityArray.push({"id":entityId,"name": entityArray[i].name});
                }
            };

            scope.removeEntity = function (entityArray, entityId) {
                var index = -1;
                index = entityArray.findIndex(x=>x.id == entityId);
                if (index > -1) {
                    entityArray.splice(index, 1);
                }
            };

            scope.getSelectedGroupDetails = function(value,groupId){

                var groupIndex = -1;
                groupIndex = scope.groups.findIndex(x=>x.id == groupId);

                    if(groupIndex > -1){
                        if(value){
                            scope.addEntity(scope.groups, scope.getSelectedGroups, groupId);
                        }else{
                            scope.removeEntity(scope.getSelectedGroups, groupId);
                        }
                    }
                
            };

            scope.getSelectedClientsDetails = function(value,clientId){
                var clientIndex = -1;
                clientIndex = scope.clients.findIndex(x=>x.id == clientId);

                if(clientIndex > -1){
                    if(value){
                        scope.getSelectedClients.push({"id":scope.clients[clientIndex].id, "name":scope.clients[clientIndex].displayName});
                    }else{
                        scope.removeEntity(scope.getSelectedClients, clientId);
                    }
                }
            };

            scope.selectAll = function(value){
                scope.selectAllCenters(value);
                scope.selectAllGroups(value);
                scope.selectAllClients(value);
                scope.allCenter.checked = value;
                scope.allGroups.checked = value;
                scope.allClients.checked = value;

            }

            scope.selectAllCenters = function(value){
                scope.getSelectedCenters = [];
                for(var i =0 ; i < scope.centers.length ; i++) {
                    scope.centers[i].checked = value;
                    if(value){
                        scope.getSelectedCenters.push({"id":scope.centers[i].id, "name":scope.centers[i].name});
                    }
                }
            };
            scope.selectAllGroups = function(value){
                scope.getSelectedGroups = [];
                for(var i =0 ; i < scope.groups.length ; i++) {
                    scope.groups[i].checked = value;
                    if(value){
                        scope.getSelectedGroups.push({"id":scope.groups[i].id, "name":scope.groups[i].name});
                    }
                }
            };
            scope.selectAllClients = function(value){
                scope.getSelectedClients = [];
                for(var i =0 ; i < scope.clients.length ; i++) {
                    scope.clients[i].checked = value;
                    if(value){
                        scope.getSelectedClients.push({"id":scope.clients[i].id, "name":scope.clients[i].displayName});
                    }                        
                }
            };

            scope.reassignStaff = function () {
                this.formData.toOfficeId = this.formData.fromOfficeId;
                scope.submitDetails();
            };

            scope.submitDetails = function () {
                this.formData.clients = scope.getSelectedClients;
                this.formData.groups = scope.getSelectedGroups;
                this.formData.centers = scope.getSelectedCenters;
                this.formData.isStaffReassignment = scope.isStaffReassignment;
                resourceFactory.bulkTransferResource.save({'officeId': scope.formData.fromOfficeId},this.formData, function (data) {
                    location.path('/bulktransfer');
                });
            };

            scope.centerLevel = function(value,id){
                if(value){
                    scope.addEntity(scope.centers, scope.getSelectedCenters, id);
                }else{
                    scope.removeEntity(scope.getSelectedCenters, id);
                }
            };

            scope.getSelectedGroupDetails = function(value,id){
                if(value){
                    scope.addEntity(scope.groups, scope.getSelectedGroups, id);
                }else{
                    scope.removeEntity(scope.getSelectedGroups, id);
                }
                
            };

            scope.getSelectedClientsDetails = function(value, id){
                if(value){
                    var index = -1;
                    index = scope.getSelectedClients.findIndex(x=>x.id == entityId);
                    if (index == -1) {
                        var i = scope.clients.findIndex(x=>x.id == entityId);
                        scope.getSelectedClients.push({"id":entityId,"name":scope.clients[i].displayName});
                    }
                }else{
                    scope.removeEntity(scope.getSelectedClients, id);
                }
            };

            scope.recordsStatus = function (){
                return !scope.showAssignToStaff && !scope.recordExists;
            }; 
        }
    });
    mifosX.ng.application.controller('InitiateBulkTransferController', ['$scope' , '$location', 'ResourceFactory', '$route', 'dateFilter', '$rootScope', '$routeParams', mifosX.controllers.InitiateBulkTransferController]).run(function ($log) {
        $log.info("InitiateBulkTransferController initialized");
    });
}(mifosX.controllers || {}));
