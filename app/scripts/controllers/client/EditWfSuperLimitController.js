(function (module) {
    mifosX.controllers = _.extend(module, {
        EditWfSuperLimitController: function (scope, routeParams, resourceFactory) {
            scope.clientId = scope.taskconfig['clientId'];
            resourceFactory.clientLimitsResource.get({ clientId: scope.clientId }, function (data) {
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

    mifosX.ng.application.controller('EditWfSuperLimitController', ['$scope', '$routeParams', 'ResourceFactory', mifosX.controllers.EditWfSuperLimitController]).run(function ($log) {
        $log.info("EditWfSuperLimitController initialized");
    });
}(mifosX.controllers || {}));