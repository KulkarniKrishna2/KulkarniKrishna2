(function (module) {
    mifosX.controllers = _.extend(module, {
        BankAccountDetailController: function (scope, routeParams, resourceFactory) {
            scope.entityType = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            scope.clientId = routeParams.entityId;
            scope.bankAccountDetailsId = routeParams.bankAccountDetailsId;
            scope.viewUIConfig = {
                "isInitiated": false
            };

            function init() {
                scope.commonConfig = {};
                getBankAccountDetails();
            }
            init();

            function getBankAccountDetails() {
                resourceFactory.bankAccountDetailsTemplateResource.get({
                    entityType: scope.entityType,
                    entityId: scope.entityId
                }, function (templateData) {
                    resourceFactory.bankAccountDetailsResource.get({
                        entityType: scope.entityType,
                        entityId: scope.entityId,
                        bankAccountDetailsId: scope.bankAccountDetailsId
                    }, function (data) {
                        var bankAccountData = {
                            bankAccountData: {
                                entityId: scope.entityId,
                                entityType: scope.entityType,
                                bankAccountDetailsId: scope.bankAccountDetailsId,
                                templateData: templateData,
                                bankAccountDetailsData: data,
                                isAllowPennyDropTransaction: scope.isSystemGlobalConfigurationEnabled(scope.globalConstants.DEFAULT_PENNY_DROP_TRANSACTION_PAYMENT_TYPE_ID),
                                isAllowOnlyPennyDropAction: false
                            }
                        };
                        angular.extend(scope.commonConfig, bankAccountData);

                        if (scope.isSystemGlobalConfigurationEnabled(scope.globalConstants.WORK_FLOW)) {
                            if(data.status.value === 'initiated'){
                                getWorkflow();
                            }else{
                                isTask(false);
                                initiateUIDisplay();
                            }
                        }else{
                            isTask(false);
                            initiateUIDisplay();
                        }
                    });
                });
            }

            function initiateUIDisplay(){
                scope.viewUIConfig.isInitiated = true;
            }

            function isTask(isTask){
                scope.viewUIConfig.isTask = isTask;
            }

            function getWorkflow() {
                resourceFactory.bankAccountDetailsWorkflowResource.get({
                    entityType: scope.entityType,
                    entityId: scope.entityId,
                    bankAccountDetailsId: scope.bankAccountDetailsId
                }, function (data) {
                    var bankWorkflowData = data;
                    if (bankWorkflowData != undefined && bankWorkflowData.id != undefined) {
                        if (bankWorkflowData.status.id != 7) {
                            var taskConfig = {
                                taskData: {
                                    id: bankWorkflowData.id,
                                    embedded: true,
                                    template: bankWorkflowData
                                }
                            };
                            angular.extend(scope.commonConfig, taskConfig);
                            isTask(true);
                            initiateUIDisplay();
                        }
                    }
                    if(_.isUndefined(scope.viewUIConfig.isTask) || !scope.viewUIConfig.isTask){
                        isTask(false);
                        initiateUIDisplay();
                    }
                });
            }
        }
    });
    mifosX.ng.application.controller('BankAccountDetailController', ['$scope', '$routeParams', 'ResourceFactory', mifosX.controllers.BankAccountDetailController]).run(function ($log) {
        $log.info("BankAccountDetailController initialized");
    });
}(mifosX.controllers || {}));