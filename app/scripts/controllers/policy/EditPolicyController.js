(function (module) {
    mifosX.controllers = _.extend(module, {
        EditPolicyController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            scope.clientId = routeParams.clientId;
            resourceFactory.policyResource.get({ clientId: scope.clientId }, {}, function (data) {
                scope.formData = data;
            });

            scope.submit = function () {
                var requestData = Object.assign({}, scope.formData);
                requestData.locale = scope.optlang.code;
                requestData.clientData = undefined;
                resourceFactory.policyResource.update({ clientId: scope.clientId, policyId: requestData.id }, requestData, function (data) {
                    location.path('clients/' + scope.clientId + '/viewpolicy');
                });
            }
        }
    });
    mifosX.ng.application.controller('EditPolicyController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.EditPolicyController]).run(function ($log) {
        $log.info("EditPolicyController initialized");
    });
}(mifosX.controllers || {}));