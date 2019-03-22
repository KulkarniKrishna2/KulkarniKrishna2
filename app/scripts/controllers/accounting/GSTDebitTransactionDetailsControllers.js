
(function (module) {
    mifosX.controllers = _.extend(module, {
        GSTDebitTransactionDetailsControllers: function (scope, routeParams, resourceFactory, location, dateFilter) {
            scope.headerData = {};
            scope.getHeaderData = function () {
                resourceFactory.gstHeadersResource.get({ id: routeParams.id }, function (data) {
                    scope.headerData = data;
                });
            };

            scope.getHeaderData();
        }
    });
    mifosX.ng.application.controller('GSTDebitTransactionDetailsControllers', ['$scope', '$routeParams', 'ResourceFactory', '$location', 'dateFilter', mifosX.controllers.GSTDebitTransactionDetailsControllers]).run(function ($log) {
        $log.info("GSTDebitTransactionDetailsControllers initialized");
    });
}(mifosX.controllers || {}));
