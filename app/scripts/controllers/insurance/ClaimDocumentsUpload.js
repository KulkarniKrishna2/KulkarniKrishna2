(function (module) {
    mifosX.controllers = _.extend(module, {
        ClaimDocumentsUpload: function ($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope, CommonUtilService, $modal) {
            angular.extend(this, $controller('defaultUIConfigController', {
                $scope: scope,
                $key: "bankAccountDetails"
            }));
            scope.isEditMode = false;
            scope.repeatFormData = {};
            scope.deceasedId = routeParams.id;
            scope.formData = {};
            scope.formData.locale = scope.optlang.code;
            scope.claimStatus = 'documentsupload';
            scope.showIfsc = false;
            scope.showAccNo = false;
            scope.isEditAllowed = true;
            scope.clientDeceased = {};

            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                scope.response.uiDisplayConfigurations.createClient.isValidMobileNumber && scope.response.uiDisplayConfigurations.createClient.isValidMobileNumber.mobileNumberPattern) {
                scope.mobileNumberPattern = scope.response.uiDisplayConfigurations.createClient.isValidMobileNumber.mobileNumberPattern;
            }

            function fetchInsuranceData() {
                resourceFactory.getInsuranceClaimStatusDetailsResource.getClaimIntimationApproval({ claimStatus: 'documentsupload', deceasedId: scope.deceasedId }, {},
                    function (data) {
                        scope.insuranceCliamDetials = data;
                        calculateClientAge(scope.insuranceCliamDetials.dateOfBirth);
                        getNomineeDetails(scope.deceasedId);
                    });
            };

            function getNomineeDetails(deceasedId) {
                resourceFactory.getInsuranceNomineeDetailsResource.getNomineeDetails({ deceasedId: scope.deceasedId }, {},
                    function (data) {
                        scope.insuranceNomineeDetials = data;
                        if ((scope.insuranceNomineeDetials != undefined && scope.insuranceNomineeDetials.id != undefined && scope.insuranceNomineeDetials.id != null) || scope.isEditMode) {
                            scope.showSummary = true;
                            getDocumentsTeplate();
                        } else {
                            scope.showSummary = false;
                        }
                    });
            };

            resourceFactory.codeValueByCodeNameResources.get({ codeName: "Relationship" }, function (codeValueData) {
                scope.relationships = codeValueData;
            });

            scope.toggleIfsc = function () {
                scope.showIfsc = !scope.showIfsc;
            };

            scope.toggleAccNo = function () {
                scope.showAccNo = !scope.showAccNo;
            };

            scope.editDeceasedDetails = function () {
                scope.showEditScreen = true;
                scope.clientDeceased.deceasedId = scope.deceasedId;
                scope.clientDeceased.clientId = scope.insuranceCliamDetials.clientId;
                scope.clientDeceased.placeOfDeath = scope.insuranceCliamDetials.placeOfDeath;
                scope.clientDeceased.deathDate = new Date(dateFilter(scope.insuranceCliamDetials.deathDate, scope.df));
                scope.clientDeceased.deathIntimationDate = new Date(dateFilter(scope.insuranceCliamDetials.intimationDate, scope.df));
                scope.clientDeceased.contactNumber = scope.insuranceCliamDetials.contactNumber;
                scope.clientDeceased.contactPersonName = scope.insuranceCliamDetials.contactPersonName;
                scope.clientDeceased.clientType = scope.insuranceCliamDetials.insuredClientType.value;
                scope.clientDeceased.locale = scope.formData.locale;
                scope.clientDeceased.dateFormat = scope.df;
                resourceFactory.codeValueByCodeNameResources.get({ codeName: "RelationShip" }, function (codeValueData) {
                    scope.contactPersonRelationShip = codeValueData;
                    scope.clientDeceased.contactPersonRelationshipId = scope.insuranceCliamDetials.contactPersonRelationType.id;
                });
                resourceFactory.codeValueByCodeNameResources.get({ codeName: "Deceased Reason" }, function (codeValueData) {
                    scope.causeOfDeath = codeValueData;
                    scope.clientDeceased.causeOfDeathId = scope.insuranceCliamDetials.causeOfDeath.id;
                });
            };

            scope.submitClientDeceased = function () {
                scope.clientDeceased.deathDate = dateFilter(new Date(scope.clientDeceased.deathDate), scope.df);
                scope.clientDeceased.deathIntimationDate = dateFilter(new Date(scope.clientDeceased.deathIntimationDate), scope.df);
                resourceFactory.updateDeceasedDetailsResource.save({ deceasedId: scope.deceasedId }, scope.clientDeceased, function (data) {
                    fetchInsuranceData();
                    scope.showEditScreen = false;
                });
            }

            scope.cancel = function () {
                scope.showEditScreen = false;
            }

            function getDocumentsTeplate() {
                scope.showEditScreen = false;
                resourceFactory.codeValueByCodeNameResources.get({ codeName: "Insurance Document Tags" }, function (codeValueData) {
                    scope.insuranceDocumentTagOptions = codeValueData;
                    getDeceasedDocuments(codeValueData);
                });
            }

            fetchInsuranceData();

            function calculateClientAge(dateOfBirth) {
                dateOfBirth = new Date(dateFilter(dateOfBirth, scope.df));
                var ageDifMs = Date.now() - dateOfBirth.getTime();
                var ageDifMs = Date.now() - dateOfBirth.getTime();
                var ageDate = new Date(ageDifMs); // miliseconds from epoch
                scope.age = Math.abs(ageDate.getUTCFullYear() - 1970);
            }

            scope.submit = function () {

                if ((scope.repeatFormData.accountNumberRepeat != scope.formData.accountNumber) ||
                    (scope.repeatFormData.ifscCodeRepeat != scope.formData.ifscCode)) {
                    return;
                }

                if (scope.isEditMode) {
                    scope.update();
                    return;
                }

                scope.formData.deceasedId = scope.deceasedId;
                resourceFactory.insuranceClaimStatusDetailsResource.submitNomineeDetails({ claimStatus: 'documentsupload', command: 'create' }, scope.formData,
                    function (data) {
                        scope.insuranceCliamDetials = data;
                        fetchInsuranceData();
                    });
            }

            scope.update = function () {
                resourceFactory.insuranceNomineeDetailsResource.updateNomineeDetails({ nomineeId: scope.insuranceNomineeDetials.id, command: 'update' }, scope.formData,
                    function (data) {
                        scope.insuranceCliamDetials = data;
                        scope.isEditMode = false;
                        fetchInsuranceData();
                    });
            }

            scope.edit = function () {
                scope.showSummary = false;
                scope.isEditMode = true;
                scope.formData.deceasedId = scope.deceasedId;
                scope.constructData();
            }

            scope.constructData = function () {
                scope.formData.nomineeId = scope.insuranceNomineeDetials.id;
                scope.formData.deceasedId = scope.deceasedId;
                scope.formData.nomineeName = scope.insuranceNomineeDetials.name;
                scope.repeatFormData.accountNumberRepeat = scope.insuranceNomineeDetials.bankDetails.accountNumber;
                scope.formData.accountNumber = scope.insuranceNomineeDetials.bankDetails.accountNumber;
                scope.repeatFormData.ifscCodeRepeat = scope.insuranceNomineeDetials.bankDetails.ifscCode;
                scope.formData.ifscCode = scope.insuranceNomineeDetials.bankDetails.ifscCode;
                scope.formData.bankName = scope.insuranceNomineeDetials.bankDetails.bankName;
                scope.formData.branchName = scope.insuranceNomineeDetials.bankDetails.branchName;
                scope.formData.bankCity = scope.insuranceNomineeDetials.bankDetails.bankCity;
                scope.formData.relationshipId = scope.insuranceNomineeDetials.relationShip.id;
            }

            scope.approve = function () {
                resourceFactory.insuranceClaimStatusDetailsResource.submitClaimDocumentUpload({ claimStatus: 'documentsupload', command: 'submit' }, { deceasedId: scope.deceasedId },
                    function (data) {
                        scope.insuranceCliamDetials = data;
                        location.path('/insurancedetails/documentsupload');
                    });
            }

            scope.getBankDetails = function (isvalidIfsc) {
                if (scope.formData.ifscCode != undefined && scope.formData.ifscCode === scope.repeatFormData.ifscCodeRepeat && isvalidIfsc) {
                    resourceFactory.bankIFSCResource.get({
                        ifscCode: scope.formData.ifscCode
                    }, function (data) {
                        scope.bankData = data;
                        scope.formData.bankName = scope.bankData.bankName;
                        scope.formData.branchName = scope.bankData.branchName;
                        scope.formData.bankCity = scope.bankData.bankCity;
                    })
                }
            }

            scope.deleteDocument = function (doc) {
                $modal.open({
                    templateUrl: 'deleteDocument.html',
                    controller: DocumentDeleteCtrl,
                    resolve: {
                        document: function () {
                            return doc;
                        }
                    }
                });
            };

            var DocumentDeleteCtrl = function ($scope, $modalInstance, document) {
                $scope.delete = function () {
                    resourceFactory.InsuranceDeleteDocumentsResource.deleteDocument({ deceasedId: scope.deceasedId, documentId: document.documentId }, '', function (data) {
                        for (var j = 0; j < scope.insuranceDocumentTagOptions.length; j++) {
                            if (document.documentId == scope.insuranceDocumentTagOptions[j].documentId) {
                                delete scope.insuranceDocumentTagOptions[j].url;
                                scope.insuranceDocumentTagOptions[j].isDocumentAttached = false;
                                delete scope.insuranceDocumentTagOptions[j].parentEntityType;
                                delete scope.insuranceDocumentTagOptions[j].parentEntityId;
                                delete scope.insuranceDocumentTagOptions[j].documentId;
                                break;
                            }
                        }

                        getDeceasedDocuments(scope.insuranceDocumentTagOptions);
                        $modalInstance.close('close');
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            var viewDocumentCtrl = function ($scope, $modalInstance, documentDetail) {
                $scope.data = documentDetail;
                $scope.close = function () {
                    $modalInstance.close('close');
                };

            };
            scope.openViewDocument = function (documentDetail) {
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

            function getDeceasedDocuments(codeValueData) {
                resourceFactory.insuranceDocumentsResource.getAllDeceasedDocuments({ deceasedId: scope.deceasedId }, function (data) {
                    for (var j = 0; j < codeValueData.length; j++) {
                        for (var l = 0; l < data.length; l++) {
                            if (data[l].id) {
                                if (data[l].tagIdentifier == codeValueData[j].id) {
                                    var url = {};
                                    url = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment';
                                    data[l].docUrl = url;
                                    codeValueData[j].url = url;
                                    codeValueData[j].isDocumentAttached = true;
                                    codeValueData[j].parentEntityType = data[l].parentEntityType;
                                    codeValueData[j].parentEntityId = data[l].parentEntityId;
                                    codeValueData[j].documentId = data[l].id;
                                    codeValueData[j].allowDeleteDocument = true;
                                    break;
                                }
                            }
                        }
                    }
                });
            };


            scope.getHistory = function () {
                $modal.open({
                    templateUrl: 'views/insurance/viewinsurancelogs.html',
                    controller: InsuranceLogCtrl,
                    windowClass: 'app-modal-window-full-screen',
                });
            }

            var InsuranceLogCtrl = function ($scope, $modalInstance) {

                resourceFactory.insuranceDeceasedLogResource.getDeacesdLogs({}, { deceasedId: scope.deceasedId },
                    function (data) {
                        $scope.insuranceDeceasedLogs = data;
                    });
                $scope.close = function () {
                    $modalInstance.close('close');
                };

            };

            scope.uploadDoument = function (documentDetail) {
                $modal.open({
                    templateUrl: 'createsubgroup.html',
                    controller: uploadDoumentCtrl,
                    resolve: {
                        documentDetail: function () {
                            return documentDetail;
                        }
                    }
                });
            };

            var uploadDoumentCtrl = function ($scope, $modalInstance, documentDetail) {
                $scope.df = scope.df;
                $scope.codeValue = documentDetail;
                $scope.formData = {};
                $scope.formData.tagIdentifier = documentDetail.id;
                $scope.formData.name = documentDetail.name;
                $scope.close = function () {
                    $modalInstance.close('close');
                };

                $scope.onFileSelect = function ($files) {
                    $scope.file = $files[0];
                };

                $scope.submit = function () {
                    $upload.upload({
                        url: $rootScope.hostUrl + API_VERSION + '/insurance/' + scope.deceasedId + '/documents',
                        data: $scope.formData,
                        file: $scope.file
                    }).then(function (data) {
                        // to fix IE not refreshing the model
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                        getDeceasedDocuments(scope.insuranceDocumentTagOptions);
                        $modalInstance.close('close');
                    });
                };
            };



            scope.fetchBankDetails = function () {
                scope.status = "active";
                resourceFactory.bankAccountDetailsResource.getAll({ entityType: 'clients', entityId: scope.insuranceCliamDetials.clientId, status: scope.status }, function (data) {
                    scope.bankAccountDetails = data;
                    if (scope.bankAccountDetails || scope.bankAccountDetails.length == 0) {
                        scope.bankAccountDetailsNotAvailbale = true;
                    } else {
                        scope.bankAccountDetailsNotAvailbale = false;
                    }
                });
            }

            scope.constructNomineeBankdetails = function (account) {
                scope.formData.nomineeName = account.name;
                scope.repeatFormData.accountNumberRepeat = account.accountNumber;
                scope.formData.accountNumber = account.accountNumber;
                scope.repeatFormData.ifscCodeRepeat = account.ifscCode;
                scope.formData.ifscCode = account.ifscCode;
                scope.formData.bankName = account.bankName;
                scope.formData.branchName = account.branchName;
                scope.formData.bankCity = account.bankCity;
            }

        }
    });
    mifosX.ng.application.controller('ClaimDocumentsUpload', ['$controller', '$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'CommonUtilService', '$modal', mifosX.controllers.ClaimDocumentsUpload]).run(function ($log) {
        $log.info("ClaimDocumentsUpload initialized");
    });
}(mifosX.controllers || {}));