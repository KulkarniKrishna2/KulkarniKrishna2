
(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewWorkflowEntityMappingController: function (scope, resourceFactory, location, routeParams, dateFilter, $modal) {

                 scope.workflowEntityMapping = {};
                 scope.isEntityDetailsExists = false;
            
                
                resourceFactory.workflowEntityMapping.get({taskConfigId : routeParams.taskConfigId,entityType : routeParams.entityType}, function (data) {
                    scope.workflowEntityMapping = data;
                    if(scope.workflowEntityMapping && scope.workflowEntityMapping.entityDetails && 
                        scope.workflowEntityMapping.entityDetails.length > 0){
                        scope.isEntityDetailsExists = true;
                    }
                });

                var InActivateWorkflowEntityMappingAlert = function ($scope, $modalInstance) {
                    $scope.continue = function () {
                        $modalInstance.close('Close');
                        scope.inactivateWorkflowEntityMapping();
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                    
                };

                scope.inactivationCheck = function(){
                     $modal.open({
                        templateUrl: 'inactivateentitymappingalert.html',
                        controller: InActivateWorkflowEntityMappingAlert
                    });
                }


                scope.inactivateWorkflowEntityMapping = function(){
                    resourceFactory.workflowEntityMapping.update({taskConfigId : scope.workflowEntityMapping.taskConfig.id,
                        entityType : scope.workflowEntityMapping.entityType.id,command :"inactivate"}, {}, function (data) {
                       location.path('/workflowentitymappings');
                    });

                }
            
        }
    });
    mifosX.ng.application.controller('ViewWorkflowEntityMappingController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', '$modal', mifosX.controllers.ViewWorkflowEntityMappingController]).run(function ($log) {
        $log.info("ViewWorkflowEntityMappingController initialized");
    });
}(mifosX.controllers || {}));
