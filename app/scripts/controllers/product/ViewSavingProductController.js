(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewSavingProductController: function (scope, routeParams, location, anchorScroll, resourceFactory) {
            scope.interestRateChart = [];
            scope.isFloatingInterestRateChart = false;
            resourceFactory.savingProductResource.get({savingProductId: routeParams.id, template: 'true'}, function (data) {
                scope.savingproduct = data;
                if(data.savingsProductDrawingPowerDetailsData){
                    scope.savingproduct.allowDpLimit = true;
                    scope.savingsProductDrawingPowerDetailsData = data.savingsProductDrawingPowerDetailsData;
                }
                if(data.floatingInterestRateChartData){
                    scope.interestRateChart = data.floatingInterestRateChartData;
                    scope.isFloatingInterestRateChart = true;
                }
                scope.hasAccounting = data.accountingRule.id == 2 ? true : false;
            });

            scope.scrollto = function (link) {
                location.hash(link);
                anchorScroll();

            };
        }
    });
    mifosX.ng.application.controller('ViewSavingProductController', ['$scope', '$routeParams', '$location', '$anchorScroll' , 'ResourceFactory', mifosX.controllers.ViewSavingProductController]).run(function ($log) {
        $log.info("ViewSavingProductController initialized");
    });
}(mifosX.controllers || {}));
