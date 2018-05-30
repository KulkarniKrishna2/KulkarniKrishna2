(function (module) {
    mifosX.controllers = _.extend(module, {
        kotakApprovalActivityController: function ($controller, scope, routeParams, $modal, resourceFactory, location, dateFilter, ngXml2json, route, $http, $rootScope, $sce, CommonUtilService, $route, $upload, API_VERSION) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));
        }
        });
    mifosX.ng.application.controller('kotakApprovalActivityController', ['$controller', '$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter', 'ngXml2json', '$route', '$http', '$rootScope', '$sce', 'CommonUtilService', '$route', '$upload', 'API_VERSION', mifosX.controllers.kotakApprovalActivityController]).run(function ($log) {
        $log.info("kotakApprovalActivityController initialized");
    });
}(mifosX.controllers || {}));