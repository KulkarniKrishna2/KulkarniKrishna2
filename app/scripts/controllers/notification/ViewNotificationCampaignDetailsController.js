(function(module) {
    mifosX.controllers = _.extend(module, {
        ViewNotificationCampaignDetailsController: function(scope, routeParams, resourceFactory, location, route) {
            scope.notificationConfigId = routeParams.notificationConfigId;
            scope.campaignId = routeParams.id;
            scope.notificationCampaignDetails = {};

            function populateDetails() {
                scope.labelStatus = "activate";
                resourceFactory.notificationCampaignDetailsResource.get({notificationConfigId : scope.notificationConfigId,campaignId : scope.campaignId}, function(data) {
                    scope.notificationCampaignDetails = data;
                    if (scope.notificationCampaignDetails.status === 'ACTIVE') {
                        scope.labelStatus = "deactivate";
                    }
                });
            }
            populateDetails();

            scope.changeStatus = function() {
                if (scope.labelStatus === 'deactivate') {
                    resourceFactory.notificationCampaignDeactivateResource.deactivate({notificationConfigId : scope.notificationConfigId,campaignId : scope.campaignId}, function(data) {
                        populateDetails();                     
                    });
                }else{
                    resourceFactory.notificationCampaignActivateResource.activate({notificationConfigId : scope.notificationConfigId,campaignId : scope.campaignId}, function(data) {
                        populateDetails();                     
                    });
                }
            };

        }
    });
    mifosX.ng.application.controller('ViewNotificationCampaignDetailsController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.ViewNotificationCampaignDetailsController]).run(function($log) {
        $log.info("ViewNotificationCampaignDetailsController initialized");
    });
}(mifosX.controllers || {})); 