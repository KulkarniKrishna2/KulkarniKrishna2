(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewBankAccountCommonController: function ($controller, scope, resourceFactory, API_VERSION, $rootScope, $http) {
            angular.extend(this, $controller('defaultUIConfigController', { $scope: scope, $key: "bankAccountDetails" }));
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));

            scope.viewConfig = {};
            scope.viewConfig.data = false;
            scope.viewConfig.viewDocument = false;
            var bankAccountDetailStatusActive = 200;

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

            function populateDetails() {
                scope.bankAccountData = getBankAccountDetailsData();
                if (scope.bankAccountData.status != undefined && scope.bankAccountData.status.id == bankAccountDetailStatusActive) {
                    scope.viewConfig.data = true;
                }
                getBankAccountDocuments();
            }

            function getBankAccountDocuments() {
                resourceFactory.bankAccountDetailsDocumentsResource.getAllDocuments({
                    entityType: getEntityType(),
                    entityId: getEntityId(),
                    bankAccountDetailsId: getBankAccountDetailsId()
                }, function (data) {
                    scope.bankAccountDocuments = data.result.bankAccountDocuments || [];
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

            scope.viewDocument = function (document) {
                var url = document.docUrl;
                $http({
                    method: 'GET',
                    url: url
                }).then(function (documentImage) {
                    scope.viewConfig.viewDocument = true;
                    scope.documentImg = documentImage.data;
                });
            }

            function init() {
                populateDetails();
            }

            init();

        }
    });
    mifosX.ng.application.controller('ViewBankAccountCommonController', ['$controller', '$scope', 'ResourceFactory', 'API_VERSION', '$rootScope', '$http', mifosX.controllers.ViewBankAccountCommonController]).run(function ($log) {
        $log.info("ViewBankAccountCommonController initialized");
    });
}(mifosX.controllers || {}));