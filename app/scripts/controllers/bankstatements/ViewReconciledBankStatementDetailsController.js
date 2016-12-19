(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewReconciledBankStatementDetailsController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {

            scope.reconciledBankStatementDetails = [];
            scope.undoReconcileData = [];
            scope.selectedAll = false;
            scope.bankStatementId = routeParams.bankStatementId;
            scope.bankName = '';
            scope.totalTransactions = 0;

            scope.getReconciledBankStatementDetails = function(){
                resourceFactory.bankStatementDetailsResource.getBankStatementDetails({ bankStatementId : scope.bankStatementId, command:'reconciled'},function (data) {
                    scope.reconciledBankStatementDetails = data.bankStatementDetails;
                    scope.bankName = data.bankName;
                    scope.totalTransactions = data.totalTransactions ;
                });
            };

            scope.getReconciledBankStatementDetails();

            scope.getAddedIndex = function(bankTransctionId){
                var index = -1;
                for(var i=0;i<scope.undoReconcileData.length;i++){
                    if(scope.undoReconcileData[i].bankTransctionId==bankTransctionId){
                        index = i;break;
                    }
                }
                return index;
            };

            scope.addDetailsForUndoReconcile = function(bankTransctionId){
                    var index = scope.getAddedIndex(bankTransctionId);
                    if(index>-1){
                        scope.undoReconcileData.splice(index, 1);
                    }else{
                        scope.undoReconcileData.push({'bankTransctionId' : bankTransctionId});
                    }
            };

            scope.selectAll = function(){
                scope.selectedAll = !scope.selectedAll;
                if(scope.selectedAll == true){
                    for(var i=0;i<scope.reconciledBankStatementDetails.length; i++){
                       scope.addDetailsForUndoReconcile(scope.reconciledBankStatementDetails[i].id)
                    }
                }else{
                    scope.undoReconcileData = [];
                }
            };

            scope.undoReconcile = function(){
                var reconcileData = {};
                reconcileData.transactionData = scope.undoReconcileData;
                resourceFactory.bankStatementDetailsResource.reconcileBankStatement({ bankStatementId : routeParams.bankStatementId, command: 'undoreconcile'},reconcileData, function (data) {
                    location.path('/bankstatementsdetails/'+routeParams.bankStatementId+'/reconciledtransaction');
                    scope.getReconciledBankStatementDetails();
                });
            };
        }
    });
    mifosX.ng.application.controller('ViewReconciledBankStatementDetailsController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.ViewReconciledBankStatementDetailsController]).run(function ($log) {
        $log.info("ViewReconciledBankStatementDetailsController initialized");
    });
}(mifosX.controllers || {}));
