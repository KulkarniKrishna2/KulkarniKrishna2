(function (module) {
    mifosX.controllers = _.extend(module, {
        EditSuperLimitController: function (scope, routeParams, resourceFactory) {

            resourceFactory.clientLimitsResource.get({ clientId: routeParams.id }, function (data) {
                scope.edit = data;
                scope.formData = {
                    superlimit: data.superlimit,
                };
            });

            scope.submit = function () {
                scope.formData.locale = "en";
                resourceFactory.clientSuperLimitResource.save({ clientId: scope.clientId }, scope.formData, function (data) {
                    scope.close();
                    scope.getClientLimits();
                });
            };

            scope.cancel = function () {
                scope.close();
            };

        }

    });

    mifosX.ng.application.controller('EditSuperLimitController', ['$scope', '$routeParams', 'ResourceFactory', mifosX.controllers.EditSuperLimitController]).run(function ($log) {
        $log.info("EditSuperLimitController initialized");
    });
}(mifosX.controllers || {}));