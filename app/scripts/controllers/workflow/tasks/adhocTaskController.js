(function (module) {
    mifosX.controllers = _.extend(module, {
        adhocTaskController: function (scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION, $upload, $rootScope, dateFilter) {

            function initTask(){
                scope.title = scope.stepconfig['title'];
                scope.body = scope.stepconfig['body'];
            };

            initTask();

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
    mifosX.ng.application.controller('adhocTaskController', ['$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope' ,'dateFilter', mifosX.controllers.adhocTaskController]).run(function ($log) {
        $log.info("adhocTaskController initialized");
    });
}(mifosX.controllers || {}));
