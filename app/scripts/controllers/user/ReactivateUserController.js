(function (module) {
    mifosX.controllers = _.extend(module, {
        ReactivateUserController: function (scope, resourceFactory, routeParams, commonUtilService, location) {
            scope.formData = {};
            resourceFactory.deactivatedUserResource.get({ userId: routeParams.id }, function (data) {
                scope.formData = data;
            });
            scope.submit = function () {
                var activateFormdata = {
                    username: scope.formData.username,
                    firstname: scope.formData.firstname,
                    lastname: scope.formData.lastname,
                    email: scope.formData.email,
                    sendPasswordToEmail: scope.formData.sendPasswordToEmail
                };
                encryptNewpassword(activateFormdata);
                
                
            }

            var encryptNewpassword = function(activateFormdata){
                if(scope.formData.password){
                    commonUtilService.encrypt(scope.formData.password).then(function(encriptedText) {
                        activateFormdata.password = commonUtilService.convertEncriptedArrayToText(encriptedText);
                        encryptRepeatPassword(activateFormdata);
                    });
                }else{
                    encryptRepeatPassword(activateFormdata);
                }
            };

            var encryptRepeatPassword = function(activateFormdata){
                if(scope.formData.repeatPassword){
                    commonUtilService.encrypt(scope.formData.repeatPassword).then(function(encriptedText) {
                        activateFormdata.repeatPassword = commonUtilService.convertEncriptedArrayToText(encriptedText);
                        sendReactivateRequest(activateFormdata);
                    });
                }else{
                    sendReactivateRequest(activateFormdata);
                }
            };

            var sendReactivateRequest = function(activateFormdata){
                resourceFactory.userListResource.post({ userId: routeParams.id, command: 'reactivate' }, activateFormdata, function (data) {
                    location.path('/users');
                });
            };
        }
    });
    mifosX.ng.application.controller('ReactivateUserController', ['$scope', 'ResourceFactory', '$routeParams', 'CommonUtilService', '$location', mifosX.controllers.ReactivateUserController]).run(function ($log) {
        $log.info("ReactivateUserController initialized");
    });
}(mifosX.controllers || {}));