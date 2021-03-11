(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateNotificationEventMappingController: function (scope, routeParams, resourceFactory, location, route) {
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
                resourceFactory.notificationEventMappingTemplateResource.get({ notificationConfigId: routeParams.notificationConfigId }, function (data) {
                    scope.businessEntityOptions = data.businessEntityOptions;
                    scope.businessEventOptions = data.businessEventOptions;
                });
            }

            populateDetails();
            scope.submit = function () {
                resourceFactory.notificationEventMappingResource.save({notificationConfigId : routeParams.notificationConfigId},scope.formData, function (data) {
                    location.path('notification/configuration/' + routeParams.notificationConfigId);
                })
            }
        }
    });
    mifosX.ng.application.controller('CreateNotificationEventMappingController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.CreateNotificationEventMappingController]).run(function ($log) {
        $log.info("CreateNotificationEventMappingController initialized");
    });
}(mifosX.controllers || {})); 