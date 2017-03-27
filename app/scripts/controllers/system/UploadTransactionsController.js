(function (module) {
    mifosX.controllers = _.extend(module, {
        UploadTransactionsController: function (scope, resourceFactory, location, http, routeParams, API_VERSION, $upload, $rootScope) {

            scope.file = [];
            scope.fileSize = null;
            scope.file = null;
            scope.isFileNotSlected = false;
            scope.formData = {};

            scope.onFileSelect = function ($files) {
                scope.file = $files[0];
                scope.fileSize = $files[0].size;
            };

            scope.submit = function () {
                scope.file = scope.file;
                scope.formData.fileSize = scope.fileSize;
                $upload.upload({
                    url: $rootScope.hostUrl + API_VERSION + '/mandates?command=TRANSACTIONS_UPLOAD',
                    data: scope.formData,
                    file: scope.file
                }).then(function (data) {
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                    location.path('/viewmandates');
                });
            };
        }
    });
    mifosX.ng.application.controller('UploadTransactionsController', ['$scope', 'ResourceFactory', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.UploadTransactionsController]).run(function ($log) {
        $log.info("UploadTransactionsController initialized");
    });
}(mifosX.controllers || {}));
