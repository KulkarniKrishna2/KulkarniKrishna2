(function(module) {
    mifosX.controllers = _.extend(module, {
        UpdateNotificationConfigController: function(scope, routeParams, resourceFactory, location, route) {
            scope.notificationConfigId = routeParams.notificationConfigId;
            //scope.entityKeyData = {"key": [{"code": "loanId","value": "Loan Id"}]}
            scope.formData = {};

            function populateDetails() {
                resourceFactory.notificationConfigurationDetailsResource.get({notificationConfigId : scope.notificationConfigId}, function(data) {
                    scope.formData = data;
                });  
                
                resourceFactory.notificationConfigTemplateResource.retrieve({}, function(data) {
                    scope.notificationConfigTemplateData = data;
                });
                
            };
            populateDetails();

            scope.submit = function() {
                if(scope.formData.id){
                    delete scope.formData.id;
                }
                if(scope.formData.status){
                    delete scope.formData.status;
                }
                if(scope.formData.createdDate){
                    delete scope.formData.createdDate;
                }
                if(scope.formData.lastModifiedDate){
                    delete scope.formData.lastModifiedDate;
                }
                resourceFactory.notificationConfigurationDetailsResource.update({notificationConfigId : scope.notificationConfigId},scope.formData, function(data) {
                    location.path('/notification/configuration/'+scope.notificationConfigId);
                 });  
            };
        
        }
    });
    mifosX.ng.application.controller('UpdateNotificationConfigController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.UpdateNotificationConfigController]).run(function($log) {
        $log.info("UpdateNotificationConfigController initialized");
    });
}(mifosX.controllers || {}));