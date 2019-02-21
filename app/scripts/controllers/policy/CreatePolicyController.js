(function (module) {
    mifosX.controllers = _.extend(module, {
        CreatePolicyController: function (scope, resourceFactory, location, dateFilter, http, routeParams,$rootScope) {
            scope.formData = {};
            scope.formData.locale = scope.optlang.code;
            scope.clientId = routeParams.clientId;
            scope.submit = function () {
                resourceFactory.policyResource.save({ clientId: scope.clientId }, this.formData, function (data) {
                    location.path('clients/' + scope.clientId + '/viewpolicy');
                });
            };
        }
    });
    mifosX.ng.application.controller('CreatePolicyController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams','$rootScope', mifosX.controllers.CreatePolicyController]).run(function ($log) {
        $log.info("CreatePolicyController initialized");
    });
}(mifosX.controllers || {}));