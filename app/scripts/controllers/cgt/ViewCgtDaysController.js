(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewCgtDaysController: function (scope, resourceFactory, routeParams, location, $rootScope) {
            scope.cgtDays = {};
            scope.cgtId = $rootScope.cgtId;


            resourceFactory.cgtDaysResource.getCgtDaysById({id: scope.cgtId, cgtDayId: routeParams.cgtDayId}, function (data) {
                scope.cgtDays = data;

            });

        }
    });
    mifosX.ng.application.controller('ViewCgtDaysController', ['$scope', 'ResourceFactory', '$routeParams', '$location', '$rootScope', mifosX.controllers.ViewCgtDaysController]).run(function ($log) {
        $log.info("ViewCgtDaysController initialized");
    });
}(mifosX.controllers || {}));

