(function (module) {
    mifosX.controllers = _.extend(module, {
        LoanScreenReportController: function (scope, resourceFactory, location, http, API_VERSION, routeParams, $rootScope, $sce, loanDetailsService) {
            scope.loandetails= $rootScope.headerLoanDetails;
            delete $rootScope.headerLoanDetails;
            scope.accountId = routeParams.loanId;
            resourceFactory.templateResource.get({entityId: 1, typeId: 0}, function (data) {
                scope.loanTemplateData = data;
            });
            scope.print = function (template) {
                var templateWindow = window.open('', 'Screen Report', 'height=400,width=600');
                templateWindow.document.write('<html><head>');
                templateWindow.document.write('</head><body>');
                templateWindow.document.write(template);
                templateWindow.document.write('</body></html>');
                templateWindow.print();
                templateWindow.close();
            };
            scope.getLoanTemplate = function (templateId) {
                scope.selectedTemplate = templateId;
                http({
                    method: 'POST',
                    url: $rootScope.hostUrl + API_VERSION + '/templates/' + templateId + '?loanId=' + routeParams.loanId,
                    data: {}
                }).then(function (data) {
                        scope.template =  $sce.trustAsHtml(data.data);
                    });
            };
            scope.getStatusCode = function () {
                return loanDetailsService.getStatusCode(scope.loandetails);
            };
        }
    });
    mifosX.ng.application.controller('LoanScreenReportController', ['$scope', 'ResourceFactory', '$location', '$http', 'API_VERSION', '$routeParams', '$rootScope', '$sce', 'LoanDetailsService' , mifosX.controllers.LoanScreenReportController]).run(function ($log) {
        $log.info("LoanScreenReportController initialized");
    });
}(mifosX.controllers || {}));
