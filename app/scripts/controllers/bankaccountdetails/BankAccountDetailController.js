(function (module) {
    mifosX.controllers = _.extend(module, {
        BankAccountDetailController: function ($controller, scope, routeParams, resourceFactory, location, $modal, route, $window, dateFilter) {
            scope.entityType = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            scope.clientId=routeParams.entityId;

            var bankAccountConfig = {bankAccount :{entityType:scope.entityType,
                entityId:scope.entityId}};
            if(scope.commonConfig === undefined){
                scope.commonConfig = {};
            }
            angular.extend(scope.commonConfig,bankAccountConfig);

            function populateDetails() {
                resourceFactory.bankAccountDetailResource.get({entityType:scope.entityType, entityId: scope.entityId}, function (data) {
                    var bankData = {bankAccountData:data};
                    angular.extend(scope.commonConfig,bankData);
                    if(data!=undefined && data.id!=undefined){
                        if(data.status.id==200){

                        }else{
                            createWorkflow(false);
                        }
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
                    if(data!=undefined && data.id!=undefined){
                        if(data.status.id !=7){
                            scope.isTask= true;
                            var taskConfig= {taskData:{id:data.id,embedded:true}};
                            angular.extend(scope.commonConfig,taskConfig);
                        }
                    }

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
