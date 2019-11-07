(function (module) {
    mifosX.controllers = _.extend(module, {
        ClaimDocumentsUpload: function ($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope,CommonUtilService, $modal) {
            angular.extend(this, $controller('defaultUIConfigController', {
                $scope: scope,
                $key: "bankAccountDetails"
            }));

            scope.repeatFormData = {};
            scope.deceasedId = routeParams.id;
            scope.formData = {};
            scope.formData.locale = scope.optlang.code;
            function fetchInsuranceData() {
                resourceFactory.getInsuranceClaimStatusDetailsResource.getClaimIntimationApproval({ claimStatus: 'documentsupload', deceasedId : scope.deceasedId }, {},
                    function (data) {
                        scope.insuranceCliamDetials = data;
                        calculateClientAge(scope.insuranceCliamDetials.dateOfBirth);
                        getNomineeDetails(scope.deceasedId);
                    });
            };

            function getNomineeDetails(deceasedId) {
                resourceFactory.getInsuranceNomineeDetailsResource.getNomineeDetails({ deceasedId : scope.deceasedId }, {},
                    function (data) {
                        scope.insuranceNomineeDetials = data;
                        if(scope.insuranceNomineeDetials != undefined && scope.insuranceNomineeDetials.id != undefined && scope.insuranceNomineeDetials.id != null) {
                            scope.showSummary = true;
                            getDocumentsTeplate();
                        } else {
                            scope.showSummary = false;
                        }
                    });
            };

            resourceFactory.codeValueByCodeNameResources.get({codeName: "Relationship"}, function (codeValueData) {
                scope.relationships = codeValueData;
            });


            function getDocumentsTeplate() {
                resourceFactory.codeValueByCodeNameResources.get({codeName: "Insurance Document Tags"}, function (codeValueData) {
                    scope.insuranceDocumentTagOptions = codeValueData;
                    getDeceasedDocuments(codeValueData);
                });
            }

            fetchInsuranceData();

            function calculateClientAge(dateOfBirth){
                dateOfBirth = new Date(dateFilter(dateOfBirth, scope.df));
                var ageDifMs = Date.now() - dateOfBirth.getTime();
                var ageDifMs = Date.now() - dateOfBirth.getTime();
                var ageDate = new Date(ageDifMs); // miliseconds from epoch
                scope.age = Math.abs(ageDate.getUTCFullYear() - 1970);
            }

            scope.submit = function () {

                scope.formData.deceasedId = scope.deceasedId;
                resourceFactory.insuranceClaimStatusDetailsResource.submitNomineeDetails({ claimStatus: 'documentsupload', command : 'create' }, scope.formData,
                    function (data) {
                        scope.insuranceCliamDetials = data;
                        fetchInsuranceData();
                    });
            }

            scope.approve = function () {
                resourceFactory.insuranceClaimStatusDetailsResource.submitClaimDocumentUpload({ claimStatus: 'documentsupload', command : 'submit' }, {deceasedId : scope.deceasedId},
                    function (data) {
                        scope.insuranceCliamDetials = data;
                        location.path('/insurancedetails');
                    });
            }

            scope.getBankDetails = function(isvalidIfsc){
                if(scope.formData.ifscCode != undefined && scope.formData.ifscCode === scope.repeatFormData.ifscCodeRepeat && isvalidIfsc){
                    resourceFactory.bankIFSCResource.get({
                        ifscCode: scope.formData.ifscCode
                    },function (data) {
                        scope.bankData = data;
                        scope.formData.bankName = scope.bankData.bankName;
                        scope.formData.branchName = scope.bankData.branchName;
                        scope.formData.bankCity = scope.bankData.bankCity;
                    })
                }
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

            function getDeceasedDocuments(codeValueData) {
                resourceFactory.insuranceDocumentsResource.getAllDeceasedDocuments({deceasedId: scope.deceasedId}, function (data) {
                        for(var j = 0 ; j<codeValueData.length; j++) {
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
                                        break;
                                    }
                                }
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
                 $scope.formData = {} ;
                 $scope.formData.tagIdentifier = documentDetail.id;
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
 
        }
    });
    mifosX.ng.application.controller('ClaimDocumentsUpload', ['$controller', '$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'CommonUtilService', '$modal', mifosX.controllers.ClaimDocumentsUpload]).run(function ($log) {
        $log.info("ClaimDocumentsUpload initialized");
    });
}(mifosX.controllers || {}));