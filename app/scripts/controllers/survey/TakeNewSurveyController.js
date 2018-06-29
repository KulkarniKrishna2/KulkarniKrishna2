(function (module) {
    mifosX.controllers = _.extend(module, {
        TakeNewSurveyController: function (scope, routeParams, resourceFactory, location) {
            scope.formData = {};
            scope.entityType = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            scope.isValidEntityType = false;
            var locationUrl = "/"+scope.entityType+"/"+scope.entityId+"/surveys";
            resourceFactory.surveyTemplateResource.get({}, function (data) {
                scope.surveyEntityTypes = data.surveyEntityTypes;
                for(var i in scope.surveyEntityTypes){
                    if(scope.surveyEntityTypes[i].value === scope.entityType.toUpperCase()){
                        scope.isValidEntityType = true;
                        scope.entityTypeId = scope.surveyEntityTypes[i].id;
                        if(scope.surveyEntityTypes[i].value === 'CLIENTS'){
                            scope.entityTypeName = 'label.anchor.clients';
                            scope.entityTypeUrl = 'clients';
                            scope.backUrl = "viewclient/"+scope.entityId;
                            resourceFactory.clientResource.get({clientId: scope.entityId}, function (data) {
                                scope.entityDisplayName = data.displayName;
                            });
                        }else if(scope.surveyEntityTypes[i].value === 'CENTERS'){
                            scope.entityTypeName = 'label.anchor.centers';
                            scope.entityTypeUrl = 'centers';
                            scope.backUrl = "viewcenter/"+scope.entityId;
                            resourceFactory.centerResource.get({centerId: scope.entityId}, function (data) {
                                scope.entityDisplayName = data.name;
                            });
                        }else if(scope.surveyEntityTypes[i].value === 'OFFICES'){
                            scope.entityTypeName = 'label.anchor.manageoffices';
                            scope.entityTypeUrl = 'offices';
                            scope.backUrl = "viewoffice/"+scope.entityId;
                            resourceFactory.officeResource.get({officeId: scope.entityId}, function (data) {
                                scope.entityDisplayName = data.name;
                            });
                        }else if(scope.surveyEntityTypes[i].value === 'STAFFS'){
                            scope.entityTypeName = 'label.anchor.manageemployees';
                            scope.entityTypeUrl = 'employees';
                            scope.backUrl = "viewemployee/"+scope.entityId;
                            resourceFactory.employeeResource.get({staffId: scope.entityId}, function (data) {
                                scope.entityDisplayName = data.displayName;
                            });
                        }
                        break;
                    }
                }
                if(scope.isValidEntityType){
                    resourceFactory.employeeResource.getAllEmployees({loanOfficersOnly: true}, function (loanOfficers) {
                        scope.loanOfficers = loanOfficers.pageItems;
                    });
                    resourceFactory.surveyResource.get({entityTypeId : scope.entityTypeId}, function (surveys) {
                        scope.surveys = surveys;
                    });
                }
            });

            scope.getSurveyDetails = function(surveyId){
                if(surveyId){
                    resourceFactory.surveyResource.getBySurveyId({surveyId: surveyId, entityType : scope.entityType, entityId: scope.entityId}, function (surveyData) {
                        scope.completeSurveyData = surveyData;
                        scope.surveyData = {};
                        scope.componentDatas = surveyData.componentDatas;
                        scope.questionDatas = surveyData.questionDatas;
                        scope.populateData();
                    });
                }
            };

            scope.populateData = function () {
                scope.idToQuestionMap={};
                scope.keyToComponentMap={};
                scope.idToComponentMap={};
                scope.componentDatas.forEach(function (component) {
                    component.isEnabled = !component.showOnCondition;
                    component.questionList = [];
                    scope.idToComponentMap[component.id] = component;
                    scope.keyToComponentMap[component.key] = component;
                });
                scope.questionDatas.forEach(function (question) {
                    question.finalScore = 0;
                    question.isEnabled = !question.showOnCondition;
                    if(question.otherResponseEnabled){
                        question.responseDatas.push({id:-1,text:"Others",value:0});
                    }
                    scope.idToQuestionMap[question.id] = question;
                    var myComponent = scope.keyToComponentMap[question.componentKey];
                    if(myComponent != undefined){
                        myComponent.questionList.push(question);
                    }
                });
            };

            scope.onCheckboxResponseChange = function(questionData, bool,responseData){
                var selectedResponses=[];
                var unselectedResponses=[];

                if(questionData.selectedResponses==undefined){
                  questionData.selectedResponses=[];
                }
                if(bool){
                    if(responseData.id ==-1){
                        questionData.enableOtherTextBox = true;
                    }
                  questionData.selectedResponses.push(responseData.id);
                }else{
                    if(responseData.id ==-1){
                        questionData.enableOtherTextBox = false;
                    }
                    var index = questionData.selectedResponses.indexOf(responseData.id);
                    questionData.selectedResponses.splice(index,1);
                }
                var score = 0;
                questionData.responseDatas.forEach(function (tmpResponse) {
                    if( questionData.selectedResponses.indexOf(tmpResponse.id)!=-1){
                        score = score + tmpResponse.value;
                        selectedResponses.push(tmpResponse);
                    }else{
                        unselectedResponses.push(tmpResponse);
                    }

                });
                questionData.finalScore = score;

                refreshComponentsAndQuestions(unselectedResponses,false);
                refreshComponentsAndQuestions(selectedResponses,true);

            };

            var refreshComponentsAndQuestions = function (responses, makeComponentsAndQuestionsEnable) {
                responses.forEach(function (responseData) {
                    if(responseData.enableItemsOnSelect){
                        if(responseData.enableItemsOnSelect.components) {
                            responseData.enableItemsOnSelect.components.forEach(function (componentId) {
                                scope.idToComponentMap[componentId].isEnabled = makeComponentsAndQuestionsEnable;
                            });
                        }
                        if(responseData.enableItemsOnSelect.questions) {
                            responseData.enableItemsOnSelect.questions.forEach(function (questionId) {
                                scope.idToQuestionMap[questionId].isEnabled = makeComponentsAndQuestionsEnable;
                            });
                        }
                    }
                });

            };
            scope.onResponseChange = function(questionData){
                var selectedResponses=[];
                var unselectedResponses=[];
                if(questionData.responseId == -1){
                    questionData.enableOtherTextBox = true;
                }else{
                    questionData.enableOtherTextBox = false;
                }
                questionData.responseDatas.forEach(function (responseData) {
                    if(questionData.responseId==responseData.id){
                        questionData.finalScore = responseData.value;
                        selectedResponses.push(responseData);
                    }else{
                        unselectedResponses.push(responseData);
                    }
                });
                refreshComponentsAndQuestions(unselectedResponses,false);
                refreshComponentsAndQuestions(selectedResponses,true);

            };

            scope.submit = function () {
                scope.formData.surveyId = scope.completeSurveyData.id;
                scope.formData.entityId = scope.entityId;
                scope.formData.scorecardValues = [];
                scope.questionDatas.forEach(function (questionData) {
                    var componentData = scope.keyToComponentMap[questionData.componentKey];
                    if(componentData.isEnabled && questionData.isEnabled) {
                        if (questionData.responseId || (questionData.selectedResponses != undefined && questionData.selectedResponses.length > 0)) {
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
                resourceFactory.takeSurveysResource.post({entityType: scope.entityTypeId,entityId: scope.entityId},scope.formData, function (data) {
                    location.path(locationUrl);
                });
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
        }
    });
    mifosX.ng.application.controller('TakeNewSurveyController', ['$scope', '$routeParams', 'ResourceFactory', '$location', mifosX.controllers.TakeNewSurveyController]).run(function ($log) {
        $log.info("TakeNewSurveyController initialized");
    });
}(mifosX.controllers || {}));