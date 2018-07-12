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

        });


            var viewDocumentCtrl= function ($scope, $modalInstance, documentDetail) {
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
                    windowClass: 'modalwidth700',
                    resolve: {
                            queryParameterInfo: function () {
                                return { 'approveId': approveId};
                            }
                        }
                });
            };
            var RaiseQueryCtrl = function ($scope, $modalInstance, queryParameterInfo) {

                $scope.bankApproveId = queryParameterInfo.approveId;
                $scope.queryFormData = {};
                $scope.queryFormData.query = null;

                $scope.cancelRaiseQuery = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.submitQuery = function () {

                    resourceFactory.taskClientLevelQueryResource.raiseQuery({bankApproveId:$scope.bankApproveId}, $scope.queryFormData, function (data) {
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
                if(workflowLoanStatus == "UnderKotakApproval" || workflowLoanStatus == "ODUReviewed"){
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

        }
    });
    mifosX.ng.application.controller('WorkflowBankApprovalActionController', ['$scope', 'ResourceFactory','$location', '$routeParams', 'API_VERSION', 'CommonUtilService', '$modal', '$rootScope', 'dateFilter', '$sce', '$http', mifosX.controllers.WorkflowBankApprovalActionController]).run(function ($log) {
        $log.info("WorkflowBankApprovalActionController initialized");
    });
}(mifosX.controllers || {}));