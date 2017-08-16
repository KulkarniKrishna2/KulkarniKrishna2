(function (module) {
    mifosX.controllers = _.extend(module, {
        viewbankaccountActivityController: function ($controller, scope) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.bankAccountData ={};

            function initTask() {
                scope.entityType = "clients";
                scope.entityId = scope.taskconfig['clientId'];
                var bankAccountConfig = {bankAccount :{entityType:scope.entityType,
                    entityId:scope.entityId}};
                if(scope.commonConfig === undefined){
                    scope.commonConfig = {};
                }
                angular.extend(scope.commonConfig,bankAccountConfig);
            };

            initTask();
        }
    });
    mifosX.ng.application.controller('viewbankaccountActivityController', ['$controller','$scope',mifosX.controllers.viewbankaccountActivityController]).run(function ($log) {
        $log.info("viewbankaccountActivityController initialized");
    });
}(mifosX.controllers || {}));