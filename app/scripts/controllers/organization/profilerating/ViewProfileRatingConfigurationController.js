(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewProfileRatingConfigurationController: function (scope, resourceFactory, location) {
            resourceFactory.createProfileRatingConfiguration.getAll(function (response) {
                scope.profileRatingConfigs = response;
            });
        }
    });
    mifosX.ng.application.controller('ViewProfileRatingConfigurationController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.ViewProfileRatingConfigurationController]).run(function ($log) {
        $log.info("ViewProfileRatingConfigurationController initialized");
    });
}(mifosX.controllers || {}));