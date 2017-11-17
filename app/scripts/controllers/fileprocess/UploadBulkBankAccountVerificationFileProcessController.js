(function (module) {
    mifosX.controllers = _.extend(module, {
        UploadBulkBankAccountVerificationFileProcessController: function (scope, resourceFactory, location, routeParams, API_VERSION, $upload, $rootScope) {

            scope.formData = {};
            resourceFactory.fileProcessTemplateResource.get({},function(data){
                scope.fileProcessTypeOptions = data.fileProcessTypeOptions;
                for(var i in scope.fileProcessTypeOptions){
                    if(scope.fileProcessTypeOptions[i].systemCode == 'bankAccountVerification'){
                        scope.formData.fileProcessType = scope.fileProcessTypeOptions[i].systemCode;
                        break;
                    }
                }
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
                        location.path('/bulkbankaccountverification');
                    });
                }
            };
        }
    });
    mifosX.ng.application.controller('UploadBulkBankAccountVerificationFileProcessController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.UploadBulkBankAccountVerificationFileProcessController]).run(function ($log) {
        $log.info("UploadBulkBankAccountVerificationFileProcessController initialized");
    });
}(mifosX.controllers || {}));