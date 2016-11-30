(function (module) {
    mifosX.controllers = _.extend(module, {
        surveyTaskController: function (scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION, $upload, $rootScope) {
            scope.onFileSelect = function ($files) {
                scope.file = $files[0];
            };
            scope.formData = {};
            scope.entityTypeId = null;
            scope.entityType = 'clients';
            function initTask(){
                scope.clientId = scope.stepconfig['clientId'];
                scope.entityId = scope.clientId;
                scope.surveyId = scope.stepconfig['surveyId'];
            };
            initTask();
            scope.isDisplaySurveys = true;
            scope.displaySurveysList = function(){
                scope.isDisplaySurveys = true;
                resourceFactory.takeSurveysResource.getAll({entityType : scope.entityTypeId,entityId:scope.entityId}, function (surveys) {
                    scope.surveys = surveys;
                    if(surveys && surveys.length > 0){
                        scope.$emit("taskDone",{});
                    }
                });
            };
            resourceFactory.surveyTemplateResource.get({}, function (data) {
                scope.surveyEntityTypes = data.surveyEntityTypes;
                for(var i in scope.surveyEntityTypes){
                    if(scope.surveyEntityTypes[i].value === scope.entityType.toUpperCase()){
                        scope.isValidEntityType = true;
                        scope.entityTypeId = scope.surveyEntityTypes[i].id;
                        scope.displaySurveysList();
                        break;
                    }
                }
            });

            scope.takeNewSurvey = function(){
                scope.isDisplaySurveys = false;
                if(_.isUndefined(scope.loanOfficers)){
                    resourceFactory.employeeResource.getAllEmployees({loanOfficersOnly: true}, function (loanOfficers) {
                        scope.loanOfficers = loanOfficers.pageItems;
                    });
                }
                if(_.isUndefined(scope.surveyData)) {
                    resourceFactory.surveyResource.getBySurveyId({surveyId: scope.surveyId}, function (surveyData) {
                        scope.surveyData = surveyData;
                        scope.questionDatas = surveyData.questionDatas;
                    });
                }
            }

            scope.cancel = function(){
                scope.isDisplaySurveys = true;
            }

            scope.submit = function () {
                scope.formData.surveyId = scope.surveyId;
                scope.formData.entityId = scope.entityId;
                if(!_.isUndefined(scope.formData.scorecardValues)){
                    scope.formData.scorecardValues = [];
                }
                if(scope.questionDatas && scope.questionDatas.length > 0){
                    for(var i in scope.questionDatas){
                        if(scope.questionDatas[i].responseDatas){
                            for(var j in scope.questionDatas[i].responseDatas){
                                if(scope.questionDatas[i].responseDatas[j].responseId && scope.questionDatas[i].responseDatas[j].responseId > 0){
                                    if(_.isUndefined(scope.formData.scorecardValues)){
                                        scope.formData.scorecardValues = [];
                                    }
                                    var scorecardValue = {};
                                    scorecardValue.questionId  = scope.questionDatas[i].id;
                                    scorecardValue.responseId  = scope.questionDatas[i].responseDatas[j].responseId;
                                    scorecardValue.value  = scope.questionDatas[i].responseDatas[j].value;
                                    scope.formData.scorecardValues.push(scorecardValue);
                                }
                            }
                        }
                    }
                }
                resourceFactory.takeSurveysResource.post({entityType: scope.entityTypeId,entityId: scope.entityId},scope.formData, function (data) {
                    scope.displaySurveysList();
                });
            }
        }
    });
    mifosX.ng.application.controller('surveyTaskController', ['$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.surveyTaskController]).run(function ($log) {
        $log.info("surveyTaskController initialized");
    });
}(mifosX.controllers || {}));