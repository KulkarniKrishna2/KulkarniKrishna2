(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewRegisteredDeviceController: function (scope, routeParams, resourceFactory,location) {
            scope.registeredDeviceId = routeParams.registeredDeviceId;
            scope.isSearch = false;
            if(location.search().isSearch==true){
                scope.isSearch = true;
            }
            if(location.search().userId && location.search().userId != null){
                scope.fromUserId = location.search().userId;
            }
            if(scope.isSearch==true && location.search().officeId  && location.search().officeId != null){
                scope.fromOfficeId = location.search().officeId;
            }
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
            scope.routeToUser = function (userId) {
                if(userId){
                    location.path('/viewuser/' + userId);
                }                
            };
            scope.routeToSearch = function () {
                if(scope.fromUserId){
                    location.search('userId', scope.fromUserId);
                }
                if(scope.fromOfficeId){
                    location.search('officeId',scope.fromOfficeId);
                }
                location.path('/organization/registereddevices');
            };
        }
    });
    mifosX.ng.application.controller('ViewRegisteredDeviceController', ['$scope', '$routeParams', 'ResourceFactory', '$location', mifosX.controllers.ViewRegisteredDeviceController]).run(function ($log) {
        $log.info("ViewRegisteredDeviceController initialized");
    });
}(mifosX.controllers || {}));