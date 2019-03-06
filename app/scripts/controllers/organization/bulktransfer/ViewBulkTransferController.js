(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewBulkTransferController: function (scope, resourceFactory, location, dateFilter, routeParams) {
            scope.bulkTransfer  = {};
            scope.selectedCenters = [];
			scope.selectedGroups = [];
            scope.selectedClients = [];
            scope.pendingState = 100;
            scope.entityCount = 0;

            scope.initPage = function () {
            	resourceFactory.bulkTransferResource.get({branchTransferId:routeParams.id},function (data) {
                    scope.bulkTransfer = data;
                    var json = JSON.parse(scope.bulkTransfer.jsonRequestBody);
                    scope.selectedCenters = json.centers;
                    scope.selectedGroups = json.groups;
                    scope.selectedClients = json.clients;
                    var staffId = null;
                    if(scope.bulkTransfer.fromStaff){
                    	if(scope.bulkTransfer.fromStaff.id == 0){
                    		staffId = null;
                    	}else{
                    		staffId = scope.bulkTransfer.fromStaff.id;
                    	}
                    }
                    scope.getDataForTransfer(scope.bulkTransfer.fromOffice.id, staffId);
                });
            }
            scope.initPage();

            scope.expandAll = function (center, expanded) {
                center.isExpanded = expanded;
            };

            scope.expandGroup = function (group, expanded) {
                group.isExpanded = expanded;
            };
            scope.expandClient = function (client, expanded) {
                client.isExpanded = expanded;
            };

            scope.getDataForTransfer = function (officeId, staffId) {
                resourceFactory.bulkTransferTemplateResource.get({'officeId': officeId, staffId: staffId}, function (data) {
                    scope.centers = data.centerDataList;
                    scope.groups = data.groups;
                    scope.clients = data.clients;
                });
            };

            scope.routeTo = function(id){
                scope.initPage();
            }
         
            scope.submit = function (action) {
            	resourceFactory.bulkTransferResource.actions({branchTransferId:routeParams.id,command : action},{},function (data) {
                    scope.initPage();
                });
            }
            
            scope.entityExists = function(entityArray, entityId){
                if(entityArray.findIndex(x=>x.id == entityId) != -1){
                    ++scope.entityCount;
                    return true;
                }
                return false;
            };
          
            scope.isTransferDataEmpty = function (){
                if(scope.entityCount>0){
                    return false;
                }
                    return true;
            };
            
            scope.noDataToTransferInPendingState = function (){
                return (scope.bulkTransfer.status.id == scope.pendingState) &&  scope.isTransferDataEmpty() ;
            };
        }
    });
    mifosX.ng.application.controller('ViewBulkTransferController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$routeParams', mifosX.controllers.ViewBulkTransferController]).run(function ($log) {
        $log.info("ViewBulkTransferController initialized");
    });
}(mifosX.controllers || {}));