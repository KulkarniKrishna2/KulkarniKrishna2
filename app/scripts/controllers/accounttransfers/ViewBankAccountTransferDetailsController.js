(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewBankAccountTransferDetailsController: function (scope, resourceFactory, routeParams) {
            scope.entityType = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            function init() {
                resourceFactory.entityTaskExecutionResource.get({ entityType: "bankTransaction", entityId: routeParams.transferId }, function (data) {
                    scope.taskData = data;
                });
            }
            init();
            scope.cancel = function () {
                init();
            };
        }
    });
    mifosX.ng.application.controller('ViewBankAccountTransferDetailsController', ['$scope', 'ResourceFactory', '$routeParams', mifosX.controllers.ViewBankAccountTransferDetailsController]).run(function ($log) {
        $log.info("ViewBankAccountTransferDetailsController initialized");
    });
}(mifosX.controllers || {}));