(function (module) {
    mifosX.controllers = _.extend(module, {
        CBReviewController: function (scope, resourceFactory, paginatorUsingOffsetService, $rootScope, $sce, $http, $modal, route, dateFilter,location) {
            scope.offices = [];
            scope.formData = {};
            scope.limit = 15;
            scope.requestoffset = 0;
            scope.cbCriteriaStatusOptions = [];
            resourceFactory.officeDropDownResource.getAllOffices({}, function (officelist) {
                scope.offices = officelist.allowedParents;
            })
            resourceFactory.cbReviewTemplateResource.query(function(data) {
                scope.cbCriteriaStatusOptions = data;
            })
            scope.getWorkflowCBReviewData = function () {
                resourceFactory.cbReviewResource.query({
                    offset: scope.requestoffset,
                    limit: scope.limit,
                    officeId: scope.formData.officeId,
                    centerId: scope.formData.centerId,
                    loanOfficerId: scope.formData.loanOfficerId,
                    status: scope.formData.status
                }, function (data) {
                    scope.cbReviewData = data;
                    scope.totalMembers = data.length;
                    scope.cbPassedMembers = 0;
                    scope.cbRejectedMembers = 0;
                    scope.cbReviewMembers = 0;
                    for (var i = 0; i < scope.cbReviewData.length; i++) {
                        if (scope.cbReviewData[i].isApproved ||(!scope.cbReviewData[i].isRejected && scope.cbReviewData[i].criteriaCheckScore ==5)) {
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

            scope.routeToViewClient = function(clientId){
                location.path('/viewclient/' + clientId);
            };
            
            scope.getOfficeTemplateData = function () {
                scope.centerOptions = [];
                scope.loanOfficers = [];
                resourceFactory.groupTemplateResource.get({
                    officeId: scope.formData.officeId,
                    center: true,
                    staffInSelectedOfficeOnly: true,
                    loanOfficersOnly: true
                }, function (data) {
                    scope.centerOptions = data.centerOptions;
                    scope.loanOfficers = data.staffOptions;
                });
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
                            route.reload();
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
                            route.reload();
                        });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
        }
    });
    mifosX.ng.application.controller('CBReviewController', ['$scope', 'ResourceFactory', 'PaginatorUsingOffsetService', '$rootScope', '$sce', '$http', '$modal', '$route', 'dateFilter','$location', mifosX.controllers.CBReviewController]).run(function ($log) {
        $log.info("CBReviewController initialized");
    });
}(mifosX.controllers || {}));