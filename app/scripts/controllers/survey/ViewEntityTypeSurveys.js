(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewEntityTypeSurveys: function (scope, routeParams, resourceFactory, location, $modal, anchorScroll) {
            scope.entityType = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            scope.isValidEntityType = false;
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
                    resourceFactory.takeSurveysResource.getAll({entityType : scope.entityTypeId,entityId:scope.entityId}, function (surveys) {
                        scope.surveys = surveys;
                    });
                }
            });

            scope.viewSurveySummaryDetails = function(survey,type){
                if(_.isUndefined(survey.summaryDetails)){
                    var summaryDetails = [];
                    var displaySurveyDatas = [];
                    if(survey && survey.surveyTakenComponentDatas){
                        for(var i in survey.surveyTakenComponentDatas){
                            var componentData = survey.surveyTakenComponentDatas[i].componentData;
                            componentData.actualScore = survey.surveyTakenComponentDatas[i].actualScore;
                            componentData.maxScore = survey.surveyTakenComponentDatas[i].maxScore;
                            componentData.isComponentData = true;
                            componentData.noOfQuestions = 0;
                            displaySurveyDatas.push(componentData);
                            if(survey.surveyTakenComponentDatas[i].scorecardValues){
                                var slNo = 0;
                                for(var j in survey.surveyTakenComponentDatas[i].scorecardValues){
                                    var scorecardData = survey.surveyTakenComponentDatas[i].scorecardValues[j];
                                    if(componentData.key === scorecardData.questionData.componentKey){
                                        componentData.noOfQuestions += 1;
                                        slNo = parseInt(slNo)+1;
                                        scorecardData.slNo = slNo;
                                        scorecardData.isComponentData = false;
                                        displaySurveyDatas.push(scorecardData);
                                    }
                                }
                            }
                            summaryDetails.push(componentData);
                        }
                    }
                    survey.summaryDetails = summaryDetails || [];
                    survey.displaySurveyDatas = displaySurveyDatas || [];
                }
                if(type == 'isShowShortSummary'){
                    survey.isShowShortSummary = true;
                    survey.isShowDetailSummary = false;
                    //scope.scrollto('#showShortSummaryId'+index);
                }else{
                    survey.isShowShortSummary = false;
                    survey.isShowDetailSummary = true;
                    //scope.scrollto('#showDetailSummaryId'+index);
                }
            };

            scope.scrollto = function (link){
                console.log(link);
                //location.hash(link);
                //anchorScroll();
                //var currentElement = angular.element('#'+link);
                //currentElement.scrollIntoView();
                var currentElement = document.querySelector(link);
                currentElement.scrollIntoView({block: 'start',  behaviour: 'smooth'});
                //currentElement.scrollBy(0, -1);
            };
        }
    });
    mifosX.ng.application.controller('ViewEntityTypeSurveys', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal','$anchorScroll', mifosX.controllers.ViewEntityTypeSurveys]).run(function ($log) {
        $log.info("ViewEntityTypeSurveys initialized");
    });
}(mifosX.controllers || {}));