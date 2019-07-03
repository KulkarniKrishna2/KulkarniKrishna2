(function (module) {
    mifosX.controllers = _.extend(module, {
        LoanDpDetailsController: function (scope, resourceFactory, location) {
            scope.loanproducts = [];
            scope.loanproductstemplate = [];
            scope.loanProductId = '';

            scope.routeTo = function (loanProductId) {
                location.path('/viewloandpdetails/loanproduct/' + loanProductId);
            };

            scope.routeToAddDpDetails = function(loanProductId) {
                location.path('/addloandpdetails/loanproduct/'+loanProductId);
            }
            if (!scope.searchCriteria.loanP) {
                scope.searchCriteria.loanP = null;
                scope.saveSC();
            }
            scope.filterText = scope.searchCriteria.loanP;

            scope.onFilter = function () {
                scope.searchCriteria.loanP = scope.filterText;
                scope.saveSC();
            };

            resourceFactory.loanDpDetailsTemplateResource.getProductsTemplate(function (data) {
                scope.loanproducts = data.templateData.loanProductsWithDpDetailsData;
                scope.loanproductstemplate = data.templateData.loanProductsWithoutDpDetailsData;
            });

        }
    });
    mifosX.ng.application.controller('LoanDpDetailsController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.LoanDpDetailsController]).run(function ($log) {
        $log.info("LoanDpDetailsController initialized");
    });
}(mifosX.controllers || {}));