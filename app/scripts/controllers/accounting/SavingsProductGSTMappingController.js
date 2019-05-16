(function (module) {
    mifosX.controllers = _.extend(module, {
        SavingsProductGSTMappingController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.savingsProductData = [];
            resourceFactory.taxconfigurationsResource.query({ entityType: "saving_products" }, function (data) {
                scope.savingsProductData = data;
            });
            scope.addSavingProduct = function () {
                location.path('/gstmapping/addsavingsproducts');
            }
            scope.edit = function (entityId) {
                location.path('/editgstmapping/saving_products/' + entityId);
            }
        }
    });
    mifosX.ng.application.controller('SavingsProductGSTMappingController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.SavingsProductGSTMappingController]).run(function ($log) {
        $log.info("SavingsProductGSTMappingController initialized");
    });
}(mifosX.controllers || {}));