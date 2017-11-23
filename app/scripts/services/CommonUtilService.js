/**
 * Created by CT on 09-05-2017.
 */
(function (module) {
    mifosX.services = _.extend(module, {
        CommonUtilService: function () {
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
        }
    });
    mifosX.ng.services.service('CommonUtilService', [mifosX.services.CommonUtilService]).run(function ($log) {
        $log.info("CommonUtilService initialized");
    });
}(mifosX.services || {}));