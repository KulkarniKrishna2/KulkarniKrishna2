(function (module) {
    mifosX.controllers = _.extend(module, {
        reviewloanapplicationactivitycontroller: function ($controller, scope, resourceFactory, location, routeParams, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            
        }

    });
    mifosX.ng.application.controller('reviewloanapplicationactivitycontroller', ['$controller', '$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.reviewloanapplicationactivitycontroller]).run(function ($log) {
        $log.info("reviewloanapplicationactivitycontroller initialized");
    });
}(mifosX.controllers || {}));