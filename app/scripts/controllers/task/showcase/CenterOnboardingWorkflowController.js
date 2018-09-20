(function (module) {
    mifosX.controllers = _.extend(module, {
        CenterOnboardingWorkflowController: function (scope, $rootScope, resourceFactory, routeParams, popUpUtilService) {
            scope.eventType = routeParams.eventType;
            scope.centerId = routeParams.centerId;
            scope.defaultLandingStepId = $rootScope.defaultLandingStepId;
            delete $rootScope.defaultLandingStepId;

            function init() {
                resourceFactory.centerResource.get({
                    centerId: scope.centerId,
                    associations: 'all'
                }, function (data) {
                    scope.centerData = data;
                    fetchTask();
                });
            }

            function fetchTask() {
                resourceFactory.entityEventTaskExecutionResource.get({
                    entityType: "center",
                    eventType: scope.eventType,
                    entityId: scope.centerId
                }, function (data) {
                    scope.taskData = data;
                });
            }

            init();

            //Center workflow Members steps info 
            scope.getCWFClientsTaskStepsInfo = function(centerId){
                scope.cwfCenterId = centerId;
                scope.popUpHeaderName = "label.heading.members.steps.info"
                scope.includeHTML = 'views/task/popup/membersstepsinfo.html';
                var templateUrl = 'views/common/openpopup.html';
                var controller = 'ViewCWFClientsTaskStepsInfoController';
                var windowClass = 'modalwidth700';
                popUpUtilService.openPopUp(templateUrl, controller, scope, windowClass);
            }
        }
    });
    mifosX.ng.application.controller('CenterOnboardingWorkflowController', ['$scope', '$rootScope', 'ResourceFactory', '$routeParams', 'PopUpUtilService', mifosX.controllers.CenterOnboardingWorkflowController]).run(function ($log) {
        $log.info("CenterOnboardingWorkflowController initialized");
    });
}(mifosX.controllers || {}));