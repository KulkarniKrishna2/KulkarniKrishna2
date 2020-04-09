(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateBankAccountDetailController: function (scope, routeParams, resourceFactory) {
            scope.entityType = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            scope.clientId = routeParams.entityId;
            scope.eventType = "create";
            scope.viewUIConfig = {};
            scope.viewUIConfig.isInitiated = false;
            if (scope.commonConfig === undefined) {
                scope.commonConfig = {};
            }
            resourceFactory.bankAccountDetailsTemplateResource.get({ entityType: scope.entityType, entityId: scope.entityId }, function (templateData) {
                var bankAccountData = {
                    bankAccountData: {
                        entityType: scope.entityType,
                        entityId: scope.entityId,
                        eventType: scope.eventType,
                        templateData: templateData
                    }
                };
                angular.extend(scope.commonConfig, bankAccountData);
                scope.viewUIConfig.isInitiated = true;
            });
        }
    });
    mifosX.ng.application.controller('CreateBankAccountDetailController', ['$scope', '$routeParams', 'ResourceFactory', mifosX.controllers.CreateBankAccountDetailController]).run(function ($log) {
        $log.info("CreateBankAccountDetailController initialized");
    });
}(mifosX.controllers || {}));