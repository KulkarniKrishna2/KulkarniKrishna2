 (function (module) {
    mifosX.services = _.extend(module, {

        UIConfigService: function ($q,$http) {

            this.init = function (scope, tenantIdentifier) {
                $http.get('scripts/config/' + tenantIdentifier + '_UiConfig.json').success(function (tenantSpecificData) {
                    checkAndSetData(tenantSpecificData);
                }).error(function (tenantSpecificData) {
                    assignDefaultData();
                }).catch(function (e) {
                    assignDefaultData();
                });

                assignDefaultData = function () {
                    $http.get('scripts/config/default_UiConfig.json').success(function (data) {
                        if (data != 'undefined' && data != null && data != '') {
                            if (data.enableUIDisplayConfiguration != null && data.enableUIDisplayConfiguration == true) {
                                scope.response = data;
                                scope.responseDefaultGisData = data;
                                scope.$emit("uiConfigServicePerformed", scope.response);
                            }
                        }
                    }).error(function (data) {
                        console.log("Configuration file not found");
                    }).catch(function (e) {
                        console.log("Configuration file not found");
                    });
                };

                checkAndSetData = function (tenantSpecificData) {
                    $http.get('scripts/config/default_UiConfig.json').success(function (defaultData) {
                        var result = {};
                        result = diff(defaultData, tenantSpecificData);
                        if (result.enableUIDisplayConfiguration != null && result.enableUIDisplayConfiguration == true) {
                            scope.response = result;
                            scope.responseDefaultGisData = result;
                            scope.$emit("uiConfigServicePerformed", scope.response);
                        }
                    }).error(function (tenantSpecificData) {
                        console.log("Configuration file not found");
                    }).catch(function (e) {
                        console.log("Configuration file not found");
                    });
                };

                isObjectData = function(tenantSpecificData){
                    if(!_.isUndefined(tenantSpecificData) && tenantSpecificData != null){
                        if(!_.isUndefined(tenantSpecificData.length)){
                            return false;
                        }
                    }
                    return true;
                }

                var diff = function (defaultData, tenantSpecificData) {
                    var result = defaultData;
                    for (var label in tenantSpecificData) {
                        if (isObjectData(tenantSpecificData[label]) && typeof tenantSpecificData[label] == 'object' && typeof defaultData[label] == 'object') {
                            result[label] = diff(defaultData[label], tenantSpecificData[label]);

                        } else {
                            result[label] = tenantSpecificData[label];
                        }
                    }
                    return result;
                };
            };
        }
    });

 mifosX.ng.services.service('UIConfigService', ['$q','$http',mifosX.services.UIConfigService]).run(function ($log) {
    $log.info("UIConfigService initialized");

});

}(mifosX.services || {}));
