(function (module) {
    mifosX.controllers = _.extend(module, {
        clientdocumentActivityController: function ($controller, scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION, $upload, $rootScope) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.onFileSelect = function ($files) {
                scope.file = $files[0];
            };
            
            function initTask() {
                scope.documentTagOptions = [];
                if (scope.taskconfig.hasOwnProperty('entityType')) {
                    scope.entityType = scope.taskconfig['entityType'];
                    switch (scope.entityType) {
                        case "loanapplication":
                            scope.loanApplicationId = scope.taskconfig['loanApplicationId'];
                            scope.entityId = scope.taskconfig['loanApplicationId'];
                            scope.documentTagName = 'Loan Application Document Tags';
                            break;
                        case "centers":
                            scope.centerId = scope.taskconfig['centerId'];
                            scope.entityId = scope.taskconfig['centerId'];
                            scope.documentTagName = 'Center Document Tags';
                            break;
                        case "villages":
                            scope.villageId = scope.taskconfig['villageId'];
                            scope.entityId = scope.taskconfig['villageId'];
                            scope.documentTagName = 'Village Document Tags';
                            break;
                        case "districts":
                            scope.districtId = scope.taskconfig['districtId'];
                            scope.entityId = scope.taskconfig['districtId'];
                            scope.documentTagName = 'District Document Tags';
                            break;
                        case "offices":
                            scope.officeId = scope.taskconfig['officeId'];
                            scope.entityId = scope.taskconfig['officeId'];
                            scope.documentTagName = 'Office Document Tags';
                            break;
                        case "tasks":
                            scope.taskId = scope.taskconfig['taskId'];
                            scope.entityId = scope.taskconfig['taskId'];
                            scope.documentTagName = 'Task Document Tags';
                            break;
                        case "groups":
                            scope.groupId = scope.taskconfig['groupId'];
                            scope.entityId = scope.taskconfig['groupId'];
                            scope.documentTagName = 'Group Document Tags';
                            break;
                        case "savings":
                            scope.savingsAccountId = scope.taskconfig['savingsAccountId'];
                            scope.entityId = scope.taskconfig['savingsAccountId'];
                            scope.documentTagName = 'Saving Document Tags';
                            break;
                        case "loans":
                            scope.loanId = scope.taskconfig['loanId'];
                            scope.entityId = scope.taskconfig['loanId'];
                            scope.documentTagName = 'Loan Document Tags';
                            break;
                        case "staff":
                            scope.staffId = scope.taskconfig['staffId'];
                            scope.entityId = scope.taskconfig['staffId'];
                            scope.documentTagName = 'Staff Document Tags';
                            break;
                        case "client_identifiers":
                            scope.clientIdentifierId = scope.taskconfig['clientIdentifierId'];
                            scope.entityId = scope.taskconfig['clientIdentifierId'];
                            scope.documentTagName = 'Client Identifier Document Tags';
                            break;
                        case "clients":
                            scope.clientId = scope.taskconfig['clientId'];
                            scope.entityId = scope.taskconfig['clientId'];
                            scope.documentTagName = 'Client Document Tags';
                            break;
                        default:
                            scope.entityType = 'clients';
                            scope.clientId = scope.taskconfig['clientId'];
                            scope.entityId = scope.taskconfig['clientId'];
                            scope.documentTagName = 'Client Document Tags';
                            break;
                            getDocuments();
                            getDocumentTags();
                    }
                } else {
                    scope.entityType = 'clients';
                    scope.clientId = scope.taskconfig['clientId'];
                    scope.entityId = scope.taskconfig['clientId'];
                    scope.documentTagName = 'Client Document Tags';
                    getDocuments();
                    getDocumentTags();
                }
                scope.formData = {};
            };

            initTask();

            function getDocumentTags() {
                resourceFactory.codeValueByCodeNameResources.get({codeName: scope.documentTagName}, function (codeValueData) {
                scope.documentTagOptions = codeValueData;
            });
            };
            function getDocuments() {
                resourceFactory.documentsResource.getAllDocuments({entityType: scope.entityType, entityId: scope.entityId}, function (data) {
                    scope.clientdocuments = {};
                    for (var l = 0; l < data.length; l++) {
                        if (data[l].id) {
                            var loandocs = {};
                            loandocs = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                            data[l].docUrl = loandocs;
                        }
                        if(data[l].tagValue){
                            scope.pushDocumentToTag(data[l], data[l].tagValue);
                        } else {
                            scope.pushDocumentToTag(data[l], 'uploadedDocuments');
                        }
                    }
                });
            };

            scope.pushDocumentToTag = function(document, tagValue){
                if (scope.clientdocuments.hasOwnProperty(tagValue)) {
                    scope.clientdocuments[tagValue].push(document);
                } else {
                    scope.clientdocuments[tagValue] = [];
                    scope.clientdocuments[tagValue].push(document);
                }
            };

            scope.deleteDocument = function (documentId, index, tagValue) {
                resourceFactory.documentsResource.delete({entityType: scope.entityType, entityId: scope.entityId, documentId: documentId}, '', function (data) {
                    scope.clientdocuments[tagValue].splice(index, 1);
                });
            };

            scope.generateDocument = function (document){
                resourceFactory.documentsGenerateResource.generate({entityType: scope.entityType, entityId: scope.entityId, identifier: document.reportIdentifier}, function(data){
                    document.id = data.resourceId;
                    var loandocs = {};
                    loandocs = API_VERSION + '/' + document.parentEntityType + '/' + document.parentEntityId + '/documents/' + document.id + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                    document.docUrl = loandocs;
                })
            };

            scope.reGenerateDocument = function (document){
                resourceFactory.documentsGenerateResource.reGenerate({entityType: scope.entityType, entityId: scope.entityId, identifier: document.id}, function(data){
                    document.id = data.resourceId;
                    var loandocs = {};
                    loandocs = API_VERSION + '/' + document.parentEntityType + '/' + document.parentEntityId + '/documents/' + document.id + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                    document.docUrl = loandocs;
                })
            };

            scope.submit = function () {
                $upload.upload({
                    url: $rootScope.hostUrl + API_VERSION + '/' + scope.entityType + '/' + scope.entityId + '/documents',
                    data: scope.formData,
                    file: scope.file
                }).then(function (data) {
                        // to fix IE not refreshing the model
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                        scope.activityDone();
                        getDocuments();
                        scope.formData = {};
                    });
            };
        }
    });
    mifosX.ng.application.controller('clientdocumentActivityController', ['$controller','$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.clientdocumentActivityController]).run(function ($log) {
        $log.info("clientdocumentActivityController initialized");
    });
}(mifosX.controllers || {}));