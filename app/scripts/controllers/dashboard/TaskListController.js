(function (module) {
    mifosX.controllers = _.extend(module, {
        TaskListController: function (scope, resourceFactory, location, paginatorService) {
            scope.loggedInUserId = scope.currentSession.user.userId;
            scope.formData = {};
            scope.taskTypes = [{id: 'tab1', name: 'Assigned', status: 'assigned', icon:'icon-user'}, {id: 'tab2', name: 'Un-Assigned', status: 'unassigned', icon:'icon-user'}, {id: 'tab3', name: 'All', status: 'all', icon:'icon-user'}];
            scope.pageSize = 15;
            scope.childrenTaskConfigs = [];
            scope.filterBy = 'all';

            scope.getChildrenTaskConfigs = function () {
                scope.formData.childConfigId = null;
                resourceFactory.taskConfigResource.getTemplate({parentConfigId: scope.formData.parentConfigId}, function(data) {
                    scope.childrenTaskConfigs = data.taskConfigs;
                });
            };

            resourceFactory.taskConfigResource.getTemplate({}, function(data) {
                scope.parentTaskConfigs = data.taskConfigs;
                scope.offices = data.officeOptions;
            });

            if (!scope.searchCriteria.workFlowT) {
                scope.searchCriteria.workFlowT = null;
                scope.saveSC();
            }
            scope.filterText = scope.searchCriteria.workFlowT;

            scope.onFilter = function () {
                scope.searchCriteria.workFlowT = scope.filterText;
                scope.saveSC();
            };

            var fetchFunction = function (offset, limit) {
                var params = {};
                params.filterby = scope.selectedStatus;
                params.offset = offset;
                params.limit = limit;
                params.officeId = scope.formData.officeId;
                params.parentConfigId = scope.formData.parentConfigId;
                params.childConfigId = scope.formData.childConfigId;
                scope.formParams = params;

                resourceFactory.workFlowTasksResource.get(params, function(data) {
                    scope.workFlowTasks = data.pageItems;
                    scope.totalTasks = data.totalFilteredRecords;
                });
            };

            scope.getResultsPage = function (pageNumber) {
                scope.formParams.offset = ((pageNumber - 1) * scope.pageSize);
                scope.formParams.limit = scope.pageSize;
                resourceFactory.workFlowTasksResource.get(scope.formParams, function (data) {
                    scope.workFlowTasks = data.pageItems;
                });
            };

            scope.getWorkFlowTasks = function(filterby) {
                scope.filterBy = filterby;
                /*if (isTabChange) {
                    scope.formData.officeId = null;
                    scope.formData.parentConfigId = null;
                    scope.formData.childConfigId = null;
                }*/
                scope.workFlowTasks = [];
                scope.selectedStatus = filterby;
                paginatorService.paginate(fetchFunction, scope.pageSize);
            };

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
    mifosX.ng.application.controller('TaskListController', ['$scope', 'ResourceFactory','$location', 'PaginatorService', mifosX.controllers.TaskListController]).run(function ($log) {
        $log.info("TaskListController initialized");
    });
}(mifosX.controllers || {}));