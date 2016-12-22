(function (module) {
    mifosX.controllers = _.extend(module, {
        SingleTaskController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope, angular) {

            scope.canView = false;
            scope.possibleActions = [];
            scope.taskNotes = [];
            scope.noteData = {};
            scope.showCriteriaResult =false;
            scope.getActivityView = function() {
                var taskView = 'views/task/activity/'+scope.taskData.taskActivity.identifier.toLowerCase()+'activity.html';
                return taskView;
            };

            // scope.isTaskActive = function () {
            //     return scope.isCurrentTask(scope.taskData.id);
            // };

            function initTask(){
                if(scope.taskData != undefined){
                    scope.taskconfig = _.extend({},scope.taskData.configValues);
                    scope.showCriteriaResult =false;
                    //viewaction check
                    resourceFactory.taskExecutionResource.doAction({taskId:scope.taskData.id,action:10}, function (data) {
                        scope.taskData = data;
                        scope.canView = true;
                        //getpossibleActions
                        populateNextActions();
                        populateTaskNotes();
                    });
                }
            }


            initTask();

            scope.doTaskAction = function (actionId) {
                if(actionId === 4 && scope.taskData.taskActivity.identifier.toLowerCase() === 'loanapplicationapproval'){
                    scope.$broadcast('activityApprove');
                }else{
                    resourceFactory.taskExecutionResource.doAction({taskId:scope.taskData.id,action:actionId}, function (data) {
                        scope.taskData = data;
                        if (scope.taskData.status.id == 7 || scope.taskData.status.id == 9) {
                            scope.$emit('taskCompleted', {taskId: scope.taskData.id});
                        }
                        populateNextActions();
                    });
                    scope.possibleActions = [];
                }
            };

            function populateNextActions(){
                resourceFactory.taskExecutionActionResource.getAll({taskId:scope.taskData.id}, function (data) {
                    scope.possibleActions = data;
                });
            }

            function populateTaskNotes(){
                resourceFactory.taskExecutionNotesResource.getAll({taskId:scope.taskData.id}, function (data) {
                    scope.taskNotes = data;
                });
            }

            scope.addNote = function(){
                resourceFactory.taskExecutionNotesResource.create({taskId:scope.taskData.id}, scope.noteData,function (data) {
                    populateTaskNotes();
                });
            }

            scope.$on('activityDone', function (event, data) {
                if(scope.taskData.status.id == 2){
                    //scope.doTaskAction(1);
                    //activate the action button if required
                }

            });

            scope.$on('activityEdit', function (event, data) {
                scope.doTaskAction(9);
            });

            scope.$on('activityApproveDone', function (event, data) {
                resourceFactory.taskExecutionResource.doAction({taskId:scope.taskData.id,action:4}, function (data) {
                    scope.taskData = data;
                    if (scope.taskData.status.id == 7 || scope.taskData.status.id == 9) {
                        scope.$emit('taskCompleted', {taskId: scope.taskData.id});
                    }
                    populateNextActions();
                });
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
    mifosX.ng.application.controller('SingleTaskController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.SingleTaskController]).run(function ($log) {
        $log.info("SingleTaskController initialized");
    });
}(mifosX.controllers || {}));
