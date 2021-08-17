(function (module) {
    mifosX.controllers = _.extend(module, {
        ClientBankAccountActivityController: function ($controller, scope, resourceFactory) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));
            scope.entityType = "clients";
            scope.formData = {};
            scope.bankAccountDetails = [];
            scope.showAddBankAccountsButton = true;
            scope.showActivateBankAccountsButton = false;
            scope.showEditBankAccountsButton = false;
            scope.showDeactivateBankAccountsButton = false;
            scope.showAddBankAccountsScreen = false;
            scope.showViewBankAccountsScreen = false;
            scope.clientId = scope.taskconfig['clientId'];

            function initTask(bankAccountDetailsId) {
                scope.bankAccountDetailsId = bankAccountDetailsId;
            };

            function populateDetails() {
                resourceFactory.bankAccountDetailsResource.getAll({ entityType: scope.entityType, entityId: scope.clientId, status: "active" }, function (data) {
                    scope.bankAccountDetails = data;
                    scope.bankAccountDetailsData = scope.bankAccountDetails[0];
                    scope.bankAccountDetailsId = scope.bankAccountDetailsData.id;
                    scope.showViewBankAccountsScreen = true;
                    scope.showDeactivateBankAccountsButton = true;

                });
            }
            populateDetails();

            function populateTemplateDetails() {
                resourceFactory.bankAccountDetailsTemplateResource.get({
                    entityType: scope.entityType,
                    entityId: scope.clientId
                }, function (data) {
                    scope.bankAccountTypeOptions = data.bankAccountTypeOptions;
                    scope.formData.accountTypeId = data.bankAccountTypeOptions[0].id;
                    scope.accountType.id = data.bankAccountTypeOptions[0].id;
                });
            }

            function fetchBankAccountDetails(bankAccountDetailsId) {
                resourceFactory.bankAccountDetailsResource.get({ entityType: scope.entityType, entityId: scope.clientId, bankAccountDetailsId: bankAccountDetailsId }, function (data) {
                    scope.bankAccountDetailsData = data;
                    scope.showAddBankAccountsButton = false;
                    constructBankAccountDetails();
                    initTask(bankAccountDetailsId);
                });
            };

            scope.addBankAccountDetails = function () {
                scope.formData = {};
                scope.repeatFormData = {};
                populateTemplateDetails();
                scope.showAddBankAccountsButton = false;
                scope.showAddBankAccountsScreen = true;
            };

            scope.activate = function () {
                resourceFactory.bankAccountDetailsActivateResource.activate({
                    entityType: scope.entityType,
                    entityId: scope.clientId,
                    bankAccountDetailsId: scope.bankAccountDetailsId
                }, {}, function (data) {
                    scope.showViewBankAccountsScreen = true;
                    scope.showAddBankAccountsButton = false;
                    scope.showAddBankAccountsScreen = false;
                    scope.showDeactivateBankAccountsButton = true;
                    scope.showActivateBankAccountsButton = false;
                    scope.showEditBankAccountsButton = false;
                    fetchBankAccountDetails(scope.bankAccountDetailsId);

                });
            };

            scope.edit = function () {
                scope.showActivateBankAccountsButton = false;
                scope.showEditBankAccountsButton = false;
                scope.showAddBankAccountsScreen = true;
                scope.showViewBankAccountsScreen = false;
                fetchBankAccountDetails(scope.bankAccountDetailsId);
            };

            scope.cancel = function () {
                if (!_.isUndefined(scope.bankAccountDetailsData)) {
                    scope.showAddBankAccountsButton = false;
                    refreshAndSummary();
                }
                else {
                    scope.showViewBankAccountsScreen = false;
                    scope.showAddBankAccountsButton = true;
                }
                scope.showAddBankAccountsScreen = false;
            };


            scope.deactivate = function () {
                resourceFactory.bankAccountDetailsDeActivateResource.deActivate({
                    entityType: scope.entityType,
                    entityId: scope.clientId,
                    bankAccountDetailsId: scope.bankAccountDetailsId
                }, {}, function (data) {
                    scope.showViewBankAccountsScreen = false;
                    scope.showActivateBankAccountsButton = false;
                    scope.showDeactivateBankAccountsButton = false;
                    scope.showAddBankAccountsScreen = false;
                    scope.showAddBankAccountsButton = true;
                    scope.bankAccountDetailsData = undefined;
                    scope.showEditBankAccountsButton = false;
                });
            };

            function constructBankAccountDetails() {
                scope.formData = {
                    name: scope.bankAccountDetailsData.name,
                    accountNumber: scope.bankAccountDetailsData.accountNumber,
                    ifscCode: scope.bankAccountDetailsData.ifscCode,
                    micrCode: scope.bankAccountDetailsData.micrCode,
                    mobileNumber: scope.bankAccountDetailsData.mobileNumber,
                    email: scope.bankAccountDetailsData.email,
                    bankName: scope.bankAccountDetailsData.bankName,
                    bankCity: scope.bankAccountDetailsData.bankCity,
                    branchName: scope.bankAccountDetailsData.branchName
                };
                scope.repeatFormData = {
                    accountNumberRepeat: scope.bankAccountDetailsData.accountNumber,
                    ifscCodeRepeat: scope.bankAccountDetailsData.ifscCode
                };
                scope.formData.accountTypeId = scope.bankAccountDetailsData.accountType.id;
            }

            function refreshAndSummary() {
                scope.showAddBankAccountsScreen = false;
                scope.showActivateBankAccountsButton = true;
                scope.showEditBankAccountsButton = true;
                scope.showViewBankAccountsScreen = true;
            };

            scope.submit = function () {

                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;
                if (_.isUndefined(scope.bankAccountDetailsId)) {
                    resourceFactory.bankAccountDetailsResource.create({
                        entityType: scope.entityType,
                        entityId: scope.clientId
                    }, scope.formData, function (data) {
                        scope.bankAccountDetailsId = data.resourceId;
                        fetchBankAccountDetails(scope.bankAccountDetailsId);
                        refreshAndSummary();
                    });
                } else {
                    scope.formData.locale = scope.optlang.code;
                    scope.formData.dateFormat = scope.df;
                    resourceFactory.bankAccountDetailsResource.update({
                        entityType: scope.entityType,
                        entityId: scope.clientId,
                        bankAccountDetailsId: scope.bankAccountDetailsId
                    }, scope.formData, function (data) {
                        fetchBankAccountDetails(scope.bankAccountDetailsId);
                        refreshAndSummary();

                    });
                }
            };
        }
    });
    mifosX.ng.application.controller('ClientBankAccountActivityController', ['$controller', '$scope', 'ResourceFactory', mifosX.controllers.ClientBankAccountActivityController]).run(function ($log) {
        $log.info("ClientBankAccountActivityController initialized");
    });
}(mifosX.controllers || {}));