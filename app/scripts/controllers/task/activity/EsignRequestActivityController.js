(function (module) {
    mifosX.controllers = _.extend(module, {
        EsignRequestActivityController: function ($controller, scope, $modal, resourceFactory, $rootScope, commonUtilService, API_VERSION) {
            angular.extend(this, $controller('defaultActivityController', {
                $scope: scope
            }));
            scope.loanApplicationId = scope.taskconfig['loanApplicationId'];
            scope.clientId = scope.taskconfig['clientId'];
            if (scope.loanApplicationId) {
                scope.entityType = 'Loan Applications';
                scope.entityId = scope.loanApplicationId;
            } else if (scope.clientId) {
                scope.entityType = 'client'
                scope.entityId = scope.clientId;
            }

            scope.fetchAll = function () {
                resourceFactory.esignRequestByEntityResource.getAll({ entityType: scope.entityType, entityId: scope.entityId }, function (data) {
                    scope.esignRequestList = data;
                    scope.documentEntityName = scope.esignRequestList[0].documentManagementEntityType.toLowerCase();
                });
            }
            scope.fetchAll();

            scope.requestEsign = function (index, generatedDocId) {
                var templateUrl = 'views/task/popup/createesignrequest.html';
                $modal.open({
                    templateUrl: templateUrl,
                    controller: CreateEsignRequestCtrl,
                    windowClass: 'modalwidth700',
                    resolve: {
                        requestData: function () {
                            return { 'generatedDocId': generatedDocId, 'index': index };
                        }
                    }
                });
            }

            var CreateEsignRequestCtrl = function ($scope, $modalInstance, requestData) {

                resourceFactory.esignRequestTemplateResource.get({}, function (data) {
                    $scope.template = data;
                });

                $scope.submit = function () {
                    this.formData.documentId = requestData.generatedDocId;
                    this.formData.entityId = scope.entityId;
                    this.formData.entityType = scope.entityType;
                    resourceFactory.requestEsignResource.save({}, this.formData, function (data) {
                        resourceFactory.requestEsignResource.get({ esignRequestId: data.resourceId }, function (data) {
                            var temp = scope.esignRequestList[requestData.index];
                            temp.esignRequestId = data.esignRequestId;
                            temp.esignStatus = data.esignStatus;
                            temp.unsignedDocumentId = data.unsignedDocumentId;
                        });
                        $modalInstance.close();
                    });
                }

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }

            scope.cancelEsignRequest = function (esignRequestId) {
                resourceFactory.cancelEsignRequestResource.cancel({ esignRequestId: esignRequestId }, function (data) {
                    scope.fetchAll();
                });
            }

            scope.refreshEsignRequest = function (index, esignRequestId) {
                resourceFactory.refreshEsignRequestResource.refresh({ esignRequestId: esignRequestId }, function (data) {
                    resourceFactory.requestEsignResource.get({ esignRequestId: esignRequestId }, function (temp) {
                        scope.esignRequestList[index].esignStatus = temp.esignStatus;
                        scope.esignRequestList[index].signedDocumentId = temp.signedDocumentId;
                    });
                });
            }

            var viewDocumentCtrl = function ($scope, $modalInstance, documentDetail) {
                $scope.data = documentDetail;
                $scope.close = function () {
                    $modalInstance.close('close');
                };

            };
            scope.openViewDocument = function (documentId) {
                var documentDetail = {
                    id: documentId,
                    parentEntityType: scope.documentEntityName,
                    parentEntityId: scope.entityId
                };
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

            scope.download = function (documentId, fileName) {
                var url = documentsURL(documentId);
                var fileType = fileName.substr(fileName.lastIndexOf('.') + 1);
                if (!_.isEmpty(fileType)) {
                    fileType = 'pdf'
                    fileName = fileName + '.' + fileType;
                }
                commonUtilService.downloadFile(url, fileType, fileName);
            };

            function documentsURL(documentId) {
                return $rootScope.hostUrl + API_VERSION + '/' + scope.documentEntityName + '/' + scope.entityId + '/documents/' + documentId + '/attachment';
            };

            scope.generateDocument = function (reportId) {
                resourceFactory.reportGenerateResource.generate({
                    entityType: scope.documentEntityName,
                    entityId: scope.entityId,
                    reportId: reportId
                }, function (data) {
                    scope.fetchAll();
                })
            };
        }
    });
    mifosX.ng.application.controller('EsignRequestActivityController', ['$controller', '$scope', '$modal', 'ResourceFactory', '$rootScope', 'CommonUtilService', 'API_VERSION', mifosX.controllers.EsignRequestActivityController]).run(function ($log) {
        $log.info("EsignRequestActivityController initialized");
    });
}(mifosX.controllers || {}));