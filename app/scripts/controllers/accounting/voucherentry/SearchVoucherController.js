(function(module) {
    mifosX.controllers = _.extend(module, {
        SearchVoucherController: function(scope, resourceFactory, location, dateFilter, routeParams, localStorageService) {
            scope.first = {};
            scope.first.fromDate = new Date();
            scope.first.toDate = new Date();
            scope.vouchers = [];

            resourceFactory.voucherTemplateResource.get(function(data) {
                scope.voucherTypeOptions = data.templateData.voucherTypeOptions;
            });

            resourceFactory.officeResource.getAllOffices(function(data) {
                scope.offices = data;
            });

            scope.routeTo = function (voucher) {
                location.path('/accounting/view/voucherentry/' + voucher.voucherType.code + '/' + voucher.voucherId);
            };

            scope.submit = function () {
                var searchFromDate = dateFilter(scope.first.fromDate, scope.df);
                var searchTillDate = dateFilter(scope.first.toDate, scope.df);
                resourceFactory.voucherResource.getAll({
                    voucherType: scope.voucherTypeId,
                    fromDate: searchFromDate,
                    toDate: searchTillDate,
                    officeId: scope.officeId,
                    voucherNumber: scope.voucherNumber
                }, function(data) {
                    scope.vouchers = data.pageItems;
                });
            };

        }
    });
    mifosX.ng.application.controller('SearchVoucherController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$routeParams', 'localStorageService', mifosX.controllers.SearchVoucherController]).run(function($log) {
        $log.info("SearchVoucherController initialized");
    });
}(mifosX.controllers || {}));