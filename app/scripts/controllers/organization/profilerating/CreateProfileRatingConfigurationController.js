(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateProfileRatingConfigurationController: function (scope, resourceFactory, location) {
            scope.formData = {};
            scope.formData.isActive = true;
            resourceFactory.createProfileRatingConfigurationTemplate.get(function (response) {
                scope.typeOptions = response.typeOptions;
                scope.criteriaOptions = response.criteriaOptions;
            });
            scope.submit = function () {
                this.formData.locale = "en";
                resourceFactory.createProfileRatingConfiguration.save(this.formData, function (response) {
                    location.path('/viewprofileratingconfigs')
                });
            }
        }
    });
    mifosX.ng.application.controller('CreateProfileRatingConfigurationController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.CreateProfileRatingConfigurationController]).run(function ($log) {
        $log.info("CreateProfileRatingConfigurationController initialized");
    });
}(mifosX.controllers || {}));