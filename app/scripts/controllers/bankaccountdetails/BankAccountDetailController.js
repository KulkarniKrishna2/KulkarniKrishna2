(function (module) {
    mifosX.controllers = _.extend(module, {
        BankAccountDetailController: function (scope, routeParams, resourceFactory) {
            scope.entityType = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            scope.clientId = routeParams.entityId;
            scope.bankAccountDetailsId = routeParams.bankAccountDetailsId;
            scope.viewUIConfig = {
                "isInitiated": false,
                "isTask": false,
            };

            function init() {
                scope.commonConfig = {};
                var isWorkFlowEnabled = scope.isSystemGlobalConfigurationEnabled(scope.globalConstants.WORK_FLOW);
                scope.isDefaultPennyDropTransactionPaymentTypeId = scope.isSystemGlobalConfigurationEnabled(scope.globalConstants.DEFAULT_PENNY_DROP_TRANSACTION_PAYMENT_TYPE_ID);
                if (isWorkFlowEnabled) {
                    getWorkflow();
                } else {
                    getBankAccountDetails();
                }
            }
            init();

            function getBankAccountDetails() {
                resourceFactory.bankAccountDetailsTemplateResource.get({
                    entityType: scope.entityType,
                    entityId: scope.entityId
                }, function (templateData) {
                    var templateData = templateData.result;
                    resourceFactory.bankAccountDetailsResource.get({
                        entityType: scope.entityType,
                        entityId: scope.entityId,
                        bankAccountDetailsId: scope.bankAccountDetailsId
                    }, function (data) {
                        data = data.result;
                        var bankAccountData = {
                            bankAccountData: {
                                entityId: scope.entityId,
                                entityType: scope.entityType,
                                bankAccountDetailsId: scope.bankAccountDetailsId,
                                templateData: templateData,
                                bankAccountDetailsData: data
                            }
                        }
                        angular.extend(scope.commonConfig, bankAccountData);
                        scope.viewUIConfig.isInitiated = true;
                    });
                });
            }

            function getWorkflow() {
                resourceFactory.bankAccountDetailsWorkflowResource.get({
                    entityType: scope.entityType,
                    entityId: scope.entityId,
                    bankAccountDetailsId: scope.bankAccountDetailsId
                }, function (data) {
                    var bankWorkflowData = data.result;
                    if (bankWorkflowData != undefined && bankWorkflowData.id != undefined) {
                        if (bankWorkflowData.status.id != 7) {
                            scope.viewUIConfig.isTask = true;
                            var taskConfig = {
                                taskData: {
                                    id: bankWorkflowData.id,
                                    embedded: true,
                                    template: bankWorkflowData
                                }
                            };
                            angular.extend(scope.commonConfig, taskConfig);
                            scope.viewUIConfig.isInitiated = true;
                        }
                    }
                    if(!scope.viewUIConfig.isTask){
                        getBankAccountDetails();
                    }
                });
            }
        }
    });
    mifosX.ng.application.controller('BankAccountDetailController', ['$scope', '$routeParams', 'ResourceFactory', mifosX.controllers.BankAccountDetailController]).run(function ($log) {
        $log.info("BankAccountDetailController initialized");
    });
}(mifosX.controllers || {}));