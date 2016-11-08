(function (module) {
    mifosX.controllers = _.extend(module, {
        AuditReportController: function (scope, resourceFactory, paginatorService, dateFilter, location) {
            scope.users = [];
            scope.formData = {};
            scope.initialUser = {id:-1,username:"ALL"};
            scope.initialReport = {id:-1,reportName:"ALL"};
            scope.reportPerPage = 7;
            scope.getData = function(){
                resourceFactory.userListResource.getAllUsers(function(data){
                    scope.addAllToList(data,"user");
                });
                resourceFactory.reportsResource.getAll({usageTrackingEnabledOnly  : true},function(data){
                    scope.addAllToList(data,"report");
                });
            };
            scope.getData();
            scope.addAllToList = function(data,type){
                scope.tmp =[];
                if(type=='user'){
                    scope.tmp[0] = scope.initialUser;
                }else{
                    scope.tmp[0] = scope.initialReport;
                }
                for(var i=0;i<data.length;i++){
                    scope.tmp[parseInt(i+1)] = data[i];
                }
                if(type=='user'){
                    scope.users = scope.tmp;
                    scope.formData.userId = scope.users[0].id;
                }else{
                    scope.reports = scope.tmp;
                    scope.formData.reportId = scope.reports[0].id;
                }


            };

            scope.submit = function(){
                scope.initPage();
            }

            scope.getResultsPage = function(pageNumber){
                var params = {};
                params.offset = ((pageNumber - 1) * scope.reportPerPage);
                params.limit = scope.reportPerPage;
                params.locale = scope.optlang.code;
                params.dateFormat = scope.df;
                params.userId = this.formData.userId;
                params.reportId = this.formData.reportId;
                params.orderBy = 'id';
                params.sortOrder = 'ASC';
                if(this.formData.hasOwnProperty('startDate')){
                    var fromDate = dateFilter(this.formData.startDate, scope.df);
                    params.fromDate = fromDate;
                }
                if(this.formData.hasOwnProperty('endDate')){
                    var endDate = dateFilter(this.formData.endDate, scope.df);
                    params.toDate = endDate;
                }
                resourceFactory.reportAuditResource.getAll(params,function (data) {
                    scope.reportAudits = data.pageItems;
                });
            }

            scope.initPage = function () {
                var params = {};
                params.offset = 0;
                params.limit = scope.reportPerPage;
                params.locale = scope.optlang.code;
                params.dateFormat = scope.df;
                params.userId = this.formData.userId;
                params.reportId = this.formData.reportId;
                params.orderBy = 'id';
                params.sortOrder = 'ASC';
                if(this.formData.hasOwnProperty('startDate')){
                    var fromDate = dateFilter(this.formData.startDate, scope.df);
                    params.fromDate = fromDate;
                }
                if(this.formData.hasOwnProperty('endDate')){
                    var endDate = dateFilter(this.formData.endDate, scope.df);
                    params.toDate = endDate;
                }
                var items = resourceFactory.reportAuditResource.getAll(params, function (data) {
                    scope.totalReportAudit = data.totalFilteredRecords;
                    scope.reportAudits = data.pageItems;
                });
            }

        }
    });
    mifosX.ng.application.controller('AuditReportController', ['$scope', 'ResourceFactory', 'PaginatorService', 'dateFilter', '$location', mifosX.controllers.AuditReportController]).run(function ($log) {
        $log.info("AuditReportController initialized");
    });
}(mifosX.controllers || {}));