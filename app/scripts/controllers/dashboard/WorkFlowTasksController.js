(function (module) {
    mifosX.controllers = _.extend(module, {
        WorkFlowTasksController: function (scope, resourceFactory, location) {
            console.log(JSON.stringify(scope.currentSession));
            scope.loggedInUserId = scope.currentSession.user.userId;
            scope.getWorkFlowTasks = function(filterby){
                resourceFactory.workFlowTasksResource.get({filterby : filterby}, function (data) {
                    scope.workFlowTasks = data;
                });
            }
            scope.getWorkFlowTasks('all');
            scope.moveToNextStep = function (workFlowTask) {
                location.path(workFlowTask.nextActionUrl);
            };
        }
    });
    mifosX.ng.application.controller('WorkFlowTasksController', ['$scope', 'ResourceFactory','$location', mifosX.controllers.WorkFlowTasksController]).run(function ($log) {
        $log.info("WorkFlowTasksController initialized");
    });
}(mifosX.controllers || {}));