(function (module) {
    mifosX.controllers = _.extend(module, {
        AddSuperLimitController: function (scope, resourceFactory) {
            scope.limitFormData = {};
            scope.displayAddButton = false;
            scope.isUpdate = false;

            scope.submit = function () {
                scope.limitFormData.locale = "en";
                resourceFactory.clientSuperLimitResource.save({ clientId: scope.clientId }, scope.limitFormData, function (data) {
                    scope.close();
                    scope.getClientLimits();
                });
            };

            scope.cancel = function () {
                scope.close();
            };

        }

    });

    mifosX.ng.application.controller('AddSuperLimitController', ['$scope', 'ResourceFactory', mifosX.controllers.AddSuperLimitController]).run(function ($log) {
        $log.info("AddSuperLimitController initialized");
    });
}(mifosX.controllers || {}));