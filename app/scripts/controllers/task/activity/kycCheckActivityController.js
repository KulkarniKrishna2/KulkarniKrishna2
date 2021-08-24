(function (module) {
    mifosX.controllers = _.extend(module, {
        kycCheckActivityController: function ($controller, scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION, $upload, $rootScope, commonUtilService) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));

            scope.clientId = scope.taskconfig['clientId'];

            scope.showKycCheckBlock = '';

            scope.panKycCheckResponseData = {};
            scope.panKycCheckResponseStatusError = false;
            scope.panKycCheckResponseStatusErrorMsg = '';

            scope.panKycFaceCompareResponseData = {};
            scope.panKycFaceCompareResponseStatusError = false;
            scope.panKycFaceCompareResponseStatusErrorMsg = '';

            scope.aadharKycFaceCompareResponseData = {};
            scope.aadharKycFaceCompareResponseStatusError = false;
            scope.aadharKycFaceCompareResponseStatusErrorMsg = '';

            scope.initiateKycCheck = function() {
                scope.initiatePanKycCheckDetails();
                scope.initiatePanKycFaceCompareDetails();
                scope.initiateAadharKycFaceCompareDetails();
            }

            scope.initiatePanKycCheckDetails = function() {
                resourceFactory.panKycCheckResource.post({clientId:scope.clientId}, function(response) {
                    scope.showKycCheckBlock = 'Pan-Kyc-Check';
                    scope.panKycCheckResponseData = response;
                    if(scope.panKycCheckResponseData.status == 'error') {
                        scope.panKycCheckResponseStatusError = true;
                    } else {
                        scope.panKycCheckResponseStatusError = false;
                    }
                }, function(error) {
                    console.log('Error Initiating PAN Kyc Check Details : ', error);
                    scope.panKycCheckResponseStatusErrorMsg = error.data.errors[0].defaultUserMessage;
                    scope.panKycCheckResponseStatusError = true;
                });
            }

            scope.refreshPanKycDetails = function() {
                resourceFactory.refreshPanKycCheckResource.post({clientId:scope.clientId}, function(response) {
                    scope.showKycCheckBlock = 'Pan-Kyc-Check';
                    scope.panKycCheckResponseData = response;
                    if(scope.panKycCheckResponseData.status == 'error') {
                        scope.panKycCheckResponseStatusError = true;
                    } else {
                        scope.panKycCheckResponseStatusError = false;
                    }
                }, function(error) {
                    console.log('Error Initiating PAN Kyc Check Details : ', error)
                    scope.panKycCheckResponseStatusError = true;
                    scope.panKycCheckResponseStatusErrorMsg = error.data.errors[0].defaultUserMessage;
                });
            }

            scope.initiatePanKycFaceCompareDetails = function() {
                resourceFactory.panKycFaceCompareResource.post({clientId:scope.clientId}, function(response) {
                    scope.panKycFaceCompareResource = response;
                    if(scope.panKycFaceCompareResource.status == 'error') {
                        scope.panKycFaceCompareResponseStatusError = true;
                    } else {
                        scope.panKycFaceCompareResponseStatusError = false;
                    }
                }, function(error) {
                    console.log('Error Initiating PAN Kyc Face Compare Details : ', error)
                    scope.panKycFaceCompareResponseStatusError = true;
                    scope.panKycFaceCompareResponseStatusErrorMsg = error.data.errors[0].defaultUserMessage;
                });
            }

            scope.initiateAadharKycFaceCompareDetails = function() {
                resourceFactory.aadharKycFaceCompareResource.post({clientId:scope.clientId}, function(response) {
                    scope.aadharKycFaceCompareResource = response;
                    if(scope.aadharKycFaceCompareResource.status == 'error') {
                        scope.aadharKycFaceCompareResponseStatusError = true;
                    } else {
                        scope.aadharKycFaceCompareResponseStatusError = false;
                    }
                }, function(error) {
                    console.log('Error Initiating Aadhaar Face Compare Check Details : ', error)
                    scope.aadharKycFaceCompareResponseStatusError = true;
                    scope.aadharKycFaceCompareResponseStatusErrorMsg = error.data.errors[0].defaultUserMessage;
                });
            }


            // These methods below to be called once the activity is complete.
            scope.getPanKycCheckDetails = function() {
                resourceFactory.panKycCheckResource.get({clientId:scope.clientId}, function(response) {
                    scope.showKycCheckBlock = 'Pan-Kyc-Check';
                    scope.panKycCheckResponseData = response;
                    if(scope.panKycCheckResponseData.status == 'error') {
                        scope.panKycCheckResponseStatusError = true;
                    } else {
                        scope.panKycCheckResponseStatusError = false;
                    }
                }, function(error) {
                    console.log('Error Getting PAN Kyc Check Details : ', error)
                    scope.panKycCheckResponseStatusError = true;
                    scope.panKycCheckResponseStatusErrorMsg = error.data.errors[0].defaultUserMessage;
                });
            }

            scope.getPanKycFaceCompareDetails = function() {
                resourceFactory.panKycFaceCompareResource.post({clientId:scope.clientId}, function(response) {
                    scope.panKycFaceCompareResource = response;
                    if(scope.panKycFaceCompareResource.status == 'error') {
                        scope.panKycFaceCompareResponseStatusError = true;
                    } else {
                        scope.panKycFaceCompareResponseStatusError = false;
                    }
                }, function(error) {
                    console.log('Error Getting PAN Kyc Face Compare Details : ', error)
                    scope.panKycFaceCompareResponseStatusError = true;
                    scope.panKycFaceCompareResponseStatusErrorMsg = error.data.errors[0].defaultUserMessage;
                });
            }

            scope.getAadharKycFaceCompareDetails = function() {
                resourceFactory.aadharKycFaceCompareResource.post({clientId:scope.clientId}, function(response) {
                    scope.aadharKycFaceCompareResource = response;
                    if(scope.aadharKycFaceCompareResource.status == 'error') {
                        scope.aadharKycFaceCompareResponseStatusError = true;
                    } else {
                        scope.aadharKycFaceCompareResponseStatusError = false;
                    }
                }, function(error) {
                    console.log('Error Getting Aadhaar Face Compare Check Details : ', error)
                    scope.aadharKycFaceCompareResponseStatusError = true;
                    scope.aadharKycFaceCompareResponseStatusErrorMsg = error.data.errors[0].defaultUserMessage;
                });
            }

            function checkTaskStatus() {
                if(scope.isTaskCompleted()) {
                    scope.showKycCheckBlock = 'Pan-Kyc-Check';
                    scope.getPanKycCheckDetails();
                    scope.getPanKycFaceCompareDetails();
                    scope.getAadharKycFaceCompareDetails();
                }
            }
            checkTaskStatus();

            
            scope.showKycCheckDetails = function(kycCheckBlockValue) {
                scope.showKycCheckBlock = kycCheckBlockValue;
            }
        }
    });
    mifosX.ng.application.controller('kycCheckActivityController', ['$controller','$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'CommonUtilService', mifosX.controllers.kycCheckActivityController]).run(function ($log) {
        $log.info("kycCheckActivityController initialized");
    });
}(mifosX.controllers || {}));