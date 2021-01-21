(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateFinancialOfficeMappingController: function (scope, routeParams, resourceFactory, location, route) {
            scope.offices = [];
            scope.formData = {};
            scope.glAccountOptions =  {};
            scope.financialActivityData = "";
            scope.mappingId = routeParams.mappingId;  
                      
            scope.getData = function(){
                resourceFactory.officeToGLAccountMappingResource.get({mappingId: scope.mappingId},function (activityData) {
                    scope.financialActivityData = activityData;
                    resourceFactory.financialOfficeMappingTemplateResource.get({mappingId:scope.mappingId},function (data) {
                        scope.glAccountOptions = data.glAccountOptions;
                        scope.offices = data.officeOptions;
                        scope.updateActivityOptions(activityData.financialActivityData.id);
                    });
                
                });
            }

            scope.getData();    

            scope.updateActivityOptions = function(activityId){
                if(activityId === 100){
                    scope.accountOptions = scope.glAccountOptions.assetAccountOptions;
                }else if(activityId === 200){
                    scope.accountOptions = scope.glAccountOptions.liabilityAccountOptions;
                }
            };

            scope.submit = function(){
                resourceFactory.financialOfficeMappingResource.save({mappingId:scope.mappingId},scope.formData,function (data) {
                    location.path('/viewfinancialactivitymapping/' + scope.mappingId);
                });
            }
            
            scope.routeTo = function (){
                location.path('/viewfinancialactivitymapping/' + scope.mappingId);
            };
        }
    });
    mifosX.ng.application.controller('CreateFinancialOfficeMappingController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.CreateFinancialOfficeMappingController]).run(function ($log) {
        $log.info("CreateFinancialOfficeMappingController initialized");
    });
}(mifosX.controllers || {}));
