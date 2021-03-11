(function (module) {
    mifosX.controllers = _.extend(module, {
        EditNotificationEventMappingController: function (scope, routeParams, resourceFactory, location, route) {
            scope.formData = {};
            scope.businessEntityOptions = [];
            scope.businessEventOptions = [];
            
            function populateDetails() {
                resourceFactory.notificationConfigurationDetailsResource.get({ notificationConfigId: routeParams.notificationConfigId }, function (data) {
                    scope.notificationConfigurationDetailsName = data.uname;
                });
                resourceFactory.notificationEventMappingTemplateResource.get({ notificationConfigId: routeParams.notificationConfigId }, function (data) {
                    scope.businessEntityOptions = data.businessEntityOptions;
                    scope.businessEventOptions = data.businessEventOptions;
                });
                resourceFactory.notificationEventMappingUpdateResource.get({eventId: routeParams.eventId,notificationConfigId: routeParams.notificationConfigId }, function (data) {
                    scope.formData.businessEvent = data.businessEvent.code;
                    scope.formData.businessEntity = data.businessEntity.code;
                })
                
            }

            populateDetails();
            scope.submit = function () {
                resourceFactory.notificationEventMappingUpdateResource.update({eventId: routeParams.eventId,notificationConfigId: routeParams.notificationConfigId }, scope.formData, function (data) {
                    location.path('notification/configuration/' + routeParams.notificationConfigId);
                })

            }
        }
    });
    mifosX.ng.application.controller('EditNotificationEventMappingController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.EditNotificationEventMappingController]).run(function ($log) {
        $log.info("EditNotificationEventMappingController initialized");
    });
}(mifosX.controllers || {}));