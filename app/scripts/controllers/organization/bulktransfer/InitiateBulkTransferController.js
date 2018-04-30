(function (module) {
    mifosX.controllers = _.extend(module, {
        InitiateBulkTransferController: function (scope,location, resourceFactory, route, dateFilter, $rootScope) {
            scope.formData = {};
            scope.toOfficers = [];
            scope.getSelectedCenters = [];
            scope.getSelectedGroups = [];
            scope.getSelectedClients = [];
            scope.fromStaffOptions = [];
            scope.toStaffOptions = [];
            scope.unassignedStaff = {'id':-1,'displayName' : 'Unassigned'};
            

            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
            });
            
             scope.getFromStaffOptions = function (officeId) {
                scope.isOfficeSelected = true;
                scope.fromStaffOptions = [];
                resourceFactory.fieldOfficersResource.retrievefieldOfficers({staffInSelectedOfficeOnly:true,officeId: officeId}, function (data) {
                    scope.fromStaffOptions = data;
                    scope.fromStaffOptions.push(scope.unassignedStaff);
                    if(scope.formData.toOfficeId==undefined){
                        scope.toStaffOptions = data;
                        scope.toStaffOptions.push(scope.unassignedStaff);
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


            scope.getSelectedGroupDetails = function(value,groupId){
                for(var c =0 ; c < scope.groups.length ; c++){
                    if(scope.groups[c].id == groupId){
                        if(value){
                            scope.getSelectedGroups.push(scope.groups[c].id);
                        }else{
                            var index = -1;
                            for(var i in scope.getSelectedGroup){
                                if(scope.getSelectedGroups[i]==groupId){
                                    index =i;
                                }
                            }
                            if(index>-1){
                            scope.getSelectedGroups.splice(index, 1);
                            }
                        }
                    }
                }
            };

            scope.getSelectedClientsDetails = function(value,clientId){
                for(var c =0 ; c < scope.clients.length ; c++){
                    if(scope.clients[c].id == clientId){
                        if(value){
                            scope.getSelectedClients.push(scope.clients[c].id);
                        }else{
                            var index = -1;
                            for(var i in scope.getSelectedClients){
                                if(scope.getSelectedClients[i]==clientId){
                                    index =i;
                                }
                            }
                            if(index>-1){
                                scope.getSelectedClients.splice(index, 1);
                            }
                            
                        }
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
                        scope.getSelectedCenters.push(scope.centers[i].id);
                    }
                }
            };
            scope.selectAllGroups = function(value){
                scope.getSelectedGroups = [];
                for(var i =0 ; i < scope.groups.length ; i++) {
                    scope.groups[i].checked = value;
                    if(value){
                        scope.getSelectedGroups.push(scope.groups[i].id);
                    }
                }
            };
            scope.selectAllClients = function(value){
                scope.getSelectedClients = [];
                for(var i =0 ; i < scope.clients.length ; i++) {
                    scope.clients[i].checked = value;
                    if(value){
                        scope.getSelectedClients.push(scope.clients[i].id);
                    }                        
                }
            };


            scope.submitDetails = function () {
                this.formData.clients = scope.getSelectedClients;
                this.formData.groups = scope.getSelectedGroups;
                this.formData.centers = scope.getSelectedCenters;
                resourceFactory.bulkTransferResource.save({'officeId': scope.formData.fromOfficeId},this.formData, function (data) {
                    location.path('/bulktransfer');
                });
            };

        }
    });
    mifosX.ng.application.controller('InitiateBulkTransferController', ['$scope' , '$location', 'ResourceFactory', '$route', 'dateFilter', '$rootScope', mifosX.controllers.InitiateBulkTransferController]).run(function ($log) {
        $log.info("InitiateBulkTransferController initialized");
    });
}(mifosX.controllers || {}));
