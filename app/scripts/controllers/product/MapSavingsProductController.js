(function (module) {
    mifosX.controllers = _.extend(module, {
        MapSavingsProductController: function (scope, resourceFactory) {
            scope.formData = {};
            resourceFactory.savingProductResource.getAllSavingProducts(function (data) {
                scope.savingproducts = data;
            });
            scope.submit = function () {
                scope.formData.productType = "savingsproduct";
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

    mifosX.ng.application.controller('MapSavingsProductController', ['$scope', 'ResourceFactory', mifosX.controllers.MapSavingsProductController]).run(function ($log) {
        $log.info("MapSavingsProductController initialized");
    });

}(mifosX.controllers || {}));