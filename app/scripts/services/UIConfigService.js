(function (module) {
    mifosX.services = _.extend(module, {

        UIConfigService: function ($q, $http) {
            var customConfig = {"lms.moneytap.com":"moneytap","finflux.tapstart.in":"tapstart"};

            var configUIArray = ["agronomica", "almajmoua", "bss", "chaitanya", "crediangolar", "creditonepayments", "digamber","dfl", "eastlanka", "flexi", "grayquest", "habitat", "hana", "kapilcapital", "light", "mobilityfinance","moc","moneytap","neev",
                "nextru", "phakamani", "rc", "renet", "secdep", "sef", "shivakarifin", "sunvest", "tapstart", "vayarbl", "vayabc", "vaya", "mfi", "default","slicepay"];


            var getUIConfigKey = function (tenantName) {
                var hostname = window.location.hostname;
                if(customConfig[hostname]!== undefined){
                    return customConfig[hostname];
                }
                var arrayLength = configUIArray.length;
                if (!!tenantName) {
                    for (var i = 0; i < arrayLength; i++) {

                        if (tenantName.includes(configUIArray[i])) {
                            return configUIArray[i];
                        }
                        //Do something
                    }
                    return tenantName;
                } else {
                    return "default";
                }
            };
            this.init = function (scope, tenantIdentifier) {
                let configKey = getUIConfigKey(tenantIdentifier);
                $http.get('scripts/config/' + configKey + '_UiConfig.json').success(function (tenantSpecificData) {
                    checkAndSetData(tenantSpecificData);
                }).error(function (tenantSpecificData) {
                    assignDefaultData();
                }).catch(function (e) {
                    assignDefaultData();
                });

                var assignDefaultData = function () {
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

                var checkAndSetData = function (tenantSpecificData) {
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

                var isObjectData = function (tenantSpecificData) {
                    if (!_.isUndefined(tenantSpecificData) && tenantSpecificData != null) {
                        if (!_.isUndefined(tenantSpecificData.length)) {
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

    mifosX.ng.services.service('UIConfigService', ['$q', '$http', mifosX.services.UIConfigService]).run(function ($log) {
        $log.info("UIConfigService initialized");

    });

}(mifosX.services || {}));
