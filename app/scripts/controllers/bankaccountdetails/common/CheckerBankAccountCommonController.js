(function (module) {
    mifosX.controllers = _.extend(module, {
        CheckerBankAccountCommonController: function ($controller, scope, routeParams, resourceFactory, location, $modal, route, $window, dateFilter, $upload, $rootScope, API_VERSION, $http, commonUtilService, $sce) {
            angular.extend(this, $controller('defaultUIConfigController', { $scope: scope, $key: "bankAccountDetails" }));
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));

            scope.viewConfig = {};
            scope.formData = {};
            scope.checkerBankAccountData = {};
            scope.docData = {};
            scope.repeatFormData = {};
            scope.bankAccountTypeOptions = [];
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

            function getBankAccountDetailsTemplateData() {
                return scope.commonConfig.bankAccountData.templateData.bankAccountTypeOptions;
            }

            function populateBankAccountDetails() {
                scope.viewConfig.viewDocument = false;
                scope.bankAccountTypeOptions = getBankAccountDetailsTemplateData();
                var data = getBankAccountDetailsData();
                scope.bankAccountDetailsData = data;
                if (data.checkerInfo != undefined) {
                    scope.checkerBankAccountData = JSON.parse(data.checkerInfo);
                    scope.formData = {
                        name: scope.checkerBankAccountData.name,
                        accountNumber: scope.checkerBankAccountData.accountNumber,
                        ifscCode: scope.checkerBankAccountData.ifscCode,
                        micrCode: scope.checkerBankAccountData.micrCode,
                        mobileNumber: scope.checkerBankAccountData.mobileNumber,
                        email: scope.checkerBankAccountData.email,
                        bankName: scope.checkerBankAccountData.bankName,
                        bankCity: scope.checkerBankAccountData.bankCity,
                        branchName: scope.checkerBankAccountData.branchName
                    };
                    if (scope.checkerBankAccountData.accountType) {
                        //scope.formData.accountTypeId = scope.checkerBankAccountData.accountType.id;
                        scope.formData.accountType = scope.bankAccountTypeOptions[scope.bankAccountTypeOptions.findIndex(x => x.id == scope.checkerBankAccountData.accountType.id)];
                    } else {
                        //scope.formData.accountTypeId = scope.bankAccountTypeOptions[0].id;
                        scope.formData.accountType = scope.bankAccountTypeOptions[0];
                    }
                    scope.repeatFormData = {
                        accountNumberRepeat: scope.checkerBankAccountData.accountNumber,
                        ifscCodeRepeat: scope.checkerBankAccountData.ifscCode
                    };
                    if (scope.checkerBankAccountData.accountNumber != undefined) {
                        scope.viewConfig.hasData = true;
                        scope.viewConfig.showSummary = true;
                    }
                } else {
                    scope.viewConfig.hasData = false;
                    scope.viewConfig.showSummary = false;
                    scope.formData.accountType = scope.bankAccountTypeOptions[0];
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
                });
            }

            scope.submitCheckerDetails = function () {
                scope.setTaskActionExecutionError(null);
                if (!isFormValid()) {
                    return false;
                } else {
                    scope.commonConfig.bankAccountData.bankAccountDetailsData = undefined;
                }
                resourceFactory.bankAccountDetailsCheckerResource.checkerDetails({ 
                    entityType: getEntityType(),
                    entityId: getEntityId(),
                    bankAccountDetailsId: getBankAccountDetailsId()
                }, scope.formData, function (data) {
                    fetchBankAccountDetails();
                });
            };

            function fetchBankAccountDetails() {
                resourceFactory.bankAccountDetailsResource.get({ 
                    entityType: getEntityType(),
                    entityId: getEntityId(),
                    bankAccountDetailsId: getBankAccountDetailsId()
                }, function (data) {
                    scope.commonConfig.bankAccountData.bankAccountDetailsData = data;
                    populateBankAccountDetails();
                });
            };

            function isFormValid() {
                if (!scope.isElemHidden('bankIFSCCodeRepeat')) {
                    if (scope.formData.ifscCode != scope.repeatFormData.ifscCodeRepeat) {
                        return false;
                    }
                }
                if (!scope.isElemHidden('bankAccountNumberRepeat')) {
                    if (scope.formData.accountNumber != scope.repeatFormData.accountNumberRepeat) {
                        return false;
                    }
                }
                return true;
            }

            scope.edit = function () {
                scope.viewConfig.showSummary = false;
            };

            scope.isBankAccountAllowToModifyable = function () {
                if (scope.bankAccountDetailsData && scope.bankAccountDetailsData.verificationStatus.id == 3) {
                    return false;
                } else if (scope.viewUIConfig.isTask) {
                    return !scope.isTaskCompleted() && ['active', 'inactive', 'deleted'].indexOf(scope.bankAccountDetailsData.status.value) < 0;
                } else {
                    return ['active', 'inactive', 'deleted'].indexOf(scope.bankAccountDetailsData.status.value) < 0;
                }
            }

            scope.editable = function () {
                if (scope.isTask) {
                    return !scope.isTaskCompleted();
                }
                return true;
            };

            scope.cancel = function () {
                scope.viewConfig.showSummary = true;
            };

            function init() {
                populateBankAccountDetails();
            }

            scope.viewDocument = function (document) {
                if (document) {
                    var url = document.docUrl;
                    for (var tmp in scope.bankAccountDocuments) {
                        tmp.selected = false;
                    }
                    document.selected = true;
                    $http({
                        method: 'GET',
                        url: url
                    }).then(function (documentImage) {
                        scope.viewConfig.viewDocument = true;
                        scope.documentImg = documentImage.data;
                    });
                }
            }

            /*overriding doPreTaskActionStep method of defaultActivityController*/
            scope.doPreTaskActionStep = function (actionName) {
                if (actionName === 'activitycomplete') {
                    if (!scope.viewConfig.showSummary) {
                        scope.setTaskActionExecutionError("error.message.bank.account.details.activity.cannot.complete.before.form.submit");
                        return;
                    }
                }
                scope.doActionAndRefresh(actionName);
            };

            scope.getBankDetails = function (isvalidIfsc) {
                if (scope.formData.ifscCode != undefined && scope.formData.ifscCode === scope.repeatFormData.ifscCodeRepeat && isvalidIfsc) {
                    resourceFactory.bankIFSCResource.get({
                        ifscCode: scope.formData.ifscCode
                    }, function (data) {
                        scope.bankData = data;
                        scope.formData.bankName = scope.bankData.bankName;
                        scope.formData.branchName = scope.bankData.branchName;
                        scope.formData.bankCity = scope.bankData.bankCity;
                    });
                }
            }

            init();
        }
    });
    mifosX.ng.application.controller('CheckerBankAccountCommonController', ['$controller', '$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', '$window', 'dateFilter', '$upload', '$rootScope', 'API_VERSION', '$http', 'CommonUtilService', '$sce', mifosX.controllers.CheckerBankAccountCommonController]).run(function ($log) {
        $log.info("CheckerBankAccountCommonController initialized");
    });
}(mifosX.controllers || {}));
