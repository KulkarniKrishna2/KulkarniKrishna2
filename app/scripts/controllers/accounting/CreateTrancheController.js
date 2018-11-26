(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateTrancheController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal, $rootScope) {
            scope.formData = {};
            resourceFactory.createTranche.query(function (data) {
                scope.ViewTranches = data;
            });
            scope.createTranche = function () {
                resourceFactory.createTranchetemplate.get(function (data) {
                    $rootScope.createTrancheForm = data;
                    location.path('/createtranche');
                });
            }
            scope.submitTranche = function () {
                scope.formData.locale = scope.optlang.code;

                resourceFactory.createTranche.save(scope.formData, function (data) {
                    location.path('/viewtranche');
                });
            }
        }
    });
    mifosX.ng.application.controller('CreateTrancheController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', '$rootScope', mifosX.controllers.CreateTrancheController]).run(function ($log) {
        $log.info("CreateTrancheController initialized");
    });
}(mifosX.controllers || {}));