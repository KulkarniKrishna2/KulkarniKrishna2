(function (module) {
    mifosX.controllers = _.extend(module, { 
        AddSubActionController: function (scope, resourceFactory, location, routeParams, dateFilter, $modal,popUpUtilService) {
            scope.formData = [];
            scope.selectedSubActions = [];
            if(scope.actionGroupData){
                for(var i in scope.actionGroupData.actions){
                    var temp = {};
                    temp.actionType = scope.actionGroupData.actions[i].actionType;
                    temp.actionType.actionId = scope.actionGroupData.actions[i].id;
                    temp.roles = scope.actionGroupData.actions[i].accessRoles.slice();
                    if(scope.selectedActionId == scope.actionGroupData.actions[i].parentId){
                        scope.selectedSubActions.push(temp);
                    }
                    

                }
            }

            scope.addRolesToAction=function(){
                if(scope.formData.actionSelected != null){
                        var temp= {};
                         temp.actionType = JSON.parse(scope.formData.actionSelected);
                         temp.roles = scope.selectedRoles.slice();

                     scope.selectedSubActions.push(temp);
                     if(scope.actionGroupsTemplate && scope.actionGroupsTemplate.availableRoles){
                            scope.availableRoles = scope.actionGroupsTemplate.availableRoles.slice(); 
                            scope.selectedRoles = [];
                            scope.available = [];
                            scope.selected = [];
                     }
                     scope.formData.actionSelected = null;
                     for(var i in scope.actions){
                        if(scope.actions[i].id == temp.actionType.id){
                            scope.actions.splice(i,1);
                        }
                     }
                }
                
            }
            var InActivateActionGroupAlert = function ($scope, $modalInstance) {
                $scope.continue = function () {
                    $modalInstance.close('Close');
                     resourceFactory.inActivateActionGroupResource.update({actionGroupId:routeParams.actionGroupId,actionId : scope.tempActionId, command :"inactivate"},{}, function (data) {
                     });
                    delete scope.selectedSubActions[scope.tempId].actionType.actionId
                    scope.actions.push(scope.tempActiontype);
                    scope.selectedSubActions.splice(scope.tempId, 1);
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
                
            };
            scope.deleteActionRoles = function(idx){
                if (scope.selectedSubActions[idx].actionType.actionId) {
                    scope.tempId= idx;
                    scope.tempActionId = scope.selectedSubActions[idx].actionType.actionId;
                    scope.tempActiontype=scope.selectedSubActions[idx].actionType;
                    $modal.open({
                        templateUrl: 'inactivateactiongroupalert.html',
                        controller: InActivateActionGroupAlert
                    });
                }
                else {
                    scope.actions.push(scope.selectedSubActions[idx].actionType);
                    scope.selectedSubActions.splice(idx, 1);
                }
            }
            scope.close = function()
            {
                scope.modalInstance.dismiss('cancel');    
            }
            scope.submit = function(){
                for (var i in scope.selectedSubActions) {
                    var actionType = scope.selectedSubActions[i].actionType.id;
                        this.formData.push({ 'isActive': "true", 'actionType': actionType });
                }
                scope.errorDetails = [];
                if(routeParams.actionGroupId){
                    scope.formData.actionSelected = undefined;
                      resourceFactory.subActionResource.save({actionGroupId:routeParams.actionGroupId, actionId : scope.selectedActionId },this.formData,function (data) {
                        location.path('/viewactiongroup/'+routeParams.actionGroupId)
                     });
                  
            }
            scope.modalInstance.dismiss('');  
         }

       
        }   
    });
    mifosX.ng.application.controller('AddSubActionController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter','$modal','PopUpUtilService', mifosX.controllers.AddSubActionController]).run(function ($log) {
        $log.info("AddSubActionController initialized");
    });
}(mifosX.controllers || {}));
