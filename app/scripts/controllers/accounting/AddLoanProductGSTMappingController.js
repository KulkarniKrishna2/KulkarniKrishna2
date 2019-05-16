(function (module) {
    mifosX.controllers = _.extend(module, {
        AddLoanProductGSTMappingController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.loanProducts = [{}];
            scope.loanProductsOptions = [];
            scope.taxGroupOptions = [];
            resourceFactory.taxconfigurationsResourcetemplate.get({ entityType: "loan_products" }, function (data) {
                scope.loanProductsOptions = data.loanProducts;
                scope.taxGroupOptions = data.taxGroupDatas;
            });
            scope.back = function () {
                location.path('/gstmapping/loanproducts');
            }
            scope.add = function () {
                scope.loanProducts.push({});
            }
            scope.removeloanProduct = function (index) {
                scope.loanProducts.splice(index, 1);
            }
            scope.submit = function () {
                var loanProductFormData = new Object();
                loanProductFormData.locale = scope.optlang.code;
                loanProductFormData.entityType = "loan_products";
                loanProductFormData.entityObjects = [];
                for (var i = 0; i < scope.loanProducts.length; i++) {
                    var temp = new Object();
                    if (scope.loanProducts[i].productId) {
                        temp.entityId = scope.loanProducts[i].productId;
                    }
                    if (scope.loanProducts[i].percentage) {
                        temp.percentage = scope.loanProducts[i].percentage;
                    }
                    if (scope.loanProducts[i].taxGroupId) {
                        temp.taxGroupId = scope.loanProducts[i].taxGroupId;
                    }
                    loanProductFormData.entityObjects.push(temp);
                }
                resourceFactory.taxconfigurationsResource.save({ entityType: "loan_products" }, loanProductFormData, function (data) {
                    location.path('/gstmapping/loanproducts');
                });
            }
        }
    });
    mifosX.ng.application.controller('AddLoanProductGSTMappingController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.AddLoanProductGSTMappingController]).run(function ($log) {
        $log.info("AddLoanProductGSTMappingController initialized");
    });
}(mifosX.controllers || {}));