
(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewWorkflowController: function (scope, resourceFactory, location, routeParams, dateFilter, $modal) {
            
            scope.taskConfigData = {};
            scope.taskConfigStepsData = [];
            scope.workflowStepsDatalist=[];
            scope.sortingLog = [];
            scope.formData={};

            if(routeParams.taskConfigId){
                   resourceFactory.workflowConfigResource.get({taskConfigId:routeParams.taskConfigId}, function (data) {
                        scope.taskConfigData = data;
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
                  scope.errorDetails = [];
                 if(scope.sortingLog.length == 0){
                       return scope.errorDetails.push([{code: 'error.msg.workflow.step.order.not.changed'}]);
                   }
                 this.formData.taskConfigStepsOrderArray = [];
                 for(var i= 0 ; i < scope.sortingLog.length ; i++ ){
                     this.formData.taskConfigStepsOrderArray.push({'id':scope.sortingLog[i],'stepOrder':(i+1)});
                 }
                 resourceFactory.workflowConfigStepsOderChangeResource.update({taskConfigId:routeParams.taskConfigId},this.formData,function (data) {
                    location.path('/viewworkflow/'+routeParams.taskConfigId)
                 });
            } 
            
        }
    });
    mifosX.ng.application.controller('ViewWorkflowController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', '$modal', mifosX.controllers.ViewWorkflowController]).run(function ($log) {
        $log.info("ViewWorkflowController initialized");
    });
}(mifosX.controllers || {}));
