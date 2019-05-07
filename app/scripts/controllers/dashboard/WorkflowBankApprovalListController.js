(function (module) {
    mifosX.controllers = _.extend(module, {
        WorkflowBankApprovalListController: function (scope, resourceFactory, location, paginatorUsingOffsetService, routeParams, $rootScope, dateFilter,route,$modal) {
            scope.formData = {};
            scope.taskPagination = {};
            scope.taskTypes = [
                {id: 'tab1', name: "label.tab.kotak.approval.loans", grouping: 'ManualApprove', taskPermissionName: 'READ_TASK_CLIENT_LEVEL_APPROVE', active: false, showtab : false},
                {id: 'tab2', name: "label.tab.system.approved", grouping: 'SystemApprove', taskPermissionName: 'READ_TASK_CLIENT_LEVEL_APPROVE', active: false, showtab : false},
                {id: 'tab3', name: "label.tab.ODU.review.loans", grouping: 'QueryResolve', taskPermissionName: 'READ_TASK_CLIENT_LEVEL_QUERY', active: false, showtab : false},
                {id: 'tab4', name: "label.tab.kotak.reject.loans", grouping: 'KotakRejected', taskPermissionName: 'READ_TASK_CLIENT_LEVEL_BANK_REJECT', active: false, showtab : false}];
            scope.pageSize = 15;
            scope.selectedStatus = 'Invalid';
            scope.filterBy = 'Invalid';
            scope.workflowLoanStatusList = [];
            scope.offices = [];
            scope.dateFormat = scope.df;
            scope.approvalIdList = [];
            scope.showCrnTextBox = false;
            scope.bulkApprovalFormData = {};
            scope.crnNumberValue = null;
            scope.bcifStatus = null;
            scope.dedupeStatus = null;
            scope.crnStatus = null;
            scope.formData.crnNumber = null;
            scope.dedupeMatchFound = null;
            scope.crnNumberMandatory = false;
            scope.showCrnMandatoryMessage = false;
            scope.actionList = ['No Action Selected','Bulk Approval'];
            if (scope.allowBcifOperations) {
                scope.actionList.push('Bulk Crn Creation');
                scope.crnSearchList = ['All CRN Status', 'Custom CRN Search', 'BCIF Error', 'Dedupe Error', 'CRN Exists', 'Dedupe Match Found', 'No Dedupe Match'];
                scope.formData.crnSelectedOption = scope.crnSearchList[0];
                scope.isShowBulkOperationsButton = true;
            }
            else {
                scope.isShowBulkOperationsButton = false;
            }
            scope.formData.actionListSelectedOption = scope.actionList[0];
            scope.checkBoxDisable = [];
            scope.formData.showcheckbox = false;
            scope.currentPageItems = null;
            scope.disableProceedButton = true;
            scope.taskPagination.isAllChecked = false;
            scope.checkForSelectedAction = function (pageItems) {
                console.log(scope.actionList);
                scope.checkBoxDisable = [];
                scope.taskPagination.isAllChecked = false;
                for (var i in pageItems) {
                       pageItems[i].isChecked = false;
                }
                if (scope.allowBcifOperations && scope.formData.actionListSelectedOption == scope.actionList[1]) {
                    scope.disableProceedButton = false;
                    scope.formData.showcheckbox = true;
                    var size = pageItems.length;
                    for (var i = 0; i < size; i++) {
                        if (pageItems[i].bcifCrnId != undefined) {
                            if (!scope.allowBcifOperations || ((pageItems[i].bcifCrnId != null && pageItems[i].workflowLoanStatus.code == 'CreditReviewed') || (pageItems[i].bcifCrnId != null && pageItems[i].workflowLoanStatus.code == 'SystemApproved') || (pageItems[i].bcifCrnId != null && pageItems[i].workflowLoanStatus.code == 'SystemApprovedWithDeviation'))) {
                                scope.checkBoxDisable[i] = false;
                            }
                            else {
                                scope.checkBoxDisable[i] = true;
                            }
                        }
                        else {
                            scope.checkBoxDisable[i] = true;
                        }
                    }
                }
                if (scope.allowBcifOperations && scope.formData.actionListSelectedOption == scope.actionList[0]) {
                    scope.checkBoxDisable = [];
                    scope.formData.showcheckbox = false;
                    scope.disableProceedButton = true;
                }
                if (scope.allowBcifOperations && scope.formData.actionListSelectedOption == scope.actionList[2]) {
                    scope.formData.showcheckbox = true;
                    scope.disableProceedButton = false;
                    var size = pageItems.length;
                    for (var i = 0; i < size; i++) {
                        if ((pageItems[i].bcifCrnId == undefined || pageItems[i].bcifCrnId == null) && (pageItems[i].dedupeMatchExists != undefined && pageItems[i].dedupeMatchExists == 'NO_MATCH_FOUND')) {
                            scope.checkBoxDisable[i] = false;
                        }
                        else {
                            scope.checkBoxDisable[i] = true;
                        }
                    }
                }
                if (!scope.allowBcifOperations && scope.formData.actionListSelectedOption == scope.actionList[1]) {
                    scope.disableProceedButton = false;
                    scope.formData.showcheckbox = true;
                    var size = pageItems.length;
                    for (var i = 0; i < size; i++) {
                        scope.checkBoxDisable[i] = false;
                    }
                }
                if (!scope.allowBcifOperations && scope.formData.actionListSelectedOption == scope.actionList[0]) {
                    scope.formData.showcheckbox = false;
                }
            }
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
                if (scope.allowBcifOperations) {
                    scope.checkForOption();
                    scope.formData.actionListSelectedOption = scope.actionList[0];
                    scope.checkForSelectedAction();
                }
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
            
            scope.pushAllApprovalIdIntoList = function (taskPagination, isAllChecked) {
                scope.approvalIdList = [];
                if (scope.allowBcifOperations && scope.formData.actionListSelectedOption == scope.actionList[1]) {
                    for (var i in taskPagination.currentPageItems) {
                        if (isAllChecked) {
                            if (taskPagination.currentPageItems[i].bankApproveId && ((taskPagination.currentPageItems[i].bcifCrnId != null && taskPagination.currentPageItems[i].workflowLoanStatus.code == 'CreditReviewed' && taskPagination.currentPageItems[i].bcifCrnId != undefined) || (taskPagination.currentPageItems[i].bcifCrnId != null && taskPagination.currentPageItems[i].workflowLoanStatus.code == 'SystemApproved' && taskPagination.currentPageItems[i].bcifCrnId != undefined) || (taskPagination.currentPageItems[i].bcifCrnId != null && taskPagination.currentPageItems[i].workflowLoanStatus.code == 'SystemApprovedWithDeviation' && taskPagination.currentPageItems[i].bcifCrnId != undefined))) {
                                scope.approvalIdList.push(taskPagination.currentPageItems[i].bankApproveId);
                                taskPagination.currentPageItems[i].isChecked = true;
                            }
                            else {
                                taskPagination.currentPageItems[i].isChecked = false;
                            }
                        } else {
                            taskPagination.currentPageItems[i].isChecked = false;
                        }

                    }
                }
                if (scope.allowBcifOperations && scope.formData.actionListSelectedOption == scope.actionList[2]) {
                    for (var i in taskPagination.currentPageItems) {
                        if (isAllChecked) {
                            if (taskPagination.currentPageItems[i].bankApproveId && ((taskPagination.currentPageItems[i].bcifCrnId == undefined || taskPagination.currentPageItems[i].bcifCrnId == null) && (taskPagination.currentPageItems[i].dedupeMatchExists != undefined && taskPagination.currentPageItems[i].dedupeMatchExists == 'NO_MATCH_FOUND'))) {
                                scope.approvalIdList.push(taskPagination.currentPageItems[i].bankApproveId);
                                taskPagination.currentPageItems[i].isChecked = true;
                            }
                            else {
                                taskPagination.currentPageItems[i].isChecked = false;
                            }
                        } else {
                            taskPagination.currentPageItems[i].isChecked = false;
                        }

                    }
                }
                if (!scope.allowBcifOperations) {
                    for (var i in taskPagination.currentPageItems) {
                        if (isAllChecked) {
                            if (taskPagination.currentPageItems[i].bankApproveId) {
                                scope.approvalIdList.push(taskPagination.currentPageItems[i].bankApproveId);
                                taskPagination.currentPageItems[i].isChecked = true;
                            }
                        } else {
                            taskPagination.currentPageItems[i].isChecked = false;
                        }
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

            scope.proceedAction = function(approvalIdList){
              if(scope.formData.actionListSelectedOption == scope.actionList[1]){
                scope.doBulkBankApprovalAction(approvalIdList);
              }
              if(scope.allowBcifOperations && scope.formData.actionListSelectedOption == scope.actionList[2]){
                scope.createBulkCrnAction(approvalIdList);
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
                route.reload();
            }

            scope.createBulkCrnAction = function (approvalIdList) {
                if (scope.allowBcifOperations) {
                    scope.errorDetails = [];
                    if (approvalIdList.length == 0) {
                        return scope.errorDetails.push([{ code: 'error.msg.select.atleast.one.member' }])
                    }
                    scope.bulkApprovalFormData.bankApprovalIdList = approvalIdList;
                    resourceFactory.bulkCrnCreationResource.doBulkCrnCreation(scope.bulkApprovalFormData, function (data) {
                        route.reload();
                    });
                }
            }

            scope.changeInTab = function(grouping){
                scope.filterBy = 'Invalid';
                scope.formData.crnSelectedOption = 'All CRN Status';
                scope.checkForOption();
                scope.formData.actionListSelectedOption = 'No Action Selected';
                scope.checkForSelectedAction();
                scope.crnNumberValue = null;
                scope.bcifStatus = null;
                scope.dedupeStatus = null;
                scope.crnStatus = null;
                scope.formData.workflowLoanStatus = null;
                scope.dedupeMatchFound = null;
                if(grouping == 'ManualApprove'){
                    scope.workflowLoanStatusList = [];
                    scope.workflowLoanStatusList = ['UnderKotakApproval', 'ODUReviewed', 'KotakApproved', 'CreditReviewed'];
                    scope.filterBy = 'ManualApprove';
                    if(scope.allowBcifOperations){
                    scope.isShowBulkOperationsButton = true;
                    }
                    else{
                        scope.isShowBulkOperationsButton = false;
                    }
                }
                if(grouping == 'SystemApprove'){
                    scope.workflowLoanStatusList = [];
                    scope.workflowLoanStatusList = ['SystemApproved', 'SystemApprovedWithDeviation'];
                    scope.filterBy = 'SystemApprove';
                    scope.isShowBulkOperationsButton = true;
                }
                if(grouping == 'QueryResolve'){
                    scope.workflowLoanStatusList = [];
                    scope.workflowLoanStatusList = ['UnderODUReview'];
                    scope.filterBy = 'QueryResolve';
                    scope.isShowBulkOperationsButton = false;
                }
                if(grouping == 'KotakRejected'){
                    scope.workflowLoanStatusList = [];
                    scope.workflowLoanStatusList = ['KotakRejected'];
                    scope.filterBy = 'KotakRejected';
                    scope.isShowBulkOperationsButton = false;
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
                    }else if(groupingType == 'KotakRejected'){
                         location.path('/workflowbankrejectloanaction/' + bankApproveObj.trackerId + '/' + bankApproveObj.bankApproveId + '/' + bankApproveObj.loanId);
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
            
            scope.getCrnStatus = function (workflowBankApproval) {
                if (workflowBankApproval.bcifCrnId != undefined && workflowBankApproval.bcifCrnId != null) {
                    return workflowBankApproval.bcifCrnId;
                } 
                else if (workflowBankApproval.crnStatus != undefined && workflowBankApproval.crnStatus != null) {
                    if(workflowBankApproval.crnStatus == 'ERROR_RESPONSE'){
                        return 'CRN Creation Failed';
                    }
                }
                else if (workflowBankApproval.dedupeMatchExists != undefined && workflowBankApproval.dedupeMatchExists != null) {
                    if (workflowBankApproval.dedupeMatchExists == 'MATCH_FOUND') {
                        return 'Dedupe Match Found';
                    }
                    else if(workflowBankApproval.dedupeMatchExists == 'NO_MATCH_FOUND') {
                        return 'Dedupe Match Not Found';

                    }
                }
                else if(workflowBankApproval.dedupeStatus != undefined && workflowBankApproval.dedupeStatus != null){
                    if(workflowBankApproval.dedupeStatus == 'ERROR_RESPONSE'){
                        return 'Dedupe Check Failed'
                    }
                }
            }

            scope.openErrorMessage = function (workflowBankApproval) {
                scope.currentData = workflowBankApproval;
                var currentCrnStatus = scope.getCrnStatus(workflowBankApproval);
                $modal.open({
                    templateUrl: 'errorDisplay.html',
                    controller: errorDisplayCtrl,
                    resolve: {
                        data: function () {
                            return {'currentData':scope.currentData,'currentCrnStatus' :currentCrnStatus};
                        }
                    }
                });
            };

            var errorDisplayCtrl = function ($scope, $modalInstance, data) {
                $scope.currentData = data.currentData;
                $scope.currentCrnStatus = data.currentCrnStatus;
                $scope.errCode = null;
                $scope.errDesc = null;
                if($scope.currentCrnStatus == 'CRN Creation Failed'){
                    $scope.errCode = $scope.currentData.crnErrorCode;
                    $scope.errDesc = $scope.currentData.crnErrorDescription;
                }
                if($scope.currentCrnStatus == 'Dedupe Check Failed'){
                    $scope.errCode = $scope.currentData.dedupeErrorCode;
                    $scope.errDesc = $scope.currentData.dedupeErrorDescription;
                }
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

        }
    });
    mifosX.ng.application.controller('WorkflowBankApprovalListController', ['$scope', 'ResourceFactory','$location', 'PaginatorUsingOffsetService', '$routeParams', '$rootScope', 'dateFilter','$route','$modal', mifosX.controllers.WorkflowBankApprovalListController]).run(function ($log) {
        $log.info("WorkflowBankApprovalListController initialized");
    });
}(mifosX.controllers || {}));