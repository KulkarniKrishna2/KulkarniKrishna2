(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewBankAccountCommonController: function ($controller, scope,  resourceFactory,API_VERSION,$rootScope,$http) {
            angular.extend(this, $controller('defaultUIConfigController', {$scope: scope,$key:"bankAccountDetails"}));
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));

            scope.viewConfig = {
                showSummary:false,
                hasData:false
            };
            scope.bankAccountData = {};
            scope.docData = {};
            scope.repeatFormData = {};
            scope.bankAccountTypeOptions = [];
            scope.deFaultBankName = null;
            scope.data=false;
            var bankAccountDetailStatus_active=200;

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
                    if(scope.bankAccountData.status!=undefined && scope.bankAccountData.status.id == bankAccountDetailStatus_active){
                        scope.data=true;
                        scope.viewConfig.showSummary= true;
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

            function init() {
                populateDetails();
            }

            init();

        }
    });
    mifosX.ng.application.controller('ViewBankAccountCommonController', ['$controller','$scope', 'ResourceFactory','API_VERSION', '$rootScope', '$http',mifosX.controllers.ViewBankAccountCommonController]).run(function ($log) {
        $log.info("ViewBankAccountCommonController initialized");
    });
}(mifosX.controllers || {}));
