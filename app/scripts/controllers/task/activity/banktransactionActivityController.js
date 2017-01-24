(function (module) {
    mifosX.controllers = _.extend(module, {
        banktransactionActivityController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {

            scope.formData = {};
            scope.createDetail = true;

            function populateDetails(){
                resourceFactory.bankAccountTransferTemplateResource.get({bankTransferId: scope.bankTransferId}, function (data) {
                    scope.transferData = data;
                    scope.formData.transferType = scope.transferData.transferType.value;
                });
            }

            scope.initiate = function () {
                resourceFactory.bankAccountTransferResource.save({bankTransferId: scope.bankTransferId, command: 'initiate'}, function (data) {
                    scope.cancel();
                    scope.activityApproveDone();
                });
            };

            scope.submit = function () {
                resourceFactory.bankAccountTransferResource.save({bankTransferId: scope.bankTransferId, command: 'submit'},scope.formData, function (data) {
                    scope.cancel();
                });
            };

            scope.cancel = function (){
                populateDetails();
            };

            scope.$on('activityApprove', function (event, data) {
                if (scope.transferData.status.id == 2) {
                    scope.initiate();
                }
            });

            function initTask() {
                scope.bankTransferId = scope.taskconfig['bankTransactionId'];
                populateDetails();
                scope.transferTypes = [{key:"neft",display:""}]
            };

            initTask();
        }
    });
    mifosX.ng.application.controller('banktransactionActivityController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.banktransactionActivityController]).run(function ($log) {
        $log.info("banktransactionActivityController initialized");
    });
}(mifosX.controllers || {}));
