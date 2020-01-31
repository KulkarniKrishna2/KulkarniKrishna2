(function (module) {
    mifosX.controllers = _.extend(module, {
        bankaccountActivityController: function ($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            scope.formData = {};
            scope.bankAccountData ={};
            scope.isBankAccountDeatilsAvailable = false;
            scope.bankhtml = "";
            scope.getBankAssociationsDetails = function (){
                resourceFactory.bankAccountDetailResources.getAll({entityType: scope.entityType,entityId: scope.entityId}, function (data) {
                        if(!_.isUndefined(data[0])){
                            scope.clientBankAccountDetailAssociationId =  data[0].bankAccountAssociationId;
                            scope.eventType = "view"; 
                        } else{
                            scope.eventType = "create";
                        } 
                        //multiple bank account activity
                        if(!_.isUndefined(scope.commonConfig) && !_.isUndefined(scope.commonConfig.bankAccount) && !_.isUndefined(scope.commonConfig.bankAccount.eventType)) {
                            scope.eventType = scope.commonConfig.bankAccount.eventType;
                        }
                         var bankAccountConfig = {bankAccount :{entityType:scope.entityType,
                                                 entityId:scope.entityId,clientBankAccountDetailAssociationId: scope.clientBankAccountDetailAssociationId,
                                                  eventType:scope.eventType}};
                        if(scope.commonConfig === undefined){
                            scope.commonConfig = {};
                        }
                        angular.extend(scope.commonConfig,bankAccountConfig); 
                        scope.isBankAccountDeatilsAvailable = true;   
                        scope.bankhtml = 'views/bankaccountdetails/common/checker_bank_account_common.html';            
                });               
            }

            function initTask() {
                scope.isTask = true;
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

                if(scope.commonConfig!=undefined && scope.commonConfig.bankAccount!=undefined && scope.commonConfig.bankAccount.bankAccountData !=undefined){
                    scope.isBankAccountDeatilsAvailable = true;
                    scope.bankhtml = 'views/bankaccountdetails/common/checker_bank_account_common.html';  
                }else {
                    scope.getBankAssociationsDetails();
                }
            };

            initTask();
        }
    });
    mifosX.ng.application.controller('bankaccountActivityController', ['$controller','$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.bankaccountActivityController]).run(function ($log) {
        $log.info("bankaccountActivityController initialized");
    });
}(mifosX.controllers || {}));
