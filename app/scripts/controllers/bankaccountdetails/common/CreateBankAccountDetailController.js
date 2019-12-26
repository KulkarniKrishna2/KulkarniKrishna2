(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateBankAccountDetailController: function ($controller, scope, routeParams, resourceFactory, location, $modal, route, $window, dateFilter) {
            scope.entityType = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            scope.clientId=routeParams.entityId;
            scope.eventType = "create";

            var bankAccountConfig = {bankAccount :{entityType:scope.entityType,
                entityId:scope.entityId,eventType:scope.eventType}};
            if(scope.commonConfig === undefined){
                scope.commonConfig = {};
            }
            angular.extend(scope.commonConfig,bankAccountConfig);


            function populateDetails() {
                resourceFactory.bankAccountDetailsTemplateResource.get({entityType:scope.entityType, entityId: scope.entityId}, function (data) {
                    var bankData = {bankAccountData:data};
                    angular.extend(scope.commonConfig,bankData);
                    if(data!=undefined && data.id!=undefined){
                      
                    }else{
                        createWorkflow(true);
                    }
                });
            }

            function createWorkflow(forceCreate){
                resourceFactory.bankAccountDetailWorkflowResource.get({
                    entityType: scope.entityType,
                    entityId: scope.entityId,
                    isForceCreate : forceCreate
                }, function (data) {
                    console.log("data:"+JSON.stringify(data));
                    if(data.id ===undefined || data.id === null){
                        generateWorkFlow(forceCreate);
                    }else if(data!=undefined && data.id!=undefined && data.id!= null){
                        if(data.status.id !=7){
                            scope.isTask= true;
                            var taskConfig= {taskData:{id:data.id,embedded:true}};
                            angular.extend(scope.commonConfig,taskConfig);
                        }
                    }

                });
            }

            function generateWorkFlow(forceCreate){
                resourceFactory.bankAccountDetailWorkflowResource.create({
                    entityType: scope.entityType,
                    entityId: scope.entityId
                },{isForceCreate : forceCreate},function (data) {
                    console.log("resource:"+JSON.stringify(data));
                    if(data.resourceId!==undefined || data.resourceId !== null){
                        createWorkflow(forceCreate);
                    }
                });
            }


            function init(){
                populateDetails();
            }

            init();
        }
    });
    mifosX.ng.application.controller('CreateBankAccountDetailController', ['$controller','$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route','$window','dateFilter', mifosX.controllers.CreateBankAccountDetailController]).run(function ($log) {
        $log.info("CreateBankAccountDetailController initialized");
    });
}(mifosX.controllers || {}));
