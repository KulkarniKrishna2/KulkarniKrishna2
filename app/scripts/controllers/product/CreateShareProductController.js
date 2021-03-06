(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateShareProductController: function (scope, resourceFactory, dateFilter, location) {
            scope.formData = {};
            scope.charges = [];
            scope.formData.marketPricePeriods = [] ;
            scope.showOrHideValue = "show";
            resourceFactory.productsResource.template({productType:'share', resourceType:'template'}, function(data) {
                scope.product = data;
                scope.product.chargeOptions = scope.product.chargeOptions || [];
                scope.assetAccountOptions = scope.product.accountingMappingOptions.assetAccountOptions || [] ;
                scope.equityAccountOptions = scope.product.accountingMappingOptions.equityAccountOptions || [] ;
                scope.liabilityAccountOptions = scope.product.accountingMappingOptions.liabilityAccountOptions || [];
                scope.incomeAccountOptions = scope.product.accountingMappingOptions.incomeAccountOptions || [];
                scope.formData.currencyCode = data.currencyOptions[0].code;
                scope.formData.digitsAfterDecimal = data.currencyOptions[0].decimalPlaces;
                scope.formData.accountingRule = '1';

            });

            scope.addMarketPricePeriod = function () {
                var marketPrice = {} ;
                marketPrice.locale=scope.optlang.code;
                marketPrice.dateFormat = scope.df;
                scope.formData.marketPricePeriods.push(marketPrice);
            };

            scope.deleteMarketPricePeriod = function (index) {
                scope.formData.marketPricePeriods.splice(index, 1);
            } ;

            scope.chargeSelected = function (chargeId) {
                if (chargeId) {
                    resourceFactory.chargeResource.get({chargeId: chargeId, template: 'true'}, this.formData, function (data) {
                        data.chargeId = data.id;
                        scope.charges.push(data);
                        //to charge select box empty
                        scope.chargeId = '';
                    });
                }
            }

            scope.deleteCharge = function (index) {
                scope.charges.splice(index, 1);
            }

            scope.cancel = function () {
                location.path('/shareproducts');
            };

            scope.submit = function () {
                scope.errorDetails = [];
                if(!_.isUndefined(this.formData.lockinPeriodFrequency)){
                    if(_.isUndefined(this.formData.lockinPeriodFrequencyType)){
                        return scope.errorDetails.push([{code:'error.msge.undefined.lockinPeriodFrequencyType'}]);
                    }
                }
                if(!_.isUndefined(this.formData.lockinPeriodFrequencyType)){
                    if(this.formData.lockinPeriodFrequency==""){
                        return scope.errorDetails.push([{code:'error.msge.undefined.lockinPeriodFrequency'}]);
                    }
                }
                if(!_.isUndefined(this.formData.minimumactiveperiodFrequencyType)){
                    if(_.isUndefined(this.formData.minimumActivePeriodForDividends)){
                        return scope.errorDetails.push([{code:'error.msge.undefined.minimumActivePeriod'}]);
                    }
                }
                scope.chargesSelected = [];
                for (var i in scope.charges) {
                    temp = {
                        id: scope.charges[i].id
                    }
                    scope.chargesSelected.push(temp);
                }
                for(var j in scope.formData.marketPricePeriods) {
                    scope.formData.marketPricePeriods[j].fromDate = dateFilter(scope.formData.marketPricePeriods[j].fromDate, scope.df);
                }
                this.formData.chargesSelected = scope.chargesSelected;
                this.formData.locale = scope.optlang.code;
                if(scope.errorDetails){
                    delete scope.errorDetails;
                }

                resourceFactory.shareProduct.post(this.formData, function (data) {
                    location.path('/viewshareproduct/' + data.resourceId);
                });
            }
        }
    });
    mifosX.ng.application.controller('CreateShareProductController', ['$scope', 'ResourceFactory', 'dateFilter', '$location', mifosX.controllers.CreateShareProductController]).run(function ($log) {
        $log.info("CreateShareProductController initialized");
    });
}(mifosX.controllers || {}));
