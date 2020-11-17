(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewAccountTransferDetailsController: function (scope, resourceFactory, location, routeParams, dateFilter) {

            scope.redirectPath = routeParams.redirectPath+"/"+routeParams.accoutId;
            scope.isSavingsToSavingsTransfer = false;
            resourceFactory.accountTransferResource.get({transferId: routeParams.id}, function (data) {
                scope.transferData = data;
                if(scope.transferData.fromAccountType.code === scope.transferData.toAccountType.code 
                    && scope.transferData.fromAccountType.code === "accountType.savings"){
                    scope.isSavingsToSavingsTransfer = true;
                }
            });

            scope.adjustTransaction = function(){
                scope.savingsId = routeParams.accoutId;
                scope.transactionId = routeParams.transactionId;
                var params = {savingsId: scope.savingsId, transactionId: scope.transactionId, command: 'modify'};
                var formData = {dateFormat: scope.df, locale: scope.optlang.code, transactionAmount: scope.transferData.transferAmount};
                formData.transactionDate = dateFilter(new Date(scope.transferData.transferDate), scope.df);
                
                resourceFactory.savingsTrxnsResource.save(params, formData, function (data) {
                    location.path('/viewsavingaccount/' + data.savingsId);
                });
            }


        }
    });
    mifosX.ng.application.controller('ViewAccountTransferDetailsController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter',  mifosX.controllers.ViewAccountTransferDetailsController]).run(function ($log) {
        $log.info("ViewAccountTransferDetailsController initialized");
    });
}(mifosX.controllers || {}));
