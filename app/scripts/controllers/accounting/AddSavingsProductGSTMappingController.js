(function (module) {
    mifosX.controllers = _.extend(module, {
        AddSavingsProductGSTMappingController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.savings = [{}];
            scope.savingsProductOptions = [];
            scope.taxGroupOptions = [];
            resourceFactory.taxconfigurationsResourcetemplate.get({ entityType: "saving_products" }, function (data) {
                scope.savingsProductOptions = data.savingsProducts;
                scope.taxGroupOptions = data.taxGroupDatas;
            });
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
    mifosX.ng.application.controller('AddSavingsProductGSTMappingController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.AddSavingsProductGSTMappingController]).run(function ($log) {
        $log.info("AddSavingsProductGSTMappingController initialized");
    });
}(mifosX.controllers || {}));