(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateBankAccountDetailController: function ($controller, scope, routeParams, resourceFactory, location, $modal, route, $window, dateFilter) {
            scope.entityType = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            scope.clientId=routeParams.entityId;
            scope.eventType = "create";
            scope.isInitiated = false;

  
            if(scope.commonConfig === undefined){
                scope.commonConfig = {};
            }


            function populateDetails() {
                resourceFactory.bankAccountDetailsTemplateResource.get({entityType:scope.entityType, entityId: scope.entityId}, function (data) {
                     
                    if(data!=undefined){
                        var bankAccountConfig = {bankAccount :{entityType:scope.entityType,
                            entityId:scope.entityId,eventType:scope.eventType,templateData: data}};
                        angular.extend(scope.commonConfig, bankAccountConfig);
                    
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
                    if(data!=undefined && data.id!=undefined){
                        if(data.status.id !=7){
                            scope.isTask= true;
                            var taskConfig= {taskData:{id:data.id,embedded:true}};
                            angular.extend(scope.commonConfig,taskConfig);
                        }
                    }
                    scope.isInitiated = true;

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
