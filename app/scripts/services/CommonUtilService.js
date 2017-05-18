/**
 * Created by CT on 09-05-2017.
 */
(function (module) {
    mifosX.services = _.extend(module, {
        CommonUtilService: function () {
            this.onDayTypeOptions = function(){
                var onDayTypeOptions = [];
                for (var i = 1; i <= 28; i++) {
                    onDayTypeOptions.push(i);
                }
                return onDayTypeOptions;
            };
        }
    });
    mifosX.ng.services.service('CommonUtilService', [mifosX.services.CommonUtilService]).run(function ($log) {
        $log.info("CommonUtilService initialized");
    });
}(mifosX.services || {}));