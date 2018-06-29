/**
 * Created by FinTech on 25-01-2018.
 */
(function (module) {
    mifosX.controllers = _.extend(module, {
        SurveySummaryDetailsController: function (scope, routeParams, resourceFactory) {
        
            function getSurveySummaryDetails(){
                if(_.isUndefined(scope.survey.summaryDetails)){
                    scope.survey.summaryDetails = [];
                    var survey = scope.survey;
                    resourceFactory.surveyResource.getBySurveyId({surveyId: survey.surveyId}, function (surveyData) {
                        if(surveyData.componentDatas){
                            var componentData = surveyData.componentDatas || [];
                            if(surveyData.questionDatas){
                                for(var i in componentData){
                                    var componentWeightage = componentData[i].weightage;
                                    var noOfQuestions = 0;
                                    var maxScore = 0;
                                    //var maxQuestionsScore = 0;
                                    var actualScore = 0;      
                                    var totalQuestionsActualScore = 0;                       
                                    for(var j in surveyData.questionDatas){
                                        if(componentData[i].key === surveyData.questionDatas[j].componentKey){
                                            noOfQuestions = noOfQuestions+1;
                                            var questionWeightage = surveyData.questionDatas[j].weightage;
                                            var maxResponseValue = surveyData.questionDatas[j].maxResponseValue;
                                            /*var totalQuestionResponsesScore = 0;
                                            if(surveyData.questionDatas[j].responseDatas){
                                                for(var k in surveyData.questionDatas[j].responseDatas){
                                                    var responseData = surveyData.questionDatas[j].responseDatas[k];
                                                    totalQuestionResponsesScore = (totalQuestionResponsesScore + responseData.value);
                                                }
                                                maxQuestionsScore = maxQuestionsScore + (questionWeightage*totalQuestionResponsesScore);
                                            }*/
                                            maxScore = maxScore + (componentWeightage * questionWeightage * maxResponseValue);
                                            if(survey.scorecardValues){
                                                var totalQuestionActualResponsesScore = 0;
                                                for(var a in survey.scorecardValues){
                                                    if(surveyData.questionDatas[j].id === survey.scorecardValues[a].questionId){
                                                        totalQuestionActualResponsesScore = (totalQuestionActualResponsesScore + survey.scorecardValues[a].value);
                                                    }
                                                }
                                                actualScore = actualScore + (componentWeightage * questionWeightage * totalQuestionActualResponsesScore);
                                            }
                                        }
                                    }
                                    //maxScore = (componentWeightage*maxQuestionsScore);
                                    //actualScore = (componentWeightage*totalQuestionsActualScore);
                                    componentData[i].noOfQuestions = noOfQuestions;
                                    componentData[i].maxScore = maxScore;
                                    componentData[i].actualScore = actualScore;
                                }
                            }
                            scope.survey.summaryDetails = componentData || [];
                           // console.log(JSON.stringify(scope.survey.summaryDetails));
                        }                
                    });
                }
            };

            getSurveySummaryDetails();

            scope.cancel = function () {
                scope.isViewSurveySummaryDetails = false;
                scope.modalInstance.dismiss('surveySummaryDetailsCancel');
            };
        }
    });

    mifosX.ng.application.controller('SurveySummaryDetailsController', ['$scope', '$routeParams', 'ResourceFactory', mifosX.controllers.SurveySummaryDetailsController]).run(function ($log) {
        $log.info("SurveySummaryDetailsController initialized");
    });
}(mifosX.controllers || {}));