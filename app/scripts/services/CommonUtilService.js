/**
 * Created by CT on 09-05-2017.
 */
(function (module) {
    mifosX.services = _.extend(module, {
        CommonUtilService: function ($rootScope,webStorage) {
            this.onDayTypeOptions = function () {
                var onDayTypeOptions = [];
                for (var i = 1; i <= 28; i++) {
                    onDayTypeOptions.push(i);
                }
                return onDayTypeOptions;
            };

            this.encrypt = function (data) {
                if (publicKey && publicKey != undefined && publicKey != null && publicKey.toString().trim().length > 0) {
                    var encrypt = new JSEncrypt();
                    encrypt.setPublicKey(publicKey);
                    return encrypt.encrypt(data);
                }
                return data;
            };

            this.commonParamsForNewWindow = function(){
                var sessionData = webStorage.get('sessionData');
                var authentication = "";
                if(sessionData.authenticationKey){
                   authentication = '&access_token='+sessionData.authenticationKey;
                }
                return 'tenantIdentifier='+$rootScope.tenantIdentifier + authentication;
            }
        }
    });
    mifosX.ng.services.service('CommonUtilService', ['$rootScope','webStorage',mifosX.services.CommonUtilService]).run(function ($log) {
        $log.info("CommonUtilService initialized");
    });
}(mifosX.services || {}));