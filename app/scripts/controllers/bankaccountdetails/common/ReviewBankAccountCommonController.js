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
                resourceFactory.bankAccountDetailActionResource.doAction({entityType: getEntityType(),entityId: getEntityId(),command:'activate'},scope.formData,
                    function (data) {
                        scope.viewConfig.showSummary=true;
                    }
                );
            };

            function isFormValid(){
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
