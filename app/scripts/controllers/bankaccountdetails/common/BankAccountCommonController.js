(function (module) {
    mifosX.controllers = _.extend(module, {
        BankAccountCommonController: function ($controller, scope, routeParams, resourceFactory, location, $modal, dateFilter, $upload, $rootScope, API_VERSION, $http) {
            angular.extend(this, $controller('defaultUIConfigController', {
                $scope: scope,
                $key: "bankAccountDetails"
            }));
            angular.extend(this, $controller('defaultActivityController', {
                $scope: scope
            }));

            scope.viewConfig = {
                showSummary: false,
                hasData: false,
                approved: false
            };
            scope.formData = {};
            scope.docData = {};
            scope.repeatFormData = {};
            scope.bankAccountTypeOptions = [];
            scope.deFaultBankName = null;
            scope.fileError = false;
            scope.addPicture = true;
            scope.bankAccountDocuments = [];
            if (routeParams.clientBankAccountDetailAssociationId != undefined) {
                scope.clientBankAccountDetailAssociationId = routeParams.clientBankAccountDetailAssociationId;
            } else {
                scope.clientBankAccountDetailAssociationId = scope.commonConfig.bankAccount.clientBankAccountDetailAssociationId;
            }
            scope.showReactivateButton = false;
            if(!_.isUndefined(routeParams.associationStatus)){
                scope.fetchInactiveAssociation = "fetchInactiveAssociation";
                scope.showReactivateButton = true;
            }

            function getEntityType() {
                return scope.commonConfig.bankAccount.entityType;
            }

            function getEntityId() {
                return scope.commonConfig.bankAccount.entityId;
            }

            function getClientBankAccountDetailAssociationId() {
                return scope.clientBankAccountDetailAssociationId;
            }

            function underTask() {
                return scope.isTask;
            }

            if (scope.responseDefaultGisData && scope.response && scope.response.uiDisplayConfigurations &&
                scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig &&
                scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.bankAccountDetails &&
                scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.bankAccountDetails.bankName &&
                scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.bankAccountDetails.bankName != "") {
                scope.deFaultBankName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.bankAccountDetails.bankName;
            }
            if(scope.response && scope.response.uiDisplayConfigurations &&
                scope.response.uiDisplayConfigurations.bankAccountDetails){
                scope.showDeleteButton = scope.response.uiDisplayConfigurations.bankAccountDetails.showDeleteButton;
            }

            function constructBankAccountDetails() {
                scope.formData = {
                    name: scope.bankData.name,
                    accountNumber: scope.bankData.accountNumber,
                    ifscCode: scope.bankData.ifscCode,
                    micrCode: scope.bankData.micrCode,
                    mobileNumber: scope.bankData.mobileNumber,
                    email: scope.bankData.email,
                    bankName: scope.bankData.bankName,
                    bankCity: scope.bankData.bankCity,
                    branchName: scope.bankData.branchName
                };
                scope.repeatFormData = {
                    accountNumberRepeat: scope.bankData.accountNumber,
                    ifscCodeRepeat: scope.bankData.ifscCode
                };
                if (!_.isUndefined(scope.bankData.lastTransactionDate)) {
                    scope.formData.lastTransactionDate = new Date(dateFilter(scope.bankData.lastTransactionDate, scope.df));
                }

                if (!scope.formData.bankName) {
                    scope.formData.bankName = scope.deFaultBankName;
                }
                if (scope.bankData.accountType) {
                    scope.formData.accountTypeId = scope.bankData.accountType.id;
                } else {
                    scope.formData.accountTypeId = scope.bankAccountTypeOptions[0].id;
                }
                if (scope.bankData.status) {
                    if (scope.bankData.status.id == 200 || scope.bankData.status.id == 400) {
                        scope.viewConfig.approved = true;
                    }
                }

                scope.viewConfig.isVerified = scope.bankData.isVerified;

                scope.bankAccountData = scope.bankData;
                if(scope.bankData.accountNumber != undefined) {
                    scope.viewConfig.hasData = true;
                    enableShowSummary();
                }else{
                    disableShowSummary();
                }

                scope.bankAccountDocuments = scope.bankData.bankAccountDocuments || [];
                for (var i = 0; i < scope.bankAccountDocuments.length; i++) {
                    var docs = {};
                    docs = $rootScope.hostUrl + API_VERSION + '/' + getEntityType() + '/' + getEntityId() + '/documents/' + scope.bankAccountDocuments[i].id + '/download';
                    scope.bankAccountDocuments[i].docUrl = docs;
                }
            }

            function populateDetails() {
                resourceFactory.bankAccountDetailResource.get({
                    entityType: getEntityType(),
                    entityId: getEntityId(),
                    clientBankAccountDetailAssociationId: getClientBankAccountDetailAssociationId(),
                    'command':scope.fetchInactiveAssociation
                }, function (data) {
                    scope.bankData = data;
                    scope.externalservices = scope.bankData.externalServiceOptions;
                    scope.bankAccountTypeOptions = scope.bankData.bankAccountTypeOptions;
                    constructBankAccountDetails();
                });
            }

            scope.submit = function () {
                if (underTask()) {
                    scope.setTaskActionExecutionError(null);
                }
                if (!isFormValid()) {
                    return false;
                }
                if (scope.viewConfig.hasData) {
                    scope.update();
                    return;
                }
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;
                scope.formData.lastTransactionDate = dateFilter(scope.formData.lastTransactionDate, scope.df);
                submitData();
            };

            function submitData() {
                resourceFactory.bankAccountDetailResources.create({
                    entityType: getEntityType(),
                    entityId: getEntityId()
                }, scope.formData,
                function (data) {
                    scope.clientBankAccountDetailAssociationId = data.resourceId;
                    if (scope.isTask) {
                        populateDetails();
                    } else {
                        scope.routeToViewBankAccountdetails();
                        //scope.routeToBankAccountdetails();
                    }

                });
            };

            function isFormValid() {
                if (!scope.isElemHidden('bankIFSCCodeRepeat')) {
                    if (scope.formData.ifscCode != scope.repeatFormData.ifscCodeRepeat) {
                        return false;
                    }
                }
                if (!scope.isElemHidden('bankAccountNumberRepeat')) {
                    if (scope.formData.accountNumber != scope.repeatFormData.accountNumberRepeat) {
                        return false;
                    }
                }
                if (scope.isElemMandatory('docFile')) {
                    if ((_.isUndefined(scope.docFile)) && (_.isUndefined(scope.imageId))) {
                        scope.fileError = true;
                        return false;
                    }
                }
                return true;
            }

            scope.changePicture = function () {
                scope.addPicture = true;
            }

            scope.edit = function () {
                if (_.isUndefined(scope.bankAccountData.documentImg)) {
                    scope.addPicture = true;
                }
                disableShowSummary();
            };

            scope.update = function () {
                if (underTask()) {
                    scope.setTaskActionExecutionError(null);
                }
                if (!isFormValid()) {
                    return false;
                }
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;
                scope.formData.lastTransactionDate = dateFilter(scope.formData.lastTransactionDate, scope.df);
                updateData();
            };

            function updateData() {
                resourceFactory.bankAccountDetailResource.update({
                    entityType: getEntityType(),
                    entityId: getEntityId(),
                    clientBankAccountDetailAssociationId: getClientBankAccountDetailAssociationId()
                }, scope.formData, function (data) {
                    if (data.changes && 'bankAccountDetailId' in data.changes) {
                        populateDetails();
                    } else {
                        scope.routeToBankAccountdetails();
                    }
                });
            }

            scope.routeToViewBankAccountdetails = function () {
                location.path('/' + getEntityType() + '/' + getEntityId() + '/bankaccountdetails/' + getClientBankAccountDetailAssociationId()).search({});
            };

            scope.routeToBankAccountdetails = function () {
                location.path('/' + getEntityType() + '/' + getEntityId() + '/bankaccountdetails').search({});
            };

            var submitAccountDocuments = function (postComplete) {
                $upload.upload({
                    url: $rootScope.hostUrl + API_VERSION + '/' + getEntityType() + '/' + getEntityId() + '/documents',
                    data: scope.docData,
                    file: scope.docFile
                }).then(function (data) {
                    // to fix IE not refreshing the model
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                    if (data != undefined) {
                        postComplete(data.data.resourceId);
                    }
                });
            };

            scope.delete = function () {
                $modal.open({
                    templateUrl: 'delete.html',
                    controller: DeleteCtrl,
                    windowClass: 'modalwidth700'
                });

            };

            var DeleteCtrl = function ($scope, $modalInstance) {
                $scope.cancelDelete = function () {
                    $modalInstance.dismiss('cancel');
                };
                $scope.submitDelete = function () {
                    resourceFactory.bankAccountDetailResource.delete({
                        entityType: getEntityType(),
                        entityId: getEntityId(),
                        clientBankAccountDetailAssociationId: getClientBankAccountDetailAssociationId()
                    }, function (data) {
                        $modalInstance.close('delete');
                        scope.routeToBankAccountdetails();
                    });
                };
            };

            scope.onFileSelect = function ($files) {
                scope.docFile = $files[0];
                if (!_.isUndefined(scope.docFile)) {
                    scope.fileError = false;
                }
            };

            scope.cancel = function () {
                if (scope.viewConfig.hasData) {
                    enableShowSummary();
                }
            };

            scope.uploadimage = function () {
                if (scope.isTask) {
                    return !scope.isTaskCompleted();
                } else {
                    return !scope.viewConfig.approved;
                }
            };

            scope.editable = function () {
                if (scope.isTask) {
                    return !scope.isTaskCompleted();
                } else {
                    return !scope.viewConfig.approved;
                }
            };

            scope.detailseditable = function () {
                if(scope.bankData.verificationStatus.id == 3){
                   return false;
                }else if (scope.isTask) {
                    return !scope.isTaskCompleted();
                } else {
                    return !scope.viewConfig.approved;
                }
            };

            scope.approvable = function () {
                if (scope.isTask) {
                    return false;
                } else {
                    return !scope.viewConfig.approved;
                }
            };

            scope.isDefaultPennyDropTransactionPaymentTypeId = scope.isSystemGlobalConfigurationEnabled(scope.globalConstants.DEFAULT_PENNY_DROP_TRANSACTION_PAYMENT_TYPE_ID);
            scope.verifyable = function () {
                if(!scope.isDefaultPennyDropTransactionPaymentTypeId){
                    return false;
                }
                if(scope.viewConfig.isVerified){
                    return false;
                }
                if(scope.bankData.verificationStatus.id > 0){
                    return false;
                }
                return false;
            };
            
            scope.reVerifyable = function () {
                if(!scope.isDefaultPennyDropTransactionPaymentTypeId){
                    return false;
                }
                if(scope.bankData.verificationStatus.value=='Failed' || scope.bankData.verificationStatus.value=='Error' || scope.bankData.verificationStatus.value=='Partial'){
                    return true;
                }
                return false;
            };

            scope.deletable = function () {
                if (scope.isTask) {
                    return false;
                } else {
                    return (scope.viewConfig.approved && scope.showDeleteButton);
                }
            };

            scope.undoApprovable = function () {
                if (scope.isTask) {
                    return false;
                } else {
                    return (scope.viewConfig.approved && !scope.showDeleteButton && !scope.showReactivateButton);
                }
            };


            scope.activate = function () {
                resourceFactory.bankAccountDetailActionResource.doAction({
                        entityType: getEntityType(),
                        entityId: getEntityId(),
                        clientBankAccountDetailAssociationId: getClientBankAccountDetailAssociationId(),
                        command: 'activate'
                    }, scope.formData,
                    function (data) {
                        populateDetails();
                        enableShowSummary();
                        scope.routeToBankAccountdetails();

                    }
                );
            };

            function init() {
                if (scope.commonConfig.bankAccount.eventType && scope.commonConfig.bankAccount.eventType === "create") {
                    if (scope.commonConfig.bankAccount.clientBankAccountDetailAssociationId) {
                        populateDetails();
                    } else {
                        populateTemplate();
                    }
                } else {
                    populateDetails();
                }
            }

            function populateTemplate() {
                resourceFactory.bankAccountDetailsTemplateResource.get({
                    entityType: scope.entityType,
                    entityId: scope.entityId
                }, function (data) {
                    var bankData = {
                        bankAccountData: data
                    };
                    angular.extend(scope.commonConfig, bankData);
                    scope.bankAccountTypeOptions = data.bankAccountTypeOptions;
                    scope.formData.accountTypeId = data.bankAccountTypeOptions[0].id;
                });
            }

            function enableShowSummary() {
                scope.viewConfig.showSummary = true;
            }

            function disableShowSummary() {
                scope.viewConfig.showSummary = false;
            };

            scope.doPreTaskActionStep = function (actionName) {
                if (actionName === 'activitycomplete') {
                    if (!scope.viewConfig.showSummary) {
                        scope.setTaskActionExecutionError("error.message.bank.account.details.activity.cannot.complete.before.form.submit");
                        return;
                    } else {
                        scope.doActionAndRefresh(actionName);
                    }
                } else if (actionName === 'approve') {
                    resourceFactory.bankAccountDetailActionResource.doAction({
                            entityType: getEntityType(),
                            entityId: getEntityId(),
                            clientBankAccountDetailAssociationId: getClientBankAccountDetailAssociationId(),
                            command: 'activate'
                        }, scope.formData,
                        function (data) {
                            scope.doActionAndRefresh(actionName);
                            populateDetails();

                        }
                    );
                } else {
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
                $scope.docformatErr = false;
                $scope.data = {
                    documentName: ""
                };

                $scope.onFileSelect = function ($files) {
                    scope.docFile = $files[0];
                    $scope.docformatErr = false;
                };

                $scope.upload = function () {
                    if (!$scope.data.documentName) {
                        return false;
                    }

                    scope.docData = {
                        name: $scope.data.documentName
                    };
                    if (scope.docFile) {
                        if (!scope.docFile.type.includes("image")) {
                            $scope.docformatErr = true;
                            $scope.docformatErrMsg = "label.error.only.files.of.type.image.are.allowed";
                        } else {
                            submitAccountDocuments(function (documentId) {
                                if (documentId != undefined) {
                                    scope.formData.documents = [];
                                    for (var j in scope.bankAccountDocuments) {
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
                    }
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.viewDocument = function (document) {
                var url = document.docUrl;
                $http({
                    method: 'GET',
                    url: url
                }).then(function (documentImage) {
                    scope.documentImg = documentImage.data;
                });
            }

            scope.deleteDocument = function (documentId) {
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;
                scope.formData.lastTransactionDate = dateFilter(scope.formData.lastTransactionDate, scope.df);
                scope.formData.documents = [];
                for (var i in scope.bankAccountDocuments) {
                    scope.formData.documents.push(scope.bankAccountDocuments[i].id);
                }
                if (documentId) {
                    scope.formData.documents.splice(scope.formData.documents.indexOf(documentId), 1);
                }
                updateData();
            };

            /*scope.getBankDetails = function (isvalidIfsc) {
                resourceFactory.bankIFSCResource.get({
                    ifscCode: scope.formData.ifscCode
                }, function (data) {
                    scope.bankData = data;
                    scope.formData.bankName = scope.bankData.bankName;
                    scope.formData.branchName = scope.bankData.branchName;
                    scope.formData.bankCity = scope.bankData.bankCity;
                });
            }*/
            
            scope.inActivateAssociation = function () {
                resourceFactory.bankAccountDetailActionResource.doAction({
                        entityType: getEntityType(),
                        entityId: getEntityId(),
                        clientBankAccountDetailAssociationId: getClientBankAccountDetailAssociationId(),
                        command: 'inactivateAssociation'
                    }, scope.formData,
                    function (data) {
                        enableShowSummary();
                        scope.routeToBankAccountdetails();

                    }
                );
            };
            scope.activateAssociation = function () {
                resourceFactory.bankAccountDetailActionResource.doAction({
                        entityType: getEntityType(),
                        entityId: getEntityId(),
                        clientBankAccountDetailAssociationId: getClientBankAccountDetailAssociationId(),
                        command: 'activateAssociation'
                    }, scope.formData,
                    function (data) {
                        enableShowSummary();
                        scope.routeToBankAccountdetails();

                    }
                );
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
            scope.path = location.$$path;
            scope.auditLogs = [];
            if(scope.path.indexOf("addbankaccountdetail") != -1 || scope.path.indexOf("bankaccountdetails") != -1){
                scope.isDisplayAuditLogs = true;
                scope.showAuditLog = true;
            }
            scope.getBankAccountAuditLogs = function(param){
                resourceFactory.bankAccountAuditResource.get(param, function (data) {
                    scope.auditLogs = data;                    
                });
            };
            
            scope.displayAuditLogs = function () {
                scope.isDisplayAuditLogs=true;     
                var param = {};
                if(scope.path.indexOf("addbankaccountdetail") != -1 || scope.path.indexOf("bankaccountdetails") != -1){
                    if(scope.path.indexOf("clients") != -1){
                        param.entityType = 'clients';
                        param.bankAssociationId = routeParams.clientBankAccountDetailAssociationId ;
                        param.entityId = routeParams.entityId;
                        if(param.bankAssociationId==undefined){
                            param.bankAssociationId = -1;
                        }
                        scope.getBankAccountAuditLogs(param);
                    }
                    
                }
            };

            scope.initBankAccountVerification = function(reRerify){
                if(scope.bankData.isVerified == true && !reRerify){
                    populateDetails();
                }else{
                    var timeDealy = 5;
                    if(scope.bankData.verificationStatus && scope.bankData.verificationStatus.id == 2){
                        resourceFactory.bankAccountDetailCheckVerificationStatusVerifyResource.checkVerificationStatus({ bankAccountDetailId: scope.bankData.id }, {}, function (data) {
                            setTimeout(function () {
                                populateDetails();
                            }, timeDealy);
                        });

                    }else{
                        if(reRerify){
                            resourceFactory.bankAccountDetailReVerifyResource.doReVerify({ bankAccountDetailId: scope.bankData.id }, {}, function (data) {
                                setTimeout(function () {
                                    populateDetails();
                                }, timeDealy);
                            });
                        }else{
                            resourceFactory.bankAccountDetailVerifyResource.doVerify({ bankAccountDetailId: scope.bankData.id }, {}, function (data) {
                                setTimeout(function () {
                                    populateDetails();
                                }, timeDealy);
                            });
                        }
                    }
                }
            }
        }
    });
    mifosX.ng.application.controller('BankAccountCommonController', ['$controller', '$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', 'dateFilter', '$upload', '$rootScope', 'API_VERSION', '$http', mifosX.controllers.BankAccountCommonController]).run(function ($log) {
        $log.info("BankAccountCommonController initialized");
    });
}(mifosX.controllers || {}));
