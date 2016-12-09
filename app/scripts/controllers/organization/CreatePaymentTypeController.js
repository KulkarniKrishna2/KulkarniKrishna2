(function (module) {
    mifosX.controllers = _.extend(module, {
        CreatePaymentTypeController: function (scope, routeParams, resourceFactory, location, $modal, route) {

            scope.formData = {};
            scope.isCashPayment =true;

            resourceFactory.paymentTypeResource.get({resourceType: 'template'}, function (data) {
                scope.externalservices = data.externalServiceOptions;
                if(scope.externalservices){
                    scope.formData.bankAccountDetails = {};
                }
            });


            scope.submit = function () {
                this.formData.isCashPayment = this.formData.isCashPayment || false;
                if(this.formData.externalServiceId == undefined || this.formData.externalServiceId == null ){
                    delete  this.formData.bankAccountDetails;
                }
                resourceFactory.paymentTypeResource.save(this.formData, function (data) {
                    location.path('/viewpaymenttype/');
                });
            };

        }
    });
    mifosX.ng.application.controller('CreatePaymentTypeController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', mifosX.controllers.CreatePaymentTypeController]).run(function ($log) {
        $log.info("CreatePaymentTypeController initialized");
    });
}(mifosX.controllers || {}));
