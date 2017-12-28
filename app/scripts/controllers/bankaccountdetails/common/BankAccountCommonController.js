(function (module) {
    mifosX.controllers = _.extend(module, {
        BankAccountCommonController: function ($controller, scope, routeParams, resourceFactory, location, $modal, route, $window, dateFilter,$upload,$rootScope,API_VERSION,$http) {
            angular.extend(this, $controller('defaultUIConfigController', {$scope: scope,$key:"bankAccountDetails"}));
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));

            scope.viewConfig = {
                showSummary:false,
                hasData:false,
                approved:false
            };
            scope.formData = {};
            scope.docData = {};
            scope.repeatFormData = {};
            scope.bankAccountTypeOptions = [];
            scope.deFaultBankName = null;
            scope.fileError=false;
            scope.addPicture=true;
            scope.bankAccountDocuments = [];

            function getEntityType(){
               return scope.commonConfig.bankAccount.entityType;
            }

            function getEntityId(){
                return scope.commonConfig.bankAccount.entityId;
            }

            function underTask(){
                return scope.isTask;
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
                    scope.formData = {
                        name: data.name,
                        accountNumber: data.accountNumber,
                        ifscCode: data.ifscCode,
                        micrCode: data.micrCode,
                        mobileNumber: data.mobileNumber,
                        email: data.email,
                        bankName: data.bankName,
                        bankCity: data.bankCity,
                        branchName: data.branchName
                    };
                    scope.repeatFormData = {
                        accountNumberRepeat: data.accountNumber,
                        ifscCodeRepeat: data.ifscCode
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
                    if(data.status){
                        if(data.status.id==200){
                            scope.viewConfig.approved=true;
                        }
                    }
                    scope.bankAccountData = data;
                    if(data.accountNumber !=undefined) {
                        scope.viewConfig.hasData = true;
                        enableShowSummary();
                    }else{
                        disableShowSummary();
                    }

                    scope.bankAccountDocuments = data.bankAccountDocuments || [];
                        for (var i = 0; i < scope.bankAccountDocuments.length; i++) {
                            var docs = {};
                            docs = $rootScope.hostUrl + API_VERSION + '/' + getEntityType() + '/' + getEntityId() + '/documents/' + scope.bankAccountDocuments[i].id + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                            scope.bankAccountDocuments[i].docUrl = docs;   
                        }
                });
            }

            scope.submit = function () {
                if(underTask()){
                    scope.setTaskActionExecutionError(null);
                }
                if(!isFormValid()){
                    return false;
                }
                if(scope.viewConfig.hasData){
                    scope.update();
                    return;
                }
                scope.formData.locale=scope.optlang.code;
                scope.formData.dateFormat=scope.df;
                scope.formData.lastTransactionDate=dateFilter(scope.formData.lastTransactionDate, scope.df);
                submitData();
            };

            function submitData(){
                resourceFactory.bankAccountDetailResource.create({entityType: getEntityType(),entityId: getEntityId()},scope.formData,
                    function (data) {
                        populateDetails();
                        enableShowSummary();
                });
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
                if(scope.isElemMandatory('docFile')){
                    if((_.isUndefined(scope.docFile)) && (_.isUndefined(scope.imageId)) ){
                        scope.fileError=true;
                        return false;
                    }
                }
                return true;
            }

            scope.changePicture = function(){
                scope.addPicture=true;
            }
            
            scope.edit = function () {
                if(_.isUndefined(scope.bankAccountData.documentImg)){
                    scope.addPicture=true;
                }
                disableShowSummary();
            };

            scope.update = function () {
                if(underTask()){
                    scope.setTaskActionExecutionError(null);
                }
                if(!isFormValid()){
                    return false;
                }
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat=scope.df;
                scope.formData.lastTransactionDate=dateFilter(scope.formData.lastTransactionDate, scope.df);
                updateData(); 
            };
            
            function updateData()
            {
                resourceFactory.bankAccountDetailResource.update({entityType: getEntityType(),entityId: getEntityId()},scope.formData, function (data) {
                        populateDetails();
                    });
            }

            var submitAccountDocuments = function (postComplete) {
                $upload.upload({
                    url: $rootScope.hostUrl + API_VERSION + '/'+getEntityType()+'/' + getEntityId() + '/documents',
                    data: scope.docData,
                    file: scope.docFile
                }).then(function (data) {
                    // to fix IE not refreshing the model
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                    if(data!=undefined){
                        console.log(data)
                        postComplete(data.data.resourceId);
                    }
                });
            };

            scope.delete = function () {
                resourceFactory.bankAccountDetailResource.delete({entityType: getEntityType(),entityId: getEntityId()}, function (data) {
                    route.reload();
                    // populateDetails();
                    // scope.viewConfig.showSummary=false;
                    // scope.viewConfig.hasData=false;
                });
            };

            scope.onFileSelect = function ($files) {
                scope.docFile = $files[0];
                if(!_.isUndefined(scope.docFile)){
                    scope.fileError=false;
                }
            };

            scope.cancel = function (){
                if(scope.viewConfig.hasData){
                    enableShowSummary();
                }
            };

            scope.editable = function(){
                if(scope.isTask){
                    return !scope.isTaskCompleted();
                }else{
                    return !scope.viewConfig.approved;
                }
            };

            scope.approvable = function(){
                if(scope.isTask){
                    return false;
                }else{
                    return !scope.viewConfig.approved;
                }
            };

            scope.deletable = function(){
                if(scope.isTask){
                    return false;
                }else{
                    return scope.viewConfig.approved;
                }
            };

            scope.activate = function () {
                resourceFactory.bankAccountDetailActionResource.doAction({entityType: getEntityType(),entityId: getEntityId(),command:'activate'},scope.formData,
                    function (data) {
                        populateDetails();
                        enableShowSummary();

                    }
                );
            };

            function init() {
                populateDetails();
            }

            function enableShowSummary(){
                scope.viewConfig.showSummary=true;
            }

            function disableShowSummary(){
                scope.viewConfig.showSummary=false;
            };

            scope.doPreTaskActionStep = function(actionName){
                 if(actionName === 'activitycomplete') {
                     if (!scope.viewConfig.showSummary) {
                         scope.setTaskActionExecutionError("error.message.bank.account.details.activity.cannot.complete.before.form.submit");
                         return;
                     } else {
                         scope.doActionAndRefresh(actionName);
                     }
                 }else if(actionName === 'approve') {
                     resourceFactory.bankAccountDetailActionResource.doAction({entityType: getEntityType(),entityId: getEntityId(),command:'activate'},scope.formData,
                         function (data) {
                             scope.doActionAndRefresh(actionName);
                             populateDetails();

                         }
                     );
                 }else{
                     scope.doActionAndRefresh(actionName);
                 }

            };

            init();

            scope.uploadDocument = function () {
                $modal.open({
                    templateUrl: 'uploadDocument.html',
                    controller: uploadDocumentCtrl
                });
            };

            var uploadDocumentCtrl = function ($scope, $modalInstance) {
                $scope.data = {
                    documentName:""
                };

                $scope.onFileSelect = function ($files) {
                    scope.docFile = $files[0];
                };

                $scope.upload = function () {
                    if(!$scope.data.documentName){
                        return false;
                    }

                    scope.docData = {name:$scope.data.documentName} ;
                    if (scope.docFile) {
                        submitAccountDocuments(function (documentId){
                        if(documentId != undefined){
                            scope.formData.documents = [];       
                            for(var j in scope.bankAccountDocuments){
                                scope.formData.documents.push(scope.bankAccountDocuments[j].id);
                            }
                            scope.formData.documents.push(documentId);
                        }
                        scope.formData.locale = scope.optlang.code;
                        scope.formData.dateFormat = scope.df;
                        scope.formData.lastTransactionDate = dateFilter(scope.formData.lastTransactionDate, scope.df);
                        updateData();
                        });
                        $modalInstance.close('upload');
                    }
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };


            var viewDocumentCtrl= function ($scope, $modalInstance, documentDetail) {
                $scope.data = documentDetail;
                $scope.data.parentEntityId = getEntityId();
                $scope.data.parentEntityType = getEntityType();
                $scope.close = function () {
                    $modalInstance.close('close');
                };   
            };

            scope.viewDocument = function (documentDetail) {
                $modal.open({
                    templateUrl: 'viewDocument.html',
                    controller: viewDocumentCtrl,
                    resolve: {
                        documentDetail: function () {
                            return documentDetail;
                        }
                    }
                });
            };

            scope.deleteDocument = function (documentId){
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat=scope.df;
                scope.formData.lastTransactionDate=dateFilter(scope.formData.lastTransactionDate, scope.df);
                scope.formData.documents = []; 
                for(var i in scope.bankAccountDocuments){
                    scope.formData.documents.push(scope.bankAccountDocuments[i].id);
                }
                if(documentId){
                    scope.formData.documents.splice( scope.formData.documents.indexOf(documentId),1);
                }
                updateData();       
            };
        }
    });
    mifosX.ng.application.controller('BankAccountCommonController', ['$controller','$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route','$window','dateFilter','$upload', '$rootScope','API_VERSION', '$http',mifosX.controllers.BankAccountCommonController]).run(function ($log) {
        $log.info("BankAccountCommonController initialized");
    });
}(mifosX.controllers || {}));
