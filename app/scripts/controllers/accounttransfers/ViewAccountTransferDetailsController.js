(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewAccountTransferDetailsController: function (scope, resourceFactory, location, routeParams) {

            scope.redirectPath = "viewsavingaccount";
            resourceFactory.accountTransferResource.get({transferId: routeParams.id}, function (data) {
                scope.transferData = data;
                if(scope.transferData.toAccountDepositType.value == 'Recurring Deposit'){
                    scope.redirectPath = "viewrecurringdepositaccount";
                }else{
                    scope.redirectPath = "viewsavingaccount";
                }
            });


        }
    });
    mifosX.ng.application.controller('ViewAccountTransferDetailsController', ['$scope', 'ResourceFactory', '$location', '$routeParams', mifosX.controllers.ViewAccountTransferDetailsController]).run(function ($log) {
        $log.info("ViewAccountTransferDetailsController initialized");
    });
}(mifosX.controllers || {}));
