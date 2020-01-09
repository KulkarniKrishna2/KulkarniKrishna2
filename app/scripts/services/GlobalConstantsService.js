(function (module) {
    mifosX.services = _.extend(module, {
        GlobalConstantsService: function ($http) {
            this.init = function (scope) {
                $http.get('scripts/globalconstants/GlobalConstants.json').success(function (data) {
                    scope.globalConstants = data;
                }).error(function (data) {
                    console.log("Configuration file not found");
                }).catch(function (e) {
                    console.log("Configuration file not found");
                });
            };
        }
    });
    mifosX.ng.services.service('GlobalConstantsService', ['$http', mifosX.services.GlobalConstantsService]).run(function ($log) {
        $log.info("GlobalConstantsService initialized");
    });

}(mifosX.services || {}));