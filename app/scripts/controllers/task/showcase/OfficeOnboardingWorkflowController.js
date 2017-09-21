(function (module) {
    mifosX.controllers = _.extend(module, {
        OfficeOnboardingWorkflowController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            scope.datatabledetails = "";
            scope.status = 'CREATE';
            scope.view_tab = "tab1";
            scope.resourceId = routeParams.officeId;
            scope.villageData = {};
            
            resourceFactory.officeResource.get({officeId: routeParams.id}, function (data) {
                scope.office = data;
                $rootScope.officeName = data.name;
            });
            resourceFactory.officeResource.get({officeId: scope.resourceId}, function (data) {
                scope.office = data;
                resourceFactory.entityTaskExecutionResource.get({entityType: "office", entityId:scope.resourceId}, function (taskData) {
                    scope.taskData = taskData;
                });
            });
        }
    });
    mifosX.ng.application.controller('OfficeOnboardingWorkflowController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.OfficeOnboardingWorkflowController]).run(function ($log) {
        $log.info("OfficeOnboardingWorkflowController initialized");
    });
}(mifosX.controllers || {}));
