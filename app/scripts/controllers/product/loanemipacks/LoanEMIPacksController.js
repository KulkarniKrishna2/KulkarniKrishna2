(function (module) {
    mifosX.controllers = _.extend(module, {
        LoanEMIPacksController: function (scope, resourceFactory, location) {
            scope.loanproducts = [];
            scope.loanproductstemplate = [];
            scope.loanProductId = '';

            scope.routeTo = function (id) {
                location.path('/viewloanemipacks/' + id);
            };

            if (!scope.searchCriteria.loanP) {
                scope.searchCriteria.loanP = null;
                scope.saveSC();
            }
            scope.filterText = scope.searchCriteria.loanP;

            scope.onFilter = function () {
                scope.searchCriteria.loanP = scope.filterText;
                scope.saveSC();
            };

            resourceFactory.loanemipack.getAllProductsWithPacks(function (data) {
                scope.loanproducts = data;
            });

            resourceFactory.loanemipackproducttemplate.getAllProductsWithoutPacks(function (data) {
                scope.loanproductstemplate = data;
            });
        }
    });
    mifosX.ng.application.controller('LoanEMIPacksController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.LoanEMIPacksController]).run(function ($log) {
        $log.info("LoanEMIPacksController initialized");
    });
}(mifosX.controllers || {}));