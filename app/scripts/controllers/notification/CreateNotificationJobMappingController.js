(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateNotificationJobMappingController: function (scope, routeParams, resourceFactory, location, route) {
            scope.reportOptions = [];
            scope.formData = {};
            
            scope.noSelectedNotificationConfiguration = true;
            scope.errorsExist = true;
            function populateDetails() {
                resourceFactory.notificationConfigurationDetailsResource.get({ notificationConfigId: routeParams.notificationConfigId }, function (data) {
                    scope.notificationConfigurationName = data.uname;
                    scope.noSelectedNotificationConfiguration = false;
                    scope.errorsExist = false;
                });
                resourceFactory.reportsResource.getAll({ usageTrackingEnabledOnly: false }, function (data) {
                    scope.reportOptions = data;
                })
            }
            populateDetails();

            scope.submit = function () {
                resourceFactory.notificationJobMappingResource.save({ notificationConfigId: routeParams.notificationConfigId },scope.formData, function (data) {
                    location.path('notification/configuration/' + routeParams.notificationConfigId);
                })
            }
        }
    });
    mifosX.ng.application.controller('CreateNotificationJobMappingController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.CreateNotificationJobMappingController]).run(function ($log) {
        $log.info("CreateNotificationJobMappingController initialized");
    });
}(mifosX.controllers || {})); 