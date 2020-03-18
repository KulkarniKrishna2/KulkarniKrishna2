(function (module) {
    mifosX.controllers = _.extend(module, {
        ReportActivityController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope, $sce, CommonUtilService) {
            scope.reportAvailble = false;
            scope.reports = [];
            scope.reportAvailble = scope.$parent.isReportAvailable;
            if(scope.$parent.taskData.taskActivity.configValues && scope.$parent.taskData.taskActivity.configValues.reports && scope.$parent.taskData.taskActivity.configValues.reports.length>0){
                scope.reports = scope.$parent.taskData.taskActivity.configValues.reports;
            }
            scope.reportActivityData = {};
            scope.reportActivityData.outputType = 'PDF';
            scope.reportActivityData.viewReport = true;
            scope.reportActivityData.hidePentahoReport = true;
            scope.reportActivityData.viewLoanReport = false;
            scope.reportActivityData.report = true;
            scope.reportActivityData.baseURL = $rootScope.hostUrl + API_VERSION + "/runreports/";
            scope.generateReport = function (reportData) {
                if(reportData.outputType){
                    scope.reportActivityData.outputType = reportData.outputType;
                }
                var url = scope.reportActivityData.baseURL+encodeURIComponent(reportData.name)+"?output-type=" + encodeURIComponent(scope.reportActivityData.outputType)+"&locale="+scope.optlang.code;
                var pm = reportData.param.split(",");
                if(pm.length>0){
                    for(var i in pm){
                        if(pm[i]!=""){
                            var val = scope.$parent.reportParams[pm[i]];
                            url =url+"&" + encodeURIComponent('R_'+pm[i]) + "=" + encodeURIComponent(val);
                        }                        
                    }                    
                }              
                // allow untrusted urls for iframe http://docs.angularjs.org/error/$sce/insecurl
                url = $sce.trustAsResourceUrl(url);
                http.get(url, { responseType: 'arraybuffer' }).
                success(function(data, status, headers, config) {
                    var contentType = headers('Content-Type');
                    var file = new Blob([data], { type: contentType });
                    var fileContent = URL.createObjectURL(file);
                    scope.viewReportDetails = $sce.trustAsResourceUrl(fileContent);
                    window.open(scope.viewReportDetails);
                });

            };
        }
    });
    mifosX.ng.application.controller('ReportActivityController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', '$sce', 'CommonUtilService', mifosX.controllers.ReportActivityController]).run(function ($log) {
        $log.info("ReportActivityController initialized");
    });
}(mifosX.controllers || {}));