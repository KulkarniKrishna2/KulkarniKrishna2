(function (module) {
    mifosX.controllers = _.extend(module, {
        ReviewBankAccountCommonController: function ($controller, scope, routeParams, resourceFactory, location, $modal, route, $window, dateFilter,$upload,$rootScope,API_VERSION,$http) {
            angular.extend(this, $controller('defaultUIConfigController', {$scope: scope,$key:"bankAccountDetails"}));
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));

            scope.viewConfig = {
                showSummary:false,
                hasData:false
            };
            scope.formData = {};
            scope.checkerBankAccountData = {};
            scope.bankAccountData = {};
            scope.docData = {};
            scope.repeatFormData = {};
            scope.bankAccountTypeOptions = [];
            scope.deFaultBankName = null;

            function getEntityType(){
               return scope.commonConfig.bankAccount.entityType;
            }

            function getEntityId(){
                return scope.commonConfig.bankAccount.entityId;
            }

            function populateDetails(){
                resourceFactory.bankAccountDetailResource.get({entityType: getEntityType(),entityId: getEntityId()}, function (data) {
                    scope.externalservices = data.externalServiceOptions;
                    scope.bankAccountTypeOptions = data.bankAccountTypeOptions;
                    scope.bankAccountData = data;
                    if(scope.bankAccountData.status.id == 200){
                        scope.viewConfig.showSummary= true;
                    }
                    if(data.checkerInfo!=undefined){
                        scope.checkerBankAccountData = JSON.parse(data.checkerInfo);
                        if(scope.checkerBankAccountData.accountType){
                            scope.formData.accountTypeId = scope.checkerBankAccountData.accountType.id;
                        }else{
                            scope.formData.accountTypeId = scope.bankAccountTypeOptions[0].id;
                        }
                        scope.repeatFormData = {
                            accountNumberRepeat:  scope.checkerBankAccountData.accountNumber,
                            ifscCodeRepeat:  scope.checkerBankAccountData.ifscCode
                        };
                        if(scope.checkerBankAccountData.accountNumber !=undefined) {
                            scope.viewConfig.hasData = true;
                        }
                    }


                    if(!_.isUndefined(data.documentId)){
                        $http({
                            method: 'GET',
                            url: $rootScope.hostUrl + API_VERSION + '/clients/' + getEntityId() + '/documents/' + data.documentId + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier
                        }).then(function (docsData) {
                            scope.documentImg = $rootScope.hostUrl + API_VERSION + '/clients/' + getEntityId() + '/documents/' + data.documentId + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                        });
                    }

                });
            }

            scope.submit = function () {
                if(!isFormValid()){
                    return false;
                }
                delete scope.errorDetails;
                resourceFactory.bankAccountDetailActionResource.doAction({entityType: getEntityType(),entityId: getEntityId(),command:'activate'},scope.formData,
                    function (data) {
                        scope.viewConfig.showSummary=true;
                    }
                );
            };

            function isFormValid(){
                scope.errorDetails = [];
                var errorObj = new Object();
                errorObj.args = {
                    params: []
                };
                var isBankDetailsNotMatched = false;
                var isBothNameNotMatched = true;
                if(scope.bankAccountData.name && scope.checkerBankAccountData.name){
                    if(scope.bankAccountData.name.toString() === scope.checkerBankAccountData.name.toString()){
                        isBothNameNotMatched = false;
                    }
                }
                if(isBothNameNotMatched){
                    isBankDetailsNotMatched = true;
                    errorObj.args.params.push({value: 'error.msg.maker.checker.bank.account.name.not.matched'});
                    scope.errorDetails.push(errorObj);
                }

                var isAccountNumberNotMatched = true;
                if(scope.bankAccountData.accountNumber && scope.checkerBankAccountData.accountNumber){
                    if(scope.bankAccountData.accountNumber.toString() === scope.checkerBankAccountData.accountNumber.toString()){
                        isAccountNumberNotMatched = false;
                    }
                }
                if(isAccountNumberNotMatched){
                    isBankDetailsNotMatched = true;
                    errorObj.args.params.push({value: 'error.msg.maker.checker.bank.account.number.not.matched'});
                    scope.errorDetails.push(errorObj);
                }

                var isAccountTypeNotMatched = true;
                if(scope.bankAccountData.accountType.code && scope.checkerBankAccountData.accountType.code){
                    if(scope.bankAccountData.accountType.code.toString() === scope.checkerBankAccountData.accountType.code.toString()){
                        isAccountTypeNotMatched = false;
                    }
                }
                if(isAccountTypeNotMatched){
                    isBankDetailsNotMatched = true;
                    errorObj.args.params.push({value: 'error.msg.maker.checker.bank.account.type.not.matched'});
                    scope.errorDetails.push(errorObj);
                }

                var isIfscCodeNotMatched = true;
                if(scope.bankAccountData.ifscCode && scope.checkerBankAccountData.ifscCode){
                    if(scope.bankAccountData.ifscCode.toString() === scope.checkerBankAccountData.ifscCode.toString()){
                        isIfscCodeNotMatched = false;
                    }
                }
                if(isIfscCodeNotMatched){
                    isBankDetailsNotMatched = true;
                    errorObj.args.params.push({value: 'error.msg.maker.checker.bank.account.ifsc.code.not.matched'});
                    scope.errorDetails.push(errorObj);
                }

                var isBankNameNotMatched = true;
                if(scope.bankAccountData.bankName && scope.checkerBankAccountData.bankName){
                    if(scope.bankAccountData.bankName.toString() === scope.checkerBankAccountData.bankName.toString()){
                        isBankNameNotMatched = false;
                    }
                }
                if(isBankNameNotMatched){
                    isBankDetailsNotMatched = true;
                    errorObj.args.params.push({value: 'error.msg.maker.checker.bank.name.not.matched'});
                    scope.errorDetails.push(errorObj);
                }

                var isBranchNameNotMatched = true;
                if(scope.bankAccountData.branchName && scope.checkerBankAccountData.branchName){
                    if(scope.bankAccountData.branchName.toString() === scope.checkerBankAccountData.branchName.toString()){
                        isBranchNameNotMatched = false;
                    }
                }
                if(isBranchNameNotMatched){
                    isBankDetailsNotMatched = true;
                    errorObj.args.params.push({value: 'error.msg.maker.checker.bank.branch.name.not.matched'});
                    scope.errorDetails.push(errorObj);
                }

                var isBankCityNotMatched = true;
                if(scope.bankAccountData.bankCity && scope.checkerBankAccountData.bankCity){
                    if(scope.bankAccountData.bankCity.toString() === scope.checkerBankAccountData.bankCity.toString()){
                        isBankCityNotMatched = false;
                    }
                }
                if(isBankCityNotMatched){
                    isBankDetailsNotMatched = true;
                    errorObj.args.params.push({value: 'error.msg.maker.checker.bank.city.name.not.matched'});
                    scope.errorDetails.push(errorObj);
                }
                if(isBankDetailsNotMatched){
                    return false;
                }
                if(scope.formData.name && scope.formData.accountNumber && scope.formData.accountType && scope.formData.ifscCode
                    && scope.formData.bankName && scope.formData.branchName && scope.formData.bankCity){
                    return true;
                }else{
                    return false;
                }
            }

            function init() {
                populateDetails();
            }

            init();

        }
    });
    mifosX.ng.application.controller('ReviewBankAccountCommonController', ['$controller','$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route','$window','dateFilter','$upload', '$rootScope','API_VERSION', '$http',mifosX.controllers.ReviewBankAccountCommonController]).run(function ($log) {
        $log.info("ReviewBankAccountCommonController initialized");
    });
}(mifosX.controllers || {}));
