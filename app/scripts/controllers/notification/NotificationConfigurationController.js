(function(module) {
    mifosX.controllers = _.extend(module, {
        NotificationConfigurationController: function(scope, routeParams, resourceFactory, location, route) {
           
            function populateDetails() {
                resourceFactory.notificationConfigurationResource.retrieveAll({}, function(data) {
                    scope.notificationConfigurations = data;
                });
            }
            populateDetails();

            scope.routeTo = function(id) {
                location.path('/notification/configuration/' + id);
            };
        }
    });
    mifosX.ng.application.controller('NotificationConfigurationController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.NotificationConfigurationController]).run(function($log) {
        $log.info("NotificationConfigurationController initialized");
    });
}(mifosX.controllers || {}));

