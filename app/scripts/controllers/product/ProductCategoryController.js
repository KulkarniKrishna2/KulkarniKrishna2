
(function (module) {
    mifosX.controllers = _.extend(module, {
        ProductCategoryController: function (scope, resourceFactory) {
            resourceFactory.productCategoriesResource.getProductCategories(function (data) {
                scope.productCategories = data;
            });
        }

    });

    mifosX.ng.application.controller('ProductCategoryController', ['$scope', 'ResourceFactory', mifosX.controllers.ProductCategoryController]).run(function ($log) {
        $log.info("ProductCategoryController initialized");
    });
}(mifosX.controllers || {}));


