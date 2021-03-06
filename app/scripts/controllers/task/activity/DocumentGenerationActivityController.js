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
                generateDocumentForm.taskId = scope.taskData.id;
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
                        var clientLevelTaskTrackObj =centerDetails.subGroupMembers[i].memberData[j].clientLevelTaskTrackingData;
                        if (isAllChecked) {
                            if (activeClientMember.status.code != 'clientStatusType.onHold' && !activeClientMember.isClientFinishedThisTask) {
                                centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = true;
                                if(!_.isUndefined(clientLevelTaskTrackObj) && (scope.taskData.id == clientLevelTaskTrackObj.currentTaskId)){
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

            scope.confirmGenerateDocuments = function () {
                $modal.open({
                    templateUrl: 'confirmGenerateDocuments.html',
                    controller: ConfirmGenerateDocumentsCtrl
                });
            };
            var ConfirmGenerateDocumentsCtrl = function ($scope, $modalInstance) {
                $scope.confirm = function () {
                    scope.generateDocuments();
                    $modalInstance.close('confirm');
                }
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
        }
    });
    mifosX.ng.application.controller('DocumentGenerationActivityController', ['$controller', '$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter', '$route', '$http', '$rootScope', '$route', '$upload', 'API_VERSION', 'CommonUtilService', mifosX.controllers.DocumentGenerationActivityController]).run(function ($log) {
        $log.info("DocumentGenerationActivityController initialized");
    });
}(mifosX.controllers || {}));