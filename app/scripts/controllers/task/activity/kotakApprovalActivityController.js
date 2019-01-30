(function (module) {
    mifosX.controllers = _.extend(module, {
        kotakApprovalActivityController: function ($controller, scope, routeParams, $modal, resourceFactory, location, dateFilter, ngXml2json, route, $http, $rootScope, $sce, CommonUtilService, $route, $upload, API_VERSION) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));
            scope.disabledStatus = ['UnderKotakApproval', 'UnderODUReview','ODUReviewed','SystemApproved','SystemApprovedWithDeviation','CreditReviewed']; 
            function initializeLoanAccountStatus(member){
                if(member.loanAccountBasicData != undefined){
                    if(member.loanAccountBasicData.status.id == 200){
                        member.loanAccountBasicData.isNotLoanApproved = false;
                        member.isMemberChecked = true;
                        scope.captureMembersToNextStep(member.id,member.loanAccountBasicData.id,member.isMemberChecked);
                        scope.totalMember++;

                    }else{
                        member.loanAccountBasicData.isNotLoanApproved = true;
                    }
                }
            }

            scope.isDisabled = function(isClientFinishedThisTask, isNotLoanApproved, status){
                return isClientFinishedThisTask || isNotLoanApproved || scope.disabledStatus.indexOf(status)>-1;
            }

            function initTask() {
                scope.$parent.clientsCount();
                scope.centerId = scope.taskconfig.centerId;
                scope.taskInfoTrackArray = [];
                resourceFactory.centerWorkflowResource.get({ centerId: scope.centerId, eventType : scope.eventType, associations: 'groupMembers,loanaccounts,cbexistingloanssummary,kotakapprovalcriteria,loanproposalreview,workflowloanstatus' }, function (data) {
                    scope.centerDetails = data;
                    scope.rejectTypes = data.rejectTypes;
                    scope.clientClosureReasons = data.clientClosureReasons;
                    scope.groupClosureReasons = data.groupClosureReasons;
                    scope.officeId = scope.centerDetails.officeId;
                    scope.isAllClientFinishedThisTask = true;
                    scope.centerDetails.isAllChecked = false;
                    scope.totalMember = 0;
                    //logic to disable and highlight member
                    for(var i = 0; i < scope.centerDetails.subGroupMembers.length; i++){
                        if(scope.centerDetails.subGroupMembers[i].memberData){
                            for(var j = 0; j < scope.centerDetails.subGroupMembers[i].memberData.length; j++){

                              var clientLevelTaskTrackObj =  scope.centerDetails.subGroupMembers[i].memberData[j].clientLevelTaskTrackingData;
                              var clientLevelCriteriaObj =  scope.centerDetails.subGroupMembers[i].memberData[j].clientLevelCriteriaResultData;
                              scope.centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = false;
                              scope.centerDetails.subGroupMembers[i].memberData[j].allowLoanRejection = false;
                              if(clientLevelTaskTrackObj == undefined){
                                if (scope.eventType && scope.eventType == 'create') {
                                    scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
                                } else {
                                    scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
                                }
                                scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-none";
                              }else if(clientLevelTaskTrackObj != undefined && clientLevelCriteriaObj != undefined){
                                    if(scope.taskData.id != clientLevelTaskTrackObj.currentTaskId){
                                        if(clientLevelCriteriaObj.score == 5){
                                              scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
                                              scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-grey";
                                        }else if(clientLevelCriteriaObj.score >= 0 && clientLevelCriteriaObj.score <= 4){
                                            scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
                                            scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-red";
                                        }         
                                    }else if(scope.taskData.id == clientLevelTaskTrackObj.currentTaskId){
                                        if(clientLevelCriteriaObj.score == 5){
                                              scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = false;
                                              scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-grey";
                                              scope.isAllClientFinishedThisTask = false;
                                              initializeLoanAccountStatus(scope.centerDetails.subGroupMembers[i].memberData[j]);
                                        }else if(clientLevelCriteriaObj.score >= 0 && clientLevelCriteriaObj.score <= 4){
                                            scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = false;
                                            scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-red";
                                            scope.isAllClientFinishedThisTask = false;
                                            initializeLoanAccountStatus(scope.centerDetails.subGroupMembers[i].memberData[j]);
                                        }
                                    }
                              }else if(clientLevelTaskTrackObj != undefined && (clientLevelCriteriaObj == undefined || clientLevelCriteriaObj == null)){
                                  if(scope.taskData.id != clientLevelTaskTrackObj.currentTaskId){
                                      scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
                                      scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-grey";
                                   }
                                   if(scope.taskData.id == clientLevelTaskTrackObj.currentTaskId){
                                      scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = false;
                                      scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-none";
                                       scope.isAllClientFinishedThisTask = false;
                                       initializeLoanAccountStatus(scope.centerDetails.subGroupMembers[i].memberData[j]);
                                   }
                              }
                            }
                        }
                    }
                });

            };
            initTask();

            //Review History
            scope.showReviewHistory = function(loanId){
                  $modal.open({
                    templateUrl : 'views/task/popup/loanproposalhistoryreview.html',
                    controller : reviewHistoryCtrl,
                    backdrop: 'static',
                    windowClass: 'app-modal-window-full-screen',
                    resolve: {
                        historyParameterInfo: function () {
                            return {'loanId': loanId };
                        }
                    }
                })
            }
            
             var reviewHistoryCtrl = function ($scope, $modalInstance, historyParameterInfo) {
				 $scope.df = scope.df;

                 $scope.loanId = historyParameterInfo.loanId;
                 $scope.reviewHistory = []

                 resourceFactory.loanProposalReviewHistoryResource.getAll({
                     loanId: $scope.loanId
                 }, function (data) {
                     $scope.reviewHistory = data.slice();
                 });

                 $scope.close = function () {
                     $modalInstance.dismiss('close');
                 };

                 //view review reason document

                 $scope.openViewDocument = function (historyId, documentId) {
                    scope.reportEntityType = "loan_proposal_review";
                    var url = $rootScope.hostUrl + '/fineract-provider/api/v1/' + scope.reportEntityType + '/' +
                    historyId +'/documents/'+ documentId + '/attachment';
                    url = $sce.trustAsResourceUrl(url);
                    $http.get(url, { responseType: 'arraybuffer' }).
                    success(function(data, status, headers, config) {
                        var supportedContentTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/html', 'application/xml', 'text/plain',];
                        var contentType = headers('Content-Type');
                        var file = new Blob([data], { type: contentType });
                        var fileContent = URL.createObjectURL(file);
                        if (supportedContentTypes.indexOf(contentType) > -1) {
                            var docData = $sce.trustAsResourceUrl(fileContent);
                            window.open(docData);
                        }
                    });
                 };

                 //downloan the reason document
                 $scope.download = function (historyId, document) {
                    scope.reportEntityType = "loan_proposal_review";
                    var url = $rootScope.hostUrl + '/fineract-provider/api/v1/' + scope.reportEntityType + '/' +
                    historyId +'/documents/'+ document.documentId + '/attachment';
                    var fileType = document.fileName.substr(document.fileName.lastIndexOf('.') + 1);
                    CommonUtilService.downloadFile(url,fileType);
                 }

             }

            scope.captureMembersToNextStep = function(clientId, loanId, isChecked){
                if(isChecked){
                    scope.taskInfoTrackArray.push(
                        {'clientId' : clientId,
                            'currentTaskId' : scope.taskData.id,
                            'loanId' : loanId});
                    if(scope.taskInfoTrackArray.length == scope.totalMember){
                        scope.centerDetails.isAllChecked = true;
                    }

                }else{
                    var idx = scope.taskInfoTrackArray.findIndex(x => x.clientId == clientId);
                    if(idx >= 0){
                        scope.taskInfoTrackArray.splice(idx,1);
                        scope.centerDetails.isAllChecked = false;
                    }

                }
            }
            
            scope.moveMembersToNextStep = function(){
                scope.errorDetails = [];
                if(scope.taskInfoTrackArray.length == 0){
                    return scope.errorDetails.push([{code: 'error.msg.select.atleast.one.member'}])
                }

                scope.taskTrackingFormData = {};
                scope.taskTrackingFormData.taskInfoTrackArray = [];

                scope.taskTrackingFormData.taskInfoTrackArray = scope.taskInfoTrackArray.slice();
                resourceFactory.clientLevelTaskTrackingResource.save(scope.taskTrackingFormData, function(trackRespose) {
                    initTask();
                })

            }



            scope.releaseClient = function (clientId) {
                var releaseClientFormData = {};
                releaseClientFormData.locale = scope.optlang.code;
                releaseClientFormData.dateFormat = scope.df;
                releaseClientFormData.reactivationDate = dateFilter(new Date(),scope.df);
                var queryParams = {clientId: clientId, command: 'reactivate'};
                resourceFactory.clientResource.save(queryParams,releaseClientFormData, function (data) {
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
                            if(member.loanAccountBasicData){
                                return { 'memberId': member.id,
                                'memberName': member.displayName,
                                'fcsmNumber':member.fcsmNumber,
                                'loanId':member.loanAccountBasicData.id,
                                'allowLoanRejection' : member.allowLoanRejection };
                            }
                            return { 'memberId': member.id,
                                'memberName': member.displayName,
                                'fcsmNumber':member.fcsmNumber,
                                'allowLoanRejection' : member.allowLoanRejection };
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
                if(memberParams.loanId){
                   $scope.loanId =  memberParams.loanId;
                }
/*                if(!memberParams.allowLoanRejection){
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
                    if($scope.rejectClientData.rejectType==undefined || $scope.rejectClientData.rejectType==null || $scope.rejectClientData.rejectType.length==0){
                        $scope.isRejectType = false;
                        $scope.isError = true;
                    }
                    if($scope.rejectClientData.closureReasonId==undefined || $scope.rejectClientData.closureReasonId==null){
                        $scope.isReason = false;
                        $scope.isError = true;
                    }
                    if($scope.rejectClientData.closureDate==undefined || $scope.rejectClientData.closureDate==null || $scope.rejectClientData.closureDate.length==0){
                        $scope.isClosureDate = false;
                        $scope.isError = true;
                    }
                    if($scope.isError){
                        return false;
                    }
                    if($scope.rejectClientData.closureDate){
                        $scope.rejectClientData.closureDate = dateFilter($scope.rejectClientData.closureDate, scope.df);
                    }
                    if($scope.rejectClientData.rejectType != 4){
                        resourceFactory.clientResource.save({clientId: memberParams.memberId, command: 'close'}, $scope.rejectClientData, function (data) {
                       $modalInstance.dismiss('cancel');
                       initTask();
                    });
                    }else{
                        var loanRejectData = {rejectedOnDate:$scope.rejectClientData.closureDate,
                                              locale:scope.optlang.code,
                                              dateFormat:scope.df,
                                              rejectReasonId:$scope.rejectClientData.closureReasonId
                                             };

                        var params = {command: 'reject',loanId:$scope.loanId};
                        resourceFactory.LoanAccountResource.save(params, loanRejectData, function (data) {
                            $modalInstance.dismiss('cancel');
                            initTask();
                        });
                    }
                };

            }
            //Kotak approval critieria result view
            scope.openViewKotakCriteriaResult = function(criteriaResult){
                var templateUrl = 'views/task/popup/kotakcriteriaresult.html';
                $modal.open({
                    templateUrl: templateUrl,
                    controller: viewKotakCriteriaResultCtrl,
                    windowClass: 'modalwidth700',
                    resolve: {
                        memberParams: function () {
                            return { 'criteriaResult': criteriaResult };
                        }
                    }
                });
            }

            var viewKotakCriteriaResultCtrl = function ($scope, $modalInstance, memberParams) {
				$scope.df = scope.df;
                $scope.kotakCriteriaResult = JSON.parse(memberParams.criteriaResult);

                $scope.close = function () {
                    $modalInstance.dismiss('close');
                };
            }

            scope.hideClient = function(activeClientMember){
                if(activeClientMember.status.code == 'clientStatusType.onHold' || scope.eventType == 'loancycle'){
                    return true;
                }
                return false;
            }
            scope.validateAllClients = function(centerDetails,isAllChecked){
                scope.taskInfoTrackArray = [];
                for(var i in centerDetails.subGroupMembers){
                    for(var j in centerDetails.subGroupMembers[i].memberData){
                        var activeClientMember = centerDetails.subGroupMembers[i].memberData[j];
                        if(isAllChecked){
                            if(activeClientMember.status.code != 'clientStatusType.onHold' && !activeClientMember.isClientFinishedThisTask && !activeClientMember.loanAccountBasicData.isNotLoanApproved &&  scope.disabledStatus.indexOf(activeClientMember.loanAccountBasicData.workflowLoanStatusEnum.code)<0){
                                centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = true;
                                scope.captureMembersToNextStep(activeClientMember.id, activeClientMember.loanAccountBasicData.id, activeClientMember.isMemberChecked);
                            }
                        }else{
                            centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = false;
                        }

                    }
                }
            }
            


        }
        });
    mifosX.ng.application.controller('kotakApprovalActivityController', ['$controller', '$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter', 'ngXml2json', '$route', '$http', '$rootScope', '$sce', 'CommonUtilService', '$route', '$upload', 'API_VERSION', mifosX.controllers.kotakApprovalActivityController]).run(function ($log) {
        $log.info("kotakApprovalActivityController initialized");
    });
}(mifosX.controllers || {}));