(function (module) {
    mifosX.controllers = _.extend(module, {
        FileProcessController: function (scope, location, routeParams, API_VERSION, $upload, $rootScope) {
            scope.formData = {};
            scope.onFileSelect = function ($files) {
                scope.file = $files[0];
            };
            scope.submit = function () {
                $upload.upload({
                    url:  $rootScope.hostUrl + API_VERSION + '/fileprocess/snd',
                    data: scope.formData,
                    file: scope.file
                }).then(function (data) {
                    // to fix IE not refreshing the model
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                });
            };
        }
    });
    mifosX.ng.application.controller('FileProcessController', ['$scope', '$location', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.FileProcessController]).run(function ($log) {
        $log.info("FileProcessController initialized");
    });
}(mifosX.controllers || {}));