(function(module) {
    mifosX.controllers = _.extend(module, {
        SequenceDetailsListController: function(scope, routeParams, resourceFactory, location, route) {
            scope.sequenceDetails = [];

            function populateDetails() {
                resourceFactory.customSequenceResource.retrieveAll({}, function(data) {
                    scope.sequenceDetails = data;
                });
            }
            populateDetails();

            scope.routeTo = function(id) {
                location.path('/sequences/' + id);
            };
        }
    });
    mifosX.ng.application.controller('SequenceDetailsListController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.SequenceDetailsListController]).run(function($log) {
        $log.info("SequenceDetailsListController initialized");
    });
}(mifosX.controllers || {}));