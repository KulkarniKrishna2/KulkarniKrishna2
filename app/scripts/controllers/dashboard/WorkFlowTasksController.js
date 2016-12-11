(function (module) {
    mifosX.controllers = _.extend(module, {
        WorkFlowTasksController: function (scope, resourceFactory, location) {
            scope.loggedInUserId = scope.currentSession.user.userId;

            if (!scope.searchCriteria.workFlowT) {
                scope.searchCriteria.workFlowT = null;
                scope.saveSC();
            }
            scope.filterText = scope.searchCriteria.workFlowT;

            scope.onFilter = function () {
                scope.searchCriteria.workFlowT = scope.filterText;
                scope.saveSC();
            };

            scope.getWorkFlowTasks = function(filterby){
                resourceFactory.workFlowTasksResource.get({filterby : filterby}, function (data) {
                    scope.workFlowTasks = data;
                });
            }
            scope.getWorkFlowTasks('all');
            scope.moveToTask = function (workFlowTask) {
                location.path(workFlowTask.nextActionUrl);
            };
            scope.moveToWorkFlow = function (workFlowTask) {
                location.path('/viewtask/' + workFlowTask.parentTaskId);
            };
        }
    });
    mifosX.ng.application.controller('WorkFlowTasksController', ['$scope', 'ResourceFactory','$location', mifosX.controllers.WorkFlowTasksController]).run(function ($log) {
        $log.info("WorkFlowTasksController initialized");
    });
}(mifosX.controllers || {}));