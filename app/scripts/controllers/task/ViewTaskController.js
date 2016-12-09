(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewTaskController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {

            scope.taskId = routeParams.taskId;
            scope.taskData = {};
            scope.isWorkflowTask = false;
            scope.isSingleTask = false;
            function init(){
                resourceFactory.taskExecutionResource.get({taskId: scope.taskId}, function (data) {
                    scope.taskData = data;
                    if(scope.taskData != undefined){
                        if(scope.taskData.taskType.id == 1){
                            scope.isWorkflowTask = true;
                        }else if(scope.taskData.taskType.id == 2){
                            scope.isSingleTask = true;
                        }
                        if(scope.taskData.configValues != undefined) {
                            scope.clientId = scope.taskData.configValues.clientId;
                            scope.loanApplicationId = scope.taskData.configValues.loanApplicationId;
                        }
                    }
                });

            }

            init();
        }
    });
    mifosX.ng.application.controller('ViewTaskController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.ViewTaskController]).run(function ($log) {
        $log.info("ViewTaskController initialized");
    });
}(mifosX.controllers || {}));