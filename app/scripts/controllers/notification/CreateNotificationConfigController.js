(function(module) {
    mifosX.controllers = _.extend(module, {
        CreateNotificationConfigController: function(scope, routeParams, resourceFactory, location, route) {
            //scope.entityKeyData = {"key": [{"code": "loanId","value": "Loan Id"}]}

            function populateDetails() {
                 
                resourceFactory.notificationConfigTemplateResource.retrieve({}, function(data) {
                    scope.notificationConfigTemplateData = data;
                });
                
            };
            populateDetails();

            scope.submit = function() {
                resourceFactory.notificationConfigurationResource.save(this.formData, function(data) {
                    location.path('/notification/configuration');
                });
            };
        }
    });
    mifosX.ng.application.controller('CreateNotificationConfigController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.CreateNotificationConfigController]).run(function($log) {
        $log.info("CreateNotificationConfigController initialized");
    });
}(mifosX.controllers || {}));