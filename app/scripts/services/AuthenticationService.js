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
                httpService.setAuthorization(data.access_token, true);
                localStorageService.addToLocalStorage('tokendetails', data);
                setTimer(data.expires_in);
                httpService.get(apiVer + "/userdetails")
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
                var accesPayload = {
                    client_id: 'community-app',
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken
                };
                httpService.post("/fineract-provider/api/oauth/token", accesPayload)
                    .success(updateAccessDetails).error(onRefreshFailure);
            }

            var credentialsData = {};
            var ldapCredentialsData = {};
            this.authenticateWithUsernamePassword = function (credentials) {
                scope.$broadcast("UserAuthenticationStartEvent");
                angular.copy(credentials,credentialsData);
                if(credentials.ldap !== undefined){
                    if(credentials.ldap === 'bss'){
                        credentialsData.username = credentials.ldap +"/"+credentials.username;
                    }
                }
        		if(SECURITY === 'oauth'){
                    httpService.post(apiVer + "/cryptography/login/generatepublickey?username="+credentialsData.username)
                        .success(onOauthSuccessPublicKeyData)
                        .error(onFailure);
        		} else {                    
                    httpService.post(apiVer + "/cryptography/login/generatepublickey?username="+credentialsData.username)
                        .success(onSuccessPublicKeyData)
                        .error(onFailure);
                }
            };

            this.authenticateWithLdap= function (credentials) {
                scope.$broadcast("UserAuthenticationStartEvent");
                angular.copy(credentials,ldapCredentialsData);
                ldapCredentialsData.username = credentials.ldap +"/"+credentials.username;
                oauthAuthenticateProcesses(ldapCredentialsData);
            };

            this.authenticateWithOTP = function(credentials) {
                var formData = {};
                formData.client_id = 'community-app';
                formData.grant_type = 'OTP';
                formData.otp_token = credentials.otpTokenId;
                formData.otp = credentials.otp;
                if(credentials.captchaDetails !=undefined){
                    formData.captcha_reference_id= credentials.captchaDetails.captcha_reference_id;
                    formData.captcha = credentials.captchaDetails.captcha;
                }
                httpService.post("/fineract-provider/api/oauth/token", formData)
                    .success(getUserDetails)
                    .error(onFailure);
            };

            

            var onOauthSuccessPublicKeyData = function (publicKeyData) {
                publicKey = undefined;
                if (!_.isUndefined(publicKeyData.keyValue)) {
                    commonUtilService.importRsaKey(publicKeyData.keyValue,onOauthImportRsaKeySuccess,onFailure);
                } else {
                    
                    oauthAuthenticateProcesses(credentialsData);
                }
            };

            var onOauthImportRsaKeySuccess = function(){
                commonUtilService.encryptWithRsaOaep(credentialsData.password,onOauthEncryptionSuccess,onFailure);
            }

            var onOauthEncryptionSuccess = function(encryptedPassword){
                if (encryptedPassword == false) {
                    onFailure(null);
                } else {
                    credentialsData.password = encryptedPassword;
                    oauthAuthenticateProcesses(credentialsData);
                }
            };

            var oauthAuthenticateProcesses = function(credentials) {
                var data = {};
                data.username = credentials.username;
                data.password = credentials.password;
                data.client_id = 'community-app';
                data.grant_type = 'password';
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
                    commonUtilService.importRsaKey(publicKeyData.keyValue,onImportRsaKeySuccess,onFailure);
                } else {
                    
                    authenticateProcesses(credentialsData);
                }
            };

            var onImportRsaKeySuccess = function(){
                commonUtilService.encryptWithRsaOaep(credentialsData.password,onEncryptionSuccess,onFailure);
            }

            var onEncryptionSuccess = function(encryptedPassword){
                if (encryptedPassword == false) {
                    onFailure(null);
                } else {
                    credentialsData.password = encryptedPassword;
                    authenticateProcesses(credentialsData);
                }
            };

            var authenticateProcesses = function (credentials) {
                httpService.post(apiVer + "/authentication", credentials)
                    .success(onSuccess)
                    .error(onFailure);
            };

        }
    });
    mifosX.ng.services.service('AuthenticationService', ['$rootScope', 'HttpService', 'SECURITY', 'localStorageService','$timeout','webStorage', 'CommonUtilService', mifosX.services.AuthenticationService]).run(function ($log) {
        $log.info("AuthenticationService initialized");
    });
}(mifosX.services || {}));
