(function (module) {
    mifosX.controllers = _.extend(module, {
        WorkflowExecutionController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {

            scope.$on('initworkflow', function (event, data) {
                scope.tasks = data.taskExecutionData;
                initWorkflow();
                scope.$broadcast('inittask', {});
            });

            scope.$on('taskCompleted', function (event, data) {
                refreshWorkflow();
            });

            function refreshWorkflow(){
                resourceFactory.workflowTaskResource.getTaskDetailsByEntityTypeAndEntityId({entityType: scope.entityType,entityId : scope.entityId}, function (data) {
                    scope.tasks =  data;
                    initWorkflow();
                });
            };

            function initWorkflow(){
                scope.currentTaskId = scope.tasks[0].id;
                for(index in scope.tasks){
                    var task = scope.tasks[index];
                    if(task.status.id !=1){
                        scope.currentTaskId = task.id;
                    }
                }
            };

            scope.isCurrentTask = function (taskId) {
                if(taskId == scope.currentTaskId){
                    return true;
                }
                return false;
            };

            scope.isDisabled = function (taskId) {
                var task = getTask(taskId);
                if(task == undefined || task.status.id == 1){
                    return true;
                }
                return false;
            };

            scope.showMe = function (taskId) {
                var task = getTask(taskId);
                if(task!== undefined && task.status.id != 1){
                    scope.currentTaskId = taskId;
                }
            };

            function getTask(taskId){
                for(index in scope.tasks){
                    var task = scope.tasks[index];
                    if(task.id ==taskId){
                        return task ;
                    }
                }
            };

            scope.isPreviousButtonDisabled = true;
            scope.isNextButtonDisabled = true;
            scope.$watch('currentTaskId', function (newValue, oldValue, scope) {
                if(!_.isUndefined(scope.currentTaskId)){
                    populatePreviousTask();
                    populateNextTask()
                }
            });
            function populatePreviousTask(){
                for(var index in scope.tasks){
                    var task = scope.tasks[index];
                    if(task.id == scope.currentTaskId){
                        if(index == 0){
                            scope.isPreviousButtonDisabled = true;
                            scope.previousTaskId = undefined;
                        }else if(task.id ==scope.currentTaskId){
                            var previousTask = scope.tasks[index-1];
                            scope.isPreviousButtonDisabled = false;
                            scope.previousTaskId = previousTask.id;
                        }
                        break;
                    }
                }
            };

            function populateNextTask(){
                var lastIndex = scope.tasks.length-1;
                for(var index in scope.tasks){
                    var task = scope.tasks[index];
                    if(task.id == scope.currentTaskId){
                        scope.isNextButtonDisabled = true;
                        scope.nextTaskId = undefined;
                        if(index != lastIndex && task.id ==scope.currentTaskId){
                            var nextIndex = parseInt(index)+1;
                            var nextTask = scope.tasks[nextIndex];
                            if(nextTask.status.id != 1){
                                scope.isNextButtonDisabled = false;
                                scope.nextTaskId = nextTask.id;
                            }
                        }
                        break;
                    }
                }
            };

            scope.moveToPreviousTask = function () {
                if(!_.isUndefined(scope.previousTaskId)){
                    scope.showMe(scope.previousTaskId);
                }
            };

            scope.moveToNextTask = function () {
                if(!_.isUndefined(scope.nextTaskId)){
                    scope.showMe(scope.nextTaskId);
                }
            };
        }
    });
    mifosX.ng.application.controller('WorkflowExecutionController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.WorkflowExecutionController]).run(function ($log) {
        $log.info("WorkflowExecutionController initialized");
    });
}(mifosX.controllers || {}));