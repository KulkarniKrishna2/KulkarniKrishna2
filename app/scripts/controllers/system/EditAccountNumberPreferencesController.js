(function (module) {
    mifosX.controllers = _.extend(module, {
        EditAccountNumberPreferencesController: function (scope,resourceFactory, location,routeParams) {
            scope.resourceId = routeParams.id;
            scope.addPrefix = false;
                resourceFactory.accountNumberResources.getPrefixType({accountNumberFormatId:scope.resourceId},function(data){
                    scope.accountType = data["accountType"].value;
                    scope.generationType = data.generationType;
                    scope.sequenceName = data.sequenceDetailName;
                    scope.prefixTypeOptions = data.prefixTypeOptions[data["accountType"].code]
                    if( data.prefixType && data.prefixType.id){
                        scope.formData = {
                            prefixType:data.prefixType.id
                        }
                        if(scope.formData.prefixType &&  scope.formData.prefixType != null){
                            scope.addPrefix = true;
                        }
                    }
                    
                });

            scope.cancel = function(){
                location.path('/accountnumberpreferences');
            }
            scope.submit = function(){
                resourceFactory.accountNumberResources.put({accountNumberFormatId:scope.resourceId},scope.formData,function(data){
                    location.path('/viewaccountnumberpreferences/' + data.resourceId );
                });
            }
        }
    });
    mifosX.ng.application.controller('EditAccountNumberPreferencesController', ['$scope', 'ResourceFactory', '$location','$routeParams',mifosX.controllers.EditAccountNumberPreferencesController]).run(function ($log) {
        $log.info("EditAccountNumberPreferencesController initialized");
    });
}(mifosX.controllers || {}));