(function (module) {
    mifosX.controllers = _.extend(module, {
        districtActivationActivityController: function ($controller, scope, resourceFactory, location) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.districtId = scope.taskconfig['districtId'];
            scope.formData = {};

            resourceFactory.districtsResource.get({districtId: scope.districtId}, function(data){
                scope.district = data;
            });

            scope.submit = function () {
                resourceFactory.districtsResource.save({ districtId: scope.districtId, command: 'activate'}, scope.formData, function (data) {
                    location.path('/districts');
                });
            };
        }

    });
    mifosX.ng.application.controller('districtActivationActivityController', ['$controller', '$scope', 'ResourceFactory', '$location', mifosX.controllers.districtActivationActivityController]).run(function ($log) {
        $log.info("districtActivationActivityController initialized");
    });
}(mifosX.controllers || {}));