(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewLoanUtilizationCheckController: function (scope, routeParams, resourceFactory, location, $modal, route, dateFilter,API_VERSION, $upload, $rootScope) {
            scope.entityType = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            scope.loanId = routeParams.loanId;
            scope.utilizationCheckId = routeParams.utilizationCheckId;
            scope.formData = {};
            scope.showUploadDocument = false;
            scope.lucEntityType = "loanutilizationcheck";

            resourceFactory.loanUtilizationCheck.get({
                loanId: scope.loanId,
                utilizationCheckId: scope.utilizationCheckId
             }, function (data) {
                scope.luc = data;
                scope.luc.auditDoneOn = dateFilter(new Date(scope.luc.auditDoneOn),scope.df);
            });

            resourceFactory.documentsResource.getAllDocuments({entityType: scope.lucEntityType,entityId: routeParams.utilizationCheckId}, function (data) {
                scope.lucDocuments = data;
                 for (var l = 0; l < scope.lucDocuments.length; l++) {
                            if (scope.lucDocuments[l].id) {
                                var loandocs = {};
                                loandocs = API_VERSION + '/' + scope.lucDocuments[l].parentEntityType + '/' + scope.lucDocuments[l].parentEntityId + '/documents/' + scope.lucDocuments[l].id + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                                scope.lucDocuments[l].docUrl = loandocs;
                            }
                    }
            });

            scope.onFileSelect = function ($files) {
                scope.file = $files[0];
            };

            scope.submit = function () {
                $upload.upload({
                    url: $rootScope.hostUrl + API_VERSION + '/'+scope.lucEntityType+'/' + scope.utilizationCheckId + '/documents',
                    data: scope.formData,
                    file: scope.file
                }).then(function (data) {
                        route.reload();
                });
            };

            scope.showEdit = function() {
                location.path('/'+scope.entityType+'/'+scope.entityId+'/loans/'+scope.loanId+'/editloanutilization/'+scope.utilizationCheckId);
            }

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

            scope.deleteDocument = function (document) {
                resourceFactory.documentsResource.delete({entityType: scope.lucEntityType,entityId: routeParams.utilizationCheckId, documentId: document.id}, '', function (data) {
                    route.reload();
                });
            };
        }
    });
    mifosX.ng.application.controller('ViewLoanUtilizationCheckController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', 'dateFilter','API_VERSION', '$upload', '$rootScope', mifosX.controllers.ViewLoanUtilizationCheckController]).run(function ($log) {
        $log.info("ViewLoanUtilizationCheckController initialized");
    });

}(mifosX.controllers || {}));