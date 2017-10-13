
(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateWorkflowEntityMappingController: function (scope, resourceFactory, location, routeParams, dateFilter) {
                 scope.formData = {};
                 scope.workflowEntityMappingTemplate = {};
                 scope.loanproducts=[];
                 scope.availableLoanProducts=[];
                 scope.available=[];
                 scope.selectedLoanProducts=[];
                 scope.selected=[];
                 scope.isLoanProductEntitySelected = false;
                 scope.formData.entityIds=[];
                 var taskConfigEnityTypeForLoanproduct=1;
                
                resourceFactory.workflowEntityMappingTemplate.getTemplate({}, function (data) {
                    scope.workflowEntityMappingTemplate = data;
                });
                

                scope.changeInEntityType=function(){
                    if(scope.formData.entityType == taskConfigEnityTypeForLoanproduct){
                        if(scope.loanproducts == undefined || scope.loanproducts.length == 0){
                            resourceFactory.loanProductResource.getAllLoanProducts({}, function(data){
                                    scope.loanproducts = data;
                                    scope.availableLoanProducts = scope.loanproducts;
                            })
                        }else{
                            scope.availableLoanProducts = scope.loanproducts;
                        }
                        scope.isLoanProductEntitySelected = true;

                    }else{
                        scope.availableLoanProducts=[];
                        scope.available=[];
                        scope.selectedLoanProducts=[];
                        scope.selected=[]
                        scope.isLoanProductEntitySelected = false;
                        scope.formData.entityIds=[];
                    }
                }

                scope.addLoanProduct = function () {
                    for (var i in this.available) {
                        for (var j in scope.availableLoanProducts) {
                            if (scope.availableLoanProducts[j].id == this.available[i]) {
                                var temp = {};
                                temp.id = this.available[i];
                                temp.name = scope.availableLoanProducts[j].name;
                                scope.selectedLoanProducts.push(temp);
                                scope.availableLoanProducts.splice(j, 1);
                            }
                        }
                    }
                    //We need to remove selected items outside of above loop. If we don't remove, we can see empty item appearing
                    //If we remove available items in above loop, all items will not be moved to selectedLoanProducts
                    for (var i in this.available) {
                        for (var j in scope.selectedLoanProducts) {
                            if (scope.selectedLoanProducts[j].id == this.available[i]) {
                                scope.available.splice(i, 1);
                            }
                        }
                    }
                };
                scope.removeLoanProduct = function () {
                    for (var i in this.selected) {
                        for (var j in scope.selectedLoanProducts) {
                            if (scope.selectedLoanProducts[j].id == this.selected[i]) {
                                var temp = {};
                                temp.id = this.selected[i];
                                temp.name = scope.selectedLoanProducts[j].name;
                                scope.availableLoanProducts.push(temp);
                                scope.selectedLoanProducts.splice(j, 1);
                            }
                        }
                    }
                    //We need to remove selected items outside of above loop. If we don't remove, we can see empty item appearing
                    //If we remove selected items in above loop, all items will not be moved to availableLoanProducts
                    for (var i in this.selected) {
                        for (var j in scope.availableLoanProducts) {
                            if (scope.availableLoanProducts[j].id == this.selected[i]) {
                                scope.selected.splice(i, 1);
                            }
                        }
                    }
                };

                scope.submit = function(){
                    scope.formData.locale = scope.optlang.code;
                    scope.formData.isActive = true;
                    scope.errorDetails=[];
                    scope.formData.entityIds=[]
                    if(scope.isLoanProductEntitySelected){
                        if(scope.selectedLoanProducts.length == 0)
                               return scope.errorDetails.push([{code: 'error.msg.validation.select.loanproducts'}]);
                        for(var i in scope.selectedLoanProducts){
                            scope.formData.entityIds.push(scope.selectedLoanProducts[i].id);
                        }
                       
                    }else{
                        //entityId = -1 represents for all entities of Corresponding TaskConfigEntityType except for TaskConfigEntityType.Loanproduct 
                        scope.formData.entityIds = [-1];
                    }
                    resourceFactory.workflowEntityMappingResource.save({taskConfigId : this.formData.taskConfigId}, this.formData, function (data) {
                       location.path('/viewworkflowentitymapping/'+scope.formData.taskConfigId+'/'+scope.formData.entityType);
                    });
                }
            
        }
    });
    mifosX.ng.application.controller('CreateWorkflowEntityMappingController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.CreateWorkflowEntityMappingController]).run(function ($log) {
        $log.info("CreateWorkflowEntityMappingController initialized");
    });
}(mifosX.controllers || {}));