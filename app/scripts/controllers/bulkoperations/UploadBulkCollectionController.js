(function (module) {
    mifosX.controllers = _.extend(module, {
        UploadBulkCollectionController: function (scope, resourceFactory, location, http, routeParams, API_VERSION, $upload, $rootScope) {
            scope.file = [];
            scope.cifFileSize = null;
            scope.ciffile = null;
            scope.banks = [];
            scope.isCPIFNotSlected = false;
            scope.onFileSelect = function ($files) {
                scope.ciffile = $files[0];
                scope.cifFileSize = $files[0].size;
            };
            
            scope.submit = function () {
                if(scope.ciffile == null){
                    scope.isCPIFNotSlected = true;
                    return false;
                }
                scope.formData.cifFileSize = scope.cifFileSize;
                scope.file = [scope.ciffile];
                $upload.upload({
                    url: $rootScope.hostUrl + API_VERSION + '/bulkcollection',
                    data: scope.formData,
                    file: scope.file
                }).then(function (data) {
                    // to fix IE not refreshing the model
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                    location.path('/bulkcollection');
                });
            };
        }
    });
    mifosX.ng.application.controller('UploadBulkCollectionController', ['$scope', 'ResourceFactory', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.UploadBulkCollectionController]).run(function ($log) {
        $log.info("UploadBulkCollectionController initialized");
    });
}(mifosX.controllers || {}));