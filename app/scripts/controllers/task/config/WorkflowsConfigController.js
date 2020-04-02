
(function (module) {
    mifosX.controllers = _.extend(module, {
        WorkflowsConfigController: function (scope, resourceFactory, location, translate, routeParams, dateFilter,$modal, $route,$upload, $rootScope,API_VERSION,commonUtilService) {

                 scope.workflowConfigsList = [];
                 scope.workflowIdentifier = "workflow";
            
                
                resourceFactory.workflowConfigResource.getAll({}, function (data) {
                    scope.workflowConfigsList = data;
                    resourceFactory.fileProcessIdentifierTemplateResource.get({fileProcessIdentifier:scope.workflowIdentifier}, function(template){
                        scope.workflowTemplate = template;
                        var url = {};
                        url = API_VERSION + '/fileprocess/template/' + scope.workflowTemplate.id + '/attachment';
                        scope.workflowTemplate.docUrl = url;
                    });
                });

                scope.addWorkflowSteps = function(taskConfigId){
                    location.path('/workflow/'+taskConfigId+'/addworkflowsteps')
                }

                scope.routeToView = function(taskConfigId){
                    location.path('/viewworkflow/'+ taskConfigId);
                }
                scope.upload = function (taskConfigId) {

                    $modal.open({
                        templateUrl: 'uploadfile.html',
                        controller: UploadFileCrl,
                        resolve: {
                        taskParams: function () {
                            return { 'taskConfigId': taskConfigId};
                        }
                    }
                    });
                };
                var UploadFileCrl = function ($scope, $modalInstance,taskParams) {
                
                    $scope.onFileSelect = function ($files) {
                        $scope.file = $files[0];
                    };
                    $scope.upload = function () {
                        if($scope.file) {
                        $upload.upload({
                            url:  $rootScope.hostUrl + API_VERSION + '/taskconfigs/'+taskParams.taskConfigId+'/taskconfigsteps/upload',
                            file: $scope.file
                        }).then(function (data) {
                        // to fix IE not refreshing the model
                            $modalInstance.dismiss('cancel');
                            location.path('/viewworkflow/'+routeParams.taskConfigId);
                        });
                    }
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                };
                scope.downloadTemplate = function(){
                    var url =$rootScope.hostUrl + scope.workflowTemplate.docUrl;
                    var fileType = scope.workflowTemplate.fileTemplatePath.substr(scope.workflowTemplate.fileTemplatePath.lastIndexOf('.') + 1);
                    commonUtilService.downloadFile(url,fileType,scope.workflowTemplate.fileTemplatePath);
                }
            
            
        }
    });
    mifosX.ng.application.controller('WorkflowsConfigController', ['$scope', 'ResourceFactory', '$location', '$translate', '$routeParams', 'dateFilter','$modal', '$route','$upload', '$rootScope','API_VERSION','CommonUtilService', mifosX.controllers.WorkflowsConfigController]).run(function ($log) {
        $log.info("WorkflowsConfigController initialized");
    });
}(mifosX.controllers || {}));