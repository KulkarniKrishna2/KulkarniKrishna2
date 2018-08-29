(function (module) {
    mifosX.controllers = _.extend(module, {
        CreatePaymentTypeController: function (scope, routeParams, resourceFactory, location, $modal, route) {

            scope.formData = {};
            scope.isCashPayment =true;
            scope.paymentModeOptions = [];
            scope.applicableOnOptions = [];
            scope.serviceProviderOptions = [];
            scope.showServiceProvider = false;
            scope.realTimeApiModeValue = 1; 
            scope.fileBasedModeValue = 2; 
            scope.manualModeValue = 3; 
            scope.repaymentAllowedValue = 1;
            scope.disbursementAllowedValue = 2;
            scope.bothAllowedValue = 3;
            scope.showIsCash = true;
            scope.showExternalServices = false;
            scope.showPaymentModeOptions = false;


            resourceFactory.paymentTypeResource.get({resourceType: 'template'}, function (data) {
                scope.paymentModeOptions = data.paymentModeOptions;
                scope.applicableOnOptions = data.applicableOnOptions;
                scope.externalservices = data.externalServiceOptions;
                scope.serviceProviderOptions = data.serviceProviderOptions;
                if(scope.externalservices){
                    scope.formData.bankAccountDetails = {};
                    scope.formData.bankAccountDetails.locale = scope.optlang.code;
                }
                scope.bankAccountTypeOptions  = data.bankAccountTypeOptions;
                scope.defaultValueDateTypeOptions = data.defaultValueDateTypeOptions;
            });
 
            scope.changePaymentMode = function(paymentMode){     
                    scope.showPaymentModeOptions = true;  
                    scope.showServiceProvider = false;
                    scope.formData.serviceProvider = undefined;                    
                    scope.formData.isCashPayment = false;
                    scope.showIsCash = true;
                    scope.formData.applicableOn = scope.bothAllowedValue;
                    if(paymentMode==scope.realTimeApiModeValue){
                        scope.formData.applicableOn = scope.disbursementAllowedValue;
                        scope.formData.isCashPayment = false;
                        scope.showIsCash = false;
                        scope.showExternalServices = true;
                    }else if(paymentMode==scope.fileBasedModeValue){
                        scope.showServiceProvider = true;
                        scope.showExternalServices = false;
                        scope.formData.externalServiceId = undefined;
                    }else if(paymentMode==scope.manualModeValue){
                        scope.showExternalServices = false;
                        scope.formData.externalServiceId = undefined;
                    }else{                        
                        scope.showExternalServices = true;
                        scope.showPaymentModeOptions = false;
                        scope.formData.applicableOn = undefined;
                    }
            };



            scope.showBankDetails = function(){
                return scope.formData.externalServiceId || (!scope.formData.isCashPayment && (scope.formData.paymentMode==scope.manualModeValue));
            };

            scope.submit = function () {
                this.formData.isCashPayment = this.formData.isCashPayment || false;
                this.formData.locale = scope.optlang.code;
                 if(!scope.showBankDetails()){
                    delete  this.formData.bankAccountDetails;
                }
                if(scope.formData.paymentMode!=scope.fileBasedModeValue){
                    this.formData.serviceProvider =  undefined;
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
