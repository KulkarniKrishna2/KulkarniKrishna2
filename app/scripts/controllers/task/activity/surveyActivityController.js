(function (module) {
    mifosX.controllers = _.extend(module, {
        surveyActivityController: function ($controller, scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION,
                                            $upload, $rootScope, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.onFileSelect = function ($files) {
                scope.file = $files[0];
            };
            scope.formData = {};
            scope.restrictDate = new Date();
            scope.formData.surveyedOn = new Date();
            scope.showdetails=true;
            scope.entityTypeId = null;
            scope.isSurveyForOthers = false;
            function initTask() {
                scope.clientId = scope.taskconfig['clientId'];
                scope.surveyId = scope.taskconfig['surveyId'];
                if (scope.surveyId) {
                    if (_.isUndefined(scope.surveyData)) {
                        resourceFactory.surveyResource.getBySurveyId({surveyId: scope.surveyId}, function (surveyData) {
                            scope.completeSurveyData = surveyData;
                            scope.entityType = surveyData.entityTypeValue;
                            if (scope.entityType === 'LOANAPPLICATIONS') {
                                scope.entityId = scope.taskconfig['loanApplicationId'];
                            } else if (scope.entityType === 'LOANS') {
                                scope.entityId = scope.taskconfig['loanId'];
                            } else if (scope.entityType === 'CLIENTS') {
                                scope.entityId = scope.taskconfig['clientId'];
                            }else if (scope.entityType === 'GROUPS'){
                                scope.entityId = scope.taskconfig['groupId'];
                            }else if (scope.entityType === 'VILLAGES'){
                                scope.entityId = scope.taskconfig['villageId'];
                            }else if (scope.entityType === 'OFFICES'){
                                scope.entityId = scope.taskconfig['officeId'];
                            }
                            getSurveyTemplate();
                            scope.surveyData = surveyData;
                            scope.questionDatas = surveyData.questionDatas;
                        });
                    }
                }
            };

            initTask();
            scope.takeNewSurvey = function () {
                scope.isDisplaySurveys = false;
                if (_.isUndefined(scope.loanOfficers)) {
                    resourceFactory.employeeResource.getAllEmployees({}, function (loanOfficers) {
                        scope.loanOfficers = loanOfficers.pageItems;
                    });
                }
            };
            scope.toggleDetailsView=function()
            {
                scope.showdetails=!scope.showdetails;
            }
            scope.isDisplaySurveys = true;
            scope.displaySurveysList = function () {
                scope.isDisplaySurveys = true;
                resourceFactory.takeSurveysResource.getAll({
                    entityType: scope.entityTypeId,
                    entityId: scope.entityId
                }, function (surveys) {
                    scope.surveys = [];
                    if (surveys && surveys.length > 0) {
                        for(var i in surveys){
                            if(scope.surveyId == surveys[i].surveyId){
                                scope.surveys.push(surveys[i]);
                            }
                        }
                        if (scope.surveys && scope.surveys.length > 0) {
                            var survey = scope.surveys[0];
                            scope.formData.id = survey.id;
                            scope.formData.surveyedBy = survey.surveyedBy;
                            if(survey.coSurveyedBy){
                                scope.formData.coSurveyedBy = survey.coSurveyedBy;
                            }
                            scope.formData.surveyedOn = new Date(survey.surveyedOn);
                            scope.isSurveyForOthers = scope.formData.surveyedBy != scope.currentSession.user.staffId;
                            if (survey.scorecardValues && survey.scorecardValues.length > 0) {
                                for (var s in survey.scorecardValues) {
                                    var id = survey.scorecardValues[s].id;
                                    var questionId = survey.scorecardValues[s].questionId;
                                    var responseId = survey.scorecardValues[s].responseId;
                                    var questionName = survey.scorecardValues[s].questionName;
                                    var answerName = survey.scorecardValues[s].answerName;
                                    var value = survey.scorecardValues[s].value;
                                    for (var q in scope.questionDatas) {
                                        if (questionId === scope.questionDatas[q].id) {
                                            for (var r in scope.questionDatas[q].responseDatas) {
                                                if (responseId === scope.questionDatas[q].responseDatas[r].id) {
                                                    scope.questionDatas[q].responseDatas[r].existingId = id;
                                                    scope.questionDatas[q].responseDatas[r].responseId = responseId;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            scope.takeNewSurvey();
                        }
                    } else {
                        scope.takeNewSurvey();
                    }
                });
            };

            function getSurveyTemplate() {
                resourceFactory.surveyTemplateResource.get({}, function (data) {
                    scope.surveyEntityTypes = data.surveyEntityTypes;
                    for (var i in scope.surveyEntityTypes) {
                        if (scope.surveyEntityTypes[i].value === scope.entityType.toUpperCase()) {
                            scope.isValidEntityType = true;
                            scope.entityTypeId = scope.surveyEntityTypes[i].id;
                            scope.displaySurveysList();
                            break;
                        }
                    }
                });
            };
            scope.cancel = function () {
                scope.isDisplaySurveys = true;
            }

            scope.submit = function () {
                scope.formData.surveyId = scope.surveyId;
                scope.formData.entityId = scope.entityId;
                if (!_.isUndefined(scope.formData.scorecardValues)) {
                    scope.formData.scorecardValues = [];
                }
                if (scope.questionDatas && scope.questionDatas.length > 0) {
                    for (var i in scope.questionDatas) {
                        if (scope.questionDatas[i].responseDatas) {
                            for (var j in scope.questionDatas[i].responseDatas) {
                                if (scope.questionDatas[i].responseDatas[j].responseId && scope.questionDatas[i].responseDatas[j].responseId > 0) {
                                    if (_.isUndefined(scope.formData.scorecardValues)) {
                                        scope.formData.scorecardValues = [];
                                    }
                                    var scorecardValue = {};
                                    if(scope.questionDatas[i].responseDatas[j].existingId){
                                        scorecardValue.id = scope.questionDatas[i].responseDatas[j].existingId;
                                    }
                                    scorecardValue.questionId = scope.questionDatas[i].id;
                                    scorecardValue.responseId = scope.questionDatas[i].responseDatas[j].responseId;
                                    scorecardValue.value = scope.questionDatas[i].responseDatas[j].value;
                                    scope.formData.scorecardValues.push(scorecardValue);
                                }
                            }
                        }
                    }
                }
                if(scope.formData.id){
                    resourceFactory.takeSurveysResource.update({
                        entityType: scope.entityTypeId,
                        entityId: scope.entityId
                    }, scope.formData, function (data) {
                        scope.activityDone();
                        scope.displaySurveysList();
                    });
                }else{
                    resourceFactory.takeSurveysResource.post({
                        entityType: scope.entityTypeId,
                        entityId: scope.entityId
                    }, scope.formData, function (data) {
                        scope.activityDone();
                        scope.displaySurveysList();
                    });
                }
            }

            scope.changeResponse = function (questionIndex, responseIndex) {
                for(var i in scope.questionDatas[questionIndex].responseDatas){
                    if(responseIndex != i){
                        if(scope.questionDatas[questionIndex].responseDatas[i].responseId){
                            delete scope.questionDatas[questionIndex].responseDatas[i].responseId;
                        }
                    }
                }
            };

            scope.doPreTaskActionStep = function(actionName){
                if(actionName === 'activitycomplete'){
                    if(isSurveyCompleted()){
                        scope.doActionAndRefresh(actionName);
                    }else{
                        scope.setTaskActionExecutionError("lable.error.activity.survey.not.completed");
                    }
                }else{
                    scope.doActionAndRefresh(actionName);
                }
            };

            function isSurveyCompleted(){
                var surveyCompleted   = true;
                if (_.isUndefined(scope.surveys) || scope.surveys.length<1){
                    surveyCompleted=false;
                }
                return surveyCompleted;
            };

            scope.checkSurveyedBy = function(){
                if(scope.formData.coSurveyedBy){
                    if(scope.formData.coSurveyedBy == scope.formData.surveyedBy){
                        scope.formData.coSurveyedBy = undefined;
                    }
                }
            };

            scope.checkCoSurveyedBy = function(){
                if(scope.formData.surveyedBy){
                    if(scope.formData.surveyedBy == scope.formData.coSurveyedBy){
                        scope.formData.surveyedBy = undefined;
                    }
                }
            };

            scope.updateSurveyedBy = function() {
                if (!scope.isSurveyForOthers && scope.currentSession.user.staffId) {
                    scope.formData.surveyedBy = scope.currentSession.user.staffId;
                } else {
                    scope.formData.surveyedBy = null;
                }
            };
        }
    });
    mifosX.ng.application.controller('surveyActivityController', ['$controller','$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'dateFilter', mifosX.controllers.surveyActivityController]).run(function ($log) {
        $log.info("surveyActivityController initialized");
    });
}(mifosX.controllers || {}));