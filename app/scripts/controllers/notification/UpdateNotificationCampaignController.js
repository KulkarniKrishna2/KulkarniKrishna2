(function(module) {
    mifosX.controllers = _.extend(module, {
        UpdateNotificationCampaignController: function(scope, routeParams, resourceFactory, location, route) {
        scope.notificationConfigId = routeParams.notificationConfigId;
        scope.campaignId = routeParams.id;
        scope.formData = {};

        function populateDetails() {
            
            resourceFactory.notificationCampaignDetailsResource.get({notificationConfigId : scope.notificationConfigId,campaignId : scope.campaignId}, function(data) {
                scope.formData = data;
            });

            resourceFactory.notificationCampaignTemplateResource.retrieveAll({notificationConfigId : scope.notificationConfigId}, function(data) {
                scope.notificationCampaignTemplateData = data;
            });
        };

        populateDetails();

        scope.submit = function() {
            if(scope.formData.id){
                delete scope.formData.id;
            }
            if(scope.formData.filterData === null){
                delete scope.formData.filterData;
            }
            if(scope.formData.uname === null){
                delete scope.formData.uname;
            }
            if(scope.formData.status){
                delete scope.formData.status;
            }
            if(scope.formData.additionalDetails || scope.formData.additionalDetails === null){
                delete scope.formData.additionalDetails;
            }
            resourceFactory.notificationCampaignDetailsResource.update({notificationConfigId : scope.notificationConfigId,campaignId : scope.campaignId},scope.formData, function(data) {
                location.path('/notification/configuration/' + scope.notificationConfigId + '/campaign/' + scope.campaignId);
             });  
        };
        
        }
    });
    mifosX.ng.application.controller('UpdateNotificationCampaignController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.UpdateNotificationCampaignController]).run(function($log) {
        $log.info("UpdateNotificationCampaignController initialized");
    });
}(mifosX.controllers || {}));