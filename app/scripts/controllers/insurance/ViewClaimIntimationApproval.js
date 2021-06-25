(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewClaimIntimationApproval: function ($controller, scope, resourceFactory, location, dateFilter, $http, routeParams, API_VERSION, $upload, $rootScope,CommonUtilService, $modal) {
            
            scope.deceasedId = routeParams.id;
            scope.showPreview = false;

            function fetchInsuranceData() {
                resourceFactory.getInsuranceClaimStatusDetailsResource.getClaimIntimationApproval({ claimStatus: 'intimationapprovalpending', deceasedId: scope.deceasedId }, {},
                    function (data) {
                        scope.insuranceCliamDetials = data;
                        calculateClientAge(scope.insuranceCliamDetials.dateOfBirth);
                        if (scope.insuranceCliamDetials.insuredClientType.value == 'INSURED') {
                            scope.codeName = "Insured Deceased Document Tags";
                        } else {
                            scope.codeName = "CoInsured Deceased Document Tags";
                        }
                        scope.getInsuredDocumentsTeplate();
                    });
            };

            fetchInsuranceData();


            scope.getInsuredDocumentsTeplate = function ()  {
                resourceFactory.codeValueByCodeNameResources.get({codeName: scope.codeName}, function (codeValueData) {
                    scope.insuranceDocumentTagOptions = codeValueData;
                    getInsuredDocuments(codeValueData);
                });
            }

            function getInsuredDocuments(codeValueData) {
                resourceFactory.InsuranceDeceasedDocumentsResource.getAllDeceasedDocuments({ clientId: scope.insuranceCliamDetials.clientId }, function (data) {
                    for (var j = 0; j < codeValueData.length; j++) {
                        for (var l = 0; l < data.length; l++) {
                            if (data[l].id) {
                                if (data[l].tagIdentifier == codeValueData[j].id) {
                                    var url = {};
                                    url = $rootScope.hostUrl + API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/download';
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
                    scope.insuranceDocumentTagOptions = codeValueData;
                });

            };

            var viewDocumentCtrl = function ($scope, $modalInstance, document) {
                $scope.data = document;
                $scope.close = function () {
                    $modalInstance.close('close');
                };

            };
            scope.openViewDocument = function (document) {
                $modal.open({
                    templateUrl: 'viewDocument.html',
                    controller: viewDocumentCtrl,
                    resolve: {
                        document: function () {
                            return document;
                        }
                    }
                });
            };

            function calculateClientAge(dateOfBirth){
                dateOfBirth = new Date(dateFilter(dateOfBirth, scope.df));
                var ageDifMs = Date.now() - dateOfBirth.getTime();
                var ageDifMs = Date.now() - dateOfBirth.getTime();
                var ageDate = new Date(ageDifMs); // miliseconds from epoch
                scope.age = Math.abs(ageDate.getUTCFullYear() - 1970);
            }

            scope.approve = function () {
                $modal.open({
                    templateUrl: 'approveClaim.html',
                    controller: ApproveCtrl
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
                
                resourceFactory.insuranceDeceasedLogResource.getDeacesdLogs({}, {deceasedId : scope.deceasedId},
                    function (data) {
                        $scope.insuranceDeceasedLogs = data;
                    });
               $scope.close = function () {
                   $modalInstance.close('close');
               };

           };

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
                    resourceFactory.insuranceClaimStatusDetailsResource.approveClaimIntimationApproval({ claimStatus: 'intimationapprovalpending', command: 'reject' }, $scope.rejectFormData,
                        function (data) {
                            $modalInstance.dismiss('cancel');
                            scope.insuranceCliamDetials = data;
                            location.path('/insurancedetails');
                        });
                };
                $scope.cancelReject = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            var ApproveCtrl = function ($scope, $modalInstance) {

                $scope.submitApprove = function () {
                    resourceFactory.insuranceClaimStatusDetailsResource.approveClaimIntimationApproval({ claimStatus: 'intimationapprovalpending', command : 'approve' }, {deceasedId : scope.deceasedId},
                    function (data) {
                        $modalInstance.dismiss('cancel');
                        scope.insuranceCliamDetials = data;
                        location.path('/insurancedetails');
                    });
                };
                $scope.cancelApprove = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
 
            scope.download = function(file){
                var url = $rootScope.hostUrl + file.url;
                CommonUtilService.downloadFile(url," ");
            };
        }
    });
    mifosX.ng.application.controller('ViewClaimIntimationApproval', ['$controller', '$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'CommonUtilService', '$modal', mifosX.controllers.ViewClaimIntimationApproval]).run(function ($log) {
        $log.info("ViewClaimIntimationApproval initialized");
    });
}(mifosX.controllers || {}));