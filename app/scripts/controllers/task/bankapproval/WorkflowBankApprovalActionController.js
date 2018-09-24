(function (module) {
    mifosX.controllers = _.extend(module, {
        WorkflowBankApprovalActionController: function (scope, resourceFactory, location, routeParams, API_VERSION, CommonUtilService, $modal, $rootScope, dateFilter, $sce, $http) {
           
        scope.trackerId = routeParams.trackerId;
        scope.bankApprovalId = routeParams.workflowBankApprovalId;
        scope.showRaiseQueryButton = false;
        scope.showRejectButton = false;
        scope.showApproveButton = false;
        scope.showUndoApproveButton = false;
        scope.bssCurrentOutstanding = 0;
        scope.totalPreclosureAmount = 0
        scope.finalOutstanding = 0;
        scope.clientImagePresent = false;
        scope.showResolveQueryButton = false;
        scope.isDisplayClientLog = false;
        scope.isDisplayLoanLog = false;
        scope.loanLogs = [];
        scope.allCrnSuspended = false;
        scope.noDedupeMatchFound = false;
        scope.deduperrorExists = false;
        scope.crnGeneration = false;
        scope.crnExists = false;
        scope.creationerrorExists = false;
        scope.allprobableMatches = true;

        scope.init = function(){
            resourceFactory.bankApprovalTemplateResource.get({trackerId : scope.trackerId}, function (bankApprovalTemplate) {
                scope.bankApprovalTemplateData = bankApprovalTemplate;
                if(scope.bankApprovalTemplateData != undefined){
                    scope.cbCriteriaResult = JSON.parse(scope.bankApprovalTemplateData.clientLevelCriteriaResultData.ruleResult);
                
                    if(scope.bankApprovalTemplateData.clientIdentifiers != undefined){
                            for (var i = 0; i < scope.bankApprovalTemplateData.clientIdentifiers.length; i++) {
                                resourceFactory.clientIdentifierResource.get({clientIdentityId: scope.bankApprovalTemplateData.clientIdentifiers[i].id}, function (data) {
                                    for (var j = 0; j < scope.bankApprovalTemplateData.clientIdentifiers.length; j++) {
                                        if (data.length > 0 && scope.bankApprovalTemplateData.clientIdentifiers[j].id == data[0].parentEntityId) {
                                            for (var l in data) {
                                                var loandocs = {};
                                                loandocs = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment?';
                                                data[l].docUrl = loandocs;
                                            }
                                            scope.bankApprovalTemplateData.clientIdentifiers[j].documents = data;
                                        }
                                    }
                                });
                            }            
                    }
                    if(scope.bankApprovalTemplateData.memberData != undefined){
                         getClientImage(scope.bankApprovalTemplateData.memberData.id);
                    }
                    if(scope.bankApprovalTemplateData.existingInternalLoansSummaryData != undefined){
                         scope.bssCurrentOutstanding = scope.bankApprovalTemplateData.existingInternalLoansSummaryData.totalOutstandingAmount;
                    }
                    if(scope.bankApprovalTemplateData.preclosureLoansList != undefined){
                        for(var i = 0; i < scope.bankApprovalTemplateData.preclosureLoansList.length; i++){
                            scope.totalPreclosureAmount = scope.totalPreclosureAmount + scope.bankApprovalTemplateData.preclosureLoansList[i].preclosureAmount;
                        }
                    }
                    scope.finalOutstanding = scope.bssCurrentOutstanding - scope.totalPreclosureAmount;  
                    checkWorkFlowLoanStatus(scope.bankApprovalTemplateData.workflowLoanStatus.code);   
                }
                if(scope.bankApprovalTemplateData.documentData){
                    for(var i in scope.bankApprovalTemplateData.documentData){
                        var document = scope.bankApprovalTemplateData.documentData[i];
                        if(document.id){
                            var docUrl = {};
                            docUrl = API_VERSION + '/' + document.parentEntityType + '/' + document.parentEntityId + '/documents/' + document.id + '/attachment?';
                            scope.bankApprovalTemplateData.documentData[i].docUrl = docUrl;
                        }
    
                    }
                }
                if(scope.bankApprovalTemplateData.clientDedupTemplateData != undefined || scope.bankApprovalTemplateData.clientDedupTemplateData!=null){
                    scope.clientDedupTemplateData = scope.bankApprovalTemplateData.clientDedupTemplateData;
                    scope.allCrnSuspended = scope.clientDedupTemplateData.allCrnSuspended;
                    scope.noDedupeMatchFound = scope.clientDedupTemplateData.noDedupeMatchFound;
                    scope.deduperrorExists = scope.clientDedupTemplateData.errorExists;
                    if(scope.deduperrorExists == true){
                        scope.deduperror=scope.clientDedupTemplateData.errorDescription;
                    }
                    if(scope.clientDedupTemplateData.crn != null){
                        scope.crnExists = true;
                    }
                    if(!scope.noDedupeMatchFound){
                        for(var i = 0 ;i < scope.clientDedupTemplateData.clientDedupeList;i++){
                            if(scope.clientDedupTemplateData.clientDedupeList[i].exactDedupMatch == true){
                                scope.allprobableMatches = false;
                                break;
                            }
                        }
                    }
                }
                if(scope.bankApprovalTemplateData.ncifDedupTemplateData != undefined || scope.bankApprovalTemplateData.ncifDedupTemplateData != null){
                    scope.ncifDedupTemplateData = scope.bankApprovalTemplateData.ncifDedupTemplateData;
                }
    
            });
        };

        scope.init();

            var viewDocumentCtrl= function ($scope, $modalInstance, documentDetail) {
				$scope.df = scope.df;
                $scope.data = documentDetail;
                $scope.close = function () {
                    $modalInstance.close('close');
                };
               
            };
            scope.openViewDocument = function (documentDetail) {
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
            
            scope.download = function(docUrl){
                var url = $rootScope.hostUrl + docUrl + CommonUtilService.commonParamsForNewWindow();
                window.open(url);
            } 


            scope.raiseQuery = function (approveId) {
                $modal.open({
                    templateUrl: 'raisequery.html',
                    controller: RaiseQueryCtrl,
                    backdrop: 'static',
                    windowClass: 'app-modal-window-full-screen',
                    size: 'lg',
                    resolve: {
                            queryParameterInfo: function () {
                                return { 'approveId': approveId,
                                         'bankEnquiries':scope.bankApprovalTemplateData.bankQueryTypeOptions};
                            }
                        }
                });
            };
            var RaiseQueryCtrl = function ($scope, $modalInstance, queryParameterInfo) {
				$scope.df = scope.df;
                $scope.bankApproveId = queryParameterInfo.approveId;
                $scope.bankEnqiryOptions = queryParameterInfo.bankEnquiries;
                $scope.queryFormData = {};
                $scope.available = null;
                $scope.selected = null;
                $scope.queryText = {};
                $scope.availableQueries = [];
                $scope.selectedQueries = [];
                $scope.error = false;
                $scope.cancelRaiseQuery = function () {
                    $modalInstance.dismiss('cancel');
                };
                $scope.availableQuery = function(){
                    if($scope.bankEnqiryOptions){
                        for(var i in $scope.bankEnqiryOptions){
                            var queryObj = {};
                            queryObj.queryId = $scope.bankEnqiryOptions[i].id;
                            queryObj.query = $scope.bankEnqiryOptions[i].name;
                            $scope.availableQueries.push(queryObj);
                        }
                    }
                }
                $scope.availableQuery();
                $scope.checkOtherQuery = function(availableQueryId){
                    $scope.showQueryText = false;
                    $scope.isDisableAddButton = false;
                    for(var i in $scope.bankEnqiryOptions){
                        if($scope.bankEnqiryOptions[i].id == availableQueryId && $scope.bankEnqiryOptions[i].systemIdentifier === "QUERY"){
                            $scope.showQueryText = true;
                        }
                    }
                }
                $scope.addQuery = function(){
                    if(this.available){
                        $scope.error = false;
                        for(var i in $scope.bankEnqiryOptions){
                            if($scope.bankEnqiryOptions[i].id == this.available){
                                var queryObj = {}
                                queryObj.queryId = this.available;
                                if($scope.bankEnqiryOptions[i].systemIdentifier === "QUERY"){
                                    queryObj.query = this.queryText.description;
                                    if(_.isUndefined(queryObj.query) || queryObj.query.trim().length <= 0){
                                        $scope.error = true;
                                        return false;
                                    }
                                }else{
                                    queryObj.query = $scope.bankEnqiryOptions[i].name;
                                }

                                $scope.selectedQueries.push(queryObj);
                                $scope.availableQueries.splice(i,1);
                                $scope.showQueryText = false;
                                $scope.isDisableAddButton = true;
                            }

                        }
                    }
                }

                $scope.submitQuery = function () {
                    $scope.queryFormData.queries = $scope.selectedQueries;
                    $scope.activity = "query";
                    resourceFactory.taskClientLevelQueryResource.raiseQuery({bankApproveId:$scope.bankApproveId,activity:$scope.activity}, $scope.queryFormData, function (data) {
                        $modalInstance.close('raisequery');
                        location.path('/workflowbankapprovallist');
                    });

                };

            };


            scope.approveLoan = function (approveId) {

                resourceFactory.bankApprovalActionResource.doAction({bankApproveId:approveId, command : 'approve'}, {} , function (data) {
                        location.path('/workflowbankapprovallist');
                });

            }    

           scope.rejectLoan = function (bankApproveId) {

                resourceFactory.bankApprovalActionResource.doAction({bankApproveId:bankApproveId, command : 'reject'}, {} , function (data) {
                        location.path('/workflowbankapprovallist');
                });

            } 

            scope.undoApproveLoan = function (approveId) {

                resourceFactory.bankApprovalActionResource.doAction({bankApproveId:approveId, command : 'undoapproval'}, {} , function (data) {
                        location.path('/workflowbankapprovallist');
                });

            }

            scope.routeToResolveQuery = function(){
                location.path('/clientlevelqueryresolve/' + scope.trackerId + '/' + scope.bankApprovalId);
            }


            var checkWorkFlowLoanStatus = function(workflowLoanStatus){
                if(workflowLoanStatus == "UnderKotakApproval" || workflowLoanStatus == "ODUReviewed" || workflowLoanStatus == "SystemApproved" || workflowLoanStatus == "SystemApprovedWithDeviation"){
                    scope.showRaiseQueryButton = true;
                    scope.showRejectButton = true;
                    scope.showApproveButton = true;
                    scope.showUndoApproveButton = false;
                    scope.showResolveQueryButton = false;
                }else if(workflowLoanStatus == "KotakApproved"){
                    scope.showRaiseQueryButton = false;
                    scope.showRejectButton = false;
                    scope.showApproveButton = false;
                    scope.showUndoApproveButton = true;
                    scope.showResolveQueryButton = false;
                }else if(workflowLoanStatus == "UnderODUReview"){
                    scope.showRaiseQueryButton = false;
                    scope.showRejectButton = false;
                    scope.showApproveButton = false;
                    scope.showUndoApproveButton = false;
                    scope.showResolveQueryButton = true;
                }else{
                    scope.showRaiseQueryButton = false;
                    scope.showRejectButton = false;
                    scope.showApproveButton = false;
                    scope.showUndoApproveButton = false;
                    scope.showResolveQueryButton = false;
                }
            }       


            scope.openCBReport = function(enquiryId) {
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

            function getClientImage(clientId){
                $http({
                        method: 'GET',
                        url: $rootScope.hostUrl + API_VERSION + '/client/' + clientId + '/images?maxHeight=150'
                    }).then(function (imageData) {
                        scope.imageData = imageData.data[0];
                        if(scope.imageData){
                            $http({
                                method: 'GET',
                                url: $rootScope.hostUrl + API_VERSION + '/client/' + clientId+ '/images/'+scope.imageData.imageId+'?maxHeight=150'
                            }).then(function (imageData) {
                                scope.image = imageData.data;
                                scope.clientImagePresent = true;
                            });
                        }       
                });
            }

            scope.displayClientLog = function(clientId){
                scope.isDisplayClientLog = true;
                scope.isDisplayLoanLog = false;
                resourceFactory.historyResource.get({entityType: 'client',entityId: clientId}, function (data) {
                    scope.clientLogs = data;
                });
            }

            scope.displayLoanLog = function(loanId){
                scope.isDisplayClientLog = false;
                scope.isDisplayLoanLog = true;
                if(scope.loanLogs.length==0){
                    resourceFactory.loanProposalReviewHistoryResource.getAll({
                         loanId: loanId
                     }, function (data) {
                         scope.loanLogs = data;
                        if(scope.loanLogs){
                            for(var i in scope.loanLogs){
                                var history = scope.loanLogs[i];
                                if(history.documentId){
                                    var historyDoc = {};
                                    var historyDoc = API_VERSION + '/' + history.parentEntityType + '/' + history.id + '/documents/' + history.documentId + '/attachment?';
                                    scope.loanLogs[i].docUrl = historyDoc;
                                }
                            }
                        }
                     });
                }
            }

            scope.createBcif = function () {
                resourceFactory.bcifCreateResource.post({trackerId: scope.trackerId}, function (data) {
                    scope.crnGeneration = true;
                    scope.clientCrnTemplateData=data;
                    if(scope.clientCrnTemplateData.errorDescription!=null){
                        scope.creationerrorExists = true;
                        scope.crncreationerror = scope.clientCrnTemplateData.errorDescription;
                    }
                });
            }
            scope.overrideCrn = function(record){
                resourceFactory.overridebcifDedupecrnResource.post({trackerId: scope.trackerId,crn:record.bcifId}, function (data) {
                    scope.init();
                });
            }

            scope.openViewDocument = function (docUrl) {
                var tabWindowId = window.open('about:blank', '_blank');
                var url = $rootScope.hostUrl + docUrl + CommonUtilService.commonParamsForNewWindow();
                    url = $sce.trustAsResourceUrl(url);
                    $http.get(url, { responseType: 'arraybuffer' }).
                    success(function(data, status, headers, config) {
                        var supportedContentTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/html', 'application/xml', 'text/plain',];
                        var contentType = headers('Content-Type');
                        var file = new Blob([data], { type: contentType });
                        var fileContent = URL.createObjectURL(file);
                        if (supportedContentTypes.indexOf(contentType) > -1) {
                            var docData = $sce.trustAsResourceUrl(fileContent);
                            tabWindowId.location.href = docData;
                        }
                    });
                };
            }


    });
    mifosX.ng.application.controller('WorkflowBankApprovalActionController', ['$scope', 'ResourceFactory','$location', '$routeParams', 'API_VERSION', 'CommonUtilService', '$modal', '$rootScope', 'dateFilter', '$sce', '$http', mifosX.controllers.WorkflowBankApprovalActionController]).run(function ($log) {
        $log.info("WorkflowBankApprovalActionController initialized");
    });
}(mifosX.controllers || {}));