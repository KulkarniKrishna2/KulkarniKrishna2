(function (module) {
    mifosX.controllers = _.extend(module, {
        SingleTaskController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope, angular) {

            scope.canView = false;
            scope.canComplete = true;
            scope.possibleActions = [];
            scope.taskNotes = [];
            scope.actionLogs = [];
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
                    scope.isDisplayNotes=false;
                    scope.isDisplayAttachments=false;
                    scope.isDisplayActionLogs=false;
                    //viewaction check
                    if(scope.taskData.status.id != 1){
                        resourceFactory.taskExecutionResource.doAction({taskId:scope.taskData.id,action:10}, function (data) {
                            scope.taskData = data;
                            scope.canView = true;
                            //getpossibleActions
                            populateNextActions();
                        });
                    }
                }
            }


            initTask();

            scope.doTaskAction = function (actionId) {
                if(actionId === 4 && scope.taskData.taskActivity.identifier.toLowerCase() === 'loanapplicationapproval'){
                    scope.$broadcast('activityApprove');
                }else{
                    scope.possibleActions = [];
                    resourceFactory.taskExecutionResource.doAction({taskId:scope.taskData.id,action:actionId}, function (data) {
                        scope.taskData = data;
                        if (scope.taskData.status.id == 7 || scope.taskData.status.id == 9) {
                            scope.$emit('taskCompleted', {taskId: scope.taskData.id});
                        }
                        populateNextActions();
                        populateTaskActionLogs();
                    });

                }
            };

            scope.isTaskCompleted = function(){
                if(scope.taskData.status.id == 7 || scope.taskData.status.id == 9 || scope.taskData.status.id == 8){
                    return true;
                } else{
                    return false;
                }
            };

            function populateNextActions(){
                scope.canComplete = true;
                resourceFactory.taskExecutionActionResource.getAll({taskId:scope.taskData.id}, function (data) {
                    scope.possibleActions = data;
                    if(scope.taskData.status.id == 2){
                        if(scope.possibleActions != undefined){
                            scope.possibleActions.forEach(function (action) {
                                if(action.id == 1 && !action.hasAccess){
                                    scope.canComplete = false;
                                }
                            });
                        }
                    }else{
                        scope.canComplete = true;
                    }

                });
            }

            function populateTaskNotes(){
                if (scope.isDisplayNotes) {
                    resourceFactory.taskExecutionNotesResource.getAll({taskId: scope.taskData.id}, function (data) {
                        scope.taskNotes = data;
                    });
                }
            }

            function populateTaskActionLogs() {
                if (scope.isDisplayActionLogs) {
                    resourceFactory.taskExecutionActionLogResource.getAll({taskId: scope.taskData.id}, function (data) {
                        scope.actionLogs = data;
                    });
                }
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
                    populateTaskActionLogs();
                });
            });


            scope.triggerCriteriaResult = function(){
                if(scope.showCriteriaResult){
                    scope.showCriteriaResult = false;
                }else{
                    scope.showCriteriaResult = true;
                }
            };

            scope.onTaskFileSelect = function ($files) {
                scope.taskFile = $files[0];
            };

            scope.docData = {};
            scope.submitTaskDocuments = function () {
                $upload.upload({
                    url: $rootScope.hostUrl + API_VERSION + '/tasks/' + scope.taskData.id + '/documents',
                    data: scope.docData,
                    file: scope.taskFile
                }).then(function (data) {
                    // to fix IE not refreshing the model
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                    getTaskDocuments();
                });
            };

            scope.displayNotes = function () {
                scope.isDisplayNotes=true;
                scope.isDisplayAttachments=false;
                scope.isDisplayActionLogs=false;
                populateTaskNotes();
            };

            scope.displayAttachments = function () {
                scope.isDisplayNotes=false;
                scope.isDisplayAttachments=true;
                scope.isDisplayActionLogs=false;
                getTaskDocuments();
            };

            scope.displayActionLogs = function () {
                scope.isDisplayNotes=false;
                scope.isDisplayAttachments=false;
                scope.isDisplayActionLogs=true;
                populateTaskActionLogs();
            };

            function getTaskDocuments() {
                if (scope.isDisplayAttachments) {
                    resourceFactory.documentsResource.getAllDocuments({
                        entityType: 'tasks',
                        entityId: scope.taskData.id
                    }, function (data) {
                        for (var l in data) {
                            var loandocs = {};
                            loandocs = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                            data[l].docUrl = loandocs;
                        }
                        scope.taskDocuments = data;
                    });
                }
            };

            getTaskDocuments();

            scope.deleteTaskDocument = function (documentId, index) {
                resourceFactory.documentsResource.delete({entityType : 'tasks',entityId: scope.taskData.id, documentId: documentId}, '', function (data) {
                    scope.taskDocuments.splice(index, 1);
                });
            };
        }
    });
    mifosX.ng.application.controller('SingleTaskController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.SingleTaskController]).run(function ($log) {
        $log.info("SingleTaskController initialized");
    });
}(mifosX.controllers || {}));
