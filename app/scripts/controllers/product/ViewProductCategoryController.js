(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewProductCategoryController: function (scope, routeParams, resourceFactory, location, route, popUpUtilService) {
            scope.categoryId = routeParams.id;
            scope.isLoanProductsEmpty = true;
            scope.isSavingsProductsEmpty = true;
            scope.routeTo = function (id) {
                location.path('/viewproductcategory/' + id);
            };
            resourceFactory.productCategoriesResource.getProductCategories(function (data) {
                scope.productCategories = data;
            });

            resourceFactory.categoryResource.getProductCategory({ categoryId: scope.categoryId }, function (data) {
                scope.category = data;
            });

            scope.mappedproducts = function () {
                resourceFactory.mapCategorytoProductResource.getAllMappedProducts({ categoryId: scope.categoryId }, function (data) {
                    scope.products = data;
                    if (scope.products.loanProducts.length > 0) {
                        scope.isLoanProductsEmpty = false;
                    }
                    if (scope.products.savingsProducts.length > 0) {
                        scope.isSavingsProductsEmpty = false;
                    }
                });
            }

            scope.mappedproducts();

            scope.mapLoanProduct = function (categoryId) {
                var templateUrl = 'views/products/maploanproduct.html';
                var controller = 'MapLoanProductController';
                scope.categoryId = categoryId;
                popUpUtilService.openDefaultScreenPopUp(templateUrl, controller, scope);
            }

            scope.mapSavingsProduct = function (categoryId) {
                var templateUrl = 'views/products/mapsavingsproduct.html';
                var controller = 'MapSavingsProductController';
                scope.categoryId = categoryId;
                popUpUtilService.openDefaultScreenPopUp(templateUrl, controller, scope);
            }

        }

    });

    mifosX.ng.application.controller('ViewProductCategoryController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', 'PopUpUtilService', mifosX.controllers.ViewProductCategoryController]).run(function ($log) {
        $log.info("ViewProductCategoryController initialized");
    });
}(mifosX.controllers || {}));


