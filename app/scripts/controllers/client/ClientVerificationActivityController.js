(function(module) {
    mifosX.controllers = _.extend(module, {
        ClientVerificationActivityController: function($controller, scope, resourceFactory, location, http, routeParams, API_VERSION, $rootScope) {
            scope.formData = {};
            scope.clientVerificationData = {};

            function initTask() {
                scope.entityType = "clients";
                scope.entityId = scope.taskconfig['clientId'];

                var clientVerificationConfig = {
                    clientVerificationData: {
                        entityType: scope.entityType,
                        entityId: scope.entityId,
                        isWorkflow: true
                    }
                };
                if (scope.clientCommonConfig === undefined) {
                    scope.clientCommonConfig = {};
                }
                angular.extend(scope.clientCommonConfig, clientVerificationConfig);
            };

            initTask();
        }
    });
    mifosX.ng.application.controller('ClientVerificationActivityController', ['$controller', '$scope', 'ResourceFactory', '$location', '$http', '$routeParams', 'API_VERSION', '$rootScope', mifosX.controllers.ClientVerificationActivityController]).run(function($log) {
        $log.info("ClientVerificationActivityController initialized");
    });
}(mifosX.controllers || {}));