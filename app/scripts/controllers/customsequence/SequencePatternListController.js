(function(module) {
    mifosX.controllers = _.extend(module, {
        SequencePatternListController: function(scope, routeParams, resourceFactory, location, route) {
            scope.sequenceDetails = [];

            function populateDetails() {
                resourceFactory.sequencePatternResource.retrieveAll({}, function(data) {
                    scope.sequencePatternDetails = data;
                });
            }
            populateDetails();

            scope.routeTo = function(id) {
                location.path('/sequencepattern/' + id);
            };
        }
    });
    mifosX.ng.application.controller('SequencePatternListController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.SequencePatternListController]).run(function($log) {
        $log.info("SequencePatternListController initialized");
    });
}(mifosX.controllers || {}));