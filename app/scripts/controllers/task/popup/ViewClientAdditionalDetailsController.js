(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewClientAdditionalDetailsController: function ($controller, scope, $modal, resourceFactory, dateFilter, $http, $rootScope, $upload, API_VERSION) {
            scope.clientId = scope.activeClientMember.id;
            scope.bankAccountDocuments = [];
            scope.entityType = 'clients';

            function getClientData() {
                resourceFactory.clientResource.get({
                    clientId: scope.clientId,
                    associations: 'hierarchyLookup'
                }, function (data) {
                    scope.clientDetails = data;
                    if (scope.clientDetails.lastname != undefined) {
                        scope.clientDetails.displayNameInReverseOrder = scope.clientDetails.lastname.concat(" ");
                    }
                    if (scope.clientDetails.middlename != undefined) {
                        scope.clientDetails.displayNameInReverseOrder = scope.clientDetails.displayNameInReverseOrder.concat(scope.clientDetails.middlename).concat(" ");
                    }
                    if (scope.clientDetails.firstname != undefined) {
                        scope.clientDetails.displayNameInReverseOrder = scope.clientDetails.displayNameInReverseOrder.concat(scope.clientDetails.firstname);
                    }
                });
            }
            getClientData();
            getClientAdditionalDocuments();

            function getClientAdditionalDocuments() {
                resourceFactory.clientDocumentsResource.getAllClientDocuments({ clientId: scope.clientId }, function (data) {
                    scope.clientdocuments = {};
                    for (var l = 0; l < data.length; l++) {
                        if (data[l].id) {
                            data[l].docUrl = documentsURL(data[l]);
                            if (!_.isUndefined(data[l].geoTag)) {
                                data[l].location = JSON.parse(data[l].geoTag);
                            }
                        }
                        if (data[l].tagValue) {
                            pushDocumentToTag(data[l], data[l].tagValue);
                        }
                    }
                });
            };

            function pushDocumentToTag(document, tagValue) {
                if (scope.clientdocuments && scope.clientdocuments.hasOwnProperty(tagValue)) {
                    scope.clientdocuments[tagValue].push(document);
                } else {
                    scope.clientdocuments[tagValue] = [];
                    scope.clientdocuments[tagValue].push(document);
                }
            };

            scope.openViewDocument = function (documentDetail) {
                $modal.open({
                    templateUrl: 'viewUploadedDocument.html',
                    controller: viewUploadedDocumentCtrl,
                    resolve: {
                        documentDetail: function () {
                            return documentDetail;
                        }
                    }
                });
            };

            function documentsURL(document) {
                return API_VERSION + '/' + document.parentEntityType + '/' + document.parentEntityId + '/documents/' + document.id + '/attachment';
            };

            var viewUploadedDocumentCtrl = function ($scope, $modalInstance, documentDetail) {
                $scope.data = documentDetail;
                $scope.close = function () {
                    $modalInstance.close('close');
                };
            };

            // Bank Account Details Part

            function getClientBankAccountDetails() {
                resourceFactory.bankAccountDetailsResource.getAll({ entityType: scope.entityType, entityId: scope.clientId }, function (data) {
                    data = data.result;
                    if (!_.isUndefined(data[0])) {
                        scope.bankAccountDetailsId = data[0].id;
                        populateDetails();
                    }
                });
            }

            getClientBankAccountDetails();

            function populateDetails() {
                resourceFactory.bankAccountDetailsResource.get({
                    entityType: scope.entityType,
                    entityId: scope.clientId,
                    bankAccountDetailsId: getBankAccountDetailsId()
                }, function (data) {
                    scope.bankAccountData = data;
                    scope.bankAccountDocuments = data.bankAccountDocuments || [];
                    for (var i = 0; i < scope.bankAccountDocuments.length; i++) {
                        var docs = {};
                        docs = $rootScope.hostUrl + API_VERSION + '/' + scope.entityType + '/' + scope.clientId + '/documents/' + scope.bankAccountDocuments[i].id + '/download';
                        scope.bankAccountDocuments[i].docUrl = docs;
                    }
                    if (scope.bankAccountDocuments.length > 0) {
                        scope.viewDocument(scope.bankAccountDocuments[0]);
                    }
                });
            }


            function getBankAccountDetailsId() {
                return scope.bankAccountDetailsId;
            }

            scope.viewDocument = function (document) {
                var url = document.docUrl;
                $http({
                    method: 'GET',
                    url: url
                }).then(function (documentImage) {
                    scope.documentImg = documentImage.data;
                });
            }

             // Cash Flow Part

             scope.getCashFlow = function () {
                scope.showSummary = true;
                scope.showAddClientoccupationdetailsForm = false;
                scope.showEditClientoccupationdetailsForm = false;
                scope.showAddClientassetdetailsForm = false;
                scope.showEditClientassetdetailsForm = false;
                scope.showAddClienthouseholddetailsForm = false;
                scope.showEditClienthouseholddetailsForm = false;
                scope.totalIncome = 0;
                refreshAndShowSummaryView();
            }

            function hideAll() {
                scope.showSummary = false;
                scope.showAddClientoccupationdetailsForm = false;
                scope.showEditClientoccupationdetailsForm = false;
                scope.showAddClientassetdetailsForm = false;
                scope.showEditClientassetdetailsForm = false;
                scope.showAddClienthouseholddetailsForm = false;
                scope.showEditClienthouseholddetailsForm = false;
            };

            function incomeAndexpense() {
                resourceFactory.incomeExpenseAndHouseHoldExpense.getAll({
                    clientId: scope.clientId
                }, function (data) {
                    scope.incomeAndExpenses = data;
                    scope.totalIncomeOcc = scope.calculateOccupationTotal();
                    scope.totalIncomeAsset = scope.calculateTotalAsset();
                    scope.totalHouseholdExpense = scope.calculateTotalExpense();
                    scope.showSummaryView();
                });
            };

            scope.calculateOccupationTotal = function () {
                var total = 0;
                angular.forEach(scope.incomeAndExpenses, function (incomeExpense) {
                    if (!_.isUndefined(incomeExpense.incomeExpenseData.cashFlowCategoryData.categoryEnum) && incomeExpense.incomeExpenseData.cashFlowCategoryData.categoryEnum.id == 1) {
                        if (!_.isUndefined(incomeExpense.totalIncome) && !_.isNull(incomeExpense.totalIncome)) {
                            if (!_.isUndefined(incomeExpense.totalExpense) && !_.isNull(incomeExpense.totalExpense)) {
                                total = total + incomeExpense.totalIncome - incomeExpense.totalExpense;
                            } else {
                                total = total + incomeExpense.totalIncome;
                            }
                        }
                    }
                });
                return total;
            };

            scope.calculateTotalAsset = function () {
                var total = 0;
                angular.forEach(scope.incomeAndExpenses, function (incomeExpense) {
                    if (!_.isUndefined(incomeExpense.incomeExpenseData.cashFlowCategoryData.categoryEnum) && incomeExpense.incomeExpenseData.cashFlowCategoryData.categoryEnum.id == 2) {
                        if (!_.isUndefined(incomeExpense.totalIncome) && !_.isNull(incomeExpense.totalIncome)) {
                            if (!_.isUndefined(incomeExpense.totalExpense) && !_.isNull(incomeExpense.totalExpense)) {
                                total = total + incomeExpense.totalIncome - incomeExpense.totalExpense;
                            } else {
                                total = total + incomeExpense.totalIncome;
                            }
                        }
                    }
                });
                return total;
            };

            scope.calculateTotalExpense = function () {
                var total = 0;
                angular.forEach(scope.incomeAndExpenses, function (incomeExpense) {
                    if (!_.isUndefined(incomeExpense.incomeExpenseData.cashFlowCategoryData.typeEnum) && incomeExpense.incomeExpenseData.cashFlowCategoryData.typeEnum.id == 2) {
                        if (!_.isUndefined(incomeExpense.totalExpense) && !_.isNull(incomeExpense.totalExpense)) {
                            total = total + incomeExpense.totalExpense;
                        }
                    }
                });
                return total;
            };

            scope.showSummaryView = function () {
                hideAll();
                scope.showSummary = true;
            };

            function refreshAndShowSummaryView() {
                incomeAndexpense();
            };

        }
    });
    mifosX.ng.application.controller('ViewClientAdditionalDetailsController', ['$controller', '$scope', '$modal', 'ResourceFactory', 'dateFilter', '$http', '$rootScope', '$upload', 'API_VERSION', mifosX.controllers.ViewClientAdditionalDetailsController]).run(function ($log) {
        $log.info("ViewClientAdditionalDetailsController initialized");
    });
}(mifosX.controllers || {}));