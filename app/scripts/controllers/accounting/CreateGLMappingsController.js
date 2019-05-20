(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateGLMappingsController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.mappingId = routeParams.mappingId;
            scope.accStateId = routeParams.accStateId;
            scope.showOrHideValue = "show";
            scope.paymentTypeOptions = [];
            scope.configureFundOptions = [];
            scope.formData = {
                locale: scope.optlang.code,
                accStateId: routeParams.accStateId,
            };
            resourceFactory.AdvancedAccountingGLMappingTemplate.get(function (data) {
                scope.accountingMappingOptions = data.accountingMappingOptions;
                scope.paymentTypeOptions = data.paymentTypeOptions;
                scope.assetAccountOptions = scope.accountingMappingOptions.assetAccountOptions || [];
                scope.incomeAccountOptions = scope.accountingMappingOptions.incomeAccountOptions || [];
                scope.expenseAccountOptions = scope.accountingMappingOptions.expenseAccountOptions || [];
                scope.liabilityAccountOptions = scope.accountingMappingOptions.liabilityAccountOptions || [];
                scope.incomeAndLiabilityAccountOptions = scope.incomeAccountOptions.concat(scope.liabilityAccountOptions);
                scope.assetAndLiabilityAccountOptions = scope.assetAccountOptions.concat(scope.liabilityAccountOptions);
                scope.assetLiabilityAndIncomeAccountOptions = scope.assetAndLiabilityAccountOptions.concat(scope.incomeAccountOptions);
                scope.glAccountOptions = scope.assetLiabilityAndIncomeAccountOptions.concat(scope.expenseAccountOptions);
            });
            scope.routeTo = function () {
                location.path('/viewaccountingglmappings/' + routeParams.mappingId + '/accstate/' + routeParams.accStateId);
            };

              //advanced accounting rule
              scope.showOrHide = function (showOrHideValue) {

                if (showOrHideValue == "show") {
                    scope.showOrHideValue = 'hide';
                }

                if (showOrHideValue == "hide") {
                    scope.showOrHideValue = 'show';
                }
            };

            scope.addConfigureFundSource = function () {
                scope.frFlag = true;
                scope.configureFundOptions.push({
                    paymentTypeId:  scope.paymentTypeOptions.length > 0 ?  scope.paymentTypeOptions[0].id : '',
                    fundSourceAccountId: scope.glAccountOptions.length > 0 ? scope.glAccountOptions[0].id : '',
                    paymentTypeOptions:  scope.paymentTypeOptions.length > 0 ?  scope.paymentTypeOptions : [],
                    assetAccountOptions: scope.glAccountOptions.length > 0 ? scope.glAccountOptions : []
                });
            };

            scope.deleteFund = function (index) {
                scope.configureFundOptions.splice(index, 1);
            };

            scope.submit = function () {
                scope.paymentChannelToFundSourceMappings = [];
                //configure fund sources for payment channels
                for (var i in scope.configureFundOptions) {
                    temp = {
                        paymentTypeId: scope.configureFundOptions[i].paymentTypeId,
                        fundSourceAccountId: scope.configureFundOptions[i].fundSourceAccountId
                    }
                    scope.paymentChannelToFundSourceMappings.push(temp);
                }
                this.formData.paymentChannelToFundSourceMappings = scope.paymentChannelToFundSourceMappings;
                resourceFactory.AdvancedAccountingGLMapping.save(scope.formData, function (data) {
                    scope.routeTo();
                });
            }

        }
    });
    mifosX.ng.application.controller('CreateGLMappingsController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.CreateGLMappingsController]).run(function ($log) {
        $log.info("CreateGLMappingsController initialized");
    });
}(mifosX.controllers || {}));
