(function(module) {
    mifosX.controllers = _.extend(module, {
        GroupBankAccountDetailsController: function(scope, routeParams, resourceFactory, location, route) {
            scope.formData = {};
            scope.entityType = "groups";
            scope.bankAccountDetails = [];
            scope.groupData = {};
            scope.allowBankAccountForGroups = scope.isSystemGlobalConfigurationEnabled('allow-bank-account-for-groups');
            scope.showAddBankAccountsButton = false;

            function populateDetails() {
               scope.groupId = routeParams.groupId;
                resourceFactory.bankAccountDetailResources.getAll({entityType: scope.entityType,entityId: scope.groupId}, function(data) {
                    scope.bankAccountDetails = data;
                    scope.showAddButton(data);
                });
            }
            populateDetails();

            scope.routeTo = function (groupBankAccountDetailAssociationId) {
                location.path('/groups/'+scope.groupId+'/bankaccountdetails/' + groupBankAccountDetailAssociationId);
            };
            scope.showAddButton = function (data) {
                if(scope.allowBankAccountForGroups) {
                    scope.showAddBankAccountsButton = true;
                } else {
                    if(data && data.length < 1){
                        scope.showAddBankAccountsButton =  true
                    }
                }

            }
        }
    });
    mifosX.ng.application.controller('GroupBankAccountDetailsController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.GroupBankAccountDetailsController]).run(function($log) {
        $log.info("GroupBankAccountDetailsController initialized");
    });
}(mifosX.controllers || {}));