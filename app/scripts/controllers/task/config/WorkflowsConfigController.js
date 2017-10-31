
(function (module) {
    mifosX.controllers = _.extend(module, {
        WorkflowsConfigController: function (scope, resourceFactory, location, translate, routeParams, dateFilter) {

                 scope.workflowConfigsList = [];
            
                
                resourceFactory.workflowConfigResource.getAll({}, function (data) {
                    scope.workflowConfigsList = data;
                });

                scope.addWorkflowSteps = function(taskConfigId){
                    location.path('/workflow/'+taskConfigId+'/addworkflowsteps')
                }

                scope.routeToView = function(taskConfigId){
                    location.path('/viewworkflow/'+ taskConfigId);
                }
            
        }
    });
    mifosX.ng.application.controller('WorkflowsConfigController', ['$scope', 'ResourceFactory', '$location', '$translate', '$routeParams', 'dateFilter', mifosX.controllers.WorkflowsConfigController]).run(function ($log) {
        $log.info("WorkflowsConfigController initialized");
    });
}(mifosX.controllers || {}));