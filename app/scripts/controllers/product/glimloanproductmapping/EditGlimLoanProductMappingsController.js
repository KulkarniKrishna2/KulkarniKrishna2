(function (module) {
    mifosX.controllers = _.extend(module, {
        EditGlimLoanProductMappingsController: function (scope, resourceFactory, location, routeParams) {
            scope.formData = {};
            scope.formData.locale = scope.optlang.code;
            scope.formData.dateFormat = scope.df;
            scope.loanProductOptions = [];
            scope.getAllGlimLoanProductMappings = function () {
                resourceFactory.glimLoanProductMappingResource.get({ glimloanproductmappingId: routeParams.id, isTemplate: true }, function (data) {
                    scope.formData.minAmount = data.minAmount;
                    scope.formData.maxAmount = data.maxAmount;
                    scope.formData.loanProductId = data.loanProductData.id;
                    scope.loanProductOptions = data.loanProductDataOptions;

                });
            };
            scope.getAllGlimLoanProductMappings();
            scope.submit = function () {
                resourceFactory.glimLoanProductMappingResource.update({ glimloanproductmappingId: routeParams.id }, scope.formData, function (data) {
                    location.path('/glimloanproductmappings');
                });
            };
        }
    });
    mifosX.ng.application.controller('EditGlimLoanProductMappingsController', ['$scope', 'ResourceFactory', '$location', '$routeParams', mifosX.controllers.EditGlimLoanProductMappingsController]).run(function ($log) {
        $log.info("EditGlimLoanProductMappingsController initialized");
    });
}(mifosX.controllers || {}));