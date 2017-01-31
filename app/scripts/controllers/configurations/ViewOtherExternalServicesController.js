/**
 * Created by 27 on 05-08-2015.
 */
(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewOtherExternalServicesController: function ($scope, resourceFactory, $routeParams, location) {
            $scope.serviceId = $routeParams.serviceId;
            //$scope.name = $routeParams.name;

            resourceFactory.otherExternalServicesResource.get({serviceId: $scope.serviceId}, function (data) {
                $scope.serviceData = data;
            });

            $scope.cancel = function () {
                location.path('/externalservices');
            };

        }

    });
    mifosX.ng.application.controller('ViewOtherExternalServicesController', ['$scope', 'ResourceFactory', '$routeParams', '$location', mifosX.controllers.ViewOtherExternalServicesController]).run(function ($log) {
        $log.info("ViewOtherExternalServicesController initialized");
    });

}(mifosX.controllers || {}));
