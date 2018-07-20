(function(module) {
    mifosX.controllers = _.extend(module, {
        ViewSequenceEntityAssociationController: function(scope, routeParams, resourceFactory, location, route) {
            scope.sequenceAssociationsDetails = {};
            scope.sequenceEntityAssociationId = routeParams.id;
            scope.populateDetails = function() {
                scope.labelStatus = "activate";
                resourceFactory.customSequenceAssociationResource.get({
                    sequenceEntityAssociationId: scope.sequenceEntityAssociationId
                }, function(data) {
                    scope.sequenceAssociationsDetails = data;
                    if (data.status.value === 'Active') {
                        scope.labelStatus = "inactivate";
                    }else{
                        scope.labelStatus = "activate";
                    }
                });
            };

            scope.populateDetails();
            scope.changeStatus = function() {                
                scope.formData = {};
                scope.formData.locale = scope.optlang.code;
                if (scope.labelStatus === 'inactivate') {
                    scope.formData.status = 200;
                } else {
                    scope.formData.status = 100;
                }
                resourceFactory.customSequenceAssociationResource.updateStatus({
                        sequenceEntityAssociationId: scope.sequenceEntityAssociationId
                    }, scope.formData,
                    function(data) {
                        scope.populateDetails();
                    }
                );
            };

            scope.edit = function() {
                location.path('/editSequenceEntityAssociation/' + scope.sequenceEntityAssociationId)
            };


            scope.cancel = function() {
                location.path('/sequenceassociations/' + scope.sequenceEntityAssociationId)
            };

        }
    });
    mifosX.ng.application.controller('ViewSequenceEntityAssociationController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.ViewSequenceEntityAssociationController]).run(function($log) {
        $log.info("ViewSequenceEntityAssociationController initialized");
    });
}(mifosX.controllers || {}));