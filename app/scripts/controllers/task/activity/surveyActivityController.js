(function (module) {
    mifosX.controllers = _.extend(module, {
        surveyActivityController: function ($controller, scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION,
            $upload, $rootScope, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', {
                $scope: scope
            }));
            scope.onFileSelect = function ($files) {
                scope.file = $files[0];
            };
            scope.formData = {};
            scope.restrictDate = new Date();
            scope.formData.surveyedOn = new Date();
            scope.showdetails = true;
            scope.entityTypeId = null;
            scope.isSurveyForOthers = false;
            scope.isSurveyDone = true;
            scope.showSurveyWeight = true;
            scope.showSurveyScore = true;

            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.workflow && scope.response.uiDisplayConfigurations.workflow.isHiddenField){
                scope.showSurveyWeight = !scope.response.uiDisplayConfigurations.workflow.isHiddenField.surveyWeight;
                scope.showSurveyScore = !scope.response.uiDisplayConfigurations.workflow.isHiddenField.surveyScore;
            }

            function initTask() {
                scope.formData = {};
                scope.restrictDate = new Date();
                scope.formData.surveyedOn = new Date();
                scope.showdetails = true;
                scope.entityTypeId = null;
                scope.isSurveyForOthers = false;
                scope.clientId = scope.taskconfig['clientId'];
                scope.surveyId = scope.taskconfig['surveyId'];
                if (scope.surveyId) {
                    resourceFactory.surveyResource.getBySurveyId({
                        surveyId: scope.surveyId,
                        entityType: 'clients',
                        entityId: scope.clientId
                    }, function (surveyData) {
                        scope.completeSurveyData = surveyData;
                        scope.surveyId = scope.completeSurveyData.id;
                        scope.entityType = surveyData.entityTypeValue;
                        if (scope.entityType === 'LOANAPPLICATIONS') {
                            scope.entityId = scope.taskconfig['loanApplicationId'];
                        } else if (scope.entityType === 'LOANS') {
                            scope.entityId = scope.taskconfig['loanId'];
                        } else if (scope.entityType === 'CLIENTS') {
                            scope.entityId = scope.taskconfig['clientId'];
                        } else if (scope.entityType === 'GROUPS') {
                            scope.entityId = scope.taskconfig['groupId'];
                        } else if (scope.entityType === 'VILLAGES') {
                            scope.entityId = scope.taskconfig['villageId'];
                        } else if (scope.entityType === 'OFFICES') {
                            scope.entityId = scope.taskconfig['officeId'];
                        }
                        scope.surveyData = surveyData;
                        getSurveyTemplate();
                        scope.componentDatas = surveyData.componentDatas;
                        scope.questionDatas = surveyData.questionDatas;
                        scope.populateData();
                    });
                }
            };

            scope.populateData = function () {
                scope.idToQuestionMap = {};
                scope.keyToComponentMap = {};
                scope.idToComponentMap = {};
                scope.componentDatas.forEach(function (component) {
                    component.isEnabled = !component.showOnCondition;
                    component.questionList = [];
                    scope.idToComponentMap[component.id] = component;
                    scope.keyToComponentMap[component.key] = component;
                });
                scope.questionDatas.forEach(function (question) {
                    question.finalScore = 0;
                    question.isEnabled = !question.showOnCondition;
                    if (question.otherResponseEnabled) {
                        question.responseDatas.push({
                            id: -1,
                            text: "Others",
                            value: 0
                        });
                    }
                    scope.idToQuestionMap[question.id] = question;
                    var myComponent = scope.keyToComponentMap[question.componentKey];
                    if (myComponent != undefined) {
                        myComponent.questionList.push(question);
                    }
                });
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
            scope.toggleDetailsView = function () {
                scope.showdetails = !scope.showdetails;
            };
            scope.isDisplaySurveys = true;
            scope.displaySurveysList = function () {
                scope.isDisplaySurveys = true;
                resourceFactory.takeSurveysResource.getAll({
                    entityType: scope.entityTypeId,
                    entityId: scope.entityId
                }, function (surveys) {
                    scope.surveys = [];
                    if (surveys && surveys.length > 0) {
                        for (var i in surveys) {
                            if (scope.surveyId == surveys[i].surveyId) {
                                scope.surveys.push(surveys[i]);
                            }
                        }
                        if (scope.surveys && scope.surveys.length > 0) {
                            var survey = scope.surveys[0];
                            scope.formData.id = survey.id;
                            scope.formData.surveyedBy = survey.surveyedBy;
                            if (survey.coSurveyedBy) {
                                scope.formData.coSurveyedBy = survey.coSurveyedBy;
                            }
                            scope.formData.surveyedOn = new Date(survey.surveyedOn);
                            scope.isSurveyForOthers = scope.formData.surveyedBy != scope.currentSession.user.staffId;
                            if (survey.scorecardValues && survey.scorecardValues.length > 0) {
                                for (var s in survey.scorecardValues) {
                                    var id = survey.scorecardValues[s].id;
                                    var questionId = survey.scorecardValues[s].questionId;
                                    var responseId = survey.scorecardValues[s].responseId;
                                    var responseJson = survey.scorecardValues[s].responseJson;
                                    var questionName = survey.scorecardValues[s].questionName;
                                    var answerName = survey.scorecardValues[s].answerName;
                                    var value = survey.scorecardValues[s].value;
                                    for (var q in scope.questionDatas) {
                                        if (questionId === scope.questionDatas[q].id) {
                                            for (var r in scope.questionDatas[q].responseDatas) {
                                                if (!_.isUndefined(responseId)) {
                                                    if (responseId === scope.questionDatas[q].responseDatas[r].id) {
                                                        scope.questionDatas[q].responseDatas[r].existingId = id;
                                                        scope.questionDatas[q].responseDatas[r].responseId = responseId;
                                                        scope.questionDatas[q].responseId = responseId;
                                                        scope.onResponseChange(scope.questionDatas[q]);
                                                    }
                                                } else if (!_.isUndefined(responseJson)) {
                                                    var responses = responseJson.responses;
                                                    var index = responseJson.responses.indexOf(scope.questionDatas[q].responseDatas[r].id);
                                                    if (index > -1) {
                                                        scope.questionDatas[q].responseDatas[r].existingId = id;
                                                        scope.questionDatas[q].responseDatas[r].responseId = responseId;
                                                        scope.questionDatas[q].responseId = responseId;
                                                        scope.questionDatas[q].responseDatas[r].isChecked = true;
                                                        scope.onCheckboxResponseChange(scope.questionDatas[q], scope.questionDatas[q].responseDatas[r]);
                                                    }
                                                }

                                            }
                                        }
                                    }
                                }
                            }
                            /**New Design Start*/
                            var displaySurveyDatas = [];
                            if (survey && survey.surveyTakenComponentDatas) {
                                for (var i in survey.surveyTakenComponentDatas) {
                                    var componentData = survey.surveyTakenComponentDatas[i].componentData;
                                    componentData.actualScore = survey.surveyTakenComponentDatas[i].actualScore;
                                    componentData.maxScore = survey.surveyTakenComponentDatas[i].maxScore;
                                    componentData.isComponentData = true;
                                    componentData.noOfQuestions = 0;
                                    displaySurveyDatas.push(componentData);
                                    if (survey.surveyTakenComponentDatas[i].scorecardValues) {
                                        var slNo = 0;
                                        for (var j in survey.surveyTakenComponentDatas[i].scorecardValues) {
                                            var scorecardData = survey.surveyTakenComponentDatas[i].scorecardValues[j];
                                            if (componentData.key === scorecardData.questionData.componentKey) {
                                                componentData.noOfQuestions += 1;
                                                slNo = parseInt(slNo) + 1;
                                                scorecardData.slNo = slNo;
                                                scorecardData.isComponentData = false;
                                                displaySurveyDatas.push(scorecardData);
                                            }
                                        }
                                    }
                                }
                                scope.displaySurveyDatas = displaySurveyDatas || [];
                            }
                            /**************/
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
                scope.formData.scorecardValues = [];
                var responseCount = 0;
                var enabledQuestionCount = 0;
                scope.questionDatas.forEach(function (questionData) {
                    var componentData = scope.keyToComponentMap[questionData.componentKey];
                    if (componentData.isEnabled && questionData.isEnabled) {
                        if (questionData.responseId || (questionData.selectedResponses != undefined && questionData.selectedResponses.length > 0)) {
                            responseCount = responseCount + 1;
                            enabledQuestionCount = enabledQuestionCount + 1;
                            var scorecardValue = {};
                            scorecardValue.questionId = questionData.id;

                            if (questionData.questionType.value == 'single_select') {
                                scorecardValue.responseId = questionData.responseId;
                                if (questionData.enableOtherTextBox && questionData.otherResponse) {
                                    scorecardValue.responseJson = {};
                                    scorecardValue.responseJson.other = questionData.otherResponse;
                                }
                            } else if (questionData.questionType.value == 'multi_select') {
                                scorecardValue.responseJson = {};
                                scorecardValue.responseJson.responses = questionData.selectedResponses;
                                if (questionData.enableOtherTextBox && questionData.otherResponse) {
                                    scorecardValue.responseJson.other = questionData.otherResponse;
                                }
                            }
                            scorecardValue.value = questionData.finalScore;
                            scope.formData.scorecardValues.push(scorecardValue);
                        }
                    }
                });
                if ((scope.questionDatas.length > 0 && responseCount < enabledQuestionCount) || (scope.questionDatas.length != responseCount)) {
                    scope.isSurveyDone = false;
                    return false;
                } else {
                    scope.isSurveyDone = true;
                }

                resourceFactory.takeSurveysResource.post({
                    entityType: scope.entityTypeId,
                    entityId: scope.entityId
                }, scope.formData, function (data) {
                    scope.activityDone();
                    initTask();
                });

            };

            scope.onCheckboxResponseChange = function (questionData, responseData) {
                var selectedResponses = [];
                var unselectedResponses = [];

                if (questionData.selectedResponses == undefined) {
                    questionData.selectedResponses = [];
                }
                if (responseData.isChecked) {
                    if (responseData.id == -1) {
                        questionData.enableOtherTextBox = true;
                    }
                    questionData.selectedResponses.push(responseData.id);
                } else {
                    if (responseData.id == -1) {
                        questionData.enableOtherTextBox = false;
                    }
                    var index = questionData.selectedResponses.indexOf(responseData.id);
                    questionData.selectedResponses.splice(index, 1);
                }
                var score = 0;
                questionData.responseDatas.forEach(function (tmpResponse) {
                    if (questionData.selectedResponses.indexOf(tmpResponse.id) != -1) {
                        score = score + tmpResponse.value;
                        selectedResponses.push(tmpResponse);
                    } else {
                        unselectedResponses.push(tmpResponse);
                    }

                });
                questionData.finalScore = score;

                refreshComponentsAndQuestions(unselectedResponses, false);
                refreshComponentsAndQuestions(selectedResponses, true);

            };

            var refreshComponentsAndQuestions = function (responses, makeComponentsAndQuestionsEnable) {
                responses.forEach(function (responseData) {
                    if (responseData.enableItemsOnSelect) {
                        if (responseData.enableItemsOnSelect.components) {
                            responseData.enableItemsOnSelect.components.forEach(function (componentId) {

                                scope.idToComponentMap[componentId].isEnabled = makeComponentsAndQuestionsEnable;
                            });
                        }
                        if (responseData.enableItemsOnSelect.questions) {
                            responseData.enableItemsOnSelect.questions.forEach(function (questionId) {
                                scope.idToQuestionMap[questionId].isEnabled = makeComponentsAndQuestionsEnable;
                            });
                        }
                    }
                });

            };
            scope.onResponseChange = function (questionData) {
                var selectedResponses = [];
                var unselectedResponses = [];
                if (questionData.responseId == -1) {
                    questionData.enableOtherTextBox = true;
                } else {
                    questionData.enableOtherTextBox = false;
                }
                questionData.responseDatas.forEach(function (responseData) {
                    if (questionData.responseId == responseData.id) {
                        questionData.finalScore = responseData.value;
                        selectedResponses.push(responseData);
                    } else {
                        unselectedResponses.push(responseData);
                    }
                });
                refreshComponentsAndQuestions(unselectedResponses, false);
                refreshComponentsAndQuestions(selectedResponses, true);

            };

            scope.doPreTaskActionStep = function (actionName) {
                if (actionName === 'activitycomplete') {
                    if (isSurveyCompleted()) {
                        scope.doActionAndRefresh(actionName);
                    } else {
                        scope.setTaskActionExecutionError("lable.error.activity.survey.not.completed");
                    }
                } else {
                    scope.doActionAndRefresh(actionName);
                }
            };

            function isSurveyCompleted() {
                var surveyCompleted = true;
                if (_.isUndefined(scope.surveys) || scope.surveys.length < 1) {
                    surveyCompleted = false;
                }
                return surveyCompleted;
            };

            scope.checkSurveyedBy = function () {
                if (scope.formData.coSurveyedBy) {
                    if (scope.formData.coSurveyedBy == scope.formData.surveyedBy) {
                        scope.formData.coSurveyedBy = undefined;
                    }
                }
            };

            scope.checkCoSurveyedBy = function () {
                if (scope.formData.surveyedBy) {
                    if (scope.formData.surveyedBy == scope.formData.coSurveyedBy) {
                        scope.formData.surveyedBy = undefined;
                    }
                }
            };

            scope.updateSurveyedBy = function () {
                if (!scope.isSurveyForOthers && scope.currentSession.user.staffId) {
                    scope.formData.surveyedBy = scope.currentSession.user.staffId;
                } else {
                    scope.formData.surveyedBy = null;
                }
            };
        }
    });
    mifosX.ng.application.controller('surveyActivityController', ['$controller', '$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'dateFilter', mifosX.controllers.surveyActivityController]).run(function ($log) {
        $log.info("surveyActivityController initialized");
    });
}(mifosX.controllers || {}));