(function (module) {
    mifosX.controllers = _.extend(module, {
        EodProcessController: function (scope, routeParams, resourceFactory,location,paginatorUsingOffsetService,dateFilter) {
            scope.searchConditions = {};
            scope.first = {};
            scope.accountClosurePerPage = 10;
          
            if(scope.response.uiDisplayConfigurations.eodProcess.isHiddenField) {
                scope.isEodWithoutWorkflowHidden= scope.response.uiDisplayConfigurations.eodProcess.isHiddenField.eodWithoutWorkflow;
            }

            resourceFactory.eodProcessTemplateResource.get(function (data) {
                scope.offices = data.officeOptions;
                scope.eodClosureTypeOptions = data.eodClosureTypeOptions;
                scope.searchConditions.officeId=scope.offices[0].id;

            });

            var fetchFunction = function (offset, limit, callback) {
                resourceFactory.eodProcessResource.getAll({
                    searchConditions: scope.searchConditions,
                    offset: offset,
                    limit: limit,
                    orderBy: 'eodDate',
                    sortOrder : 'DESC'
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

            scope.getOfficeName=function(officeName,officeReferenceNumber){
                if(!scope.isReferenceNumberAsNameEnable){
                    return officeName;
                }else{
                    return officeName+ ' - ' + officeReferenceNumber;
                }
            }
            scope.initiateEOD = function(){
                location.path('/initiateeodprocess');
            }
            scope.viewEODWorkflow = function(eodProcessId){
                location.path('/eodonboarding/create/'+ eodProcessId +'/workflow');
            }
            scope.rejectEOD = function(eodProcessId,index){
                resourceFactory.eodProcessResource.delete({eodProcessId:eodProcessId},function (data) {
                    if(data.resourceId){
                        scope.eodProcessDatas.currentPageItems.splice(index,1);
                    }
                });
            }

            scope.viewEOD = function(eodProcessId){
                location.path('/vieweodprocess/' + eodProcessId);
            }
            scope.createEOD = function(){
                location.path('/createeodprocess');
            }
        }
    });

    mifosX.ng.application.controller('EodProcessController', ['$scope', '$routeParams', 'ResourceFactory','$location','PaginatorUsingOffsetService','dateFilter', mifosX.controllers.EodProcessController]).run(function ($log) {
        $log.info("EodProcessController initialized");
    });
}(mifosX.controllers || {}));