(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewLoanTransactionController: function (scope, resourceFactory, location, routeParams, dateFilter, $modal) {

            scope.glimTransactions = [];

            resourceFactory.loanTrxnsResource.get({loanId: routeParams.accountId, transactionId: routeParams.id}, function (data) {
                scope.transaction = data;
                scope.glimTransactions = data.glimTransactions;
                scope.transaction.accountId = routeParams.accountId;
                scope.transaction.createdDate = new Date(scope.transaction.createdDate.iLocalMillis);
                scope.transaction.updatedDate = new Date(scope.transaction.updatedDate.iLocalMillis);
                scope.isUndoEditTrxnEnabled();
            });

            scope.isUndoEditTrxnEnabled = function () {
                scope.hideEditUndoTrxnButton = false;
                if (scope.transaction.type.contra || scope.transaction.type.revokeSubsidy || scope.transaction.type.addSubsidy) {
                    scope.hideEditUndoTrxnButton = true;
                }
            }

            scope.undo = function (accountId, transactionId) {
                $modal.open({
                    templateUrl: 'undotransaction.html',
                    controller: UndoTransactionModel,
                    resolve: {
                        accountId: function () {
                          return accountId;
                        },
                        transactionId: function () {
                          return transactionId;
                        }
                    }
                });
            };
            
            var UndoTransactionModel = function ($scope, $modalInstance, accountId, transactionId) {
                $scope.undoTransaction = function () {
                    var params = {loanId: accountId, transactionId: transactionId, command: 'undo'};
                    var formData = {dateFormat: scope.df, locale: scope.optlang.code, transactionAmount: 0};
                    formData.transactionDate = dateFilter(new Date(), scope.df);
                    resourceFactory.loanTrxnsResource.save(params, formData, function (data) {
                        $modalInstance.close('delete');
                        location.path('/viewloanaccount/' + data.loanId);
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

        }
    });
    mifosX.ng.application.controller('ViewLoanTransactionController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', '$modal', mifosX.controllers.ViewLoanTransactionController]).run(function ($log) {
        $log.info("ViewLoanTransactionController initialized");
    });
}(mifosX.controllers || {}));
