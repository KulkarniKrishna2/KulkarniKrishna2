(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewGstInvoiceController: function (scope, routeParams, paginatorService, dateFilter, resourceFactory, location, $modal) {
            scope.formData = {
                locale: scope.optlang.code
            };
            resourceFactory.viewTaxInvoiceTemplate.query(function (data) {
                scope.months = data;
            });
            scope.search = function () {
                var queryParams = { month: scope.formData.month, year: scope.formData.year };
                resourceFactory.viewTaxInvoiceData.query(queryParams, function (data) {
                    scope.taxInvoiceData = data;
                });
            };
        }
    });
    mifosX.ng.application.controller('ViewGstInvoiceController', ['$scope', '$routeParams', 'PaginatorService', 'dateFilter', 'ResourceFactory', '$location', '$modal', mifosX.controllers.ViewGstInvoiceController]).run(function ($log) {
        $log.info("ViewGstInvoiceController initialized");
    });
}(mifosX.controllers || {}));

