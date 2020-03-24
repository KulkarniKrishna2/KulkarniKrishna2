(function (module) {
  mifosX.controllers = _.extend(module, {

    RegisteredDeviceController: function (scope, resourceFactory, location,paginatorUsingOffsetService,route) {
      scope.devicesPerPage = 15;
      scope.searchConditions = {};
      scope.uiData = {};
      scope.uiData.status = 'pending';
      if(location.search().userId){
        scope.searchConditions.userId = location.search().userId;
      }
      if(location.search().officeId){
        scope.searchConditions.officeId = location.search().officeId;
      }
      
      var fetchDevices = function (offset, limit, callback) {
        var param = {  status: scope.uiData.status, searchConditions: scope.searchConditions, offset: offset, limit: limit };
        resourceFactory.userRegisteredDevicesResource.getAll(param, callback);
      }
      scope.searchData = function (status) {
        scope.uiData.status = status;
        scope.registeredUserDevices = paginatorUsingOffsetService.paginate(fetchDevices, scope.devicesPerPage);
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

      scope.routeTo = function (deviceId) {
        location.search('userId',scope.searchConditions.userId);
        location.search('officeId',scope.searchConditions.officeId);
        location.search('isSearch',true);        
        location.path('/organization/registereddevices/' + deviceId);
      };

      scope.routeToUser = function (userId) {
        location.path('/viewuser/' + userId);
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

      scope.userActionOnDevice = function (userDevice, command) {
        resourceFactory.userRegisteredDeviceResource.action({
            registeredDeviceId: userDevice.registeredDeviceData.id,
            userId: userDevice.appUserData.id,
            command: command
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
