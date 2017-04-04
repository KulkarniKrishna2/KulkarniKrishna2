(function (module) {
    mifosX.services = _.extend(module, {
        AuthenticationService: function (scope, httpService, SECURITY, localStorageService,timeout, webStorage) {
            var onSuccess = function (data) {
                scope.$broadcast("UserAuthenticationSuccessEvent", data);
                localStorageService.addToLocalStorage('userData', data);
            };

            var onFailure = function (data, status) {
                scope.$broadcast("UserAuthenticationFailureEvent", data, status);
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
                httpService.setAuthorization(data.access_token);
                setTimer(data.expires_in);
            }

            var setTimer = function(time){
                timeout(getAccessToken, time * 1000);
            }

            var getAccessToken = function(){
                var refreshToken = localStorageService.getFromLocalStorage("tokendetails").refresh_token;
                httpService.cancelAuthorization();
                httpService.post( "/fineract-provider/api/oauth/token?&client_id=community-app&grant_type=refresh_token&client_secret=123&refresh_token=" + refreshToken)
                    .success(updateAccessDetails);
            }

            var credentialsData = {};
            this.authenticateWithUsernamePassword = function (credentials) {
                scope.$broadcast("UserAuthenticationStartEvent");
        		if(SECURITY === 'oauth'){
                    var data = {};
                    data.username = credentials.username;
                    data.password = credentials.password;
                    data.client_id ='community-app';
                    data.grant_type = 'password';
                    data.client_secret = '123'
	                httpService.post( "/fineract-provider/api/oauth/token",data)
	                    .success(getUserDetails)
	                    .error(onFailure);
        		} else {
                    angular.copy(credentials,credentialsData);
                    httpService.post(apiVer + "/authentication?isPasswordEncrypted=true", '{}')
                        .success(onSuccessPublicKeyData)
                        .error(onFailure);
                }
            };

            var onSuccessPublicKeyData = function (publicKeyData) {
                scope.publicKey = publicKeyData.keyValue;
                var encrypt = new JSEncrypt();
                encrypt.setPublicKey(scope.publicKey);
                var encryptedPassword = encrypt.encrypt(credentialsData.password);
                if (encryptedPassword == false) {
                    onFailure(null);
                } else {
                    credentialsData.password = encryptedPassword;
                    httpService.post(apiVer + "/authentication?isPasswordEncrypted=true", credentialsData)
                        .success(onSuccess)
                        .error(onFailure);
                }
            };
        }
    });
    mifosX.ng.services.service('AuthenticationService', ['$rootScope', 'HttpService', 'SECURITY', 'localStorageService','$timeout','webStorage', mifosX.services.AuthenticationService]).run(function ($log) {
        $log.info("AuthenticationService initialized");
    });
}(mifosX.services || {}));
