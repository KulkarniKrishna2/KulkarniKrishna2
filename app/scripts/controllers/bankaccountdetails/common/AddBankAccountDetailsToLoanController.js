(function (module) {
    mifosX.controllers = _.extend(module, {
        AddBankAccountDetailsToLoanController: function (scope, routeParams, resourceFactory, location) {
            scope.entityType = "clients";
            scope.loanId = routeParams.entityId;
            scope.clientId = routeParams.clientId;
            scope.formData = {};
            scope.bankAccountDetails = [];
            scope.groupData = {};

            function populateDetails() {
                resourceFactory.bankAccountDetailsResource.getAll({ entityType: scope.entityType, entityId: scope.clientId, status: "active" }, function (data) {
                    scope.bankAccountDetails = data;
                });
            }
            populateDetails();

            scope.submit = function (bankAccountDetailId) {
                if (bankAccountDetailId != undefined) {
                    scope.validateMessage = '';
                    resourceFactory.bankAccountDetailsAssociationsResources.create({ entityType: "loans", entityId: scope.loanId, bankAccountDetailsId: bankAccountDetailId }, function (data) {
                        scope.routeTo();
                    });
                } else {
                    scope.validateMessage = 'Please choose an bank account';
                }
            }

            scope.routeTo = function () {
                location.path('/viewloanaccount/' + scope.loanId);
            };
        }
    });
    mifosX.ng.application.controller('AddBankAccountDetailsToLoanController', ['$scope', '$routeParams', 'ResourceFactory', '$location', mifosX.controllers.AddBankAccountDetailsToLoanController]).run(function ($log) {
        $log.info("AddBankAccountDetailsToLoanController initialized");
    });
}(mifosX.controllers || {}));