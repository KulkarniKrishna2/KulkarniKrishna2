(function (module) {
    mifosX.controllers = _.extend(module, {
        GlobalConfigurationController: function (scope, resourceFactory, location, route) {
            scope.getAllGlobalConfigurations();

            if (!scope.searchCriteria.config) {
                scope.searchCriteria.config = null;
                scope.saveSC();
            }
            scope.filterText = scope.searchCriteria.config;

            scope.onFilter = function () {
                scope.searchCriteria.config = scope.filterText;
                scope.saveSC();
            };

            scope.enable = function (id, name) {
                if (name == 'Is Cache Enabled') {
                    var temp = {};
                    temp.cacheType = 2;
                    resourceFactory.cacheResource.update(temp, function (data) {
                        scope.getAllGlobalConfigurations();
                    });
                }
                else {
                    var temp = {'enabled': 'true'};
                    resourceFactory.configurationResource.update({'id': id}, temp, function (data) {
                        scope.getAllGlobalConfigurations();
                    });
                }
            };

            scope.disable = function (id, name) {
                if (name == 'Is Cache Enabled') {
                    var temp = {};
                    temp.cacheType = 1;
                    resourceFactory.cacheResource.update(temp, function (data) {
                        scope.getAllGlobalConfigurations();
                    });
                }
                else {
                    var temp = {'enabled': 'false'};
                    resourceFactory.configurationResource.update({'id': id}, temp, function (data) {
                        scope.getAllGlobalConfigurations();
                    });
                }
            };
        }
    });
    mifosX.ng.application.controller('GlobalConfigurationController', ['$scope', 'ResourceFactory', '$location', '$route', mifosX.controllers.GlobalConfigurationController]).run(function ($log) {
        $log.info("GlobalConfigurationController initialized");
    });
}(mifosX.controllers || {}));
