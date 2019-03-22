
(function (module) {
    mifosX.controllers = _.extend(module, {
        GSTDebitTransactionControllers: function (scope, routeParams, paginatorService, dateFilter, resourceFactory, location) {

            scope.headersData = [];
            scope.endDate = dateFilter(new Date(),scope.df);
            scope.startDate = dateFilter(new Date().setDate(new Date().getDate()-10),scope.df);
            scope.getHeadersData = function () {
                if(scope.endDate || scope.startDate){
                    var fromDate = dateFilter(scope.startDate,scope.df);
                    var toDate = dateFilter(scope.endDate,scope.df);
                    resourceFactory.gstHeadersResource.getAll({startDate:fromDate,endDate:toDate,dateFormat:scope.df,locale:scope.optlang.code}, function (data) {
                        scope.headersData = data;
                    });
                }else{
                    scope.headersData = [];
                }
                
            };

            scope.$watchCollection('[startDate,endDate]', function(newValues, oldValues){
                scope.getHeadersData();
            });

            scope.routeTo = function (id) {
                location.path('gstdebittransaction/' + id);
            }
        }
    });
    mifosX.ng.application.controller('GSTDebitTransactionControllers', ['$scope', '$routeParams', 'PaginatorService', 'dateFilter', 'ResourceFactory', '$location', mifosX.controllers.GSTDebitTransactionControllers]).run(function ($log) {
        $log.info("GSTDebitTransactionControllers initialized");
    });
}(mifosX.controllers || {}));