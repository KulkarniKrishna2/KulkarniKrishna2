(function (module) {
    mifosX.controllers = _.extend(module, {
        CenterDocumentActivityController: function ($controller, scope, routeParams, $modal, resourceFactory, location, dateFilter, route, $http, $rootScope, $route, $upload, API_VERSION, commonUtilService) {
            angular.extend(this, $controller('defaultActivityController', {
                $scope: scope
            }));
            scope.documentFormdata = {};
            scope.documentUploadData = {};
            scope.restrictTaggedDocuments = false;

            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.documentConfiguration && scope.response.uiDisplayConfigurations.documentConfiguration.restrictTaggedDocuments) {
                scope.restrictTaggedDocuments = scope.response.uiDisplayConfigurations.documentConfiguration.restrictTaggedDocuments;
            }

            function initTask() {
                scope.$parent.clientsCount();
                scope.isAllClientFinishedThisTask = true;
                scope.taskInfoTrackArray = [];
                scope.centerId = scope.taskconfig.centerId;
                scope.isLoanPurposeEditable = true;
                resourceFactory.centerWorkflowResource.get({
                    centerId: scope.centerId,
                    eventType: scope.eventType,
                    associations: 'groupMembers,profileratings,loanaccounts,clientcbcriteria,collectionMeetingCalendar,subgroupDocuments'
                }, function (data) {
                    scope.centerDetails = data;
                    scope.officeId = scope.centerDetails.officeId;
                    scope.centerDetails.isAllChecked = false;
                    scope.validateAllClients(data, true);
                });
            };
            initTask();

            scope.moveMembersToNextStep = function () {
                scope.taskTrackingFormData = {};
                scope.taskTrackingFormData.taskInfoTrackArray = [];
                scope.taskTrackingFormData.taskInfoTrackArray = scope.taskInfoTrackArray.slice();
                resourceFactory.clientLevelTaskTrackingResource.save(scope.taskTrackingFormData, function (trackRespose) {
                    initTask();
                });
            };

            scope.captureMembersToNextStep = function (clientId, loanId, isChecked) {
                if (isChecked) {
                    scope.taskInfoTrackArray.push(
                        {
                            'clientId': clientId,
                            'currentTaskId': scope.taskData.id,
                            'loanId': loanId
                        })
                } else {
                    var idx = scope.taskInfoTrackArray.findIndex(x => x.clientId == clientId);
                    if (idx >= 0) {
                        scope.taskInfoTrackArray.splice(idx, 1);
                        scope.centerDetails.isAllChecked = false;
                    }

                }
            }
            scope.validateAllClients = function (centerDetails, isAllChecked) {
                scope.taskInfoTrackArray = [];
                for (var i in centerDetails.subGroupMembers) {
                    for (var j in centerDetails.subGroupMembers[i].memberData) {
                        var activeClientMember = centerDetails.subGroupMembers[i].memberData[j];
                        var clientLevelTaskTrackObj =centerDetails.subGroupMembers[i].memberData[j].clientLevelTaskTrackingData;
                        if (isAllChecked) {
                            if (activeClientMember.status.code != 'clientStatusType.onHold' && !activeClientMember.isClientFinishedThisTask) {
                                centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = true;
                                if(!_.isUndefined(clientLevelTaskTrackObj) && scope.taskData.id == clientLevelTaskTrackObj.currentTaskId){
                                    scope.isAllClientFinishedThisTask = false;
                                    scope.captureMembersToNextStep(activeClientMember.id, activeClientMember.loanAccountBasicData.id, activeClientMember.isMemberChecked);
                                }    
                            }
                        } else {
                            centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = false;
                        }

                    }
                }
            }

            function initDocumentUploadTask() {
                scope.documentFormdata = {};
                scope.isUploadDocumentTagMandatory = true;
                scope.isFileMandatory = true;
                scope.entityType = 'centers';
                scope.entityId = scope.centerId;
                scope.isFileSelected = false;
                scope.documentTagName = 'Center Document Tags';
                getCenterDocuments();
            };

            initDocumentUploadTask();

            function getCenterDocumentNames() {
                resourceFactory.codeValueByCodeNameResources.get({ codeName: scope.documentTagName }, function (codeValueData) {
                    scope.centerDocumentNames = [];
                    scope.availableDocumentNames = [];
                    scope.centerDocumentNames = codeValueData;
                    scope.availableDocumentNames = codeValueData;
                    initCenterDocumentNames();
                });
            }

            function initCenterDocumentNames() {
                if (scope.centerdocuments != undefined) {
                    for (var key in scope.centerdocuments) {
                        for (var value in scope.centerdocuments[key]) {
                            var index = scope.centerDocumentNames.findIndex(obj => obj.name === scope.centerdocuments[key][value].name);
                            if (index >= 0) {
                                scope.availableDocumentNames.splice(index, 1);
                            }
                        }
                    }
                }
            }

            function getCenterDocuments() {
                resourceFactory.documentsResource.getAllDocuments({ entityType: scope.entityType, entityId: scope.entityId }, function (data) {
                    scope.centerdocuments = {};
                    for (var l = 0; l < data.length; l++) {
                        if (data[l].id) {
                            data[l].docUrl = documentsURL(data[l]);
                        }
                        if (data[l].tagValue && !scope.restrictTaggedDocuments) {
                            pushDocumentToTag(data[l], data[l].tagValue);
                        } else if (!data[l].tagValue) {
                            pushDocumentToTag(data[l], 'uploadedDocuments');
                        }
                    }
                    getCenterDocumentNames();
                });
            };

            function pushDocumentToTag(document, tagValue) {
                if (scope.centerdocuments && scope.centerdocuments.hasOwnProperty(tagValue)) {
                    scope.centerdocuments[tagValue].push(document);
                } else {
                    scope.centerdocuments[tagValue] = [];
                    scope.centerdocuments[tagValue].push(document);
                }
            };

            scope.onFileSelect = function ($files) {
                scope.file = $files[0];
                scope.isFileSelected = true;
            };

            function documentsURL(document) {
                return API_VERSION + '/' + document.parentEntityType + '/' + document.parentEntityId + '/documents/' + document.id + '/attachment';
            };

            scope.deleteDoc = function (documentId, index, tagValue) {
                resourceFactory.documentsResource.delete({ entityType: scope.entityType, entityId: scope.entityId, documentId: documentId.id }, '', function (data) {
                    getCenterDocuments();
                });
            };

            scope.setFileName = function () {
                for (var i in scope.centerDocumentNames) {
                    if (scope.centerDocumentNames[i].id == scope.documentFormdata.tagIdentifier) {
                        scope.filename = scope.centerDocumentNames[i].name;
                        scope.documentFormdata.name = scope.filename;
                    }
                }
            }

            scope.submitDocument = function () {
                constructDocumentUploadData();
                $upload.upload({
                    url: $rootScope.hostUrl + API_VERSION + '/' + scope.entityType + '/' + scope.entityId + '/documents',
                    data: scope.documentUploadData,
                    file: scope.file
                }).then(function (data) {
                    getCenterDocuments();
                    if (!_.isUndefined(scope.documentFormdata) && !_.isUndefined(scope.documentFormdata.name)) {
                        var index = scope.centerDocumentNames.findIndex(x => x.name === scope.documentFormdata.name);
                        if (index >= 0) {
                            scope.availableDocumentNames.splice(index, 1);
                        }
                    }
                    scope.documentFormdata = {};
                    scope.filename = '';
                    angular.element('#file').val(null);
                    scope.isFileSelected = false;
                });
            };

            function constructDocumentUploadData() {
                scope.documentUploadData.name = scope.documentFormdata.name;
                if (!_.isUndefined(scope.documentFormdata.description)) {
                    scope.documentUploadData.description = scope.documentFormdata.description;
                }
            }

            scope.download = function (document) {
                var url = $rootScope.hostUrl + document.docUrl;
                var documentType = document.fileName.substr(document.fileName.lastIndexOf('.') + 1);
                commonUtilService.downloadFile(url, documentType);
            };

        }
    });
    mifosX.ng.application.controller('CenterDocumentActivityController', ['$controller', '$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter', '$route', '$http', '$rootScope', '$route', '$upload', 'API_VERSION', 'CommonUtilService', mifosX.controllers.CenterDocumentActivityController]).run(function ($log) {
        $log.info("CenterDocumentActivityController initialized");
    });
}(mifosX.controllers || {}));