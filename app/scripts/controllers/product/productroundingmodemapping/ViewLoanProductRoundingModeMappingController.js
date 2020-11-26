(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewLoanProductRoundingModeMappingController: function (scope, resourceFactory, location, routeParams) {
            scope.productMapping = {};
            scope.id = routeParams.id;
            scope.getData = function () {
                resourceFactory.loanProductRoundingModeMappingResource.get({id:scope.id}, function (data) {
                    scope.productMapping = data;
                });
            };
            scope.getData();
            
            scope.delete = function (id) {
                resourceFactory.loanProductRoundingModeMappingResource.delete({id:id}, scope.formData, function (data) {
                    scope.getData();
                });
            };
        }
    });
    mifosX.ng.application.controller('ViewLoanProductRoundingModeMappingController', ['$scope', 'ResourceFactory', '$location', '$routeParams', mifosX.controllers.ViewLoanProductRoundingModeMappingController]).run(function ($log) {
        $log.info("ViewLoanProductRoundingModeMappingController initialized");
    });
}(mifosX.controllers || {}));