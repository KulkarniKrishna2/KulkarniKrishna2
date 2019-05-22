(function (module) {
    mifosX.controllers = _.extend(module, {
        AssignFundController: function (scope, resourceFactory, location, http, routeParams, API_VERSION, $upload, $rootScope) {

            scope.file = [];
            scope.csvFileSize = null;
            scope.csvFile = null;
            scope.isFileNotSlected = false;
            scope.funds = [];
            scope.isSuccess = false;
            scope.showSelectFileErrMsg = false;
            resourceFactory.fundsResource.getAllFunds({command:'active'},function (data) {
                scope.funds = data;
            });
            scope.onFileSelect = function ($files) {
                scope.csvFile = $files[0];
                scope.csvFileSize = $files[0].size;
            };

            scope.submit = function () {
                scope.showSelectFileErrMsg = false;
                scope.file = [scope.csvFile];
                scope.isSuccess = false;
                scope.formData.csvFileSize = scope.csvFileSize;
                if (scope.csvFileSize > 0) {
                    $upload.upload({
                        url: $rootScope.hostUrl + API_VERSION + '/funds/' + scope.formData.fund + '/assign',
                        data: scope.formData,
                        file: scope.file
                    }).then(function(data) {
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                        scope.isSuccess = true;
                        var index = scope.funds.findIndex(x => x.id == scope.formData.fund)
                        if (index > -1) {
                            scope.fundName = scope.funds[index].name;
                        }
                    });
                } else {
                    scope.showSelectFileErrMsg = true;
                }
            };
        }
    });
    mifosX.ng.application.controller('AssignFundController', ['$scope', 'ResourceFactory', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.AssignFundController]).run(function ($log) {
        $log.info("AssignFundController initialized");
    });
}(mifosX.controllers || {}));
