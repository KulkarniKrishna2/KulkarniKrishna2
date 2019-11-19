(function (module) {
    mifosX.controllers = _.extend(module, {
        CreditHistoryController: function (scope, routeParams, resourceFactory, dateFilter, paginatorUsingOffsetService) {
            scope.clientId = routeParams.clientId;
            scope.clientName = routeParams.clientName;
            scope.summary = {};
            scope.history = {};
            scope.historyPerPage = 9;
            scope.showSummary = true;

            scope.getSummary = function () {
                resourceFactory.creditSummaryResource.get({ clientId: scope.clientId }, function (data) {
                    scope.summary = data;
                    if (scope.summary.updatedDate) {
                        scope.summary.updatedDate = dateFilter(new Date(scope.summary.updatedDate), scope.df);
                    }
                });
            }
            scope.getSummary();

            var fetchHistory = function (offset, limit, callback) {
                resourceFactory.creditHistoryResource.get({
                    clientId: scope.clientId,
                    offset: offset,
                    limit: limit,
                }, callback);
            };
            
            scope.getHistory = function () {
                scope.historyList = paginatorUsingOffsetService.paginate(fetchHistory, scope.historyPerPage);
                for (var i in scope.historyList) {
                    scope.historyList[i].updatedDate = dateFilter(new Date(scope.historyList[i].updatedDate), scope.df);
                }
            };

            scope.changeHistoryDisplayStatus = function () {
                scope.showSummary = !scope.showSummary;
            }
        }
    });
    mifosX.ng.application.controller('CreditHistoryController', ['$scope', '$routeParams', 'ResourceFactory', 'dateFilter',  'PaginatorUsingOffsetService', mifosX.controllers.CreditHistoryController]).run(function ($log) {
        $log.info("CreditHistoryController initialized");
    });
}(mifosX.controllers || {}));