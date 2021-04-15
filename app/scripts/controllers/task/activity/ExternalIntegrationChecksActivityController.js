(function (module) {
    mifosX.controllers = _.extend(module, {
        ExternalIntegrationChecksActivityController: function ($controller, scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION, $upload, $rootScope, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));
            scope.isOcrVerificationDone = false;
            scope.aadhaarNameOnCard = null;
            scope.isAadhaarOcrSuccess = false;
            scope.isPanOcrSuccess = false;
            scope.aadhaarIdNumber = null;
            scope.aadhaarIdNumberScore = null;
            scope.aadhaarError = "NA";
            scope.panNameOnCard = null;
            scope.panIdNumber = null;
            scope.panIdNumberScore = null;
            scope.panError = "NA";
            scope.showResults = false;
            scope.ocrData = {};
            scope.isAsynReqCalled = false;

            function initTask() {
                scope.clientId = scope.taskconfig['clientId'];
                scope.entityType = "clients";
                scope.entityId = scope.clientId;

                scope.loanApplicationReferenceId = scope.taskconfig['loanApplicationId'];
            };

            initTask();

            scope.submit = function () {
                scope.activityDone();
            };


            scope.getOcrVerificationData = function () {
                resourceFactory.ocrVerificationResource.get({ clientId: scope.clientId, loanApplicationId: scope.loanApplicationReferenceId }, function (data) {
                    scope.ocrVerificationMappingData = data;
                    if (scope.ocrVerificationMappingData.ocrMappingId != null) {
                        scope.showResults = true;
                        if (scope.ocrVerificationMappingData.ocrAadhaarData != null && scope.ocrVerificationMappingData.ocrAadhaarData.error == null && scope.ocrVerificationMappingData.ocrPanData != null && scope.ocrVerificationMappingData.ocrPanData.error == null) {
                            scope.isOcrVerificationDone = true;
                        }
                        else {
                            scope.isOcrVerificationDone = false;
                        }
                        if (scope.ocrVerificationMappingData.ocrAadhaarData != null) {
                            scope.aadhaarNameOnCard = scope.ocrVerificationMappingData.ocrAadhaarData.nameOnCard
                            scope.aadhaarIdNumber = scope.ocrVerificationMappingData.ocrAadhaarData.idNumber;
                            scope.aadhaarIdNumberScore = scope.ocrVerificationMappingData.ocrAadhaarData.idNumberScore;
                            if (scope.ocrVerificationMappingData.ocrAadhaarData.error != null) {
                                scope.aadhaarError = scope.ocrVerificationMappingData.ocrAadhaarData.error;
                            }
                            else {
                                scope.aadhaarError = "Success";
                                scope.isAadhaarOcrSuccess = true;
                            }
                        }
                        if (scope.ocrVerificationMappingData.ocrPanData != null) {
                            scope.panNameOnCard = scope.ocrVerificationMappingData.ocrPanData.nameOnCard;
                            scope.panIdNumber = scope.ocrVerificationMappingData.ocrPanData.idNumber;
                            scope.panIdNumberScore = scope.ocrVerificationMappingData.ocrPanData.idNumberScore;
                            if (scope.ocrVerificationMappingData.ocrPanData.error != null) {
                                scope.panError = scope.ocrVerificationMappingData.ocrPanData.error;
                            }
                            else {
                                scope.panError = "Success";
                                scope.isPanOcrSuccess = true;
                            }
                        }

                    }
                });
            };

            scope.getOcrVerificationData();

            scope.initiateOcrVerification = function () {
                if (!scope.isOcrVerificationDone) {
                    resourceFactory.ocrVerificationResource.post({ clientId: scope.clientId, loanApplicationId: scope.loanApplicationReferenceId }, function (data) {
                        scope.getOcrVerificationData();
                    });
                }
            };

            scope.initiateChecks = function () {
                scope.initiateOcrVerification();
            };

        }
    });
    mifosX.ng.application.controller('ExternalIntegrationChecksActivityController', ['$controller', '$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'dateFilter', mifosX.controllers.ExternalIntegrationChecksActivityController]).run(function ($log) {
        $log.info("ExternalIntegrationChecksActivityController initialized");
    });
}(mifosX.controllers || {}));