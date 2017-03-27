(function (module) {
    mifosX.controllers = _.extend(module, {
        DownloadTransactionsController: function (scope, routeParams, resourceFactory, location, route, http, $modal, dateFilter, API_VERSION, $sce, $rootScope) {
            scope.formData = {};
            scope.formData.includeChildOffices = false;
            scope.selection = [];
            scope.minDate = new Date();

            resourceFactory.mandatesTemplateResource.get({command: "TRANSACTIONS_DOWNLOAD"}, function (data) {
                scope.officeOptions = data.officeOptions;
                scope.failedTransactionOptions = data.failedTransactionOptions;
            });


            scope.toggleSelection = function toggleSelection(transaction) {
                var idx = scope.selection.indexOf(transaction);

                if (idx > -1) {
                    scope.selection.splice(idx, 1);
                }

                else {
                    scope.selection.push(transaction);
                }
            };

            scope.submit = function () {
                scope.formData.dateFormat = scope.df;
                scope.formData.locale = scope.optlang.code;
                scope.formData.paymentDueStartDate = dateFilter(scope.formData.paymentDueStartDate, scope.df);
                scope.formData.paymentDueEndDate = dateFilter(scope.formData.paymentDueEndDate, scope.df);
                if(scope.selection.length > 0){
                    scope.formData.includeFailedTransactions = scope.selection;
                }
                resourceFactory.mandatesResource.post({command: "TRANSACTIONS_DOWNLOAD"},scope.formData,function (data) {
                    location.path('/viewmandates');
                });
            };
        }
    });

    mifosX.ng.application.controller('DownloadTransactionsController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', '$http', '$modal', 'dateFilter', 'API_VERSION', '$sce', '$rootScope', mifosX.controllers.DownloadTransactionsController]).run(function ($log) {
        $log.info("DownloadTransactionsController initialized");
    });
}(mifosX.controllers || {}));
