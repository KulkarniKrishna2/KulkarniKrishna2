(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateTalukaController: function (scope, resourceFactory, location, routeParams) {
            scope.districtId = routeParams.districtId;
            scope.formData = {};

            scope.getDistrictData = function () {
                resourceFactory.districtsResource.get({ districtId: scope.districtId, template: false }, function (data) {
                    scope.districtData = data;
                });
            }
            scope.getDistrictData();

            scope.submit = function () {
                resourceFactory.talukaResource.save({ districtId: scope.districtId }, scope.formData, function (data) {
                    location.path('/districts/' + scope.districtId);
                });
            };
        }
    });
    mifosX.ng.application.controller('CreateTalukaController', ['$scope', 'ResourceFactory', '$location', '$routeParams', mifosX.controllers.CreateTalukaController]).run(function ($log) {
        $log.info("CreateTalukaController initialized");
    });
}(mifosX.controllers || {}));