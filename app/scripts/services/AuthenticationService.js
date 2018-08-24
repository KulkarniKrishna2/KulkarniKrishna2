(function (module) {
    mifosX.services = _.extend(module, {
        AuthenticationService: function (scope, httpService, SECURITY, localStorageService,timeout, webStorage, commonUtilService) {
            var onSuccess = function (data) {
                scope.$broadcast("UserAuthenticationSuccessEvent", data);
                localStorageService.addToLocalStorage('userData', data);
            };

            var onFailure = function (data, status) {
                scope.$broadcast("UserAuthenticationFailureEvent", data, status);
            };

            var onRefreshFailure = function () {
                scope.$broadcast("RefreshAuthenticationFailureEvent");
            };

            var apiVer = '/fineract-provider/api/v1';

            var getUserDetails = function(data){

                localStorageService.addToLocalStorage('tokendetails', data);
                setTimer(data.expires_in);
                httpService.get( apiVer + "/userdetails?access_token=" + data.access_token)
                    .success(onSuccess)
                    .error(onFailure);

            }

            var updateAccessDetails = function(data){
                var sessionData = webStorage.get('sessionData');
                sessionData.authenticationKey = data.access_token;
                webStorage.add("sessionData",sessionData);
                localStorageService.addToLocalStorage('tokendetails', data);
                var userDate = localStorageService.getFromLocalStorage("userData");
                userDate.accessToken =  data.access_token;
                localStorageService.addToLocalStorage('userData', userDate);
                httpService.setAuthorization(data.access_token,true);
                setTimer(data.expires_in);
            }

            var setTimer = function(time){
                var waitTime = time > 30 ? time-30 : 1;
                timeout(getAccessToken, waitTime * 1000);
            }

            var getAccessToken = function(){
                var refreshToken = localStorageService.getFromLocalStorage("tokendetails").refresh_token;
                httpService.cancelAuthorization();
                httpService.post( "/fineract-provider/api/oauth/token?&client_id=community-app&grant_type=refresh_token&client_secret=123&refresh_token=" + refreshToken)
                    .success(updateAccessDetails).error(onRefreshFailure);
            }

            var credentialsData = {};
            this.authenticateWithUsernamePassword = function (credentials) {
                scope.$broadcast("UserAuthenticationStartEvent");
                angular.copy(credentials,credentialsData);
        		if(SECURITY === 'oauth'){
                    httpService.get(apiVer + "/cryptography/login/publickey?username="+credentials.username)
                        .success(onOauthSuccessPublicKeyData)
                        .error(onFailure);
        		} else {                    
                    httpService.get(apiVer + "/cryptography/login/publickey?username="+credentials.username)
                        .success(onSuccessPublicKeyData)
                        .error(onFailure);
                }
            };

            this.authenticateWithOTP = function(credentials) {
                var formData = {};
                formData.client_id = 'community-app';
                formData.grant_type = 'OTP';
                formData.client_secret = '123';
                formData.otp_token = credentials.otpTokenId;
                formData.otp = credentials.otp;
                httpService.post("/fineract-provider/api/oauth/token", formData)
                    .success(getUserDetails)
                    .error(onFailure);
            };

            var isPasswordEncrypted = false;

            var onOauthSuccessPublicKeyData = function (publicKeyData) {
                publicKey = undefined;
                if (!_.isUndefined(publicKeyData.keyValue)) {
                    isPasswordEncrypted = true;
                    publicKey = publicKeyData.keyValue;
                    var encryptedPassword = commonUtilService.encrypt(credentialsData.password);
                    if (encryptedPassword == false) {
                        onFailure(null);
                    } else {
                        credentialsData.password = encryptedPassword;
                        oauthAuthenticateProcesses(credentialsData);
                    }
                } else {
                    isPasswordEncrypted = false;
                    oauthAuthenticateProcesses(credentialsData);
                }
            };

            var oauthAuthenticateProcesses = function(credentials) {
                var data = {};
                data.username = credentials.username;
                data.password = credentials.password;
                data.client_id = 'community-app';
                data.grant_type = 'password';
                data.client_secret = '123';
                data.isPasswordEncrypted = isPasswordEncrypted.toString();
                if(credentials.captchaDetails !=undefined){
                    data.captcha_reference_id= credentials.captchaDetails.captcha_reference_id;
                    data.captcha = credentials.captchaDetails.captcha;
                }
                httpService.post("/fineract-provider/api/oauth/token", data)
                    .success(oauthTokenSuccess)
                    .error(onFailure);
            };

            var oauthTokenSuccess = function(data) {
                if (data.twoFactorAuthenticationEnabled) {
                    scope.$broadcast("UserAuthenticationEnterOTPEvent", data);
                } else {
                    getUserDetails(data);
                }
            };

            var onSuccessPublicKeyData = function (publicKeyData) {
                publicKey = undefined;
                if (!_.isUndefined(publicKeyData.keyValue)) {
                    isPasswordEncrypted = true;
                    publicKey = publicKeyData.keyValue;
                    var encryptedPassword = commonUtilService.encrypt(credentialsData.password);
                    if (encryptedPassword == false) {
                        onFailure(null);
                    } else {
                        credentialsData.password = encryptedPassword;
                        authenticateProcesses(credentialsData);
                    }
                } else {
                    isPasswordEncrypted = false;
                    authenticateProcesses(credentialsData);
                }
            };

            var authenticateProcesses = function (credentials) {
                httpService.post(apiVer + "/authentication?isPasswordEncrypted="+isPasswordEncrypted, credentials)
                    .success(onSuccess)
                    .error(onFailure);
            };

        }
    });
    mifosX.ng.services.service('AuthenticationService', ['$rootScope', 'HttpService', 'SECURITY', 'localStorageService','$timeout','webStorage', 'CommonUtilService', mifosX.services.AuthenticationService]).run(function ($log) {
        $log.info("AuthenticationService initialized");
    });
}(mifosX.services || {}));
