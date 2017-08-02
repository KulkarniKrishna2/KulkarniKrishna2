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
                    resourceFactory.surveyResource.getBySurveyId({surveyId: surveyId}, function (surveyData) {
                        scope.completeSurveyData = surveyData;
                        scope.surveyData = {};
                        scope.questionDatas = surveyData.questionDatas;
                    });
                }
            };

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