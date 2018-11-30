(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateNewTransactionTypeController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.formData = {
                locale: scope.optlang.code
            };
            scope.showAcounting = false;
            scope.transactionTypeMappings = [];
            scope.transactionTypeOptions = [];
            scope.productTypeOptions = [];
            resourceFactory.transactionTypeMappingTemplateResource.get(function (data) {
                scope.transactionTypeOptions = data.transactionTypeOptions;
                scope.productTypeOptions = data.productTypeOptions;
                scope.loanProducts = data.loanProducts;
                scope.glAccounts = data.glAccounts;
                scope.savingsProducts = data.savingsProducts;
                scope.accountLevelTypeOptions = data.accountLevelTypeOptions;
                scope.transactionMappingOptions = data.transactionMappingOptions;

            });
            scope.changeProductType = function (productTypeId) {
                if (scope.formData.productTypeId == 1) {
                    scope.productOptions = scope.loanProducts;
                }
                else if (scope.formData.productTypeId == 2) {
                    scope.productOptions = scope.savingsProducts;
                }
            }

            scope.addMapping = function(){
                scope.showAcounting = true;
                scope.transactionTypeMappings.push({
                   mappingTypeId: scope.transactionMappingOptions.length > 0 ? scope.transactionMappingOptions[0].id : '',
                   creditGlId: scope.glAccounts.length > 0 ? scope.glAccounts[0].id : '',
                   debitGlId: scope.glAccounts.length > 0 ? scope.glAccounts[0].id : ''
                });
            }
            scope.deleteMaping = function(index){
                scope.transactionTypeMappings.splice(index,1);
                if(scope.transactionTypeMappings.length == 0){
                   scope.showAcounting = false; 
                }
            }
            scope.submit = function () {
                scope.formData.transactionMappings = [];
                for(var i in scope.transactionTypeMappings){
                    temp = {
                       mappingTypeId: scope.transactionTypeMappings[0].mappingTypeId,
                       creditGlId: scope.transactionTypeMappings[0].creditGlId,
                       debitGlId: scope.transactionTypeMappings[0].debitGlId
                    }
                    scope.formData.transactionMappings.push(temp);
                }
                resourceFactory.transactionTypeMappingResource.save(scope.formData, function (data) {
                    location.path('/transactiontypemapping');
                });
            }

        }
    });
    mifosX.ng.application.controller('CreateNewTransactionTypeController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.CreateNewTransactionTypeController]).run(function ($log) {
        $log.info("CreateNewTransactionTypeController initialized");
    });
}(mifosX.controllers || {}));
