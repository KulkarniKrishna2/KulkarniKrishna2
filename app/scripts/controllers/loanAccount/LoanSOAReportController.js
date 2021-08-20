(function (module) {
    mifosX.controllers = _.extend(module, {
        LoanSOAReportController: function (scope, location, http, API_VERSION, routeParams, $rootScope, $sce, loanDetailsService, dateFilter) {
            scope.loandetails= $rootScope.headerLoanDetails;
            delete $rootScope.headerLoanDetails;
            scope.accountId = routeParams.loanId;
            
            scope.restrictedDate = new Date();
            if (scope.loandetails && scope.loandetails.timeline && scope.loandetails.timeline.actualDisbursementDate) {
                scope.minDate = new Date(scope.loandetails.timeline.actualDisbursementDate);
            } else if (scope.loandetails && scope.loandetails.timeline && scope.loandetails.timeline.expectedDisbursementDate) {
                scope.minDate = new Date(scope.loandetails.timeline.expectedDisbursementDate);
            } else {
                scope.minDate = new Date();
            }
            if(scope.response  && scope.response.uiDisplayConfigurations &&
                scope.response.uiDisplayConfigurations.reportParameterConfiguration.datePicker.reportNames.indexOf(scope.reportName) > 0) {
                scope.restrictedDate = scope.response.uiDisplayConfigurations.reportParameterConfiguration.datePicker.restrictedDate;
            };

            scope.cancel = function () {
                location.path('/viewloanaccount/' + scope.accountId);
            };

            scope.reportGenerated = false;
            scope.formData = {};
            scope.formData.R_account = scope.accountId;
            scope.formData.R_ason = new Date();
            scope.formData.outputType = 'PDF';

            scope.submit = function () {
                scope.formData.R_ason = dateFilter(scope.formData.R_ason, 'yyyy-MM-dd');
                scope.baseURL = $rootScope.hostUrl + API_VERSION + "/runreports/" + encodeURIComponent("Statement of Account");
                scope.baseURL += "?output-type=" + encodeURIComponent(scope.formData.outputType) + "&locale=" + scope.optlang.code;

                var reportParams = "";
                var paramName = "R_ason";
                reportParams += encodeURIComponent(paramName) + "=" + encodeURIComponent(scope.formData.R_ason) + "&";
                paramName = "R_account";
                reportParams += encodeURIComponent(paramName) + "=" + encodeURIComponent(scope.accountId);
                if (reportParams > "") {
                    scope.baseURL += "&" + reportParams;
                }
                // allow untrusted urls for iframe http://docs.angularjs.org/error/$sce/insecurl
                baseURL = $sce.trustAsResourceUrl(scope.baseURL);

                http.get(baseURL, { responseType: 'arraybuffer' }).
                    success(function (data, status, headers, config) {
                        var contentType = headers('Content-Type');
                        var file = new Blob([data], { type: contentType });
                        var fileContent = URL.createObjectURL(file);
                        scope.reportGenerated = true;

                        scope.viewReportDetails = $sce.trustAsResourceUrl(fileContent);
                    });


            };

            scope.getStatusCode = function () {
                return loanDetailsService.getStatusCode(scope.loandetails);
            };
        }
    });
    mifosX.ng.application.controller('LoanSOAReportController', ['$scope', '$location', '$http', 'API_VERSION', '$routeParams', '$rootScope', '$sce', 'LoanDetailsService', 'dateFilter', mifosX.controllers.LoanSOAReportController]).run(function ($log) {
        $log.info("LoanSOAReportController initialized");
    });
}(mifosX.controllers || {}));
