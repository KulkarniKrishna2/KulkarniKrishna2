(function (module) {
    mifosX.controllers = _.extend(module, {
        bankaccountActivityController: function ($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.formData = {};
            scope.bankAccountData ={};
            scope.createDetail = true;
            scope.isSummary=false;


            function populateDetails(){
                resourceFactory.bankAccountDetailResource.get({entityType: scope.entityType,entityId: scope.entityId}, function (data) {
                    scope.externalservices = data.externalServiceOptions;
                    scope.bankAccountTypeOptions = data.bankAccountTypeOptions;
                    scope.formData = {
                        name: data.name,
                        accountNumber: data.accountNumber,
                        ifscCode: data.ifscCode,
                        mobileNumber: data.mobileNumber,
                        email: data.email,
                        bankName: data.bankName,
                        bankCity: data.bankCity
                    };
                    if(data.accountType){
                        scope.formData.accountTypeId = data.accountType.id;
                    }else{
                        scope.formData.accountTypeId = scope.bankAccountTypeOptions[0].id;
                    }
                    scope.bankAccountData = data;
                    if(data.accountNumber !=undefined) {
                        scope.createDetail = false;
                        scope.isSummary=true;
                    }
                });
            }

            scope.submit = function () {
                scope.formData.locale=scope.optlang.code;
                resourceFactory.bankAccountDetailResource.create({entityType: scope.entityType,entityId: scope.entityId},scope.formData,
                    function (data) {
                    populateDetails();
                    scope.createDetail = false;
                    scope.isSummary=true;
                });
            };

             scope.edit = function () {
                scope.isSummary=false;
                scope.createDetail = false;
            };

            scope.update = function () {
                scope.formData.locale = scope.optlang.code;
                resourceFactory.bankAccountDetailResource.update({entityType: scope.entityType,entityId: scope.entityId},scope.formData, function (data) {
                    populateDetails();
                });
            };

            scope.delete = function () {
                resourceFactory.bankAccountDetailResource.delete({entityType: scope.entityType,entityId: scope.entityId}, function (data) {
                    populateDetails();
                    scope.createDetail = true;
                });
            };

            scope.cancel = function (){
                $window.history.back();
            };

            function initTask() {
                scope.entityType = "clients";
                scope.entityId = scope.taskconfig['clientId'];;
                populateDetails();
            };

            initTask();
        }
    });
    mifosX.ng.application.controller('bankaccountActivityController', ['$controller','$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.bankaccountActivityController]).run(function ($log) {
        $log.info("bankaccountActivityController initialized");
    });
}(mifosX.controllers || {}));
