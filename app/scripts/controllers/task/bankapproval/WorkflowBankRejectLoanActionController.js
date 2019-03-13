(function (module) {
    mifosX.controllers = _.extend(module, {
        WorkflowBankRejectLoanActionController: function (scope, resourceFactory, location, routeParams, API_VERSION, CommonUtilService, $modal, $rootScope, dateFilter, $sce, $http) {
           
        scope.trackerId = routeParams.trackerId;
        scope.bankApprovalId = routeParams.workflowBankApprovalId;
        scope.loanId = routeParams.loanId;
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
            resourceFactory.bankRejectLoanTemplateResource.get({trackerId : scope.trackerId,loanId:scope.loanId}, function (bankApprovalTemplate) {
                scope.bankApprovalTemplateData = bankApprovalTemplate;
                scope.closureReasons = scope.bankApprovalTemplateData.closureReasons;
                if(scope.bankApprovalTemplateData != undefined){
                    scope.cbCriteriaResult = JSON.parse(scope.bankApprovalTemplateData.clientLevelCriteriaResultData.ruleResult);
                
                    if(scope.bankApprovalTemplateData.clientIdentifiers != undefined){
                            for (var i = 0; i < scope.bankApprovalTemplateData.clientIdentifiers.length; i++) {
                                resourceFactory.clientIdentifierResource.get({clientIdentityId: scope.bankApprovalTemplateData.clientIdentifiers[i].id}, function (data) {
                                    for (var j = 0; j < scope.bankApprovalTemplateData.clientIdentifiers.length; j++) {
                                        if (data.length > 0 && scope.bankApprovalTemplateData.clientIdentifiers[j].id == data[0].parentEntityId) {
                                            for (var l in data) {
                                                var loandocs = {};
                                                loandocs = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment';
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
                }
                if(scope.bankApprovalTemplateData.documentData){
                    for(var i in scope.bankApprovalTemplateData.documentData){
                        var document = scope.bankApprovalTemplateData.documentData[i];
                        if(document.id){
                            var docUrl = {};
                            docUrl = API_VERSION + '/' + document.parentEntityType + '/' + document.parentEntityId + '/documents/' + document.id + '/attachment';
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
            
            scope.download = function(file){
                var url = $rootScope.hostUrl + file.docUrl;
                var fileType = file.fileName.substr(file.fileName.lastIndexOf('.') + 1);
                CommonUtilService.downloadFile(url,fileType);
            } 

            scope.creditReview = function (approveId) {
              scope.creditReviewClientId = approveId;
                    resourceFactory.creditReviewResource.creditReview({bankApproveId:scope.creditReviewClientId},function (data) {
                        location.path('/workflowbankapprovallist');
                    });
            };

       
            scope.openCBReport = function(enquiryId) {
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
                                    var historyDoc = API_VERSION + '/' + history.parentEntityType + '/' + history.id + '/documents/' + history.documentId + '/attachment';
                                    scope.loanLogs[i].docUrl = historyDoc;
                                }
                            }
                        }
                     });
                }
            }


            scope.openViewDocument = function (docUrl) {
                var tabWindowId = window.open('about:blank', '_blank');
                var url = $rootScope.hostUrl + docUrl;
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
    mifosX.ng.application.controller('WorkflowBankRejectLoanActionController', ['$scope', 'ResourceFactory','$location', '$routeParams', 'API_VERSION', 'CommonUtilService', '$modal', '$rootScope', 'dateFilter', '$sce', '$http', mifosX.controllers.WorkflowBankRejectLoanActionController]).run(function ($log) {
        $log.info("WorkflowBankRejectLoanActionController initialized");
    });
}(mifosX.controllers || {}));