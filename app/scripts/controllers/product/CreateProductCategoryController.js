
(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateProductCategoryController: function (scope, resourceFactory, location) {
            scope.formData = {};
            scope.submit = function () {
                resourceFactory.productCategoriesResource.save(this.formData, function (data) {
                    location.path('/productcategories');
                });
            };
        }
    });

    mifosX.ng.application.controller('CreateProductCategoryController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.CreateProductCategoryController]).run(function ($log) {
        $log.info("CreateProductCategoryController initialized");
    });

}(mifosX.controllers || {}));