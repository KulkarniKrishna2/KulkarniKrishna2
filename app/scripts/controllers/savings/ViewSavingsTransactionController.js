(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewSavingsTransactionController: function (scope, resourceFactory, location, routeParams, dateFilter, $modal) {
            scope.flag = false;
            scope.hideEdit = false;
            scope.isHold = false;
            scope.isRejectReasonRequired = false;
            scope.isAccrual = false;
            resourceFactory.savingsTrxnsResource.get({savingsId: routeParams.accountId, transactionId: routeParams.id}, function (data) {
                scope.transaction = data;
                if(scope.transaction.transactionType.accrual==true){
                    scope.isAccrual = true;
                }
                if (scope.transaction.transactionType.value == 'Transfer' || scope.transaction.reversed == 'true'
                    || scope.transaction.transactionType.id==3 || scope.transaction.transactionType.id==17 || scope.transaction.transactionType.id==20 || scope.transaction.transactionType.id==21) {
                    scope.flag = true;
                }

                if (scope.transaction.transactionType.id==21){
                    scope.hideEdit = true;
                }
                if (scope.transaction.transactionType.id==20){
                    scope.hideEdit = true;
                    scope.isHold = true;
                }
            });

             if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.loanAccount &&
                scope.response.uiDisplayConfigurations.loanAccount.isMandatory){
                if(scope.response.uiDisplayConfigurations.loanAccount.isMandatory.undoTransactionReason){
                   scope.isRejectReasonRequired = scope.response.uiDisplayConfigurations.loanAccount.isMandatory.undoTransactionReason; 
                }
            }

            scope.getReversalReasonCodes = function(){
                resourceFactory.codeValueByCodeNameResources.get({codeName: "Transaction Reversal Reason"}, function (data) {
                    scope.reversalReasons = data;
                 });
            };

            scope.getReversalReasonCodes();
            
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
                $scope.reasons = scope.reversalReasons;
                $scope.isError = false;
                $scope.isRejectReasonRequired = scope.isRejectReasonRequired;
                $scope.undoTransaction = function (reason) {
                    var params = {savingsId: accountId, transactionId: transactionId, command: 'undo'};
                    var formData = {dateFormat: scope.df, locale: scope.optlang.code, transactionAmount: 0};
                    formData.transactionDate = dateFilter(new Date(), scope.df);
                    if(reason){
                        formData.reason = reason;
                    }else{
                        if($scope.isRejectReasonRequired==true){
                            $scope.isError = true;
                            return false;
                        }
                    }
                    resourceFactory.savingsTrxnsResource.save(params, formData, function (data) {
                        $modalInstance.close('delete');
                        location.path('/viewsavingaccount/' + data.savingsId);
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.releaseAmount = function (accountId, transactionId) {
                $modal.open({
                            templateUrl: 'releaseAmount.html',
                            controller: ReleaseAmountController,
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

            var ReleaseAmountController = function ($scope, $modalInstance, accountId, transactionId) {
                $scope.releaseAmount = function () {
                    var params = {savingsId: accountId, transactionId: transactionId, command: 'releaseAmount'};
                  
                    resourceFactory.savingsTrxnsResource.save(params, this.formData, function (data) {
                       $modalInstance.close('releaseAmount');
                        location.path('/viewsavingaccount/' + data.savingsId);
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

        }
    });
    mifosX.ng.application.controller('ViewSavingsTransactionController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', '$modal', mifosX.controllers.ViewSavingsTransactionController]).run(function ($log) {
        $log.info("ViewSavingsTransactionController initialized");
    });
}(mifosX.controllers || {}));
