(function(module) {
    mifosX.controllers = _.extend(module, {
        ViewNotificationConfigurationDetailsController: function(scope, routeParams, resourceFactory, location, route,CommonUtilService) {

            scope.notificationConfigId = routeParams.id;
            scope.notificationConfigurationDetails = {};

            function populateDetails() {
                scope.labelStatus = "activate";
                resourceFactory.notificationConfigurationDetailsResource.get({notificationConfigId : scope.notificationConfigId}, function(data) {
                    scope.notificationConfigurationDetails = data;
                    if (scope.notificationConfigurationDetails.status === 'ACTIVE') {
                        scope.labelStatus = "deactivate";
                    }
                });
                
                resourceFactory.notificationCampaignResource.retrieveAll({notificationConfigId : scope.notificationConfigId}, function(data) {
                    scope.notificationCampaignData = data;
                });
                
                resourceFactory.notificationEventMappingResource.retrieveAll({notificationConfigId: scope.notificationConfigId }, function (data) {
                    scope.notificationEventMappingData = data;
                });

                resourceFactory.notificationJobMappingResource.retrieveAll({notificationConfigId: scope.notificationConfigId }, function (data) {
                    scope.notificationJobMappingData = data;
                }); 
            };
            populateDetails();

            scope.changeStatus = function() {
                if (scope.labelStatus === 'deactivate') {
                    resourceFactory.notificationConfigurationDeactivateResource.deactivate({notificationConfigId : scope.notificationConfigId}, function(data) {
                        populateDetails();                     
                    });
                }else{
                    resourceFactory.notificationConfigurationActivateResource.activate({notificationConfigId : scope.notificationConfigId}, function(data) {
                        populateDetails();                     
                    });
                }
            };

            scope.routeTo = function(id) {
                location.path('/notification/configuration/' + scope.notificationConfigId +'/campaign/' + id);
            };

            scope.formatDate = function (date) {
                var dateOut = new Date(date);
                return dateOut;
            };

            scope.changeStatusOfEventMapping = function (id, isActive) {
                if (!isActive) {
                    resourceFactory.notificationEventMappingActivateResource.activate({ eventId: id, notificationConfigId : scope.notificationConfigId}, function (data) {
                        scope.refresh();
                    })
                }
                else {
                    resourceFactory.notificationEventMappingDeActivateResource.deactivate({ eventId: id,notificationConfigId : scope.notificationConfigId }, function (data) {
                        scope.refresh();
                    })
                }
            }

            scope.changeStatusOfJobMapping = function (id, isActive) {
                if (!isActive) {
                    resourceFactory.notificationJobMappingActivateResource.activate({ jobId: id,notificationConfigId : scope.notificationConfigId }, function (data) {
                        scope.refresh();
                    })
                }
                else {
                    resourceFactory.notificationJobMappingDeActivateResource.deactivate({ jobId: id,notificationConfigId : scope.notificationConfigId }, function (data) {
                        scope.refresh();
                    })
                }
            }

            scope.refresh = function () {
                route.reload();
            };

            scope.getProperDateTimeFormat = function (zoneddatetime) {
                if(!zoneddatetime){
                    return;
                }
                return CommonUtilService.getProperDateTimeFormat(zoneddatetime);
            }
        }
    });
    mifosX.ng.application.controller('ViewNotificationConfigurationDetailsController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route','CommonUtilService', mifosX.controllers.ViewNotificationConfigurationDetailsController]).run(function($log) {
        $log.info("ViewNotificationConfigurationDetailsController initialized");
    });
}(mifosX.controllers || {}));