(function (module) {
    mifosX.controllers = _.extend(module, {
        EditClientAssetController: function (scope, routeParams, resourceFactory, location, $modal, route) {

            scope.clientId = routeParams.clientId;
            scope.assetId = routeParams.assetId;
            scope.formData = {};
            scope.formData.isMonthWiseIncome = false;
            scope.totalIncome = 0;

            resourceFactory.cashFlowCategoryResource.getAll({isFetchIncomeExpenseDatas: true}, function(data){
                scope.occupations  = data;
            });

            resourceFactory.incomeExpenseAndHouseHoldExpense.get({clientId:scope.clientId, incomeAndExpenseId: scope.assetId}, function(data){
                angular.forEach(scope.occupations, function(occ){
                    if(occ.id == data.incomeExpenseData.cashflowCategoryId){
                        scope.occupationOption = occ;
                    }
                });
                scope.formData.incomeExpenseId = data.incomeExpenseData.id;
                scope.formData.quintity = data.quintity;
                scope.formData.totalIncome = data.defaultIncome;
                scope.formData.totalExpense = data.totalExpense;
                scope.formData.isPrimaryIncome = data.isPrimaryIncome;
                scope.formData.isRemmitanceIncome=data.isRemmitanceIncome;
                scope.isQuantifierNeeded = data.incomeExpenseData.isQuantifierNeeded;
                scope.updateTotalIncome(scope.formData.quintity, scope.formData.totalIncome);
                scope.quantifierLabel = data.incomeExpenseData.quantifierLabel;
            });

            scope.updateTotalIncome = function(quantity,income){
                if(scope.isQuantifierNeeded && quantity && income){
                    scope.totalIncome = parseFloat(quantity)*parseFloat(income);
                }else{
                    scope.totalIncome = undefined;
                }
            };

            scope.slectedOccupation = function(occupationId, subOccupationId){
                for(var i in scope.occupations){
                    for(var j in scope.occupations[i].incomeExpenseDatas){
                        if(scope.occupations[i].incomeExpenseDatas[j].cashflowCategoryId == occupationId
                                && scope.occupations[i].incomeExpenseDatas[j].id == subOccupationId &&
                                scope.occupations[i].incomeExpenseDatas[j].isQuantifierNeeded == true){

                            delete scope.formData.quintity;
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
                resourceFactory.incomeExpenseAndHouseHoldExpense.update({clientId: scope.clientId, incomeAndExpenseId: scope.assetId},scope.formData, function (data) {
                    location.path('/viewclient/' + scope.clientId)
                });
            }
        }
    });
    mifosX.ng.application.controller('EditClientAssetController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', '$http', mifosX.controllers.EditClientAssetController]).run(function ($log) {
        $log.info("EditClientAssetController initialized");
    });
}(mifosX.controllers || {}));
