(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewBulkPortfolioTransactionsController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            scope.bankStatementDetails  = [];
            scope.bankStatementId = routeParams.bankStatementId;
            scope.isTransactionsCreated = true;
            scope.isSimplified = false;

            resourceFactory.bankStatementsResource.get({ bankStatementId : routeParams.bankStatementId},function (data) {
                scope.isSimplified = data.bankData.supportSimplifiedStatement;
            });
            scope.getBankStatementDetails = function(){
                resourceFactory.bankStatementDetailsResource.getBankStatementDetails({ bankStatementId : routeParams.bankStatementId, command:'generatetransactions'},function (data) {
                    scope.bankStatementDetails = data.bankStatementDetails;
                    scope.isTransactionsCreated();
                });
            };

            scope.getBankStatementDetails();

            scope.submit = function() {
                scope.formData = {};
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;
                resourceFactory.bulkCollectionGeneratePortfolioResource.createPortfolioTransactions({ bankStatementId : routeParams.bankStatementId},scope.formData,function (data) {
                    scope.getBankStatementDetails();
                    scope.isTransactionsCreated();
                });
            };

            scope.isTransactionsCreated = function(){
                data=scope.bankStatementDetails;
                scope.isTransactionsCreated = false;
                var count = 0;
                for(var i=0;i<data.length;i++){
                    if(data[i].isError || data[i].isReconciled){
                        scope.isTransactionsCreated = true;
                        break;
                    }
                }
               
            };

            scope.routeTo = function (data) {
                location.path('/viewloantrxn/' + data.loanAccountNumber+'/trxnId/'+data.transactionId);
            };
        }
    });
    mifosX.ng.application.controller('ViewBulkPortfolioTransactionsController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.ViewBulkPortfolioTransactionsController]).run(function ($log) {
        $log.info("ViewBulkPortfolioTransactionsController initialized");
    });
}(mifosX.controllers || {}));
