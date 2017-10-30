
(function (module) {
    mifosX.controllers = _.extend(module, {
        AddWorkflowController: function (scope, resourceFactory, location, routeParams, dateFilter) {
                 scope.formData = {};

                if(routeParams.taskConfigId){
                   resourceFactory.workflowConfigResource.get({taskConfigId:routeParams.taskConfigId}, function (data) {
                        scope.taskConfigData = data;
                        if(scope.taskConfigData){
                           scope.formData.id = scope.taskConfigData.id;
                           scope.formData.name = scope.taskConfigData.name;
                           scope.formData.shortName = scope.taskConfigData.shortName;
                        }
                   });
                }

                   
            scope.submit = function(){
                this.formData.locale = scope.optlang.code;

                if(routeParams.taskConfigId){
                      resourceFactory.workflowConfigResource.update({taskConfigId:routeParams.taskConfigId},this.formData,function (data) {
                        location.path('/viewworkflow/'+routeParams.taskConfigId)
                     });
                }else{
                    //TaskType.WORKFLOW = 1; TaskType.SINGLE = 2;
                    this.formData.taskType = 1;
                    this.formData.isActive = true;
                    resourceFactory.workflowConfigResource.save(this.formData,function (data) {
                        location.path('/viewworkflow/'+data.resourceId);
                     });
                }
                  
            } 
               
        }
    });
    mifosX.ng.application.controller('AddWorkflowController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.AddWorkflowController]).run(function ($log) {
        $log.info("AddWorkflowController initialized");
    });
}(mifosX.controllers || {}));