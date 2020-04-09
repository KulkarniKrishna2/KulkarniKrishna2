(function (module) {
    mifosX.controllers = _.extend(module, {
        ReviewBankAccountCommonController: function ($controller, scope, routeParams, resourceFactory, location, $modal, route, $window, dateFilter, $upload, $rootScope, API_VERSION, $http, commonUtilService) {
            angular.extend(this, $controller('defaultUIConfigController', { $scope: scope, $key: "bankAccountDetails" }));
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));

            scope.viewConfig = {};
            scope.checkerBankAccountDetailsData = {};
            scope.bankAccountDocuments = [];

            function getEntityType() {
                return scope.entityType || scope.commonConfig.bankAccountData.entityType;
            }

            function getEntityId() {
                return scope.entityId || scope.commonConfig.bankAccountData.entityId;
            }

            function getBankAccountDetailsId() {
                return scope.bankAccountDetailsId;
            }

            function getBankAccountDetailsData() {
                return scope.commonConfig.bankAccountData.bankAccountDetailsData;
            }

            scope.isMakerTwoStepPresent = false;
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.bankAccountDetails.isMakerTwoStepPresent) {
                scope.isMakerTwoStepPresent = scope.response.uiDisplayConfigurations.bankAccountDetails.isMakerTwoStepPresent;
            }

            function populateDetails() {
                scope.viewConfig.showSummary = false;
                scope.viewConfig.hasData = false;
                scope.viewConfig.viewDocument = false;
                var data = getBankAccountDetailsData();
                scope.bankAccountDetailsData = data;
                if (scope.bankAccountDetailsData.status.id == 200) {
                    scope.viewConfig.showSummary = true;
                }
                if (data.checkerInfo != undefined) {
                    scope.isMakerTwoStepPresent = true;
                    scope.checkerBankAccountDetailsData = JSON.parse(data.checkerInfo);
                    if (scope.checkerBankAccountDetailsData.accountNumber != undefined) {
                        scope.viewConfig.hasData = true;
                    }
                }
                getBankAccountDocuments();
            }

            function getBankAccountDocuments() {
                resourceFactory.bankAccountDetailsDocumentsResource.getAllDocuments({
                    entityType: getEntityType(),
                    entityId: getEntityId(),
                    bankAccountDetailsId: getBankAccountDetailsId()
                }, function (data) {
                    scope.bankAccountDocuments = data.bankAccountDocuments || [];
                    for (var i = 0; i < scope.bankAccountDocuments.length; i++) {
                        var docs = {};
                        if (scope.bankAccountDocuments[i].storage && scope.bankAccountDocuments[i].storage.toLowerCase() == 's3') {
                            docs = $rootScope.hostUrl + API_VERSION + '/' + scope.bankAccountDocuments[i].parentEntityType + '/' + scope.bankAccountDocuments[i].parentEntityId + '/documents/' + scope.bankAccountDocuments[i].id + '/downloadableURL';
                        } else {
                            docs = $rootScope.hostUrl + API_VERSION + '/' + scope.bankAccountDocuments[i].parentEntityType + '/' + scope.bankAccountDocuments[i].parentEntityId + '/documents/' + scope.bankAccountDocuments[i].id + '/download';
                        }
                        scope.bankAccountDocuments[i].docUrl = docs;
                    }
                    if (scope.bankAccountDocuments[0]) {
                        scope.viewDocument(scope.bankAccountDocuments[0]);
                    }
                });
            }

            scope.submit = function () {
                scope.setTaskActionExecutionError(null);
                if (scope.checkerBankAccountDetailsData) {
                    if (!isFormValid()) {
                        return false;
                    }
                }
                if (scope.errorDetails) {
                    delete scope.errorDetails;
                }
                scope.activate();
            };

            scope.activate = function () {
                resourceFactory.bankAccountDetailsActivateResource.activate({
                    entityType: getEntityType(),
                    entityId: getEntityId(),
                    bankAccountDetailsId: getBankAccountDetailsId()
                }, {}, function (data) {
                    scope.viewConfig.showSummary = true;
                    scope.doActionAndRefresh('activitycomplete');
                });
            };

            function isFormValid() {
                var errorArray = new Array();
                var arrayIndex = 0;
                var isBankDetailsNotMatched = false;
                var isBankAcountHolderNameNotMatched = true;
                if (scope.bankAccountDetailsData.name && scope.checkerBankAccountDetailsData.name) {
                    if (scope.bankAccountDetailsData.name.toString().toLowerCase().trim() === scope.checkerBankAccountDetailsData.name.toString().toLowerCase().trim()) {
                        isBankAcountHolderNameNotMatched = false;
                    }
                }
                if (isBankAcountHolderNameNotMatched) {
                    isBankDetailsNotMatched = true;
                    var errorObj = new Object();
                    errorObj.code = 'error.msg.maker.checker.bank.account.holder.name.not.matched';
                    errorArray[arrayIndex] = errorObj;
                    arrayIndex++;
                }

                var isAccountNumberNotMatched = true;
                if (scope.bankAccountDetailsData.accountNumber && scope.checkerBankAccountDetailsData.accountNumber) {
                    if (scope.bankAccountDetailsData.accountNumber.toString().toLowerCase().trim() === scope.checkerBankAccountDetailsData.accountNumber.toString().toLowerCase().trim()) {
                        isAccountNumberNotMatched = false;
                    }
                }
                if (isAccountNumberNotMatched) {
                    isBankDetailsNotMatched = true;
                    var errorObj = new Object();
                    errorObj.code = 'error.msg.maker.checker.bank.account.number.not.matched';
                    errorArray[arrayIndex] = errorObj;
                    arrayIndex++;
                }

                var isIfscCodeNotMatched = true;
                if (scope.bankAccountDetailsData.ifscCode && scope.checkerBankAccountDetailsData.ifscCode) {
                    if (scope.bankAccountDetailsData.ifscCode.toString().toLowerCase().trim() === scope.checkerBankAccountDetailsData.ifscCode.toString().toLowerCase().trim()) {
                        isIfscCodeNotMatched = false;
                    }
                }
                if (isIfscCodeNotMatched) {
                    isBankDetailsNotMatched = true;
                    var errorObj = new Object();
                    errorObj.code = 'error.msg.maker.checker.bank.account.ifsc.code.not.matched';
                    errorArray[arrayIndex] = errorObj;
                    arrayIndex++;
                }

                if (isBankDetailsNotMatched) {
                    scope.errorDetails = [];
                    scope.errorDetails.push(errorArray);
                    return false;
                }
                return true;
            }

            function init() {
                populateDetails();
            }

            scope.doPreTaskActionStep = function (actionName) {
                if (actionName === 'activitycomplete') {
                    if (!scope.viewConfig.showSummary) {
                        scope.setTaskActionExecutionError("error.message.bank.account.details.activity.cannot.complete.before.approve");
                        return;
                    } else {
                        scope.doActionAndRefresh(actionName);
                    }
                }
            };

            init();

            scope.viewDocument = function (document) {
                var url = document.docUrl;
                $http({
                    method: 'GET',
                    url: url
                }).then(function (documentImage) {
                    scope.documentImg = documentImage.data;
                });
            }

        }
    });
    mifosX.ng.application.controller('ReviewBankAccountCommonController', ['$controller', '$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', '$window', 'dateFilter', '$upload', '$rootScope', 'API_VERSION', '$http', 'CommonUtilService', mifosX.controllers.ReviewBankAccountCommonController]).run(function ($log) {
        $log.info("ReviewBankAccountCommonController initialized");
    });
}(mifosX.controllers || {}));
