(function (module) {
    mifosX.controllers = _.extend(module, {
        FldgManualSettlementController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal, route) {
            scope.trancheId = routeParams.trancheId;
            scope.formData = {
                locale: scope.optlang.code,
            };
            resourceFactory.createTranche.get({ trancheId: routeParams.trancheId }, function (data) {
                scope.trancheDetails = data;
            });
            resourceFactory.fldgSettlement.get({ trancheId: routeParams.trancheId }, function (data) {
                scope.settlementOptions = data.settlementOptions;
            });
            scope.submit = function () {
                resourceFactory.fldgSettlement.save({ trancheId: routeParams.trancheId,mannual:"mannual"}, scope.formData, function (data) {
                    location.path('/fldgsettlement/' + routeParams.trancheId);
                });
            };
        }
    });
    mifosX.ng.application.controller('FldgManualSettlementController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', '$route', mifosX.controllers.FldgManualSettlementController]).run(function ($log) {
        $log.info("FldgManualSettlementController initialized");
    });
}(mifosX.controllers || {}));
