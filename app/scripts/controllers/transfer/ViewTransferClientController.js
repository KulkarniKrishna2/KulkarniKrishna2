(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewTransferClientController: function (scope, resourceFactory, location, dateFilter, routeParams, $modal) {
            scope.init = function () {
                resourceFactory.bulkTransferResource.getAll({ transferType: 200 }, function (data) {
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
                    templateUrl: 'memberTransferAction.html',
                    controller: MemberTransferActionCtrl,
                    resolve: {
                        rejectParameterInfo: function () {
                            return { 'branchTransferId': id , 'action' : action };
                        }
                    }
                });
            };
            var MemberTransferActionCtrl = function ($scope, $modalInstance,rejectParameterInfo) {
                $scope.branchTransferId = rejectParameterInfo.branchTransferId;
                $scope.action = rejectParameterInfo.action;
                $scope.isApproveAction = false;
            
                if($scope.action == "approve"){
                    $scope.isApproveAction = true;
                }
                $scope.confirm = function () {
                    resourceFactory.bulkTransferResource.actions({ branchTransferId: $scope.branchTransferId, command: $scope.action }, {}, function (data) {
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
    mifosX.ng.application.controller('ViewTransferClientController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$routeParams', '$modal', mifosX.controllers.ViewTransferClientController]).run(function ($log) {
        $log.info("ViewTransferClientController initialized");
    });
}(mifosX.controllers || {}));