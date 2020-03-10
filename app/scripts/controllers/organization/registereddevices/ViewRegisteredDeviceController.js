(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewRegisteredDeviceController: function (scope, routeParams, resourceFactory) {
            scope.registeredDeviceId = routeParams.registeredDeviceId;
            resourceFactory.registeredDevicesResource.getOne({
                registeredDeviceId: scope.registeredDeviceId,
                isFetchRegisteredDeviceToUserDatas: 'true'
            }, function (data) {
                scope.registeredDeviceUsers = data;
            });

            scope.userActionOnDevice = function (user, command) {
                resourceFactory.userRegisteredDeviceResource.action({
                    registeredDeviceId: scope.registeredDeviceId,
                    userId: user.appUserData.id,
                    command: command
                }, {}, function (data) {
                    user.status = data.changes.status;
                });
            }
        }
    });
    mifosX.ng.application.controller('ViewRegisteredDeviceController', ['$scope', '$routeParams', 'ResourceFactory', mifosX.controllers.ViewRegisteredDeviceController]).run(function ($log) {
        $log.info("ViewRegisteredDeviceController initialized");
    });
}(mifosX.controllers || {}));