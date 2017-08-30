(function (module) {
    mifosX.controllers = _.extend(module, {
        ClientDocumentController: function (scope, location, http, routeParams, API_VERSION, $upload, $rootScope, resourceFactory) {
            scope.clientId = routeParams.clientId;
            scope.formData = {} ;
            scope.onFileSelect = function ($files) {
                scope.file = $files[0];
            };

            resourceFactory.codeValueByCodeNameResources.get({codeName: "Client Document Tags"}, function (codeValueData) {
                scope.documentTagOptions = codeValueData;
            });

            scope.submit = function () {
                $upload.upload({
                    url: $rootScope.hostUrl + API_VERSION + '/clients/' + scope.clientId + '/documents',
                    data: scope.formData,
                    file: scope.file
                }).then(function (data) {
                        // to fix IE not refreshing the model
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                        location.path('/viewclient/' + scope.clientId);
                    });
            };
        }
    });
    mifosX.ng.application.controller('ClientDocumentController', ['$scope', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'ResourceFactory', mifosX.controllers.ClientDocumentController]).run(function ($log) {
        $log.info("ClientDocumentController initialized");
    });
}(mifosX.controllers || {}));