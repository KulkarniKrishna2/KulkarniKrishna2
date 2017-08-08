(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewChargeController: function (scope, routeParams, resourceFactory, location, $modal) {
            scope.charge = [];
            scope.choice = 0;
            scope.slabBasedCharge = 'Slab Based';
            scope.installmentAmountSlabType = 1;
            
            resourceFactory.chargeResource.get({chargeId: routeParams.id}, function (data) {
                scope.charge = data;
            });

            scope.deleteCharge = function () {
                $modal.open({
                    templateUrl: 'deletech.html',
                    controller: ChDeleteCtrl
                });
            };

            scope.getSlabPlaceHolder = function(value,type){
                if(type=="min"){
                    return (value==scope.installmentAmountSlabType)?'label.input.fromloanamount':'label.input.minrepayment';
                }else{
                    return (value==scope.installmentAmountSlabType)?'label.input.toloanamount':'label.input.maxrepayment';
                }
                 
            };

            var ChDeleteCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    resourceFactory.chargeResource.delete({chargeId: routeParams.id}, {}, function (data) {
                        $modalInstance.close('delete');
                        location.path('/charges');
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

        }
    });
    mifosX.ng.application.controller('ViewChargeController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', mifosX.controllers.ViewChargeController]).run(function ($log) {
        $log.info("ViewChargeController initialized");
    });
}(mifosX.controllers || {}));
