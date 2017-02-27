(function (module) {
    mifosX.controllers = _.extend(module, {
        GroupOnboardingWorkflowController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            scope.groupId = routeParams.groupId;

            function init(){
                resourceFactory.groupResource.get({groupId: scope.groupId}, function (data) {
                    scope.groupData = data;
                    scope.groupName = data.centerName;
                    scope.groupOfficeId = data.officeId;
                    scope.groupOfficeName = data.officeName;
                    scope.isClosedGroup = scope.groupData.status.value == 'Closed';
                    fetchTask();
                });
            }

            function fetchTask(){
                resourceFactory.entityTaskExecutionResource.get({entityType: "groupOnboarding",entityId:scope.groupId}, function (data) {
                    scope.taskData = data;
                    //scope.$broadcast('initTask', {"taskData": data});
                });
            }

            init();
        }
    });
    mifosX.ng.application.controller('GroupOnboardingWorkflowController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.GroupOnboardingWorkflowController]).run(function ($log) {
        $log.info("GroupOnboardingWorkflowController initialized");
    });
}(mifosX.controllers || {}));
