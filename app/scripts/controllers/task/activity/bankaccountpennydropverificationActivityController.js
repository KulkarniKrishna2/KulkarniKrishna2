(function (module) {
    mifosX.controllers = _.extend(module, {
        bankaccountpennydropverificationActivityController: function (scope, resourceFactory) {
            function getBankAccountDetails() {
                resourceFactory.bankAccountDetailsResource.get({ entityType: scope.entityType, entityId: scope.entityId, bankAccountDetailsId: scope.bankAccountDetailsId }, function (data) {
                    var bankAccountData = {
                        bankAccountData: {
                            entityType: scope.entityType,
                            entityId: scope.entityId, bankAccountDetailsId: scope.bankAccountDetailsId,
                            eventType: scope.eventType,
                            bankAccountDetailsData: data.result,
                            allowOnlyPennyDropTransaction: true
                        }
                    };
                    angular.extend(scope.commonConfig, bankAccountData);
                });
            }

            function initTask() {
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
    mifosX.ng.application.controller('bankaccountpennydropverificationActivityController', ['$scope', 'ResourceFactory', mifosX.controllers.bankaccountpennydropverificationActivityController]).run(function ($log) {
        $log.info("bankaccountpennydropverificationActivityController initialized");
    });
}(mifosX.controllers || {}));