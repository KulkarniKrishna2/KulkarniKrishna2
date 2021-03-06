(function (module) {
    mifosX.controllers = _.extend(module, {
        GRTReviewActivityController: function ($controller, scope, routeParams, $modal, resourceFactory, location, dateFilter, route, $http, $rootScope, $route, $upload, API_VERSION, popUpUtilService) {
            angular.extend(this, $controller('defaultActivityController', {
                $scope: scope
            }));

            scope.formData = {};
            scope.loanIdsForm = {};
            scope.loanIds = [];

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
                    scope.rejectTypes = data.rejectTypes;
                    scope.clientClosureReasons = data.clientClosureReasons;
                    scope.groupClosureReasons = data.groupClosureReasons;
                    scope.officeId = scope.centerDetails.officeId;
                    scope.centerDetails.isAllChecked = false;
                    //logic to get GRT activity details
                    scope.getGRTActivityDetails(data);
                    //logic to disable and highlight member
                    for (var i = 0; i < scope.centerDetails.subGroupMembers.length; i++) {
                        if (scope.centerDetails.subGroupMembers[i].memberData) {
                            for (var j = 0; j < scope.centerDetails.subGroupMembers[i].memberData.length; j++) {

                                var clientLevelTaskTrackObj = scope.centerDetails.subGroupMembers[i].memberData[j].clientLevelTaskTrackingData;
                                var clientLevelCriteriaObj = scope.centerDetails.subGroupMembers[i].memberData[j].clientLevelCriteriaResultData;
                                scope.centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = false;
                                scope.centerDetails.subGroupMembers[i].memberData[j].allowLoanRejection = false;
                                if(!_.isUndefined(scope.centerDetails.subGroupMembers[i].memberData[j].loanAccountBasicData)){
                                    scope.centerDetails.subGroupMembers[i].memberData[j].filteredCharges = scope.filterCharges(scope.centerDetails.subGroupMembers[i].memberData[j].loanAccountBasicData.charges);
                                }
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

            scope.getGRTActivityDetails = function (centerDetails) {
                if (centerDetails && centerDetails.subGroupMembers && centerDetails.subGroupMembers.length == 1) {
                    var groupId = centerDetails.subGroupMembers[0].id;
                    scope.isSingleGroupInCenter = true;
                    resourceFactory.grtCompletionResource.get({ groupId: groupId }, function (data) {
                        scope.grtCompletionDetails = data;
                        var today = new Date();
                        scope.grtStartTime = new Date(data.grtStartTime.iLocalMillis + (today.getTimezoneOffset() * 60 * 1000));
                        scope.grtEndTime = new Date(data.grtEndTime.iLocalMillis + (today.getTimezoneOffset() * 60 * 1000));
                    });
                    getGRTDocuments();
                } else {
                    scope.isSingleGroupInCenter = false;
                }
            }

            scope.addLoan = function (value, loanId) {
                if (value) {
                    scope.loanIds.push(loanId);
                } else {
                    var indexOfLoanId = scope.loanIds.indexOf(loanId);
                    if (indexOfLoanId >= 0) {
                        scope.loanIds.splice(indexOfLoanId, 1);
                    }
                }
            };

            function getGRTDocuments() {
                resourceFactory.codeValueByCodeNameResources.get({ codeName: 'groupDocumentNames' }, function (codeValueData) {
                    groupDocumentNames = codeValueData;
                    for (var i = 0; i < groupDocumentNames.length; i++) {
                        if (angular.lowercase(groupDocumentNames[i].name.split(" ").join("")) == 'grtphoto') {
                            scope.groupDocumentName = groupDocumentNames[i].name;
                        }
                    }
                    if (scope.centerDetails && scope.centerDetails.subGroupMembers && scope.centerDetails.subGroupMembers.length > 0) {
                        if (scope.isSingleGroupInCenter && scope.centerDetails.subGroupMembers[0].documentDatas && scope.centerDetails.subGroupMembers[0].documentDatas.length > 0) {
                            var groupdocuments = scope.centerDetails.subGroupMembers[0].documentDatas;
                            for (var i in groupdocuments) {
                                if (groupdocuments[i].name == scope.groupDocumentName) {
                                    scope.grtDocument = groupdocuments[i];
                                    if (!_.isUndefined(scope.grtDocument.geoTag)) {
                                        scope.grtLocation = JSON.parse(scope.grtDocument.geoTag);
                                    }
                                }
                            }
                        }
                    }
                });
            };

            scope.openViewDocument = function () {
                $modal.open({
                    templateUrl: 'viewUploadedDocument.html',
                    controller: viewUploadedDocumentCtrl,
                    resolve: {
                        documentDetail: function () {
                            return scope.grtDocument;
                        }
                    }
                });
            };

            var viewUploadedDocumentCtrl = function ($scope, $modalInstance, documentDetail) {
                $scope.data = documentDetail;
                $scope.close = function () {
                    $modalInstance.close('close');
                };
            };

            scope.filterCharges = function (chargeData) {
                if (!_.isUndefined(chargeData)) {
                    var chargesCategory = _.groupBy(chargeData, function (value) {
                        if(_.isUndefined(value.chargeCategoryType)){
                            return;
                        }
                        return value.chargeCategoryType.id;
                    });
                    return chargesCategory;
                }
            }


            scope.moveMembersToNextStep = function () {
                if (scope.taskInfoTrackArray.length == 0) {
                    scope.errorDetails = [];
                    return scope.errorDetails.push([{ code: 'error.msg.select.atleast.one.member' }])
                }
                if(scope.errorDetails){
                    delete scope.errorDetails;
                }
                scope.taskTrackingFormData = {};
                scope.taskTrackingFormData.taskInfoTrackArray = [];
                scope.taskTrackingFormData.taskInfoTrackArray = scope.taskInfoTrackArray.slice();
                scope.loanIdsForm.loans = scope.loanIds;
                resourceFactory.taskTrackingBulkLoanApprovalResource.update(scope.loanIdsForm, function (data) {
                    resourceFactory.clientLevelTaskTrackingResource.save(scope.taskTrackingFormData, function (trackRespose) {
                        initTask();
                    });
                });
            }

             //loan account edit 
             scope.refreshTask = function () {
                initTask();
            }

            //lona account edit 
            scope.editLoan = function (loanAccountBasicData, groupId) {
                scope.groupId = groupId;
                scope.loanAccountBasicData = loanAccountBasicData;
                if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.workflow &&
                    scope.response.uiDisplayConfigurations.workflow.isReadOnlyField) {
                    scope.isLoanProductReadOnly = scope.response.uiDisplayConfigurations.workflow.isReadOnlyField.loanProductForSpecificSteps;
                }
                var templateUrl = 'views/task/popup/editLoan.html';
                var controller = 'EditLoanController';
                popUpUtilService.openFullScreenPopUp(templateUrl, controller, scope);
            }

            // view center meeting
            scope.viewCenterMeeting = function () {
                scope.centerId = scope.centerDetails.id;
                scope.popUpHeaderName = "label.heading.center.meeting.details";
                scope.includeHTML = 'views/task/activity/centermeetingactivity.html';
                var templateUrl = 'views/common/openpopup.html';
                var controller = 'CenterMeetingActivityController';
                popUpUtilService.openFullScreenPopUp(templateUrl, controller, scope);

            }

            scope.releaseClient = function (clientId) {
                var releaseClientFormData = {};
                releaseClientFormData.locale = scope.optlang.code;
                releaseClientFormData.dateFormat = scope.df;
                releaseClientFormData.reactivationDate = dateFilter(new Date(), scope.df);
                var queryParams = { clientId: clientId, command: 'reactivate' };
                resourceFactory.clientResource.save(queryParams, releaseClientFormData, function (data) {
                    initTask();
                });

            }

            //client reject reason method call
            scope.clientRejection = function (member) {
                var templateUrl = 'views/task/popup/closeclient.html';

                $modal.open({
                    templateUrl: templateUrl,
                    controller: clientCloseCtrl,
                    windowClass: 'modalwidth700',
                    resolve: {
                        memberParams: function () {
                            if (member.loanAccountBasicData) {
                                return {
                                    'memberId': member.id,
                                    'memberName': member.displayName,
                                    'fcsmNumber': member.fcsmNumber,
                                    'loanId': member.loanAccountBasicData.id,
                                    'allowLoanRejection': member.allowLoanRejection
                                };
                            }
                            return {
                                'memberId': member.id,
                                'memberName': member.displayName,
                                'fcsmNumber': member.fcsmNumber,
                                'allowLoanRejection': member.allowLoanRejection
                            };
                        }
                    }
                });
            }
            var clientCloseCtrl = function ($scope, $modalInstance, memberParams) {
                $scope.df = scope.df;
                $scope.error = null;
                $scope.isError = false;
                $scope.isClosureDate = true;
                $scope.isRejectType = true;
                $scope.isReason = true;
                $scope.rejectClientData = {};
                $scope.memberName = memberParams.memberName;
                $scope.fcsmNumber = memberParams.fcsmNumber;
                $scope.rejectClientData.locale = scope.optlang.code;
                $scope.rejectClientData.dateFormat = scope.df;
                $scope.rejectTypes = scope.rejectTypes;
                if (memberParams.loanId) {
                    $scope.loanId = memberParams.loanId;
                }
                /*if(!memberParams.allowLoanRejection){
                    var idx = $scope.rejectTypes.findIndex(x => x.code == 'rejectType.loanRejection');
                    if(idx >= 0){
                        $scope.rejectTypes.splice(idx,1);
                    }    
                }*/
                $scope.clientClosureReasons = scope.clientClosureReasons;
                $scope.rejectClientData.closureDate = dateFilter(new Date(), scope.df);
                $scope.cancelClientClose = function () {
                    $modalInstance.dismiss('cancel');
                };
                $scope.submitClientClose = function () {
                    $scope.isError = false;
                    if ($scope.rejectClientData.rejectType == undefined || $scope.rejectClientData.rejectType == null || $scope.rejectClientData.rejectType.length == 0) {
                        $scope.isRejectType = false;
                        $scope.isError = true;
                    }
                    if ($scope.rejectClientData.closureReasonId == undefined || $scope.rejectClientData.closureReasonId == null) {
                        $scope.isReason = false;
                        $scope.isError = true;
                    }
                    if ($scope.rejectClientData.closureDate == undefined || $scope.rejectClientData.closureDate == null || $scope.rejectClientData.closureDate.length == 0) {
                        $scope.isClosureDate = false;
                        $scope.isError = true;
                    }
                    if ($scope.isError) {
                        return false;
                    }
                    if ($scope.rejectClientData.closureDate) {
                        $scope.rejectClientData.closureDate = dateFilter($scope.rejectClientData.closureDate, scope.df);
                    }
                    if ($scope.rejectClientData.rejectType != 4) {
                        resourceFactory.clientResource.save({ clientId: memberParams.memberId, command: 'close' }, $scope.rejectClientData, function (data) {
                            $modalInstance.dismiss('cancel');
                            initTask();
                        });
                    } else {
                        var loanRejectData = {
                            rejectedOnDate: $scope.rejectClientData.closureDate,
                            locale: scope.optlang.code,
                            dateFormat: scope.df,
                            rejectReasonId: $scope.rejectClientData.closureReasonId
                        };

                        var params = { command: 'reject', loanId: $scope.loanId };
                        resourceFactory.LoanAccountResource.save(params, loanRejectData, function (data) {
                            $modalInstance.dismiss('cancel');
                            initTask();
                        });
                    }
                };

            }

            scope.groupRejection = function (member) {
                var templateUrl = 'views/task/popup/closegroup.html';
                $modal.open({
                    templateUrl: templateUrl,
                    controller: groupCloseCtrl,
                    windowClass: 'modalwidth700',
                    resolve: {
                        memberParams: function () {
                            return {
                                'memberId': member.id,
                                'memberName': member.name,
                                'fcsmNumber': member.fcsmNumber
                            };
                        }
                    }
                });
            }
            var groupCloseCtrl = function ($scope, $modalInstance, memberParams) {
                $scope.df = scope.df;
                $scope.error = null;
                $scope.isError = false;
                $scope.isClosureDate = true;
                $scope.isReason = true;
                $scope.rejectGroupData = {};
                $scope.memberName = memberParams.memberName;
                $scope.fcsmNumber = memberParams.fcsmNumber;
                $scope.rejectGroupData.locale = scope.optlang.code;
                $scope.rejectGroupData.dateFormat = scope.df;
                $scope.rejectGroupData.closureDate = dateFilter(new Date(), scope.df);
                $scope.groupClosureReasons = scope.groupClosureReasons;

                $scope.cancelGroupClose = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.submitGroupClose = function () {
                    $scope.isError = false;
                    if ($scope.rejectGroupData.closureReasonId == undefined || $scope.rejectGroupData.closureReasonId == null) {
                        $scope.isReason = false;
                        $scope.isError = true;
                    }
                    if ($scope.rejectGroupData.closureDate == undefined || $scope.rejectGroupData.closureDate == null || $scope.rejectGroupData.closureDate.length == 0) {
                        $scope.isClosureDate = false;
                        $scope.isError = true;
                    }
                    if ($scope.isError) {
                        return false;
                    }
                    if ($scope.rejectGroupData.closureDate) {
                        $scope.rejectGroupData.closureDate = dateFilter($scope.rejectGroupData.closureDate, scope.df);
                    }
                    resourceFactory.groupResource.save({ groupId: memberParams.memberId, command: 'close' }, $scope.rejectGroupData, function (data) {
                        $modalInstance.dismiss('cancel');
                        initTask();
                    });
                };
            }

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
            scope.isActiveMember = function (activeClientMember) {
                if (activeClientMember.status.code == 'clientStatusType.onHold' || activeClientMember.status.code == 'clientStatusType.active') {
                    return true;
                }
                return false;
            }
            scope.isActiveSubGroup = function (groupMember) {
                if (groupMember.status.value == 'Active') {
                    return true;
                }
                return false;
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
                                scope.addLoan(activeClientMember.isMemberChecked, activeClientMember.loanAccountBasicData.id);
                            }
                        } else {
                            centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = false;
                            scope.addLoan(activeClientMember.isMemberChecked, activeClientMember.loanAccountBasicData.id);
                        }

                    }
                }
            }

            scope.viewAdditionalDetails = function (activeClientMember) {
                scope.popUpHeaderName = "label.heading.view.client.additional.details"
                scope.includeHTML = 'views/task/popup/viewclientadditionaldetails.html';
                scope.activeClientMember = activeClientMember;
                var templateUrl = 'views/common/openpopup.html';
                var controller = 'ViewClientAdditionalDetailsController';
                popUpUtilService.openFullScreenPopUp(templateUrl, controller, scope);
            };
        }
    });
    mifosX.ng.application.controller('GRTReviewActivityController', ['$controller', '$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter', '$route', '$http', '$rootScope', '$route', '$upload', 'API_VERSION', 'PopUpUtilService', mifosX.controllers.GRTReviewActivityController]).run(function ($log) {
        $log.info("GRTReviewActivityController initialized");
    });
}(mifosX.controllers || {}));