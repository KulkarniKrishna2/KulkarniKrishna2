(function(module) {
    mifosX.controllers = _.extend(module, {
        ClientBankAccountDetailsController: function(scope, routeParams, resourceFactory, location, route) {
            scope.entityType = "clients";
            scope.entityId = routeParams.clientId;
            scope.clientId = routeParams.clientId;
            scope.formData = {};
            scope.bankAccountDetails = [];
            scope.groupData = {};
            scope.isActiveBankAccountDetails = true;
            scope.showAddBankAccountsButton = true;
            scope.allowMultipleBankAccountsForClient = scope.isSystemGlobalConfigurationEnabled('allow-multiple-bank-accounts-to-clients');

            scope.populateDetails = function(status) {
               resourceFactory.bankAccountDetailsResource.getAll({entityType: scope.entityType,entityId: scope.entityId,status:status}, function (data) {
                    scope.bankAccountDetails = data.result;
                    scope.showAddButton(scope.bankAccountDetails);
                    if(status === 'active'){
                        scope.isActiveBankAccountDetails = true;
                    }else{
                        scope.isActiveBankAccountDetails = false;
                    }
                });
            };

            scope.populateDetails(null);

            scope.routeTo = function (bankAccountRecord) {
                location.path('/'+scope.entityType+'/'+scope.entityId+'/bankaccountdetails/'+bankAccountRecord.id);
            };
            
            scope.showAddButton = function (data) {
                if(scope.allowMultipleBankAccountsForClient) {
                    scope.showAddBankAccountsButton = true;
                } else {
                    for(var i in data){
                        if(data[i] && (data[i].status.id == 100 || data[i].status.id == 200)){
                            scope.showAddBankAccountsButton =  false;
                            break;
                        }
                    }
                }
            }
        }
    });
    mifosX.ng.application.controller('ClientBankAccountDetailsController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.ClientBankAccountDetailsController]).run(function($log) {
        $log.info("ClientBankAccountDetailsController initialized");
    });
}(mifosX.controllers || {}));