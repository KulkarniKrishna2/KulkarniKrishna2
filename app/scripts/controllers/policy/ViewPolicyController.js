(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewPolicyController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            scope.clientId = routeParams.clientId;
            resourceFactory.policyResource.get({ clientId: scope.clientId }, {}, function (data) {
                if (data && data.id) {
                    scope.policy = data;
                } else {

                }
            });
        }
    });
    mifosX.ng.application.controller('ViewPolicyController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.ViewPolicyController]).run(function ($log) {
        $log.info("ViewPolicyController initialized");
    });
}(mifosX.controllers || {}));