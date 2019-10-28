(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewLoanTransactionController: function (scope, resourceFactory, location, routeParams, dateFilter, $modal, route) {

            scope.glimTransactions = [];
            scope.groupBankAccountDetails = {};
            scope.reversalReasons = [];
            scope.isRejectReasonRequired = false;
            scope.isValuedateUpdateRequired = false;
            scope.isRefundTransaction = false;
            scope.isIndividualLoan = false;
            scope.isWriteOff = false;
            function init(){
                resourceFactory.loanTrxnsResource.get({loanId: routeParams.accountId, transactionId: routeParams.id}, function (data) {
                    scope.transaction = data;
                    scope.isIndividualLoan = (data.loanType.code=='accountType.individual');
                    scope.isWriteOff = (data.type.code=='loanTransactionType.writeOff');
                    if(scope.transaction.type.code === "loanTransactionType.refund"){
                        scope.isRefundTransaction = true;
                    }
                    if(data.isGlimLoan && scope.isWriteOff){
                        scope.glimTransactions = data.glimTransactions;
                        if(scope.isGlimPaymentAsGroupEnabled){
                            scope.isGlimWriteOffTransaction = true;
                        }
                    }                    
                    scope.transaction.accountId = routeParams.accountId;
                    scope.transaction.createdDate = new Date(scope.transaction.createdDate.iLocalMillis);
                    scope.transaction.updatedDate = new Date(scope.transaction.updatedDate.iLocalMillis);
                    scope.groupBankAccountDetails = data.bankAccountDetailsData;
                    if (scope.transaction.txnValueDateStatus && scope.transaction.txnValueDateStatus.id==1 && !scope.transaction.manuallyReversed) {
                        scope.isValuedateUpdateRequired = true;
                    }
                    scope.isValueDateEnabled = scope.isSystemGlobalConfigurationEnabled('enable-value-date-for-loan-transaction');
                    scope.isUndoEditTrxnEnabled();
                    scope.getReversalReasonCodes();
                });
            };

            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.loanAccount &&
                scope.response.uiDisplayConfigurations.loanAccount.isMandatory){
                if(scope.response.uiDisplayConfigurations.loanAccount.isMandatory.undoTransactionReason){
                   scope.isRejectReasonRequired = scope.response.uiDisplayConfigurations.loanAccount.isMandatory.undoTransactionReason; 
                }
            }
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.viewLoanAccountDetails &&
                scope.response.uiDisplayConfigurations.viewLoanAccountDetails.isHiddenFeild){
                   scope.hideEditTransactions = scope.response.uiDisplayConfigurations.viewLoanAccountDetails.isHiddenFeild.editTransactions;
            }

            scope.getReversalReasonCodes = function(){
                resourceFactory.codeValueByCodeNameResources.get({codeName: "Transaction Reversal Reason"}, function (data) {
                    scope.reversalReasons = data;
                 });
            };

            scope.getReversalReasonCodes();

            scope.isUndoEditTrxnEnabled = function () {
                scope.hideEditUndoTrxnButton = false;
                scope.hideEditTrxnButton = false;
                if (scope.transaction.type.contra || scope.transaction.type.revokeSubsidy || scope.transaction.type.addSubsidy || scope.transaction.type.disbursement) {
                    scope.hideEditUndoTrxnButton = true;
                }
                if(scope.transaction.transfer || scope.isValueDateEnabled){
                    scope.hideEditTrxnButton = true;    
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
                $scope.reasons = scope.reversalReasons;
                $scope.isError = false;
                $scope.isRejectReasonRequired = scope.isRejectReasonRequired;
                $scope.undoTransaction = function (reason) {
                    var params = {loanId: accountId};
                    if(scope.isWriteOff && (scope.isGlimWriteOffTransaction || scope.isIndividualLoan)){
                        params.command = 'undowriteoff';
                    }else{
                        params.transactionId = transactionId;
                        params.command = 'undo';
                     }
                    
                    var formData = {dateFormat: scope.df, locale: scope.optlang.code, transactionAmount: 0};
                    if(reason){
                        formData.reason = reason;
                    }else{
                        if($scope.isRejectReasonRequired==true){
                            $scope.isError = true;
                            return false;
                        }
                        
                    }
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


            scope.editUtrNumber = function () {
                $modal.open({
                    templateUrl: 'utrNumber.html',
                    controller: UtrnCtrl,
                    windowClass: 'modalwidth700'
                });
            };

            var UtrnCtrl = function ($scope, $modalInstance) {
                
                $scope.utrFormData =  {};
                

                $scope.submitUtrn = function () {

                    resourceFactory.loanTrxnForUtrNumberResource.update({loanId: routeParams.accountId, transactionId: routeParams.id},$scope.utrFormData, function (data) {
                        $modalInstance.close('utrNumber');
                        init();
                    });
                };

                 $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.updateValueDate = function (accountId, transactionId) {
                $modal.open({
                    templateUrl: 'updatevaluedate.html',
                    controller: UpdateValueDateCtrl,
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
            
            var UpdateValueDateCtrl = function ($scope, $modalInstance, accountId, transactionId) {
                $scope.formRequestData = {dateFormat: scope.df, locale: scope.optlang.code};
                $scope.formRequestData.valueDate = new Date();
                $scope.updateTransaction = function (reason) {
                    var params = {loanId: accountId, transactionId: transactionId};
                    $scope.formRequestData.valueDate = dateFilter($scope.formRequestData.valueDate, scope.df);
                    resourceFactory.loanTransactionValueDateResource.update(params, $scope.formRequestData, function (data) {
                        $modalInstance.close('updatevaluedate');
                        scope.isValuedateUpdateRequired = false;
                        route.reload();
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            init();
        }
    });
    mifosX.ng.application.controller('ViewLoanTransactionController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', '$modal', '$route', mifosX.controllers.ViewLoanTransactionController]).run(function ($log) {
        $log.info("ViewLoanTransactionController initialized");
    });
}(mifosX.controllers || {}));
