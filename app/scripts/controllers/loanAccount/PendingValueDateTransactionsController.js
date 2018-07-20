(function (module) {
    mifosX.controllers = _.extend(module, {
        PendingValueDateTransactionsController: function (scope, resourceFactory, paginatorUsingOffsetService, dateFilter, route) {

            scope.first = {};
            scope.first.valueDate = new Date();
            scope.recordsPerPage = 14;
            var fetchFunction = function (offset, limit, callback) {
                var params = {
                    offset: offset,
                    limit: limit
                };
                if (scope.first.transactionDate) {
                    params.transactionDate = dateFilter(scope.first.transactionDate, scope.df);
                    params.locale = scope.optlang.code;
                    params.dateFormat = scope.df;
                }
                resourceFactory.valueDateTransactionsResource.query(params, callback);
            };

            scope.searchData = function () {
                scope.transactions = paginatorUsingOffsetService.paginate(fetchFunction, scope.recordsPerPage);
            };

            var transactionIdArray = [];
            scope.selectAll = function (selectAll) {
                if(selectAll === true) {
                    for (var i = 0; i < scope.transactions.currentPageItems.length; i++) {
                        transactionIdArray.push(scope.transactions.currentPageItems[i].id);
                        scope.transactions.currentPageItems[i].checkbox = true;
                    }
                } else {
                    for (var i = 0; i < scope.transactions.currentPageItems.length; i++) {
                        transactionIdArray = _.without(transactionIdArray,scope.transactions.currentPageItems[i].id);
                        scope.transactions.currentPageItems[i].checkbox = false;
                    }
                }
                transactionIdArray =  _.uniq(transactionIdArray);
            };

            scope.transactionSelected = function (transactionId, checkbox) {
                for (var i = 0; i < scope.transactions.currentPageItems.length; i++) {
                    if (scope.transactions.currentPageItems[i].id === transactionId) {
                        if (checkbox === true) {
                            scope.transactions.currentPageItems[i].checkbox = true;
                            transactionIdArray.push(transactionId);
                            break;
                        } else {
                            scope.transactions.currentPageItems[i].checkbox = false;
                            transactionIdArray = _.without(transactionIdArray,scope.transactions.currentPageItems[i].id);
                            break;
                        }
                    }
                }
                if (transactionIdArray.length === 0) {
                    scope.activeall = false;
                }
                transactionIdArray =  _.uniq(transactionIdArray);
            };

            scope.submit = function () {
                var formData = {locale:scope.optlang.code, dateFormat:scope.df};
                if (scope.first.valueDate) {
                    formData.valueDate = dateFilter(scope.first.valueDate, scope.df);
                }
                formData.tansactionIds = transactionIdArray;
                resourceFactory.valueDateTransactionsResource.update(formData, function (data) {
                    route.reload();
                });
            }
        }
    });
    mifosX.ng.application.controller('PendingValueDateTransactionsController', ['$scope', 'ResourceFactory', 'PaginatorUsingOffsetService', 'dateFilter', '$route', mifosX.controllers.PendingValueDateTransactionsController]).run(function ($log) {
        $log.info("PendingValueDateTransactionsController initialized");
    });
}(mifosX.controllers || {}));
