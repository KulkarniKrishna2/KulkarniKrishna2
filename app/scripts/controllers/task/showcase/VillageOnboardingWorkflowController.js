(function (module) {
    mifosX.controllers = _.extend(module, {
        VillageOnboardingWorkflowController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            scope.datatabledetails = "";
            scope.status = 'CREATE';
            scope.view_tab = "tab1";
            scope.resourceId = routeParams.villageId;
            scope.villageData = {};
            
            resourceFactory.villageResource.get({villageId: scope.resourceId}, function (data) {
                scope.villageData = data;
                scope.formData = data;
                resourceFactory.entityTaskExecutionResource.get({entityType: "village",entityId:scope.resourceId}, function (data) {
                    scope.taskData = data;
                });
            });
        }
    });
    mifosX.ng.application.controller('VillageOnboardingWorkflowController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.VillageOnboardingWorkflowController]).run(function ($log) {
        $log.info("VillageOnboardingWorkflowController initialized");
    });
}(mifosX.controllers || {}));
