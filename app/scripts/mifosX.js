var mifosX = (function (module) {
    module.ng = {
        config: angular.module('config_params', ['configurations']),
        services: angular.module('MifosX_Services', ['ngResource']),
        application: angular.module('MifosX_Application', ['MifosX_Services', 'config_params', 'webStorageModule', 'ui.bootstrap' , 'pascalprecht.translate', 'nvd3ChartDirectives', 'notificationWidget', 'angularFileUpload', 'modified.datepicker', 'ngRoute', 'ngSanitize', 'LocalStorageModule', 'ngIdle', 'ngCsv', 'frAngular', 'tmh.dynamicLocale', 'webcam', 'angularUtils.directives.dirPagination', 'angular-loading-bar', 'angularXml2json','ui.bootstrap.tooltip','ui.sortable','vcRecaptcha', 'mgo-angular-wizard'])
    };
    return module;
}(mifosX || {}));
