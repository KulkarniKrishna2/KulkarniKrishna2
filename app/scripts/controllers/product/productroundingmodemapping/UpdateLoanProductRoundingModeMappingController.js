(function (module) {
    mifosX.controllers = _.extend(module, {
        UpdateLoanProductRoundingModeMappingController: function (scope, resourceFactory, location, routeParams) {
            scope.formData = {};
            scope.formData.locale = scope.optlang.code;
            scope.roundingModeTypes = [];
            scope.productOptions = [];
            scope.id = routeParams.id;
            scope.getData = function () {
                resourceFactory.loanProductRoundingModeMappingResource.get({id:scope.id,template:true}, function (data) {
                    scope.roundingModeTypes = data.roundingModeTypes;
                    scope.productOptions = data.productOptions;
                    scope.formData.productId = data.loanProductData.id;
                    scope.formData.roundingMode = data.roundingMode.id;
                });
            };

            scope.getData();
            
            scope.submit = function () {
                resourceFactory.loanProductRoundingModeMappingResource.update({id:scope.id}, scope.formData, function (data) {
                    location.path('/viewloanproductroundingemappings');
                });
            };
        }
    });
    mifosX.ng.application.controller('UpdateLoanProductRoundingModeMappingController', ['$scope', 'ResourceFactory', '$location', '$routeParams', mifosX.controllers.UpdateLoanProductRoundingModeMappingController]).run(function ($log) {
        $log.info("UpdateLoanProductRoundingModeMappingController initialized");
    });
}(mifosX.controllers || {}));