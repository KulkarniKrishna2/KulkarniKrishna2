(function (module) {
    mifosX.controllers = _.extend(module, {
        InsurancSetteledClaimsController: function ($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope,CommonUtilService, $modal) {
            
            scope.deceasedId = routeParams.id;

            function fetchInsuranceData() {
                resourceFactory.getInsuranceClaimStatusDetailsResource.getClaimIntimationApproval({ claimStatus: 'settledClaims', deceasedId : scope.deceasedId }, {},
                    function (data) {
                        scope.insuranceCliamDetials = data;
                        calculateClientAge(scope.insuranceCliamDetials.dateOfBirth);
                        scope.fetchInsuranceSettlementData();
                    });
            };

            scope.fetchInsuranceSettlementData = function () {
                resourceFactory.getInsuranceSettlementDetailsResource.getSettlementDetails({ deceasedId : scope.deceasedId }, {},
                    function (data) {
                        scope.settlementDetails = data;
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

            scope.getNomineeDetails = function () {
                $modal.open({
                    templateUrl: 'views/insurance/viewnomineebankdetails.html',
                    controller: InsuranceNomineeCtrl,
                    windowClass: 'app-modal-window-full-screen',
                    size: 'lg'
                });
            }

            var InsuranceNomineeCtrl = function ($scope, $modalInstance) {

                resourceFactory.getInsuranceNomineeDetailsResource.getNomineeDetails({ deceasedId: scope.deceasedId }, {},
                    function (data) {
                        $scope.insuranceNomineeDetials = data;
                        getDeceasedDocuments();
                    });
                $scope.close = function () {
                    $modalInstance.close('close');
                };

                function getDeceasedDocuments() {
                    resourceFactory.insuranceDocumentsResource.getAllDeceasedDocuments({ deceasedId: scope.deceasedId }, function (data) {
                        for (var l = 0; l < data.length; l++) {
                            if (data[l].id) {
                                var url = {};
                                url = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment';
                                data[l].docUrl = url;
                                data[l].documentId = data[l].id;
                                data[l].isDocumentAttached = true;

                            }
                        }
                        $scope.insuranceDocumentTagOptions = data;
                    });

                };

                var viewDocumentCtrl = function ($scope, $modalInstance, documentDetail) {
                    $scope.data = documentDetail;
                    $scope.close = function () {
                        $modalInstance.close('close');
                    };

                };
                $scope.openViewDocument = function (documentDetail) {
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
            
 
        }
    });
    mifosX.ng.application.controller('InsurancSetteledClaimsController', ['$controller', '$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'CommonUtilService', '$modal', mifosX.controllers.InsurancSetteledClaimsController]).run(function ($log) {
        $log.info("InsurancSetteledClaimsController initialized");
    });
}(mifosX.controllers || {}));