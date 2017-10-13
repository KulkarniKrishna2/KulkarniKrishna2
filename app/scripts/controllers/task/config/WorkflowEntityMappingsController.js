
(function (module) {
    mifosX.controllers = _.extend(module, {
        WorkflowEntityMappingsController: function (scope, resourceFactory, location, translate, routeParams, dateFilter) {

                 scope.workflowEntityMappingsList = [];
            
                
                resourceFactory.workflowEntityMapping.getAll({}, function (data) {
                    scope.workflowEntityMappingsList = data;
                });

                scope.routeToView = function(workflowEntityMapping){
                    var taskConfigId = workflowEntityMapping.taskConfig.id;
                    var entityType = workflowEntityMapping.entityType.id;
                    location.path('/viewworkflowentitymapping/'+ taskConfigId + '/'+ entityType);
                }
            
        }
    });
    mifosX.ng.application.controller('WorkflowEntityMappingsController', ['$scope', 'ResourceFactory', '$location', '$translate', '$routeParams', 'dateFilter', mifosX.controllers.WorkflowEntityMappingsController]).run(function ($log) {
        $log.info("WorkflowEntityMappingsController initialized");
    });
}(mifosX.controllers || {}));