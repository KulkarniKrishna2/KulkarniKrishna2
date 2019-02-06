(function (module) {
    mifosX.controllers = _.extend(module, {
        SingleTaskController: function (scope, $modal, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope, $route, commonUtilService) {
            scope.canView = false;
            scope.canComplete = true;
            scope.possibleActions = [];
            scope.taskNotes = [];
            scope.adhocTasks = [];
            scope.actionLogs = [];
            scope.noteData = {};
            scope.showCriteriaResult =false;
            scope.isTaskArchived = false;
            scope.action = {};
            scope.isRejectReasonMandatory = false;
            scope.isRejectDescriptionMandatory = false;
            scope.isRejectCodesMandatory = false;
            scope.isUnresolvedQueryExists = false;
            scope.canReschedule = false;
            scope.hideReject = false;
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.workflow){
                if (scope.response.uiDisplayConfigurations.workflow.isMandatory) {
                    if (scope.response.uiDisplayConfigurations.workflow.isMandatory.rejectReason) {
                        scope.isRejectReasonMandatory = scope.response.uiDisplayConfigurations.workflow.isMandatory.rejectReason;
                    }
                    if (scope.response.uiDisplayConfigurations.workflow.isMandatory.rejectDescription) {
                        scope.isRejectDescriptionMandatory = scope.response.uiDisplayConfigurations.workflow.isMandatory.rejectDescription;
                    }
                    if (scope.response.uiDisplayConfigurations.workflow.isMandatory.rejectCodes) {
                        scope.isRejectCodesMandatory = scope.response.uiDisplayConfigurations.workflow.isMandatory.rejectCodes;
                    }
                }
                if (scope.response.uiDisplayConfigurations.workflow.hideReject) {
                    scope.hideReject = scope.response.uiDisplayConfigurations.workflow.hideReject;
                }                
                
            }
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.workflow){
                scope.isShowRescheduleButton = scope.response.uiDisplayConfigurations.workflow.showReschedule;
                scope.isShowCreateTaskButton=scope.response.uiDisplayConfigurations.workflow.showCreateTask;
            }
            scope.getActivityView = function() {
                var taskView = 'views/task/activity/'+scope.taskData.taskActivity.identifier.toLowerCase()+'activity.html';
                return taskView;
            };
            scope.getActivityView();
            scope.clientsCount = function () {
                resourceFactory.runReportsResource.get({ reportSource: 'GroupSummaryCounts', genericResultSet: 'false', R_groupId: routeParams.centerId }, function (data) {
                    scope.summary = data[0];
                });
            };
            if(routeParams.centerId){
                scope.clientsCount();
            }
            
            function initTask(){
                if(scope.taskData != undefined){
                    if(scope.taskData.eventType){
                        scope.eventType = scope.taskData.eventType.systemCode;
                    }
                    scope.taskconfig = _.extend({},scope.taskData.configValues);
                    scope.taskconfig.status = scope.taskData.status;
                    scope.showCriteriaResult =false;
                    scope.isDisplayNotes=false;
                    scope.isDisplayAttachments=false;
                    scope.isDisplayActionLogs=false;
                    scope.isDisplayQueries = false;
                     if(scope.taskData.isArchived){
                        scope.isTaskArchived = true;
                        resourceFactory.taskExecutionTemplateResource.get({taskId: scope.taskData.id, isArchived:scope.isTaskArchived}, function (taskData) {
                                scope.taskData = taskData;
                                scope.canView = true;

                        });
                    }
                    //viewaction check
                    else  if(scope.taskData.status.value != 'inactive'){

                         resourceFactory.taskExecutionTemplateResource.get({taskId: scope.taskData.id}, function (taskData) {
                             scope.taskData = taskData;
                             if(scope.taskData.isUnresolvedQueryExists){
                                     resourceFactory.taskQueryResource.get({taskId:scope.taskData.id, isUnresolveQueryFetch : true}, function (taskQueryData) {
                                        scope.taskQueryDataList = taskQueryData;
                                        if(scope.taskQueryDataList != undefined && scope.taskQueryDataList.length > 0){
                                           scope.isUnresolvedQueryExists = true;
                                        }
                                    });
                               }
                         });
                        resourceFactory.taskExecutionResource.doAction({taskId:scope.taskData.id,action:'taskview'}, function (data) {
                            scope.canView = true;
                            populateNextActions();
                        });
                        
                    }

                    if(scope.taskData.status.value != 'inactive' || scope.taskData.status.value != 'completed' || scope.taskData.status.value != 'cancelled'){
                        if(scope.taskData.taskActivity != null){
                           scope.canReschedule = true;
                        }
                    }
                    if(scope.taskData.dueTime != undefined) {
                        var today  =  new Date();
                            scope.dueTime = new Date(scope.taskData.dueTime.iLocalMillis + (today.getTimezoneOffset() * 60 * 1000));
                            scope.dueTimeToDisplay = dateFilter(scope.dueTime, "HH:mm:ss");
                    }

                    if(scope.taskData.taskType.id==2 &&  scope.taskData.parentId!=null) {
                        scope.displayAdhocTasks();
                    }else {
                        scope.displayNotes();
                    }
                }
            }

            scope.getTaskId = function(){
                return scope.taskData.id;
            }
            scope.initiateTaskAction = function(actionName, action) {
                if(actionName == 'startover'){
                    return scope.startover();
                }

                if(actionName == 'reject'){
                    scope.action = action;       
                    return scope.reject(); 
                }

                if(actionName == 'reschedule'){
                    scope.action = action;       
                    return scope.reschedule(scope.taskData, actionName, scope.optlang.code); 
                }
                scope.taskActionExecutionErrorMessage = null;
                scope.$broadcast('preTaskAction',{actionName:actionName});

                // if(actionName === 'approve' && (scope.taskData.taskActivity.identifier.toLowerCase() === 'loanapplicationapproval'||
                //     scope.taskData.taskActivity.identifier.toLowerCase() === 'cam' ||
                //     scope.taskData.taskActivity.identifier.toLowerCase() === 'banktransaction')){
                //     scope.$broadcast('activityApprove');
                // }else{
                //     scope.possibleActions = [];
                //     doActionAndRefresh(actionName);
                //
                // }
            };

            scope.setTaskActionExecutionError = function (errorMessage) {
                scope.taskActionExecutionErrorMessage = errorMessage;
            };

            scope.doActionAndRefresh = function(actionName){
                resourceFactory.taskExecutionResource.doAction({taskId:scope.taskData.id,action:actionName}, function (data) {
                    resourceFactory.taskExecutionTemplateResource.get({taskId: scope.taskData.id}, function (taskData) {
                        scope.taskData = taskData;
                        if (scope.taskData.status.value == 'completed' || scope.taskData.status.value == 'skipped') {
                            scope.$emit('taskCompleted', {taskId: scope.taskData.id});       
                        }
                        if (scope.taskData.status.value == 'completed'){
                            scope.canReschedule = false;
                        }
                        scope.$broadcast('postTaskAction',{actionName:actionName});
                        populateNextActions();
                        populateTaskActionLogs();
                    });

                });
            };

            scope.startover = function () {
                $modal.open({

                    templateUrl: 'startover.html',
                    controller: StartOverCtrl,
                    windowClass: 'modalwidth700'
                });
            };
            var StartOverCtrl = function ($scope, $modalInstance) {
			    $scope.df = scope.df;
                $scope.previousTaskList=[];
                $scope.startOverFormData={};
                $scope.temp = {};
                $scope.temp.query = null;
                $scope.queryList = [];
                function initStartOver(){
                    $scope.previousTaskList = [];
                    resourceFactory.taskExecutionChildrenResource.getAll({taskId: scope.taskData.parentId}, function (children) {
                        populatePreviousTasks(children);
                    });
                };

                function populatePreviousTasks(taskList) {
                    $scope.previousTaskList = [];
                    if (taskList != undefined && taskList.length > 0) {
                        var currentTask = scope.taskData;
                        for (index in taskList) {
                            var task = scope.tasks[index];
                            if(task!=undefined && currentTask.order > task.order){
                                $scope.startOverFormData.startOverTaskId=task.id;
                                $scope.previousTaskList.push(task)
                            }
                        }
                    }
                };

                initStartOver();
                $scope.cancelStartOver = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.submitStartOver = function () {
                    if($scope.queryList != undefined && $scope.queryList.length > 0){
                        $scope.startOverFormData.queryList = $scope.queryList.slice();
                    }
                    resourceFactory.taskExecutionResource.doAction({taskId:scope.taskData.id,action:'startover'},$scope.startOverFormData, function (data) {
                        $modalInstance.close('startover');
                        $route.reload();
                    });
                };

                $scope.addQuery = function(newQuery){
                    $scope.queryList.push(newQuery);
                    $scope.temp.query = "";
                }

                $scope.deleteQuery = function(deleteQuery){
                    $scope.queryList.splice(deleteQuery,1);
                }
            };

            scope.reject = function () {
                $modal.open({
                    templateUrl: 'reject.html',
                    controller: RejectCtrl,
                    windowClass: 'modalwidth700'
                });
            };

            var RejectCtrl = function ($scope, $modalInstance) {
                $scope.df = scope.df;
                $scope.rejectioReasonsAvailable = false;
                $scope.displayDescription = false;
                $scope.isRejectReasonMandatory =  scope.isRejectReasonMandatory;
                $scope.error = null;
                $scope.rejectFormData = {};
                $scope.values = [];
                $scope.otherReason = false;
                if(scope.action.codes && scope.action.codes.length >= 1){ 
                    $scope.codes = scope.action.codes; 
                    $scope.rejectioReasonsAvailable= true;
                }else{
                    $scope.rejectioReasonsAvailable= false;
                }

                $scope.cancelReject = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.submitReject = function () {
                    if($scope.rejectioReasonsAvailable == true){
                        if(($scope.isRejectReasonMandatory && !$scope.rejectFormData.reasonCode) || $scope.displayDescription && !$scope.rejectFormData.description) {
                            $scope.error = 'Specify Rejection Reason';
                            return false;
                        }
                    }
                    resourceFactory.taskExecutionResource.doAction({taskId:scope.taskData.id,action:'reject'},$scope.rejectFormData, function (data) {
                        $modalInstance.close('reject');
                        $route.reload();
                    });
                };

                $scope.getDependentCodeValues = function(codeName){
                    $scope.otherReason = codeName.indexOf("Others")>-1;
                    $scope.values = $scope.codes[$scope.codes.findIndex(x => x.name == codeName)].values;
                };

                $scope.initDescription = function(reasonId){
                    $scope.subOtherReason = $scope.values[$scope.values.findIndex(x => x.id == reasonId)].name.indexOf("Other")>-1;
                    if($scope.subOtherReason==true && $scope.otherReason==true ){
                        $scope.displayDescription = true;
                      }else{
                        $scope.displayDescription = false;
                      }
                };
            };

            scope.isTaskCompleted = function(){
                if(scope.taskData.status.value == 'completed' || scope.taskData.status.value == 'skipped' || scope.taskData.status.value == 'cancelled'){
                    return true;
                } else{
                    return false;
                }
            };

            function populateNextActions(){
                scope.canComplete = true;
                resourceFactory.taskExecutionActionResource.getAll({taskId:scope.taskData.id}, function (data) {
                    scope.possibleActions = data;
                    if(scope.taskData.status.value == 'initiated'){
                        if(scope.possibleActions != undefined){
                            scope.possibleActions.forEach(function (action) {
                                if(action.actionType.value == 'activitycomplete' && !action.hasAccess){
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
                    resourceFactory.taskExecutionNotesResource.getAll({taskId: scope.taskData.id, isArchived:scope.isTaskArchived}, function (data) {
                        scope.noteData={};
                        scope.taskNotes = data;
                    });
                }
            }

            function populateAdhocTasks(){
                if (scope.isDisplayAdhocTasks) {
                    resourceFactory.entitySingleTasksResource.getAll({entityId: scope.taskData.parentId, entityType:"task"}, function (data) {
                        scope.adhocTaskData={};
                        scope.adhocTaskList = data;
                        console.log(scope.adhocTaskList);
                    });
                }
            }

            function populateTaskActionLogs() {
                if (scope.isDisplayActionLogs) {
                    resourceFactory.taskExecutionActionLogResource.getAll({taskId: scope.taskData.id, isArchived:scope.isTaskArchived}, function (data) {
                        scope.actionLogs = data;
                    });
                }
            }

            scope.addNote = function(){
                resourceFactory.taskExecutionNotesResource.create({taskId:scope.taskData.id}, scope.noteData,function (data) {
                    populateTaskNotes();
                });
            }

            scope.activityDone =  function (data) {
                if(scope.taskData.status.value == 'initiated'){
                    //scope.initiateTaskAction(1);
                    //activate the action button if required
                }

            };

            scope.activityEdit = function (data) {
                scope.initiateTaskAction('taskedit');
            };

            // scope.activityApproveDone = function (data) {
            //     doActionAndRefresh('approve');
            // };

            scope.taskCriteriaCheck = function(){
                scope.initiateTaskAction('criteriacheck');
            };

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

            var disableAllFooter = function(){
                scope.isDisplayAdhocTasks=false;
                scope.isDisplayNotes=false;
                scope.isDisplayAttachments=false;
                scope.isDisplayActionLogs=false;
                scope.isDisplayQueries = false;
            };

            scope.displayAdhocTasks = function () {
                disableAllFooter();
                scope.isDisplayAdhocTasks=true;
                populateAdhocTasks();
            };

            scope.displayNotes = function () {
                disableAllFooter();
                scope.isDisplayNotes=true;
                populateTaskNotes();
            };

            scope.displayAttachments = function () {
                disableAllFooter();
                scope.isDisplayAttachments=true;
                getTaskDocuments();
            };

            scope.displayActionLogs = function () {
                disableAllFooter();
                scope.isDisplayActionLogs=true;
                populateTaskActionLogs();
            };

            scope.goToTask = function(task) {
                if (task.parentId != undefined) {
                    location.path('/viewtask/' + task.parentId);
                } else {
                    location.path('/viewtask/' + task.id);
                }
            };

            initTask();

            function getTaskDocuments() {
                scope.docData={};
                if (scope.isDisplayAttachments) {
                    resourceFactory.documentsResource.getAllDocuments({
                        entityType: 'tasks',
                        entityId: scope.taskData.id
                    }, function (data) {
                        for (var l in data) {
                            var loandocs = {};
                            loandocs = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment';
                            data[l].docUrl = loandocs;
                        }
                        scope.taskDocuments = data;
                    });
                }
            };

            // getTaskDocuments();

            scope.deleteTaskDocument = function (documentId, index) {
                resourceFactory.documentsResource.delete({entityType : 'tasks',entityId: scope.taskData.id, documentId: documentId}, '', function (data) {
                    scope.taskDocuments.splice(index, 1);
                });
            };

            scope.closeQuery = function (taskQueryDataList) {
                $modal.open({
                    templateUrl: 'closequery.html',
                    controller: CloseQueryCtrl,
                    windowClass: 'modalwidth700',
                    resolve: {
                        queryDetails: function () {
                            return {'taskQueries' : taskQueryDataList};
                        }
                    }
                });
            };

            var CloseQueryCtrl = function ($scope, $modalInstance, queryDetails) {
			    $scope.df = scope.df;
                $scope.taskQueries = queryDetails.taskQueries;
                $scope.closeQueryFormData = {};

                $scope.cancelCloseQuery = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.submitCloseQuery = function () {
                     var tempArray = [];
                     for(var i = 0 ; i < $scope.taskQueries.length ; i++){
                         var tempObj = { taskQueryId : $scope.taskQueries[i].id, taskQueryResolution : $scope.taskQueries[i].resolution};
                         tempArray.push(tempObj);
                     }
                     $scope.closeQueryFormData.resolutions = tempArray.slice();
                    resourceFactory.taskQueryResource.update({taskId:scope.taskData.id},$scope.closeQueryFormData, function (data) {
                        $modalInstance.close('closequery');
                        $route.reload();
                    });
                };
            };

            scope.displayQueries = function () {
                scope.isDisplayNotes=false;
                scope.isDisplayAttachments=false;
                scope.isDisplayActionLogs=false;
                scope.isDisplayQueries = true;
                populateTaskQueries();
            };

             function populateTaskQueries(){
                if (scope.isDisplayQueries) {
                    resourceFactory.taskQueryResource.getAll({taskId: scope.taskData.id}, function (data) {
                        scope.queries = data;
                    });
                }
            }

            scope.addAdhocTask = function () {
                $modal.open({
                    templateUrl: 'views/task/popup/createadhoctask.html',
                    controller: CreateAdhocTaskCtrl,
                    windowClass: 'modalwidth700'
                });
            };

            var CreateAdhocTaskCtrl = function ($scope, $modalInstance) {

                $scope.adhocTaskData = {};
                $scope.rescheduleFormData = {};

                $scope.restrictDate = new Date();
                $scope.adhocTaskData.configValues = scope.taskData.configValues;
                $scope.adhocTaskData.entityType = "task";
                $scope.adhocTaskData.entityId = scope.taskData.parentId;

                resourceFactory.taskAssignTemplateResource.get(function (data) {
                    $scope.taskTemplates=data.taskConfigTemplateObject;
                    $scope.appusers=data.user;
                    if($scope.taskTemplates!=undefined && $scope.taskTemplates.length > 0){
                        $scope.adhocTaskData.templateId = $scope.taskTemplates[0].id;
                    }
                    if($scope.appusers!=undefined && $scope.appusers.length > 0){
                        $scope.adhocTaskData.assignedUser = $scope.appusers[0].id;
                    }

                });

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.checkDueTime = function(){
                    if(!($scope.adhocTaskData.dueTime instanceof Date)){
                        $scope.adhocTaskData.dueTime = new Date();
                    }
                };

                $scope.submitAdhocTask = function () {
                    $scope.adhocTaskData.description = $scope.adhocTaskData.configValues.summary;
                    $scope.adhocTaskData.shortDescription = $scope.adhocTaskData.configValues.summary;
                    if($scope.adhocTaskData.dueTime != undefined){
                        $scope.adhocTaskData.tempDate.setHours($scope.adhocTaskData.dueTime.getHours());
                        $scope.adhocTaskData.tempDate.setMinutes($scope.adhocTaskData.dueTime.getMinutes());
                        $scope.adhocTaskData.tempDate.setSeconds($scope.adhocTaskData.dueTime.getSeconds());
                    }
                    $scope.adhocTaskData.dueDate = dateFilter($scope.adhocTaskData.tempDate, 'dd MMMM yyyy HH:mm:ss');
                    $scope.adhocTaskData.dateFormat='dd MMMM yyyy HH:mm:ss';
                    console.log($scope.adhocTaskData);
                    // $scope.adhocTaskData.locale = $scope.adhocTaskData.localeObj;
                    resourceFactory.adhocTaskResource.create({},$scope.adhocTaskData, function (data) {
                        $modalInstance.close();
                        scope.displayAdhocTasks();
                    });
                };
            };

            scope.reschedule = function (taskDataObj, actionValue, localeObj) {
                $modal.open({
                    templateUrl: 'reschedule.html',
                    controller: RescheduleCtrl,
                    windowClass: 'modalwidth700',
                    resolve: {
                        rescheduleDetails: function () {
                            return {'dueDate' : taskDataObj.dueDate, 
                                    'dueTime' : taskDataObj.dueTime, 
                                    'actionName' : actionValue,
                                    'localeObj' : localeObj};
                        }
                    }
                });
            };

            var RescheduleCtrl = function ($scope, $modalInstance, rescheduleDetails) {
			    $scope.df = scope.df;
                $scope.rschData = {};
                $scope.rescheduleFormData = {};
                $scope.rschData.dueTime = scope.dueTime;
                $scope.rschData.dueDate = new Date(rescheduleDetails.dueDate);
                $scope.rschData.localeObj = rescheduleDetails.localeObj;
                $scope.restrictDate = new Date();
                
                $scope.cancelReschedule = function () {
                    $modalInstance.dismiss('cancel');
                };

                 $scope.checkDueTime = function(){
                    if(!($scope.rschData.dueTime instanceof Date)){
                        $scope.rschData.dueTime = new Date();
                    }
                 };

                $scope.submitReschedule = function () {            
                    if($scope.rschData.dueTime != undefined){
                        $scope.rschData.dueDate.setHours($scope.rschData.dueTime.getHours());
                        $scope.rschData.dueDate.setMinutes($scope.rschData.dueTime.getMinutes());
                        $scope.rschData.dueDate.setSeconds($scope.rschData.dueTime.getSeconds());
                        $scope.rescheduleFormData.rescheduleToDate = dateFilter($scope.rschData.dueDate, 'dd MMMM yyyy HH:mm:ss');      
                    }
                    $scope.rescheduleFormData.timeFormat='dd MMMM yyyy HH:mm:ss';
                    $scope.rescheduleFormData.dateFormat='dd MMMM yyyy HH:mm:ss';
                    $scope.rescheduleFormData.locale = $scope.rschData.localeObj;
                    resourceFactory.taskExecutionResource.doAction({taskId:scope.taskData.id,action:rescheduleDetails.actionName},$scope.rescheduleFormData, function (data) {
                        $modalInstance.close('reschedule');
                        location.path('/tasklist');
                    });
                };
            };

            initTask();
        }
    });
    mifosX.ng.application.controller('SingleTaskController', ['$scope', '$modal', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', '$route', 'CommonUtilService', mifosX.controllers.SingleTaskController]).run(function ($log) {
        $log.info("SingleTaskController initialized");
    });
}(mifosX.controllers || {}));
