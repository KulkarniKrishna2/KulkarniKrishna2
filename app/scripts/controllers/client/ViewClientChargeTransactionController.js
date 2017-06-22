(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewClientChargeTransactionController: function (scope, resourceFactory, routeParams, location) {

            scope.formData = {};
            scope.clientId = routeParams.clientId;
            scope.transactionId = routeParams.transactionId;
            scope.transaction = {};
            var params = {clientId : scope.clientId, transactionId : scope.transactionId};
            resourceFactory.clientTransactionResource.getTransaction(params ,function (data) {
                scope.transaction = data;
            });

            scope.undoTransaction = function(){
                resourceFactory.clientTransactionResource.undoTransaction({clientId: routeParams.clientId, transactionId:scope.transactionId}, function (data) {
                    location.path('/viewclient/'+scope.clientId+'/chargeoverview');
                });
            };

            scope.submit = function () {
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                resourceFactory.clientResource.save({clientId: routeParams.id, command: 'proposeTransfer'}, this.formData, function (data) {
                    location.path('/viewclient/' + routeParams.id);
                });
            };

        }
    });
    mifosX.ng.application.controller('ViewClientChargeTransactionController', ['$scope', 'ResourceFactory', '$routeParams', '$location', mifosX.controllers.ViewClientChargeTransactionController]).run(function ($log) {
        $log.info("ViewClientChargeTransactionController initialized");
    });
}(mifosX.controllers || {}));
