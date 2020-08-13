(function(module) {
    mifosX.controllers = _.extend(module, {
        CreateSequenceDetailsController: function(scope, routeParams, resourceFactory, location, route) {

            scope.formData = {};
            scope.sequenceType = {};
            scope.formData.locale = scope.optlang.code;

            resourceFactory.customSequenceTemplateResource.get(this.formData, function(data) {
                    scope.sequencePatternData = data.sequencePatternData;
                    scope.sequenceSeparatorType = data.sequenceSeparatorType;
                    scope.sequenceType = data.sequenceType;
                    scope.sequenceType.splice(0, 1);
                });

            scope.submit = function() {
                resourceFactory.customSequenceResource.save(this.formData, function(data) {
                    location.path('/sequences/' + data.resourceId);
                });
            };

        }
    });
    mifosX.ng.application.controller('CreateSequenceDetailsController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.CreateSequenceDetailsController]).run(function($log) {
        $log.info("CreateSequenceDetailsController initialized");
    });
}(mifosX.controllers || {}));