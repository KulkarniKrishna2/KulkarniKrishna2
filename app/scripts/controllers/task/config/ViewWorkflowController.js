
(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewWorkflowController: function (scope, resourceFactory, location, routeParams, dateFilter, $modal) {
            
            scope.taskConfigData = {};
            scope.taskConfigStepsData = [];

            if(routeParams.taskConfigId){
                   resourceFactory.workflowConfigResource.get({taskConfigId:routeParams.taskConfigId}, function (data) {
                        scope.taskConfigData = data;
                   });
                   resourceFactory.workflowConfigStepsResource.getAll({taskConfigId:routeParams.taskConfigId}, function (data) {
                        scope.taskConfigStepsData = data;
                   });
            }

            scope.editWorkflow = function(){
                location.path('/addworkflow/'+routeParams.taskConfigId)
            }

            scope.addWorkflowSteps = function(){
                location.path('/workflow/'+routeParams.taskConfigId+'/addworkflowsteps')
            }

            scope.viewWorkflowStep = function(workflowId, workflowStepId){
                location.path('/viewworkflowstep/'+ workflowId + '/' + workflowStepId)
            }
            
        }
    });
    mifosX.ng.application.controller('ViewWorkflowController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', '$modal', mifosX.controllers.ViewWorkflowController]).run(function ($log) {
        $log.info("ViewWorkflowController initialized");
    });
}(mifosX.controllers || {}));
