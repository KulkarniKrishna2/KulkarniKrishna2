
(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewWorkflowStepController: function (scope, resourceFactory, location, routeParams, dateFilter, $modal) {
            
            scope.taskConfigStepsData = {};

            if(routeParams.taskConfigId && routeParams.taskConfigStepId){
                resourceFactory.workflowConfigStepsResource.get({taskConfigId:routeParams.taskConfigId,taskConfigStepId:routeParams.taskConfigStepId}, function (data) {
                        scope.taskConfigStepsData = data;
                        if(scope.taskConfigStepsData.approvalLogic!== undefined && scope.taskConfigStepsData.approvalLogic.expression!==undefined) {
                            scope.taskConfigStepsData.approvalLogicStr = scope.taskConfigStepsData.approvalLogic.expression.comparator + " " + scope.taskConfigStepsData.approvalLogic.expression.value;
                        }
                        if(scope.taskConfigStepsData.rejectionLogic!== undefined && scope.taskConfigStepsData.rejectionLogic.expression!==undefined) {
                            scope.taskConfigStepsData.rejectionLogicStr = scope.taskConfigStepsData.rejectionLogic.expression.comparator + " " + scope.taskConfigStepsData.rejectionLogic.expression.value;
                        }
                });
            }

            scope.editWorkflowSteps = function(){
                location.path('/workflow/'+routeParams.taskConfigId+'/addworkflowsteps/'+routeParams.taskConfigStepId)
            }


            var InActivateTaskConfigStepsAlert = function ($scope, $modalInstance) {
                    $scope.continue = function () {
                        $modalInstance.close('Close');
                        scope.inactivateTaskConfigStepsMapping();
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                    
            };

            scope.inactivationCheck = function(){
                     $modal.open({
                        templateUrl: 'inactivationalert.html',
                        controller: InActivateTaskConfigStepsAlert
                    });
            }

            scope.inactivateTaskConfigStepsMapping = function(){
                    resourceFactory.inActivateWorkflowConfigStepsResource.update({taskConfigId : routeParams.taskConfigId,
                        taskConfigStepId : routeParams.taskConfigStepId,command :"inactivate"}, {}, function (data) {
                       location.path('/viewworkflow/'+routeParams.taskConfigId);
                    });
            }
            
        }
    });
    mifosX.ng.application.controller('ViewWorkflowStepController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', '$modal', mifosX.controllers.ViewWorkflowStepController]).run(function ($log) {
        $log.info("ViewWorkflowStepController initialized");
    });
}(mifosX.controllers || {}));
