(function (module) {
    mifosX.controllers = _.extend(module, {
        EodOnBoardingWorkflowController: function (scope, resourceFactory, routeParams) {
            var eventType = routeParams.eventType;
            scope.eodProcessId = routeParams.eodprocessId;

            function init(){
                fetchEodDetails();
                fetchTask();
            }
            function fetchEodDetails(){
                resourceFactory.eodProcessResource.get({eodProcessId:scope.eodProcessId},
                    function(data){
                        scope.eodData = data;
                    });
            }
            function fetchTask() {
                resourceFactory.entityTaskExecutionResource.get({entityType: "eod_process", entityId:scope.eodProcessId}, function (taskData) {
                    scope.taskData = taskData;
                });
            }
            init();
        }
});
mifosX.ng.application.controller('EodOnBoardingWorkflowController', ['$scope', 'ResourceFactory', '$routeParams', mifosX.controllers.EodOnBoardingWorkflowController]).run(function ($log) {
    $log.info("EodOnBoardingWorkflowController initialized");
});
}(mifosX.controllers || {}));
