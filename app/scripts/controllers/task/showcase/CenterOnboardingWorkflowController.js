(function(module) {
    mifosX.controllers = _.extend(module, {
        CenterOnboardingWorkflowController: function(scope, resourceFactory, routeParams, $rootScope) {
            scope.centerId = routeParams.centerId;

            function init() {

                resourceFactory.centerResource.get({
                    centerId: scope.centerId,
                    associations: 'all'
                }, function(data) {
                    scope.centerData = data;
                    fetchTask();
                });
            }

            function fetchTask() {
                resourceFactory.entityTaskExecutionResource.get({
                    entityType: "center",
                    entityId: scope.centerId
                }, function(data) {
                    scope.taskData = data;
                });
            }

            init();
        }
    });
    mifosX.ng.application.controller('CenterOnboardingWorkflowController', ['$scope', 'ResourceFactory', '$routeParams', '$rootScope', mifosX.controllers.CenterOnboardingWorkflowController]).run(function($log) {
        $log.info("CenterOnboardingWorkflowController initialized");
    });
}(mifosX.controllers || {}));