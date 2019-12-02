(function (module) {
    mifosX.controllers = _.extend(module, {
        UploadFileProcessController: function (scope, resourceFactory, location, routeParams, API_VERSION, $upload, $rootScope) {
            
            scope.fileProcessIdentifier = routeParams.fileProcessIdentifier;
            scope.formData = {};
            scope.isSourceTypeReq = false;
            resourceFactory.fileProcessTypeTemplateResource.get({},function(data){
                scope.fileProcessTypeOptions = data;
                scope.formData.fileProcessType = scope.fileProcessIdentifier;
                scope.getSourceType(data);
            });

            scope.getSourceType = function (data) {
                for(var i =0 ; i<data.length ; i++) {
                    if(data[i].fileProcessSubIdentifier) {
                        scope.sourceType = data[i].fileProcessSubIdentifier;
                        break;
                    }
                }
            };

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
            
            scope.onFileProcessTypeChange= function(fileProcessTypeSystemCode){
                if(fileProcessTypeSystemCode == 'sanctionedButNotDisbursed' || fileProcessTypeSystemCode == 'bulkCBApproval' || fileProcessTypeSystemCode == 'bookedButNotDisbursed'){
                    scope.isSourceTypeReq = true;
                }else{
                     scope.isSourceTypeReq = false;
                }
            }
        }
    });
    mifosX.ng.application.controller('UploadFileProcessController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.UploadFileProcessController]).run(function ($log) {
        $log.info("UploadFileProcessController initialized");
    });
}(mifosX.controllers || {}));