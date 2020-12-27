(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewLoanProductRoundingModeMappingsController: function (scope, resourceFactory, location, $modal) {
            scope.productMappings = [];
            scope.getData = function () {
                resourceFactory.loanProductRoundingModeMappingResource.getAll({}, function (data) {
                    scope.productMappings = data;
                });
            };
            scope.getData();
            
            scope.deleteItem = {};
            scope.delete = function (id,name) {
                scope.deleteItem ={};
                scope.deleteItem.id = id;
                scope.deleteItem.name = name;                
                $modal.open({
                    templateUrl: 'deletemapping.html',
                    controller: DeleteCtrl,
                    resolve: {
                        items: function () {
                        return scope.deleteItem;
                        }
                    }
                });
            };

            var DeleteCtrl = function ($scope, $modalInstance,items) {
                $scope.deleteItem =items;
                scope.deleteItem ={};
                $scope.delete = function () {
                    resourceFactory.loanProductRoundingModeMappingResource.delete({id:items.id},function (data) {
                        $modalInstance.close('delete');
                        scope.getData();
                    });

                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

        }
    });
    mifosX.ng.application.controller('ViewLoanProductRoundingModeMappingsController', ['$scope', 'ResourceFactory', '$location','$modal', mifosX.controllers.ViewLoanProductRoundingModeMappingsController]).run(function ($log) {
        $log.info("ViewLoanProductRoundingModeMappingsController initialized");
    });
}(mifosX.controllers || {}));