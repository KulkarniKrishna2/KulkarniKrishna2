(function (module) {
    mifosX.controllers = _.extend(module, {
        TrackSmsController: function (scope, resourceFactory, location, routeParams, dateFilter, $modal) {
            scope.formData = {};
            scope.formData.locale = scope.optlang.code;
            scope.formData.dateFormat = scope.df;
            scope.totalSms = 0;
            scope.numberOfLogsPerPage = 15;
            scope.data = [];
            scope.searchedSmsData  = [];
            scope.searchSmsCurrentPage = 0;
            scope.isEmpty = false;
            scope.tabSelected = "allsms";
            scope.smsStatus = [{name:'SENT',value:200},{name:'PENDING',value:100},{name:'DELIVERED',value:300},
                {name:'FAILED',value:400}];

            scope.searchSms = function(){
               if(this.formData.toDate){
                    var toDate = dateFilter(this.formData.toDate,scope.formData.dateFormat);
                }
                if(this.formData.fromDate){
                    var fromDate = dateFilter(this.formData.fromDate,scope.formData.dateFormat);
                }
                var limit = scope.numberOfLogsPerPage;
                var offset = 0;
                if(scope.searchSmsCurrentPage != 0){
                    offset = ((scope.searchSmsCurrentPage - 1) * scope.numberOfLogsPerPage);
                }
                var params = {};
                params.limit = limit;
                params.offset = offset;
                params.toDate = toDate;
                params.fromDate = fromDate;
                params.locale = this.formData.locale;
                params.dateFormat = this.formData.dateFormat;
                params.status = this.formData.status;
                fetchQueriedSmsDetails(params);
            };

            scope.getAllQueriedSmsRecoresForPage = function(pageNumber){
                scope.searchSmsCurrentPage = pageNumber;
                if(this.formData.toDate){
                    var toDate = dateFilter(this.formData.toDate,scope.formData.dateFormat);
                }
                if(this.formData.fromDate){
                    var fromDate = dateFilter(this.formData.fromDate,scope.formData.dateFormat);
                }
                var limit = scope.numberOfLogsPerPage;
                var offset = ((pageNumber - 1) * scope.numberOfLogsPerPage);
                var limit = scope.numberOfLogsPerPage;
                var params = {};
                params.limit = limit;
                params.offset = offset;
                params.toDate = toDate;
                params.fromDate = fromDate;
                params.locale = this.formData.locale;
                params.dateFormat = this.formData.dateFormat;
                params.status = this.formData.status;
                fetchQueriedSmsDetails(params);
            }

            var fetchQueriedSmsDetails = function(params){
                scope.searchedSmsData = [];
                scope.totalSms = 0;
                 resourceFactory.smsResource.getAll(params,function(data){
                    scope.totalSms = data.totalFilteredRecords;
                    scope.searchedSmsData = data.pageItems;
                    if(scope.searchedSmsData.length ==0){
                        scope.isEmpty = true;
                    }else{
                        scope.isEmpty = false;
                    }
                });
            }


            scope.formatDate = function(date){
                if(date != undefined){
                    var d = new Date();
                    var month = parseInt(date[1])-1;
                    d.setFullYear(date[0], month, date[2]);
                    var sentdate = dateFilter(d,scope.df);
                    return sentdate;
                }else{
                    return "";
                }
            };

             var viewSmsDetailsCtrl= function ($scope, $modalInstance, smsDetial) {
                $scope.data = smsDetial;
                $scope.close = function () {
                    $modalInstance.close('close');
                };
                $scope.formatDate = function(date){
                if(date != undefined){
                    var d = new Date();
                    var month = parseInt(date[1])-1;
                    d.setFullYear(date[0], month, date[2]);
                    var sentdate = dateFilter(d,scope.df);
                    return sentdate;
                }else{
                    return "";
                }
            };
            };
            scope.openViewDetails = function (detail) {
                $modal.open({
                    templateUrl: 'viewDetail.html',
                    controller: viewSmsDetailsCtrl,
                    resolve: {
                        smsDetial: function () {
                            return detail;
                        }
                    }
                });
            };

        }
    });
    mifosX.ng.application.controller('TrackSmsController', ['$scope', 'ResourceFactory', '$location', '$routeParams','dateFilter','$modal', mifosX.controllers.TrackSmsController]).run(function ($log) {
        $log.info("TrackSmsController initialized");
    });
}(mifosX.controllers || {}));