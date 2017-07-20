(function (module) {
    mifosX.controllers = _.extend(module, {
        WorkflowTaskController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {

            scope.tasks = [];

            scope.$on('initTask', function (event, data) {
                initTask(data.taskData);
            });

            function initTask(taskData) {
                if(taskData != undefined){
                    scope.taskData = taskData;
                }
                if(scope.taskData !=undefined && scope.taskData.id !=undefined){
                    refreshWorkflowTask();
                }
            }

            initTask();

            scope.$on('taskCompleted', function (event, data) {
                refreshWorkflowTask();
            });

            function refreshWorkflowTask(){
                resourceFactory.taskExecutionChildrenResource.getAll({taskId: scope.taskData.id}, function (children) {
                    scope.tasks =  children;
                    initWorkflowTask();
                });
            };

            function initWorkflowTask() {
                if (scope.tasks != undefined && scope.tasks.length > 0) {

                    scope.currentTaskId = scope.tasks[0].id;
                    for (index in scope.tasks) {
                        var task = scope.tasks[index];
                        if (task.status!= undefined && task.status.value != 'inactive') {
                            scope.currentTaskId = task.id;
                            if(task.status.id < 7){
                                break;
                            }
                        }
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
                if(task == undefined || task.status.value == 'inactive'){
                    return true;
                }
                return false;
            };

            scope.showMe = function (taskId) {
                var task = getTask(taskId);
                if(task!== undefined && task.status.value != 'inactive'){
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
                            if(nextTask.status.value != 'inactive'){
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
    mifosX.ng.application.controller('WorkflowTaskController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.WorkflowTaskController]).run(function ($log) {
        $log.info("WorkflowTaskController initialized");
    });
}(mifosX.controllers || {}));