(function (module) {
    mifosX.controllers = _.extend(module, {
        EditTransactionTypeController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.showAcounting = false;
            scope.transactionTypeMappings = [];
            resourceFactory.transactionTypeMappingResource.get({ mappingId: routeParams.mappingId, template: true }, function (data) {
                scope.template = data;
                scope.transactionTypeOptions = data.transactionTypeOptions;
                scope.productTypeOptions = data.productTypeOptions;
                scope.loanProducts = data.loanProducts;
                scope.glAccounts = data.glAccounts;
                scope.savingsProducts = data.savingsProducts;
                scope.accountLevelTypeOptions = data.accountLevelTypeOptions;
                scope.bcTransactionTypeGLMapping = data.bcTransactionTypeGLMapping;
                scope.transactionMappingOptions = data.transactionMappingOptions;
                scope.bcAccountingTypeOptions = data.bcAccountingTypeOptions;
                scope.paymentTypeOptions = data.paymentTypeOptions;
                scope.formData = {
                    locale: scope.optlang.code,
                    transactionTypeId: data.transactionType.id,
                    accountingLevelId: data.accountLevelType.id,
                    istransfer: data.isTransfer
                }
                if (data.accountingType && data.accountingType.code && data.accountingType.code != "bcAccountingType.invalid") {
                    scope.formData.bcAccountingTypeId = data.accountingType.id;
                    scope.isPaymentType(data.accountingType.id);
                    if (data.paymentType) {
                        scope.formData.bcAccountingSubTypeId = data.paymentType.id;
                    }
                }
                if (data.productType && data.productData) {
                    scope.formData.productTypeId = data.productType.id;
                    scope.formData.productId = data.productData.id;
                    scope.changeProductType(scope.formData.productTypeId);
                }
                if(scope.bcTransactionTypeGLMapping.length > 0){
                    scope.showAcounting = true;
                    for(var i in scope.bcTransactionTypeGLMapping){
                       scope.transactionTypeMappings.push({
                   mappingTypeId: scope.bcTransactionTypeGLMapping[i].transactionMappingType.id,
                   creditGlId: scope.bcTransactionTypeGLMapping[i].creditAccount.id,
                   debitGlId: scope.bcTransactionTypeGLMapping[i].debitAccount.id
                }); 
                    }
                }
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
            scope.isPaymentType = function (bcAccountingTypeId) {
                scope.displayPaymentType = false;
                for (var i in scope.bcAccountingTypeOptions) {
                    if (scope.bcAccountingTypeOptions[i].id == bcAccountingTypeId && scope.bcAccountingTypeOptions[i].code == 'bcAccountingType.paymentType') {
                        scope.displayPaymentType = true;
                    }
                }
            };
            scope.submit = function (id) {
                scope.formData.transactionMappings = [];
                for(var i in scope.transactionTypeMappings){
                    temp = {
                       mappingTypeId: scope.transactionTypeMappings[i].mappingTypeId,
                       creditGlId: scope.transactionTypeMappings[i].creditGlId,
                       debitGlId: scope.transactionTypeMappings[i].debitGlId
                    }
                    scope.formData.transactionMappings.push(temp);
                }
                if (!scope.displayPaymentType) {
                    delete scope.formData.bcAccountingSubTypeId;
                }           
                resourceFactory.transactionTypeMappingResource.update({ mappingId: routeParams.mappingId }, scope.formData, function (data) {
                    location.path('/transactiontypemapping/viewtransactiontype/' + id);
                });
            }
            scope.routeTO = function (id) {
                location.path('/transactiontypemapping/viewtransactiontype/' + id);
            }


        }
    });
    mifosX.ng.application.controller('EditTransactionTypeController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.EditTransactionTypeController]).run(function ($log) {
        $log.info("EditTransactionTypeController initialized");
    });
}(mifosX.controllers || {}));
