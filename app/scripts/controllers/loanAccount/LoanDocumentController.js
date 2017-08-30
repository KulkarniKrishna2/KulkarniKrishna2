(function (module) {
    mifosX.controllers = _.extend(module, {
        LoanDocumentController: function (scope, location, http, routeParams, API_VERSION, $upload, $rootScope, resourceFactory) {
            scope.loanId = routeParams.loanId;
            scope.formData = {} ;
            scope.onFileSelect = function ($files) {
                scope.file = $files[0];
            };

            resourceFactory.codeValueByCodeNameResources.get({codeName: "Loan Document Tags"}, function (codeValueData) {
                scope.documentTagOptions = codeValueData;
            });

            scope.submit = function () {
                $upload.upload({
                    url: $rootScope.hostUrl + API_VERSION + '/loans/' + scope.loanId + '/documents',
                    data: scope.formData,
                    file: scope.file
                }).then(function (data) {
                        // to fix IE not refreshing the model
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                        location.path('/viewloanaccount/' + scope.loanId);
                    });
            };
        }
    });
    mifosX.ng.application.controller('LoanDocumentController', ['$scope', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'ResourceFactory', mifosX.controllers.LoanDocumentController]).run(function ($log) {
        $log.info("LoanDocumentController initialized");
    });
}(mifosX.controllers || {}));