(function (module) {
    mifosX.controllers = _.extend(module, {
        defaultUIConfigController: function (scope,key) {
            scope.isElemMandatory = function(param){
                if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations[key]
                    && scope.response.uiDisplayConfigurations[key].isMandatory && scope.response.uiDisplayConfigurations[key].isMandatory[param]){
                    return true;
                }
                return false;
            };
            scope.isElemHidden = function(param){
                if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations[key]
                    && scope.response.uiDisplayConfigurations[key].isHiddenField && scope.response.uiDisplayConfigurations[key].isHiddenField[param]){
                    return true;
                }
                return false;
            };
            scope.regexPattern = function(param){
                if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations[key]
                    && scope.response.uiDisplayConfigurations[key].regexValidations &&
                    scope.response.uiDisplayConfigurations[key].regexValidations[param] &&
                    scope.response.uiDisplayConfigurations[key].regexValidations[param] != ""){
                    return new RegExp(scope.response.uiDisplayConfigurations[key].regexValidations[param]);
                }
                return new RegExp(".*");

            };
        }
    });
    mifosX.ng.application.controller('defaultUIConfigController', ['$scope', '$key',mifosX.controllers.defaultUIConfigController]).run(function ($log) {
        $log.info("defaultUIConfigController initialized");
    });
}(mifosX.controllers || {}));
