(function (module) {
    mifosX.controllers = _.extend(module, {
        NewGlimLoanProductMappingsController: function (scope, resourceFactory, location) {
            scope.formData = {};
            scope.formData.locale = scope.optlang.code;
            scope.formData.dateFormat = scope.df;
            scope.loanProductOptions = [];
            scope.getTemplates = function () {
                resourceFactory.glimLoanProductMappingTemplateResource.get({}, function (data) {
                    scope.loanProductOptions = data.loanProductDataOptions;
                });
            };
            scope.getTemplates();
            scope.submit = function () {
                resourceFactory.glimLoanProductMappingResource.save({}, scope.formData, function (data) {
                    location.path('/glimloanproductmappings');
                });
            };
        }
    });
    mifosX.ng.application.controller('NewGlimLoanProductMappingsController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.NewGlimLoanProductMappingsController]).run(function ($log) {
        $log.info("NewGlimLoanProductMappingsController initialized");
    });
}(mifosX.controllers || {}));