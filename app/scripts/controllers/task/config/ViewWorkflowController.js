
(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewWorkflowController: function (scope, resourceFactory, location, routeParams, dateFilter, $modal, $route,$upload, $rootScope,API_VERSION) {
            
            scope.taskConfigData = {};
            scope.taskConfigStepsData = [];
            scope.workflowStepsDatalist=[];
            scope.sortingLog = [];
            scope.formData={};
            scope.isTaskConfigEntityMappingDone = false;
            scope.taskConfigId = routeParams.taskConfigId;
            
            if(routeParams.taskConfigId){
                   resourceFactory.workflowConfigResource.get({taskConfigId:routeParams.taskConfigId}, function (data) {
                        scope.taskConfigData = data;
                        if(scope.taskConfigData && scope.taskConfigData.entityMappingType){
                           scope.isTaskConfigEntityMappingDone = true;
                        }
                   });
                   resourceFactory.workflowConfigStepsResource.getAll({taskConfigId:routeParams.taskConfigId}, function (data) {
                        scope.taskConfigStepsData = data;
                        scope.workflowStepsDatalist = data;
                   });
            }

            scope.editWorkflow = function(){
                location.path('/addworkflow/'+routeParams.taskConfigId)
            }

            scope.addWorkflowSteps = function(){
                location.path('/workflow/'+routeParams.taskConfigId+'/addworkflowsteps')
            }

            scope.viewWorkflowStep = function(workflowId, workflowStepId){
                location.path('/viewworkflowstep/'+ workflowId + '/' + workflowStepId)
            }


            scope.routeToView = function(){
                var taskConfigId = scope.taskConfigId;
                var entityType = scope.taskConfigData.entityMappingType.id;
                location.path('/viewworkflowentitymapping/'+ taskConfigId + '/'+ entityType);
            }
              
            scope.sortableOptions = {
                stop: function(e, ui) {
                    scope.sortingLog = [];
                  // this callback has the changed model
                  var logEntry = scope.taskConfigStepsData.map(function(i){
                    return i.id;
                  });
                  scope.sortingLog = logEntry.slice();
                }
            };

            scope.updateWorkflowStepOrder = function(){
                if(scope.sortingLog.length == 0){
                    scope.errorDetails = [];
                    return scope.errorDetails.push([{code: 'error.msg.workflow.step.order.not.changed'}]);
                }
                if(scope.errorDetails){
                    delete scope.errorDetails;
                }
                 this.formData.taskConfigStepsOrderArray = [];
                 for(var i= 0 ; i < scope.sortingLog.length ; i++ ){
                     this.formData.taskConfigStepsOrderArray.push({'id':scope.sortingLog[i],'stepOrder':(i+1)});
                 }
                 resourceFactory.workflowConfigStepsOderChangeResource.update({taskConfigId:routeParams.taskConfigId},this.formData,function (data) {
                    location.path('/viewworkflow/'+routeParams.taskConfigId)
                 });
            } 
            
            scope.defaultLandFunc = function(stepData){
                $modal.open({
                    templateUrl: 'defaultlandalert.html',
                    controller: MakeDefaultLandingStep,
                    backdrop: 'static',
                    resolve: {
                        stepData: function () {
                            return stepData;
                        }
                    }
                });
            };

            var MakeDefaultLandingStep = function ($scope, $modalInstance, stepData) {
				$scope.df = scope.df;
                $scope.submit = function () {
                    resourceFactory.workflowConfigDefaultStepResource.update({taskConfigId:routeParams.taskConfigId,taskConfigStepId:stepData.id},{},function (data) {
                        $modalInstance.close('defaultLandFunc');
                        $route.reload();
                     });
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                    $route.reload();
                };

                $scope.close = function () {
                    $modalInstance.dismiss('close');
                    $route.reload();
                };
            };
            var activeMembers = 0;
            var getActiveMembers = function(groupId){
                activeMembers = 0;
                if(scope.centerDetails.subGroupMembers){
                    for(var i in scope.centerDetails.subGroupMembers){
                        if(groupId == scope.centerDetails.subGroupMembers[i].id){
                            for(var j in scope.centerDetails.subGroupMembers[i].memberData){
                                if(scope.centerDetails.subGroupMembers[i].memberData && (scope.centerDetails.subGroupMembers[i].memberData[j].status.value =='Active' || scope.centerDetails.subGroupMembers[i].memberData[j].status.value == 'Transfer in progress')){
                                    activeMembers = activeMembers + 1;
                                }
                            }

                    }   }    
                }
            }

            scope.createMemberInGroup = function (groupId, officeId) {
                scope.exceedMaxSubGroupLimit = false;
                getActiveMembers(groupId);
                if(scope.isMaxClientInGroupEnable  && (scope.maxClientLimit <= activeMembers)){
                    scope.exceedMaxLimit = true;
                }else{
                    $modal.open({
                        templateUrl: 'views/task/popup/createmember.html',
                        controller: CreateMemberCtrl,
                        backdrop: 'static',
                        windowClass: 'app-modal-window-full-screen',
                        size: 'lg',
                        resolve: {
                            groupParameterInfo: function () {
                                return { 'groupId': groupId, 'officeId': officeId };
                            }
                        }
                    });
                }
            }

            scope.upload = function () {
                $modal.open({
                    templateUrl: 'uploadfile.html',
                    controller: UploadFileCrl
                });
            };
            var UploadFileCrl = function ($scope, $modalInstance) {
                
                $scope.onFileSelect = function ($files) {
                    $scope.file = $files[0];
                };
                $scope.upload = function () {
                   if ($scope.file) {
                        $upload.upload({
                            url:  $rootScope.hostUrl + API_VERSION + '/taskconfigs/'+routeParams.taskConfigId+'/taskconfigsteps/upload',
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
            
        }
    });
    mifosX.ng.application.controller('ViewWorkflowController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', '$modal', '$route','$upload', '$rootScope','API_VERSION', mifosX.controllers.ViewWorkflowController]).run(function ($log) {
        $log.info("ViewWorkflowController initialized");
    });
}(mifosX.controllers || {}));
