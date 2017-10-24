(function (module) {
    mifosX.controllers = _.extend(module, {
        TaskListController: function (scope, resourceFactory, location, paginatorService, routeParams) {
            scope.loggedInUserId = scope.currentSession.user.userId;
            scope.formData = {};
            scope.taskTypes = [
                {id: 'tab1', name: "label.tab.myworkflowtasks", status: 'assigned-workflow', icon:'icon-user',type:'assigned'},
                {id: 'tab2', name: "label.tab.mytasks", status: 'assigned-nonworkflow', icon:'icon-user',type:'assigned'},
                {id: 'tab3', name: "label.tab.role", status: 'unassigned', icon:'icon-user',type:'unassigned'}];
            scope.pageSize = 15;
            scope.childrenTaskConfigs = [];
            scope.selectedStatus = 'assigned-workflow';
            scope.filterBy = 'assigned-workflow';
            scope.centers = [];
            scope.loanAccountTypeOptions = [];
            scope.filterByCenter = false;
            scope.formData.parentConfigId = routeParams.parentConfigId;
            scope.formData.childConfigId = routeParams.childConfigId;
            scope.formData.officeId = routeParams.officeId;

            scope.getChildrenTaskConfigs = function () {
                scope.formData.childConfigId = null;
                resourceFactory.taskConfigResource.getTemplate({parentConfigId: scope.formData.parentConfigId}, function(data) {
                    scope.childrenTaskConfigs = data.taskConfigs;
                });
            };

            resourceFactory.taskConfigResource.getTemplate({}, function(data) {
                scope.parentTaskConfigs = data.taskConfigs;
                scope.offices = data.officeOptions;
                scope.loanAccountTypeOptions = data.loanAccoutTypeOptions;
            });

            scope.onLoanTypeChange = function (loanTypeId) {
                scope.filterByCenter = false;
                for (var i in scope.loanAccountTypeOptions) {
                    if (scope.loanAccountTypeOptions[i].id == loanTypeId && scope.loanAccountTypeOptions[i].value == "JLG") {
                        scope.filterByCenter = true;
                    }
                }
            };

            resourceFactory.centerResource.getAllCenters(function(data){
                scope.centers = data;
            });

            scope.toggleAll = function() {
                var toggleStatus = !scope.formData.isAllSelected;
                angular.forEach(scope.workFlowTasks, function(itm){ itm.selected = toggleStatus; });
            }

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
                params.loanType = scope.formData.loanType;
                params.centerId = scope.formData.centerId;
                scope.formParams = params;

                resourceFactory.taskListResource.get(params, function(data) {
                    scope.workFlowTasks = data.pageItems;
                    scope.totalTasks = data.totalFilteredRecords;
                });
            };

            scope.getResultsPage = function (pageNumber) {
                scope.formParams.offset = ((pageNumber - 1) * scope.pageSize);
                scope.formParams.limit = scope.pageSize;
                resourceFactory.taskListResource.get(scope.formParams, function (data) {
                    scope.workFlowTasks = data.pageItems;
                });
            };

            scope.getWorkFlowTasks = function(filterby) {
                scope.filterBy = filterby;
                scope.workFlowTasks = [];
                scope.selectedStatus = filterby;
                scope.formData.isAllSelected = false;
                paginatorService.paginate(fetchFunction, scope.pageSize);
            };

            if(scope.formData.parentConfigId==undefined){
                scope.getWorkFlowTasks(scope.filterBy);
            }
            else{
                scope.filterby='assigned-workflow';
                scope.getWorkFlowTasks(scope.filterby);
            }

            scope.goToTask = function (task) {
                if(task.parentTaskId !=undefined){
                    location.path('/viewtask/' + task.parentTaskId);
                }else{
                    location.path('/viewtask/' + task.taskId);
                }
            };

            scope.configValue = function(task, config ){
                    if(task != undefined && task.configValues!=undefined){
                        return task.configValues[config];
                    }
                    return undefined;
            };

            scope.hasAnyRowSelected = function(){
                var selectedTasks = [];
                angular.forEach(scope.workFlowTasks, function(itm){
                    if(itm.selected == true){
                        selectedTasks.push(itm.taskId);
                    }
                });
                if(selectedTasks.length>0) {
                    return true;
                }else{
                    return false;
                }
            };

            scope.assignMe = function(){
                var selectedTasks = [];
                angular.forEach(scope.workFlowTasks, function(itm){
                    if(itm.selected == true){
                        selectedTasks.push(itm.taskId);
                    }
                });
                if(selectedTasks.length>0){
                    resourceFactory.taskListResource.update({command:"assign"}, selectedTasks,function (data) {
                        scope.getWorkFlowTasks(scope.filterBy);
                    });
                }
            }

            scope.unassignMe = function(){
                var selectedTasks = [];
                angular.forEach(scope.workFlowTasks, function(itm){
                    if(itm.selected == true){
                        selectedTasks.push(itm.taskId);
                    }
                });
                if(selectedTasks.length>0){
                    resourceFactory.taskListResource.update({command:"unassign"}, selectedTasks,function (data) {
                        scope.getWorkFlowTasks(scope.filterBy);
                    });
                }
            }
        }
    });
    mifosX.ng.application.controller('TaskListController', ['$scope', 'ResourceFactory','$location', 'PaginatorService', '$routeParams', mifosX.controllers.TaskListController]).run(function ($log) {
        $log.info("TaskListController initialized");
    });
}(mifosX.controllers || {}));