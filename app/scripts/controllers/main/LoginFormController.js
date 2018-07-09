(function (module) {
    mifosX.controllers = _.extend(module, {
        LoginFormController: function (scope, authenticationService, resourceFactory, httpService, $timeout, commonUtilService, vcRecaptchaService) {
            /**
             * reCaptcha
             */
            scope.reCaptchaResponse = null;
            scope.widgetId = null;

            scope.reCaptchaModel = {
                siteKey: '6Lfum2IUAAAAAM3WJUx4akRuNEiYLN6J-TI__37d'
            };

            scope.setResponse = function (response) {
                //console.info('Response available');
                scope.reCaptchaResponse = response;
                delete scope.authenticationErrorMessage;
                delete scope.authenticationFailed;
            };

            scope.setWidgetId = function (widgetId) {
                //console.info('Created widget ID: %s', widgetId);
                scope.widgetId = widgetId;
            };

            /*scope.cbExpiration = function () {
                 //console.info('Captcha expired. Resetting response object');
                 vcRecaptchaService.reload(scope.widgetId);
                 scope.reCaptchaResponse = null;
            };*/

            scope.reCaptchaSubmit = function () {
                if (scope.mainControllerUIConfigData.isEnabledRecaptcha) {
                    delete scope.authenticationErrorMessage;
                    delete scope.authenticationFailed;
                    if (vcRecaptchaService.getResponse() === "") { //if string is empty
                        scope.authenticationErrorMessage = 'error.recaptcha.connection.failed';
                        scope.authenticationFailed = true;
                        //vcRecaptchaService.reload(scope.widgetId);
                    } else {
                        scope.login();
                        setTimeout(function () {
                            vcRecaptchaService.reload(scope.widgetId);
                        }, 2000);
                    }
                    //var siteVerifyURL = "https://www.google.com/recaptcha/api/siteverify"
                    /**
                     * SERVER SIDE VALIDATION
                     *
                     * You need to implement your server side validation here.
                     * Send the reCaptcha response to the server and use some of the server side APIs to validate it
                     * See https://developers.google.com/recaptcha/docs/verify
                     */
                    /*console.log('sending the captcha response to the server', scope.reCaptchaResponse);

                    if (valid) {
                        console.log('Success');
                    } else {
                        console.log('Failed validation');

                        // In case of a failed validation you need to reload the captcha
                        // because each response can be checked just once
                        vcRecaptchaService.reload(scope.widgetId);
                    }*/
                } else {
                    scope.login();
                }
            };
            
            ///////////////////////////////////////
            scope.loginCredentials = {};
            scope.passwordDetails = {};
            scope.authenticationFailed = false;
            scope.load = false;
            scope.otpPanel = false;

            scope.login = function () {
                scope.load = true;
                authenticationService.authenticateWithUsernamePassword(scope.loginCredentials);
            };

            scope.correctCaptcha = function(response) {
                alert(response);
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
                if(data && data.error_description){
                    scope.authenticationErrorMessage = data.error_description;
                }else{
                    scope.authenticationErrorMessage = 'error.connection.failed';
                }
                scope.load = false;
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
    mifosX.ng.application.controller('LoginFormController', ['$scope', 'AuthenticationService', 'ResourceFactory', 'HttpService','$timeout', 'CommonUtilService', 'vcRecaptchaService', mifosX.controllers.LoginFormController]).run(function ($log) {
        $log.info("LoginFormController initialized");
    });
}(mifosX.controllers || {}));
