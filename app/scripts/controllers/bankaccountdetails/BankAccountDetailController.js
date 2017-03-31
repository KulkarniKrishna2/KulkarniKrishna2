(function (module) {
    mifosX.controllers = _.extend(module, {
        BankAccountDetailController: function (scope, routeParams, resourceFactory, location, $modal, route, $window, dateFilter) {

            scope.formData = {};
            scope.createDetail = true;
            scope.entityType = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            scope.bankAccountTypeOptions = [];
            scope.isBankHolderNameMandatory = false;
            scope.isBankAccountNumberMandatory = false;
            scope.isAccountTypeMandatory = false;
            scope.isIFSCCodeMandatory = false;
            scope.isBankNameMandatory = false;
            scope.isBankCityMandatory = false;
            scope.isMobileNumberMandatory = false;
            scope.isLastTransactionMandatory = false;
            scope.isLastTransactionDateHidden = true;
            scope.deFaultBankName = null;
            scope.mobileNumberPattern = null;
            scope.IFSCCodePattern = null;
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.bankAccountDetails
            && scope.response.uiDisplayConfigurations.bankAccountDetails.isMandatory){
                if(scope.response.uiDisplayConfigurations.bankAccountDetails.isMandatory.bankAccountHolderName){
                    scope.isBankHolderNameMandatory = scope.response.uiDisplayConfigurations.bankAccountDetails.isMandatory.bankAccountHolderName;
                }
                if(scope.response.uiDisplayConfigurations.bankAccountDetails.isMandatory.bankAccountNumber){
                    scope.isBankAccountNumberMandatory = scope.response.uiDisplayConfigurations.bankAccountDetails.isMandatory.bankAccountNumber;
                }
                if(scope.response.uiDisplayConfigurations.bankAccountDetails.isMandatory.accountType){
                    scope.isAccountTypeMandatory = scope.response.uiDisplayConfigurations.bankAccountDetails.isMandatory.accountType
                }
                if(scope.response.uiDisplayConfigurations.bankAccountDetails.isMandatory.bankIFSCCode){
                    scope.isIFSCCodeMandatory = scope.response.uiDisplayConfigurations.bankAccountDetails.isMandatory.bankIFSCCode;
                }
                if(scope.response.uiDisplayConfigurations.bankAccountDetails.isMandatory.bankName){
                    scope.isBankNameMandatory = scope.response.uiDisplayConfigurations.bankAccountDetails.isMandatory.bankName;
                }
                if(scope.response.uiDisplayConfigurations.bankAccountDetails.isMandatory.bankCity){
                    scope.isBankCityMandatory = scope.response.uiDisplayConfigurations.bankAccountDetails.isMandatory.bankCity;
                }
                if(scope.response.uiDisplayConfigurations.bankAccountDetails.isMandatory.mobileNumber){
                    scope.isMobileNumberMandatory = scope.response.uiDisplayConfigurations.bankAccountDetails.isMandatory.mobileNumber;
                }
                if(scope.response.uiDisplayConfigurations.bankAccountDetails.isMandatory.lastTransactionDate){
                    scope.isLastTransactionMandatory = scope.response.uiDisplayConfigurations.bankAccountDetails.isMandatory.lastTransactionDate;
                }
            }
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.bankAccountDetails
                && !scope.response.uiDisplayConfigurations.bankAccountDetails.isHiddenField.lastTransactionDate){
                scope.isLastTransactionDateHidden = scope.response.uiDisplayConfigurations.bankAccountDetails.isHiddenField.lastTransactionDate;
            }

            if(scope.responseDefaultGisData && scope.response && scope.response.uiDisplayConfigurations &&
                scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig &&
                scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.bankAccountDetails &&
                scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.bankAccountDetails.bankName &&
                scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.bankAccountDetails.bankName != ""){
                scope.deFaultBankName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.bankAccountDetails.bankName;
            }

            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.bankAccountDetails
               && scope.response.uiDisplayConfigurations.bankAccountDetails.regexValidations){
                if(scope.response.uiDisplayConfigurations.bankAccountDetails.regexValidations.mobileNumber &&
                    scope.response.uiDisplayConfigurations.bankAccountDetails.regexValidations.mobileNumber != ""){
                     scope.mobileNumberPattern = scope.response.uiDisplayConfigurations.bankAccountDetails.regexValidations.mobileNumber;
                }
                if(scope.response.uiDisplayConfigurations.bankAccountDetails.regexValidations.bankIFSCCode &&
                    scope.response.uiDisplayConfigurations.bankAccountDetails.regexValidations.bankIFSCCode != ""){
                    scope.IFSCCodePattern = scope.response.uiDisplayConfigurations.bankAccountDetails.regexValidations.bankIFSCCode;
                }
            }

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
                    email: data.email
                };
                if(!_.isUndefined(data.lastTransactionDate)){
                    scope.formData.lastTransactionDate = new Date(dateFilter(data.lastTransactionDate, scope.df));
                }
                if(!scope.formData.bankName){
                    scope.formData.bankName = scope.deFaultBankName;
                }
                if(data.accountType){
                    scope.formData.accountTypeId = data.accountType.id;
                }else{
                    scope.formData.accountTypeId = scope.bankAccountTypeOptions[0].id;
                }
                if(data.accountNumber) {
                    scope.createDetail = false;
                }
            });

            scope.mobileNumberRegex = (function() {
                var regex = eval(scope.mobileNumberPattern);
                return {
                    test: function(value) {
                        if (scope.mobileNumberPattern == null) {
                            return true;
                        } else {
                            return regex.test(value);
                        }
                    }
                };
            })();

            scope.IFSCCodeRegex = (function() {
                var regex = eval(scope.IFSCCodePattern);
                return {
                    test: function(value) {
                        if (scope.IFSCCodePattern == null) {
                            return true;
                        } else {
                            return regex.test(value);
                        }
                    }
                };
            })();



            scope.submit = function () {
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;
                if(scope.formData.lastTransactionDate) {
                    scope.formData.lastTransactionDate = dateFilter(scope.formData.lastTransactionDate, scope.df);
                }
                resourceFactory.bankAccountDetailResource.create({entityType: routeParams.entityType,entityId: routeParams.entityId},this.formData, function (data) {
                    $window.history.back();
                });
            };

            scope.update = function () {
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;
                if(scope.formData.lastTransactionDate) {
                    scope.formData.lastTransactionDate = dateFilter(scope.formData.lastTransactionDate, scope.df);
                }
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
    mifosX.ng.application.controller('BankAccountDetailController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route','$window','dateFilter', mifosX.controllers.BankAccountDetailController]).run(function ($log) {
        $log.info("BankAccountDetailController initialized");
    });
}(mifosX.controllers || {}));
