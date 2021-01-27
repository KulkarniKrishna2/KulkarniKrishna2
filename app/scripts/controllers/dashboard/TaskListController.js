(function(module) {
    mifosX.controllers = _.extend(module, {
        TaskListController: function (scope, resourceFactory, location, paginatorUsingOffsetService, routeParams,localStorageService,$filter) {
            scope.formData = {};
            scope.taskTypes = [
                {id: 'tab1', name: "label.tab.myworkflowstatus", status: 'assigned-workflow', icon:'icon-user',type:'assigned',active:true},
                {id: 'tab2', name: "label.tab.mytasks", status: 'assigned-nonworkflow', icon:'icon-user',type:'assigned',active:false},
                {id: 'tab3', name: "label.tab.role", status: 'unassigned', icon:'icon-user',type:'unassigned',active:false},
                {id: 'tab4', name: "label.tab.mywatch", status: 'watchers-workflow', icon: 'icon-user'}];
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
            scope.sortBy = 'dueDate';
            scope.sortType = 'asc';
            scope.taskTypeTabValue = scope.taskTypes[0];
            scope.formData.officeId = scope.currentSession.user.officeId;
            scope.formData.includeChildOfficeTaskList = true;
            var savedTabs = localStorageService.getFromLocalStorage("tabPersistence");
            if (savedTabs) {
                scope.savedTaskListTabset = savedTabs.tasklistTabset;
                for (var i in scope.taskTypes) {
                    var taskTypeName = $filter('translate')(scope.taskTypes[i].name);
                    if (taskTypeName == scope.savedTaskListTabset) {
                        scope.taskTypeTabValue = scope.taskTypes[i];
                    }
                }
            }

            scope.getChildrenTaskConfigs = function() {
                scope.formData.childConfigId = null;
                resourceFactory.taskConfigResource.getTemplate({ parentConfigId: scope.formData.parentConfigId }, function(data) {
                    scope.childrenTaskConfigs = data.taskConfigs;
                });
            };

            resourceFactory.taskConfigResource.getTemplate({}, function(data) {
                scope.parentTaskConfigs = data.taskConfigs;
                scope.offices = data.officeOptions;
                scope.loanAccountTypeOptions = data.loanAccoutTypeOptions;
            });

            scope.onLoanTypeChange = function(loanTypeId) {
                scope.filterByCenter = false;
                for (var i in scope.loanAccountTypeOptions) {
                    if (scope.loanAccountTypeOptions[i].id == loanTypeId && scope.loanAccountTypeOptions[i].value == "JLG") {
                        scope.filterByCenter = true;
                    }
                }
            };

            resourceFactory.centerResource.getAllCenters(function(data){
                scope.centers = data.pageItems;
            });

            scope.toggleAll = function() {
                var toggleStatus = !scope.formData.isAllSelected;
                angular.forEach(scope.workFlowTasks, function(itm){ itm.selected = toggleStatus; });
            };

            if (!scope.searchCriteria.workFlowT) {
                scope.searchCriteria.workFlowT = null;
                scope.saveSC();
            }
            scope.filterText = scope.searchCriteria.workFlowT;

            scope.onFilter = function() {
                scope.searchCriteria.workFlowT = scope.filterText;
                scope.saveSC();
            };

            if(!scope.searchCriteria.taskListSearch){
                scope.searchCriteria.taskListSearch = {};
            } else {
               if(scope.searchCriteria.taskListSearch.sortBy){
                scope.sortBy = scope.searchCriteria.taskListSearch.sortBy;
               }
               if(scope.searchCriteria.taskListSearch.sortType){
                scope.sortType = scope.searchCriteria.taskListSearch.sortType;
               }

               if(scope.searchCriteria.taskListSearch.officeId){
                scope.formData.officeId = scope.searchCriteria.taskListSearch.officeId;
               }

               if(scope.searchCriteria.taskListSearch.parentConfigId){
                scope.formData.parentConfigId  = scope.searchCriteria.taskListSearch.parentConfigId;
                scope.getChildrenTaskConfigs();
               }

               if(scope.searchCriteria.taskListSearch.childConfigId){
                scope.formData.childConfigId = scope.searchCriteria.taskListSearch.childConfigId;
               }

               if(scope.searchCriteria.taskListSearch.loanType){
                scope.formData.loanType = scope.searchCriteria.taskListSearch.loanType;
               }

               if(scope.searchCriteria.taskListSearch.centerId){
                scope.formData.centerId = scope.searchCriteria.taskListSearch.centerId;
               }

               if(scope.searchCriteria.taskListSearch.includeChildOfficeTaskList == true || scope.searchCriteria.taskListSearch.includeChildOfficeTaskList == false){
                scope.formData.includeChildOfficeTaskList = scope.searchCriteria.taskListSearch.includeChildOfficeTaskList;
               }
            }

            var fetchFunction = function (offset, limit, callback) {
                    scope.searchCriteria.taskListSearch.sortBy = scope.sortBy;
                    scope.searchCriteria.taskListSearch.sortType =
                      scope.sortType;
                    scope.searchCriteria.taskListSearch.officeId =
                      scope.formData.officeId;
                    if (scope.formData.parentConfigId) {
                      scope.searchCriteria.taskListSearch.parentConfigId =
                        scope.formData.parentConfigId;
                    } else {
                      scope.searchCriteria.taskListSearch.parentConfigId = null;
                    }

                    if (scope.formData.childConfigId) {
                      scope.searchCriteria.taskListSearch.childConfigId =
                        scope.formData.childConfigId;
                    } else {
                      scope.searchCriteria.taskListSearch.childConfigId = null;
                    }

                    if (scope.formData.loanType) {
                      scope.searchCriteria.taskListSearch.loanType =
                        scope.formData.loanType;
                    } else {
                      scope.searchCriteria.taskListSearch.loanType = null;
                    }

                    if (scope.formData.centerId) {
                      scope.searchCriteria.taskListSearch.centerId =
                        scope.formData.centerId;
                    } else {
                      scope.searchCriteria.taskListSearch.centerId = null;
                    }

                    if (scope.formData.includeChildOfficeTaskList) {
                      scope.searchCriteria.taskListSearch.includeChildOfficeTaskList =
                        scope.formData.includeChildOfficeTaskList;
                    } else {
                      scope.searchCriteria.taskListSearch.includeChildOfficeTaskList = false;
                    }
                    scope.saveSC();
                resourceFactory.taskListSearchResource.get({
                    filterby: scope.selectedStatus,
                    orderBy:scope.sortBy,
                    sortOrder:scope.sortType,
                    officeId: scope.formData.officeId,
                    parentConfigId: scope.formData.parentConfigId,
                    childConfigId: scope.formData.childConfigId,
                    loanType: scope.formData.loanType,
                    centerId: scope.formData.centerId,
                    includeChildOfficeTaskList: scope.formData.includeChildOfficeTaskList,
                    offset: offset,
                    limit: limit
                }, callback);
            };

            scope.getResultsPage = function(pageNumber) {
                scope.formParams.offset = ((pageNumber - 1) * scope.pageSize);
                scope.formParams.limit = scope.pageSize;
                resourceFactory.taskListResource.get(scope.formParams, function(data) {
                    scope.workFlowTasks = data.pageItems;
                });
            };

            scope.getWorkFlowTasks = function(filterTab) {
                scope.taskTypeTabValue = filterTab;
                scope.filterBy = filterTab.status;
                scope.selectedStatus = filterTab.status;
                scope.formData.isAllSelected = false;
                scope.taskPagination = paginatorUsingOffsetService.paginate(fetchFunction, scope.pageSize);
            };

            if(scope.formData.parentConfigId==undefined){
                scope.getWorkFlowTasks(scope.taskTypeTabValue);
            }
            else{
                scope.getWorkFlowTasks(scope.taskTypeTabValue);
            }

            scope.goToTask = function(task) {
                if (task.parentTaskId != undefined) {
                    location.path('/viewtask/' + task.parentTaskId);
                } else {
                    location.path('/viewtask/' + task.taskId);
                }
            };

            scope.configValue = function(task, config) {
                if (task != undefined && task.configValues != undefined) {
                    return task.configValues[config];
                }
                return undefined;
            };

            scope.hasAnyRowSelected = function() {
                var selectedTasks = [];
                angular.forEach(scope.workFlowTasks, function(itm) {
                    if (itm.selected == true) {
                        selectedTasks.push(itm.taskId);
                    }
                });
                if (selectedTasks.length > 0) {
                    return true;
                } else {
                    return false;
                }
            };

            scope.assignMe = function() {
                var selectedTasks = [];
                angular.forEach(scope.workFlowTasks, function(itm) {
                    if (itm.selected == true) {
                        selectedTasks.push(itm.taskId);
                    }
                });
                if(selectedTasks.length>0){
                    resourceFactory.taskListResource.update({command:"assign"}, selectedTasks,function (data) {
                        scope.getWorkFlowTasks(scope.taskTypeTabValue);
                    });
                }
            }

            scope.unassignMe = function() {
                var selectedTasks = [];
                angular.forEach(scope.workFlowTasks, function(itm) {
                    if (itm.selected == true) {
                        selectedTasks.push(itm.taskId);
                    }
                });
                if(selectedTasks.length>0){
                    resourceFactory.taskListResource.update({command:"unassign"}, selectedTasks,function (data) {
                        scope.getWorkFlowTasks(scope.taskTypeTabValue);
                    });
                }
            }

            scope.colorArray = ['#0070C0', '#70AD46', '#FFC000', '#FF0000'];

            scope.getColor = function(status){
                var colorStyle = {'color':scope.colorArray[0]};
                if(status==100){
                    colorStyle = {'color':scope.colorArray[1]};
                }else if(status==200){
                    colorStyle = {'color':scope.colorArray[2]};
                }else if(status==300){
                    colorStyle = {'color':scope.colorArray[3]};
                }
                return colorStyle;
            };

            scope.sortTable = function(sortBy){
                if(scope.sortBy == sortBy){
                    if(scope.sortType == 'asc'){
                        scope.sortType = 'desc';
                    }else{
                        scope.sortType = 'asc';
                    }
                }else{
                    scope.sortBy = sortBy;
                    scope.sortType = 'asc';
                }

                scope.taskPagination = paginatorUsingOffsetService.paginate(fetchFunction, scope.pageSize);

            };

            scope.isCancelled = function(workFlowTask) {
                if (workFlowTask.parentTaskStatus.toLowerCase() == 'cancelled' || workFlowTask.taskStatus.toLowerCase() == 'cancelled') {
                    return true;
                }
                return false;
            }
        }
    });
    mifosX.ng.application.controller('TaskListController', ['$scope', 'ResourceFactory','$location', 'PaginatorUsingOffsetService', '$routeParams','localStorageService','$filter', mifosX.controllers.TaskListController]).run(function ($log) {
        $log.info("TaskListController initialized");
    });
}(mifosX.controllers || {}));