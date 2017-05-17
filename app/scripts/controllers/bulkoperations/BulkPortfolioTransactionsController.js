(function (module) {
    mifosX.controllers = _.extend(module, {
        BulkPortfolioTransactionsController: function (scope, resourceFactory, location, dateFilter, http, routeParams, paginatorService, API_VERSION, $upload, $rootScope) {
     scope.bankStatements  = [];
      scope.options = [];
      var option1 = {id:0,value:"Not Processed"};
      var option2 = {id:1,value:"Processed"};
      scope.options.push(option1);
      scope.options.push(option2);
        scope.baseUri = $rootScope.hostUrl+API_VERSION+'/bankstatement/1/documents/';
        scope.appendedUri = '/attachment?tenantIdentifier='+$rootScope.tenantIdentifier;
    
        scope.routeToTransaction = function(id,action){
            var uri = '/bankstatementsdetails/'+id+'/'+action
            location.path(uri);
        }
    
        scope.fetchFunction = function(offset, limit,callback) {
        var params = {statementType: 2};
        if(scope.processed == 0 ){
            params.processed = false;
        }else if(scope.processed == 1){
            params.processed = true;
        }
        params.offset = offset;
        params.limit = limit;
        params.orderBy = 'name';
        params.sortOrder = 'ASC';
        resourceFactory.bulkStatementsResource.getAllBankStatement(params, callback);
        };

        scope.fetchData = function () {
                scope.bulkcollection = paginatorService.paginate(scope.fetchFunction, 10);   
            };
            scope.fetchData();
        }

    });
    mifosX.ng.application.controller('BulkPortfolioTransactionsController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams','PaginatorService', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.BulkPortfolioTransactionsController]).run(function ($log) {
        $log.info("BulkPortfolioTransactionsController initialized");
    });
}(mifosX.controllers || {}));