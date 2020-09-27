(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewBankTransferDetailController: function (scope, resourceFactory, routeParams) {
            scope.entityType = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            scope.bankTransferId = routeParams.transferId;
            function populateDetails(){
                resourceFactory.bankAccountTransferTemplateResource.get({bankTransferId: scope.bankTransferId}, function (data) {
                    scope.transferData = data;
                });
            }
            populateDetails();
        }
    });
    mifosX.ng.application.controller('ViewBankTransferDetailController', ['$scope', 'ResourceFactory', '$routeParams', mifosX.controllers.ViewBankTransferDetailController]).run(function ($log) {
        $log.info("ViewBankTransferDetailController initialized");
    });
}(mifosX.controllers || {}));