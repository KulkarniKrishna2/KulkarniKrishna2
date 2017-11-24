(function (module) {
    mifosX.controllers = _.extend(module, {
        ProfileController: function (scope, localStorageService, resourceFactory, $modal, commonUtilService) {
            scope.userDetails = localStorageService.getFromLocalStorage('userData');
            resourceFactory.myAccountResource.get(function (data) {
                scope.user = data;
            });
            scope.status = 'Not Authenticated';
            if (scope.userDetails.authenticated == true) {
                scope.status = 'Authenticated';
            }
            scope.updatePassword = function () {
                $modal.open({
                    templateUrl: 'password.html',
                    controller: UpdatePasswordCtrl,
                    resolve: {
                        userId: function () {
                            return scope.userDetails.userId;
                        }
                    }
                });
            };
            var UpdatePasswordCtrl = function ($scope, $modalInstance, userId) {
                $scope.save = function () {
                    var credentialsData = {};
                    angular.copy(this.formData,credentialsData);
                    if(credentialsData.oldPassword){
                        credentialsData.oldPassword = commonUtilService.encrypt(credentialsData.oldPassword);
                    }
                    if(credentialsData.password){
                        credentialsData.password = commonUtilService.encrypt(credentialsData.password);
                    }
                    if(credentialsData.repeatPassword){
                        credentialsData.repeatPassword = commonUtilService.encrypt(credentialsData.repeatPassword);
                    }
                    resourceFactory.myAccountResource.changePassword(credentialsData, function (data) {
                        $modalInstance.close('modal');
                        if (data.resourceId == userId) {
                            scope.logout();
                        };
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
        }
    });
    mifosX.ng.application.controller('ProfileController', ['$scope', 'localStorageService', 'ResourceFactory', '$modal', 'CommonUtilService', mifosX.controllers.ProfileController]).run(function ($log) {
        $log.info("ProfileController initialized");
    });
}(mifosX.controllers || {}));
