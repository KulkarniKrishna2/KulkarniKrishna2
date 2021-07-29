(function (module) {
    mifosX.controllers = _.extend(module, {
        InitiateBulkTransferController: function (scope,location, resourceFactory, route, dateFilter, $rootScope, routeParams) {
            scope.formData = {};
            scope.toOfficers = [];
            scope.getSelectedCenters = [];
            scope.getSelectedGroups = [];
            scope.getSelectedClients = [];
            scope.getSelectedOrphanGroups = [];
            scope.getSelectedOrphanClients = [];
            scope.fromStaffOptions = [];
            scope.toStaffOptions = [];
            scope.unassignedStaff = {'id':-1,'displayName' : 'Unassigned'};
            scope.showAssignToStaff = false;
            scope.allCenter = {};
            scope.allGroups = {};
            scope.allClients = {};
            scope.allOrphanGroups = {};
            scope.allOrphanClients = {};
            scope.recordExists = true;
            scope.isStaffReassignment = false;
            scope.isEntityNotSelectedForReassignment = true;
            scope.showErrorMessage = false;
            scope.requestData = {};
            scope.getSelectedOrphanSavings = [];
            scope.getSelectedOrphanLoans = [];
            scope.getSelectedOrphanLoanApps = [];
            if(routeParams.isStaffReassignment){
               scope.isStaffReassignment = true;
            }

            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
            });
            
             scope.getFromStaffOptions = function (officeId) {
                scope.isOfficeSelected = true;
                scope.fromStaffOptions = [];
                scope.resetSelectedEntity();
                resourceFactory.loanOfficerDropdownResource.getAll({ officeId: officeId,includeInactive:true}, function (data) {
                    scope.fromStaffOptions = data;
                 
                    if(!scope.isStaffReassignment){
                        scope.fromStaffOptions.push(scope.unassignedStaff);
                    }
                    if(scope.formData.toOfficeId==undefined){
                        resourceFactory.loanOfficerDropdownResource.getAll({ officeId: officeId,includeInactive:false}, function (activeData) {
                            scope.toStaffOptions = activeData;
                        });
                        
                        if(!scope.isStaffReassignment){
                            scope.toStaffOptions.push(scope.unassignedStaff);
                        }
                    }                    
                });
            };

            scope.getToStaffOptions = function (officeId) {
                scope.toStaffOptions = [];
                resourceFactory.loanOfficerDropdownResource.getAll({ officeId: officeId}, function (data) {
                    scope.toStaffOptions = data;
                    scope.toStaffOptions.push(scope.unassignedStaff);
                });
            };

            scope.getDataForTransfer = function () {
                loanAccounts=[];
                scope.selectAll.checked=false;
                scope.reschedule = true;
                scope.isEntityNotSelectedForReassignment = true;
                scope.showErrorMessage = false;
                
                resourceFactory.bulkTransferTemplateResource.get({'officeId': scope.requestData.fromOfficeId, staffId: scope.requestData.fromStaffId}, function (data) {
                    scope.centers = data.centerDataList;
                    scope.groups = data.groups;
                    scope.clients = data.clients;
                    scope.orphanGroups = data.orphanGroups;
                    scope.orphanClients = data.orphanClients;
                    scope.orphanLoans = data.orphanLoans;
                    scope.orphanLoanApps = data.orphanLoanApps;
                    scope.orphanSavings = data.orphanSavings;

                    scope.formData.fromOfficeId = scope.requestData.fromOfficeId;
                    scope.formData.fromStaffId = scope.requestData.fromStaffId;
                    scope.formData.isAssignParentStaff = true;
                    if(scope.centers.length >0 || scope.groups.length > 0 ||  scope.clients.length > 0 || scope.showAssignParentStaffCheckbox()){
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

            scope.getSelectedOrphanGroupDetails = function(value,groupId){
                var groupIndex = -1;
                groupIndex = scope.orphanGroups.findIndex(x=>x.id == groupId);

                    if(groupIndex > -1){
                        if(value){
                            scope.addEntity(scope.orphanGroups, scope.getSelectedOrphanGroups, groupId);
                        }else{
                            scope.removeEntity(scope.getSelectedOrphanGroups, groupId);
                        }
                    }
                
            };

            scope.getSelectedOrphanClientsDetails = function(value,clientId){
                var clientIndex = -1;
                clientIndex = scope.orphanClients.findIndex(x=>x.id == clientId);

                if(clientIndex > -1){
                    if(value){
                        scope.getSelectedOrphanClients.push({"id":scope.orphanClients[clientIndex].id, "name":scope.orphanClients[clientIndex].displayName});
                    }else{
                        scope.removeEntity(scope.getSelectedOrphanClients, clientId);
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
                scope.allOrphanGroups.checked = value;
                scope.allOrphanClients.checked = value;
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

            scope.selectAllOrphanGroups = function(value){
                scope.getSelectedOrphanGroups = [];
                for(var i =0 ; i < scope.orphanGroups.length ; i++) {
                    scope.orphanGroups[i].checked = value;
                    if(value){
                        scope.getSelectedOrphanGroups.push({"id":scope.orphanGroups[i].id, "name":scope.orphanGroups[i].name});
                    }
                }
            };

            scope.selectAllOrphanClients = function(value){
                scope.getSelectedOrphanClients = [];
                for(var i =0 ; i < scope.orphanClients.length ; i++) {
                    scope.orphanClients[i].checked = value;
                    if(value){
                        scope.getSelectedOrphanClients.push({"id":scope.orphanClients[i].id, "name":scope.orphanClients[i].displayName});
                    }                        
                }
            };

            scope.reassignStaff = function () {
                this.formData.toOfficeId = this.formData.fromOfficeId;
                if(scope.isSubmitDetailsEmpty()){
                    scope.isEntityNotSelectedForReassignment = true;
                    scope.showErrorMessage = true;
                    scope.labelEmptyListErrorMessage = "label.error.select.entities";
                    return;
                }else{
                    scope.isEntityNotSelectedForReassignment = false; 
                    scope.showErrorMessage = false;
                    scope.submitDetails();
                }
            };

            scope.submitDetails = function () {
                this.formData.clients = scope.getSelectedClients;
                this.formData.groups = scope.getSelectedGroups;
                this.formData.centers = scope.getSelectedCenters;
                this.formData.orphanClients = scope.getSelectedOrphanClients;
                this.formData.orphanGroups = scope.getSelectedOrphanGroups;
                this.formData.orphanCenters = scope.getSelectedOrphanCenters;
                this.formData.isStaffReassignment = scope.isStaffReassignment;
                this.formData.orphanLoans = scope.getSelectedOrphanLoans;
                this.formData.orphanLoanApplications = scope.getSelectedOrphanLoanApps;
                this.formData.orphanSavings = scope.getSelectedOrphanSavings;
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

            scope.getSelectedGroupDetails = function(groups, value,id){
                if(value){
                    scope.addEntity(groups, scope.getSelectedGroups, id);
                }else{
                    scope.removeEntity(scope.getSelectedGroups, id);
                }
                
            };

            scope.getSelectedClientsDetails = function(value, id){
                if(value){
                    var index = -1;
                    index = scope.getSelectedClients.findIndex(x=>x.id == id);
                    if (index == -1) {
                        var i = scope.clients.findIndex(x=>x.id == id);
                        scope.getSelectedClients.push({"id":id,"name":scope.clients[i].displayName});
                    }
                }else{
                    scope.removeEntity(scope.getSelectedClients, id);
                }
            };

            scope.recordsStatus = function (){
                return !scope.showAssignToStaff && !scope.recordExists;
            }; 

            scope.isSubmitDetailsEmpty = function(){
                return (scope.getSelectedClients.length < 1 && scope.getSelectedGroups.length < 1 && scope.getSelectedCenters.length < 1 && scope.getSelectedOrphanGroups.length < 1 && scope.getSelectedOrphanClients.length < 1
                    && scope.getSelectedOrphanLoans.length < 1 && scope.getSelectedOrphanLoanApps.length < 1 && scope.getSelectedOrphanSavings.length < 1);
            };

            scope.displayError = function(){
                return (scope.showErrorMessage && scope.isEntityNotSelectedForReassignment);
            };
            scope.resetSelectedEntity = function(){
                scope.showAssignToStaff = false;
                scope.allCenter.checked = false;
                scope.allGroups.checked = false;
                scope.allClients.checked = false;
                scope.allOrphanGroups.checked = false;
                scope.allOrphanClients.checked = false;
                scope.centers = [];
                scope.groups = [];
                scope.clients = [];      
                scope.orphanGroups = [];
                scope.orphanClients = [];    
                scope.getSelectedClients = [];
                scope.getSelectedGroups = [];
                scope.getSelectedCenters = [];
                scope.getSelectedOrphanGroups = [];
                scope.getSelectedOrphanClients = [];
                scope.getSelectedOrphanSavings = [];
                scope.getSelectedOrphanLoans = [];
                scope.getSelectedOrphanLoanApps = [];
                scope.orphanLoans = [];
                scope.orphanLoanApps = [];    
                scope.orphanSavings = [];
            };

            scope.selectAllOrphanAccounts = function(selectedOrphanAccounts, orphanAccounts, value){
                selectedOrphanAccounts = [];
                for(var i =0 ; i < orphanAccounts.length ; i++) {
                    orphanAccounts[i].checked = value;
                    if(value){
                        selectedOrphanAccounts.push({"id":orphanAccounts[i].id, "name":orphanAccounts[i].name});
                    }
                }
            };

            scope.getSelectedOrphanAccounts = function(selectedOrphanAccounts, orphanAccounts, value,accountId){
                var index = -1;
                index = orphanAccounts.findIndex(x=>x.id == accountId);

                if(index > -1){
                    if(value){
                        selectedOrphanAccounts.push({"id":orphanAccounts[index].id, "accountNo":orphanAccounts[index].accountNo, "productName":orphanAccounts[index].productName});
                    }else{
                        scope.removeEntity(selectedOrphanAccounts, accountId);
                    }
                }
            };

            scope.showAssignParentStaffCheckbox = function(){
                return (scope.orphanClients.length>0 || scope.orphanGroups.length>0 || scope.orphanSavings.length>0 || scope.orphanLoans.length>0 || scope.orphanLoanApps.length>0);
            }
        }
    });
    mifosX.ng.application.controller('InitiateBulkTransferController', ['$scope' , '$location', 'ResourceFactory', '$route', 'dateFilter', '$rootScope', '$routeParams', mifosX.controllers.InitiateBulkTransferController]).run(function ($log) {
        $log.info("InitiateBulkTransferController initialized");
    });
}(mifosX.controllers || {}));
