(function (module) {
    mifosX.controllers = _.extend(module, {
        CBReviewController: function (scope, resourceFactory, $rootScope, $sce, $http, $modal, route,location) {
            scope.offices = [];
            scope.formData = {};
            scope.limit = 15;
            scope.requestoffset = 0;
        
            if(scope.response.uiDisplayConfigurations.cbReview.isHiddenField) {
                scope.isAppliedAmountHidden = scope.response.uiDisplayConfigurations.cbReview.isHiddenField.appliedAmount;
            }
            resourceFactory.officeDropDownResource.getAllOffices({}, function (officelist) {
                scope.offices = officelist.allowedParents;
            })
            
            scope.getWorkflowCBReviewData = function () {
                scope.clearCBReviewData();
                resourceFactory.cbReviewResource.query({
                    offset: scope.requestoffset,
                    limit: scope.limit,
                    officeId: scope.formData.officeId,
                    centerId: scope.formData.centerId,
                }, function (data) {
                    scope.cbReviewData = data;
                    scope.totalMembers = data.length;
                    
                    for (var i = 0; i < scope.cbReviewData.length; i++) {
                        if (scope.cbReviewData[i].isApproved){
                            scope.cbReviewData[i].status = 'label.anchor.cb.passed';
                            scope.cbReviewData[i].color = "background-grey";
                            scope.cbPassedMembers = scope.cbPassedMembers + 1;
                        } else if (scope.cbReviewData[i].isRejected) {
                            scope.cbReviewData[i].status = 'label.anchor.cb.rejected';
                            scope.cbReviewData[i].color = "background-red";
                            scope.cbRejectedMembers = scope.cbRejectedMembers + 1
                        } else {
                            scope.cbReviewData[i].status = 'label.heading.cb.review';
                            scope.cbReviewData[i].color = "background-none";
                            scope.cbReviewMembers = scope.cbReviewMembers + 1;
                        }
                    }

                });
            };
            scope.clearCBReviewData = function(){
                    scope.cbPassedMembers = 0;
                    scope.cbRejectedMembers = 0;
                    scope.cbReviewMembers = 0;
                    scope.totalMembers = 0;
                    scope.cbReviewData = [];
            }

            scope.routeToViewClient = function(clientId){
                location.path('/viewclient/' + clientId);
            };
            
            scope.getOfficeTemplateData = function () {
                scope.centerOptions = [];
                delete scope.formData.centerId;
                if(scope.formData.officeId){
                    resourceFactory.centerUnderCBReviewResource.getAll({
                        officeId: scope.formData.officeId
                    }, function (data) {
                        scope.centerOptions = data;
                    });
                }
            };
            
            scope.previousRequest = function () {
                if (scope.requestoffset != 0) {
                    scope.requestoffset = scope.requestoffset - scope.limit;
                    if (scope.requestoffset <= 0) {
                        scope.requestoffset = 0;
                    }
                    scope.getWorkflowCBReviewData();
                }
            }

            scope.nextRequest = function () {
                if (scope.cbReviewData.length == scope.limit) {
                    scope.requestoffset = scope.requestoffset + scope.limit;
                    scope.getWorkflowCBReviewData();
                }
            }
            scope.getWorkflowCBReviewData();

            //Approve Action
            scope.approveAction = function (action, reviewId) {
                $modal.open({
                    templateUrl: 'approve.html',
                    controller: ApproveCtrl,
                    resolve: {
                        params: function () {
                            return { 'command': action, 'reviewId': reviewId };
                        }
                    }
                });
            };
            var ApproveCtrl = function ($scope, $modalInstance, params) {
                $scope.approve = function () {
                    resourceFactory.cbReviewResource.update(
                        { command: params.command, reviewId: params.reviewId }, {}
                        , function (data) {
                            $modalInstance.close('approve');
                            scope.getWorkflowCBReviewData();
                        });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            //Reject Action
            scope.rejectAction = function (action, reviewId) {
                $modal.open({
                    templateUrl: 'reject.html',
                    controller: RejectCtrl,
                    resolve: {
                        params: function () {
                            return { 'command': action, 'reviewId': reviewId };
                        }
                    }
                });
            };
            var RejectCtrl = function ($scope, $modalInstance, params) {
                $scope.reject = function () {
                    resourceFactory.cbReviewResource.update({ command: params.command, reviewId: params.reviewId }, {},
                        function (data) {
                            $modalInstance.close('reject');
                            scope.getWorkflowCBReviewData();
                        });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            
            scope.openViewDocument = function (enquiryId) {
                scope.reportEntityType = "CreditBureau";
                var url = $rootScope.hostUrl + '/fineract-provider/api/v1/enquiry/creditbureau/' + scope.reportEntityType + '/' +
                    enquiryId + '/attachment';
                url = $sce.trustAsResourceUrl(url);
                $http.get(url, { responseType: 'arraybuffer' }).
                    success(function (data, status, headers, config) {
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

            //CB critieria result view
            scope.openViewCBCriteriaResult = function (criteriaResult) {
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
                $scope.cbCriteriaResult = JSON.parse(memberParams.criteriaResult);

                $scope.close = function () {
                    $modalInstance.dismiss('close');
                };
            }

        }
    });
    mifosX.ng.application.controller('CBReviewController', ['$scope', 'ResourceFactory', '$rootScope', '$sce', '$http', '$modal', '$route', '$location', mifosX.controllers.CBReviewController]).run(function ($log) {
        $log.info("CBReviewController initialized");
    });
}(mifosX.controllers || {}));
