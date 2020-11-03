(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewFinancialOfficeMappingsController: function (scope, routeParams, resourceFactory, location, route, $modal) {
            scope.offices = [];
            scope.mappingId = routeParams.mappingId;
            scope.formData = {};
            scope.formData.mappingId = scope.mappingId;
            scope.officeMappings = [];
            
            scope.getData = function(){
                resourceFactory.officeToGLAccountMappingResource.get({mappingId: scope.mappingId},function (activityData) {
                    scope.financialActivityData = activityData;
                    resourceFactory.financialOfficeMappingTemplateResource.get({mappingId:scope.mappingId},function (data) {
                        scope.offices = data.officeOptions;
                    });
                
                });
            }

            scope.getData();            

            scope.submit = function(){
               resourceFactory.financialOfficeMappingResource.getAll(scope.formData,function (data) {
                    scope.officeMappings = data;              
                });
            }
            
            scope.routeTo = function (){
                location.path('/viewfinancialactivitymapping/' + scope.mappingId);
            };

            scope.view = function (id){
                location.path('/viewfinancialofficemapping/' + scope.mappingId+"/officemapping/"+id);
            };

            
        }
    });
    mifosX.ng.application.controller('ViewFinancialOfficeMappingsController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', '$modal', mifosX.controllers.ViewFinancialOfficeMappingsController]).run(function ($log) {
        $log.info("ViewFinancialOfficeMappingsController initialized");
    });
}(mifosX.controllers || {}));
