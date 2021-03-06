(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewChargeController: function (scope, routeParams, resourceFactory, location, $modal) {
            scope.charge = [];
            scope.choice = 0;
            scope.slabBasedCharge = 'Slab Based';
            scope.installmentAmountSlabType = 1;
            scope.chargeAppliesToLoan = 1;
            scope.showChargeCategoryType = false;

            if (scope.response.uiDisplayConfigurations.createCharges.isHiddenField) {
                scope.showChargeCategoryType = !scope.response.uiDisplayConfigurations.createCharges.isHiddenField.chargeCategoryType;
            }

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
                var  slabPlaceHolder='';
                switch(value){
                    case 1 : if(type=="min"){
                        slabPlaceHolder =  'label.input.fromloanamount';
                    }else{
                        slabPlaceHolder =  'label.input.toloanamount';
                    }
                        break;
                    case 2 :slabPlaceHolder =  'label.input.'+type+'repayment';
                        break;
                    case 3 :slabPlaceHolder =  'label.input.'+type+'.tenureindays';
                        break;
                    default:break;
                }
                return slabPlaceHolder;
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
