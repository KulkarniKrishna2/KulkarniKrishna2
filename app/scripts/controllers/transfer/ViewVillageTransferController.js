(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewVillageTransferController: function (scope, resourceFactory, location, dateFilter, routeParams, $modal) {
            scope.init = function () {
                resourceFactory.bulkTransferResource.getAll({ transferType: 500 }, function (data) {
                    for (var i in data) {
                        if (data[i].jsonRequestBody) {
                            var dataAsJson = JSON.parse(data[i].jsonRequestBody);
                            data[i].dataList = dataAsJson.data;
                        } else {
                            data[i].dataList = [];
                        }
                    }
                    scope.bulkTransfers = data;
                });
            };
            scope.init();
            scope.submit = function (id,action) {
                $modal.open({
                    templateUrl: 'villagetransferaction.html',
                    controller: VillageTransferActionCtrl,
                    resolve: {
                        rejectParameterInfo: function () {
                            return { 'bulkTransferId': id , 'action' : action };
                        }
                    }
                });
            };
            var VillageTransferActionCtrl = function ($scope, $modalInstance,rejectParameterInfo) {
                $scope.bulkTransferId = rejectParameterInfo.bulkTransferId;
                $scope.action = rejectParameterInfo.action;
                $scope.isApproveAction = false;
            
                if($scope.action == "approve"){
                    $scope.isApproveAction = true;
                }
                $scope.confirm = function () {
                    resourceFactory.bulkTransferResource.actions({ branchTransferId: $scope.bulkTransferId, command: $scope.action }, {}, function (data) {
                        $modalInstance.close();
                        scope.init();
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
        }
    });
    mifosX.ng.application.controller('ViewVillageTransferController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$routeParams', '$modal', mifosX.controllers.ViewVillageTransferController]).run(function ($log) {
        $log.info("ViewVillageTransferController initialized");
    });
}(mifosX.controllers || {}));