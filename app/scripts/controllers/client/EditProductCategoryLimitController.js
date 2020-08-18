
(function (module) {
    mifosX.controllers = _.extend(module, {
        EditProductCategoryLimitController: function (scope, routeParams, resourceFactory) {

            scope.limit = { locale: "en" };
            scope.formData = {};
            scope.limit.productCategories = [];
            resourceFactory.productCategoriesResource.getProductCategories(function (data) {
                scope.productCategories = data;
            });

            scope.formData.categoryId = scope.limitValue.categoryId;
            scope.formData.categoryLimit = scope.limitValue.categoryLimit;
            scope.submit = function () {
                scope.formData.maxAllowedLimit = scope.formData.categoryLimit;
                scope.limit.productCategories.push(scope.formData);
                resourceFactory.clientCategoryLimitsResource.save({ clientId: scope.clientId }, scope.limit, function (data) {
                    scope.close();
                    scope.getClientLimits();
                });
            };
            scope.cancel = function () {
                scope.close();
            };
        }

    });

    mifosX.ng.application.controller('EditProductCategoryLimitController', ['$scope', '$routeParams', 'ResourceFactory', mifosX.controllers.EditProductCategoryLimitController]).run(function ($log) {
        $log.info("EditProductCategoryLimitController initialized");
    });
}(mifosX.controllers || {}));


