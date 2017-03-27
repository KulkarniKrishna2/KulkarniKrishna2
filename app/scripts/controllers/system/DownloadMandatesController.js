(function (module) {
    mifosX.controllers = _.extend(module, {
        DownloadMandatesController: function (scope, routeParams, resourceFactory, location, route, http, $modal, dateFilter, API_VERSION, $sce, $rootScope) {
            scope.formData = {};

            resourceFactory.mandatesTemplateResource.get({command: "MANDATES_DOWNLOAD"}, function (data) {
                scope.officeOptions = data.officeOptions;
            });

            scope.submit = function () {
                scope.formData.dateFormat = scope.df;
                scope.formData.locale = scope.optlang.code;
                resourceFactory.mandatesResource.post({command: "MANDATES_DOWNLOAD"},scope.formData,function (data) {
                    location.path('/viewmandates');
                });
            };
        }
    });

    mifosX.ng.application.controller('DownloadMandatesController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', '$http', '$modal', 'dateFilter', 'API_VERSION', '$sce', '$rootScope', mifosX.controllers.DownloadMandatesController]).run(function ($log) {
        $log.info("DownloadMandatesController initialized");
    });
}(mifosX.controllers || {}));
