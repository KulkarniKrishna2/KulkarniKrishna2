(function (module) {
    mifosX.controllers = _.extend(module, {
        DistrictOnboardingWorkflowController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            scope.datatabledetails = "";
            scope.status = 'CREATE';
            scope.view_tab = "tab1";
            scope.resourceId = routeParams.districtId;
            scope.districtData = {};
            
            resourceFactory.districtsResource.get({districtId: scope.resourceId}, function (data) {
                scope.districtData = data;
                scope.formData = data;
                resourceFactory.entityTaskExecutionResource.get({entityType: "district",entityId:scope.resourceId}, function (data) {
                    scope.taskData = data;
                });
            });
        }
    });
    mifosX.ng.application.controller('DistrictOnboardingWorkflowController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.DistrictOnboardingWorkflowController]).run(function ($log) {
        $log.info("DistrictOnboardingWorkflowController initialized");
    });
}(mifosX.controllers || {}));
