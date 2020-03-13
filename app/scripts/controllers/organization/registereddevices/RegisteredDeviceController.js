(function (module) {
  mifosX.controllers = _.extend(module, {

    RegisteredDeviceController: function (scope, resourceFactory, location,paginatorUsingOffsetService,route) {
      scope.devicesPerPage = 15;
      scope.searchConditions = {};
      scope.uiData = {};
      scope.uiData.status = 'pending';
      var fetchDevices = function (offset, limit, callback) {
        resourceFactory.registeredDevicesResource.getAll({
                    status: scope.uiData.status,
                    searchConditions: scope.searchConditions,
                    offset: offset,
                    limit: limit
                }, callback);
      }
      scope.searchData = function (status) {
        scope.uiData.status = status;
        scope.registeredDevices = paginatorUsingOffsetService.paginate(fetchDevices, scope.devicesPerPage);
      };

      function init(){
        resourceFactory.officeResource.getAllOffices(function (data){
          scope.officeOptions = data;
        });
        resourceFactory.userResource.getAllUsers({fields: "id,firstname,lastname,username,officeId"}, function (data) {
          scope.users = data;
          scope.userOptions = [];
          angular.copy(scope.users, scope.userOptions);
        });  
      }

      init();
      scope.changeOffice = function(officeId){       
        scope.searchConditions.userId = null;
        scope.tempUsers = []; 
         if (officeId != null) {
              scope.userOptions = _.filter(scope.users, function (user) {
                return user.officeId == officeId;
              })
          }    
      }

      scope.routeTo = function (device) {
        location.path('/organization/registereddevices/' + device.id);
      };

      scope.resetSearchData = function () {
                scope.searchConditions.deviceId = null;
                scope.searchConditions.officeId = null;
                document.getElementById('offices_chosen').childNodes[0].childNodes[0].innerHTML = "Select one";
                scope.searchConditions.userId = null;
                document.getElementById('users_chosen').childNodes[0].childNodes[0].innerHTML = "Select one";
                scope.searchData(scope.uiData.status);
            };

      scope.deviceAction = function (index, device, command) {
        resourceFactory.registeredDevicesResource.action({
          'registeredDeviceId': device.id,
          'command': command
        }, {}, function (data) {
            route.reload();
        });
      }
    }
  });
  mifosX.ng.application.controller('RegisteredDeviceController', ['$scope', 'ResourceFactory', '$location','PaginatorUsingOffsetService','$route', mifosX.controllers.RegisteredDeviceController]).run(function ($log) {
    $log.info("RegisteredDeviceController initialized");
  });
}(mifosX.controllers || {}));
