(function (module) {
    mifosX.controllers = _.extend(module, {
        EditProfileRatingConfigurationController: function (scope, routeParams, resourceFactory, location) {
            scope.formData = {};
            resourceFactory.createProfileRatingConfigurationTemplate.get(function (response) {
                scope.typeOptions = response.typeOptions;
                scope.criteriaOptions = response.criteriaOptions;
                resourceFactory.createProfileRatingConfiguration.get({profileRatingConfigId : routeParams.profileRatingConfigId},function (response) {
                    scope.formData.type = response.type.id;
                    scope.formData.criteriaId = response.criteriaData.id;
                    scope.formData.isActive = response.isActive;
                });
            });
            scope.submit = function () {
                this.formData.locale = "en";
                resourceFactory.createProfileRatingConfiguration.update({profileRatingConfigId : routeParams.profileRatingConfigId},this.formData, function (response) {
                    location.path('/viewprofileratingconfigs')
                });
            }
        }
    });
    mifosX.ng.application.controller('EditProfileRatingConfigurationController', ['$scope', '$routeParams', 'ResourceFactory', '$location', mifosX.controllers.EditProfileRatingConfigurationController]).run(function ($log) {
        $log.info("EditProfileRatingConfigurationController initialized");
    });
}(mifosX.controllers || {}));