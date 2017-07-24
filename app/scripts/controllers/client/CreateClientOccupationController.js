(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateClientOccupationController: function (scope, routeParams, resourceFactory, location, $modal, route, $http) {

            scope.clientId = routeParams.clientId;
            scope.formData = {};
            scope.subOccupations = [];
            scope.formData.clientMonthWiseIncomeExpense = [];
            scope.formData.isMonthWiseIncome = false;

            resourceFactory.cashFlowCategoryResource.getAll({isFetchIncomeExpenseDatas: true}, function(data){
               scope.occupations  = data;
            });

            scope.slectedOccupation = function(occupationId, subOccupationId){
                var iterate=scope.occupationOption.incomeExpenseDatas;
                var index;
                    for(index=0;index<iterate.length;index++){
                        if(iterate[index].cashflowCategoryId == occupationId && iterate[index].id == subOccupationId){
                            if(iterate[index].isQuantifierNeeded == true){
                                scope.quantifierLabel = iterate[index].quantifierLabel;
                                scope.isQuantifierNeeded = iterate[index].isQuantifierNeeded;
                            }
                            if(iterate[index].defaultIncome){
                                scope.formData.totalIncome=iterate[index].defaultIncome;
                            }
                            if(iterate[index].defaultExpense){
                                scope.formData.totalExpense=iterate[index].defaultExpense;
                            }
                            break;
                        } else {
                            scope.isQuantifierNeeded = false;
                    }
                }
            }

            scope.subOccupationNotAvailable = function(occupationId){
                _.each(scope.occupationOption, function(occupation){
                    if(occupation == occupationId && _.isUndefined(occupation.incomeExpenseDatas)){
                        scope.isQuantifierNeeded = false;
                        return scope.isQuantifierNeeded;
                    }
                })
            }

            scope.submit = function () {
                scope.formData.locale = "en";

                resourceFactory.incomeExpenseAndHouseHoldExpense.save({clientId: scope.clientId},scope.formData, function (data) {
                    location.path('/viewclient/' + scope.clientId)
                });
            }
        }
    });
    mifosX.ng.application.controller('CreateClientOccupationController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', '$http', mifosX.controllers.CreateClientOccupationController]).run(function ($log) {
        $log.info("CreateClientOccupationController initialized");
    });
}(mifosX.controllers || {}));
