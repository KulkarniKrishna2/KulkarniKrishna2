(function(module) {
    mifosX.controllers = _.extend(module, {
        ClientVerificationCommonController: function($controller, scope, routeParams, resourceFactory, location, $modal, route, $window, $upload, $rootScope, API_VERSION, $http) {
            angular.extend(this, $controller('defaultActivityController', {
                $scope: scope
            }));

            scope.status = 'VIEW';
            scope.formData = {};
            scope.clientData = {};
            scope.verificationDetails = [];
            scope.enableClientVerification = scope.isSystemGlobalConfigurationEnabled('client-verification');

            function getEntityType() {
                return scope.clientCommonConfig.clientVerificationData.entityType;
            }

            function getEntityId() {
                return scope.clientCommonConfig.clientVerificationData.entityId;
            }

            function populateDetails() {
                scope.clientId = getEntityId();

                resourceFactory.clientVerificationResource.getClientVerificationDetails({
                    clientId: scope.clientId,
                    anotherresource: 'identifiers',
                    command: 'verificationDetails'
                }, function(data) {
                    scope.clientData = data.client;
                    scope.verificationDetails = data.clientVerificationData;
                });
            }

            populateDetails();

            scope.canVerify = function(document) {
                return (document.documentType && document.documentType.name && document.documentType.name === 'Aadhaar' && !document.isVerified);
            };

            scope.containsIdentifiers = function() {
                return (scope.status === 'VIEW' && scope.verificationDetails.length > 0);
            }

            scope.initData = function() {
                var temp = {
                    name: 'Aadhaar fingerprint'
                };
                scope.availableAuthenticationServices.push(temp);
            };

            scope.verifyIdentifier = function(document) {
                scope.id = document.documentType.id
                scope.documentType = document.documentType.name;
                scope.documentKey = document.documentKey;
                scope.availableAuthenticationServices = [];
                scope.initData();
                scope.formData = {};
                scope.status = 'ADD';
            };

            scope.cancel = function() {
                scope.status = 'VIEW';
            };

            var FingerPrintController = function($scope, $modalInstance) {
                $scope.isFingerPrintCaptured = false;

                $scope.submit = function() {
                    if ($scope.isFingerPrintCaptured === true) {
                        $modalInstance.close('Close');
                        resourceFactory.aadharClientVerificationResource.save({
                            clientId: scope.clientId,
                            identifierId: scope.id
                        }, this.formData, function(data) {
                            scope.status = 'VIEW';
                            populateDetails();
                        });
                    }
                };

                $scope.clearFingerPrint = function() {
                    imagedata = document.getElementById("biometric");
                    imagedata.src = "#";
                    delete scope.formData.clientAuthData;
                    delete scope.formData.location;
                    delete scope.formData.authenticationType;
                    $scope.isFingerPrintCaptured = false;
                };

                $scope.captureFingerprint = function() {
                    //Get this url from platform
                    var url = "https://localhost:15001/CaptureFingerprint";
                    if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari

                        xmlhttp = new XMLHttpRequest();

                    } else { // code for IE6, IE5
                        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");

                    }
                    xmlhttp.onreadystatechange = function() {
                        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                            fpobject = JSON.parse(xmlhttp.responseText);
                            imagedata = document.getElementById("biometric");
                            imagedata.src = "data:image;base64," + fpobject.Base64BMPIMage;
                            scope.formData.clientAuthData = fpobject.Base64ISOTemplate;
                            scope.formData.location = {};
                            scope.formData.location.locationType = "pincode";
                            scope.formData.location.pincode = "560010";
                            scope.formData.authenticationType = "fingerprint";
                            $scope.isFingerPrintCaptured = true;
                        }

                        xmlhttp.onerror = function() {
                            alert("Check If Morpho Service/Utility is Running");
                        }
                    }
                    var timeout = 5;
                    var fingerindex = 1;
                    xmlhttp.open("POST", url + "?" + timeout + "$" + fingerindex, true);
                    xmlhttp.send();
                };

                $scope.cancel = function() {
                    $modalInstance.dismiss('cancel');
                    delete scope.formData.clientAuthData;
                    delete scope.formData.location;
                    delete scope.formData.authenticationType;
                    $scope.isFingerPrintCaptured = false;
                };
            };

            scope.getFingerPrint = function() {
                $modal.open({
                    templateUrl: 'fingerprint.html',
                    controller: FingerPrintController
                });
            };

            scope.submit = function() {
                if (this.formData.authenticationType.name === 'Aadhaar fingerprint') {
                    this.formData.authenticationTypeId = '2';
                    scope.getFingerPrint();
                }
            };

            scope.doPreTaskActionStep = function(actionName) {
                if (actionName === 'activitycomplete') {
                    if (scope.clientData.isVerified) {
                        scope.doActionAndRefresh(actionName);
                    } else {
                        scope.setTaskActionExecutionError("error.msg.client.not.verified");
                    }
                } else {
                    scope.doActionAndRefresh(actionName);
                }
            };
        }
    });
    mifosX.ng.application.controller('ClientVerificationCommonController', ['$controller', '$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', '$window', '$upload', '$rootScope', 'API_VERSION', '$http', mifosX.controllers.ClientVerificationCommonController]).run(function($log) {
        $log.info("ClientVerificationCommonController initialized");
    });
}(mifosX.controllers || {}));