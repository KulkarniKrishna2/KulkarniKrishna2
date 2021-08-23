(function (module) {
    mifosX.controllers = _.extend(module, {
        loanapplicationQualityCheckActivityController: function ($modal, $controller, scope, resourceFactory, API_VERSION, http, routeParams, API_VERSION, $rootScope, CommonUtilService, $sce) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));
            scope.formValidationData = {};
            scope.identitydocuments = [];
            scope.clientdocuments = {};
            scope.loandocuments = {};
            scope.bankAccountDetails = [];
            scope.bankDocuments = [];
            scope.familyDetails = [];
            scope.isS3Enabled = scope.isSystemGlobalConfigurationEnabled(scope.globalConstants.AMAZON_S3);
            function fetchClientData() {

                resourceFactory.clientResource.get({ clientId: scope.clientId }, function (data) {
                    scope.clientData = data;
                    if (data.staffId != null) {
                        scope.formValidationData.loanOfficerId = data.staffId;
                    }
                    if (data.imagePresent) {
                        var params = '';
                    if(scope.isS3Enabled){
                        params = '?maxHeight=150&downloadableUrl=true';
                    }
                        http({
                            method: 'GET',
                            url: $rootScope.hostUrl + API_VERSION + '/client/' + scope.clientId + '/images' + params
                        }).then(function (imageData) {
                            scope.imageData = imageData.data[0];
                            if(scope.imageData.storageType == 1 || !scope.isS3Enabled){
                                http({
                                    method: 'GET',
                                    url: $rootScope.hostUrl + API_VERSION + '/client/' + routeParams.id + '/images/'+scope.imageData.imageId+'?maxHeight=150'
                                }).then(function (imageData) {
                                    scope.image = imageData.data;
                                });
                            }else{
                                scope.image = scope.imageData.downloadableUrl;
                            }
                        });
                    }
                });

                resourceFactory.addressDataResource.getAll({
                    entityType: 'clients', entityId: scope.clientId
                }, function (response) {
                    if (response != null) {
                        scope.addressData = response;
                    }
                });
                resourceFactory.clientResource.getAllClientDocuments({ clientId: scope.clientId, anotherresource: 'identifiers' }, function (data) {
                    scope.identitydocuments = data;
                });

                resourceFactory.familyDetails.getAll({ clientId: scope.clientId }, function (data) {
                    for (var l in data) {
                        if (data[l].relationship != undefined && data[l].relationship.name == 'Spouse') {
                            scope.spouse = data[l];
                        }
                    }
                    scope.familyDetails = data;
                });

                
                resourceFactory.bankAccountDetailsResource.getAll({entityType: 'clients', entityId: scope.clientId, status: 'all'}, function (data) {
                    scope.bankAccountDetails = data;
                    for(var k = 0; k < data.length; k++){
                        resourceFactory.bankAccountDetailsDocumentsResource.getAllDocuments({entityType: 'clients', entityId: scope.clientId, bankAccountDetailsId: data[k].id}, function (documentsData) {
                            scope.bankDocuments = documentsData.bankAccountDocuments || [];
                    for (var i = 0; i < scope.bankDocuments.length; i++) {
                        var docs = {};                      
                            docs = $rootScope.hostUrl + API_VERSION + '/' + scope.bankDocuments[i].parentEntityType + '/' + scope.bankDocuments[i].parentEntityId + '/documents/' + scope.bankDocuments[i].id + '/download';       
                        scope.bankDocuments[i].docUrl = docs;
                    }
                        });  
                    }
                });



                function documentsURL(document){
                    return API_VERSION + '/' + document.parentEntityType + '/' + document.parentEntityId + '/documents/' + document.id + '/attachment';
                };
    
                scope.getLoanDocuments = function() {
                    resourceFactory.documentsResource.getAllDocuments({entityType: "loanapplication", entityId:  scope.loanApplicationReferenceId}, function (data) {
                        scope.loandocuments = {};
                        for (var l = 0; l < data.length; l++) {
                            if (data[l].id) {
                                data[l].docUrl = documentsURL(data[l]);
                            }
                            if (data[l].tagValue && !scope.restrictTaggedDocuments) {
                                scope.pushLoanDocumentToTag(data[l], data[l].tagValue);
                            } else if (!data[l].tagValue) {
                                scope.pushLoanDocumentToTag(data[l], 'uploadedDocuments');
                            }
                        }
                    });
                };
    
    
                scope.pushLoanDocumentToTag = function (document, tagValue) {
                    if (scope.loandocuments.hasOwnProperty(tagValue)) {
                        scope.loandocuments[tagValue].push(document);
                    } else {
                        scope.loandocuments[tagValue] = [];
                        scope.loandocuments[tagValue].push(document);
                    }
                }
    
                scope.clientDocumentsLoaded = false;
                scope.getClientDocuments = function () {
                    if(!scope.clientDocumentsLoaded) {
                        resourceFactory.clientDocumentsResource.getAllClientDocuments({clientId:  scope.clientId}, function (data) {
                            scope.clientdocuments = {};
                            for (var l = 0; l < data.length; l++) {
                                if (data[l].id) {
                                    data[l].docUrl = documentsURL(data[l]);
                                }
                                if(data[l].tagValue){
                                    scope.pushClientDocumentToTag(data[l], data[l].tagValue);
                                } else {
                                    scope.pushClientDocumentToTag(data[l], 'uploadedDocuments');
                                }
                            }
                        });
                        scope.clientDocumentsLoaded = true;
                    }
                };
    
                scope.pushClientDocumentToTag = function(document, tagValue){
                    if (scope.clientdocuments.hasOwnProperty(tagValue)) {
                        scope.clientdocuments[tagValue].push(document);
                    } else {
                        scope.clientdocuments[tagValue] = [];
                        scope.clientdocuments[tagValue].push(document);
                    }
                };
    
                var viewDocumentCtrl= function ($scope, $modalInstance, documentDetail) {
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
    
                scope.download = function(file){
                    var url = $rootScope.hostUrl + file.docUrl;
                    var fileType = file.fileName.substr(file.fileName.lastIndexOf('.') + 1);
                    commonUtilService.downloadFile(url,fileType,file.fileName);
                };
    


            }

            scope.viewDocument = function(docUrl) {
                var url = docUrl;
                http({
                    method: 'GET',
                    url: url
                }).then(function (documentImage) {
                    scope.selectedImageUrl = documentImage.data;
                });
            }

            scope.showImageModal = function (name, imageUrl) {
                scope.selectedImageName = name;
                scope.selectedImageUrl = imageUrl;
                $modal.open({
                    templateUrl: 'viewImageModal.html',
                    controller: ViewImageCtrl,
                    size: "lg"
                });
            };
            var ViewImageCtrl = function ($scope, $modalInstance) {
                $scope.selectedImageName = scope.selectedImageName;
                $scope.selectedImageUrl = scope.selectedImageUrl;
                $scope.cancelImageModal = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            function initTask() {
                scope.loanApplicationReferenceId = scope.taskconfig['loanApplicationId'];
                scope.clientId = scope.taskconfig['clientId'];
                fetchClientData();
                if (scope.taskData.stepData == undefined) {
                    scope.taskData.stepData = {};
                }
            }

            initTask();

        }
    });
    mifosX.ng.application.controller('loanapplicationQualityCheckActivityController', ['$modal', '$controller', '$scope', 'ResourceFactory', 'API_VERSION', '$http', '$routeParams', 'API_VERSION', '$rootScope', 'CommonUtilService', '$sce', mifosX.controllers.loanapplicationQualityCheckActivityController]).run(function ($log) {
        $log.info("loanapplicationQualityCheckActivityController initialized");
    });
}(mifosX.controllers || {}));

