(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewTransferCenterController: function (scope, resourceFactory, location, dateFilter, routeParams, $modal) {
            scope.init = function () {
                resourceFactory.bulkTransferResource.getAll({ transferType: 300 }, function (data) {
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
                    templateUrl: 'centerTransferAction.html',
                    controller: CenterTransferActionCtrl,
                    resolve: {
                        rejectParameterInfo: function () {
                            return { 'bulkTransferId': id , 'action' : action };
                        }
                    }
                });
            };
            var CenterTransferActionCtrl = function ($scope, $modalInstance,rejectParameterInfo) {
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
    mifosX.ng.application.controller('ViewTransferCenterController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$routeParams', '$modal', mifosX.controllers.ViewTransferCenterController]).run(function ($log) {
        $log.info("ViewTransferCenterController initialized");
    });
}(mifosX.controllers || {}));