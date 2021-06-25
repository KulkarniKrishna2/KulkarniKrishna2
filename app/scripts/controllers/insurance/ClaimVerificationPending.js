(function (module) {
    mifosX.controllers = _.extend(module, {
        ClaimVerificationPending: function ($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope,CommonUtilService, $modal) {
            
            scope.repeatFormData = {};
            scope.deceasedId = routeParams.id;
            scope.formData = {};
            scope.formData.locale = scope.optlang.code;
            function fetchInsuranceData() {
                resourceFactory.getInsuranceClaimStatusDetailsResource.getClaimIntimationApproval({ claimStatus: 'ClaimVerificationPending', deceasedId : scope.deceasedId }, {},
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
                            getDeceasedDocuments();
                        } else {
                            scope.showSummary = false;
                        }
                    });
            };

            fetchInsuranceData();

            function calculateClientAge(dateOfBirth){
                dateOfBirth = new Date(dateFilter(dateOfBirth, scope.df));
                var ageDifMs = Date.now() - dateOfBirth.getTime();
                var ageDifMs = Date.now() - dateOfBirth.getTime();
                var ageDate = new Date(ageDifMs); // miliseconds from epoch
                scope.age = Math.abs(ageDate.getUTCFullYear() - 1970);
            }

            scope.approve = function () {
                resourceFactory.insuranceClaimStatusDetailsResource.approveClaimIntimationApproval({ claimStatus: 'ClaimVerificationPending', command : 'approve' }, {deceasedId : scope.deceasedId},
                    function (data) {
                        scope.insuranceCliamDetials = data;
                        location.path('/insurancedetails/claimverificationpending');
                    });
            }

            scope.reject = function () {
                $modal.open({
                    templateUrl: 'rejectClaim.html',
                    controller: RejectCtrl
                });
            };

            var RejectCtrl = function ($scope, $modalInstance) {

                resourceFactory.codeValueByCodeNameResources.get({ codeName: "Insurance Reject Reason" }, function (codeValueData) {
                    $scope.rejectReasons = codeValueData;
                });
                $scope.rejectFormData = {};
                $scope.submitReject = function () {
                    $scope.rejectFormData.deceasedId = scope.deceasedId;
                    resourceFactory.insuranceClaimStatusDetailsResource.approveClaimIntimationApproval({ claimStatus: 'ClaimVerificationPending', command : 'reject' }, $scope.rejectFormData,
                    function (data) {
                        $modalInstance.dismiss('cancel');
                        scope.insuranceCliamDetials = data;
                        location.path('/insurancedetails/claimverificationpending');
                    });
                };
                $scope.cancelReject = function () {
                    $modalInstance.dismiss('cancel');
                };
            };


            scope.getHistory = function () {
                $modal.open({
                    templateUrl: 'views/insurance/viewinsurancelogs.html',
                    controller: InsuranceLogCtrl,
                    windowClass: 'app-modal-window-full-screen',
                });
            }

            var InsuranceLogCtrl = function ($scope, $modalInstance) {
                
                resourceFactory.insuranceDeceasedLogResource.getDeacesdLogs({}, {deceasedId : scope.deceasedId},
                    function (data) {
                        $scope.insuranceDeceasedLogs = data;
                    });
               $scope.close = function () {
                   $modalInstance.close('close');
               };

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

            function getDeceasedDocuments() {
                resourceFactory.insuranceDocumentsResource.getAllDeceasedDocuments({deceasedId: scope.deceasedId}, function (data) {
                        for (var l = 0; l < data.length; l++) {
                                if (data[l].id) {
                                        var url = {};
                                        url = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment';
                                        data[l].docUrl = url;
                                        data[l].documentId = data[l].id;
                                        data[l].isDocumentAttached = true;
                                        data[l].allowDeleteDocument = false;
                                    
                                }
                            }
                            scope.insuranceDocumentTagOptions = data;
                    });
                
            };

            scope.download = function(file){
                var url = $rootScope.hostUrl + file.docUrl;
                var fileType = file.fileName.substr(file.fileName.lastIndexOf('.') + 1);
                CommonUtilService.downloadFile(url,fileType,file.fileName);
            };
        }
    });
    mifosX.ng.application.controller('ClaimVerificationPending', ['$controller', '$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'CommonUtilService', '$modal', mifosX.controllers.ClaimVerificationPending]).run(function ($log) {
        $log.info("ClaimVerificationPending initialized");
    });
}(mifosX.controllers || {}));