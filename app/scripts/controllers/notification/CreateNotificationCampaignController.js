(function(module) {
    mifosX.controllers = _.extend(module, {
        CreateNotificationCampaignController: function(scope, routeParams, resourceFactory, location, route) {
            scope.notificationConfigId = routeParams.notificationConfigId;
            
            function populateDetails() {
                 
                resourceFactory.notificationCampaignTemplateResource.retrieveAll({notificationConfigId : scope.notificationConfigId}, function(data) {
                    scope.notificationCampaignTemplateData = data;
                });
                
            };
            populateDetails();

            scope.submit = function() {
                resourceFactory.notificationCampaignResource.save({notificationConfigId : scope.notificationConfigId},this.formData, function(data) {
                    location.path('/notification/configuration/'+scope.notificationConfigId);
                });
            };

        }
    });
    mifosX.ng.application.controller('CreateNotificationCampaignController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.CreateNotificationCampaignController]).run(function($log) {
        $log.info("CreateNotificationCampaignController initialized");
    });
}(mifosX.controllers || {}));