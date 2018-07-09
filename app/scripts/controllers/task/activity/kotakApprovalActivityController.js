(function (module) {
    mifosX.controllers = _.extend(module, {
        kotakApprovalActivityController: function ($controller, scope, routeParams, $modal, resourceFactory, location, dateFilter, ngXml2json, route, $http, $rootScope, $sce, CommonUtilService, $route, $upload, API_VERSION) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));

            function initTask() {
                scope.centerId = scope.taskconfig.centerId;
                scope.taskInfoTrackArray = [];
                resourceFactory.centerWorkflowResource.get({ centerId: scope.centerId, associations: 'groupMembers,loanaccounts,cbexistingloanssummary,clientcbcriteria,loanproposalreview,workflowloanstatus' }, function (data) {
                    scope.centerDetails = data;
                    scope.rejectTypes = data.rejectTypes;
                    scope.clientClosureReasons = data.clientClosureReasons;
                    scope.groupClosureReasons = data.groupClosureReasons;
                    scope.officeId = scope.centerDetails.officeId;
                    //logic to disable and highlight member
                    for(var i = 0; i < scope.centerDetails.subGroupMembers.length; i++){

                        for(var j = 0; j < scope.centerDetails.subGroupMembers[i].memberData.length; j++){

                              var clientLevelTaskTrackObj =  scope.centerDetails.subGroupMembers[i].memberData[j].clientLevelTaskTrackingData;
                              var clientLevelCriteriaObj =  scope.centerDetails.subGroupMembers[i].memberData[j].clientLevelCriteriaResultData;
                              if(clientLevelTaskTrackObj == undefined){
                                  scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
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
                                        }else if(clientLevelCriteriaObj.score >= 0 && clientLevelCriteriaObj.score <= 4){
                                            scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = false;
                                            scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-red";
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
                                   }
                              }
                              if(scope.centerDetails.subGroupMembers[i].memberData[j].loanAccountBasicData != undefined){
                                    if(scope.centerDetails.subGroupMembers[i].memberData[j].loanAccountBasicData.status.id == 200){
                                       scope.centerDetails.subGroupMembers[i].memberData[j].loanAccountBasicData.isNotLoanApproved = false;
                                    }else{
                                       scope.centerDetails.subGroupMembers[i].memberData[j].loanAccountBasicData.isNotLoanApproved = true;
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
                    historyId +'/documents/'+ documentId + '/attachment?' + CommonUtilService.commonParamsForNewWindow();
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
                 $scope.download = function (historyId, documentId) {
                    scope.reportEntityType = "loan_proposal_review";
                    var url = $rootScope.hostUrl + '/fineract-provider/api/v1/' + scope.reportEntityType + '/' +
                    historyId +'/documents/'+ documentId + '/attachment?' + CommonUtilService.commonParamsForNewWindow();
                     window.open(url);
                 }

             }

            scope.captureMembersToNextStep = function(clientId, loanId, isChecked, idx){
                    if(isChecked){
                        scope.taskInfoTrackArray.push(
                            {'clientId' : clientId, 
                             'currentTaskId' : scope.taskData.id,
                             'loanId' : loanId})
                    }else{
                        scope.taskInfoTrackArray.splice(idx,1);
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


        }
        });
    mifosX.ng.application.controller('kotakApprovalActivityController', ['$controller', '$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter', 'ngXml2json', '$route', '$http', '$rootScope', '$sce', 'CommonUtilService', '$route', '$upload', 'API_VERSION', mifosX.controllers.kotakApprovalActivityController]).run(function ($log) {
        $log.info("kotakApprovalActivityController initialized");
    });
}(mifosX.controllers || {}));