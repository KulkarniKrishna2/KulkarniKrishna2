
(function (module) {
    mifosX.controllers = _.extend(module, {
        AddActionGroupsController: function (scope, resourceFactory, location, routeParams, dateFilter, $modal) {
                 scope.formData = {};
                 scope.actionGroupsTemplate = {};
                 scope.actions = [];
                 scope.available = [];
                 scope.selected = [];
                 scope.selectedRoles = [] ;
                 scope.availableRoles = [];
                 scope.selectedActionsWithRoles = [];
                 scope.actionGroupData = {};
                 scope.isCreateOperaion = true;
                 scope.tempActionId=null;
                resourceFactory.actionGroupsTemplateResource.getTemplate({}, function (data) {
                    scope.actionGroupsTemplate = data;
                    if(scope.actionGroupsTemplate && scope.actionGroupsTemplate.actions)
                        scope.actions = scope.actionGroupsTemplate.actions.slice();
                    if(scope.actionGroupsTemplate && scope.actionGroupsTemplate.availableRoles)
                        scope.availableRoles = scope.actionGroupsTemplate.availableRoles.slice();
                });

                if(routeParams.actionGroupId){
                   resourceFactory.actionGroupsResource.get({actionGroupId:routeParams.actionGroupId}, function (data) {
                        scope.actionGroupData = data;
                        if(scope.actionGroupData){
                           scope.formData.id = scope.actionGroupData.id;
                           scope.formData.actionGroupName = scope.actionGroupData.actionGroupName;
                           for(var i in scope.actionGroupData.actions){
                             var temp = {};
                                 temp.actionType = scope.actionGroupData.actions[i].actionType;
                                 temp.actionType.actionId = scope.actionGroupData.actions[i].id;
                                 temp.roles = scope.actionGroupData.actions[i].accessRoles.slice();
                                 scope.selectedActionsWithRoles.push(temp);
                                 for(var i in scope.actions){
                                        if(scope.actions[i].id == temp.actionType.id){
                                            scope.actions.splice(i,1);
                                        }
                                    }
                           }
                        }
                   }); 
                   scope.isCreateOperaion = false;
                }

                scope.addRole = function () {
                    for (var i in this.available) {
                        for (var j in scope.availableRoles) {
                            if (scope.availableRoles[j].id == this.available[i]) {
                                var temp = {};
                                temp.id = this.available[i];
                                temp.name = scope.availableRoles[j].name;
                                scope.selectedRoles.push(temp);
                                scope.availableRoles.splice(j, 1);
                            }
                        }
                    }
                    //We need to remove selected items outside of above loop. If we don't remove, we can see empty item appearing
                    //If we remove available items in above loop, all items will not be moved to selectedRoles
                    for (var i in this.available) {
                        for (var j in scope.selectedRoles) {
                            if (scope.selectedRoles[j].id == this.available[i]) {
                                scope.available.splice(i, 1);
                            }
                        }
                    }
                };
            scope.removeRole = function () {
                for (var i in this.selected) {
                    for (var j in scope.selectedRoles) {
                        if (scope.selectedRoles[j].id == this.selected[i]) {
                            var temp = {};
                            temp.id = this.selected[i];
                            temp.name = scope.selectedRoles[j].name;
                            scope.availableRoles.push(temp);
                            scope.selectedRoles.splice(j, 1);
                        }
                    }
                }
                //We need to remove selected items outside of above loop. If we don't remove, we can see empty item appearing
                //If we remove selected items in above loop, all items will not be moved to availableRoles
                for (var i in this.selected) {
                    for (var j in scope.availableRoles) {
                        if (scope.availableRoles[j].id == this.selected[i]) {
                            scope.selected.splice(i, 1);
                        }
                    }
                }
            };

            scope.addRolesToAction=function(){
                if(scope.formData.actionType && scope.selectedRoles.length >0){
                        var temp= {};
                         temp.actionType = JSON.parse(scope.formData.actionType);
                         temp.roles = scope.selectedRoles.slice();

                     scope.selectedActionsWithRoles.push(temp);
                     if(scope.actionGroupsTemplate && scope.actionGroupsTemplate.availableRoles){
                            scope.availableRoles = scope.actionGroupsTemplate.availableRoles.slice(); 
                            scope.selectedRoles = [];
                            scope.available = [];
                            scope.selected = [];
                     }
                     scope.formData.actionType = null;
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
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                    
            };

            scope.deleteActionRoles = function(idx){
                if(!scope.isCreateOperaion){
                     if(scope.selectedActionsWithRoles[idx].actionType.actionId){
                        scope.tempActionId=scope.selectedActionsWithRoles[idx].actionType.actionId;
                        $modal.open({
                            templateUrl: 'inactivateactiongroupalert.html',
                            controller: InActivateActionGroupAlert
                         });
                        delete scope.selectedActionsWithRoles[idx].actionType.actionId
                     }
                }
                scope.actions.push(scope.selectedActionsWithRoles[idx].actionType);
                scope.selectedActionsWithRoles.splice(idx,1);

            }
                   
            scope.submit = function(){
                this.formData.actions = [];
                this.formData.isActive = true;

                for(var i in scope.selectedActionsWithRoles){
                    var actionType = scope.selectedActionsWithRoles[i].actionType.id;
                    var roles = [];
                    for(var j in scope.selectedActionsWithRoles[i].roles){
                        roles.push(scope.selectedActionsWithRoles[i].roles[j].id);
                    }
                    this.formData.actions.push({'actionType' : actionType, 'roles' : roles});
                }
                scope.errorDetails = [];
                if(scope.formData.actions.length == 0)
                     return scope.errorDetails.push([{code: 'error.msg.validation.add.roles'}]);
                if(routeParams.actionGroupId){
                      resourceFactory.actionGroupsResource.update({actionGroupId:routeParams.actionGroupId},this.formData,function (data) {
                        location.path('/viewactiongroup/'+routeParams.actionGroupId)
                     });
                }else{
                    resourceFactory.actionGroupsResource.save(this.formData,function (data) {
                        location.path('/viewactiongroup/'+data.resourceId)
                     });
                }
                  
            } 
               
        }
    });
    mifosX.ng.application.controller('AddActionGroupsController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter','$modal', mifosX.controllers.AddActionGroupsController]).run(function ($log) {
        $log.info("AddActionGroupsController initialized");
    });
}(mifosX.controllers || {}));