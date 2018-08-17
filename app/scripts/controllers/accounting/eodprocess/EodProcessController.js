(function (module) {
    mifosX.controllers = _.extend(module, {
        EodProcessController: function (scope, routeParams, resourceFactory,location,paginatorUsingOffsetService,dateFilter) {
            scope.searchConditions = {};
            scope.first = {};
            scope.accountClosurePerPage = 10;

            resourceFactory.eodProcessTemplateResource.get(function (data) {
                scope.offices = data.officeOptions;
                scope.eodClosureTypeOptions = data.eodClosureTypeOptions;
                scope.searchConditions.officeId=scope.offices[0].id;

            });

            var fetchFunction = function (offset, limit, callback) {
                resourceFactory.eodProcessResource.getAll({
                    searchConditions: scope.searchConditions,
                    offset: offset,
                    limit: limit
                }, callback);
            };
            
            scope.searchConditions = {};
            scope.searchData = function () {
                if(!_.isUndefined(scope.first.fromDate)){
                    var fromDate = dateFilter(scope.first.fromDate, 'yyyy-MM-dd');
                    this.searchConditions.fromDate = fromDate;
                }
                if(!_.isUndefined(scope.first.toDate)){
                    var toDate = dateFilter(scope.first.toDate, 'yyyy-MM-dd');
                    this.searchConditions.toDate = toDate;
                }
                if(this.searchConditions.showPendingEod == 'false'){
                    delete this.searchConditions.showPendingEod;
                }
                if(this.searchConditions.officeId == null){
                    delete this.searchConditions.officeId;
                }
                if(this.searchConditions.eodClosureTypeId == null){
                    delete this.searchConditions.eodClosureTypeId;
                }
                scope.eodProcessDatas = paginatorUsingOffsetService.paginate(fetchFunction, scope.accountClosurePerPage);

            };
            scope.searchData();


            scope.initiateEOD = function(){
                location.path('/initiateeodprocess');
            }
            scope.viewEOD = function(eodProcessId){
                location.path('/eodonboarding/create/'+ eodProcessId +'/workflow');
            }
            scope.rejectEOD = function(eodProcessId){
                resourceFactory.eodProcessResource.delete({eodProcessId:eodProcessId},function (data) {
                    scope.searchData();
                });
            }
        }
    });

    mifosX.ng.application.controller('EodProcessController', ['$scope', '$routeParams', 'ResourceFactory','$location','PaginatorUsingOffsetService','dateFilter', mifosX.controllers.EodProcessController]).run(function ($log) {
        $log.info("EodProcessController initialized");
    });
}(mifosX.controllers || {}));