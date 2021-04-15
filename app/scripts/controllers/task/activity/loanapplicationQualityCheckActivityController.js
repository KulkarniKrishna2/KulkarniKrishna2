(function (module) {
    mifosX.controllers = _.extend(module, {
        loanapplicationQualityCheckActivityController: function ($modal, $controller, scope, resourceFactory, API_VERSION, http, routeParams, API_VERSION, $rootScope, CommonUtilService, $sce) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));
            scope.formValidationData = {};
            scope.identitydocuments = [];
            scope.clientdocuments = [];
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



                resourceFactory.clientDocumentsResource.getAllClientDocuments({clientId: scope.clientId}, function (data) {
                    scope.clientdocuments = {};
                    for (var l = 0; l < data.length; l++) {
                        if (data[l].id) {
                            var loandocs = {};
                            loandocs = $rootScope.hostUrl + API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id  + '/download';                         
                            data[l].docUrl = loandocs;
                        }
                        scope.pushDocumentToTag(data[l], 'uploadedDocuments');
                    }
                });

                scope.pushDocumentToTag = function(document, tagValue){
                    if (scope.clientdocuments.hasOwnProperty(tagValue)) {
                        scope.clientdocuments[tagValue].push(document);
                    } else {
                        scope.clientdocuments[tagValue] = [];
                        scope.clientdocuments[tagValue].push(document);
                    }
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

            scope.download = function (file) {
                var url = $rootScope.hostUrl + file.docUrl;
                var fileType = file.fileName.substr(file.fileName.lastIndexOf('.') + 1);
                CommonUtilService.downloadFile(url, fileType);
            }

        }
    });
    mifosX.ng.application.controller('loanapplicationQualityCheckActivityController', ['$modal', '$controller', '$scope', 'ResourceFactory', 'API_VERSION', '$http', '$routeParams', 'API_VERSION', '$rootScope', 'CommonUtilService', '$sce', mifosX.controllers.loanapplicationQualityCheckActivityController]).run(function ($log) {
        $log.info("loanapplicationQualityCheckActivityController initialized");
    });
}(mifosX.controllers || {}));

