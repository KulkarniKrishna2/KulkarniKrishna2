(function (module) {
    mifosX.controllers = _.extend(module, {
        cashflowActivityController: function ($controller, scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION, $upload, $rootScope) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.showSummary = true;
            scope.showAddClientoccupationdetailsForm = false;
            scope.showEditClientoccupationdetailsForm = false;
            scope.showAddClientassetdetailsForm = false;
            scope.showEditClientassetdetailsForm = false;
            scope.showAddClienthouseholddetailsForm = false;
            scope.showEditClienthouseholddetailsForm = false;

            function hideAll(){
                scope.showSummary = false;
                scope.showAddClientoccupationdetailsForm = false;
                scope.showEditClientoccupationdetailsForm = false;
                scope.showAddClientassetdetailsForm = false;
                scope.showEditClientassetdetailsForm = false;
                scope.showAddClienthouseholddetailsForm = false;
                scope.showEditClienthouseholddetailsForm = false;
            };

            function initTask(){
                scope.clientId = scope.taskconfig['clientId'];
                scope.showSummary = true;
                refreshAndShowSummaryView();
            };

            initTask();

            function incomeAndexpense(){
                resourceFactory.incomeExpenseAndHouseHoldExpense.getAll({clientId: scope.clientId},function(data){
                    scope.incomeAndExpenses = data;
                    scope.totalIncomeOcc = scope.calculateOccupationTotal();
                    scope.totalIncomeAsset = scope.calculateTotalAsset();
                    scope.totalHouseholdExpense = scope.calculateTotalExpense();
                    scope.showSummaryView();
                });
            };

            scope.calculateOccupationTotal = function(){
                var total = 0;
                angular.forEach(scope.incomeAndExpenses, function(incomeExpense){
                    if(!_.isUndefined(incomeExpense.incomeExpenseData.cashFlowCategoryData.categoryEnum) && incomeExpense.incomeExpenseData.cashFlowCategoryData.categoryEnum.id == 1){
                        if(!_.isUndefined(incomeExpense.totalIncome) && !_.isNull(incomeExpense.totalIncome)){
                            if(!_.isUndefined(incomeExpense.totalExpense) && !_.isNull(incomeExpense.totalExpense)){
                                total = total + incomeExpense.totalIncome-incomeExpense.totalExpense;
                            }
                            else
                            {
                                total = total + incomeExpense.totalIncome;
                            }
                        }
                    }
                });
                return total;
            };

            scope.calculateTotalAsset = function(){
                var total = 0;
                angular.forEach(scope.incomeAndExpenses, function(incomeExpense){
                    if(!_.isUndefined(incomeExpense.incomeExpenseData.cashFlowCategoryData.categoryEnum) && incomeExpense.incomeExpenseData.cashFlowCategoryData.categoryEnum.id == 2){
                        if(!_.isUndefined(incomeExpense.totalIncome) && !_.isNull(incomeExpense.totalIncome)){
                            if(!_.isUndefined(incomeExpense.totalExpense) && !_.isNull(incomeExpense.totalExpense)){
                                total = total + incomeExpense.totalIncome-incomeExpense.totalExpense;
                            }
                            else
                            {
                                total = total + incomeExpense.totalIncome;
                            }
                        }
                    }
                });
                return total;
            };

            scope.calculateTotalExpense = function(){
                var total = 0;
                angular.forEach(scope.incomeAndExpenses, function(incomeExpense){
                    if(!_.isUndefined(incomeExpense.incomeExpenseData.cashFlowCategoryData.typeEnum) && incomeExpense.incomeExpenseData.cashFlowCategoryData.typeEnum.id == 2){
                        if(!_.isUndefined(incomeExpense.totalExpense) && !_.isNull(incomeExpense.totalExpense)){
                            total = total + incomeExpense.totalExpense;
                        }
                    }
                });
                return total;
            };

            scope.showSummaryView = function(){
                hideAll();
                scope.showSummary = true;
            };

            function refreshAndShowSummaryView(){
                incomeAndexpense();
            };

            //edit

            scope.editClientoccupationdetails = function (incomeExpenseId) {
                hideAll();
                scope.showEditClientoccupationdetailsForm = true;
                initEditClientoccupationdetails(incomeExpenseId);
            };

            scope.editClientassetdetails = function (incomeExpenseId) {
                hideAll();
                scope.showEditClientassetdetailsForm = true;
                initEditClientoccupationdetails(incomeExpenseId);
            };

            scope.editClienthouseholddetails = function (incomeExpenseId) {
                hideAll();
                scope.showEditClienthouseholddetailsForm = true;
                initEditClientoccupationdetails(incomeExpenseId);
            };

            function initEditClientoccupationdetails(incomeExpenseId) {
                scope.incomeAndExpenseId = incomeExpenseId;
                scope.formData = {};
                scope.formData.isMonthWiseIncome = false;
                scope.isQuantifierNeeded = false;

                resourceFactory.cashFlowCategoryResource.getAll({isFetchIncomeExpenseDatas: true}, function (data) {
                    scope.occupations = data;
                });

                resourceFactory.incomeExpenseAndHouseHoldExpense.get({
                    clientId: scope.clientId,
                    incomeAndExpenseId: scope.incomeAndExpenseId
                }, function (data) {
                    angular.forEach(scope.occupations, function (occ) {
                        if (occ.id == data.incomeExpenseData.cashflowCategoryId) {
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
            };

            // create activity
            scope.addClientoccupationdetails = function () {
                hideAll();
                scope.showAddClientoccupationdetailsForm = true;
                initAddClientoccupationdetails();
            };

            scope.addClientassetdetails = function () {
                hideAll();
                scope.showAddClientassetdetailsForm = true;
                initAddClientoccupationdetails();
            };

            scope.addClienthouseholddetails = function () {
                hideAll();
                scope.showAddClienthouseholddetailsForm = true;
                initAddClientoccupationdetails();
            };

            function initAddClientoccupationdetails(){
                scope.formData = {};
                scope.subOccupations = [];
                scope.formData.clientMonthWiseIncomeExpense = [];
                scope.formData.isMonthWiseIncome = false;
                scope.isQuantifierNeeded = false;
                scope.quantifierLabel = undefined;

                resourceFactory.cashFlowCategoryResource.getAll({isFetchIncomeExpenseDatas: true}, function(data){
                    scope.occupations  = data;
                });
            };

            scope.slectedOccupation = function(occupationId, subOccupationId){
                _.each(scope.occupations, function (occupation) {
                    if(occupation.id == occupationId){
                        _.each(occupation.incomeExpenseDatas, function(iterate){
                            if(iterate.cashflowCategoryId == occupationId && iterate.id == subOccupationId){
                                if(iterate.defaultIncome){
                                    scope.formData.totalIncome=iterate.defaultIncome;
                                }
                                if(iterate.defaultExpense){
                                    scope.formData.totalExpense=iterate.defaultExpense;
                                }
                                if(iterate.isQuantifierNeeded == true){
                                    scope.quantifierLabel = iterate.quantifierLabel;
                                    scope.isQuantifierNeeded = iterate.isQuantifierNeeded;
                                }
                            } else {
                                scope.isQuantifierNeeded = false;
                            }
                        })
                    }

                });
            };

            scope.subOccupationNotAvailable = function(occupationId){
                _.each(scope.occupationOption, function(occupation){
                    if(occupation == occupationId && _.isUndefined(occupation.incomeExpenseDatas)){
                        scope.isQuantifierNeeded = false;
                        return scope.isQuantifierNeeded;
                    }
                })
            };

            scope.addClientoccupationdetailsSubmit = function () {
                scope.formData.locale = "en";
                resourceFactory.incomeExpenseAndHouseHoldExpense.save({clientId: scope.clientId},scope.formData, function (data) {
                    refreshAndShowSummaryView();
                });
            };

            scope.addClientassetdetailsSubmit = function () {
                scope.addClientoccupationdetailsSubmit();
            };

            scope.addClienthouseholddetailsSubmit = function () {
                scope.addClientoccupationdetailsSubmit();
            };

            scope.editClientassetdetailsSubmit = function(){
                scope.editClientoccupationdetailsSubmit();
            }
            scope.editClienthouseholddetailsSubmit = function(){
                scope.editClientoccupationdetailsSubmit();
            }
            scope.editClientoccupationdetailsSubmit = function () {
                scope.formData.locale = "en";
                resourceFactory.incomeExpenseAndHouseHoldExpense.update({clientId: scope.clientId, incomeAndExpenseId: scope.incomeAndExpenseId},
                    scope.formData, function (data) {
                    refreshAndShowSummaryView();
                });
            };
        }
    });
    mifosX.ng.application.controller('cashflowActivityController', ['$controller','$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.cashflowActivityController]).run(function ($log) {
        $log.info("cashflowActivityController initialized");
    });
}(mifosX.controllers || {}));