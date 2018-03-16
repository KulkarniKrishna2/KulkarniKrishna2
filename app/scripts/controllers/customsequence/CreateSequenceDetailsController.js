(function(module) {
    mifosX.controllers = _.extend(module, {
        CreateSequenceDetailsController: function(scope, routeParams, resourceFactory, location, route) {

            scope.formData = {};
            scope.formData.locale = scope.optlang.code;

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