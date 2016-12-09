(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewBankAccountTransferDetailsController: function (scope, resourceFactory, location, routeParams) {


            scope.entityType = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            
            resourceFactory.bankAccountTransferResource.get({bankTransferId: routeParams.transferId}, function (data) {
                scope.transferData = data;
            });

            scope.initiate = function () {
                resourceFactory.bankAccountTransferResource.save({bankTransferId: routeParams.transferId, command: 'initiate'}, function (data) {
                    scope.cancel();
                });
            };

            scope.submit = function () {
                resourceFactory.bankAccountTransferResource.save({bankTransferId: routeParams.transferId, command: 'submit'}, function (data) {
                    scope.cancel();
                });
            };

            scope.cancel = function (){
                $window.history.back();
            };

        }
    });
    mifosX.ng.application.controller('ViewBankAccountTransferDetailsController', ['$scope', 'ResourceFactory', '$location', '$routeParams', mifosX.controllers.ViewBankAccountTransferDetailsController]).run(function ($log) {
        $log.info("ViewBankAccountTransferDetailsController initialized");
    });
}(mifosX.controllers || {}));
