(function(module) {
    mifosX.controllers = _.extend(module, {
        SequenceEntityAssociationListController: function(scope, routeParams, resourceFactory, location) {
            scope.sequenceAssociationDetails = [];

            function populateDetails() {
                resourceFactory.customSequenceAssociationResource.retrieveAll({}, function(data) {
                    scope.sequenceAssociationDetails = data;
                });
            }
            populateDetails();

            scope.routeTo = function(id) {
                location.path('/sequenceassociations/' + id);
            };
        }
    });
    mifosX.ng.application.controller('SequenceEntityAssociationListController', ['$scope', '$routeParams', 'ResourceFactory', '$location',  mifosX.controllers.SequenceEntityAssociationListController]).run(function($log) {
        $log.info("SequenceEntityAssociationListController initialized");
    });
}(mifosX.controllers || {}));