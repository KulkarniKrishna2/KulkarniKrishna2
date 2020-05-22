(function (module) {
    mifosX.controllers = _.extend(module, {
        bankaccountActivityController: function (scope, resourceFactory) {
            function getBankAccountDetails() {
                resourceFactory.bankAccountDetailsResource.get({ entityType: scope.entityType, entityId: scope.entityId, bankAccountDetailsId: scope.bankAccountDetailsId }, function (data) {
                    var bankAccountData = {
                        bankAccountData: {
                            entityType: scope.entityType,
                            entityId: scope.entityId, bankAccountDetailsId: scope.bankAccountDetailsId,
                            eventType: scope.eventType,
                            bankAccountDetailsData: data,
                            isAllowPennyDropTransaction: false,
                            isAllowOnlyPennyDropAction: false
                        }
                    };
                    resourceFactory.bankAccountDetailsTemplateResource.get({ entityType: scope.entityType, entityId: scope.entityId }, function (data) {
                        bankAccountData.bankAccountData.templateData = data;
                        angular.extend(scope.commonConfig, bankAccountData);
                        scope.bankhtml = 'views/bankaccountdetails/common/checker_bank_account_common.html';
                    });
                });
            }

            function initTask() {
                if(_.isUndefined(scope.viewUIConfig)){
                    scope.viewUIConfig = {};
                }
                if(_.isUndefined(scope.commonConfig)){
                    scope.commonConfig = {};
                }
                scope.viewUIConfig.isTask = true;
                if (scope.taskconfig.hasOwnProperty('entityType')) {
                    scope.entityType = scope.taskconfig['entityType'];
                    switch (scope.entityType) {
                        case "clients":
                            scope.entityId = scope.taskconfig['clientId'];
                            break;
                        case "offices":
                            scope.entityId = scope.taskconfig['officeId'];
                            break;
                        case "loans":
                            scope.entityId = scope.taskconfig['loanId'];
                            break;
                        case "savings":
                            scope.entityId = scope.taskconfig['savingsId'];
                            break;
                        case "paymentTypes":
                            scope.entityId = scope.taskconfig['paymentTypeId'];
                            break;
                    }
                } else {
                    scope.entityType = "clients";
                    scope.entityId = scope.taskconfig['clientId'];
                }
                scope.bankAccountDetailsId = scope.taskconfig['bankAccountDetailsId'];
                getBankAccountDetails();
            };
            initTask();
        }
    });
    mifosX.ng.application.controller('bankaccountActivityController', ['$scope', 'ResourceFactory', mifosX.controllers.bankaccountActivityController]).run(function ($log) {
        $log.info("bankaccountActivityController initialized");
    });
}(mifosX.controllers || {}));
