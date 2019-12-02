(function (module) {
    mifosX.controllers = _.extend(module, {
        InsurancSettelmentPendingController: function ($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope, CommonUtilService, $modal) {

            scope.deceasedId = routeParams.id;

            function fetchInsuranceData() {
                resourceFactory.getInsuranceClaimStatusDetailsResource.getClaimIntimationApproval({ claimStatus: 'settlementpending', deceasedId: scope.deceasedId }, {},
                    function (data) {
                        scope.tempOrganisationSettlementData = [];
                        scope.tempNomineeSettlementData = [];
                        scope.insuranceCliamDetials = data;
                        calculateClientAge(scope.insuranceCliamDetials.dateOfBirth);
                        scope.fetchInsuranceSettlementData();

                        for (var i = 0; i < data.insuranceLoanPolicyDatas.length; i++) {
                            scope.settlementData = {};
                            scope.settlementData.policyNumber = data.insuranceLoanPolicyDatas[i].policyNumber;
                            scope.settlementData.loanAccountNumber = data.insuranceLoanPolicyDatas[i].loanAccountNumber;
                            scope.settlementData.loanId = data.insuranceLoanPolicyDatas[i].loanId;
                            scope.settlementData.policyId = data.insuranceLoanPolicyDatas[i].policyId;
                            scope.settlementData.loanStatus = data.insuranceLoanPolicyDatas[i].status;
                            scope.tempOrganisationSettlementData.push(scope.settlementData);
                            scope.tempNomineeSettlementData.push(scope.settlementData);
                        }
                    });
            };

            scope.fetchInsuranceSettlementData = function () {
                resourceFactory.getInsuranceSettlementDetailsResource.getSettlementDetails({ deceasedId: scope.deceasedId }, {},
                    function (data) {
                        scope.settlementDetails = data;
                        scope.filterData(data);
                    });
            };

            scope.filterData = function (data) {
                scope.settlementDetailsData = [];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].settlementType.value == 'Invalid') {
                        continue;
                    } else if (data[i].settlementType.value == 'Organisation') {
                        scope.settlementDetailsData.push(data[i]);
                        for (var j = 0; j < scope.insuranceCliamDetials.insuranceLoanPolicyDatas.length; j++) {
                            if (data[i].loanId == scope.insuranceCliamDetials.insuranceLoanPolicyDatas[j].loanId) {
                                delete scope.tempOrganisationSettlementData[j];
                                break;
                            }
                        }
                    } else if (data[i].settlementType.value == 'Nominee') {
                        scope.settlementDetailsData.push(data[i]);
                        for (var j = 0; j < scope.insuranceCliamDetials.insuranceLoanPolicyDatas.length; j++) {
                            if (data[i].loanId == scope.insuranceCliamDetials.insuranceLoanPolicyDatas[j].loanId) {
                                delete scope.tempNomineeSettlementData[j];
                                break;
                            }
                        }
                    }
                }
                scope.organisationSettlementData = [];
                scope.nomineeSettlementData = [];
                for (var i = 0; i < scope.tempOrganisationSettlementData.length; i++) {
                    if (typeof (scope.tempOrganisationSettlementData[i]) != 'undefined' && scope.tempOrganisationSettlementData[i].loanId != 'undefined') {
                        scope.organisationSettlementData.push(scope.tempOrganisationSettlementData[i]);
                    }
                }
                for (var i = 0; i < scope.tempNomineeSettlementData.length; i++) {
                    if (typeof (scope.tempNomineeSettlementData[i]) != 'undefined' && scope.tempNomineeSettlementData[i].loanId != 'undefined') {
                        scope.nomineeSettlementData.push(scope.tempNomineeSettlementData[i]);
                    }
                }
            };

            fetchInsuranceData();

            function calculateClientAge(dateOfBirth) {
                dateOfBirth = new Date(dateFilter(dateOfBirth, scope.df));
                var ageDifMs = Date.now() - dateOfBirth.getTime();
                var ageDifMs = Date.now() - dateOfBirth.getTime();
                var ageDate = new Date(ageDifMs); // miliseconds from epoch
                scope.age = Math.abs(ageDate.getUTCFullYear() - 1970);
            }

            var ActionCtrl = function ($scope, $modalInstance, data) {
                $scope.onConfirm = function () {

                    switch (data.type) {
                        case 'organisationSettlement':
                            scope.organisationFormData = {};
                            scope.organisationFormData.locale = scope.optlang.code;
                            scope.organisationFormData.dateFormat = scope.df;
                            scope.organisationFormData.deceasedId = scope.deceasedId;
                            scope.organisationFormData.loanId = data.loanId;
                            scope.organisationFormData.policyId = data.policyId;
                            scope.organisationFormData.settlementDate = dateFilter(new Date(data.setteledDate), scope.df);
                            scope.organisationFormData.chequeNumber = data.chequeNumber;
                            scope.organisationFormData.claimNumber = data.claimNumber;

                            scope.organisationFormData.settlementDetails = [];
                            scope.organisationSettlementData = {};
                            scope.organisationSettlementData.settlementType = 1;
                            scope.organisationSettlementData.settlementAmount = data.amountRecieved;
                            scope.organisationFormData.settlementDetails.push( scope.organisationSettlementData);

                            resourceFactory.insuranceClaimStatusDetailsResource.submitOrganisationSettlement({ claimStatus: 'settlementpending', command: 'submit' }, scope.organisationFormData,
                                function (data) {
                                    $modalInstance.dismiss('cancel');
                                    if (data != null && (data.changes.statusId != undefined || data.changes.statusId != null)) {
                                        location.path('/insurancedetails/settlementpending');
                                    } else {
                                        fetchInsuranceData();
                                    }
                                });
                            break;

                        case 'nomineeSettlement':
                            scope.nomineeFormData = {};
                            scope.nomineeFormData.locale = scope.optlang.code;
                            scope.nomineeFormData.dateFormat = scope.df;
                            scope.nomineeFormData.deceasedId = scope.deceasedId;
                            scope.nomineeFormData.loanId = data.loanId;
                            scope.nomineeFormData.policyId = data.policyId;
                            scope.nomineeFormData.settlementDate = dateFilter(new Date(data.setteledDate), scope.df);
                            scope.nomineeFormData.chequeNumber = data.chequeNumber;
                            scope.nomineeFormData.claimNumber = data.claimNumber;

                            scope.nomineeFormData.settlementDetails = [];
                            scope.nomineeSettlementData = {};
                            scope.nomineeSettlementData.settlementType = 2;
                            scope.nomineeSettlementData.settlementAmount = data.amountRecieved;
                            scope.nomineeFormData.settlementDetails.push( scope.nomineeSettlementData);

                            resourceFactory.insuranceClaimStatusDetailsResource.submitNomineeSettlement({ claimStatus: 'settlementpending', command: 'submit' }, scope.nomineeFormData,
                                function (data) {
                                    $modalInstance.dismiss('cancel');
                                    if (data != null && (data.changes.statusId != undefined || data.changes.statusId != null)) {
                                        location.path('/insurancedetails/settlementpending');
                                    } else {
                                        fetchInsuranceData();
                                    }
                                });
                            break;

                        case 'reject':
                            scope.organisationFormData = {};
                            scope.organisationFormData.locale = scope.optlang.code;
                            scope.organisationFormData.dateFormat = scope.df;
                            scope.organisationFormData.deceasedId = scope.deceasedId;
                            scope.organisationFormData.loanId = data.loanId;
                            scope.organisationFormData.policyId = data.policyId;
                            scope.organisationFormData.settlementType = 1;
                            scope.organisationFormData.settlementDate = dateFilter(new Date(data.setteledDate), scope.df);
                            scope.organisationFormData.settlementAmount = data.amountRecieved;
                            scope.organisationFormData.chequeNumber = data.chequeNumber;
                            scope.nomineeFormData.claimNumber = data.claimNumber;

                            resourceFactory.insuranceClaimStatusDetailsResource.approveClaimIntimationApproval({ claimStatus: 'settlementpending', command: 'reject' }, scope.organisationFormData,
                                function (data) {
                                    $modalInstance.dismiss('cancel');
                                    if (data != null && (data.changes.statusId != undefined || data.changes.statusId != null)) {
                                        location.path('/insurancedetails/settlementpending');
                                    } else {
                                        fetchInsuranceData();
                                    }
                                });
                            break;
                    }
                };
                $scope.onCancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.organisationSettlement = function (data) {

                data.type = 'organisationSettlement';
                $modal.open({
                    templateUrl: 'organisationsettlementconfirmation.html',
                    controller: ActionCtrl,
                    resolve: {
                        data: function () {
                            return data;
                        }
                    }
                });
            }


            scope.getHistory = function () {
                $modal.open({
                    templateUrl: 'views/insurance/viewinsurancelogs.html',
                    controller: InsuranceLogCtrl,
                    windowClass: 'app-modal-window-full-screen',
                });
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

            

            var InsuranceLogCtrl = function ($scope, $modalInstance) {
                
                resourceFactory.insuranceDeceasedLogResource.getDeacesdLogs({}, {deceasedId : scope.deceasedId},
                    function (data) {
                        $scope.insuranceDeceasedLogs = data;
                    });
               $scope.close = function () {
                   $modalInstance.close('close');
               };

           };
           
            scope.nomineeSettlement = function (data) {

                data.type = 'nomineeSettlement';
                $modal.open({
                    templateUrl: 'nomineeconfirmation.html',
                    controller: ActionCtrl,
                    resolve: {
                        data: function () {
                            return data;
                        }
                    }
                });

            }

            scope.reject = function (data) {

                data.type = 'reject';
                $modal.open({
                    templateUrl: 'rejectconfirmation.html',
                    controller: ActionCtrl,
                    resolve: {
                        data: function () {
                            return data;
                        }
                    }
                });
            }

        }
    });
    mifosX.ng.application.controller('InsurancSettelmentPendingController', ['$controller', '$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'CommonUtilService', '$modal', mifosX.controllers.InsurancSettelmentPendingController]).run(function ($log) {
        $log.info("InsurancSettelmentPendingController initialized");
    });
}(mifosX.controllers || {}));