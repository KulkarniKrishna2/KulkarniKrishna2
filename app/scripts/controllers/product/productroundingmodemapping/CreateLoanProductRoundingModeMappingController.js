(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateLoanProductRoundingModeMappingController: function (scope, resourceFactory, location) {
            scope.formData = {};
            scope.formData.locale = scope.optlang.code;
            scope.roundingModeTypes = [];
            scope.productOptions = [];
            scope.getTemplates = function () {
                resourceFactory.loanProductRoundingModeMappingTemplateResource.get({}, function (data) {
                    scope.roundingModeTypes = data.roundingModeTypes;
                    scope.productOptions = data.productOptions;
                });
            };

            scope.getTemplates();
            
            scope.submit = function () {
                resourceFactory.loanProductRoundingModeMappingResource.save({}, scope.formData, function (data) {
                    location.path('/viewloanproductroundingemappings');
                });
            };
        }
    });
    mifosX.ng.application.controller('CreateLoanProductRoundingModeMappingController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.CreateLoanProductRoundingModeMappingController]).run(function ($log) {
        $log.info("CreateLoanProductRoundingModeMappingController initialized");
    });
}(mifosX.controllers || {}));