(function (module) {
    mifosX.controllers = _.extend(module, {
        ProductCategoryController: function (scope, resourceFactory, location) {
            scope.routeTo = function (id) {
                location.path('/viewproductcategory/' + id);
            };
            resourceFactory.productCategoriesResource.getProductCategories(function (data) {
                scope.productCategories = data;
            });
        }

    });

    mifosX.ng.application.controller('ProductCategoryController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.ProductCategoryController]).run(function ($log) {
        $log.info("ProductCategoryController initialized");
    });
}(mifosX.controllers || {}));


