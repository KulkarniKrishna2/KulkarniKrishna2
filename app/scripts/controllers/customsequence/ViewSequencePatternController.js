(function(module) {
    mifosX.controllers = _.extend(module, {
        ViewSequencePatternController: function(scope, routeParams, resourceFactory, location) {

            scope.sequencePatternId = routeParams.id;

            function populateDetails() {
                resourceFactory.sequencePatternResource.get({
                    sequencePatternId: scope.sequencePatternId
                }, function(data) {
                    scope.sequencePatternDetails = data;
                    scope.sequencePatternName = data[0].sequencePatternName;
                });
            };

            populateDetails();

        }
    });
    mifosX.ng.application.controller('ViewSequencePatternController', ['$scope', '$routeParams', 'ResourceFactory', '$location', mifosX.controllers.ViewSequencePatternController]).run(function($log) {
        $log.info("ViewSequencePatternController initialized");
    });
}(mifosX.controllers || {}));