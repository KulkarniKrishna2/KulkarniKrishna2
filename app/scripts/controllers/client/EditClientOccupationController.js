(function (module) {
    mifosX.controllers = _.extend(module, {
        EditClientOccupationController: function (scope, routeParams, resourceFactory, location, $modal, route, $http) {

            scope.clientId = routeParams.clientId;
            scope.incomeAndExpenseId = routeParams.occupationId;
            scope.formData = {};
            scope.formData.isMonthWiseIncome = false;

            resourceFactory.cashFlowCategoryResource.getAll({isFetchIncomeExpenseDatas: true}, function(data){
                scope.occupations  = data;
            });

            resourceFactory.incomeExpenseAndHouseHoldExpense.get({clientId:scope.clientId, incomeAndExpenseId: scope.incomeAndExpenseId}, function(data){
                angular.forEach(scope.occupations, function(occ){
                    if(occ.id == data.incomeExpenseData.cashflowCategoryId){
                        scope.occupationOption = occ;
                    }
                });
                scope.formData.incomeExpenseId = data.incomeExpenseData.id;
                scope.formData.quintity = data.quintity;
                scope.formData.totalIncome = data.totalIncome;
                scope.formData.totalExpense = data.totalExpense;
                scope.formData.isPrimaryIncome = data.isPrimaryIncome;
                scope.formData.isRemmitanceIncome=data.isRemmitanceIncome;
                scope.isQuantifierNeeded = data.incomeExpenseData.isQuantifierNeeded
                scope.quantifierLabel = data.incomeExpenseData.quantifierLabel;
            });

            scope.slectedOccupation = function(occupationId, subOccupationId){
                for(var i in scope.occupations){
                    for(var j in scope.occupations[i].incomeExpenseDatas){
                        if(scope.occupations[i].incomeExpenseDatas[j].cashflowCategoryId == occupationId
                            && scope.occupations[i].incomeExpenseDatas[j].id == subOccupationId &&
                            scope.occupations[i].incomeExpenseDatas[j].isQuantifierNeeded == true){

                            scope.quantifierLabel = scope.occupations[i].incomeExpenseDatas[j].quantifierLabel;
                            scope.isQuantifierNeeded = scope.occupations[i].incomeExpenseDatas[j].isQuantifierNeeded;
                        }
                    }
                }
            }

            scope.subOccupationNotAvailable = function(occupationId){
                _.each(scope.occupations, function(occupation){
                    if(occupation.id == occupationId){
                        scope.isQuantifierNeeded = false;
                    }
                })
            }

            scope.submit = function () {
                scope.formData.locale = "en";

                resourceFactory.incomeExpenseAndHouseHoldExpense.update({clientId: scope.clientId, incomeAndExpenseId: scope.incomeAndExpenseId},scope.formData, function (data) {
                    location.path('/viewclient/' + scope.clientId)
                });
            }
        }
    });
    mifosX.ng.application.controller('EditClientOccupationController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', '$http', mifosX.controllers.EditClientOccupationController]).run(function ($log) {
        $log.info("EditClientOccupationController initialized");
    });
}(mifosX.controllers || {}));
