(function (module) {
    mifosX.controllers = _.extend(module, {
        ListSurveyController: function (scope, resourceFactory, location, routeParams, localStorageService,$modal) {

            scope.clientId = routeParams.clientId;
            scope.loanApplicationReferenceId = routeParams.loanApplicationReferenceId;
            scope.formData = {};
            scope.surveyData = {};
            scope.survey = {};

            resourceFactory.surveyResource.get({}, function (data) {
                scope.surveys = data;
            });

            scope.surveySelected = function (surveyData) {
                if(surveyData) {
                    scope.surveyData = surveyData;

                    function groupBy( array , f )
                    {
                        var groups = {};
                        array.forEach( function( o )
                        {
                            var group = JSON.stringify( f(o) );
                            groups[group] = groups[group] || [];
                            groups[group].push( o );
                        });
                        return Object.keys(groups).map( function( group )
                        {
                            return groups[group];
                        })
                    }

                    var result = groupBy(scope.surveyData.questionDatas, function(item)
                    {
                        return [item.componentKey];
                    });

                    scope.componentGroups = result;
                }

            }

            scope.submit = function () {
                this.formData.userId = localStorageService.getFromLocalStorage('userData').userId;
                this.formData.clientId = parseInt(routeParams.clientId);
                this.formData.createdOn = new Date().getTime();
                this.formData.scorecardValues = [];

                for(i=0; i < scope.surveyData.questionDatas.length; i++){
                    if(scope.surveyData.questionDatas[i].answer) {
                        var tmp = {};
                        tmp.questionId = scope.surveyData.questionDatas[i].id;
                        tmp.responseId = scope.surveyData.questionDatas[i].answer.id
                        tmp.value = scope.surveyData.questionDatas[i].answer.value
                        this.formData.scorecardValues.push(tmp);
                    }
                }
                resourceFactory.surveyResourceScore.save({surveyId: scope.surveyData.id}, this.formData, function (data) {
                    location.path('/viewclient/' + scope.clientId + '/viewloanapplicationreference/' + scope.loanApplicationReferenceId + '/viewscorecards/' + scope.surveyData.id);
                });
            };

            scope.cancel = function () {
                if (scope.clientId) {
                    location.path('/viewclient/' + scope.clientId);
                } else {
                    location.path('/clients');
                }
            }

        }
    });
    mifosX.ng.application.controller('ListSurveyController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'localStorageService','$modal', mifosX.controllers.ListSurveyController]).run(function ($log) {
        $log.info("ListSurveyController initialized");
    });
}(mifosX.controllers || {}));
