(function (module) {
    mifosX.controllers = _.extend(module, {
        DocumentGenerationActivityController: function ($controller, scope, routeParams, $modal, resourceFactory, location, dateFilter, route, $http, $rootScope, $route, $upload, API_VERSION, commonUtilService) {
            angular.extend(this, $controller('defaultActivityController', {
                $scope: scope
            }));
            scope.formData = {};
            scope.isDocumentGenerated = false;

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
                    scope.getDocuments(data);
                    scope.validateAllClients(data, true);
                    for (var i = 0; i < scope.centerDetails.subGroupMembers.length; i++) {
                        if (scope.centerDetails.subGroupMembers[i].memberData) {
                            for (var j = 0; j < scope.centerDetails.subGroupMembers[i].memberData.length; j++) {

                                var clientLevelTaskTrackObj = scope.centerDetails.subGroupMembers[i].memberData[j].clientLevelTaskTrackingData;
                                var clientLevelCriteriaObj = scope.centerDetails.subGroupMembers[i].memberData[j].clientLevelCriteriaResultData;
                                scope.centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = false;
                                scope.centerDetails.subGroupMembers[i].memberData[j].allowLoanRejection = false;
                                if (clientLevelTaskTrackObj == undefined) {
                                    scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
                                    scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-none";
                                } else if (clientLevelTaskTrackObj != undefined && clientLevelCriteriaObj != undefined) {
                                    if (scope.taskData.id != clientLevelTaskTrackObj.currentTaskId) {
                                        if (clientLevelCriteriaObj.score == 5) {
                                            scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
                                            scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-grey";
                                        } else if (clientLevelCriteriaObj.score >= 0 && clientLevelCriteriaObj.score <= 4) {
                                            scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
                                            scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-red";
                                        }
                                    } else if (scope.taskData.id == clientLevelTaskTrackObj.currentTaskId) {
                                        if (clientLevelCriteriaObj.score == 5) {
                                            scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = false;
                                            scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-grey";
                                            scope.isAllClientFinishedThisTask = false;
                                        } else if (clientLevelCriteriaObj.score >= 0 && clientLevelCriteriaObj.score <= 4) {
                                            scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = false;
                                            scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-red";
                                            scope.isAllClientFinishedThisTask = false;
                                        }
                                    }
                                } else if (clientLevelTaskTrackObj != undefined && (clientLevelCriteriaObj == undefined || clientLevelCriteriaObj == null)) {
                                    if (scope.taskData.id != clientLevelTaskTrackObj.currentTaskId) {
                                        scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
                                        scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-grey";
                                    }
                                    if (scope.taskData.id == clientLevelTaskTrackObj.currentTaskId) {
                                        scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = false;
                                        scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-none";
                                        scope.isAllClientFinishedThisTask = false;
                                    }
                                }
                            }
                        }

                    }
                });
            };
            initTask();

            function documentsURL(document) {
                return API_VERSION + '/' + document.parentEntityType + '/' + document.parentEntityId + '/documents/' + document.id + '/attachment';
            };
            scope.getDocuments = function (data) {
                scope.documents = [];
                delete scope.errorDetails;
                resourceFactory.documentsWithReportIdentifiersResource.query({ entityType: 'centers', entityId: data.id }, function (data) {
                    if (data && data.length > 0) {
                        scope.documents = data;
                        scope.isDocumentGenerated = true;
                        for (var l = 0; l < data.length; l++) {
                            data[l].docUrl = documentsURL(data[l]);
                        }
                    }else {
                        scope.isDocumentGenerated = false;
                    }
                });
            };
            scope.generateDocuments = function () {
                var generateDocumentForm = { documentEntityType: 'centers', taskEntityTypeId: 4 }
                generateDocumentForm.taskEntityId = scope.centerDetails.id;
                generateDocumentForm.taskId = scope.centerDetails.subGroupMembers[0].memberData[0].clientLevelTaskTrackingData.currentTaskId;
                resourceFactory.taskGenerateDocumentsResource.save(generateDocumentForm, function (data) {
                    scope.getDocuments(scope.centerDetails);
                });
            };

            scope.moveMembersToNextStep = function () {
                scope.errorDetails = [];
                if (scope.taskInfoTrackArray.length == 0) {
                    return scope.errorDetails.push([{ code: 'error.msg.select.atleast.one.member' }])
                }
                if (!scope.isDocumentGenerated) {
                    return scope.errorDetails.push([{ code: 'error.msg.generate.documents' }])
                }
                if(scope.errorDetails){
                    delete scope.errorDetails;
                }
                scope.taskTrackingFormData = {};
                scope.taskTrackingFormData.taskInfoTrackArray = [];
                scope.taskTrackingFormData.taskInfoTrackArray = scope.taskInfoTrackArray.slice();
                resourceFactory.clientLevelTaskTrackingResource.save(scope.taskTrackingFormData, function (trackRespose) {
                    initTask();
                });
            };

            scope.download = function (document) {
                var url = $rootScope.hostUrl + document.docUrl;
                var documentType = document.fileName.substr(document.fileName.lastIndexOf('.') + 1);
                commonUtilService.downloadFile(url, documentType);
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
                        if (isAllChecked) {
                            if (activeClientMember.status.code != 'clientStatusType.onHold' && !activeClientMember.isClientFinishedThisTask) {
                                centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = true;
                                scope.captureMembersToNextStep(activeClientMember.id, activeClientMember.loanAccountBasicData.id, activeClientMember.isMemberChecked);
                            }
                        } else {
                            centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = false;
                        }

                    }
                }
            }
        }
    });
    mifosX.ng.application.controller('DocumentGenerationActivityController', ['$controller', '$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter', '$route', '$http', '$rootScope', '$route', '$upload', 'API_VERSION', 'CommonUtilService', mifosX.controllers.DocumentGenerationActivityController]).run(function ($log) {
        $log.info("DocumentGenerationActivityController initialized");
    });
}(mifosX.controllers || {}));