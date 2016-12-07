(function (module) {
    mifosX.controllers = _.extend(module, {
        WorkflowStepExecutionController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope, angular) {
            scope.canView = false;
            scope.possibleActions = [];
            scope.showCriteriaResult =false;
            scope.getTaskView = function() {
                var taskView = 'views/workflow/task/'+scope.task.taskActivity.identifier.toLowerCase()+'task.html';
                return taskView;
            };

            scope.isTaskActive = function () {
                return scope.isCurrentTask(scope.task.id);
            };

            function initTask(){
                scope.taskconfig = _.extend({},scope.task.configValues);
                scope.showCriteriaResult =false;
                //viewaction check
                resourceFactory.workflowStepExecutionResource.doAction({workflowstepexecutionId:scope.task.id,action:10}, function (data) {
                    scope.task = data;
                    scope.canView = true;
                    //getpossibleActions
                    populateNextActions();
                });
                if(scope.isTaskActive()) {
                    scope.$broadcast('inittask', {});
                }
            }

            initTask();

            scope.doTaskAction = function (actionId) {
                scope.possibleActions = [];
                resourceFactory.workflowStepExecutionResource.doAction({workflowstepexecutionId:scope.task.id,action:actionId}, function (data) {
                    scope.task = data;
                    if (scope.task.status.id == 7 || scope.task.status.id == 9) {
                        scope.$emit('taskCompleted', {taskId: scope.task.id});
                    }
                    populateNextActions();
                });

            };

            function populateNextActions(){
                resourceFactory.workflowStepExecutionActionResource.getAll({workflowstepexecutionId:scope.task.id}, function (data) {
                    scope.possibleActions = data;
                });
            }

            scope.$on('taskDone', function (event, data) {
                if(scope.task.status.id == 2){
                    scope.doTaskAction(1);
                }

            });

            scope.$on('taskEdit', function (event, data) {
                scope.doTaskAction(9);
            });

            scope.triggerCriteriaResult = function(){
                if(scope.showCriteriaResult){
                    scope.showCriteriaResult = false;
                }else{
                    scope.showCriteriaResult = true;
                }
            }

        }
    });
    mifosX.ng.application.controller('WorkflowStepExecutionController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.WorkflowStepExecutionController]).run(function ($log) {
        $log.info("WorkflowStepExecutionController initialized");
    });
}(mifosX.controllers || {}));
