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
                resourceFactory.entityEventTaskExecutionResource.get({
                    entityType: "eod_process",
                    eventType: eventType,
                    entityId: scope.eodProcessId
                }, function (data) {
                    scope.taskData = data;
                });
            }
            init();
        }
});
mifosX.ng.application.controller('EodOnBoardingWorkflowController', ['$scope', 'ResourceFactory', '$routeParams', mifosX.controllers.EodOnBoardingWorkflowController]).run(function ($log) {
    $log.info("EodOnBoardingWorkflowController initialized");
});
}(mifosX.controllers || {}));
