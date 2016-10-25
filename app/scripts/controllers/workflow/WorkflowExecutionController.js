(function (module) {
    mifosX.controllers = _.extend(module, {
        WorkflowExecutionController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {

            // scope.workflow = {};

            scope.$on('initworkflow', function (event, data) {
                console.log("inside init workflow"); // 'Some data'
                scope.workflow = data.workflowExecutionData;
                initWorkflow();
                scope.$broadcast('initstep', {});
            });

            scope.$on('stepCompleted', function (event, data) {
                console.log("inside init workflow"); // 'Some data'
                refreshWorkflow();
            });

            function refreshWorkflow(){
                resourceFactory.workflowExecutionResource.get({workflowexecutionId: scope.workflowExecutionId}, function (data) {
                    console.log("workflowExecutionData: "+data);
                    scope.workflow =  data;
                    initWorkflow();
                });
            };

            function initWorkflow(){
                scope.workflowExecutionId = scope.workflow.id;
                scope.currentStepId = scope.workflow.steps[0].id;
                for(index in scope.workflow.steps){
                    var step = scope.workflow.steps[index];
                    if(step.status.id == 2){
                        scope.currentStepId = step.id;
                        return;
                    }else if(step.status.id !=1){
                        scope.currentStepId = step.id;
                    }
                }
            };

            scope.isCurrentStep = function (stepId) {
                if(stepId == scope.currentStepId){
                    return true;
                }
                return false;
            };

            scope.isDisabled = function (stepId) {
                var step = getStep(stepId);
                if(step == undefined || step.status.id == 1){
                    return true;
                }
                return false;
            };

            scope.showMe = function (stepId) {
                var step = getStep(stepId);
                if(step!== undefined && step.status.id != 1){
                    scope.currentStepId = stepId;
                }
            };

            function getStep(stepId){
                for(index in scope.workflow.steps){
                    var step = scope.workflow.steps[index];
                    if(step.id ==stepId){
                        return step ;
                    }
                }
            };


        }
    });
    mifosX.ng.application.controller('WorkflowExecutionController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.WorkflowExecutionController]).run(function ($log) {
        $log.info("WorkflowExecutionController initialized");
    });
}(mifosX.controllers || {}));