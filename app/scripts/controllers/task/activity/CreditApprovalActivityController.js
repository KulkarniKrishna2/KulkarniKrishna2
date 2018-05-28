(function (module) {
    mifosX.controllers = _.extend(module, {
        CreditApprovalActivityController: function ($controller, scope, routeParams, $modal, resourceFactory, location, dateFilter, ngXml2json, route, $http, $rootScope, $sce, CommonUtilService, $route, $upload, API_VERSION) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));

            function initTask() {
                scope.centerId = scope.taskconfig.centerId;
                resourceFactory.centerWorkflowResource.get({ centerId: scope.centerId, associations: 'groupMembers,loanaccounts,cbexistingloanssummary,clientcbcriteria,loanproposalreview' }, function (data) {
                    scope.centerDetails = data;
                });

            };
            initTask();

            scope.openViewDocument = function(enquiryId) {
                scope.reportEntityType = "CreditBureau";
                var url = $rootScope.hostUrl + '/fineract-provider/api/v1/enquiry/creditbureau/' + scope.reportEntityType + '/' +
                    enquiryId + '/attachment?' + CommonUtilService.commonParamsForNewWindow();
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

            //Review History
            scope.showReviewHistory = function(loanId){
                  $modal.open({
                    templateUrl : 'views/task/popup/loanproposalhistoryreview.html',
                    controller : reviewHistoryCtrl,
                    windowClass: 'app-modal-window',
                    size: 'lg',
                    resolve: {
                        historyParameterInfo: function () {
                            return {'loanId': loanId };
                        }
                    }
                })
            }

             var reviewHistoryCtrl = function($scope, $modalInstance, historyParameterInfo){


                $scope.loanId = historyParameterInfo.loanId;
                $scope.reviewHistory = []

                resourceFactory.loanProposalReviewHistoryResource.getAll({loanId: $scope.loanId}, function (data) {
                   $scope.reviewHistory = data.slice();
                });

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }

            //Credit Bureau Review
            scope.captureReviewReason = function(clientId, loanId, reviewId){
                $modal.open({
                    templateUrl : 'views/task/popup/loanproposalreview.html',
                    controller : reviewReasonCtrl,
                    windowClass: 'app-modal-window',
                    size: 'lg',
                    resolve: {
                        reviewParameterInfo: function () {
                            return { 'clientId': clientId, 'loanId': loanId, 'reviewId' : reviewId };
                        }
                    }
                })
            }

            var reviewReasonCtrl = function($scope, $modalInstance, reviewParameterInfo){

                $scope.clientId = reviewParameterInfo.clientId;
                $scope.loanId = reviewParameterInfo.loanId;
                $scope.reviewId = reviewParameterInfo.reviewId;
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
                $scope.isAccChecked = false;

                resourceFactory.loanProposalReviewTemplateResource.get({loanId: $scope.loanId}, function (data) {
                   $scope.codeValues = data;
                });

                $scope.reviewReasonChange = function(reviewReasonId){
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
                                });
                            }
                            if($scope.codeValues[i].systemIdentifier == "ERCB"){
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

                $scope.detectPreclosureAccount = function(loanAccount,isAccChecked,idx){
                    if(isAccChecked){
                        $scope.preClosureTempFormData.push(
                            {'preclosureLoanId' : loanAccount.id, 
                             'preclosureAmount' : loanAccount.loanBalance,
                             'locale' : scope.optlang.code,
                             'dateFormat' : scope.df});
                    }else{
                        $scope.preClosureTempFormData.splice(idx,1);
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
                         $upload.upload({
                            url: $rootScope.hostUrl + API_VERSION + '/loans/' + $scope.loanId + '/proposalreview/withattachment',
                            data: {'data' : $scope.reviewFormData} ,
                            file: $scope.file
                        }).then(function (data) {
                            $modalInstance.close();
                             initTask();
                        });
                    }

                    
                    if($scope.isPrepayAtBSSReason){
                        if($scope.preClosureTempFormData == undefined || $scope.preClosureTempFormData.length == 0){
                            return $scope.errorDetails.push([{code: 'error.msg.select.prepay.account'}]);
                        }else{
                            delete $scope.errorDetails;
                        }

                        $scope.reviewFormData.preclosures = [];
                        $scope.reviewFormData.preclosures = $scope.preClosureTempFormData.slice();
                    }
                    
                    if($scope.isPrepayAtBSSReason || $scope.isErrorneousReason){
                        resourceFactory.loanProposalReviewResource.save({loanId: $scope.loanId}, $scope.reviewFormData, function (data) {
                          $modalInstance.close();
                          initTask();
                        });
                    }   
                }

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }//end of reviewReasonCtrl
            
        }
    });
    mifosX.ng.application.controller('CreditApprovalActivityController', ['$controller', '$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter', 'ngXml2json', '$route', '$http', '$rootScope', '$sce', 'CommonUtilService', '$route', '$upload', 'API_VERSION', mifosX.controllers.CreditApprovalActivityController]).run(function ($log) {
        $log.info("CreditApprovalActivityController initialized");
    });
}(mifosX.controllers || {}));