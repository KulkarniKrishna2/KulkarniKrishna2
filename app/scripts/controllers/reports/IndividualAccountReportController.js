(function (module) {
    mifosX.controllers = _.extend(module, {
        IndividualAccountReportController: function (scope, resourceFactory, location, http, API_VERSION, routeParams, $rootScope, $sce) {
            scope.accountId = routeParams.id;
            scope.action = routeParams.action || "";
            scope.formData = {};
            scope.formData.outputType = "HTML";

            if(scope.action == 'clientprofilereports') {
                scope.formData.entityId = 1;
            } else if(scope.action == 'loanaccountreports') {
                scope.formData.entityId = 2;
            } else {
                scope.formData.entityId = 3;
            }

            resourceFactory.reportsByEntityResource.get({id: scope.formData.entityId}, function (data) {
                scope.reportdetails = data;
            });

            
            scope.submit = function () {

                this.formData.accountId = scope.accountId;
                this.formData.reportdetail = scope.reportdetail;

                var reportURL = $rootScope.hostUrl + API_VERSION + "/runreports/" + encodeURIComponent(this.formData.reportName);
                                reportURL += "?output-type=" + encodeURIComponent(scope.formData.outputType) + "&locale=" + scope.optlang.code + "&dateFormat=" + scope.df;
                            
                var inQueryParameters = null;

                    if(scope.formData.entityId == 1){
                        inQueryParameters = "R_clientId="
                    }else if(scope.formData.entityId == 2){
                        inQueryParameters = "R_loanId="
                    } else{
                        inQueryParameters = "R_savingId="
                    }

                        inQueryParameters = inQueryParameters+scope.accountId;

                    if (inQueryParameters > "") reportURL += "&" + inQueryParameters;

                        // Allow untrusted urls for the ajax request.
                        // http://docs.angularjs.org/error/$sce/insecurl
                reportURL = $sce.trustAsResourceUrl(reportURL);

                http.get(reportURL, {responseType: 'arraybuffer'}).
                    success(function(data, status, headers, config) {
                        var contentType = headers('Content-Type');
                        var file = new Blob([data], {type: contentType});
                        var fileContent = URL.createObjectURL(file);

                            // Pass the form data to the iframe as a data url.
                        scope.baseURL = $sce.trustAsResourceUrl(fileContent);
                    });                            
            }
            
        }
    });
    mifosX.ng.application.controller('IndividualAccountReportController', ['$scope', 'ResourceFactory', '$location', '$http', 'API_VERSION', '$routeParams', '$rootScope', '$sce', mifosX.controllers.IndividualAccountReportController]).run(function ($log) {
        $log.info("IndividualAccountReportController initialized");
    });
}(mifosX.controllers || {}));