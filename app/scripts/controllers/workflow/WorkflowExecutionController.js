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
                    if(step.status.id !=1){
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

            scope.isPreviousButtonDisabled = true;
            scope.isNextButtonDisabled = true;
            scope.$watch('currentStepId', function (newValue, oldValue, scope) {
                if(!_.isUndefined(scope.currentStepId)){
                    populatePreviousStep();
                    populateNextStep()
                }
            });
            function populatePreviousStep(){
                for(var index in scope.workflow.steps){
                    var step = scope.workflow.steps[index];
                    if(step.id == scope.currentStepId){
                        if(index == 0){
                            scope.isPreviousButtonDisabled = true;
                            scope.previousStepId = undefined;
                        }else if(step.id ==scope.currentStepId){
                            var previousStep = scope.workflow.steps[index-1];
                            scope.isPreviousButtonDisabled = false;
                            scope.previousStepId = previousStep.id;
                        }
                        break;
                    }
                }
            };

            function populateNextStep(){
                var lastIndex = scope.workflow.steps.length-1;
                for(var index in scope.workflow.steps){
                    var step = scope.workflow.steps[index];
                    if(step.id == scope.currentStepId){
                        scope.isNextButtonDisabled = true;
                        scope.nextStepId = undefined;
                        if(index != lastIndex && step.id ==scope.currentStepId){
                            var nextIndex = parseInt(index)+1;
                            var nextStep = scope.workflow.steps[nextIndex];
                            if(nextStep.status.id != 1){
                                scope.isNextButtonDisabled = false;
                                scope.nextStepId = nextStep.id;
                            }
                        }
                        break;
                    }
                }
            };

            scope.moveToPreviousStep = function () {
                if(!_.isUndefined(scope.previousStepId)){
                    scope.showMe(scope.previousStepId);
                }
            };

            scope.moveToNextStep = function () {
                if(!_.isUndefined(scope.nextStepId)){
                    scope.showMe(scope.nextStepId);
                }
            };
        }
    });
    mifosX.ng.application.controller('WorkflowExecutionController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.WorkflowExecutionController]).run(function ($log) {
        $log.info("WorkflowExecutionController initialized");
    });
}(mifosX.controllers || {}));