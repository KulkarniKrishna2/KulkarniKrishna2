(function (module) {
    mifosX.controllers = _.extend(module, {
        CheckerBankAccountCommonController: function ($controller, scope, routeParams, resourceFactory, location, $modal, route, $window, dateFilter,$upload,$rootScope,API_VERSION,$http,commonUtilService,$sce) {
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
            scope.bankAccountDocuments = [];

            function getEntityType(){
               return scope.entityType || scope.commonConfig.bankAccount.entityType;
            }

            function getEntityId(){
                return scope.entityId || scope.commonConfig.bankAccount.entityId;
            }

            function getClientBankAccountDetailAssociationId(){
                return scope.clientBankAccountDetailAssociationId || scope.commonConfig.bankAccount.clientBankAccountDetailAssociationId;
            }

            function getClientBankAccountDetailData(){
                return scope.commonConfig.bankAccount.bankAccountData;
            }

            function setClientBankAccountDetailAssociationId(){
                if(routeParams.clientBankAccountDetailAssociationId){
                    scope.clientBankAccountDetailAssociationId = routeParams.clientBankAccountDetailAssociationId;
                }
                else {
                    scope.clientBankAccountDetailAssociationId = scope.commonConfig.bankAccount.clientBankAccountDetailAssociationId;
                }
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

            function processBankAccountData(data){
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
                        scope.formData.accountType = scope.bankAccountTypeOptions[scope.bankAccountTypeOptions.findIndex(x => x.id==scope.checkerBankAccountData.accountType.id)];
                    }else{
                        scope.formData.accountTypeId = scope.bankAccountTypeOptions[0].id;
                        scope.formData.accountType = scope.bankAccountTypeOptions[0];
                    }
                    scope.repeatFormData = {
                        accountNumberRepeat:  scope.checkerBankAccountData.accountNumber,
                        ifscCodeRepeat:  scope.checkerBankAccountData.ifscCode
                    };
                    if(scope.checkerBankAccountData.accountNumber !=undefined) {
                        scope.viewConfig.hasData = true;
                        scope.viewConfig.showSummary = true;
                    }
                }else{
                   scope.formData.accountType = scope.bankAccountTypeOptions[0]; 
                }
                
                if(!_.isUndefined(data.bankAccountDocuments)){
                    scope.bankAccountDocuments = data.bankAccountDocuments;
                    for (var i = 0; i < scope.bankAccountDocuments.length; i++) {
                        var docs = {};
                        docs = $rootScope.hostUrl + API_VERSION + '/' + getEntityType() + '/' + getEntityId() + '/documents/' + scope.bankAccountDocuments[i].id + '/download';
                        scope.bankAccountDocuments[i].docUrl = docs;
                    }
                    scope.viewDocument(scope.bankAccountDocuments[0]);
                }
            }

            function populateDetails(){
                var bankAccountData = getClientBankAccountDetailData();
                if(bankAccountData!=undefined){
                    processBankAccountData(bankAccountData);
                }else{
                    resourceFactory.bankAccountDetailResource.get({entityType: getEntityType(),entityId: getEntityId(), clientBankAccountDetailAssociationId: getClientBankAccountDetailAssociationId()}, function (data) {
                        processBankAccountData(data);
                    });
                }
            }

            scope.onSubmit = function () {
                scope.setTaskActionExecutionError(null);
                if(!isFormValid()){
                    return false;
                }else {
                    scope.commonConfig.bankAccount.bankAccountData =undefined;
                }
                resourceFactory.bankAccountDetailActionResource.doAction({entityType: getEntityType(),entityId: getEntityId(), clientBankAccountDetailAssociationId: getClientBankAccountDetailAssociationId(), command:'updateCheckerInfo'},scope.formData,
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
                setClientBankAccountDetailAssociationId();
                populateDetails();
            }

            scope.viewDocument = function(document){
                if(document){
                    var url = document.docUrl;
                    for(var tmp in scope.bankAccountDocuments)
                    {
                        tmp.selected = false;
                    }
                    document.selected = true;
                    $http({
                        method: 'GET',
                        url: url
                    }).then(function (documentImage) {
                        scope.documentImg = documentImage.data;
                    });
                }  
            }

            /*overriding doPreTaskActionStep method of defaultActivityController*/
            scope.doPreTaskActionStep = function (actionName) {
                if (actionName === 'activitycomplete') {
                    if (!scope.viewConfig.showSummary) {
                        scope.setTaskActionExecutionError("error.message.bank.account.details.activity.cannot.complete.before.form.submit");
                        return;
                    } 
                }
                scope.doActionAndRefresh(actionName);
            };

            scope.getBankDetails = function(isvalidIfsc){
                if(scope.formData.ifscCode != undefined && scope.formData.ifscCode === scope.repeatFormData.ifscCodeRepeat && isvalidIfsc){
                    resourceFactory.bankIFSCResource.get({
                        ifscCode: scope.formData.ifscCode
                    }, function (data) {
                        scope.bankData = data;
                        scope.formData.bankName = scope.bankData.bankName;
                        scope.formData.branchName = scope.bankData.branchName;
                        scope.formData.bankCity = scope.bankData.bankCity;
                    });
                }
            }

            init();
        }
    });
    mifosX.ng.application.controller('CheckerBankAccountCommonController', ['$controller','$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route','$window','dateFilter','$upload', '$rootScope','API_VERSION', '$http', 'CommonUtilService', '$sce', mifosX.controllers.CheckerBankAccountCommonController]).run(function ($log) {
        $log.info("CheckerBankAccountCommonController initialized");
    });
}(mifosX.controllers || {}));
