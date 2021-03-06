(function (module) {
    mifosX.controllers = _.extend(module, {
        TaskController: function (scope, resourceFactory, route, dateFilter, $modal, location, paginatorUsingOffsetService) {
            scope.clients = [];
            scope.loans = [];
            scope.offices = [];
            var idToNodeMap = {};
            scope.formData = {};
            scope.loanTemplate = {};
            scope.loanDisbursalTemplate = {};
            scope.bankTransferTemplate = {};
            scope.date = {};
            scope.checkData = [];
            scope.isCollapsed = true;
            scope.approveData = {};
            scope.restrictDate = new Date();
            //this value will be changed within each specific tab
            scope.requestIdentifier = "loanId";
            scope.rdapprovetemplate = {};
            scope.rdactivatetemplate = {};
            scope.showSearchParameters = true;
            scope.hideResult = false;
            scope.taskPerPage = 10;
            scope.sqlFilerDf = 'yyyy-MM-dd';

            var endDate = new Date();
            endDate.setMonth(endDate.getMonth() - 1);
            var  params = {
                "makerDateTimeFrom": dateFilter(endDate, scope.sqlFilerDf)
            };
            scope.rescheduleData = function(){                
                scope.loanRescheduleData = [];
                scope.showBackDatedSearchParameters= false;
                scope.checkForBulkLoanRescheduleApprovalData = [];
                resourceFactory.loanRescheduleResource.getAll({command:'pending'}, function (data) {
                    scope.loanRescheduleData = data;
                });
            };
            scope.backDatedTemplate = {};

            resourceFactory.checkerInboxResource.get({templateResource: 'searchtemplate'}, function (data) {
                scope.checkerTemplate = data;
            });
            var fetchTasks = function (offset, limit, callback) {
                params.offset = offset;
                params.limit = limit;
                resourceFactory.checkerInboxResource.search(params, callback);
            };
            scope.searchData = paginatorUsingOffsetService.paginate(fetchTasks, scope.taskPerPage);

            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
            });
            resourceFactory.paymentTypeResource.getAll( function (data) {
                scope.paymentTypes = data;
            });
            scope.viewUser = function (item) {
                scope.userTypeahead = true;
                scope.formData.user = item.id;
            };

            scope.loanOfficerSelected = function (loanOfficerId) {
                delete this.centerId;
                delete this.groupId;
                if (loanOfficerId) {
                    scope.error =false;
                    resourceFactory.centerResource.getAllCenters({officeId: this.officeId, staffId: loanOfficerId, orderBy: 'name', sortOrder: 'ASC', limit: -1}, function (data) {
                        scope.centers = data.pageItems;
                    });

                    resourceFactory.groupResource.getAllGroups({officeId: this.officeId, staffId: loanOfficerId, orderBy: 'name', sortOrder: 'ASC', limit: -1}, function (data) {
                        scope.groups = data;
                    });
                } else {
                    scope.error =false;
                    resourceFactory.centerResource.getAllCenters({officeId: this.officeId, orderBy: 'name', sortOrder: 'ASC', limit: -1}, function (data) {
                        scope.centers = data.pageItems;
                    });

                    resourceFactory.groupResource.getAllGroups({officeId: this.officeId, orderBy: 'name', sortOrder: 'ASC', limit: -1}, function (data) {
                        scope.groups = data;
                    });
                }
            };
            scope.officeSelected = function (officeId) {

                delete this.loanOfficerId;
                delete this.centerId;
                delete this.groupId;
                if (officeId) {
                    scope.error =false;
                    resourceFactory.employeeResource.getAllEmployees({officeId: officeId}, function (data) {
                        scope.loanOfficers = data.pageItems;
                    });

                    resourceFactory.centerResource.getAllCenters({officeId: this.officeId, orderBy: 'name', sortOrder: 'ASC', limit: -1}, function (data) {
                        scope.centers = data.pageItems;
                    });

                    resourceFactory.groupResource.getAllGroups({officeId: this.officeId, orderBy: 'name', sortOrder: 'ASC', limit: -1}, function (data) {
                        scope.groups = data;
                    });
                }
            };
            scope.centerSelected = function (centerId) {
                delete this.groupId;
                if (centerId) {
                    scope.error =false;
                    resourceFactory.centerResource.get({'centerId': centerId, associations: 'groupMembers' }, function (data) {
                        scope.centerdetails = data;
                        if (data.groupMembers.length > 0) {
                            scope.groups = data.groupMembers;
                        }
                    });
                }else{
                    scope.error =false;
                    resourceFactory.groupResource.getAllGroups({officeId: this.officeId, orderBy: 'name', sortOrder: 'ASC', limit: -1}, function (data) {
                        scope.groups = data;
                    });
                }

            };

            scope.resetsearchparams = function(){
               scope.officeId = '';
                scope.staffId = '';
                scope.groupId = '';
                scope.centerId = '';
                route.reload();

            }

            scope.viewSearchParameters = function(){
                scope.showSearchParameters = true;
                scope.hideResult = false;
            }

            scope.clientSearch = function(){
                scope.clients = [];
                scope.loans = [];
                scope.checkData = [];
                scope.loanTemplate = {};
                scope.loanDisbursalTemplate = {};
                scope.approveData = {};
                scope.formData = {};
                var staffId = this.loanOfficerId;
                if (this.centerId || this.groupId) {
                    staffId = undefined;
                }
                var searchConditions = {};
                searchConditions.clientStatus = 100;
                resourceFactory.clientLookupResource.get({
                    sqlSearch : 'c.status_enum=100',
                    officeId: this.officeId,
                    staffId: staffId,
                    groupId:this.groupId,
                    centerId:this.centerId
                }, function (data) {
                    scope.clientData = data;
                });
            };
            scope.loanApproveSearch = function(){
                scope.clients = [];
                scope.loans = [];
                scope.checkData = [];
                scope.loanTemplate = {};
                scope.loanDisbursalTemplate = {};
                scope.approveData = {};
                scope.formData = {};
                
                    var staffId = this.loanOfficerId;
                    if (this.centerId || this.groupId) {
                        staffId = undefined;
                    }
                    var searchConditions = {};
                    searchConditions.loanStatus = 100;
                    if(this.expectedDisbursementOn){
                        searchConditions.loanExpectedDisbursedOnDate = this.expectedDisbursementOn.getFullYear()+'-'+(this.expectedDisbursementOn.getMonth()+1)+'-'+this.expectedDisbursementOn.getDate();
                    }
                    resourceFactory.tasklookupResource.get({
                        searchConditions: searchConditions,
                        officeId: this.officeId,
                        staffId: staffId,
                        groupId: this.groupId,
                        centerId: this.centerId
                    }, function (data) {
                        scope.loanApproveData = data;
                    });
            };
            scope.loanDisburseSearch = function(){
                scope.showSearchParameters = false;
                scope.hideResult = true;
                scope.clients = [];
                scope.loans = [];
                scope.checkData = [];
                scope.loanTemplate = {};
                scope.loanDisbursalTemplate = {};
                scope.approveData = {};
                scope.formData = {};
                var searchConditions = {};
                searchConditions.loanStatus = 200;
                if(this.expectedDisbursementOn){
                    searchConditions.loanExpectedDisbursedOnDate = this.expectedDisbursementOn.getFullYear()+'-'+(this.expectedDisbursementOn.getMonth()+1)+'-'+this.expectedDisbursementOn.getDate();
                }
                if(this.approvedOn){
                    searchConditions.loanApprovedOnDate = this.approvedOn.getFullYear()+'-'+(this.approvedOn.getMonth()+1)+'-'+this.approvedOn.getDate();
                }
                    var staffId = this.loanOfficerId;
                    if (this.centerId || this.groupId) {
                        staffId = undefined;
                    }
                    resourceFactory.tasklookupResource.get({
                        searchConditions: searchConditions,
                        officeId: this.officeId,
                        staffId: staffId,
                        groupId: this.groupId,
                        centerId: this.centerId,
                        paymentTypeId: this.paymentTypeId
                    }, function (data) {
                        scope.loanDisburseData = data;
                    });
            };
            scope.rdApprovalSearch = function(){
                scope.clients = [];
                scope.rd = [];
                scope.checkData = [];
                scope.loanTemplate = {};
                scope.rdapprovetemplate = {};
                scope.approveData = {};
                scope.formData = {};
                    var staffId = this.loanOfficerId;
                    if (this.centerId || this.groupId) {
                        staffId = undefined;
                    }
                    var searchConditions = {};
                    searchConditions.savingsAccountStatus = 100;
                    resourceFactory.rdTasklookupResource.get({
                        searchConditions: searchConditions,
                        officeId: this.officeId,
                        staffId: staffId,
                        groupId: this.groupId,
                        centerId: this.centerId
                    }, function (data) {
                        scope.rdapprovedata = data;
                    });
            };

            scope.rdactivationSearch = function(){
                scope.clients = [];
                scope.rd = [];
                scope.checkData = [];
                scope.loanTemplate = {};
                scope.rdactivatetemplate = {};
                scope.approveData = {};
                scope.formData = {};
                    var staffId = this.loanOfficerId;
                    if (this.centerId || this.groupId) {
                        staffId = undefined;
                    }
                    var searchConditions = {};
                    searchConditions.savingsAccountStatus = 200;
                    resourceFactory.rdTasklookupResource.get({
                        searchConditions: searchConditions,
                        officeId: this.officeId,
                        staffId: staffId,
                        groupId: this.groupId,
                        centerId: this.centerId
                    }, function (data) {
                        scope.rdactivatedata = data;
                    });
            };
            scope.clientApprovalAllCheckBoxesClicked = function() {
                var newValue = !scope.clientApprovalAllCheckBoxesMet();
                if(!angular.isUndefined(scope.clientData)) {
                    for (var i = scope.clientData.length - 1; i >= 0; i--) {
                        scope.approveData[scope.clientData[i].id] = newValue;
                    };
                }
            }
            scope.clientApprovalAllCheckBoxesMet = function() {
                var checkBoxesMet = 0;
                if(!angular.isUndefined(scope.clientData)) {
                    _.each(scope.clientData, function(data) {
                        if(_.has(scope.approveData, data.id)) {
                            if(scope.approveData[data.id] == true) {
                                checkBoxesMet++;
                            }
                        }
                    });
                    return (checkBoxesMet===scope.clientData.length);
                }
            }
            scope.loanApprovalAllCheckBoxesClicked = function() {
                var newValue = !scope.loanApprovalAllCheckBoxesMet();
                if(!angular.isUndefined(scope.loanApproveData)) {
                    for (var i = scope.loanApproveData.length - 1; i >= 0; i--) {
                        scope.loanTemplate[scope.loanApproveData[i].id] = newValue;
                    };
                }
            }
            scope.loanApprovalAllCheckBoxesMet = function() {
                var checkBoxesMet = 0;
                if(!angular.isUndefined(scope.loanApproveData)) {
                    _.each(scope.loanApproveData, function(data) {
                        if(_.has(scope.loanTemplate, data.id)) {
                            if(scope.loanTemplate[data.id] == true) {
                                checkBoxesMet++;
                            }
                        }
                    });
                    return (checkBoxesMet===scope.loanApproveData.length);
                }
            }

            scope.loanDisbursalAllCheckBoxesClicked = function() {
                var newValue = !scope.loanDisbursalAllCheckBoxesMet();
                if(!angular.isUndefined(scope.loanDisburseData)) {
                    for (var i = scope.loanDisburseData.length - 1; i >= 0; i--) {
                        scope.loanDisbursalTemplate[scope.loanDisburseData[i].id] = newValue;
                    };
                }
                scope.getTotalAmount(scope.loanDisburseData);
            }
            scope.loanDisbursalAllCheckBoxesMet = function() {
                var checkBoxesMet = 0;
                if(!angular.isUndefined(scope.loanDisburseData)) {
                    _.each(scope.loanDisburseData, function(data) {
                        if(_.has(scope.loanDisbursalTemplate, data.id)) {
                            if(scope.loanDisbursalTemplate[data.id] == true) {
                                checkBoxesMet++;
                            }
                        }
                    });
                    return (checkBoxesMet===scope.loanDisburseData.length);
                }
                scope.getTotalAmount(scope.loanDisburseData);
            }

            scope.checkerInboxAllCheckBoxesClicked = function() {
                var newValue = !scope.checkerInboxAllCheckBoxesMet();
                if(!angular.isUndefined(scope.searchData)) {
                    for (var i = scope.searchData.length - 1; i >= 0; i--) {
                        scope.checkData[scope.searchData[i].id] = newValue; 
                    };
                }
            }
            scope.checkerInboxAllCheckBoxesMet = function() {
                var checkBoxesMet = 0;
                if(!angular.isUndefined(scope.searchData)) {
                    _.each(scope.searchData, function(data) {
                        if(_.has(scope.checkData, data.id)) {
                            if(scope.checkData[data.id] == true) {
                                checkBoxesMet++;
                            }
                        }
                    });
                    return (checkBoxesMet===scope.searchData.length);
                }
            }

            scope.rdapprovalallcheckboxesclicked = function() {
                var newValue = !scope.rdapprovalallcheckboxesmet();
                if(!angular.isUndefined(scope.rdapprovedata)) {
                    for (var i = scope.rdapprovedata.length - 1; i >= 0; i--) {
                        scope.rdapprovetemplate[scope.rdapprovedata[i].id] = newValue;
                    };
                }
            }
            scope.rdapprovalallcheckboxesmet = function() {
                var checkBoxesMet = 0;
                if(!angular.isUndefined(scope.rdapprovedata)) {
                    _.each(scope.rdapprovedata, function(data) {
                        if(_.has(scope.rdapprovetemplate, data.id)) {
                            if(scope.rdapprovetemplate[data.id] == true) {
                                checkBoxesMet++;
                            }
                        }
                    });
                    return (checkBoxesMet===scope.rdapprovedata.length);
                }
            }
            scope.rdactivateallcheckboxesclicked = function() {
                var newValue = !scope.rdactivateallcheckboxesmet();
                if(!angular.isUndefined(scope.rdactivatedata)) {
                    for (var i = scope.rdactivatedata.length - 1; i >= 0; i--) {
                        scope.rdactivatetemplate[scope.rdactivatedata[i].id] = newValue;
                    };
                }
            }
            scope.rdactivateallcheckboxesmet = function() {
                var checkBoxesMet = 0;
                if(!angular.isUndefined(scope.rdactivatedata)) {
                    _.each(scope.rdactivatedata, function(data) {
                        if(_.has(scope.rdactivatetemplate, data.id)) {
                            if(scope.rdactivatetemplate[data.id] == true) {
                                checkBoxesMet++;
                            }
                        }
                    });
                    return (checkBoxesMet===scope.rdactivatedata.length);
                }
            }
            scope.approveOrRejectChecker = function (action) {
                if (scope.checkData) {
                    $modal.open({
                        templateUrl: 'approvechecker.html',
                        controller: CheckerApproveCtrl,
                        resolve: {
                            action: function () {
                                return action;
                            }
                        }
                    });
                }
            };

            scope.getTotalAmount = function(data) {
                var amount = 0;
                if(data && data.length>0) {
                    for (var i=0; i<data.length; i++) {
                        if ((scope.loanDisbursalTemplate[scope.loanDisburseData[i].id]) && angular.isDefined(data[i].principal)) {
                            amount = amount + parseFloat(data[i].principal);
                        }
                    }
                }
                    this.formData.transactionAmount = amount.toFixed(2);
            };

            var CheckerApproveCtrl = function ($scope, $modalInstance, action) {
                $scope.approve = function () {
                    var totalApprove = 0;
                    var approveCount = 0;
                    _.each(scope.checkData, function (value, key) {
                        if (value == true) {
                            totalApprove++;
                        }
                    });
                    _.each(scope.checkData, function (value, key) {
                        if (value == true) {

                            resourceFactory.checkerInboxResource.save({templateResource: key, command: action}, {}, function (data) {
                                approveCount++;
                                if (approveCount == totalApprove) {
                                    scope.search();
                                }
                            }, function (data) {
                                approveCount++;
                                if (approveCount == totalApprove) {
                                    scope.search();
                                }
                            });
                        }
                    });
                    scope.checkData = {};
                    $modalInstance.close('approve');

                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.deleteChecker = function () {
                if (scope.checkData) {
                    $modal.open({
                        templateUrl: 'deletechecker.html',
                        controller: CheckerDeleteCtrl
                    });
                }
            };
            var CheckerDeleteCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    var totalDelete = 0;
                    var deleteCount = 0
                    _.each(scope.checkData, function (value, key) {
                        if (value == true) {
                            totalDelete++;
                        }
                    });
                    _.each(scope.checkData, function (value, key) {
                        if (value == true) {

                            resourceFactory.checkerInboxResource.delete({templateResource: key}, {}, function (data) {
                                deleteCount++;
                                if (deleteCount == totalDelete) {
                                    scope.search();
                                }
                            }, function (data) {
                                deleteCount++;
                                if (deleteCount == totalDelete) {
                                    scope.search();
                                }
                            });
                        }
                    });
                    scope.checkData = {};
                    $modalInstance.close('delete');
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.approveClient = function () {

                if (scope.approveData) {

                    var value1 = false;
                    _.each(scope.approveData, function (value, key) {
                        if (value == true) {
                            value1 = true;
                        }
                    });
                        if(value1 == true){
                            $modal.open({
                                templateUrl: 'approveclient.html',
                                controller: ApproveClientCtrl,
                                resolve: {
                                    items: function () {
                                        return scope.approveData;
                                    }
                                }

                            });
                        }else{

                            scope.error =true;
                        }
                }
            };
           //scope.approveLoanReschedule = function(){
           //}
            $(window).scroll(function () {
                if ($(this).scrollTop() > 100) {
                    $('.head-affix').css({
                        "position": "fixed",
                        "top": "50px"
                    });

                } else {
                    $('.head-affix').css({
                        position: 'static'
                    });
                }
            });

            var ApproveClientCtrl = function ($scope, $modalInstance, items) {
                $scope.restrictDate = new Date();
                $scope.date = {};
                $scope.date.actDate = new Date();
                $scope.clientApproval = function (act) {
                    var activate = {}
                    activate.activationDate = dateFilter(act, scope.df);
                    activate.dateFormat = scope.df;
                    activate.locale = scope.optlang.code;
                    var totalClient = 0;
                    var clientCount = 0
                    _.each(items, function (value, key) {
                        if (value == true) {
                            totalClient++;
                        }
                    });

                    scope.batchRequests = [];
                     scope.requestIdentifier = "clientId";

                    var reqId = 1;
                    _.each(items, function (value, key) {                         
                        if (value == true) {
                            scope.batchRequests.push({requestId: reqId++, relativeUrl: "clients/"+key+"?command=activate", 
                            method: "POST", body: JSON.stringify(activate)});                        
                        }
                    });

                    resourceFactory.batchResource.post(scope.batchRequests, function (data) {
                        for(var i = 0; i < data.length; i++) {
                            if(data[i].statusCode = '200') {
                                clientCount++;
                                if (clientCount == totalClient) {
                                    route.reload();
                                }
                            }
                            
                        }    
                    });

                    scope.approveData = {};
                    $modalInstance.close('delete');
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.routeTo = function (id) {
                location.path('viewcheckerinbox/' + id);
            };

            scope.routeToClient = function (id) {
                location.path('viewclient/' + id);
            };

            scope.search = function () {
                scope.isCollapsed = true;
                var reqFromDate = dateFilter(scope.date.from, scope.sqlFilerDf);
                var reqToDate = dateFilter(scope.date.to, scope.sqlFilerDf);
                params = {};
                if (scope.formData.action) {
                    params.actionName = scope.formData.action;
                }
                ;

                if (scope.formData.entity) {
                    params.entityName = scope.formData.entity;
                }
                ;

                if (scope.formData.resourceId) {
                    params.resourceId = scope.formData.resourceId;
                }
                ;

                if (scope.formData.user) {
                    params.makerId = scope.formData.user;
                }
                ;

                if (scope.date.from) {
                    params.makerDateTimeFrom = reqFromDate;
                }
                ;

                if (scope.date.to) {
                    params.makerDateTimeto = reqToDate;
                }
                scope.searchData = paginatorUsingOffsetService.paginate(fetchTasks, scope.taskPerPage);;
                if (scope.userTypeahead) {
                    scope.formData.user = '';
                    scope.userTypeahead = false;
                    scope.user = '';
                }
            };

            scope.approveLoan = function () {
                if (scope.loanTemplate) {
                    var value1 = false;
                    _.each(scope.loanTemplate, function (value, key) {
                        if (value == true) {
                            value1 = true;
                        }
                    });
                    if(value1 == true){
                    $modal.open({
                        templateUrl: 'approveloan.html',
                        controller: ApproveLoanCtrl,
                        resolve: {
                            items: function () {
                                return scope.loanTemplate;
                            }
                        }
                    });
                    }else{
                        scope.error =true;
                    }
                }
            };
            $(window).scroll(function () {
                if ($(this).scrollTop() > 100) {
                    $('.head-affix').css({
                        "position": "fixed",
                        "top": "50px"
                    });

                } else {
                    $('.head-affix').css({
                        position: 'static'
                    });
                }
            });
            var ApproveLoanCtrl = function ($scope, $modalInstance,items) {
                $scope.restrictDate = new Date();
                $scope.date = {};
                $scope.date.actDate = new Date();
                $scope.loanApproval = function (act) {
                    var approve = {}
                    approve.approvedOnDate = dateFilter(act, scope.df);
                    approve.dateFormat = scope.df;
                    approve.locale = scope.optlang.code;
                    var totalLoans = 0;
                    var loanCount = 0
                    _.each(items, function (value, key) {
                        if (value == true) {
                            totalLoans++;
                        }
                    });

                    scope.batchRequests = [];
                    scope.requestIdentifier = "loanId";

                    var reqId = 1;
                    _.each(items, function (value, key) {
                        if (value == true) {
                            scope.batchRequests.push({requestId: reqId++, relativeUrl: "loans/"+key+"?command=approve",
                                method: "POST", body: JSON.stringify(approve)});
                        }
                    });
                    resourceFactory.batchResource.post(scope.batchRequests, function (data) {
                        for(var i = 0; i < data.length; i++) {
                            if(data[i].statusCode = '100') {
                                loanCount++;
                                if (loanCount == totalLoans) {
                                    route.reload();
                                }
                            }

                        }
                    });

                    scope.loanTemplate = {};
                    $modalInstance.close('delete');
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.disburseLoan = function () {

                if (scope.loanDisbursalTemplate) {
                    var value1 = false;
                    _.each(scope.loanDisbursalTemplate, function (value, key) {
                        if (value == true) {
                            value1 = true;
                        }
                    });
                    if(value1 == true){
                    $modal.open({
                        templateUrl: 'disburseloan.html',
                        controller: DisburseLoanCtrl,
                        resolve: {
                            items: function () {
                                return scope.loanDisbursalTemplate;
                            }
                        }
                    });
                    }else{
                        scope.error =true;
                    }
                }
            };
            $(window).scroll(function () {
                if ($(this).scrollTop() > 100) {
                    $('.head-affix').css({
                        "position": "fixed",
                        "top": "50px"
                    });

                } else {
                    $('.head-affix').css({
                        position: 'static'
                    });
                }
            });

            var DisburseLoanCtrl = function ($scope, $modalInstance, items) {
                $scope.restrictDate = new Date();
                $scope.date = {};
                $scope.date.actDate = new Date();
                $scope.loandisburse = function (act) {
                    var disburse = {}
                    disburse.actualDisbursementDate = dateFilter(act, scope.df);
                    disburse.dateFormat = scope.df;
                    disburse.locale = scope.optlang.code;
                    var totalDisbursalLoans = 0;
                    var DisbursalloanCount = 0;

                    scope.batchRequests = [];
                    scope.requestIdentifier = "loanId";

                    var reqId = 1;
                    _.each(items, function (value, key) {
                        _.each(scope.loanDisburseData, function (data) {
                            if(data.id == key) {
                                if(data.expectedDisbursalPaymentType){
                                disburse.paymentTypeId = data.expectedDisbursalPaymentType.id;
                            }
                                disburse.receiptNumber = data.receiptNumber;
                                disburse.note = data.note;
                            }
                        });
                        if (value == true) {
                            totalDisbursalLoans++;
                            scope.batchRequests.push({requestId: reqId++, relativeUrl: "loans/"+key+"?command=disburse",
                                method: "POST", body: JSON.stringify(disburse)});
                        }
                    });
                    resourceFactory.batchResource.post(scope.batchRequests, function (data) {
                        for(var i = 0; i < data.length; i++) {
                            if(data[i].statusCode = '200') {
                                DisbursalloanCount++;
                                if (DisbursalloanCount == totalDisbursalLoans) {
                                    route.reload();
                                }
                            }

                        }
                    });

                    scope.loanDisbursalTemplate = {};
                    $modalInstance.close('delete');
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.approverd = function () {
                if (scope.rdapprovetemplate) {
                    var value1 = false;
                    _.each(scope.rdapprovetemplate, function (value, key) {
                        if (value == true) {
                            value1 = true;
                        }
                    });
                    if(value1 == true){
                    $modal.open({
                        templateUrl: 'approverdaccount.html',
                        controller: approverdctrl,
                        resolve: {
                            items: function () {
                                return scope.rdapprovetemplate;
                            }
                        }
                    });
                    }else{
                        scope.error =true;
                    }
                }
            };
            $(window).scroll(function () {
                if ($(this).scrollTop() > 100) {
                    $('.head-affix').css({
                        "position": "fixed",
                        "top": "50px"
                    });

                } else {
                    $('.head-affix').css({
                        position: 'static'
                    });
                }
            });

            var approverdctrl = function ($scope, $modalInstance, items) {
                $scope.restrictDate = new Date();
                $scope.date = {};
                $scope.date.actDate = new Date();
                $scope.rdapprove = function (act) {
                    var approve = {}
                    approve.approvedOnDate = dateFilter(act, scope.df);
                    approve.dateFormat = scope.df;
                    approve.locale = scope.optlang.code;
                    var totalrdapproved = 0;
                    var approveallrdcount = 0;
                    _.each(items, function (value, key) {
                        if (value == true) {
                            totalrdapproved++;
                        }
                    });

                    scope.batchRequests = [];
                    scope.requestIdentifier = "savingsId";

                    var reqId = 1;
                    _.each(items, function (value, key) {
                        if (value == true) {
                            scope.batchRequests.push({requestId: reqId++, relativeUrl: "recurringdepositaccounts/"+key+"?command=approve",
                                method: "POST", body: JSON.stringify(approve)});
                        }
                    });
                    resourceFactory.batchResource.post(scope.batchRequests, function (data) {
                        for(var i = 0; i < data.length; i++) {
                            if(data[i].statusCode = '200') {
                                approveallrdcount++;
                                if (approveallrdcount == totalrdapproved) {
                                    route.reload();
                                }
                            }

                        }
                    });

                    scope.rdapprovetemplate = {};
                    $modalInstance.close('delete');
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.activaterd = function () {
                if (scope.rdactivatetemplate) {
                    var value1 = false;
                    _.each(scope.rdactivatetemplate, function (value, key) {
                        if (value == true) {
                            value1 = true;
                        }
                    });
                    if(value1 == true){
                    $modal.open({
                        templateUrl: 'activaterdaccount.html',
                        controller: activaterdctrl,
                        resolve: {
                            items: function () {
                                return scope.rdactivatetemplate;
                            }
                        }
                    });
                    }else{
                        scope.error =true;
                    }
                }
            };
            $(window).scroll(function () {
                if ($(this).scrollTop() > 100) {
                    $('.head-affix').css({
                        "position": "fixed",
                        "top": "50px"
                    });

                } else {
                    $('.head-affix').css({
                        position: 'static'
                    });
                }
            });

            var activaterdctrl = function ($scope, $modalInstance, items) {
                $scope.restrictDate = new Date();
                $scope.date = {};
                $scope.date.actDate = new Date();
                $scope.rdactivate = function (act) {
                    var activate = {}
                    activate.activatedOnDate = dateFilter(act, scope.df);
                    activate.dateFormat = scope.df;
                    activate.locale = scope.optlang.code;
                    var totalrdactivated = 0;
                    var activateallrdcount = 0;
                    _.each(items, function (value, key) {
                        if (value == true) {
                            totalrdactivated++;
                        }
                    });

                    scope.batchRequests = [];
                    scope.requestIdentifier = "savingsId";

                    var reqId = 1;
                    _.each(items, function (value, key) {
                        if (value == true) {
                            scope.batchRequests.push({requestId: reqId++, relativeUrl: "recurringdepositaccounts/"+key+"?command=activate",
                                method: "POST", body: JSON.stringify(activate)});
                        }
                    });
                    resourceFactory.batchResource.post(scope.batchRequests, function (data) {
                        for(var i = 0; i < data.length; i++) {
                            if(data[i].statusCode = '200') {
                                activateallrdcount++;
                                if (activateallrdcount == totalrdactivated) {
                                    route.reload();
                                }
                            }

                        }
                    });

                    scope.rdactivatetemplate = {};
                    $modalInstance.close('delete');
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.routeTo = function (id) {
                location.path('viewcheckerinbox/' + id);
            };

            scope.routeToLoan = function (id) {
                location.path('viewloanaccount/' + id);
            };

            scope.viewTransferDetails = function(traanferData){
                location.path('/viewbankaccounttransfers/' + traanferData.id);
            };
            
            scope.bankTransferSearch = function () {

                scope.clients = [];
                scope.loans = [];
                scope.checkData = [];
                scope.loanTemplate = {};
                scope.bankTransferTemplate = {};
                scope.approveData = {};
                scope.formData = {};
                if(this.officeId) {
                    this.showMsg = false;
                    var staffId = this.loanOfficerId;
                    if (this.centerId || this.groupId) {
                        staffId = undefined;
                    }
                    /**
                     * Note : sqlSearch param not used in backend code.
                     */
                    resourceFactory.bankAccountTransferResource.getAll({
                        sqlSearch: 'bat.status=1 or bat.status=4',
                        officeId: this.officeId,
                        staffId: staffId,
                        groupId: this.groupId,
                        centerId: this.centerId
                    }, function (data) {
                        scope.transferDetails = data;
                    });
                }else{
                    this.showMsg = true;
                }
            };

            scope.bankTransferInitiate = function () {
                if (scope.loanDisbursalTemplate) {
                    $modal.open({
                        templateUrl: 'initiateTransfer.html',
                        controller: BankTransferCtrl,
                        resolve: {
                            items: function () {
                                return scope.bankTransferTemplate;
                            }
                        }
                    });
                }
            };


            var BankTransferCtrl = function ($scope, $modalInstance, items) {
                $scope.initiateTransfer = function () {
                    var disburse = {}
                    var totalTransfers = 0;
                    var transferCount = 0;
                    _.each(items, function (value, key) {
                        if (value == true) {
                            totalTransfers++;
                        }
                    });

                    scope.batchRequests = [];
                    scope.requestIdentifier = "loanId";

                    var reqId = 1;
                    _.each(items, function (value, key) {
                        if (value == true) {
                            scope.batchRequests.push({requestId: reqId++, relativeUrl: "banktransfer/"+key+"?command=initiate",
                                method: "POST", body: ""});
                        }
                    });
                    resourceFactory.batchResource.post(scope.batchRequests, function (data) {
                        for(var i = 0; i < data.length; i++) {
                            if(data[i].statusCode = '200') {
                                transferCount++;
                                if (transferCount == totalTransfers) {
                                    route.reload();
                                }
                            }

                        }
                    });

                    scope.bankTransferTemplate = {};
                    $modalInstance.close('delete');
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.approveBulkLoanReschedule = function () {
                if (scope.checkForBulkLoanRescheduleApprovalData) {
                    $modal.open({
                        templateUrl: 'loanreschedule.html',
                        controller: ApproveBulkLoanRescheduleCtrl
                    });
                }
            };

            var ApproveBulkLoanRescheduleCtrl = function ($scope, $modalInstance) {
                $scope.approveLoanReschedule = function () {
                    scope.bulkLoanRescheduleApproval();
                    route.reload();
                    $modalInstance.close('approveLoanReschedule');
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }

            scope.checkerInboxAllCheckBoxesClickedForBulkLoanRescheduleApproval = function() {                
                var newValue = !scope.checkerInboxAllCheckBoxesMetForBulkLoanRescheduleApproval();
                scope.checkForBulkLoanRescheduleApprovalData = [];
                if(!angular.isUndefined(scope.loanRescheduleData)) {
                    for (var i = scope.loanRescheduleData.length - 1; i >= 0; i--) {
                        scope.checkForBulkLoanRescheduleApprovalData[scope.loanRescheduleData[i].id] = newValue; 
                    };
                }
            }
            scope.checkerInboxAllCheckBoxesMetForBulkLoanRescheduleApproval = function() {
                var checkBoxesMet = 0;
                if(!angular.isUndefined(scope.loanRescheduleData)) {
                    _.each(scope.loanRescheduleData, function(data) {
                        if(_.has(scope.checkForBulkLoanRescheduleApprovalData, data.id)) {
                            if(scope.checkForBulkLoanRescheduleApprovalData[data.id] == true) {
                                checkBoxesMet++;
                            }
                        }
                    });
                    return (checkBoxesMet===scope.loanRescheduleData.length && scope.loanRescheduleData.length != 0);
                }
            }

            scope.bulkLoanRescheduleApproval = function () {
                let loanRescheduleApprovalData = {};
                loanRescheduleApprovalData.approvedOnDate = dateFilter(new Date(), scope.df);
                loanRescheduleApprovalData.dateFormat = scope.df;
                loanRescheduleApprovalData.locale = scope.optlang.code;
                var selectedAccounts = 0;
                var approvedAccounts = 0;
                _.each(scope.checkForBulkLoanRescheduleApprovalData, function (value, key) {
                    if (value == true) {
                        selectedAccounts++;
                    }
                });

                scope.batchRequests = [];
                scope.requestIdentifier = "RESCHEDULELOAN";

                var reqId = 1;
                _.each(scope.checkForBulkLoanRescheduleApprovalData, function (value, key) { 
                    if (value == true) {    
                        var url =  "rescheduleloans/"+key+"?command=approve";
                        var bodyData = JSON.stringify(loanRescheduleApprovalData);
                        var batchData = {requestId: reqId++, relativeUrl: url, method: "POST", body: bodyData};
                        scope.batchRequests.push(batchData);                        
                    }
                });
                resourceFactory.batchResource.post(scope.batchRequests, function (data) {    
                        route.reload();
                });
            };
            scope.backDatedTypeOption = [{'name':'REPAYMENT','val':'REPAYMENT'},{'name':'FORECLOSURE','val':'FORECLOSURE'},{'name':'CORRECTION/UNDO','val':'ADJUST,RECTIFY'}];

            scope.backDatedFormData = {};
            scope.getBackDatedData = function(errorData){
                params = {};
                scope.backDated.masterCheckbox = false;
                scope.showBackDatedSearchParameters= true;
                scope.backDatedTransactionsList = [];
                params.actionName = 'REPAYMENT,ADJUST,RECTIFY,FORECLOSURE';
                params.includeJson = true;
                if(scope.backDatedFormData.officeId){
                   params.officeId = scope.backDatedFormData.officeId;
                }
                if(scope.backDatedFormData.fromDate){
                    params.makerDateTimeFrom = dateFilter(scope.backDatedFormData.fromDate, 'yyyy-MM-dd');
                }
                if(scope.backDatedFormData.toDate){
                    params.makerDateTimeTo = dateFilter(scope.backDatedFormData.toDate, 'yyyy-MM-dd');
                }
                if(scope.backDatedFormData.type){
                    params.actionName = scope.backDatedFormData.type;
                }
                scope.backDatedTransactions(params,errorData);
            }

            scope.viewData = function(){
                scope.showBackDatedSearchParameters= true;
            }
            scope.showApproveButton = function(){
                for(var i in scope.backDatedTransactionsList){
                    if(scope.backDatedTransactionsList[i].checked && scope.backDatedTransactionsList[i].checked==true){
                        return true;
                    }
                }
                return false;
            }

            scope.errorExist = false;

            scope.backDatedTransactions = function(params, errorData){
                scope.showBackDatedSearchParameters= false;
                scope.errorExist = false;

                scope.backDatedTransactionsList = paginatorUsingOffsetService.paginate(fetchTasks, scope.taskPerPage);
                if( scope.backDatedTransactionsList ){
                    for(var i in scope.backDatedTransactionsList ){
                        var obj = JSON.parse(scope.backDatedTransactionsList[i].commandAsJson);
                        if(obj.transactionAmount==undefined){
                             scope.backDatedTransactionsList[i].transactionAmount = 'N/A';
                        }else if(scope.backDatedTransactionsList[i].actionName=='ADJUST'){
                             if(obj.transactionAmount==0){
                                 scope.backDatedTransactionsList[i].transactionAmount = 'N/A';
                                 scope.backDatedTransactionsList[i].actionName='UNDO';
                             }else{
                                 scope.backDatedTransactionsList[i].transactionAmount = obj.transactionAmount;
                                 scope.backDatedTransactionsList[i].actionName='CORRECTION';
                             }
                        }else{
                            scope.backDatedTransactionsList[i].transactionAmount = obj.transactionAmount;
                        }
                        if(scope.backDatedTransactionsList[i].actionName=='RECTIFY'){
                             scope.backDatedTransactionsList[i].actionName='CORRECTION';
                        }
                        scope.backDatedTransactionsList[i].transactionDate = obj.transactionDate;
                        scope.backDatedTransactionsList[i].note = obj.note;
                        scope.backDatedTransactionsList[i].checked = false;
                        if(errorData!=null && errorData[scope.backDatedTransactionsList[i].id] && errorData[scope.backDatedTransactionsList[i].id].length>0){
                             scope.backDatedTransactionsList[i].errMsg = errorData[scope.backDatedTransactionsList[i].id];
                             scope.errorExist = true;                           
                        }
                     }
                }
            }

            scope.backdatemodel = function () {

                $modal.open({
                        templateUrl: 'backdated.html',
                        controller: BackDatedCtrl,
                        resolve: {
                            items: function () {
                                return scope.backDatedTemplate;
                            }
                        }
                    });
            };
            
            scope.backDated = {};
            scope.backDated.masterCheckbox = false;
            

            scope.backDatedAllCheckBoxesMet = function() {
                var newValue = !scope.backDated.masterCheckbox;
                if(!angular.isUndefined(scope.backDatedTransactionsList)) {
                    for (var i = scope.backDatedTransactionsList.length - 1; i >= 0; i--) {
                        scope.backDatedTransactionsList[i].checked = newValue;
                    };
                }
            }
            scope.getTotalCount = function(){
                var totalCount = 0;
                for(var i in scope.backDatedTransactionsList){                        
                    if(scope.backDatedTransactionsList[i].checked==true){
                        totalCount++;
                    }
                }
                return totalCount;
            }
            var BackDatedCtrl = function ($scope, $modalInstance, items) {
                $scope.backdatedTxn = function () {
                    scope.batchRequests = [];
                    var reqId = 1;
                    var d = {};
                    var bodyData = JSON.stringify(d);
                    var processedCount = 0;
                    var totalCount = scope.getTotalCount();
                    var failedList = {};                    
                    for(var i in scope.backDatedTransactionsList){                        
                        if(scope.backDatedTransactionsList[i].checked==true){
                            resourceFactory.checkerInboxResource.save({templateResource: scope.backDatedTransactionsList[i].id, command: "approve"}, {}, function (data) {
                                processedCount++;
                                if(totalCount==processedCount){
                                    scope.getBackDatedData(failedList);
                                }
                            }, function (data) {
                                processedCount++;
                                var url = data.config.url;
                                if(angular.isDefined(url)){
                                    var n = url.lastIndexOf("/");
                                    var res = url.substr(n+1);                                    
                                    if(data.data.errors.length>0){
                                       var errMsg =  data.data.errors[0].userMessageGlobalisationCode;
                                        failedList[res]=errMsg;
                                    }
                                }
                                if(totalCount==processedCount){
                                    scope.getBackDatedData(failedList);
                                }
                            });

                        }
                    }
                    $modalInstance.close('delete');
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }

        }
    });
    mifosX.ng.application.controller('TaskController', ['$scope', 'ResourceFactory', '$route', 'dateFilter', '$modal', '$location', 'PaginatorUsingOffsetService', mifosX.controllers.TaskController]).run(function ($log) {
        $log.info("TaskController initialized");
    });
}(mifosX.controllers || {}));
