(function (module) {
    mifosX.controllers = _.extend(module, {
        CashierTransactionSummaryController: function (scope, routeParams, route, location, resourceFactory) {

            scope.formData = [];
            scope.cashierTransactions = [];

            scope.routeTo = function (id) {
                location.path('/viewcashiertxns/' + id);
            };

            scope.routeToAllocate = function () {
                location.path('tellers/' + routeParams.tellerId + '/cashiers/' + routeParams.cashierId + '/actions/allocate');
            };

            scope.routeToSettle = function () {
                location.path('tellers/' + routeParams.tellerId + '/cashiers/' + routeParams.cashierId + '/actions/settle');
            };

            scope.routeToTxn = function () {
                route.reload();
                location.path('/tellers/' + routeParams.tellerId + "/cashiers/" + routeParams.cashierId + "/txns/" + scope.formData.currencyCode);

            };

            scope.routeToSummary = function () {
                route.reload();
                location.path('/tellers/' + routeParams.tellerId + "/cashiers/" + routeParams.cashierId + "/summary/" + scope.formData.currencyCode);

            };

            resourceFactory.currencyConfigResource.get({ fields: 'selectedCurrencyOptions' }, function (data) {
                scope.currencyOptions = data.selectedCurrencyOptions;
                scope.formData.currencyCode = routeParams.currencyCode;
            });

            scope.initPage = function () {
                resourceFactory.cashierTxnsSummaryResource.getCashierTransactionsSummary({
                    tellerId: routeParams.tellerId,
                    cashierId: routeParams.cashierId,
                    currencyCode: routeParams.currencyCode,
                }, function (data) {
                    scope.cashierTxnsSummary = data;
                    if (data.cashierTransactions) {
                        scope.totaltxn = data.cashierTransactions.totalFilteredRecords;
                    }
                });
            }
            scope.initPage();
        }
    });
    mifosX.ng.application.controller('CashierTransactionSummaryController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', mifosX.controllers.CashierTransactionSummaryController]).run(function ($log) {
        $log.info("CashierTransactionSummaryController initialized");
    });
}(mifosX.controllers || {}));
