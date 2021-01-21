
(function (module) {
    mifosX.controllers = _.extend(module, {
        AddProductCategoryLimitController: function (scope, resourceFactory) {
            scope.formData = {};
            scope.limit = { locale: "en" };
            resourceFactory.productCategoriesResource.getProductCategories(function (data) {
                scope.productCategories = data;
            });

            scope.submit = function () {
                scope.limit.productCategories = [];
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

    mifosX.ng.application.controller('AddProductCategoryLimitController', ['$scope', 'ResourceFactory', mifosX.controllers.AddProductCategoryLimitController]).run(function ($log) {
        $log.info("AddProductCategoryLimitController initialized");
    });
}(mifosX.controllers || {}));


