(function(module) {
    mifosX.controllers = _.extend(module, {
        ViewSequenceDetailsController: function(scope, routeParams, resourceFactory, location) {

            scope.formData = {};
            scope.sequenceDetails = {};
            scope.sequenceId = routeParams.id;

            function populateDetails() {
                scope.labelStatus = "activate";
                resourceFactory.customSequenceResource.get({
                    sequenceId: scope.sequenceId
                }, function(data) {
                    scope.sequenceDetails = data;
                    if (scope.sequenceDetails.status.toUpperCase() === 'ACTIVE') {
                        scope.labelStatus = "inactivate";
                    }
                });
            };

            populateDetails();

            scope.changeStatus = function() {
                if (scope.labelStatus === 'inactivate') {
                    scope.formData.status = scope.sequenceDetails.availableStatus[scope.sequenceDetails.availableStatus.findIndex(x => x.value.toLowerCase() == 'inactive')].id;
                } else {
                    scope.formData.status = scope.sequenceDetails.availableStatus[scope.sequenceDetails.availableStatus.findIndex(x => x.value.toLowerCase() == 'active')].id;
                }
                scope.formData.locale = scope.optlang.code;
                resourceFactory.customSequenceResource.update({
                        sequenceId: scope.sequenceId
                    }, scope.formData,
                    function(data) {
                        populateDetails();
                    }
                );
            };
        }
    });
    mifosX.ng.application.controller('ViewSequenceDetailsController', ['$scope', '$routeParams', 'ResourceFactory', '$location', mifosX.controllers.ViewSequenceDetailsController]).run(function($log) {
        $log.info("ViewSequenceDetailsController initialized");
    });
}(mifosX.controllers || {}));