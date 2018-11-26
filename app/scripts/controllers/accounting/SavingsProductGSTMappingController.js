(function (module) {
    mifosX.controllers = _.extend(module, {
        SavingsProductGSTMappingController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.savings = [{}];
            scope.savingsProductOptions = [];
            scope.taxGroupOptions = [];
            scope.savingsProductData = [];
            resourceFactory.taxconfigurationsResourcetemplate.get({ entityType: "saving_products" }, function (data) {
                scope.savingsProductOptions = data.savingsProducts;
                scope.taxGroupOptions = data.taxGroupDatas;
            });
            resourceFactory.taxconfigurationsResource.query({ entityType: "saving_products" }, function (data) {
                scope.savingsProductData = data;
            });
            scope.addSavingProduct = function () {
                scope.savings.push({});
                location.path('/gstmapping/addsavingsproducts');
            }
            scope.back = function () {
                location.path('/gstmapping/savingsproducts');
            }
            scope.add = function () {
                scope.savings.push({});
            }
            scope.removeSavingsProduct = function (index) {
                scope.savings.splice(index, 1);
            }
            scope.submit = function () {
                var savingsFormData = new Object();
                savingsFormData.locale = scope.optlang.code;
                savingsFormData.entityType = "saving_products";
                savingsFormData.entityObjects = [];
                for (var i = 0; i < scope.savings.length; i++) {
                    var temp = new Object();
                    if (scope.savings[i].savingsId) {
                        temp.entityId = scope.savings[i].savingsId;
                    }
                    if (scope.savings[i].percentage) {
                        temp.percentage = scope.savings[i].percentage;
                    }
                    if (scope.savings[i].taxGroupId) {
                        temp.taxGroupId = scope.savings[i].taxGroupId;
                    }
                    savingsFormData.entityObjects.push(temp);
                }
                resourceFactory.taxconfigurationsResource.save({ entityType: "saving_products" }, savingsFormData, function (data) {
                    location.path('/gstmapping/savingsproducts');
                });
            }
        }
    });
    mifosX.ng.application.controller('SavingsProductGSTMappingController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.SavingsProductGSTMappingController]).run(function ($log) {
        $log.info("SavingsProductGSTMappingController initialized");
    });
}(mifosX.controllers || {}));