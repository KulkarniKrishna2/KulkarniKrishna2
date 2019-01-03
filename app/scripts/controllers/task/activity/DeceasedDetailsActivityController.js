(function (module) {
    mifosX.controllers = _.extend(module, {
        DeceasedDetailsActivityController: function ($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope,commonUtilService, $modal) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));
            scope.deceasedReasonOptions = [];
            scope.deceasedPersonOptions = [];
            scope.formData = {};
            scope.formData.locale = scope.optlang.code;
            scope.formData.dateFormat = scope.df;
            scope.isDeceasedDetailsCreated = false;
            scope.formDocumentData = {};
            scope.showUploadDocument = false;
            scope.documents = [];
            scope.statusCompleted = "taskStatus.completed";
            scope.getDeceasedDetails = function () {
                resourceFactory.deceasedDetailsResource.get({ clientId: scope.clientId }, {},
                    function (data) {
                        if (angular.isDefined(data) && angular.isDefined(data.id)) {
                            scope.deceasedDetailsData = data;
                            scope.isDeceasedDetailsCreated = true;                          
                            scope.deceasedDetailsId = data.id;
                            scope.getDocuments();
                        }
                    });
            }

            scope.getTemplate = function () {
                resourceFactory.deceasedDetailsTemplateResource.get({ clientId: scope.clientId },
                    function (data) {
                        scope.deceasedReasonOptions = data.deceasedReasonOptions;
                        scope.deceasedPersonOptions = data.deceasedPersonOptions;
                    });
            }
            scope.getDocuments = function(){
                if(scope.deceasedDetailsId){
                    resourceFactory.documentsResource.getAllDocuments({ entityType:'deceased_details',entityId:scope.deceasedDetailsId }, {},
                        function (data) {
                            for(var i in data){
                                var docs = {};
                                docs = API_VERSION + '/' + data[i].parentEntityType + '/' + data[i].parentEntityId + '/documents/' + data[i].id + '/attachment';
                                data[i].docUrl = docs;
                            }
                            scope.documents = data;
                        });
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
                var url =$rootScope.hostUrl + file.docUrl;
                var fileType = file.fileName.substr(file.fileName.lastIndexOf('.') + 1);
                commonUtilService.downloadFile(url,fileType);
            };

            scope.init = function () {
                scope.formDocumentData = {};
                scope.showUploadDocument = false;
                scope.getDeceasedDetails();
                if (!scope.isDeceasedDetailsCreated) {
                    scope.getTemplate();
                }
                
            }

            
            scope.init();
            scope.submit = function () {
                scope.formData.announceDate = dateFilter(scope.announceDate, scope.df);
                scope.formData.deceasedDate = dateFilter(scope.deceasedDate, scope.df);
                if (scope.deceasedDetailsId) {
                    resourceFactory.deceasedDetailsResource.update({ clientId: scope.clientId, deceasedDetailsId: scope.deceasedDetailsId }, this.formData,
                        function (data) {
                            scope.init();
                            scope.isDeceasedDetailsCreated = true;
                        });
                } else {
                    resourceFactory.deceasedDetailsResource.save({ clientId: scope.clientId }, this.formData,
                        function (data) {
                            scope.init();
                            scope.isDeceasedDetailsCreated = true;
                        });
                }

            };

            scope.editDeceasedDetails = function () {
                scope.getTemplate();
                scope.announceDate = new Date(scope.deceasedDetailsData.announceDate);
                scope.deceasedDate = new Date(scope.deceasedDetailsData.deceasedDate);
                scope.formData.deceasedPerson = scope.deceasedDetailsData.deceasedPerson.id;
                scope.formData.deceasedReason = scope.deceasedDetailsData.deceasedReason.id;
                scope.isDeceasedDetailsCreated = false;
            }

            scope.onFileSelect = function ($files) {
                scope.file = $files[0];
            };

            scope.submitUpload = function () {
                $upload.upload({
                    url:  $rootScope.hostUrl + API_VERSION + '/deceased_details/' + scope.deceasedDetailsId + '/documents',
                    data: scope.formDocumentData,
                    file: scope.file
                }).then(function (data) {
                        // to fix IE not refreshing the model
                        if (!scope.$$phase) {
                          scope.$apply();
                        }
                        scope.init();
                    });
            };

            scope.deleteFile = function(file){
                resourceFactory.documentsResource.delete({ entityType:file.parentEntityType,entityId:file.parentEntityId,documentId: file.id}, {},
                        function (data) {
                            scope.getDocuments();
                        });
            }


        }
    });
    mifosX.ng.application.controller('DeceasedDetailsActivityController', ['$controller', '$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'commonUtilService', '$modal', mifosX.controllers.DeceasedDetailsActivityController]).run(function ($log) {
        $log.info("DeceasedDetailsActivityController initialized");
    });
}(mifosX.controllers || {}));