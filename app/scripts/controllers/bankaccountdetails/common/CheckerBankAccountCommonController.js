(function (module) {
    mifosX.controllers = _.extend(module, {
        CheckerBankAccountCommonController: function ($controller, scope, routeParams, resourceFactory, location, $modal, route, $window, dateFilter,$upload,$rootScope,API_VERSION,$http) {
            angular.extend(this, $controller('defaultUIConfigController', {$scope: scope,$key:"bankAccountDetails"}));
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));

            scope.viewConfig = {
                showSummary:false,
                hasData:false
            };
            scope.formData = {};
            scope.checkerBankAccountData = {};
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

            function underTask(){
                return scope.commonConfig.bankAccount.isTask;
            }

            if(scope.responseDefaultGisData && scope.response && scope.response.uiDisplayConfigurations &&
                scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig &&
                scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.bankAccountDetails &&
                scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.bankAccountDetails.bankName &&
                scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.bankAccountDetails.bankName != ""){
                scope.deFaultBankName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.bankAccountDetails.bankName;
            }

            function populateDetails(){
                resourceFactory.bankAccountDetailResource.get({entityType: getEntityType(),entityId: getEntityId()}, function (data) {
                    scope.externalservices = data.externalServiceOptions;
                    scope.bankAccountTypeOptions = data.bankAccountTypeOptions;
                    if(data.checkerInfo!=undefined){
                        scope.checkerBankAccountData = JSON.parse(data.checkerInfo);
                        scope.formData = {
                            name: scope.checkerBankAccountData.name,
                            accountNumber: scope.checkerBankAccountData.accountNumber,
                            ifscCode: scope.checkerBankAccountData.ifscCode,
                            micrCode: scope.checkerBankAccountData.micrCode,
                            mobileNumber: scope.checkerBankAccountData.mobileNumber,
                            email: scope.checkerBankAccountData.email,
                            bankName: scope.checkerBankAccountData.bankName,
                            bankCity: scope.checkerBankAccountData.bankCity,
                            branchName: scope.checkerBankAccountData.branchName
                        };
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
                            scope.viewConfig.showSummary = true;
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
                resourceFactory.bankAccountDetailActionResource.doAction({entityType: getEntityType(),entityId: getEntityId(),command:'updateCheckerInfo'},scope.formData,
                    function (data) {
                        populateDetails();
                        scope.viewConfig.showSummary=true;
                    }
                );
            };

            function isFormValid(){
                if(!scope.isElemHidden('bankIFSCCodeRepeat')){
                    if(scope.formData.ifscCode != scope.repeatFormData.ifscCodeRepeat){
                        return false;
                    }
                }
                if(!scope.isElemHidden('bankAccountNumberRepeat')){
                    if(scope.formData.accountNumber != scope.repeatFormData.accountNumberRepeat){
                        return false;
                    }
                }
                return true;
            }

            scope.edit = function () {
                scope.viewConfig.showSummary=false;
            };

            scope.update = function () {
                scope.submit();

            };

            scope.editable = function(){
                if(scope.isTask){
                    return !scope.isTaskCompleted();
                }
                return true;
            };

            scope.cancel = function (){
                if(scope.viewConfig.hasData){
                    scope.viewConfig.showSummary=true;
                }
            };

            function init() {
                populateDetails();
            }

            init();

        }
    });
    mifosX.ng.application.controller('CheckerBankAccountCommonController', ['$controller','$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route','$window','dateFilter','$upload', '$rootScope','API_VERSION', '$http',mifosX.controllers.CheckerBankAccountCommonController]).run(function ($log) {
        $log.info("CheckerBankAccountCommonController initialized");
    });
}(mifosX.controllers || {}));
