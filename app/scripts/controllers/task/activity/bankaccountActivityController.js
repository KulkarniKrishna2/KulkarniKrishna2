(function (module) {
    mifosX.controllers = _.extend(module, {
        bankaccountActivityController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {

            scope.formData = {};
            scope.createDetail = true;


            function populateDetails(){
                resourceFactory.bankAccountDetailResource.get({entityType: scope.entityType,entityId: scope.entityId}, function (data) {
                    scope.externalservices = data.externalServiceOptions;
                    scope.formData = {
                        name: data.name,
                        accountNumber: data.accountNumber,
                        ifscCode: data.ifscCode,
                        mobileNumber: data.mobileNumber,
                        email: data.email
                    };
                    if(data.accountNumber) {
                        scope.createDetail = false;
                    }
                });
            }

            scope.submit = function () {
                resourceFactory.bankAccountDetailResource.create({entityType: scope.entityType,entityId: scope.entityId},this.formData, function (data) {
                    populateDetails();
                });
            };

            scope.update = function () {
                resourceFactory.bankAccountDetailResource.update({entityType: scope.entityType,entityId: scope.entityId},this.formData, function (data) {
                    populateDetails();
                });
            };

            scope.delete = function () {
                resourceFactory.bankAccountDetailResource.delete({entityType: scope.entityType,entityId: scope.entityId}, function (data) {
                    populateDetails();
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
    mifosX.ng.application.controller('bankaccountActivityController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.bankaccountActivityController]).run(function ($log) {
        $log.info("bankaccountActivityController initialized");
    });
}(mifosX.controllers || {}));
