(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewUserController: function (scope, routeParams, route, location, resourceFactory, $modal, commonUtilService, dateFilter) {
            scope.user = [];
            scope.uiData = {};
            scope.formData = {};
            scope.showResetPasssword = false;
            resourceFactory.userListResource.get({
                userId: routeParams.id
            }, function (data) {
                scope.user = data;
                if((scope.response.uiDisplayConfigurations.loginSecurity.isEnabledLdap && scope.user.username.includes("bss")) || !scope.response.uiDisplayConfigurations.loginSecurity.isEnabledLdap){
                    if((routeParams.id!=scope.currentSession.user.userId)){
                        scope.showResetPasssword = true;
                    }
                }
                if(scope.user.staff.joiningDate){
                    scope.joiningDate = dateFilter(new Date(scope.user.staff.joiningDate), scope.df);
                }
            });
           scope.routeToDevice = function (device) {
                location.path('/organization/registereddevices/' + device.id);
            };

            scope.open = function () {
                $modal.open({
                    templateUrl: 'password.html',
                    controller: ModalInstanceCtrl
                });
            };
            scope.deleteuser = function () {
                $modal.open({
                    templateUrl: 'deleteuser.html',
                    controller: UserDeleteCtrl
                });
            };
            var ModalInstanceCtrl = function ($scope, $modalInstance) {
                $scope.changePassword = function () {
                    this.formData['userId'] = routeParams.id;
                    var credentialsData = {};
                    angular.copy(this.formData, credentialsData);
                    if (credentialsData.password) {
                        credentialsData.password = commonUtilService.encrypt(credentialsData.password);
                    }
                    if (credentialsData.repeatPassword) {
                        credentialsData.repeatPassword = commonUtilService.encrypt(credentialsData.repeatPassword);
                    }
                    resourceFactory.userPasswordResource.resetpassword(credentialsData, function (data) {
                        $modalInstance.close('activate');
                        if (data.resourceId == scope.currentSession.user.userId) {
                            scope.logout();
                        } else {
                            route.reload();
                        };
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            var UserDeleteCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    resourceFactory.userListResource.delete({
                        userId: routeParams.id
                    }, {}, function (data) {
                        $modalInstance.close('delete');
                        location.path('/users');
                        // added dummy request param because Content-Type header gets removed
                        // if the request does not contain any data (a request body)
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.unlockuser = function () {
                $modal.open({
                    templateUrl: 'unlockuser.html',
                    controller: UserUnlockCtrl
                });
            };

            var UserUnlockCtrl = function ($scope, $modalInstance) {
                $scope.unlock = function () {
                    resourceFactory.userListResource.post({
                        userId: routeParams.id,
                        command: 'unlock'
                    }, {}, function (data) {
                        $modalInstance.close('unlock');
                        location.path('/users');
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.fetchDevicesToUser = function () {
                scope.uiData.isFetchDevicesToUser = true
                resourceFactory.userRegisteredDevicesResource.getAll({
                    userId: routeParams.id
                }, function (data) {
                    scope.devicesToUser = data;
                });
            };

            scope.deviceAction = function (device, command) {
                resourceFactory.userRegisteredDeviceResource.action({
                    registeredDeviceId: device.id,
                    userId: routeParams.id,
                    command: command
                }, {}, function () {
                    scope.fetchDevicesToUser();
                });
            };
        }
    });
    mifosX.ng.application.controller('ViewUserController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$modal', 'CommonUtilService', 'dateFilter', mifosX.controllers.ViewUserController]).run(function ($log) {
        $log.info("ViewUserController initialized");
    });
}(mifosX.controllers || {}));
