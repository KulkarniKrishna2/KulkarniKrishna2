(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateOccupationController: function (scope, routeParams, resourceFactory, location, $modal, route, $http) {

            scope.entityType = routeParams.entityType;
            scope.cashflowCategoryId = routeParams.cashFlowCategoryId;

            scope.formData = {};
            scope.formData.cashflowCategoryId = scope.cashflowCategoryId;
            scope.formData.isActive = true;
            scope.stabilityEnumOptions = [];
            scope.cashFlowCategories = {};
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.subOccuption && scope.response.uiDisplayConfigurations.subOccuption.isMandatory) {
                scope.isDefaultIncomeMandatory = scope.response.uiDisplayConfigurations.subOccuption.isMandatory.defaultOccupationIncome;
            }

            resourceFactory.incomeExpensesTemplate.get(function (response) {
                scope.cashFlowCategoryOptions = response.cashFlowCategoryOptions;
                for (var i in  scope.cashFlowCategoryOptions) {
                    if (scope.cashFlowCategoryOptions[i].id === parseInt(scope.formData.cashflowCategoryId)) {
                        scope.cashFlowCategories.name = scope.cashFlowCategoryOptions[i].name;
                        break;
                    }
                }
                scope.stabilityEnumOptions = response.stabilityEnumOptions;
            });

            scope.submit = function () {
                scope.formData.locale = "en";

                resourceFactory.incomeExpenses.save({cashflowCategoryId: routeParams.id}, scope.formData, function (data) {
                    location.path('/occupation/' + scope.cashflowCategoryId)
                });
            }
        }
    });
    mifosX.ng.application.controller('CreateOccupationController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', '$http', mifosX.controllers.CreateOccupationController]).run(function ($log) {
        $log.info("CreateOccupationController initialized");
    });
}(mifosX.controllers || {}));
