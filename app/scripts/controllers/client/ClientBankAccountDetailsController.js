(function(module) {
    mifosX.controllers = _.extend(module, {
        ClientBankAccountDetailsController: function(scope, routeParams, resourceFactory, location, route) {
            scope.entityType = "clients";
            scope.entityId = routeParams.clientId;
            scope.formData = {};
            scope.bankAccountDetails = [];
            scope.groupData = {};
            scope.showAddBankAccountsButton = false;
            scope.allowMultipleBankAccountsForClient = scope.isSystemGlobalConfigurationEnabled('allow-multiple-bank-accounts-to-clients');

            function populateDetails() {
               resourceFactory.bankAccountDetailResources.getAll({entityType: scope.entityType,entityId: scope.entityId}, function (data) {
                    scope.bankAccountDetails = data;
                    scope.showAddButton(data);
                });
            }
            populateDetails();

            scope.routeTo = function (clientBankAccountDetailAssociationId) {
                location.path('/'+scope.entityType+'/'+scope.entityId+'/bankaccountdetails/'+clientBankAccountDetailAssociationId);
            };

            scope.showAddButton = function (data) {
                if(scope.allowMultipleBankAccountsForClient) {
                    scope.showAddBankAccountsButton = true;
                } else {
                    if(data && data.length < 1){
                        scope.showAddBankAccountsButton =  true
                    }
                }

            }
        }
    });
    mifosX.ng.application.controller('ClientBankAccountDetailsController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.ClientBankAccountDetailsController]).run(function($log) {
        $log.info("ClientBankAccountDetailsController initialized");
    });
}(mifosX.controllers || {}));