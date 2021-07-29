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
                location.search('userId',routeParams.id);
                location.search('isSearch',false);
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
                    encryptNewpassword($modalInstance,credentialsData);
                    
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            var encryptNewpassword = function($modalInstance,credentialsData){
                if(credentialsData.password){
                    commonUtilService.encrypt(credentialsData.password).then(function(encriptedText) {
                        credentialsData.password = commonUtilService.convertEncriptedArrayToText(encriptedText);
                        encryptRepeatPassword($modalInstance,credentialsData);
                    });
                }else{
                    encryptRepeatPassword($modalInstance,credentialsData);
                }
            };

            var encryptRepeatPassword = function($modalInstance,credentialsData){
                if(credentialsData.repeatPassword){
                    commonUtilService.encrypt(credentialsData.repeatPassword).then(function(encriptedText) {
                        credentialsData.repeatPassword = commonUtilService.convertEncriptedArrayToText(encriptedText);
                        sendUpdatePasswordRequest($modalInstance,credentialsData);
                    });
                }else{
                    sendUpdatePasswordRequest($modalInstance,credentialsData);
                }
            };

            var sendUpdatePasswordRequest = function($modalInstance,credentialsData){
                resourceFactory.userPasswordResource.resetpassword(credentialsData, function (data) {
                    $modalInstance.close('activate');
                    if (data.resourceId == scope.currentSession.user.userId) {
                        scope.logout();
                    } else {
                        route.reload();
                    };
                });
            }

            var UserDeleteCtrl = function ($scope, $modalInstance) {
                $scope.reassignErrMsg = "error.msg.user.associate.with.other.resource";
                $scope.isReassign = false;
                $scope.delete = function () {
                    resourceFactory.userListResource.delete({
                        userId: routeParams.id
                    }, {}, function (data) {
                        $modalInstance.close('delete');
                        location.path('/users');
                        // added dummy request param because Content-Type header gets removed
                        // if the request does not contain any data (a request body)
                    }, function(err) {
                        if(err.data.errors[0].userMessageGlobalisationCode == $scope.reassignErrMsg){
                            $scope.isReassign = true;
                        }
                }) ;
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.routeToReassign = function() {
                    location.path('/reassignstaff/true'); 
                    $scope.cancel();
                }
            };

            scope.lock = function(){
                resourceFactory.userListResource.post({
                    userId: routeParams.id,
                    command: 'lock'
                }, {}, function (data) {
                    location.path('/users');
                });           
            };

            scope.unlock = function () {
                resourceFactory.userListResource.post({
                    userId: routeParams.id,
                    command: 'unlock'
                }, {}, function (data) {
                    location.path('/users');
                });
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
