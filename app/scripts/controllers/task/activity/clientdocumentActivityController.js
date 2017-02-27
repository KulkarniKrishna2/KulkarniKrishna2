(function (module) {
    mifosX.controllers = _.extend(module, {
        clientdocumentActivityController: function ($controller, scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION, $upload, $rootScope) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.onFileSelect = function ($files) {
                scope.file = $files[0];
            };
            
            function initTask(){
                scope.clientId = scope.taskconfig['clientId'];
                getClientDocuments();
                scope.formData = {};
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
            scope.deleteDocument = function (documentId, index) {
                resourceFactory.clientDocumentsResource.delete({clientId: scope.clientId, documentId: documentId}, '', function (data) {
                    scope.clientdocuments.splice(index, 1);
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
                        scope.activityDone();
                        getClientDocuments();
                        scope.formData = {};
                    });
            };
        }
    });
    mifosX.ng.application.controller('clientdocumentActivityController', ['$controller','$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.clientdocumentActivityController]).run(function ($log) {
        $log.info("clientdocumentActivityController initialized");
    });
}(mifosX.controllers || {}));