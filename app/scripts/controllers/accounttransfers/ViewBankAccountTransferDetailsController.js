(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewBankAccountTransferDetailsController: function (scope, resourceFactory, location, routeParams) {


            scope.entityType = routeParams.entityType;
            scope.entityId = routeParams.entityId;

            function init(){
                // resourceFactory.bankAccountTransferResource.get({bankTransferId: routeParams.transferId}, function (data) {
                //     scope.transferData = data;
                // });
                resourceFactory.entityTaskExecutionResource.get({entityType: "bankTransaction",entityId:routeParams.transferId}, function (data) {
                    scope.taskData = data;
                    //scope.$broadcast('initTask', {"taskData": data});
                });
            }

            init();

            scope.cancel = function (){
                init();
            };

        }
    });
    mifosX.ng.application.controller('ViewBankAccountTransferDetailsController', ['$scope', 'ResourceFactory', '$location', '$routeParams', mifosX.controllers.ViewBankAccountTransferDetailsController]).run(function ($log) {
        $log.info("ViewBankAccountTransferDetailsController initialized");
    });
}(mifosX.controllers || {}));
