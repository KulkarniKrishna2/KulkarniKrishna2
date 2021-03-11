(function (module) {
    mifosX.controllers = _.extend(module, {
        EditNotificationJobMappingController: function (scope, routeParams, resourceFactory, location, route) {
            scope.formData = {};
            scope.businessEntityOptions = [];
            scope.businessEventOptions = [];
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
                resourceFactory.notificationJobMappingUpdateResource.get({ jobId: routeParams.jobId,notificationConfigId: routeParams.notificationConfigId }, function (data) {
                    scope.formData.cronExpression = data.cronExpression;
                    scope.formData.jobName = data.jobName;
                    scope.formData.reportName = data.reportName;
                })
            }

            populateDetails();
            scope.submit = function () {
                resourceFactory.notificationJobMappingUpdateResource.update({ jobId: routeParams.jobId,notificationConfigId: routeParams.notificationConfigId }, scope.formData, function (data) {
                    location.path('notification/configuration/' + routeParams.notificationConfigId);
                })

            }
        }
    });
    mifosX.ng.application.controller('EditNotificationJobMappingController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.EditNotificationJobMappingController]).run(function ($log) {
        $log.info("EditNotificationJobMappingController initialized");
    });
}(mifosX.controllers || {})); 