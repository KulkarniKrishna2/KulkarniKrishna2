(function (module) {
    mifosX.controllers = _.extend(module, {
        loanapplicationQualityCheckActivityController: function ($modal, $controller, scope, resourceFactory, API_VERSION, http, routeParams, API_VERSION, $rootScope, CommonUtilService, $sce) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));
            scope.formValidationData = {};
            scope.identitydocuments = [];
            function fetchClientData() {

                resourceFactory.clientResource.get({ clientId: scope.clientId }, function (data) {
                    scope.clientData = data;
                    if (data.staffId != null) {
                        scope.formValidationData.loanOfficerId = data.staffId;
                    }
                    if (data.imagePresent) {
                        http({
                            method: 'GET',
                            url: $rootScope.hostUrl + API_VERSION + '/client/' + scope.clientId + '/images'
                        }).then(function (imageData) {
                            scope.imageData = imageData.data[0];
                            http({
                                method: 'GET',
                                url: $rootScope.hostUrl + API_VERSION + '/client/' + routeParams.id + '/images/' + scope.imageData.imageId + '?maxHeight=860'
                            }).then(function (imageData) {
                                scope.image = imageData.data;
                            });
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
                });

                resourceFactory.clientResource.getAllClientDocuments({ clientId: scope.clientId, anotherresource: 'identifiers' }, function (data) {
                    scope.identitydocuments = data;
                    for (var i = 0; i < scope.identitydocuments.length; i++) {
                        resourceFactory.clientIdentifierResource.get({ clientIdentityId: scope.identitydocuments[i].id }, function (data) {
                            for (var j = 0; j < scope.identitydocuments.length; j++) {
                                if (data.length > 0 && scope.identitydocuments[j].id == data[0].parentEntityId) {
                                    for (var l in data) {

                                        var loandocs = {};
                                        loandocs = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment';
                                        data[l].docUrl = loandocs;

                                    }
                                    scope.identitydocuments[j].documents = data;
                                }
                            }
                        });
                    }
                });

                scope.viewIdentityDocument = function (document) {
                    var url = $rootScope.hostUrl + document.docUrl;
                    url = $sce.trustAsResourceUrl(url);
                    http.get(url, { responseType: 'arraybuffer' }).
                        success(function (data, status, headers, config) {
                            var supportedContentTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/html', 'application/xml', 'text/plain'];
                            var contentType = headers('Content-Type');
                            var file = new Blob([data], { type: contentType });
                            var fileContent = URL.createObjectURL(file);
                            if (supportedContentTypes.indexOf(contentType) > -1) {
                                var docData = $sce.trustAsResourceUrl(fileContent);
                                window.open(docData);
                            }
                        });
                }

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

