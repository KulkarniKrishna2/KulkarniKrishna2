(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewTaskController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            scope.taskId = routeParams.taskId;
            scope.taskData = {};
            scope.isWorkflowTask = false;
            scope.isSingleTask = false;

            function getTaskId(){
                if(routeParams.taskId!=undefined){
                    return routeParams.taskId;
                }else{
                    return scope.commonConfig.taskData.id;
                }
            }

            scope.isEmbedded = function(){
                if(scope.commonConfig.taskData!=undefined){
                    return scope.commonConfig.taskData.embedded;
                }else{
                    return false;
                }
            };


            function fetchLoanData() {
                resourceFactory.LoanAccountResource.getLoanAccountDetails({
                    loanId: scope.loanId,
                    exclude: 'guarantors'
                }, function (data) {
                    scope.loanData = data;
                });
            };

            function init() {
                resourceFactory.taskExecutionTemplateResource.get({taskId: getTaskId()}, function (data) {
                    scope.taskData = data;
                    if (scope.taskData != undefined) {
                        if (scope.taskData.taskType.id == 1) {
                            scope.isWorkflowTask = true;
                        } else if (scope.taskData.taskType.id == 2) {
                            scope.isSingleTask = true;
                        }
                        if (scope.taskData.configValues != undefined) {
                            scope.clientId = scope.taskData.configValues.clientId;
                            scope.loanApplicationId = scope.taskData.configValues.loanApplicationId;
                            scope.loanApplicationCoApplicantId = scope.taskData.configValues.loanApplicationCoApplicantId;
                            scope.loanApplicationReferenceId = scope.loanApplicationId;
                            scope.loanId = scope.taskData.configValues.loanId;
                        }
                    }
                    if(scope.loanId!=undefined){
                        fetchLoanData();
                    }
                    if(scope.loanApplicationId){
                        resourceFactory.loanApplicationReferencesResource.getByLoanAppId({
                            loanApplicationReferenceId: scope.loanApplicationId},
                            function (data) {
                            scope.loanApplicationData = data;
                            if(scope.loanApplicationCoApplicantId){
                                resourceFactory.loanCoApplicantsResource.get({loanApplicationReferenceId: scope.loanApplicationId,
                                    coApplicantId: scope.loanApplicationCoApplicantId}, function (data) {
                                    scope.loanApplicationCoApplicantData = data;
                                });
                            }
                        });


                    };
                });
            }

            init();
        }
    });
    mifosX.ng.application.controller('ViewTaskController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.ViewTaskController]).run(function ($log) {
        $log.info("ViewTaskController initialized");
    });
}(mifosX.controllers || {}));