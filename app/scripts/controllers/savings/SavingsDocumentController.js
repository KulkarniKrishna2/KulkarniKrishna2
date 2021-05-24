(function (module) {
    mifosX.controllers = _.extend(module, {
        SavingsDocumentController: function (scope, location, http, routeParams, API_VERSION, $upload, $rootScope, resourceFactory) {
            scope.savingsId = routeParams.savingsId;
            scope.formData = {} ;
            scope.onFileSelect = function ($files) {
                scope.file = $files[0];
            };

            resourceFactory.codeValueByCodeNameResources.get({codeName: "Savings Document Tags"}, function (codeValueData) {
                scope.documentTagOptions = codeValueData;
            });

            scope.submit = function () {
                $upload.upload({
                    url: $rootScope.hostUrl + API_VERSION + '/savings/' + scope.savingsId + '/documents',
                    data: scope.formData,
                    file: scope.file
                }).then(function (data) {
                        // to fix IE not refreshing the model
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                        location.path('/viewsavingaccount/' + scope.savingsId);
                    });
            };
        }
    });
    mifosX.ng.application.controller('SavingsDocumentController', ['$scope', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'ResourceFactory', mifosX.controllers.SavingsDocumentController]).run(function ($log) {
        $log.info("SavingsDocumentController initialized");
    });
}(mifosX.controllers || {}));