(function (module) {
  mifosX.controllers = _.extend(module, {

    RegisteredDeviceController: function (scope, resourceFactory) {

      scope.uiData = {};
      scope.fetchDevices = function (status) {
        scope.uiData.status = status;
        resourceFactory.registeredDevicesResource.getAll({
          'status': status
        }, function (data) {
          scope.registeredDevices = data;
        });
      }
      scope.fetchDevices('pending');

      scope.deviceAction = function (index, device, command) {
        resourceFactory.registeredDevicesResource.action({
          'registeredDeviceId': device.id,
          'command': command
        }, {}, function (data) {
          scope.registeredDevices.splice(index, 1);
        });
      }
    }
  });
  mifosX.ng.application.controller('RegisteredDeviceController', ['$scope', 'ResourceFactory', mifosX.controllers.RegisteredDeviceController]).run(function ($log) {
    $log.info("RegisteredDeviceController initialized");
  });
}(mifosX.controllers || {}));
