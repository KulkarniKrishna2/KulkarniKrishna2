
(function (module) {
    mifosX.controllers = _.extend(module, {
        GSTDebitTransactionControllers: function (scope, routeParams, paginatorService, dateFilter, resourceFactory, location) {

            scope.headersData = [];
            scope.getHeadersData = function () {
                resourceFactory.gstHeadersResource.getAll({}, function (data) {
                    scope.headersData = data;
                });
            };

            scope.getHeadersData();

            scope.routeTo = function (id) {
                location.path('gstdebittransaction/' + id);
            }


        }
    });
    mifosX.ng.application.controller('GSTDebitTransactionControllers', ['$scope', '$routeParams', 'PaginatorService', 'dateFilter', 'ResourceFactory', '$location', mifosX.controllers.GSTDebitTransactionControllers]).run(function ($log) {
        $log.info("GSTDebitTransactionControllers initialized");
    });
}(mifosX.controllers || {}));