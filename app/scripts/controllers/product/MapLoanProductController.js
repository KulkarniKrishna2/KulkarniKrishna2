(function (module) {
    mifosX.controllers = _.extend(module, {
        MapLoanProductController: function (scope, resourceFactory) {
            scope.formData = {};
            resourceFactory.loanProductResource.getAllLoanProducts(function (data) {
                scope.loanproducts = data;
            });
            scope.submit = function () {
                scope.formData.productType = "loanproduct";
                resourceFactory.mapCategorytoProductResource.save({ categoryId: scope.categoryId }, this.formData, function (data) {
                    scope.close();
                    scope.mappedproducts();
                });
            };
            scope.cancel = function () {
                scope.close();
            };
        }
    });

    mifosX.ng.application.controller('MapLoanProductController', ['$scope', 'ResourceFactory', mifosX.controllers.MapLoanProductController]).run(function ($log) {
        $log.info("MapLoanProductController initialized");
    });

}(mifosX.controllers || {}));