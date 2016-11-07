(function (module) {
    mifosX.controllers = _.extend(module, {
        AuditReportController: function (scope, resourceFactory, paginatorService, dateFilter, location) {
            scope.users = [];
            scope.formData = {};
            scope.initialUser = {id:-1,username:"ALL"};
            scope.initialReport = {id:-1,reportName:"ALL"};
            scope.reportPerPage = 3;
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
                scope.searchCriteria = ' where ra.id > -1 ';
                if(this.formData.userId != -1){
                    scope.searchCriteria = scope.searchCriteria +' and ra.user_id = '+this.formData.userId;
                }
                if(this.formData.reportId != -1){
                    scope.searchCriteria = scope.searchCriteria +' and ra.report_id = '+this.formData.reportId;
                }
                if(this.formData.hasOwnProperty('startDate')){
                    scope.startDate =  new Date(dateFilter(this.formData.startDate,scope.df)).getTime();
                    scope.searchCriteria = scope.searchCriteria +' and (UNIX_TIMESTAMP( Date(ra.execution_start_date)) * 1000) >= '+scope.startDate ;
                }
                if(this.formData.hasOwnProperty('endDate')){
                    scope.endDate =  new Date(dateFilter(this.formData.endDate,scope.df)).getTime();
                    scope.searchCriteria = scope.searchCriteria +' and (UNIX_TIMESTAMP( Date(ra.execution_start_date)) * 1000) < '+ parseInt(parseInt(scope.endDate) + (24*3600*1000) ) ;
                }
                resourceFactory.reportAuditResource.getAll({command: scope.searchCriteria},function(data){
                    scope.totalReportAudit = data.length;
                });
                scope.getResultsPage(1);
            }

            scope.getResultsPage = function(pageNumber){
                scope.paginationCriteria = scope.searchCriteria+ " limit "+scope.reportPerPage +" offset "+((pageNumber - 1) * scope.reportPerPage);
                resourceFactory.reportAuditResource.getAll({command: scope.paginationCriteria},function(data){
                    scope.reportAudits = data;
                });
            }

        }
    });
    mifosX.ng.application.controller('AuditReportController', ['$scope', 'ResourceFactory', 'PaginatorService', 'dateFilter', '$location', mifosX.controllers.AuditReportController]).run(function ($log) {
        $log.info("AuditReportController initialized");
    });
}(mifosX.controllers || {}));