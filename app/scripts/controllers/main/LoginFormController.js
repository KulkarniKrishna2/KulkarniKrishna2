(function (module) {
    mifosX.controllers = _.extend(module, {
        LoginFormController: function (scope, authenticationService, resourceFactory, httpService, $timeout, commonUtilService, vcRecaptchaService) {
            /**
             * reCaptcha
             */
            scope.reCaptchaResponse = null;
            scope.widgetId = null;
            scope.enableCaptchaOnFailedLogInAttempts = false;

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
                if (scope.mainUIConfigData.loginSecurity && (scope.mainUIConfigData.loginSecurity.isEnabledCaptcha || scope.enableCaptchaOnFailedLogInAttempts)) {
                    if (scope.mainUIConfigData.loginSecurity.defaultCaptcha === 'Recaptcha') {
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
                    }else{
                        scope.login();
                    }
                } else {
                    scope.login();
                }
            };

            ///////////////////////////////////////
            scope.loginCredentials = {};
            scope.passwordDetails = {};
            scope.captchaData = {};
            scope.captchaFormData = {};
            scope.authenticationFailed = false;
            scope.load = false;
            scope.otpPanel = false;
            scope.captchaPanel = false;

            scope.login = function () {
                if (scope.mainUIConfigData.loginSecurity && (scope.mainUIConfigData.loginSecurity.isEnabledCaptcha || scope.enableCaptchaOnFailedLogInAttempts)) {
                    if (scope.mainUIConfigData.loginSecurity.defaultCaptcha === 'Patchca') {
                        scope.loginCredentials.captchaDetails = {
                            captcha: scope.captchaFormData.captchaEntered,
                            captcha_reference_id: scope.captchaData.captchaReferenceId
                        };
                    }
                }
                scope.load = true;
                if(scope.response.uiDisplayConfigurations.loginSecurity.isEnabledLdap){
                    if(scope.loginCredentials.ldap !== undefined){
                        if(scope.loginCredentials.ldap === 'bss'){
                            authenticationService.authenticateWithUsernamePassword(scope.loginCredentials);
                        }
                        else{
                            authenticationService.authenticateWithLdap(scope.loginCredentials);
                        }
                    }
                }
                else{
                    authenticationService.authenticateWithUsernamePassword(scope.loginCredentials);
                }
            };

            scope.correctCaptcha = function(response) {
                //console.log(response);
            };

            scope.loginWithOTP = function() {
                if (scope.mainUIConfigData.loginSecurity && (scope.mainUIConfigData.loginSecurity.isEnabledCaptcha || scope.enableCaptchaOnFailedLogInAttempts)) {
                    if (scope.mainUIConfigData.loginSecurity.defaultCaptcha === 'Patchca') {
                        scope.loginCredentials.captchaDetails = {
                            captcha: scope.captchaFormData.captchaEntered,
                            captcha_reference_id: scope.captchaData.captchaReferenceId
                        };
                    }
                }
                scope.load = true;
                if (scope.loginCredentials && scope.loginCredentials.otp) {
                    authenticationService.authenticateWithOTP(scope.loginCredentials);
                }
            };

            scope.refreshPatchca = function(){
                if (scope.mainUIConfigData.loginSecurity && (scope.mainUIConfigData.loginSecurity.isEnabledCaptcha || scope.enableCaptchaOnFailedLogInAttempts) &&  scope.mainUIConfigData.loginSecurity.defaultCaptcha === 'Patchca' ) {
                    resourceFactory.captchaResource.generate({}, function (data) {
                        scope.captchaData = data;
                        scope.loginCredentials.captchaDetails = undefined;
                        scope.captchaFormData = {};
                    });
                }
            };

            scope.$on("resetCaptchaEvent", function (event) {
                init();
            });

            function init() {
                scope.refreshPatchca();
            }

            scope.showLoginScreen = function() {
                scope.otpPanel = false;
            };

            scope.$on("UserAuthenticationFailureEvent", function (event, data, status) {
                if(data.captcha_mandatory){
                    scope.enableCaptchaOnFailedLogInAttempts = true;
                }
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
                init();
            });

            scope.$on("UserAuthenticationSuccessEvent", function (event, data) {
                scope.hideLoginPannel = false;
                scope.enableCaptchaOnFailedLogInAttempts = false;
                scope.load = false;
                scope.authenticationFailed = false;
                scope.otpPanel = false;
                timer = $timeout(function () {
                    delete scope.loginCredentials.password;
                    delete scope.loginCredentials.otp;
                    delete scope.loginCredentials.captchaDetails;
                }, 2000);
            });

            scope.$on("UserAuthenticationEnterOTPEvent", function (event, data) {
                scope.otpPanel = true;
                scope.loginCredentials.otpTokenId = data.otpTokenId;
                delete scope.authenticationErrorMessage;
                scope.authenticationFailed = false;
                if(data.captcha_mandatory){
                    scope.enableCaptchaOnFailedLogInAttempts = true;
                }
                init();
                if (scope.isUpdatedPassword) {
                    $timeout(function () {
                        logoutAfterUpdatePassword();
                    }, 2000);
                }
            });

            var logoutAfterUpdatePassword = function () {
                scope.otpPanel = false;
                scope.resetPassword = false;
                scope.loginCredentials.password = "";
                scope.isUpdatedPassword = false;
            }

            scope.$on("UnauthorizedRequest", function (event, data) {
                scope.authenticationFailed = true;
                if (data && data.error && data.error == 'invalid_token') {
                    scope.authenticationErrorMessage = 'label.error.session.expired';
                } else if (data && data.error_description) {
                    scope.authenticationErrorMessage = data.error_description;
                }
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
                encryptOldPassword(credentialsData);
            };

            var encryptOldPassword = function(credentialsData){
                if(credentialsData.oldPassword){
                    commonUtilService.encrypt(credentialsData.oldPassword).then(function(encriptedText) {
                        credentialsData.oldPassword = commonUtilService.convertEncriptedArrayToText(encriptedText);
                        encryptNewpassword(credentialsData);
                    });
                }else{
                    encryptNewpassword(credentialsData);
                }
            }

            var encryptNewpassword = function(credentialsData){
                if(credentialsData.password){
                    commonUtilService.encrypt(credentialsData.password).then(function(encriptedText) {
                        credentialsData.password = commonUtilService.convertEncriptedArrayToText(encriptedText);
                        encryptRepeatPassword(credentialsData);
                    });
                }else{
                    encryptRepeatPassword(credentialsData);
                }
            }

            var encryptRepeatPassword = function(credentialsData){
                if(credentialsData.repeatPassword){
                    commonUtilService.encrypt(credentialsData.repeatPassword).then(function(encriptedText) {
                        credentialsData.repeatPassword = commonUtilService.convertEncriptedArrayToText(encriptedText);
                        sendUpdatePasswordRequest(credentialsData);
                    });
                }else{
                    sendUpdatePasswordRequest(credentialsData);
                }
            }

            var sendUpdatePasswordRequest = function(credentialsData){
                resourceFactory.myAccountResource.changePassword(credentialsData, function (data) {
                    //clear the old authorization token
                    httpService.cancelAuthorization();
                    scope.authenticationFailed = false;
                    if (scope.mainUIConfigData.loginSecurity && (scope.mainUIConfigData.loginSecurity.isEnabledCaptcha || scope.enableCaptchaOnFailedLogInAttempts) && scope.mainUIConfigData.loginSecurity.defaultCaptcha === 'Patchca') {
                        scope.resetPassword = false;
                        scope.refreshPatchca();
                        scope.loginCredentials.password = '';
                    }else{
                        scope.loginCredentials.password = scope.passwordDetails.password;
                        authenticationService.authenticateWithUsernamePassword(scope.loginCredentials);
                        scope.isUpdatedPassword = true;
                        scope.passwordDetails.oldPassword = "";
                        scope.passwordDetails.password = "";
                        scope.passwordDetails.repeatPassword = "";
                    }
                    
                });
            }

            $timeout(function () {
                init();
            }, 500);
            
        }
    });
    mifosX.ng.application.controller('LoginFormController', ['$scope', 'AuthenticationService', 'ResourceFactory', 'HttpService','$timeout', 'CommonUtilService', 'vcRecaptchaService', mifosX.controllers.LoginFormController]).run(function ($log) {
        $log.info("LoginFormController initialized");
    });
}(mifosX.controllers || {}));
