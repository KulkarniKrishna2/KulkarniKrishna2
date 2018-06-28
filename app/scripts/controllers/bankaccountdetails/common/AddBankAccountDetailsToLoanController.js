(function(module) {
    mifosX.controllers = _.extend(module, {
        AddBankAccountDetailsToLoanController: function(scope, routeParams, resourceFactory, location, route) {
            scope.entityType = "clients";
            scope.loanId = routeParams.entityId;
            scope.clientId = routeParams.clientId;
            scope.formData = {};
            scope.bankAccountDetails = [];
            scope.groupData = {};
            
            function populateDetails() {
               resourceFactory.bankAccountDetailResources.getAll({entityType: scope.entityType,entityId: scope.clientId, status: "active"}, function (data) {
                    scope.bankAccountDetails = data;
                });
            }
            populateDetails();

            scope.submit = function (bankAccountDetailId){
                resourceFactory.loanBankAccountAssociationResources.create({entityType: "loans",entityId: scope.loanId, bankAccountId: bankAccountDetailId}, function (data) {
                    scope.bankAccountDetails = data;
                    scope.routeTo();
                });
            }

            scope.routeTo = function () {
                location.path('/viewloanaccount/' + scope.loanId);
            };

        }
    });
    mifosX.ng.application.controller('AddBankAccountDetailsToLoanController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.AddBankAccountDetailsToLoanController]).run(function($log) {
        $log.info("AddBankAccountDetailsToLoanController initialized");
    });
}(mifosX.controllers || {}));