(function(module) {
    mifosX.controllers = _.extend(module, {
        ClientVerificationDetailsController: function($controller, scope, routeParams, resourceFactory, location, route, $window) {
            scope.formData = {};
            scope.clientVerificationData = {};
            scope.enableClientVerification = scope.isSystemGlobalConfigurationEnabled('client-verification');

            function populateDetails() {
                scope.entityType = "clients";
                scope.entityId = routeParams.clientId;

                var clientVerificationConfig = {
                    clientVerificationData: {
                        entityType: scope.entityType,
                        entityId: scope.entityId,
                        isWorkflow: false
                    }
                };
                if (scope.clientCommonConfig === undefined) {
                    scope.clientCommonConfig = {};
                }
                angular.extend(scope.clientCommonConfig, clientVerificationConfig);
            };
            populateDetails();
        }
    });
    mifosX.ng.application.controller('ClientVerificationDetailsController', ['$controller', '$scope', '$routeParams', 'ResourceFactory', '$location', '$route', '$window', mifosX.controllers.ClientVerificationDetailsController]).run(function($log) {
        $log.info("ClientVerificationDetailsController initialized");
    });
}(mifosX.controllers || {}));