(function (module) {
    mifosX.controllers = _.extend(module, {
        ClientDeceasedController: function ($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope,CommonUtilService, $modal) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));
            scope.deceasedReasonOptions = [];
            scope.deceasedPersonOptions = [];
            scope.formData = {};
            scope.formData.locale = scope.optlang.code;
            scope.formData.dateFormat = scope.df;
            scope.isDeceasedDetailsCreated = false;
            scope.isCreateDeceasedDetailsShow = false;
            scope.clientId = routeParams.clientId;
            scope.deceasedDetailsData = [{"clientType" : "INSURED"}, {"clientType" : "CO-INSURED"}];

            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                scope.response.uiDisplayConfigurations.createClient.isValidMobileNumber && scope.response.uiDisplayConfigurations.createClient.isValidMobileNumber.mobileNumberPattern) {
                scope.mobileNumberPattern = scope.response.uiDisplayConfigurations.createClient.isValidMobileNumber.mobileNumberPattern;
            }
            
            scope.getInsuredDocumentsTeplate = function ()  {
                resourceFactory.codeValueByCodeNameResources.get({codeName: "Insured Deceased Document Tags"}, function (codeValueData) {
                    scope.insuredDocumentTagOptions = codeValueData;
                    getInsuredDocuments(codeValueData);
                });
            }

            scope.getCoInsuredDocumentsTeplate = function ()  {
                resourceFactory.codeValueByCodeNameResources.get({codeName: "CoInsured Deceased Document Tags"}, function (codeValueData) {
                    scope.coInsuredDocumentTagOptions = codeValueData;
                    getInsuredDocuments(codeValueData);
                });
            }

            resourceFactory.codeValueByCodeNameResources.get({ codeName: "Deceased Reason" }, function (codeValueData) {
                scope.causeOfDeath = codeValueData;
            });

            function getInsuredDocuments(codeValueData) {
                resourceFactory.InsuranceDeceasedDocumentsResource.getAllDeceasedDocuments({ clientId: scope.clientId }, function (data) {
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
            

            scope.getDeceasedDetails = function () {
                resourceFactory.getDeceasedDetailsResource.getDeceasedDetails({ clientId: routeParams.clientId }, {},
                    function (data) {
                        if (angular.isDefined(data) ) {
                            scope.deceasedDetails = data.insuranceClientDeceasedData;
                            scope.clientData = data.clientData;
                            if(scope.deceasedDetails.length > 0) {
                                scope.isDeceasedDetailsCreated = true;
                            }
                            for(var i=0;i<scope.deceasedDetails.length;i++) {
                                    if(scope.deceasedDetails[i].clientType.value == 'INSURED') {
                                    var index = scope.deceasedDetailsData.map(function(item) { return item.clientType; }).indexOf('INSURED');
                                    scope.deceasedDetailsData.splice(index,1);
                                }
                                if(scope.deceasedDetails[i].clientType.value == 'CO-INSURED') {
                                    var index = scope.deceasedDetailsData.map(function(item) { return item.clientType; }).indexOf('CO-INSURED');
                                    scope.deceasedDetailsData.splice(index,1);
                                }
                            }
                            if(scope.deceasedDetailsData.length > 0) {
                                for(var i=0;i<scope.deceasedDetailsData.length;i++) {
                                    scope.deceasedDetailsData[i].deathIntimationDate = new Date();
                                    scope.deceasedDetailsData[i].deathDate = new Date();
                                }
                                scope.isCreateDeceasedDetailsShow= true;
                            } else {
                                scope.isCreateDeceasedDetailsShow= false;
                            }
                        }
                        getDocuments();
                    });
            }

            function getDocuments() {
                for(var i=0;i<scope.deceasedDetailsData.length;i++) {
                    if(scope.deceasedDetailsData[i].clientType == 'INSURED') {
                        scope.getInsuredDocumentsTeplate();
                    }
                    if(scope.deceasedDetailsData[i].clientType == 'CO-INSURED') {
                        scope.getCoInsuredDocumentsTeplate();
                    }
                }
            }
          
            scope.init = function () {
                scope.getDeceasedDetails();
            }
            
            scope.init();

            scope.submit = function () {
                scope.noClientSelected = false;
                scope.isValidationErrorExist = false;
                scope.clientDeceased = {};
                scope.clientDeceased.clientId =  routeParams.clientId;
                scope.clientDeceased.locale = scope.formData.locale;
                scope.clientDeceased.dateFormat = scope.formData.dateFormat;
                scope.clientDeceased.contactNumber = scope.formData.mobileNo;
                scope.clientDeceased.clientDeceasedData = [];
                for(var i = 0 ; i < scope.deceasedDetailsData.length; i++) {
                    if(scope.deceasedDetailsData[i].selected == true) {
                        if(scope.deceasedDetailsData[i].deathDate == undefined || scope.deceasedDetailsData[i].deathIntimationDate  == undefined || scope.deceasedDetailsData[i].causeOfDeathId  == undefined ||
                            scope.deceasedDetailsData[i].placeOfDeath  == undefined || scope.deceasedDetailsData[i].placeOfDeath  == "") {
                            scope.isValidationErrorExist = true;
                        }
                        scope.deceasedDetailsData[i].deathDate =  dateFilter(new Date(scope.deceasedDetailsData[i].deathDate), scope.df);
                        scope.deceasedDetailsData[i].deathIntimationDate =  dateFilter(new Date(scope.deceasedDetailsData[i].deathIntimationDate), scope.df);
                        delete scope.deceasedDetailsData[i].selected;
                        scope.clientDeceased.clientDeceasedData.push(scope.deceasedDetailsData[i]);
                    }
                }
                if (scope.clientDeceased && scope.clientDeceased.clientDeceasedData && scope.clientDeceased.clientDeceasedData.length > 0 && !scope.isValidationErrorExist) {
                    resourceFactory.postDeceasedDetailsResource.save(scope.clientDeceased, function (data) {
                        scope.init();
                        scope.insuredDocumentTagOptions = null;
                        scope.coInsuredDocumentTagOptions = null;
                    });
                } else {
                    scope.noClientSelected = true;
                }

            }

            scope.editDeceasedDetails = function () {
                scope.getTemplate();
                scope.announceDate = dateFilter(new Date(scope.deceasedDetailsData.announceDate), scope.df);
                scope.deceasedDate = new Date(scope.deceasedDetailsData.deceasedDate);
                scope.formData.deceasedPerson = scope.deceasedDetailsData.deceasedPerson.id;
                scope.formData.deceasedReason = scope.deceasedDetailsData.deceasedReason.id;
                scope.isDeceasedDetailsCreated = false;
            }


            scope.deleteInsuredDocument = function (doc) {
                $modal.open({
                    templateUrl: 'deleteDocument.html',
                    controller: InsuredDocumentDeleteCtrl,
                    resolve: {
                        document: function () {
                            return doc;
                        }
                    }
                });
            };

            scope.deleteCoInsuredDocument = function (doc) {
                $modal.open({
                    templateUrl: 'deleteDocument.html',
                    controller: CoInsuredDocumentDeleteCtrl,
                    resolve: {
                        document: function () {
                            return doc;
                        }
                    }
                });
            };

            var InsuredDocumentDeleteCtrl = function ($scope, $modalInstance, document) {
                $scope.delete = function () {
                    resourceFactory.InsuranceDeceasedDeleteDocumentsResource.deleteDocument({ clientId: scope.clientId, documentId: document.documentId }, '', function (data) {
                        for (var j = 0; j < scope.insuredDocumentTagOptions.length; j++) {
                            if (document.documentId == scope.insuredDocumentTagOptions[j].documentId) {
                                delete scope.insuredDocumentTagOptions[j].url;
                                scope.insuredDocumentTagOptions[j].isDocumentAttached = false;
                                delete scope.insuredDocumentTagOptions[j].parentEntityType;
                                delete scope.insuredDocumentTagOptions[j].parentEntityId;
                                delete scope.insuredDocumentTagOptions[j].documentId;
                                break;
                            }
                        }

                        getInsuredDocuments(scope.insuredDocumentTagOptions);
                        $modalInstance.close('close');
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            var CoInsuredDocumentDeleteCtrl = function ($scope, $modalInstance, document) {
                $scope.delete = function () {
                    resourceFactory.InsuranceDeceasedDeleteDocumentsResource.deleteDocument({ clientId: scope.clientId, documentId: document.documentId }, '', function (data) {
                        for (var j = 0; j < scope.coInsuredDocumentTagOptions.length; j++) {
                            if (document.documentId == scope.coInsuredDocumentTagOptions[j].documentId) {
                                delete scope.coInsuredDocumentTagOptions[j].url;
                                scope.coInsuredDocumentTagOptions[j].isDocumentAttached = false;
                                delete scope.coInsuredDocumentTagOptions[j].parentEntityType;
                                delete scope.coInsuredDocumentTagOptions[j].parentEntityId;
                                delete scope.coInsuredDocumentTagOptions[j].documentId;
                                break;
                            }
                        }

                        getInsuredDocuments(scope.coInsuredDocumentTagOptions);
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
                        url: $rootScope.hostUrl + API_VERSION + '/clients/' + scope.clientId + '/documents',
                        data: $scope.formData,
                        file: $scope.file
                    }).then(function (data) {
                        // to fix IE not refreshing the model
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                        getInsuredDocuments(scope.insuredDocumentTagOptions);
                        getInsuredDocuments(scope.coInsuredDocumentTagOptions);
                        $modalInstance.close('close');
                    });
                };
            };
        }
    });
    mifosX.ng.application.controller('ClientDeceasedController', ['$controller', '$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'CommonUtilService', '$modal', mifosX.controllers.ClientDeceasedController]).run(function ($log) {
        $log.info("ClientDeceasedController initialized");
    });
}(mifosX.controllers || {}));