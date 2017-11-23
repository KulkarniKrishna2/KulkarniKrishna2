(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewUserController: function (scope, routeParams, route, location, resourceFactory, $modal, commonUtilService) {
            scope.user = [];
            scope.formData = {};
            resourceFactory.userListResource.get({userId: routeParams.id}, function (data) {
                scope.user = data;
            });
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
                    angular.copy(this.formData,credentialsData);
                    if(credentialsData.password){
                        credentialsData.password = commonUtilService.encrypt(credentialsData.password);
                    }
                    if(credentialsData.repeatPassword){
                        credentialsData.repeatPassword = commonUtilService.encrypt(credentialsData.repeatPassword);
                    }
                    resourceFactory.userPasswordResource.resetpassword(credentialsData, function (data) {
                        $modalInstance.close('activate');
                        if (data.resourceId == scope.currentSession.user.userId) {
                            scope.logout();
                        } else{
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
                    resourceFactory.userListResource.delete({userId: routeParams.id}, {}, function (data) {
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
                    resourceFactory.userListResource.post({userId: routeParams.id, command:'unlock'}, {}, function (data) {
                        $modalInstance.close('unlock');
                        location.path('/users');
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

        }
    });
    mifosX.ng.application.controller('ViewUserController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$modal', 'CommonUtilService', mifosX.controllers.ViewUserController]).run(function ($log) {
        $log.info("ViewUserController initialized");
    });
}(mifosX.controllers || {}));
