(function (module) {
    mifosX.controllers = _.extend(module, {
        EditPaymentTypeController: function (scope, routeParams, resourceFactory, location, $modal, route) {
/*
            scope.formData = {};*/

            resourceFactory.paymentTypeResource.get({paymentTypeId: routeParams.id,template: 'true'}, function (data) {
                scope.externalservices = data.externalServiceOptions;
                scope.bankAccountTypeOptions = data.bankAccountTypeOptions;
                scope.formData = {
                    name: data.name,
                    description: data.description,
                    isCashPayment: data.isCashPayment,
                    position : data.position,
                    externalServiceId:data.externalServiceId,
                    bankAccountDetails:data.bankAccountDetails
                };
                if(data.bankAccountDetails){
                    scope.formData.bankAccountDetails = {
                        name: data.bankAccountDetails.name,
                        accountNumber: data.bankAccountDetails.accountNumber,
                        ifscCode: data.bankAccountDetails.ifscCode,
                        bankName: data.bankAccountDetails.bankName,
                        bankCity: data.bankAccountDetails.bankCity,
                        mobileNumber: data.bankAccountDetails.mobileNumber,
                        email: data.bankAccountDetails.email
                    };
                    if(data.bankAccountDetails.accountType){
                        scope.formData.bankAccountDetails.accountTypeId = data.bankAccountDetails.accountType.id;
                    };
                    scope.formData.bankAccountDetails.locale = scope.optlang.code;
                }
            });

            scope.submit = function () {
                this.formData.isCashPayment = this.formData.isCashPayment || false;
                resourceFactory.paymentTypeResource.update({paymentTypeId: routeParams.id},this.formData, function (data) {
                    location.path('/viewpaymenttype/');
                });
            };

        }
    });
    mifosX.ng.application.controller('EditPaymentTypeController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', mifosX.controllers.EditPaymentTypeController]).run(function ($log) {
        $log.info("EditPaymentTypeController initialized");
    });
}(mifosX.controllers || {}));
