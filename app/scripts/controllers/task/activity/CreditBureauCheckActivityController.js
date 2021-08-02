(function (module) {
    mifosX.controllers = _.extend(module, {
        CreditBureauCheckActivityController: function ($controller, scope, $modal, resourceFactory, dateFilter, $http, $rootScope, $sce, CommonUtilService, $upload, API_VERSION, routeParams, popUpUtilService) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));

            scope.showBulkCBInitiate = false;
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.workflow && scope.response.uiDisplayConfigurations.workflow.hiddenFields) {
                scope.isreviewCBHidden = scope.response.uiDisplayConfigurations.workflow.hiddenFields.reviewCB;
                scope.isSendToCBReviewHidden = scope.response.uiDisplayConfigurations.workflow.hiddenFields.sendToCBReview;
            };

            function initTask() {
                scope.$parent.clientsCount();
                scope.centerId = scope.taskconfig.centerId;
                scope.taskInfoTrackArray = [];
                scope.isAllClientFinishedThisTask = true;
                scope.isLoanPurposeEditable= true;
                resourceFactory.centerWorkflowResource.get({ centerId: scope.centerId, eventType : scope.eventType, associations: 'groupMembers,loanaccounts,cbexistingloanssummary,clientcbcriteria,loanproposalreview,memberattendance'}, function (data) {
                    scope.centerDetails = data;
                    scope.rejectTypes = data.rejectTypes;
                    scope.clientClosureReasons = data.clientClosureReasons;
                    scope.groupClosureReasons = data.groupClosureReasons;
                    scope.officeId = scope.centerDetails.officeId;
                    scope.centerDetails.isAllChecked = false;
                    for(var i in scope.centerDetails.subGroupMembers){
                        for(var j in scope.centerDetails.subGroupMembers[i].memberData){
                            if(!scope.centerDetails.subGroupMembers[i].memberData[j].cbExistingLoansSummaryData && scope.centerDetails.subGroupMembers[i].memberData[j].loanAccountBasicData){
                                scope.showBulkCBInitiate = true;
                                break;
                            }
                        }
                    }
                    //logic to disable and highlight member
                    for(var i = 0; i < scope.centerDetails.subGroupMembers.length; i++){
                        if(scope.centerDetails.subGroupMembers[i].memberData){
                            for(var j = 0; j < scope.centerDetails.subGroupMembers[i].memberData.length; j++){

                                var clientLevelTaskTrackObj =  scope.centerDetails.subGroupMembers[i].memberData[j].clientLevelTaskTrackingData;
                                var clientLevelCriteriaObj =  scope.centerDetails.subGroupMembers[i].memberData[j].clientLevelCriteriaResultData;
                                var clientCBReviewData = scope.centerDetails.subGroupMembers[i].memberData[j].cbCriteriaReviewData;
                                scope.centerDetails.subGroupMembers[i].memberData[j].allowLoanRejection = true;
                                scope.centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = false;
                                if(clientLevelTaskTrackObj == undefined){
                                    if (scope.eventType && scope.eventType == 'create') {
                                        scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
                                    } else {
                                        scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
                                    }
                                    scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-none";
                                }else if(clientLevelTaskTrackObj != undefined && clientLevelCriteriaObj != undefined){
                                    if(scope.taskData.id != clientLevelTaskTrackObj.currentTaskId){
                                        if(clientLevelCriteriaObj.score == 5 ||(!scope.isSendToCBReviewHidden && clientCBReviewData && clientCBReviewData.isApproved)){
                                            scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
                                            scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-grey";
                                        }else if(clientLevelCriteriaObj.score >= 0 && clientLevelCriteriaObj.score <= 4){
                                            scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
                                            scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-red";
                                        }
                                    }else if(scope.taskData.id == clientLevelTaskTrackObj.currentTaskId){
                                        if(clientLevelCriteriaObj.score == 5  ||(!scope.isSendToCBReviewHidden && clientCBReviewData && clientCBReviewData.isApproved)){
                                            scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = false;
                                            scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-grey";
                                            scope.isAllClientFinishedThisTask = false;
                                        }else if(clientLevelCriteriaObj.score >= 0 && clientLevelCriteriaObj.score <= 4){
                                            scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = false;
                                            scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-red";
                                            scope.isAllClientFinishedThisTask = false;
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
                                    }
                                }

                            }
                        }

                    }
                });

            };
            initTask();

            scope.initiateCreditBureauReport = function (client) {
                if(scope.errorDetails){
                    delete scope.errorDetails;
                }
                if(client.pendingCbEnquiryId){
                    scope.refreshData(client.loanAccountBasicData.id,client.pendingCbEnquiryId);
                }else{
                    scope.entityType = "loan";
                    scope.isForce = false;
                    scope.isClientCBCriteriaToRun = true;
                    var loanId = client.loanAccountBasicData.id;
                    resourceFactory.creditBureauReportResource.post({
                        entityType: scope.entityType,
                        entityId: loanId,
                        isForce: scope.isForce,
                        isClientCBCriteriaToRun : scope.isClientCBCriteriaToRun
                    }, {}, function (loansSummary) {
                        scope.checkCBData = loansSummary;
                        scope.getCbEnquiryData(scope.checkCBData.creditBureauEnquiryId);
                    });
                }
            };

            scope.getCbEnquiryData = function (enquiryId) {
                resourceFactory.creditBureauReportSummaryByEnquiryIdResource.get({ 'enquiryId': enquiryId }, function (summary) {
                    scope.checkCBData = summary;
                    if(scope.checkCBData != null && scope.checkCBData.cbStatus.code == 'SUCCESS'){
                        initTask();
                    }else{
                        if(scope.checkCBData != null && scope.checkCBData.errors != null){
                            scope.errorDetails=[];
                            var errorObj = new Object();
                            scope.errorDetails=[];
                            errorObj.args = {
                                params: []
                            };
                            var description = scope.checkCBData.errors[0].description;
                            errorObj.args.params.push({ value: description });
                            return scope.errorDetails.push(errorObj);
                        }
                    }

                })
            }


            scope.refreshData = function(loanId, enquiryId){
                resourceFactory.fetchCreditBureauReportByEnquiryIdResource.post({
                    enquiryId: enquiryId,
                    entityType: "loan",
                    entityId: loanId,
                    isClientCBCriteriaToRun : true
                },{}, function(data) {
                    scope.getCbEnquiryData(enquiryId);                    
                });

            };


            scope.initiateBulkCreditBureauReport = function () {
                scope.entityType = "center";
                scope.isForce = false;
                scope.isClientCBCriteriaToRun = true;
                if(scope.errorDetails){
                    delete scope.errorDetails;
                }
                resourceFactory.creditBureauBulkReportResource.post({
                    entityType: scope.entityType,
                    entityId:  scope.centerId ,
                    isForce: scope.isForce,
                    isClientCBCriteriaToRun : scope.isClientCBCriteriaToRun
                }, {},function (loansSummary) {
                    if((loansSummary != null && loansSummary[0] && loansSummary[0].errors == null)){
                        initTask();
                    }else{
                        if(loansSummary != null && loansSummary[0] && loansSummary[0].errors != null){
                            scope.errorDetails = [];
                            var errorObj = new Object();
                            var description = loansSummary[0].errors[0].description;
                            errorObj.args = {
                                params: []
                            };
                            errorObj.args.params.push({value: description});
                            return scope.errorDetails.push(errorObj);
                        }else{
                            //on refreshing 
                            initTask();
                        }
                    }
                });
            };

            scope.openViewDocument = function(enquiryId) {
                scope.reportEntityType = "CreditBureau";
                var url = $rootScope.hostUrl + '/fineract-provider/api/v1/enquiry/creditbureau/' + scope.reportEntityType + '/' +
                    enquiryId + '/attachment';
                url = $sce.trustAsResourceUrl(url);
                $http.get(url, { responseType: 'arraybuffer' }).
                success(function(data, status, headers, config) {
                    var supportedContentTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/html', 'application/xml'];
                    var contentType = headers('Content-Type');
                    var file = new Blob([data], { type: contentType });
                    var fileContent = URL.createObjectURL(file);
                    if (supportedContentTypes.indexOf(contentType) > -1) {
                        var docData = $sce.trustAsResourceUrl(fileContent);
                        window.open(docData);
                    }
                });
            };

            //Credit Bureau Review
            scope.captureReviewReason = function(clientId, loanId, reviewData){
                $modal.open({
                    templateUrl : 'views/task/popup/loanproposalreview.html',
                    controller : reviewReasonCtrl,
                    backdrop: 'static',
                    windowClass: 'app-modal-window-full-screen',
                    resolve: {
                        reviewParameterInfo: function () {
                            return { 'clientId': clientId, 'loanId': loanId, 'reviewData' : reviewData };
                        }
                    }
                })
            }

            var reviewReasonCtrl = function($scope, $modalInstance, reviewParameterInfo){
				$scope.df = scope.df;
                $scope.clientId = reviewParameterInfo.clientId;
                $scope.loanId = reviewParameterInfo.loanId;
                $scope.reviewData = reviewParameterInfo.reviewData;
                $scope.reviewFormData = {};
                $scope.isReasonNotesMandatory = false;
                $scope.isAttachmentMandatory = false;
                $scope.isPrepayAtBSSReason = false;
                $scope.isErrorneousReason = false;
                $scope.isPrepayAtBSSReason = false;
                $scope.isOutstandingReason = false;
                $scope.showReasonNotesOption = true;
                $scope.showAttachmentOption = false;
                $scope.clientLoanAccounts = [];
                $scope.preClosureTempFormData = [];
                $scope.preClosureFormData = [];
                $scope.isAccChecked = false;
                $scope.isEditpage = false;
                $scope.autoCheck = false;
                $scope.updateReview = false;
                if(!_.isUndefined($scope.reviewData) && $scope.reviewData.length > 0){
                    $scope.isEditpage = true;
                }


                resourceFactory.loanProposalReviewTemplateResource.get({loanId: $scope.loanId}, function (data) {
                   $scope.codeValues = data;
                });
                if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.loanProposalReview && scope.response.uiDisplayConfigurations.loanProposalReview.isHiddenField) {
                    $scope.ispreCloseDateHidden = scope.response.uiDisplayConfigurations.loanProposalReview.isHiddenField.preCloseDate;
                };
                $scope.reviewReasonChange = function(reviewReasonId,autoCheck){
                    for(var i = 0; i < $scope.codeValues.length; i++){
                        if($scope.codeValues[i].id == reviewReasonId){
                            if($scope.codeValues[i].systemIdentifier == "OSDPD"){
                                $scope.isReasonNotesMandatory = true;
                                $scope.isAttachmentMandatory = true;
                                $scope.isPrepayAtBSSReason = false;
                                $scope.isErrorneousReason = false;
                                $scope.showReasonNotesOption = true;
                                $scope.showAttachmentOption = true;
                                $scope.isOutstandingReason = true;
                                $scope.preClosureTempFormData = [];
                                 $scope.isAccChecked = false;
                            }
                            if($scope.codeValues[i].systemIdentifier == "PPBSS"){
                                $scope.isReasonNotesMandatory = false;
                                $scope.isAttachmentMandatory = false;
                                $scope.isPrepayAtBSSReason = true;
                                $scope.showReasonNotesOption = true;
                                $scope.showAttachmentOption = false;
                                $scope.isErrorneousReason = false;
                                $scope.isOutstandingReason = false;
                                 resourceFactory.clientAccountsOverviewsResource.get({clientId: $scope.clientId}, function (data) {
                                    $scope.clientLoanAccounts = data.loanAccounts;
                                    if(autoCheck){
                                        $scope.checkPreclosureLoan();
                                    }
                                });
                            }
                            if($scope.codeValues[i].systemIdentifier == "ERCB" || $scope.codeValues[i].systemIdentifier == "BLCNT"){
                                $scope.isReasonNotesMandatory = false;
                                $scope.isAttachmentMandatory = false;
                                $scope.isPrepayAtBSSReason = false;
                                $scope.showReasonNotesOption = true;
                                $scope.showAttachmentOption = false;
                                $scope.isOutstandingReason = false;
                                $scope.isErrorneousReason = true;
                                $scope.preClosureTempFormData = [];
                                $scope.isAccChecked = false;
                            }
                        }
                    }
                }

                $scope.close = function () {
                    $modalInstance.dismiss('close');
                };

                $scope.detectPreclosureAccount = function(loanAccount,isAccChecked){
                    if(isAccChecked){
                        $scope.preClosureTempFormData.push(
                            {'preclosureLoanId' : loanAccount.id, 
                             'preclosureAmount' : loanAccount.loanBalance,
                             'locale' : scope.optlang.code,
                             'dateFormat' : scope.df});
                    }else{
                        loanAccount.isAccChecked = false;
                        var idx = $scope.preClosureTempFormData.findIndex(x => x.preclosureLoanId == loanAccount.id);
                        if(idx >= 0){
                            $scope.preClosureTempFormData.splice(idx,1);
                        }
                    }

                }

                $scope.onFileSelect = function ($files) {
                  $scope.file = $files[0];
                };

                $scope.submitReview = function(){
                    $scope.errorDetails = [];
                    $scope.reviewFormData.locale = scope.optlang.code;
                    $scope.reviewFormData.clientId = $scope.clientId;
                    if($scope.isOutstandingReason){
                        if($scope.file == undefined){
                            return $scope.errorDetails.push([{code: 'error.msg.file.mandatory'}]);
                        }
                        if($scope.reviewFormData.reviewReasonNotes == undefined){
                            return $scope.errorDetails.push([{code: 'error.msg.reason.notes.mandatory'}]);
                        }
                        if($scope.updateReview){
                            $upload.upload({
                            url: $rootScope.hostUrl + API_VERSION + '/loans/' + $scope.loanId + '/proposalreview/withattachment/' + $scope.proposalreviewId ,
                            data: {'data' : $scope.reviewFormData} ,
                            file: $scope.file
                        }).then(function (data) {
                            $modalInstance.close();
                             initTask();
                        });                           
                        }else{
                        $upload.upload({
                            url: $rootScope.hostUrl + API_VERSION + '/loans/' + $scope.loanId + '/proposalreview/withattachment',
                            data: {'data' : $scope.reviewFormData} ,
                            file: $scope.file
                        }).then(function (data) {
                            $modalInstance.close();
                             initTask();
                        });
                        }
                    }

                    
                    if($scope.isPrepayAtBSSReason){
                        if($scope.preClosureTempFormData == undefined || $scope.preClosureTempFormData.length == 0){
                            return $scope.errorDetails.push([{code: 'error.msg.select.prepay.account'}]);
                        }
                        for (var i in $scope.preClosureTempFormData) {
                            if ($scope.preClosureTempFormData[i].preclosureDate) {
                                var reqDate = dateFilter($scope.preClosureTempFormData[i].preclosureDate, scope.df);
                                $scope.preClosureTempFormData[i].preclosureDate = reqDate;
                                $scope.errorDetails = [];
                            } else if (!$scope.ispreCloseDateHidden) {
                                return $scope.errorDetails.push([{
                                    code: 'error.msg.preclosure.date.required'
                                }]);
                            }
                        }
                      
                        $scope.reviewFormData.preclosures = [];
                        $scope.reviewFormData.preclosures = $scope.preClosureTempFormData.slice();
                    }
                    if($scope.errorDetails){
                        delete $scope.errorDetails;
                    }
                    
                    if($scope.isPrepayAtBSSReason || $scope.isErrorneousReason){
                        if($scope.updateReview){
                          resourceFactory.loanProposalReviewResource.update({loanId: $scope.loanId,proposalreviewId: $scope.proposalreviewId}, $scope.reviewFormData, function (data) {
                          $modalInstance.close();
                          initTask();
                          }); 
                        }else{
                           resourceFactory.loanProposalReviewResource.save({loanId: $scope.loanId}, $scope.reviewFormData, function (data) {
                           $modalInstance.close();
                           initTask();
                           }); 
                        }
                    }   
                }

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
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
                $scope.editLoanReviewProposal = function(loanReviewProposalId){
                    $scope.isEditpage = false;
                    $scope.preClosureTempFormData = {};
                    
                    resourceFactory.loanProposalReviewResource.get({loanId: $scope.loanId,proposalreviewId: loanReviewProposalId}, function (data) {
                        $scope.reviewData = data;
                        $scope.autoCheck = true;
                        $scope.updateReview = true;
                        $scope.proposalreviewId = $scope.reviewData.id;
                        $scope.preClosureTempFormData = [];
                        $scope.reviewFormData.reviewReasonId = $scope.reviewData.reviewReasonId;
                        $scope.reviewFormData.reviewReasonNotes = $scope.reviewData.reviewReasonNotes;
                        $scope.reviewReasonChange($scope.reviewFormData.reviewReasonId,$scope.autoCheck);
                   });
                }
                $scope.checkPreclosureLoan = function(){
                        for(var i in $scope.clientLoanAccounts){
                            for(var j in $scope.reviewData.precloseLoanList){
                                if($scope.clientLoanAccounts[i].id == $scope.reviewData.precloseLoanList[j]){
                                    var loanAccounts =  $scope.clientLoanAccounts[i];
                                    $scope.clientLoanAccounts[i].isAccChecked = true;
                                    $scope.detectPreclosureAccount(loanAccounts,$scope.clientLoanAccounts[i].isAccChecked);
                                }
                            }
                        $scope.clientLoanAccounts.isAccChecked = false;   
                    }
                }
                $scope.addNewReview = function(){
                  $scope.isEditpage = false;
                  $scope.autoCheck = false;
                  $scope.updateReview = false;
                }
            }//end of reviewReasonCtrl

            //lona account edit 

            scope.editLoan = function (loanAccountBasicData, groupId) {
                scope.groupId = groupId;
                scope.loanAccountBasicData = loanAccountBasicData;
                var templateUrl = 'views/task/popup/editLoan.html';
                var controller = 'EditLoanController';
                popUpUtilService.openFullScreenPopUp(templateUrl, controller, scope);
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
                if(!memberParams.allowLoanRejection){
                    var idx = $scope.rejectTypes.findIndex(x => x.code == 'rejectType.loanRejection');
                    if(idx >= 0){
                        $scope.rejectTypes.splice(idx,1);
                    }    
                }
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

            scope.groupRejection = function (member) {
                var templateUrl = 'views/task/popup/closegroup.html';
                $modal.open({
                    templateUrl: templateUrl,
                    controller: groupCloseCtrl,
                    windowClass: 'modalwidth700',
                    resolve: {
                        memberParams: function () {
                            return { 'memberId': member.id,
                                'memberName': member.name,
                                'fcsmNumber':member.fcsmNumber };
                        }
                    }
                });
            }
            var groupCloseCtrl = function ($scope, $modalInstance, memberParams) {

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
                    if($scope.rejectGroupData.closureReasonId==undefined || $scope.rejectGroupData.closureReasonId==null){
                        $scope.isReason = false;
                        $scope.isError = true;
                    }
                    if($scope.rejectGroupData.closureDate==undefined || $scope.rejectGroupData.closureDate==null || $scope.rejectGroupData.closureDate.length==0){
                        $scope.isClosureDate = false;
                        $scope.isError = true;
                    }
                    if($scope.isError){
                        return false;
                    }
                    if($scope.rejectGroupData.closureDate){
                        $scope.rejectGroupData.closureDate = dateFilter($scope.rejectGroupData.closureDate, scope.df);
                    }
                    resourceFactory.groupResource.save({groupId: memberParams.memberId, command: 'close'}, $scope.rejectGroupData, function (data) {
                        $modalInstance.dismiss('cancel');
                        initTask();
                    });
                };
            }
            //end rejection controller

            scope.captureMembersToNextStep = function(clientId, loanId, isChecked){
                if(isChecked){
                    scope.taskInfoTrackArray.push(
                        {'clientId' : clientId,
                            'currentTaskId' : scope.taskData.id,
                            'loanId' : loanId})
                }else{
                    var idx = scope.taskInfoTrackArray.findIndex(x => x.clientId == clientId);
                    if(idx >= 0){
                        scope.taskInfoTrackArray.splice(idx,1);
                        scope.centerDetails.isAllChecked = false;
                    }

                }
            }
            
            scope.moveMembersToNextStep = function(){
                if(scope.taskInfoTrackArray.length == 0){
                    scope.errorDetails = [];
                    return scope.errorDetails.push([{code: 'error.msg.select.atleast.one.member'}])
                }
                if(scope.errorDetails){
                    delete scope.errorDetails;
                }
                scope.taskTrackingFormData = {};
                scope.taskTrackingFormData.taskInfoTrackArray = [];

                scope.taskTrackingFormData.taskInfoTrackArray = scope.taskInfoTrackArray.slice();
                 
                resourceFactory.clientLevelTaskTrackingResource.save(scope.taskTrackingFormData, function(trackRespose) {
                    initTask();
                })

            }

            //CB critieria result view
            scope.openViewCBCriteriaResult = function(criteriaResult){
                    var templateUrl = 'views/task/popup/clientcbcriteriaresult.html';
                    $modal.open({
                        templateUrl: templateUrl,
                        controller: viewClientCBCriteriaResultCtrl,
                        windowClass: 'modalwidth700',
                        resolve: {
                            memberParams: function () {
                                return { 'criteriaResult': criteriaResult };
                            }
                        }
                    });
            }

            var viewClientCBCriteriaResultCtrl = function ($scope, $modalInstance, memberParams) {
				$scope.df = scope.df;
                $scope.cbCriteriaResult = JSON.parse(memberParams.criteriaResult);

                $scope.close = function () {
                    $modalInstance.dismiss('close');
                };
            }
            scope.isActiveMember = function(activeClientMember){
                if(activeClientMember.status.code == 'clientStatusType.onHold' || activeClientMember.status.code == 'clientStatusType.active'){
                    return true;
                }
                return false;
            }
            scope.isActiveSubGroup = function(groupMember){
                if(groupMember.status.value == 'Active'){
                    return true;
                }
                return false;
            }
            scope.showCBInitiate = function(member){
                if(member.cbExistingLoansSummaryData && member.loanAccountBasicData){
                    if(member.cbExistingLoansSummaryData.isCBReportExpired){
                        return true;
                    }else{
                        return false;
                    }
                }
                return true;
            }
            scope.hideClient = function(activeClientMember){
                if(activeClientMember.status.code == 'clientStatusType.onHold' || scope.eventType == 'loancycle'){
                    return true;
                }
                return false;
            }
            scope.disableCBCheck = function (activeClientMember) {         
                if (activeClientMember.isClientFinishedThisTask || (activeClientMember.cbExistingLoansSummaryData == undefined && !scope.isCBCheckEnable)
                    || (!scope.isSendToCBReviewHidden && activeClientMember.cbCriteriaReviewData && !activeClientMember.cbCriteriaReviewData.isApproved)) {
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
                            if (activeClientMember.status.code != 'clientStatusType.onHold' && !activeClientMember.isClientFinishedThisTask && (activeClientMember.cbExistingLoansSummaryData != undefined || scope.isCBCheckEnable)) {
                                if (!scope.isSendToCBReviewHidden) {
                                    if (activeClientMember.cbCriteriaReviewData && activeClientMember.cbCriteriaReviewData.isApproved) {
                                        centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = true;
                                        scope.captureMembersToNextStep(activeClientMember.id, activeClientMember.loanAccountBasicData.id, activeClientMember.isMemberChecked);
                                    } else {
                                        centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = false;
                                    }
                                } else {
                                    centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = true;
                                    scope.captureMembersToNextStep(activeClientMember.id, activeClientMember.loanAccountBasicData.id, activeClientMember.isMemberChecked);
                                }
                            }
                        } else {
                            centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = false;
                        }

                    }
                }
            }

            scope.viewMemberDetails = function (groupId, activeClientMember) {
                $modal.open({
                    templateUrl: 'views/task/popup/viewmember.html',
                    controller: ViewMemberCtrl,
                    backdrop: 'static',
                    windowClass: 'app-modal-window-full-screen',
                    size: 'lg',
                    resolve: {
                        memberParams: function () {
                            return { 'groupId': groupId, 'activeClientMember' : activeClientMember };
                        }
                    }
                });
            }

            var ViewMemberCtrl = function ($scope, $modalInstance, memberParams) {
                $scope.regexFormats = scope.regexFormats;                
                $scope.df = scope.df;
                $scope.canAddCharges=scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.canAddCharge;
                $scope.response = scope.response;
                $scope.clientId = memberParams.activeClientMember.id;
                $scope.groupId = memberParams.groupId;
                $scope.showaddressform = false;
                $scope.shownidentityform = false;
                $scope.shownFamilyMembersForm = false;
                $scope.showLoanAccountForm = false;
                $scope.isLoanAccountExist = false;
                $scope.showLoanProductList = false;
                $scope.showOnlyLoanTab = true;
                var UPFRONT_FEE = 'upfrontFee';
                $scope.displayCashFlow = false;
                $scope.displaySurveyInfo = false;
                $scope.isStreetNameMandatory=false;
                $scope.firstNamePattern = scope.firstNamePattern;
                $scope.familyMemberMinAge = scope.familyMemberMinAge;
                $scope.familyMemberMaxAge = scope.familyMemberMaxAge;
                $scope.isValidAge = true;

                if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.workflow) {
                    $scope.showDeleteClientIdentifierAction = scope.response.uiDisplayConfigurations.workflow.showDeleteClientIdentifierAction;
                }

                if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.workflow &&
                    scope.response.uiDisplayConfigurations.workflow.disableVillageDropDown) {
                    $scope.disableVillageDropDown = scope.response.uiDisplayConfigurations.workflow.disableVillageDropDown;
                }

                if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.viewClient && scope.response.uiDisplayConfigurations.viewClient.familyDeatils && scope.response.uiDisplayConfigurations.viewClient.familyDeatils.isMandatoryField) {
                    $scope.isAgeMandatory = scope.response.uiDisplayConfigurations.viewClient.familyDeatils.isMandatoryField.age;
                    $scope.isfamilyMemeberIDTypeMandatory = scope.response.uiDisplayConfigurations.viewClient.familyDeatils.isMandatoryField.familyMemeberIDType;
                    $scope.isAgeRequired = scope.response.uiDisplayConfigurations.viewClient.familyDeatils.isMandatoryField.age;
                    $scope.isfamilyMemeberIDTypeRequired = scope.response.uiDisplayConfigurations.viewClient.familyDeatils.isMandatoryField.familyMemeberIDType;
                    $scope.isDateOfBirthMandatory = scope.response.uiDisplayConfigurations.viewClient.familyDeatils.isMandatoryField.dateOfBirth;
                }

                $scope.setDefaultGISConfig = function () {
                    if (scope.responseDefaultGisData && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address) {
                        if (scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.countryName) {

                            var countryName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.countryName;
                            $scope.defaultCountry = _.filter($scope.countries, function (country) {
                                return country.countryName === countryName;

                            });
                            $scope.formData.countryId = $scope.defaultCountry[0].countryId;
                            $scope.states = $scope.defaultCountry[0].statesDatas;
                        }

                        if ($scope.states && $scope.states.length > 0 && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.stateName) {
                            var stateName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.stateName;
                            $scope.defaultState = _.filter(scope.states, function (state) {
                                return state.stateName === stateName;

                            });
                            $scope.formData.stateId = scope.defaultState[0].stateId;
                            $scope.districts = scope.defaultState[0].districtDatas;
                        }

                    }

                };
                if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient.isMandatoryField) {
                    $scope.isStreetNameMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.streetName;
                    $scope.isHouseNoMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.houseNo;
                }
                $scope.isHideDocumentExpiryDate = scope.response.uiDisplayConfigurations.clientIdentifier.hiddenFields.documentExpiryDate;
                $scope.isHideDocumentIssueDate = scope.response.uiDisplayConfigurations.clientIdentifier.hiddenFields.documentIssueDate;
                $scope.isHideSalutation = scope.response.uiDisplayConfigurations.viewClient.familyDeatils.isHiddenField.salutation;
                $scope.changeCountry = function (countryId) {
                    if (countryId != null) {
                        $scope.selectCountry = _.filter($scope.countries, function (country) {
                            return country.countryId == countryId;
                        })
                        if ($scope.formData.stateId) {
                            delete $scope.formData.stateId;
                        }
                        if ($scope.formData.districtId) {
                            delete $scope.formData.districtId;
                        }
                        if ($scope.formData.talukaId) {
                            delete $scope.formData.talukaId;
                        }

                        $scope.states = $scope.selectCountry[0].statesDatas;
                    }
                }

                $scope.changeState = function (stateId) {
                    if (stateId != null) {
                        $scope.selectState = _.filter($scope.states, function (state) {
                            return state.stateId == stateId;
                        })
                        if ($scope.formData.districtId) {
                            delete $scope.formData.districtId;
                        }
                        if ($scope.formData.talukaId) {
                            delete $scope.formData.talukaId;
                        }
                        $scope.districts = $scope.selectState[0].districtDatas;
                        $scope.getActiveDistricts();
                    }
                }
                $scope.activeStatus = 300;
                $scope.getActiveDistricts = function(){
                    var tempDist = [];
                    for(var i in $scope.districts){
                        if($scope.districts[i].status.id==$scope.activeStatus){
                            tempDist.push($scope.districts[i]);
                        }
                    }
                    $scope.districts = tempDist;
                }

                $scope.changeDistrict = function (districtId) {
                    if (districtId != null) {
                        $scope.selectDistrict = _.filter($scope.districts, function (districts) {
                            return districts.districtId == districtId;
                        })

                        if ($scope.formData.talukaId) {
                            delete $scope.formData.talukaId;
                        }
                        $scope.talukas = $scope.selectDistrict[0].talukaDatas;
                    }
                    
                }

                $scope.changeVillage = function () {
                    if ($scope.formData.villageId != null && $scope.formData.villageId != undefined) {
                        if($scope.formData.stateId){
                            delete $scope.formData.stateId;
                        }
                        if ($scope.formData.districtId) {
                            delete $scope.formData.districtId;
                        }
                        if ($scope.formData.talukaId) {
                            delete $scope.formData.talukaId;
                        }
                        $scope.formData.villageTown = null;
                        $scope.talukas = null;
                        $scope.formData.postalCode = null;
                        $scope.districts = null;
                        $scope.states = null;
                        resourceFactory.villageResource.get({ villageId: $scope.formData.villageId }, function (response) {
                            if (response.addressData.length > 0) {
                                if (response.villageName) {
                                    $scope.formData.villageTown = response.villageName;
                                }
                                if (response.addressData[0].countryData) {
                                    $scope.formData.countryId = response.addressData[0].countryData.countryId;
                                    $scope.changeCountry($scope.formData.countryId)
                                }
                                if (response.addressData[0].stateData) {
                                    $scope.formData.stateId = response.addressData[0].stateData.stateId;
                                    $scope.changeState($scope.formData.stateId);
                                }
                                if (response.addressData[0].districtData) {
                                    $scope.formData.districtId = response.addressData[0].districtData.districtId;
                                    $scope.changeDistrict($scope.formData.districtId);
                                }

                                if (response.addressData[0].talukaData) {
                                    $scope.formData.talukaId = response.addressData[0].talukaData.talukaId;
                                }
                                if (response.addressData[0].postalCode) {
                                    $scope.formData.postalCode = response.addressData[0].postalCode;
                                }
                            }

                        });
                    }
                }
                $scope.changeAddressTypeChange = function(addressTypeId){
                    $scope.address.isPopulateClientAddressFromVillages = scope.isSystemGlobalConfigurationEnabled($scope.villageConfig);
                    var idx = $scope.addressType.findIndex(x => x.id == addressTypeId);
                    if($scope.addressType[idx] && ($scope.addressType[idx].systemIdentifier === "AeKyc" || $scope.addressType[idx].systemIdentifier === "VeKyc")){
                        $scope.address.isPopulateClientAddressFromVillages = false;
                        if ($scope.formData.villageId) {
                            delete $scope.formData.villageId;
                        }
                        $scope.formData.villageTown = null;
                        $scope.formData.postalCode = null;                    
                    }else{
                        $scope.formData.villageId =  memberParams.activeClientMember.villageId;
                        $scope.changeVillage();
                    }
                }

                $scope.close = function () {
                    $modalInstance.dismiss('close');
                    initTask();
                };
                $scope.validateAge = function(){
                    $scope.isValidAge = false;
                    if($scope.familyMembersFormData.age){
                        if($scope.familyMemberMinAge <= $scope.familyMembersFormData.age && $scope.familyMembersFormData.age <= $scope.familyMemberMaxAge){
                            $scope.isValidAge = true;
                        }
                    }
                };

                function getClientData() {
                    resourceFactory.clientResource.get({ clientId: $scope.clientId, associations: 'hierarchyLookup' }, function (data) {
                        $scope.clientDetails = data;
                        if ($scope.clientDetails.lastname != undefined) {
                            $scope.clientDetails.displayNameInReverseOrder = $scope.clientDetails.lastname.concat(" ");
                        }
                        if ($scope.clientDetails.middlename != undefined) {
                            $scope.clientDetails.displayNameInReverseOrder = $scope.clientDetails.displayNameInReverseOrder.concat($scope.clientDetails.middlename).concat(" ");
                        }
                        if ($scope.clientDetails.firstname != undefined) {
                            $scope.clientDetails.displayNameInReverseOrder = $scope.clientDetails.displayNameInReverseOrder.concat($scope.clientDetails.firstname);
                        }
                    });
                }
                getClientData();

                $scope.entityAddressLoaded = false;
                $scope.fetchEntityAddress = function () {
                    if (!$scope.entityAddressLoaded) {
                        resourceFactory.addressDataResource.getAll({
                            entityType: "clients",
                            entityId: $scope.clientId
                        }, function (response) {
                            if (response != null) {
                                $scope.addressData = response;
                            }
                        });
                        $scope.entityAddressLoaded = true;
                    }
                }

                $scope.loadNewAdressForm = function () {
                    $scope.showaddressform = !$scope.showaddressform;
                    $scope.addressType = [];
                    $scope.countrys = [];
                    $scope.states = [];
                    $scope.address = {};
                    $scope.districts = [];
                    $scope.talukas = [];
                    $scope.formData = {};
                    $scope.formDataList = [$scope.formData];
                    $scope.addressTypes = [];
                    $scope.villageConfig = 'populate_client_address_from_villages';
                    $scope.address.isPopulateClientAddressFromVillages = scope.isSystemGlobalConfigurationEnabled($scope.villageConfig);
                    $scope.isCountryReadOnly = false;
                    $scope.pincode = false;
                    $scope.isVillageTownMandatory = false;
                    $scope.isCountryReadOnly = false;
                    $scope.isAddressTypeMandatory = false;
                    $scope.formData.villageId =  memberParams.activeClientMember.villageId;
                    if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient.isMandatoryField.addressType) {
                        $scope.isAddressTypeMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.addressType;
                    }
                    if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.defaultGISConfig.isReadOnlyField.countryName) {
                        $scope.isCountryReadOnly = scope.response.uiDisplayConfigurations.defaultGISConfig.isReadOnlyField.countryName;
                    }
                    if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient.isHiddenField.pincode) {
                        $scope.pincode = scope.response.uiDisplayConfigurations.createClient.isHiddenField.pincode;
                    }
                    if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient.isMandatoryField.villageTown) {
                        $scope.isVillageTownMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.villageTown;
                    }
                    if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.defaultGISConfig.isReadOnlyField.countryName) {
                        $scope.isCountryReadOnly = scope.response.uiDisplayConfigurations.defaultGISConfig.isReadOnlyField.countryName;
                    }
                    if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient.isMandatoryField.addressType) {
                        $scope.isAddressTypeMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.addressType;
                    }
                    resourceFactory.addressTemplateResource.get({}, function (data) {
                        $scope.addressType = data.addressTypeOptions;
                        $scope.countries = data.countryDatas;
                        $scope.setDefaultGISConfig();
                        $scope.changeVillage();
                    });

                    resourceFactory.villageResource.getAllVillages({ officeId: routeParams.officeId, limit: 1000 }, function (data) {
                        $scope.villages = data;
                    });
                }

                $scope.submit = function () {

                    $scope.entityType = "clients";
                    $scope.formData.locale = scope.optlang.code;
                    $scope.formData.dateFormat = scope.df;
                    

                    if ($scope.formData.countryId == null || $scope.formData.countryId == "") {
                        delete $scope.formData.countryId;
                    }
                    if ($scope.formData.stateId == null || $scope.formData.stateId == "") {
                        delete $scope.formData.stateId;
                    }
                    if ($scope.formData.districtId == null || $scope.formData.districtId == "") {
                        delete $scope.formData.districtId;
                    }
                    if ($scope.formData.talukaId == null || $scope.formData.talukaId == "") {
                        delete $scope.formData.talukaId;
                    }
                    if ($scope.addressTypes.length>0 &&  $scope.addressTypes[0] != null) {
                        $scope.formData.addressTypes = $scope.addressTypes;
                    } else {
                        delete $scope.formData.addressTypes;
                    }
                    if ($scope.formData.houseNo == null || $scope.formData.houseNo == "") {
                        delete $scope.formData.houseNo;
                    }
                    if ($scope.formData.addressLineOne == null || $scope.formData.addressLineOne == "") {
                        delete $scope.formData.addressLineOne;
                    }
                    resourceFactory.addressResource.create({ entityType: $scope.entityType, entityId: $scope.clientId }, { addresses: $scope.formDataList }, function (data) {
                        $scope.showaddressform = false;
                        resourceFactory.addressDataResource.getAll({ entityType: "clients", entityId: $scope.clientId }, function (response) {
                            if (response != null) {
                                $scope.addressData = response;
                            }
                        scope.reComputeProfileRating($scope.clientId);
                        });
                    });
                };

                $scope.closeAddressForm = function () {
                    $scope.showaddressform = false;
                }

                //client identities related

                $scope.clientIdentityDocumentsLoaded = false;
                $scope.getClientIdentityDocuments = function () {
                    if (!$scope.clientIdentityDocumentsLoaded) {
                        resourceFactory.clientResource.getAllClientDocuments({
                            clientId: $scope.clientId,
                            anotherresource: 'identifiers'
                        }, function (data) {
                            $scope.identitydocuments = data;
                            for (var i = 0; i < $scope.identitydocuments.length; i++) {
                                resourceFactory.clientIdentifierResource.get({ clientIdentityId: $scope.identitydocuments[i].id }, function (data) {
                                    for (var j = 0; j < $scope.identitydocuments.length; j++) {
                                        if (data.length > 0 && $scope.identitydocuments[j].id == data[0].parentEntityId) {
                                            for (var l in data) {

                                                var loandocs = {};
                                                loandocs = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment';
                                                data[l].docUrl = loandocs;
                                            }
                                            $scope.identitydocuments[j].documents = data;
                                        }
                                    }
                                });
                            }
                        });
                        $scope.clientIdentityDocumentsLoaded = true;
                    }
                };

                $scope.deleteClientIdentifierDocument = function (clientId, entityId, index) {
                    resourceFactory.clientIdenfierResource.delete({clientId: $scope.clientId, id: entityId}, '', function (data) {
                        $scope.identitydocuments.splice(index, 1);
                    });
                };
                $scope.loadIdentitiesForm = function () {
                    $scope.shownidentityform = true;

                    $scope.identityFormData = {};
                    $scope.first = {};
                    $scope.documenttypes = [];
                    $scope.statusTypes = [];
                    resourceFactory.clientIdenfierTemplateResource.get({ clientId: $scope.clientId }, function (data) {
                        $scope.documenttypes = data.allowedDocumentTypes;
                        $scope.identityFormData.documentTypeId = data.allowedDocumentTypes[0].id;
                        $scope.statusTypes = data.clientIdentifierStatusOptions;
                        
                        if (data.clientIdentifierStatusOptions && scope.response &&
                            scope.response.uiDisplayConfigurations.clientIdentifier.hiddenFields.status) {
                            $scope.identityFormData.status = data.clientIdentifierStatusOptions[1].id;
                        }
                    });

                }

                $scope.submitIdentitfyForm = function () {
                    $scope.identityFormData.locale = scope.optlang.code;
                    $scope.identityFormData.dateFormat = scope.df;
                    if ($scope.first.documentIssueDate) {
                        $scope.identityFormData.documentIssueDate = dateFilter($scope.first.documentIssueDate, scope.df);
                    }
                    if ($scope.first.documentExpiryDate) {
                        $scope.identityFormData.documentExpiryDate = dateFilter($scope.first.documentExpiryDate, scope.df);
                    }
                    resourceFactory.clientIdenfierResource.save({ clientId: $scope.clientId }, $scope.identityFormData, function (data) {
                        $scope.shownidentityform = false;
                        $scope.clientIdentityDocumentsLoaded = false;
                        $scope.getClientIdentityDocuments();
                        scope.reComputeProfileRating($scope.clientId);
                    });
                };

                $scope.closeIdentityForm = function () {
                    $scope.shownidentityform = false;
                }

                $scope.uploadClientDocumentIdentifier = function (clientIdentifierId) {
                    $scope.shownUploadIdentifierDocumentForm = true;
                    $scope.shownidentityform = false;
                    $scope.clientIdentifierId = clientIdentifierId;
                    $scope.documentFormData = {};

                }

                $scope.onFileSelect = function ($files) {
                    $scope.file = $files[0];
                };

                $scope.uploadDocument = function () {
                    $upload.upload({
                        url: $rootScope.hostUrl + API_VERSION + '/client_identifiers/' + $scope.clientIdentifierId + '/documents',
                        data: $scope.documentFormData,
                        file: $scope.file
                    }).then(function (data) {
                        $scope.shownUploadIdentifierDocumentForm = false;
                        $scope.clientIdentityDocumentsLoaded = false;
                        $scope.getClientIdentityDocuments();
                    });
                };

                $scope.closeDocumentUploadForm = function () {
                    $scope.shownUploadIdentifierDocumentForm = false;
                }

                var viewDocumentCtrl = function ($scope, $modalInstance, documentDetail) {
                    $scope.df = scope.df;
                    $scope.data = documentDetail;
                    $scope.close = function () {
                        $modalInstance.close('close');
                    };
                };

                $scope.openViewDocument = function (documentDetail) {
                    $modal.open({
                        templateUrl: 'viewDocument.html',
                        controller: viewDocumentCtrl,
                        resolve: {
                            documentDetail: function () {
                                return documentDetail;
                            }
                        }
                    });
                };

                $scope.download = function (file) {
                    var url =$rootScope.hostUrl + file.docUrl;
                    var fileType = file.fileName.substr(file.fileName.lastIndexOf('.') + 1);
                    CommonUtilService.downloadFile(url,fileType);
                }
                $scope.familyConditionTypeOptions = [{id:1,name:'label.input.dependent'},{id:2,name:'label.input.isSeriousIllness'},{id:3,name:'label.input.isDeceased'}];
                $scope.familyConditionType = {};
                $scope.familyDetailsLoaded = false;
                $scope.showRadioType =scope.showRadioType;
                $scope.getFamilyDetails = function () {
                    if (!$scope.familyDetailsLoaded) {
                        resourceFactory.familyDetails.getAll({ clientId: $scope.clientId }, function (data) {
                            $scope.familyMembers = data;
                        });
                        $scope.familyDetailsLoaded = true;
                    }
                };

                $scope.familyMembersForm = function () {
                    $scope.shownFamilyMembersForm = true;
                    $scope.salutationOptions = [];
                    $scope.relationshipOptions = [];
                    $scope.genderOptions = [];
                    $scope.educationOptions = [];
                    $scope.occupationOptions = [];
                    $scope.subOccupations = [];
                    $scope.isExisitingClient = false;
                    $scope.familyMembersFormData = {};
                    $scope.familyConditionType = {};



                    resourceFactory.familyDetailsTemplate.get({ clientId: $scope.clientId }, function (data) {
                        $scope.salutationOptions = data.salutationOptions;
                        $scope.relationshipOptions = data.relationshipOptions;
                        $scope.genderOptions = data.genderOptions;
                        $scope.educationOptions = data.educationOptions;
                        $scope.occupationOptions = data.occupationOptions;
                        $scope.relationshipGenderData = data.relationshipGenderData;
                    });

                    resourceFactory.clientIdenfierTemplateResource.get({ clientId: $scope.clientId }, function (data) {
                        $scope.documenttypes = data.allowedDocumentTypes;
                    });
                    
                }

                $scope.$watch('familyMembersFormData.dateOfBirth', function (newValue, oldValue) {
                if ($scope.familyMembersFormData != undefined && $scope.familyMembersFormData.dateOfBirth != undefined) {
                    var ageDifMs = Date.now() - $scope.familyMembersFormData.dateOfBirth.getTime();
                    var ageDifMs = Date.now() - $scope.familyMembersFormData.dateOfBirth.getTime();
                    var ageDate = new Date(ageDifMs); // miliseconds from epoch
                    $scope.familyMembersFormData.age=Math.abs(ageDate.getUTCFullYear() - 1970);
                } 
            });

                $scope.submitFamilyMembers = function () {
                    $scope.familyMembersFormData.dateFormat = scope.df;
                    $scope.familyMembersFormData.locale = scope.optlang.code;
                    if (!$scope.familyMembersFormData.documentTypeId) {
                        if ($scope.familyMembersFormData.documentKey != undefined) {
                            delete $scope.familyMembersFormData.documentKey;
                            delete $scope.familyMembersFormData.documentTypeId;
                        }
                    }
                    if($scope.showRadioType && $scope.familyConditionType.type>0){
                        if($scope.familyConditionType.type==1){
                            $scope.familyMembersFormData.isDependent = true;
                        }else if($scope.familyConditionType.type==2){
                            $scope.familyMembersFormData.isSeriousIllness = true;
                        }else{
                            $scope.familyMembersFormData.isDeceased = true;
                        }
                    }
                    if ($scope.familyMembersFormData.dateOfBirth) {
                        this.familyMembersFormData.dateOfBirth = dateFilter($scope.familyMembersFormData.dateOfBirth, scope.df);
                    }
                    resourceFactory.familyDetails.save({ clientId: $scope.clientId }, $scope.familyMembersFormData, function (data) {
                        $scope.shownFamilyMembersForm = false;
                        $scope.familyDetailsLoaded = false;
                        $scope.getFamilyDetails();
                        scope.reComputeProfileRating($scope.clientId);
                    });
                };
                $scope.findRelationCodeValue = function(value){
                    $scope.familyMembersFormData.genderId = null;
                    if($scope.relationshipGenderData && $scope.relationshipGenderData.codeValueRelations){
                        for(var i in $scope.relationshipGenderData.codeValueRelations){
                            if($scope.relationshipGenderData.codeValueRelations[i].codeValueFrom === value){
                                    $scope.familyMembersFormData.genderId = $scope.relationshipGenderData.codeValueRelations[i].codeValueTo;
                            }
                        }
                    }
                    $scope.changeMandatoryFields(value);
                };
                $scope.changeMandatoryFields = function (value) {
                    $scope.isAgeMandatory = $scope.isAgeRequired;
                    $scope.isfamilyMemeberIDTypeMandatory = $scope.isfamilyMemeberIDTypeRequired;
                    if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.relationshipOptions && scope.response.uiDisplayConfigurations.relationshipOptions.AgeMandatoryFor && scope.response.uiDisplayConfigurations.relationshipOptions.AgeMandatoryFor.length > 0) {
                        $scope.AgeMandatoryRelationshipOptions = scope.response.uiDisplayConfigurations.relationshipOptions.AgeMandatoryFor && scope.response.uiDisplayConfigurations.relationshipOptions.AgeMandatoryFor;
                    }
                    if ($scope.relationshipOptions && $scope.relationshipOptions.length > 0) {
                        for (var i in $scope.relationshipOptions) {
                            if ($scope.relationshipOptions[i].id == value) {
                                if ($scope.AgeMandatoryRelationshipOptions) {
                                    for (var j in $scope.AgeMandatoryRelationshipOptions) {
                                        if ($scope.relationshipOptions[i].name.toLowerCase() == $scope.AgeMandatoryRelationshipOptions[j].toLowerCase()) {
                                            $scope.isAgeMandatory = true;
                                            $scope.isfamilyMemeberIDTypeMandatory = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                };


                $scope.closeFamilyMembersForm = function () {
                    $scope.shownFamilyMembersForm = false;
                }
            }

            scope.reComputeProfileRating = function (clientId) {
                scope.profileRatingData = {};
                resourceFactory.computeProfileRatingTemplate.get(function (response) {
                    for(var i in response.scopeEntityTypeOptions){
                        if(response.scopeEntityTypeOptions[i].value === 'OFFICE'){
                            scope.profileRatingData.scopeEntityType = response.scopeEntityTypeOptions[i].id;
                            scope.profileRatingData.scopeEntityId =  scope.officeId;
                            break;
                        }
                    }
                    for(var i in response.entityTypeOptions){
                        if(response.entityTypeOptions[i].value === 'CLIENT'){
                            scope.profileRatingData.entityType = response.entityTypeOptions[i].id;
                            scope.profileRatingData.entityId =  clientId;
                            break;
                        }
                    }
                    scope.profileRatingData.locale = scope.optlang.code;
                    resourceFactory.computeProfileRating.save(scope.profileRatingData, function (response) {
                        getprofileRating(clientId);
                    });
                });
            }

            scope.refreshTask = function () {
                initTask();
            }
        }
    });
    mifosX.ng.application.controller('CreditBureauCheckActivityController', ['$controller', '$scope', '$modal', 'ResourceFactory', 'dateFilter', '$http', '$rootScope', '$sce', 'CommonUtilService', '$upload', 'API_VERSION', '$routeParams', 'PopUpUtilService',mifosX.controllers.CreditBureauCheckActivityController]).run(function ($log) {
        $log.info("CreditBureauCheckActivityController initialized");
    });
}(mifosX.controllers || {}));