(function (module) {
    mifosX.controllers = _.extend(module, {
        BankAccountDetailController: function (scope, routeParams, resourceFactory, location, $modal, route, $window) {

            scope.formData = {};
            scope.createDetail = true;
            scope.entityType = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            scope.bankAccountTypeOptions = [];
            resourceFactory.bankAccountDetailResource.get({entityType: routeParams.entityType,entityId: routeParams.entityId}, function (data) {
                scope.externalservices = data.externalServiceOptions;
                scope.bankAccountTypeOptions  = data.bankAccountTypeOptions;

                scope.formData = {
                    name: data.name,
                    accountNumber: data.accountNumber,
                    ifscCode: data.ifscCode,
                    bankName: data.bankName,
                    bankCity: data.bankCity,
                    mobileNumber: data.mobileNumber,
                    email: data.email,
                };
                if(data.accountType){
                    scope.formData.accountTypeId = data.accountType.id;
                }else{
                    scope.formData.accountTypeId = scope.bankAccountTypeOptions[0].id;
                }
                if(data.accountNumber) {
                    scope.createDetail = false;
                }
            });

            scope.submit = function () {
                scope.formData.locale = scope.optlang.code;
                resourceFactory.bankAccountDetailResource.create({entityType: routeParams.entityType,entityId: routeParams.entityId},this.formData, function (data) {
                    $window.history.back();
                });
            };

            scope.update = function () {
                scope.formData.locale = scope.optlang.code;
                if(this.formData.accountType) {
                    this.formData.accountTypeId = this.formData.accountType.id;
                }
                resourceFactory.bankAccountDetailResource.update({entityType: routeParams.entityType,entityId: routeParams.entityId},this.formData, function (data) {
                    $window.history.back();
                });
            };

            scope.delete = function () {
                resourceFactory.bankAccountDetailResource.delete({entityType: routeParams.entityType,entityId: routeParams.entityId}, function (data) {
                    $window.history.back();
                });
            };

            scope.cancel = function (){
                $window.history.back();
            }

        }
    });
    mifosX.ng.application.controller('BankAccountDetailController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route','$window', mifosX.controllers.BankAccountDetailController]).run(function ($log) {
        $log.info("BankAccountDetailController initialized");
    });
}(mifosX.controllers || {}));
