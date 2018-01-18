(function (module) {
    mifosX.controllers = _.extend(module, {
        LoginFormController: function (scope, authenticationService, resourceFactory, httpService, $timeout, commonUtilService) {
            scope.loginCredentials = {};
            scope.passwordDetails = {};
            scope.authenticationFailed = false;
            scope.load = false;
            scope.otpPanel = false;

            scope.login = function () {
                scope.load = true;
                authenticationService.authenticateWithUsernamePassword(scope.loginCredentials);
            };

            scope.loginWithOTP = function() {
                scope.load = true;
                if (scope.loginCredentials && scope.loginCredentials.otp) {
                    authenticationService.authenticateWithOTP(scope.loginCredentials);
                }
            };

            scope.showLoginScreen = function() {
                scope.otpPanel = false;
            };

            scope.$on("UserAuthenticationFailureEvent", function (event, data, status) {
                scope.hideLoginPannel = false;
                delete scope.loginCredentials.password;
                delete scope.loginCredentials.otp;
                scope.authenticationFailed = true;
                if(status != 401) {
                    scope.authenticationErrorMessage = 'error.connection.failed';
                    scope.load = false;
                } else {
                    if(data.userMessageGlobalisationCode === 'error.msg.user.account.locked'){
                        scope.authenticationErrorMessage = 'error.msg.user.account.locked';
                    }else{
                        scope.authenticationErrorMessage = 'error.login.failed';
                    }
                   scope.load = false;
                }
            });

            scope.$on("UserAuthenticationSuccessEvent", function (event, data) {
                scope.hideLoginPannel = false;
                scope.load = false;
                scope.authenticationFailed = false;
                scope.otpPanel = false;
                timer = $timeout(function(){
                    delete scope.loginCredentials.password;
                    delete scope.loginCredentials.otp;
                },2000);
             });

            scope.$on("UserAuthenticationEnterOTPEvent", function (event, data) {
                scope.otpPanel = true;
                scope.loginCredentials.otpTokenId = data.otpTokenId;
                
             });

            /*This logic is no longer required as enter button is binded with text field for submit.
            $('#pwd').keypress(function (e) {
                if (e.which == 13) {
                    scope.login();
                }
            });*/

            /*$('#repeatPassword').keypress(function (e) {
                if (e.which == 13) {
                    scope.updatePassword();
                }
            });*/

            scope.updatePassword = function (){
                var credentialsData = {};
                angular.copy(scope.passwordDetails,credentialsData);
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
                    //clear the old authorization token
                    httpService.cancelAuthorization();
                    scope.authenticationFailed = false;
                    scope.loginCredentials.password = scope.passwordDetails.password;
                    authenticationService.authenticateWithUsernamePassword(scope.loginCredentials);
                });
            };
        }
    });
    mifosX.ng.application.controller('LoginFormController', ['$scope', 'AuthenticationService', 'ResourceFactory', 'HttpService','$timeout', 'CommonUtilService', mifosX.controllers.LoginFormController]).run(function ($log) {
        $log.info("LoginFormController initialized");
    });
}(mifosX.controllers || {}));
