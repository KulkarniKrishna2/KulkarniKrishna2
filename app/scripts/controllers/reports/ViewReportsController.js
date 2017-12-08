(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewReportsController: function (scope, routeParams, resourceFactory, location, route) {
            scope.reports = [];
            scope.reportCagegories = [] ;
            scope.routeTo = function (report) {
                location.path('/run_report/' + report.reportName).search({reportId: report.id, type: report.reportType});
            };

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
                    if(scope.reports[0].report_locale_name == undefined){
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
        }
    });
    mifosX.ng.application.controller('ViewReportsController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.ViewReportsController]).run(function ($log) {
        $log.info("ViewReportsController initialized");
    });
}(mifosX.controllers || {}));