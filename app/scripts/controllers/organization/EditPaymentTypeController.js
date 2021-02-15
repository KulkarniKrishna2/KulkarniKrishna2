(function (module) {
    mifosX.controllers = _.extend(module, {
        EditPaymentTypeController: function (scope, routeParams, resourceFactory, location, $modal, route) {


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
            scope.formData = {};
            scope.bankAccountHolderNameReadOnly = false;
            scope.bankAccountAccountNumberReadOnly = false;

            resourceFactory.paymentTypeResource.get({paymentTypeId: routeParams.id,template: 'true'}, function (data) {
                scope.externalservices = data.externalServiceOptions;
                scope.applicableOnOptions = data.applicableOnOptions;
                scope.paymentModeOptions = data.paymentModeOptions;
                scope.serviceProviderOptions = data.serviceProviderOptions;
                scope.defaultValueDateTypeOptions = data.defaultValueDateTypeOptions;

                scope.bankAccountTypeOptions = data.bankAccountTypeOptions;
                scope.formData = {
                    name: data.name,
                    description: data.description,
                    isCashPayment: data.isCashPayment,
                    position : data.position,
                    externalServiceId:data.externalServiceId,
                    bankAccountDetails:data.bankAccountDetails
                };
                if(data.paymentMode != undefined){
                    scope.formData.paymentMode = data.paymentMode.id;
                    scope.showPaymentModeOptions = true;
                    if(scope.formData.paymentMode==scope.realTimeApiModeValue){
                        scope.formData.applicableOn = scope.disbursementAllowedValue;
                        scope.formData.isCashPayment = false;
                        scope.showIsCash = false;
                        scope.showExternalServices = true;
                    }else if(scope.formData.paymentMode==scope.fileBasedModeValue){
                        scope.showServiceProvider = true;
                        scope.showExternalServices = false;
                    }else if(scope.formData.paymentMode==scope.manualModeValue){
                        scope.showExternalServices = false;
                    }else{
                        scope.showExternalServices = true;
                        scope.showPaymentModeOptions = false;
                        scope.formData.applicableOn = undefined;
                    }
                }
                if(data.applicableOn != undefined){
                    scope.formData.applicableOn = data.applicableOn.id;
                }
                if(data.serviceProvider != undefined){
                    scope.formData.serviceProvider = data.serviceProvider.id;
                }
                if(data.bankAccountDetails){
                    if(data.bankAccountDetails.name){
                        scope.bankAccountHolderNameReadOnly = true;
                    }
                    if(data.bankAccountDetails.accountNumber){
                        scope.bankAccountAccountNumberReadOnly = true;
                    }
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
                }
                if (!_.isUndefined(data.defaultValueDateType)) {
                    scope.formData.defaultValueDateType = data.defaultValueDateType.id;
                }
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
                        scope.showServiceProvider = true;
                    }else if(paymentMode==scope.fileBasedModeValue){
                        scope.showServiceProvider = true;
                        scope.formData.externalServiceId = undefined;
                        scope.showExternalServices = false;
                    }else if(paymentMode==scope.manualModeValue){
                        scope.formData.externalServiceId = undefined;
                        scope.showExternalServices = false;
                    }else{
                        scope.showExternalServices = true;
                        scope.showPaymentModeOptions = false;
                        scope.formData.applicableOn = undefined;
                    }
            };

             scope.showBankDetails = function(){
                var externalService = _.find(scope.externalservices, function (type) {
                    return type.id === scope.formData.externalServiceId;
                });
                if(!_.isUndefined(externalService) && externalService.type.id === 5){
                    return false;
                }
                return scope.formData.externalServiceId || (!scope.formData.isCashPayment && (scope.formData.paymentMode==scope.manualModeValue));
            };

            scope.submit = function () {
                this.formData.isCashPayment = this.formData.isCashPayment || false;
                this.formData.locale = scope.optlang.code;
                if(!scope.showBankDetails()){
                    delete  this.formData.bankAccountDetails;
                } else {
                    this.formData.bankAccountDetails.locale = scope.optlang.code;
                }
                if(scope.formData.paymentMode!=scope.fileBasedModeValue ||scope.formData.serviceProvider == 0){
                    this.formData.serviceProvider =  undefined;
                }
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
