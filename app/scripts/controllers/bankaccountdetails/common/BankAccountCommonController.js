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
            scope.viewConfig = {};
            scope.formData = {};
            scope.repeatFormData = {};

            function init() {
                scope.isDefaultPennyDropTransactionPaymentTypeId = scope.isSystemGlobalConfigurationEnabled(scope.globalConstants.DEFAULT_PENNY_DROP_TRANSACTION_PAYMENT_TYPE_ID);
                scope.viewConfig.isCreate = false;
                scope.viewConfig.isUpdate = false;
                scope.viewConfig.showSummary = false;
                scope.viewConfig.viewDocument = false;
                if (scope.commonConfig.bankAccountData.templateData) {
                    scope.bankAccountTypeOptions = scope.commonConfig.bankAccountData.templateData.bankAccountTypeOptions;
                }
                if (scope.commonConfig && scope.commonConfig.bankAccountData.bankAccountDetailsData) {
                    populateBankAccountDetails();
                    getBankAccountDocuments();
                } else {
                    scope.viewConfig.isCreate = scope.commonConfig.bankAccountData.eventType == 'create';
                    if (scope.viewConfig.isCreate) {
                        scope.formData.accountTypeId = scope.bankAccountTypeOptions[0].id;
                    }
                }
            }
            init();

            function populateBankAccountDetails() {
                scope.isAllowPennyDropTransaction = false;
                if (scope.commonConfig.bankAccountData.isAllowPennyDropTransaction) {
                    scope.isAllowPennyDropTransaction = scope.commonConfig.bankAccountData.isAllowPennyDropTransaction;
                }
                scope.isAllowOnlyPennyDropAction = false;
                if (scope.commonConfig.bankAccountData.isAllowOnlyPennyDropAction) {
                    scope.isAllowOnlyPennyDropAction = scope.commonConfig.bankAccountData.isAllowOnlyPennyDropAction;
                }
                scope.bankAccountDetailsData = scope.commonConfig.bankAccountData.bankAccountDetailsData;
                scope.viewConfig.showSummary = true;
                scope.viewConfig.update = false;
                scope.viewConfig.create = false;
                constructBankAccountDetails();
            }

            function constructBankAccountDetails() {
                scope.formData = {
                    name: scope.bankAccountDetailsData.name,
                    accountNumber: scope.bankAccountDetailsData.accountNumber,
                    ifscCode: scope.bankAccountDetailsData.ifscCode,
                    micrCode: scope.bankAccountDetailsData.micrCode,
                    mobileNumber: scope.bankAccountDetailsData.mobileNumber,
                    email: scope.bankAccountDetailsData.email,
                    bankName: scope.bankAccountDetailsData.bankName,
                    bankCity: scope.bankAccountDetailsData.bankCity,
                    branchName: scope.bankAccountDetailsData.branchName
                };
                scope.repeatFormData = {
                    accountNumberRepeat: scope.bankAccountDetailsData.accountNumber,
                    ifscCodeRepeat: scope.bankAccountDetailsData.ifscCode
                };
                if (!_.isUndefined(scope.bankAccountDetailsData.lastTransactionDate)) {
                    scope.formData.lastTransactionDate = new Date(dateFilter(scope.bankAccountDetailsData.lastTransactionDate, scope.df));
                }
                scope.formData.accountTypeId = scope.bankAccountDetailsData.accountType.id;
            }

            function getEntityType() {
                return scope.entityType || scope.commonConfig.bankAccountData.entityType;
            }

            function getEntityId() {
                return scope.entityId || scope.commonConfig.bankAccountData.entityId;
            }

            function getBankAccountDetailsId() {
                return scope.bankAccountDetailsId || scope.commonConfig.bankAccountData.bankAccountDetailsId;
            }

            function getBankAccountDocuments() {
                resourceFactory.bankAccountDetailsDocumentsResource.getAllDocuments({
                    entityType: getEntityType(),
                    entityId: getEntityId(),
                    bankAccountDetailsId: getBankAccountDetailsId()
                }, function (data) {
                    scope.bankAccountDocuments = data.bankAccountDocuments || [];
                    for (var i = 0; i < scope.bankAccountDocuments.length; i++) {
                        var docs = {};
                        if (scope.bankAccountDocuments[i].storage && scope.bankAccountDocuments[i].storage.toLowerCase() == 's3') {
                            docs = $rootScope.hostUrl + API_VERSION + '/' + scope.bankAccountDocuments[i].parentEntityType + '/' + scope.bankAccountDocuments[i].parentEntityId + '/documents/' + scope.bankAccountDocuments[i].id + '/downloadableURL';
                        } else {
                            docs = $rootScope.hostUrl + API_VERSION + '/' + scope.bankAccountDocuments[i].parentEntityType + '/' + scope.bankAccountDocuments[i].parentEntityId + '/documents/' + scope.bankAccountDocuments[i].id + '/download';
                        }
                        scope.bankAccountDocuments[i].docUrl = docs;
                    }
                });
            }

            scope.submit = function () {
                if (!isFormValid()) {
                    return false;
                }
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;
                scope.formData.lastTransactionDate = dateFilter(scope.formData.lastTransactionDate, scope.df);
                resourceFactory.bankAccountDetailsResource.create({
                    entityType: getEntityType(),
                    entityId: getEntityId()
                }, scope.formData, function (data) {
                    scope.bankAccountDetailsId = data.resourceId;
                    scope.routeToViewBankAccountdetails();
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

            function enableShowSummary() {
                scope.viewConfig.isCreate = false;
                scope.viewConfig.isUpdate = false;
                scope.viewConfig.showSummary = true;
            }

            function disableShowSummary() {
                scope.viewConfig.isCreate = false;
                scope.viewConfig.showSummary = false;
            };

            scope.edit = function () {
                scope.viewConfig.isUpdate = true;
                disableShowSummary();
            };

            scope.update = function () {
                if (!isFormValid()) {
                    return false;
                }
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;
                scope.formData.lastTransactionDate = dateFilter(scope.formData.lastTransactionDate, scope.df);
                resourceFactory.bankAccountDetailsResource.update({
                    entityType: getEntityType(),
                    entityId: getEntityId(),
                    bankAccountDetailsId: getBankAccountDetailsId()
                }, scope.formData, function (data) {
                    fetchBankAccountDetails();
                });
            };

            function fetchBankAccountDetails() {
                scope.viewConfig.isCreate = false;
                scope.viewConfig.isUpdate = false;
                scope.viewConfig.showSummary = false;
                resourceFactory.bankAccountDetailsResource.get({ entityType: scope.entityType, entityId: scope.entityId, bankAccountDetailsId: scope.bankAccountDetailsId }, function (data) {
                    scope.commonConfig.bankAccountData.bankAccountDetailsData = data;
                    init();
                });
            };

            scope.routeToViewBankAccountdetails = function () {
                location.path('/' + getEntityType() + '/' + getEntityId() + '/bankaccountdetails/' + getBankAccountDetailsId()).search({});
            };

            scope.routeToBankAccountdetails = function () {
                location.path('/' + getEntityType() + '/' + getEntityId() + '/bankaccountdetails').search({});
            };

            var submitAccountDocuments = function (postComplete) {
                $upload.upload({
                    url: $rootScope.hostUrl + API_VERSION + '/' + getEntityType() + '/' + getEntityId() + '/bankaccountdetails/' + getBankAccountDetailsId() + '/documents',
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
                    resourceFactory.bankAccountDetailsDeleteResource.delete({
                        entityType: getEntityType(),
                        entityId: getEntityId(),
                        bankAccountDetailsId: getBankAccountDetailsId()
                    }, function (data) {
                        getBankAccountDocuments();
                        $modalInstance.close('delete');
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
                enableShowSummary();
            };

            scope.isBankAccountActivated = function () {
                return (scope.bankAccountDetailsData.status.value == 'active');
            }

            scope.isBankAccountDeActivated = function () {
                return (scope.bankAccountDetailsData.status.value == 'inactive');
            }

            scope.isBankAccountAllowToActivate = function () {
                if (scope.isAllowOnlyPennyDropAction) {
                    return false;
                }
                if (scope.isDefaultPennyDropTransactionPaymentTypeId) {
                    return false;
                }
                if (scope.viewUIConfig.isTask) {
                    return !scope.isTaskCompleted() && scope.isBankAccountAllowToModifyable();
                }
                return scope.isBankAccountAllowToModifyable();
            }

            scope.isBankAccountAllowToDeActivate = function () {
                if (scope.isAllowOnlyPennyDropAction) {
                    return false;
                }
                if (scope.viewUIConfig.isTask) {
                    return !scope.isTaskCompleted() && scope.isBankAccountActivated();
                }
                return scope.isBankAccountActivated();
            }

            scope.isBankAccountAllowToReactivate = function () {
                if (scope.isAllowOnlyPennyDropAction) {
                    return false;
                }
                if (scope.viewUIConfig.isTask) {
                    return !scope.isTaskCompleted() && scope.isBankAccountDeActivated();
                }
                return scope.isBankAccountDeActivated();
            }

            scope.isBankAccountAllowToModifyable = function () {
                if (scope.isAllowOnlyPennyDropAction) {
                    return false;
                }
                if ([1, 2, 3, 4, 5].indexOf(scope.bankAccountDetailsData.verificationStatus.id) > -1) {
                    return false;
                }
                if (scope.viewUIConfig.isTask) {
                    return !scope.isTaskCompleted() && ['active', 'inactive', 'deleted'].indexOf(scope.bankAccountDetailsData.status.value) < 0;
                }
                return ['active', 'inactive', 'deleted'].indexOf(scope.bankAccountDetailsData.status.value) < 0;
            }

            scope.isBankAccountAllowToVerifyable = function () {
                if (!scope.isAllowPennyDropTransaction) {
                    return false;
                }
                if (!scope.isDefaultPennyDropTransactionPaymentTypeId) {
                    return false;
                }
                if (scope.viewConfig.isVerified) {
                    return false;
                }
                if (scope.bankAccountDetailsData.verificationStatus.id > 0) {
                    return false;
                }
                return ['active', 'inactive', 'deleted'].indexOf(scope.bankAccountDetailsData.status.value) < 0;
            }

            scope.isBankAccountAllowToReVerifyable = function () {
                if (!scope.isAllowPennyDropTransaction) {
                    return false;
                }
                if (!scope.isDefaultPennyDropTransactionPaymentTypeId) {
                    return false;
                }
                if (scope.viewConfig.isVerified) {
                    return false;
                }
                if (['Error'].indexOf(scope.bankAccountDetailsData.verificationStatus.value) > -1) {
                    return true;
                }
                return false;
            };

            scope.activate = function () {
                resourceFactory.bankAccountDetailsActivateResource.activate({
                    entityType: getEntityType(),
                    entityId: getEntityId(),
                    bankAccountDetailsId: getBankAccountDetailsId()
                }, {}, function (data) {
                    fetchBankAccountDetails();
                });
            };

            scope.deActivate = function () {
                resourceFactory.bankAccountDetailsDeActivateResource.deActivate({
                    entityType: getEntityType(),
                    entityId: getEntityId(),
                    bankAccountDetailsId: getBankAccountDetailsId()
                }, {}, function (data) {
                    fetchBankAccountDetails();
                });
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
                    resourceFactory.bankAccountDetailsActivateResource.activate({
                        entityType: getEntityType(),
                        entityId: getEntityId(),
                        bankAccountDetailsId: getBankAccountDetailsId()
                    }, {}, function (data) {
                        scope.doActionAndRefresh(actionName);
                        fetchBankAccountDetails();
                    });
                } else {
                    scope.doActionAndRefresh(actionName);
                }
            };

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
                                getBankAccountDocuments();
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
                    scope.viewConfig.viewDocument = true;
                });
            }

            scope.deleteDocument = function (document) {
                resourceFactory.bankAccountDetailsDocumentsResource.delete({
                    entityType: getEntityType(),
                    entityId: getEntityId(),
                    bankAccountDetailsId: getBankAccountDetailsId()
                }, { 'documentId': document.id }, function (data) {
                    getBankAccountDocuments();
                });
            };

            scope.getBankDetails = function (isvalidIfsc) {
                if (scope.formData.ifscCode != undefined && scope.formData.ifscCode === scope.repeatFormData.ifscCodeRepeat && isvalidIfsc) {
                    resourceFactory.bankIFSCResource.get({
                        ifscCode: scope.formData.ifscCode
                    }, function (data) {
                        scope.bankAccountDetailsData = data;
                        scope.formData.bankName = scope.bankAccountDetailsData.bankName;
                        scope.formData.branchName = scope.bankAccountDetailsData.branchName;
                        scope.formData.bankCity = scope.bankAccountDetailsData.bankCity;
                    });
                }
            }

            scope.path = location.$$path;
            scope.auditLogs = [];
            if (scope.path.indexOf("addbankaccountdetail") != -1 || scope.path.indexOf("bankaccountdetails") != -1) {
                scope.isDisplayAuditLogs = true;
                scope.showAuditLog = true;
            }

            function getBankAccountDetailsAuditLogs(param) {
                resourceFactory.bankAccountDetailsAuditResource.get(param, function (data) {
                    scope.auditLogs = data;
                });
            };

            scope.displayAuditLogs = function () {
                scope.isDisplayAuditLogs = true;
                var param = {};
                if (scope.path.indexOf("addbankaccountdetail") != -1 || scope.path.indexOf("bankaccountdetails") != -1) {
                    if (scope.path.indexOf("clients") != -1) {
                        param.entityType = 'clients';
                        param.bankAssociationId = routeParams.bankAccountDetailsId;
                        param.entityId = routeParams.entityId;
                        if (param.bankAssociationId == undefined) {
                            param.bankAssociationId = -1;
                        }
                        getBankAccountDetailsAuditLogs(param);
                    }
                }
            };

            scope.initBankAccountVerification = function (reRerify) {
                if (scope.bankAccountDetailsData.isVerified == true && !reRerify) {
                    populateBankAccountDetails();
                } else {
                    var timeDealy = 5;
                    if (scope.bankAccountDetailsData.verificationStatus && scope.bankAccountDetailsData.verificationStatus.id == 2) {
                        resourceFactory.bankAccountDetailsVerificationStatusResource.verificationStatus({
                            entityType: getEntityType(),
                            entityId: getEntityId(),
                            bankAccountDetailsId: getBankAccountDetailsId()
                        }, {}, function (data) {
                            setTimeout(function () {
                                fetchBankAccountDetails();
                            }, timeDealy);
                        });

                    } else {
                        if (reRerify) {
                            resourceFactory.bankAccountDetailsReVerifyResource.reVerify({
                                entityType: getEntityType(),
                                entityId: getEntityId(),
                                bankAccountDetailsId: getBankAccountDetailsId()
                            }, {}, function (data) {
                                setTimeout(function () {
                                    fetchBankAccountDetails();
                                }, timeDealy);
                            });
                        } else {
                            resourceFactory.bankAccountDetailsVerifyResource.verify({
                                entityType: getEntityType(),
                                entityId: getEntityId(),
                                bankAccountDetailsId: getBankAccountDetailsId()
                            }, {}, function (data) {
                                setTimeout(function () {
                                    fetchBankAccountDetails();
                                }, timeDealy);
                            });
                        }
                    }
                }
            };
        }
    });
    mifosX.ng.application.controller('BankAccountCommonController', ['$controller', '$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', 'dateFilter', '$upload', '$rootScope', 'API_VERSION', '$http', mifosX.controllers.BankAccountCommonController]).run(function ($log) {
        $log.info("BankAccountCommonController initialized");
    });
}(mifosX.controllers || {}));
