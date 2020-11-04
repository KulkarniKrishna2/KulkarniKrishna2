(function (module) {
    mifosX.controllers = _.extend(module, {
        UpdateFinancialOfficeMappingController: function (scope, routeParams, resourceFactory, location, route) {

            scope.offices = [];
            scope.formData = {};
            scope.glAccountOptions =  {};
            scope.financialActivityData = "";
            scope.mappingId = routeParams.mappingId;
            scope.id = routeParams.id;

            scope.getData = function(){
                resourceFactory.financialOfficeMappingResource.get({mappingId:scope.mappingId,id:scope.id, template:true},function (data) {
                    scope.glAccountOptions = data.glAccountOptions;
                    scope.financialActivityData = data.financialActivityData;
                    scope.updateActivityOptions(scope.financialActivityData.id);
                    scope.offices = data.officeOptions;
                    scope.constructData(data);
                    
                });
            }

            scope.constructData = function(data){
                scope.formData.fromOfficeId = data.fromOfficeData.id;
                scope.formData.toOfficeId = data.toOfficeData.id;
                scope.formData.glAccountId = data.glAccountData.id;
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
                resourceFactory.financialOfficeMappingResource.update({mappingId:scope.mappingId,id:scope.id},scope.formData,function (data) {
                    scope.routeTo();
                });
            }
            
            scope.routeTo = function (){
                location.path('/viewfinancialofficemapping/' + scope.mappingId+'/officemapping/'+scope.id);
            };
        }
    });
    mifosX.ng.application.controller('UpdateFinancialOfficeMappingController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.UpdateFinancialOfficeMappingController]).run(function ($log) {
        $log.info("UpdateFinancialOfficeMappingController initialized");
    });
}(mifosX.controllers || {}));
