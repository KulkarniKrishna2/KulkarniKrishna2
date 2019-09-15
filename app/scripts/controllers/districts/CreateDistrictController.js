(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateDistrictController: function (scope, resourceFactory, location, routeParams) {
            scope.countryId = routeParams.countryId;
            scope.formData = {};
            scope.formData.stateId = routeParams.stateId;
            scope.stateData = {};

            resourceFactory.stateResource.getStateData({ countryId: scope.countryId, stateId: scope.formData.stateId, template: false }, function (data) {
                scope.stateData = data;
            });

            scope.submit = function () {
                resourceFactory.districtsResource.save(scope.formData, function (data) {
                    location.path('/districts/' + data.resourceId);
                });
            };
        }
    });
    mifosX.ng.application.controller('CreateDistrictController', ['$scope', 'ResourceFactory', '$location', '$routeParams', mifosX.controllers.CreateDistrictController]).run(function ($log) {
        $log.info("CreateDistrictController initialized");
    });
}(mifosX.controllers || {}));