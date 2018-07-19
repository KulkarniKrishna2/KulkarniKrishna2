(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewCWFClientsTaskStepsInfoController: function (scope, resourceFactory) {
            resourceFactory.clientsTaskStepsTrackingResource.get({
                centerId: scope.cwfCenterId,
                eventType: scope.eventType
            }, function (data) {
                scope.membersStepsInfo = data;
            });
        }
    });
    mifosX.ng.application.controller('ViewCWFClientsTaskStepsInfoController', ['$scope', 'ResourceFactory', mifosX.controllers.ViewCWFClientsTaskStepsInfoController]).run(function ($log) {
        $log.info("ViewCWFClientsTaskStepsInfoController initialized");
    });
}(mifosX.controllers || {}));