/**
 * Created by 27 on 03-08-2015.
 */
(function (module) {
    mifosX.controllers = _.extend(module, {
        ExternalServicesController: function (scope, resourceFactory, location, route) {
            scope.S3Configs = [];
            scope.SMTPConfigs = [];
            scope.otherExternalServiceList= [];
            scope.externalServiceList= [];
            resourceFactory.otherExternalServicesResource.getAll(function (data) {
                scope.otherExternalServiceList = data;
            });
            resourceFactory.externalServicesResource.get(function (data) {
                scope.externalServiceList = data;
            });
            scope.isStatusEnabled = function(externalService){
                if(externalService.status===true){
                    return true;
                }
                return false;
            }
        }
    });
    mifosX.ng.application.controller('ExternalServicesController', ['$scope', 'ResourceFactory', '$location', '$route',
        mifosX.controllers.ExternalServicesController]).run(function ($log){
        $log.info("ExternalServicesController initialized");
    });


}(mifosX.controllers || {}));
