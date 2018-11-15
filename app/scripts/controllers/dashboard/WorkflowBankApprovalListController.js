(function (module) {
    mifosX.controllers = _.extend(module, {
        WorkflowBankApprovalListController: function (scope, resourceFactory, location, paginatorUsingOffsetService, routeParams, $rootScope, dateFilter,route) {
            scope.formData = {};
            scope.taskTypes = [
                {id: 'tab1', name: "label.tab.kotak.approval.loans", grouping: 'ManualApprove', taskPermissionName: 'READ_TASK_CLIENT_LEVEL_APPROVE', active: false, showtab : false},
                {id: 'tab2', name: "label.tab.system.approved", grouping: 'SystemApprove', taskPermissionName: 'READ_TASK_CLIENT_LEVEL_APPROVE', active: false, showtab : false},
                {id: 'tab3', name: "label.tab.ODU.review.loans", grouping: 'QueryResolve', taskPermissionName: 'READ_TASK_CLIENT_LEVEL_QUERY', active: false, showtab : false}];
            scope.pageSize = 15;
            scope.selectedStatus = 'Invalid';
            scope.filterBy = 'Invalid';
            scope.workflowLoanStatusList = [];
            scope.offices = [];
            scope.dateFormat = scope.df;
            scope.approvalIdList = [];
            scope.showCrnTextBox = false;
            scope.isShowBulkApprovalButton = false;
            scope.bulkApprovalFormData = {};
            scope.crnSearchList = ['All CRN Status','Custom CRN Search','BCIF Error','Dedupe Error','CRN Exists','Dedupe Match Found','No Dedupe Match'];
            scope.crnNumberValue = null;
            scope.bcifStatus = null;
            scope.dedupeStatus = null;
            scope.crnStatus = null;
            scope.formData.crnNumber = null;
            scope.dedupeMatchFound = null;
            scope.formData.crnSelectedOption = scope.crnSearchList[0];
            scope.crnNumberMandatory = false;
            scope.showCrnMandatoryMessage = false;
            scope.checkForOption = function () {
                if (scope.formData.crnSelectedOption == 'Custom CRN Search') {
                    scope.showCrnTextBox = true;
                    scope.crnNumberValue = scope.formData.crnNumber;
                    scope.bcifStatus = null;
                    scope.dedupeStatus = null;
                    scope.crnStatus = null;
                    scope.dedupeMatchFound = null;
                    scope.crnNumberMandatory = true;
                }
                if (scope.formData.crnSelectedOption == 'BCIF Error') {
                    scope.showCrnTextBox = false;
                    scope.crnNumberValue = null;
                    scope.bcifStatus = 0;
                    scope.dedupeStatus = null;
                    scope.crnStatus = null;
                    scope.dedupeMatchFound = null;
                    scope.crnNumberMandatory = false;
                }
                if (scope.formData.crnSelectedOption == 'Dedupe Error') {
                    scope.showCrnTextBox = false;
                    scope.crnNumberValue = null;
                    scope.bcifStatus = null;
                    scope.dedupeStatus = 0;
                    scope.crnStatus = null;
                    scope.dedupeMatchFound = null;
                    scope.crnNumberMandatory = false;
                }
                if (scope.formData.crnSelectedOption == 'CRN Exists') {
                    scope.showCrnTextBox = false;
                    scope.crnNumberValue = null;
                    scope.bcifStatus = null;
                    scope.dedupeStatus = null;
                    scope.crnStatus = 1;
                    scope.dedupeMatchFound = null;
                    scope.crnNumberMandatory = false;
                }
                if (scope.formData.crnSelectedOption == 'No Dedupe Match') {
                    scope.showCrnTextBox = false;
                    scope.crnNumberValue = null;
                    scope.bcifStatus = null;
                    scope.dedupeStatus = null;
                    scope.crnStatus = null;
                    scope.dedupeMatchFound = 0;
                    scope.crnNumberMandatory = false;
                }
                if (scope.formData.crnSelectedOption == 'Dedupe Match Found') {
                    scope.showCrnTextBox = false;
                    scope.crnNumberValue = null;
                    scope.bcifStatus = null;
                    scope.dedupeStatus = null;
                    scope.crnStatus = null;
                    scope.dedupeMatchFound = 1;
                    scope.crnNumberMandatory = false;
                }
                if (scope.formData.crnSelectedOption == 'All CRN Status') {
                    scope.showCrnTextBox = false;
                    scope.crnNumberValue = null;
                    scope.bcifStatus = null;
                    scope.dedupeStatus = null;
                    scope.crnStatus = null;
                    scope.dedupeMatchFound = null;
                    scope.crnNumberMandatory = false;
                    scope.formData.crnNumber = null;
                }
            }
            resourceFactory.officeDropDownResource.getAllOffices({}, function(officelist){
                 scope.offices = officelist.allowedParents;
            })

            var fetchFunction = function (offset, limit, callback) {
                resourceFactory.bankApprovalListSearchResource.get({
                    filterby: scope.filterBy,
                    offset: offset,
                    limit: limit,
                    officeId : scope.formData.officeId,
                    workflowLoanStatus : scope.formData.workflowLoanStatus,
                    clientId : scope.formData.clientId,
                    dateFormat : scope.dateFormat,
                    expectedDisbursementDate : (scope.formData.expectedDisbursementDate != undefined) ?  dateFilter(scope.formData.expectedDisbursementDate, scope.df) : null,
                    taskCreatedDate : (scope.formData.taskCreatedDate != undefined) ?  dateFilter(scope.formData.taskCreatedDate, scope.df) : null,
                    crnNumber : scope.crnNumberValue,
                    bcifStatus : scope.bcifStatus,
                    dedupeStatus : scope.dedupeStatus,
                    crnStatus : scope.crnStatus,
                    dedupeMatchFound : scope.dedupeMatchFound
                }, callback);

            };

            scope.getWorkFlowBankApprovalTasks = function(filter) {
                scope.checkForOption();
                if(scope.crnNumberMandatory == false || (scope.crnNumberValue != null && scope.crnNumberValue != '' ))
                {
                scope.showCrnMandatoryMessage = false;
                scope.filterBy = filter;
                scope.taskPagination = paginatorUsingOffsetService.paginate(fetchFunction, scope.pageSize);
                scope.taskPagination.isAllChecked = false;
                }
                else {
                    scope.showCrnMandatoryMessage = true;
                }
            }

            scope.pushAllApprovalIdIntoList = function(taskPagination,isAllChecked){
                scope.approvalIdList = [];
                for(var i in taskPagination.currentPageItems){
                    if(isAllChecked){
                        if(taskPagination.currentPageItems[i].bankApproveId){
                            scope.approvalIdList.push(taskPagination.currentPageItems[i].bankApproveId);
                            taskPagination.currentPageItems[i].isChecked = true;
                        }
                    }else{
                        taskPagination.currentPageItems[i].isChecked = false;
                    }

                }

            }
            scope.pushApprovalIdIntoList = function(workflowBankApproval,index,isChecked){
                if(isChecked){
                    scope.approvalIdList.push(workflowBankApproval.bankApproveId);
                    if(scope.approvalIdList.length == scope.taskPagination.currentPageItems.length){
                        scope.taskPagination.isAllChecked = true;
                    }
                }else{
                    var idx = scope.approvalIdList.findIndex(x => x == workflowBankApproval.bankApproveId);
                    if(idx >= 0){
                        scope.approvalIdList.splice(idx,1);
                        scope.taskPagination.isAllChecked = false;
                    }
                }

            }

            scope.doBulkBankApprovalAction = function(approvalIdList){
                scope.errorDetails = [];
                if(approvalIdList.length == 0){
                    return scope.errorDetails.push([{code: 'error.msg.select.atleast.one.member'}])
                }
                scope.bulkApprovalFormData.bankApprovalIdList = approvalIdList;
                resourceFactory.bulkBankApprovalActionResource.doBulkBankApproval(scope.bulkApprovalFormData, function (data) {
                    route.reload();
                });
            }

            scope.changeInTab = function(grouping){
                scope.filterBy = 'Invalid';
                scope.formData.crnSelectedOption = 'All CRN Status';
                scope.checkForOption();
                if(grouping == 'ManualApprove'){
                    scope.workflowLoanStatusList = [];
                    scope.workflowLoanStatusList = ['UnderKotakApproval', 'ODUReviewed', 'KotakApproved', 'KotakRejected','CreditReviewed'];
                    scope.filterBy = 'ManualApprove';
                    scope.isShowBulkApprovalButton = false;
                }
                if(grouping == 'SystemApprove'){
                    scope.workflowLoanStatusList = [];
                    scope.workflowLoanStatusList = ['SystemApproved', 'SystemApprovedWithDeviation'];
                    scope.filterBy = 'SystemApprove';
                    scope.isShowBulkApprovalButton = true;
                }
                if(grouping == 'QueryResolve'){
                    scope.workflowLoanStatusList = [];
                    scope.workflowLoanStatusList = ['UnderODUReview'];
                    scope.filterBy = 'QueryResolve';
                    scope.isShowBulkApprovalButton = false;
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

            scope.goToBankApprovalView = function (bankApproveObj, groupingType) {
                if(bankApproveObj != undefined){
                    if(groupingType == 'ManualApprove' || groupingType == 'SystemApprove'){
                         location.path('/workflowbankapprovalaction/' + bankApproveObj.trackerId + '/' + bankApproveObj.bankApproveId);
                    }else if(groupingType == 'QueryResolve'){
                         location.path('/clientlevelqueryresolve/' + bankApproveObj.trackerId + '/' + bankApproveObj.bankApproveId);
                    }
                }
            };

            scope.colorArray = ['#bdbebf', '#0ba50b', '#44f444', '#f4444f', '#000107'];

            scope.getColor = function(status){
                var colorStyle = {'color':scope.colorArray[0]};
                if(status == "SystemApproved" || status == "KotakApproved"){  
                     colorStyle = {'color':scope.colorArray[1]};
                }else if(status =="SystemApprovedWithDeviation"){
                    colorStyle = {'color':scope.colorArray[2]};
                }else if(status== "UnderKotakApproval" || status== "ODUReviewed" || status== "UnderODUReview"){
                    colorStyle = {'color':scope.colorArray[3]};
                }else if(status== "KotakRejected"){
                    colorStyle = {'color':scope.colorArray[4]};
                }else if(status== "CreditReviewed"){
                    colorStyle = {'color':scope.colorArray[2]};
                }
                return colorStyle;
            };
            scope.getOfficeName=function(officeName,officeReferenceNumber){
                if(!scope.isReferenceNumberAsNameEnable){
                    return officeName;
                }else{
                    return officeName+ ' - ' + officeReferenceNumber;
                }
            }
            
            scope.getCrnStatus = function (bcifCrnId, dedupeMatchExists, dedupeErrorCode , dedupeErrorDescription , crnStatus , crnErrorCode , crnErrorDescription , dedupeStatus) {
                if (bcifCrnId != null && bcifCrnId != undefined) {
                    return bcifCrnId;
                } 
                else if (crnStatus != null && crnStatus != undefined) {
                    if(crnStatus == 'ERROR_RESPONSE'){
                        return 'CRN Creation Failed';
                    }
                }
                else if (dedupeMatchExists != null && dedupeMatchExists != undefined) {
                    if (dedupeMatchExists == 'MATCH_FOUND') {
                        return 'Dedupe Match Found';
                    }
                    else if(dedupeMatchExists == 'NO_MATCH_FOUND') {
                        return 'Dedupe Match Not Found';

                    }
                }
                else if(dedupeStatus != null && dedupeStatus != undefined){
                    if(dedupeStatus == 'ERROR_RESPONSE'){
                        return 'Dedupe Check Failed'
                    }
                }
            }

        }
    });
    mifosX.ng.application.controller('WorkflowBankApprovalListController', ['$scope', 'ResourceFactory','$location', 'PaginatorUsingOffsetService', '$routeParams', '$rootScope', 'dateFilter','$route', mifosX.controllers.WorkflowBankApprovalListController]).run(function ($log) {
        $log.info("WorkflowBankApprovalListController initialized");
    });
}(mifosX.controllers || {}));