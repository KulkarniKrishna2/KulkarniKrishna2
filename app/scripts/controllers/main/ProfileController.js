(function (module) {
    mifosX.controllers = _.extend(module, {
        ProfileController: function (scope, localStorageService, resourceFactory, $modal, commonUtilService) {
            scope.userDetails = localStorageService.getFromLocalStorage('userData');
            scope.kotakUser = false;
            resourceFactory.myAccountResource.get(function (data) {
                scope.user = data;
                if(data!==undefined){
                    if(data.username.includes("kotak")){
                        scope.kotakUser = true;
                    }
                }
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
                    encryptOldPassword($modalInstance,credentialsData);
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            var encryptOldPassword = function($modalInstance,credentialsData){
                if(credentialsData.oldPassword){
                    commonUtilService.encrypt(credentialsData.oldPassword).then(function(encriptedText) {
                        credentialsData.oldPassword = commonUtilService.convertEncriptedArrayToText(encriptedText);
                        encryptNewpassword($modalInstance,credentialsData);
                    });
                }else{
                    encryptNewpassword($modalInstance,credentialsData);
                }
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
                resourceFactory.myAccountResource.changePassword(credentialsData, function (data) {
                    $modalInstance.close('modal');
                    if (data.resourceId == userId) {
                        scope.logoutFromUi();
                    };
                });
            };
        }
    });
    mifosX.ng.application.controller('ProfileController', ['$scope', 'localStorageService', 'ResourceFactory', '$modal', 'CommonUtilService', mifosX.controllers.ProfileController]).run(function ($log) {
        $log.info("ProfileController initialized");
    });
}(mifosX.controllers || {}));
