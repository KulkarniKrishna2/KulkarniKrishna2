(function(module) {
    mifosX.controllers = _.extend(module, {
        GroupBankAccountDetailsController: function(scope, routeParams, resourceFactory, location, route) {
            scope.formData = {};
            scope.bankAccountDetails = [];
            scope.groupData = {};
            scope.allowBankAccountForGroups = scope.isSystemGlobalConfigurationEnabled('allow-bank-account-for-groups');

            function populateDetails() {
               scope.groupId = routeParams.groupId;
                resourceFactory.groupBankAccountResource.retrieveAll({
                    groupId: scope.groupId
                }, function(data) {
                    scope.groupData = data.groupData;
                    scope.bankAccountDetails = data.groupBankAccountDetailsList;
                });
            }
            populateDetails();

            scope.routeTo = function (groupBankAccountDetailAssociationId) {
                location.path('/groups/'+scope.groupId+'/bankaccountdetails/' + groupBankAccountDetailAssociationId);
            };
        }
    });
    mifosX.ng.application.controller('GroupBankAccountDetailsController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.GroupBankAccountDetailsController]).run(function($log) {
        $log.info("GroupBankAccountDetailsController initialized");
    });
}(mifosX.controllers || {}));