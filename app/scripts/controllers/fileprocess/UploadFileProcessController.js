(function (module) {
    mifosX.controllers = _.extend(module, {
        UploadFileProcessController: function (scope, resourceFactory, location, routeParams, API_VERSION, $upload, $rootScope) {

            scope.formData = {};
            resourceFactory.fileProcessTemplateResource.get({},function(data){
                scope.fileProcessTypeOptions = data.fileProcessTypeOptions;
            });

            scope.onFileSelect = function ($files) {
                scope.file = $files[0];
            };
            scope.submit = function () {
                if (scope.formData.fileProcessType && scope.file) {
                    $upload.upload({
                        url:  $rootScope.hostUrl + API_VERSION + '/fileprocess/upload/'+scope.formData.fileProcessType,
                        data: scope.formData,
                        file: scope.file
                    }).then(function (data) {
                        // to fix IE not refreshing the model
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                        location.path('/fileprocess');
                    });
                }
            };
        }
    });
    mifosX.ng.application.controller('UploadFileProcessController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.UploadFileProcessController]).run(function ($log) {
        $log.info("UploadFileProcessController initialized");
    });
}(mifosX.controllers || {}));