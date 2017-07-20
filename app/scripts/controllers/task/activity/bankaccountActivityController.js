(function (module) {
    mifosX.controllers = _.extend(module, {
        bankaccountActivityController: function ($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            scope.formData = {};
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


                // populateDetails();
            };

            initTask();
        }
    });
    mifosX.ng.application.controller('bankaccountActivityController', ['$controller','$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.bankaccountActivityController]).run(function ($log) {
        $log.info("bankaccountActivityController initialized");
    });
}(mifosX.controllers || {}));
