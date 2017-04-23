 (function (module) {
    mifosX.services = _.extend(module, {

        UIConfigService: function ($q,$http) {

            this.init = function (scope, tenantIdentifier) {
                $http.get('scripts/config/' + tenantIdentifier + '_UiConfig.json').success(function (tenantdata) {
                    checkAndSetData(scope,tenantdata);
                }).error(function (tenantdata) {
                    assignDefaultData();
                }).catch(function (e) {
                    assignDefaultData();
                });
            };

            assignDefaultData = function () {
                $http.get('scripts/config/default_UiConfig.json').success(function (data) {
                    if (data != 'undefined' && data != null && data != '') {
                        if (data.enableUIDisplayConfiguration != null && data.enableUIDisplayConfiguration == true) {
                            scope.response = data;
                            scope.responseDefaultGisData = data;
                        }
                    }
                }).error(function (data) {
                    console.log("Configuration file not found");
                }).catch(function (e) {
                    console.log("Configuration file not found");
                });
            };
            checkAndSetData = function (scope, tenantdata) {
                $http.get('scripts/config/default_UiConfig.json').success(function (defaultdata) {
                    var result = {};
                    result = diff(defaultdata, tenantdata);
                    if (result.enableUIDisplayConfiguration != null && result.enableUIDisplayConfiguration == true) {
                        scope.response = result;
                        scope.responseDefaultGisData = result;
                    }
                }).error(function (tenantdata) {
                    console.log("Configuration file not found");
                }).catch(function (e) {
                    console.log("Configuration file not found");
                });
            };

            var diff = function (defaultdata, tenantdata) {
                var result = defaultdata;
                for (var lebel in tenantdata) {
                    if (typeof tenantdata[lebel] == 'object' && typeof defaultdata[lebel] == 'object') {
                        result[lebel] = diff(defaultdata[lebel], tenantdata[lebel]);

                    } else {
                        result[lebel] = tenantdata[lebel];
                    }
                }
                return result;
            };


        }
    });

    mifosX.ng.services.service('UIConfigService', ['$q','$http',mifosX.services.UIConfigService]).run(function ($log) {
        $log.info("UIConfigService initialized");

    });

}(mifosX.services || {}));
