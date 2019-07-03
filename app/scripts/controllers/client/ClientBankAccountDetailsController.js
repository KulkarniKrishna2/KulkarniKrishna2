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
            scope.showInactiveBankAccountDetails = scope.response.uiDisplayConfigurations.bankAccountDetails.showInactiveBankAccountDetails;

            function populateDetails() {
               resourceFactory.bankAccountDetailResources.getAll({entityType: scope.entityType,entityId: scope.entityId}, function (data) {
                    scope.bankAccountDetails = data;
                    scope.showAddButton(data);
                });
               if(scope.showInactiveBankAccountDetails){
                    scope.status="inactive";
                    resourceFactory.bankAccountDetailResources.getAll({entityType: scope.entityType,entityId: scope.entityId,status:scope.status}, function (data) {
                    scope.inActivebankAccountDetails = data;
                });
               }
            }
            populateDetails();

            scope.routeTo = function (clientBankAccountDetailAssociationId) {
                location.path('/'+scope.entityType+'/'+scope.entityId+'/bankaccountdetails/'+clientBankAccountDetailAssociationId);
            };
            scope.routeTowithQueryParam = function (clientBankAccountDetailAssociationId) {
                scope.statusParam = "inactive";
                location.path('/'+scope.entityType+'/'+scope.entityId+'/bankaccountdetails/'+clientBankAccountDetailAssociationId).search({'associationStatus':scope.statusParam});
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
            scope.showInActiveBankDetails = function(){
                return (scope.showInactiveBankAccountDetails && scope.inActivebankAccountDetails && scope.inActivebankAccountDetails.length > 0)
            }
        }
    });
    mifosX.ng.application.controller('ClientBankAccountDetailsController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.ClientBankAccountDetailsController]).run(function($log) {
        $log.info("ClientBankAccountDetailsController initialized");
    });
}(mifosX.controllers || {}));