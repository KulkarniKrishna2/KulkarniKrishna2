(function (module) {
    mifosX.controllers = _.extend(module, {
        WorkflowStepExecutionController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope, angular) {
            scope.canView = false;
            scope.possibleActions = [];
            scope.showCriteriaResult =false;
            scope.getTaskView = function() {
                var taskView = 'views/workflow/task/'+scope.step.task.identifier.toLowerCase()+'task.html';
                return taskView;
            };

            scope.isStepActive = function () {
                return scope.isCurrentStep(scope.step.id);
            };

            function initStep(){
                scope.stepconfig = _.extend({},scope.masterconfig,scope.step.configValues);
                scope.showCriteriaResult =false;
                //viewaction check
                resourceFactory.workflowStepExecutionResource.doAction({workflowstepexecutionId:scope.step.id,action:10}, function (data) {
                    scope.step = data;
                    scope.canView = true;
                    //getpossibleActions
                    populateNextActions();
                });
                if(scope.isStepActive()) {
                    scope.$broadcast('inittask', {});
                }
            }

            initStep();

            scope.doStepAction = function (actionId) {
                scope.possibleActions = [];

                resourceFactory.workflowStepExecutionResource.doAction({workflowstepexecutionId:scope.step.id,action:actionId}, function (data) {
                    scope.step = data;
                    if (scope.step.status.id == 7 || scope.step.status.id == 9) {
                        scope.$emit('stepCompleted', {stepId: scope.step.id});
                    }
                    populateNextActions();
                });

            };

            function populateNextActions(){
                resourceFactory.workflowStepExecutionActionResource.getAll({workflowstepexecutionId:scope.step.id}, function (data) {
                    scope.possibleActions = data;
                });
            }

            scope.$on('taskDone', function (event, data) {
                if(scope.step.status.id == 2){
                    scope.doStepAction(1);
                }

            });

            scope.$on('taskEdit', function (event, data) {
                scope.doStepAction(9);
            });

            scope.triggerCriteriaResult = function(){
                if(scope.showCriteriaResult){
                    scope.showCriteriaResult = false;
                }else{
                    scope.showCriteriaResult = true;
                }
            }

            //
            // scope.$on('initstep', function (event, data) {
            //     console.log("inside init step"); // 'Some data'
            //
            //     if(scope.isStepActive()){
            //
            //     }
            // });

        }
    });
    mifosX.ng.application.controller('WorkflowStepExecutionController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.WorkflowStepExecutionController]).run(function ($log) {
        $log.info("WorkflowStepExecutionController initialized");
    });
}(mifosX.controllers || {}));