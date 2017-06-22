(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewClientChargeController: function (scope, resourceFactory, location, routeParams, route) {
            scope.clientId = routeParams.clientId;

            resourceFactory.clientChargesResource.get({clientId: routeParams.clientId, resourceType:routeParams.chargeId , associations:'all'}, function (data) {
                scope.charge = data;
            });

            scope.undoTransaction = function(transactionId){
                resourceFactory.clientTransactionResource.undoTransaction({clientId: routeParams.clientId, transactionId:transactionId}, function (data) {
                    route.reload();
                });
            }

            scope.waiveCharge = function(chargeId){
                resourceFactory.clientChargesResource.waive({clientId: routeParams.clientId, resourceType:routeParams.chargeId}, function (data) {
                    route.reload();
                });
            }

            scope.routeTo = function (transactionId) {
                    location.path('/viewclientchargetrxn/' + scope.clientId + '/transactionId/' + transactionId);
            };

            scope.viewClientChargeTransactionJournalEntries = function(transactionId){
                var transactionId = "C" + transactionId;
                if(scope.clientId != null && scope.clientId != ""){
                    location.path('/viewtransactions/' + transactionId).search({productName: scope.charge.name,chargeId:scope.charge.id,clientId: scope.clientId,
                        isTransactionReferenceNumber:true});
                }
            };

            scope.deleteCharge = function(){
                resourceFactory.clientChargesResource.delete({clientId: routeParams.clientId, resourceType:routeParams.chargeId , associations:'all'}, function (data) {
                    location.path('/viewclient/'+ scope.clientId);
                });
            }
        }
    });
    mifosX.ng.application.controller('ViewClientChargeController', ['$scope', 'ResourceFactory', '$location', '$routeParams', '$route', mifosX.controllers.ViewClientChargeController]).run(function ($log) {
        $log.info("ViewClientChargeController initialized");
    });
}(mifosX.controllers || {}));
