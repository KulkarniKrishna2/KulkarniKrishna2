(function (module) {
    mifosX.controllers = _.extend(module, {
        clientdocumentActivityController: function (scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION, $upload, $rootScope) {
            scope.onFileSelect = function ($files) {
                scope.file = $files[0];
            };
            
            function initTask(){
                scope.clientId = scope.taskconfig['clientId'];
                getClientDocuments();
            };

            initTask();

            scope.clientdocuments = [];

            function getClientDocuments() {
                resourceFactory.clientDocumentsResource.getAllClientDocuments({clientId: scope.clientId}, function (data) {
                    for (var l in data) {

                        var loandocs = {};
                        loandocs = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                        data[l].docUrl = loandocs;
                    }
                    scope.clientdocuments = data;
                });
            };

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
                        scope.$emit("activityDone",{});
                        getClientDocuments();
                    });
            };
        }
    });
    mifosX.ng.application.controller('clientdocumentActivityController', ['$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.clientdocumentActivityController]).run(function ($log) {
        $log.info("ClientDocumentController initialized");
    });
}(mifosX.controllers || {}));