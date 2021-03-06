(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewReportsController: function (scope, routeParams, resourceFactory, location, route, $rootScope,API_VERSION,commonUtilService) {
            scope.reports = [];
            scope.reportCagegories = [] ;
            scope.requestoffset=0;
            scope.limit = 10;
            scope.baseUri = $rootScope.hostUrl+API_VERSION+'/files/';
            scope.isS3Enabled = scope.isSystemGlobalConfigurationEnabled(scope.globalConstants.AMAZON_S3);
            scope.routeTo = function (report) {
                location.path('/run_report/' + report.reportName).search({reportId: report.id, type: report.reportType});
            };
            scope.favourites = [];

            resourceFactory.codeValueByCodeNameResources.get({codeName: "Report Classification"}, function (codeValueData) {
                scope.reportCagegories = codeValueData;
            });



            if (!scope.searchCriteria.reports) {
                scope.searchCriteria.reports = null;
                scope.saveSC();
            }
            scope.filterText = scope.searchCriteria.reports;

            scope.addLocaleReportName = function (){
                if(document.getElementsByName("locale_name") != undefined && scope.reports){
                    if(scope.reports[0] && scope.reports[0].report_locale_name == undefined){
                        var result = document.getElementsByName("locale_name");
                        for(var i=0; i<result.length; i++) {
                            scope.reports[i].report_locale_name = result[i].value;
                        }
                        //console.log(JSON.stringify(scope.reports));
                    }
                    scope.onFilter();
                }
            };

            scope.onFilter = function () {
                scope.searchCriteria.reports = scope.filterText;
                scope.saveSC();
            };

            scope.loanReports = function(codeValue) {
                console.log(codeValue.id) ;
                resourceFactory.reportsByCategoryResource.get({id: codeValue.id}, function (data) {
                    scope.reports = data ;
                });
            } ;

            scope.getFavouriteReports = function () {
                resourceFactory.favouriteReportsResource.get({favourite  : true}, function (data) {
                    scope.favourites = data;
                });
            };

            scope.toggleFavorite = function (report) {
                if (!report.isFavourite) {
                    resourceFactory.favouriteReportsResourceByReportId.save({ id: report.id }, function (data) {
                        report.isFavourite = true;
                    });
                }
                else {
                    resourceFactory.favouriteReportsResourceByReportId.delete({ id: report.id }, function (data) {
                        report.isFavourite = false;
                    });
                }
            };

            scope.unMarkFavourite = function (report) {
                resourceFactory.favouriteReportsResourceByReportId.delete({ id: report.id }, function (data) {
                    scope.getFavouriteReports();
                });
            };

            scope.reportrequests = function(){
                resourceFactory.advancedReportsResource.get({offset: scope.requestoffset,limit:scope.limit}, function (data) {
                scope.reportrequestsData = data;
            });
            }

            scope.previousReportRequest= function(){
                if(scope.requestoffset != 0){
                    scope.requestoffset = scope.requestoffset - scope.limit;
                    if(scope.requestoffset <= 0){
                        scope.requestoffset = 0;
                    }
                    scope.reportrequests();
                }
            } 

            scope.nextReportRequest= function(){
                if(scope.reportrequestsData.length == scope.limit){
                    scope.requestoffset = scope.requestoffset + scope.limit;
                    scope.reportrequests();
                }
            } 

            scope.download = function(fileId,reportName){
                resourceFactory.fileUrlResource.get({fileId: fileId},function(data){
                    var url = data.locationPath;
                    
                        url = $rootScope.hostUrl+API_VERSION+'/'+url;
                        commonUtilService.downloadFile(url,data.contentType.toLowerCase(),reportName);
                    
                });
            }
            scope.rerunreport = function (report) {
                $rootScope.retryReportData = report;
                location.path('/run_report/' + report.reportName).search({reportId: report.reportId, type: report.reportType});
            }
        }
    });
    mifosX.ng.application.controller('ViewReportsController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route','$rootScope','API_VERSION','CommonUtilService', mifosX.controllers.ViewReportsController]).run(function ($log) {
        $log.info("ViewReportsController initialized");
    });
}(mifosX.controllers || {}));