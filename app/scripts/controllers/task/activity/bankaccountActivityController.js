(function (module) {
    mifosX.controllers = _.extend(module, {
        bankaccountActivityController: function ($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            scope.formData = {};
            scope.bankAccountData ={};

            function initTask() {
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
