(function (module) {
    mifosX.controllers = _.extend(module, {
        TaskListController: function (scope, resourceFactory, location) {
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
            scope.configValue = function(task, config ){
                    if(task != undefined && task.configValues!=undefined){
                        return task.configValues[config];
                    }
                    return undefined;
            };
        }
    });
    mifosX.ng.application.controller('TaskListController', ['$scope', 'ResourceFactory','$location', mifosX.controllers.TaskListController]).run(function ($log) {
        $log.info("TaskListController initialized");
    });
}(mifosX.controllers || {}));