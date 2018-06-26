(function (module) {
    mifosX.controllers = _.extend(module, {
        WorkflowBankApprovalListController: function (scope, resourceFactory, location, paginatorUsingOffsetService, routeParams, $rootScope) {
            scope.formData = {};
            scope.taskTypes = [
                {id: 'tab1', name: "label.tab.kotak.approval.loans", grouping: 'ManualApprove', taskPermissionName: 'READ_TASK_CLIENT_LEVEL_BANK_APPROVE', active: false, showtab : false},
                {id: 'tab2', name: "label.tab.system.approved", grouping: 'SystemApprove', taskPermissionName: 'READ_TASK_CLIENT_LEVEL_BANK_APPROVE', active: false, showtab : false},
                {id: 'tab3', name: "label.tab.ODU.review.loans", grouping: 'QueryResolve', taskPermissionName: 'READ_TASK_CLIENT_LEVEL_QUERY', active: false, showtab : false}];
            scope.pageSize = 15;
            scope.selectedStatus = 'Invalid';
            scope.filterBy = 'Invalid';
            scope.workflowLoanStatusList = [];

            var fetchFunction = function (offset, limit, callback) {
                resourceFactory.bankApprovalListSearchResource.get({
                    filterby: scope.filterBy,
                    offset: offset,
                    limit: limit
                }, callback);

            };

            scope.getWorkFlowBankApprovalTasks = function(filter) {
                scope.filterBy = filter;
                scope.taskPagination = paginatorUsingOffsetService.paginate(fetchFunction, scope.pageSize);
            }

            scope.changeInTab = function(grouping){
                scope.filterBy = 'Invalid';
                if(grouping == 'ManualApprove'){
                    scope.workflowLoanStatusList = [];
                    scope.workflowLoanStatusList = ['UnderKotakApproval', 'ODUReviewed', 'KotakApproved', 'KotakRejected'];
                    scope.filterBy = 'ManualApprove';
                }
                if(grouping == 'SystemApprove'){
                    scope.workflowLoanStatusList = [];
                    scope.workflowLoanStatusList = ['SystemApproved', 'SystemApprovedWithDeviation'];
                    scope.filterBy = 'SystemApprove';
                }
                if(grouping == 'QueryResolve'){
                    scope.workflowLoanStatusList = [];
                    scope.workflowLoanStatusList = ['UnderODUReview'];
                    scope.filterBy = 'QueryResolve';
                }

                scope.getWorkFlowBankApprovalTasks(scope.filterBy);

            }

             function checkPermission(){
                scope.tempGroupingVar = 'Invalid';
                //always one tab should be active
                scope.isAlreadyOneTabActive = false;
                for(var i = 0; i < scope.taskTypes.length; i++){
                     var isUserHavePermission = $rootScope.hasPermission(scope.taskTypes[i].taskPermissionName);
                     if(isUserHavePermission){              
                        scope.taskTypes[i].showtab = true;
                        if(!scope.isAlreadyOneTabActive){
                          scope.tempGroupingVar = scope.taskTypes[i].grouping;
                          scope.taskTypes[i].active = 'active';
                        }
                        scope.isAlreadyOneTabActive = true;
                     }
                }
                scope.changeInTab(scope.tempGroupingVar);
            }

            checkPermission();

            scope.getResultsPage = function (pageNumber) {
                scope.formParams.offset = ((pageNumber - 1) * scope.pageSize);
                scope.formParams.limit = scope.pageSize;
                resourceFactory.taskListResource.get(scope.formParams, function (data) {
                    scope.workFlowTasks = data.pageItems;
                });
            };


            scope.goToBankApprovalView = function (bankApproveObj, groupingType) {
                if(bankApproveObj != undefined){
                    if(groupingType == 'ManualApprove'){
                         location.path('/workflowbankapprovalaction/' + bankApproveObj.trackerId + '/' + bankApproveObj.bankApproveId);
                    }else if(groupingType == 'SystemApprove'){

                    }else if(groupingType == 'QueryResolve'){
                         location.path('/clientlevelqueryresolve/' + bankApproveObj.trackerId + '/' + bankApproveObj.bankApproveId);
                    }
                }
            };


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

        }
    });
    mifosX.ng.application.controller('WorkflowBankApprovalListController', ['$scope', 'ResourceFactory','$location', 'PaginatorUsingOffsetService', '$routeParams', '$rootScope', mifosX.controllers.WorkflowBankApprovalListController]).run(function ($log) {
        $log.info("WorkflowBankApprovalListController initialized");
    });
}(mifosX.controllers || {}));