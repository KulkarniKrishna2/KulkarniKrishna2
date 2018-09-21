(function (module) {
    mifosX.controllers = _.extend(module, {
        DeceasedOnBoardingWorkflowController: function (scope, resourceFactory, routeParams) {
            scope.clientId = routeParams.clientId;
            scope.initiateWorkflow = function () {
                resourceFactory.deceasedDetailsWorkflowResource.save({ clientId: scope.clientId }, {},
                    function (data) {
                        scope.fetchTask();
                    });
            };
            scope.initiateWorkflow();
            scope.fetchTask = function () {
                resourceFactory.entityEventTaskExecutionResource.get({
                    entityType: "deceased_process",
                    entityId: scope.clientId
                }, function (data) {
                    if (data && data.id) {
                        scope.taskData = data;
                    }
                });
            }
            scope.fetchTask();
        }
    });
    mifosX.ng.application.controller('DeceasedOnBoardingWorkflowController', ['$scope', 'ResourceFactory', '$routeParams', mifosX.controllers.DeceasedOnBoardingWorkflowController]).run(function ($log) {
        $log.info("DeceasedOnBoardingWorkflowController initialized");
    });
}(mifosX.controllers || {}));
