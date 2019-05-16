(function (module) {
    mifosX.controllers = _.extend(module, {
        LoanProductGSTMappingController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.loanProductsData = [];
            resourceFactory.taxconfigurationsResource.query({ entityType: "loan_products" }, function (data) {
                scope.loanProductsData = data;
            });
            scope.addloanProduct = function () {
                location.path('/gstmapping/addloanproducts');
            }
            scope.edit = function (entityId) {
                location.path('/editgstmapping/loan_products/' + entityId);
            }
        }
    });
    mifosX.ng.application.controller('LoanProductGSTMappingController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.LoanProductGSTMappingController]).run(function ($log) {
        $log.info("LoanProductGSTMappingController initialized");
    });
}(mifosX.controllers || {}));