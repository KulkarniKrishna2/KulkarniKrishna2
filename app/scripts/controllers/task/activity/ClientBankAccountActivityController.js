(function (module) {
    mifosX.controllers = _.extend(module, {
        ClientBankAccountActivityController: function ($controller, scope, resourceFactory) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));
            scope.entityType = "clients";
            scope.formData = {};
            scope.bankAccountDetails = [];
            scope.showAddBankAccountsButton = true;
            scope.showVerifyBankAccountsButton = false;
            scope.showActivateBankAccountsButton = false;
            scope.showEditBankAccountsButton = false;
            scope.showDeactivateBankAccountsButton = false;
            scope.showAddBankAccountsScreen = false;
            scope.showViewBankAccountsScreen = false;
            scope.clientId = scope.taskconfig['clientId'];
            scope.isPennyDrop = scope.taskconfig['pennydrop'];

            function initTask(bankAccountDetailsData) {
                scope.bankAccountDetailsId = bankAccountDetailsData.id;   
                scope.showAddBankAccountsScreen = false;
                scope.showAddBankAccountsButton = false;
                scope.showViewBankAccountsScreen = true;             
                if(bankAccountDetailsData.status.id == 100 || bankAccountDetailsData.status.id == 400){
                    scope.showVerifyBankAccountsButton = true; 
                    scope.showEditBankAccountsButton = true;         
                    scope.showActivateBankAccountsButton = true;
                    scope.showAddBankAccountsButton = false;
                }
                if(bankAccountDetailsData.status.id == 200){
                    scope.showVerifyBankAccountsButton = false; 
                    scope.showEditBankAccountsButton = false; 
                    scope.showEditBankAccountsButton = false;         
                    scope.showDeactivateBankAccountsButton = true;
                    scope.showAddBankAccountsButton = false;
                }
            };

            function populateDetails() {
                resourceFactory.bankAccountDetailsResource.getAll({ entityType: scope.entityType, entityId: scope.clientId, status: "all" }, function (data) {
                    scope.bankAccountDetails = data;
                    scope.bankAccountDetailsData = null;
                    scope.bankAccountDetails.forEach(function (item, index) {
                        if(item.status.id ==200){
                            scope.bankAccountDetailsData = item;
                            initTask(scope.bankAccountDetailsData );
                            scope.showViewBankAccountsScreen = true;
                            
                        }                        
                    });
                    if(scope.bankAccountDetailsData ==undefined){
                        scope.bankAccountDetails.forEach(function (item, index) {
                            if(item.status.id ==100 || item.status.id ==400){
                                scope.bankAccountDetailsData = item;
                                initTask(scope.bankAccountDetailsData );
                                scope.showViewBankAccountsScreen = true;
                            }                        
                        });
                    }                    
                    
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
                    initTask(data);
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
                    fetchBankAccountDetails(scope.bankAccountDetailsId);

                });
            };

            scope.verify = function(){
                if(scope.bankAccountDetailsData.isVerified){
                    reverify();
                }else{
                    verify();
                }
            }

            function verify() {
                resourceFactory.bankAccountDetailsVerifyResource.verify({
                    entityType: scope.entityType,
                    entityId: scope.clientId,
                    bankAccountDetailsId: scope.bankAccountDetailsId
                }, {}, function (data) {
                    fetchBankAccountDetails(scope.bankAccountDetailsId);

                });
            };

            function reverify() { 
                resourceFactory.bankAccountDetailsReVerifyResource.reVerify({
                    entityType: scope.entityType,
                    entityId: scope.clientId,
                    bankAccountDetailsId: scope.bankAccountDetailsId
                }, {}, function (data) {
                    fetchBankAccountDetails(scope.bankAccountDetailsId);

                });
            };



            scope.edit = function () {
                scope.showActivateBankAccountsButton = false;
                scope.showEditBankAccountsButton = false;
                scope.showAddBankAccountsScreen = true;
                scope.showViewBankAccountsScreen = false;
                scope.showVerifyBankAccountsButton = false;
                constructBankAccountDetails();
            };

            scope.cancel = function () {
                if (!_.isUndefined(scope.bankAccountDetailsData)) {
                    scope.showAddBankAccountsScreen = false;
                    scope.showAddBankAccountsButton = false;
                    scope.showViewBankAccountsScreen = true;
                    refreshAndSummary();
                }
                else {
                    scope.showViewBankAccountsScreen = false;
                    scope.showAddBankAccountsButton = true;
                    scope.showAddBankAccountsScreen = false;
                }
                
            };


            scope.deactivate = function () {
                resourceFactory.bankAccountDetailsDeActivateResource.deActivate({
                    entityType: scope.entityType,
                    entityId: scope.clientId,
                    bankAccountDetailsId: scope.bankAccountDetailsId
                }, {}, function (data) {
                    populateDetails();
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
                initTask(scope.bankAccountDetailsData);
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

                    });
                }
            };
        }
    });
    mifosX.ng.application.controller('ClientBankAccountActivityController', ['$controller', '$scope', 'ResourceFactory', mifosX.controllers.ClientBankAccountActivityController]).run(function ($log) {
        $log.info("ClientBankAccountActivityController initialized");
    });
}(mifosX.controllers || {}));