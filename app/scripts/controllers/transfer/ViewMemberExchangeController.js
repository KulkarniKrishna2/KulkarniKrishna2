(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewMemberExchangeController: function (scope, resourceFactory, location, dateFilter, routeParams) {
            scope.init = function () {
                resourceFactory.bulkTransferResource.getAll({ transferType: 400 }, function (data) {
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
            scope.submit = function (id, action) {
                resourceFactory.bulkTransferResource.actions({ branchTransferId: id, command: action }, {}, function (data) {
                    scope.init();
                });
            }

        }
    });
    mifosX.ng.application.controller('ViewMemberExchangeController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$routeParams', mifosX.controllers.ViewMemberExchangeController]).run(function ($log) {
        $log.info("ViewMemberExchangeController initialized");
    });
}(mifosX.controllers || {}));