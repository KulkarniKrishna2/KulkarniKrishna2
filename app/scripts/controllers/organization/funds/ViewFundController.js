(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewFundController: function (scope, resourceFactory, location, dateFilter, routeParams) {

            scope.fund = {};
            resourceFactory.fundsResource.get({'fundId': routeParams.fundId},{}, function (data) {
                scope.fund = data;
            });

        }
    });
    mifosX.ng.application.controller('ViewFundController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$routeParams', mifosX.controllers.ViewFundController]).run(function ($log) {
        $log.info("ViewFundController initialized");
    });
}(mifosX.controllers || {}));
