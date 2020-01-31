(function (module) {
    mifosX.controllers = _.extend(module, {
        BankAccountDetailController: function ($controller, scope, routeParams, resourceFactory, location, $modal, route, $window, dateFilter) {
            scope.entityType = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            scope.clientId=routeParams.entityId;
            scope.clientBankAccountDetailAssociationId=routeParams.clientBankAccountDetailAssociationId;
            scope.eventType = "view";

            scope.isInitiated = false;

            var bankAccountConfig = {bankAccount :{entityType:scope.entityType,
                entityId:scope.entityId,
                clientBankAccountDetailAssociationId: scope.clientBankAccountDetailAssociationId,
                eventType:scope.eventType}};
            if(scope.commonConfig === undefined){
                scope.commonConfig = {};
            }
            angular.extend(scope.commonConfig,bankAccountConfig);

            if(!_.isUndefined(routeParams.associationStatus)){
                scope.fetchInactiveAssociation = "fetchInactiveAssociation";
                scope.showReactivateButton = true;
            }
            function populateDetails() {
            
                resourceFactory.bankAccountDetailResource.get({entityType:scope.entityType, entityId: scope.entityId, clientBankAccountDetailAssociationId: scope.clientBankAccountDetailAssociationId,'command':scope.fetchInactiveAssociation}, function (data) {

                    var bankData = {bankAccount:{entityId:scope.entityId, entityType:scope.entityType, clientBankAccountDetailAssociationId:scope.clientBankAccountDetailAssociationId, bankAccountData:data}}
                    angular.extend(scope.commonConfig,bankData);
                    if(data!=undefined && data.id!=undefined){
                        if(!(data.status.id==200 || data.status.id==400)){
                            createWorkflow(false);
                        }else{
                            scope.isInitiated = true;
                        }

                    }else{
                        createWorkflow(true);
                        templateResource();
                    }
                });
            }

            function createWorkflow(forceCreate){
                resourceFactory.bankAccountDetailWorkflowResource.get({
                    entityType: scope.entityType,
                    entityId: scope.entityId,
                    isForceCreate : forceCreate
                }, function (data) {
                    if(data!=undefined && data.id!=undefined){
                        if(data.status.id !=7){
                            scope.isTask= true;
                            var taskConfig= {taskData:{id:data.id,embedded:true,template:data}};
                            angular.extend(scope.commonConfig,taskConfig);
                        }
                    }
                    scope.isInitiated = true;

                });
            }

            function templateResource(){
                resourceFactory.bankAccountDetailsTemplateResource.get({
                    entityType: scope.entityType,
                    entityId: scope.entityId
                }, function (data) {
                    var bankData = {bankAccountData:data};
                    angular.extend(scope.commonConfig, bankData);
                });
            }

            function init(){
                populateDetails();
            }

            init();
        }
    });
    mifosX.ng.application.controller('BankAccountDetailController', ['$controller','$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route','$window','dateFilter', mifosX.controllers.BankAccountDetailController]).run(function ($log) {
        $log.info("BankAccountDetailController initialized");
    });
}(mifosX.controllers || {}));
