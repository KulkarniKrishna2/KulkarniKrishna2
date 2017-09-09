(function (module) {
    mifosX.controllers = _.extend(module, {
        officeActivationActivityController: function ($controller, scope, resourceFactory, location, routeParams, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.officeId = scope.taskconfig['officeId'];
            scope.formData = {};

            resourceFactory.officeResource.get({officeId: scope.officeId}, function(data){
                scope.office = data;
            });

            scope.submit = function () {
                resourceFactory.officeResource.save({ officeId: scope.officeId, command: 'activate' }, scope.formData, function (data) {
                    location.path('/offices');
                });
            };
        }

    });
    mifosX.ng.application.controller('officeActivationActivityController', ['$controller', '$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.officeActivationActivityController]).run(function ($log) {
        $log.info("officeActivationActivityController initialized");
    });
}(mifosX.controllers || {}));