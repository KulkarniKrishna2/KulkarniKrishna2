(function (module) {
    mifosX.controllers = _.extend(module, {
        groupMembersCreditSummaryActivityController: function ($controller, scope, resourceFactory, location, $modal, $rootScope, $http, $sce) {
            angular.extend(this, $controller('defaultActivityController', {
                $scope: scope
            }));

            scope.showClosedLoanApplicationInGroupMembersCreditSummary = true;
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.workflow) {
                scope.showClosedLoanApplicationInGroupMembersCreditSummary = scope.response.uiDisplayConfigurations.workflow.showClosedLoanApplicationInGroupMembersCreditSummary;
            }

            resourceFactory.groupResource.get({
                groupId: scope.groupId,
                associations: 'clientMembers'
            }, function (data) {
                scope.group = data;
                if (data.clientMembers) {

                    resourceFactory.loanAppTaskBasicDetailGroupResource.get({groupId: scope.groupId},function(data){
                        scope.loanAppWorkflowStatusBasicDataList = data;

                        angular.forEach(scope.group.clientMembers, function(client) {
                            client.workflows = [];
                            resourceFactory.loanApplicationReferencesForGroupResource.get({ groupId: scope.groupId, clientId: client.id }, function (data) {
                                if(data.length>0){
                                    angular.forEach(data, function(loanApplication){
                                        var workflow = {}
                                        workflow.loanProductName = loanApplication.loanProductName;
                                        workflow.loanAmountRequested = loanApplication.loanAmountRequested;
                                        if(!_.isUndefined(scope.loanAppWorkflowStatusBasicDataList)){
                                            for(var i in scope.loanAppWorkflowStatusBasicDataList){
                                                var loanAppWorkflowStatusBasicData = scope.loanAppWorkflowStatusBasicDataList[i];
                                                var showLoan = scope.showClosedLoanApplicationInGroupMembersCreditSummary ? true: !["taskStatus.cancelled", "taskStatus.inactive"].includes(loanAppWorkflowStatusBasicData.parentTaskStatusEnum.code);

                                                if(showLoan && loanAppWorkflowStatusBasicData.loanAppRefId === loanApplication.loanApplicationReferenceId ){
                                                    if(!_.isUndefined(loanAppWorkflowStatusBasicData.parentTaskStatusEnum) && loanAppWorkflowStatusBasicData.parentTaskStatusEnum.id>1){
                                                        workflow.status = loanAppWorkflowStatusBasicData.parentTaskStatusEnum;
                                                        workflow.currentChildTaskId = loanAppWorkflowStatusBasicData.currentTaskId;
                                                        workflow.currentChildTaskName = loanAppWorkflowStatusBasicData.currentTaskName;
                                                        workflow.id = loanAppWorkflowStatusBasicData.parentTaskId;
                                                        workflow.entityId = loanAppWorkflowStatusBasicData.loanAppRefId;
                                                        client.workflows.push(workflow);
                                                    }
                                                }
                                            }
                                        }
                                    });
                                }
                            });
                        });
                    });
                }
            });
            

            scope.routeToMem = function (id) {
                location.path('/viewclient/' + id);
            };

            var viewCreditBureauDetailsCtrl = function ($scope, $modalInstance, loanApplicationReferenceId) {
                $scope.isResponPresent = false;
                $scope.viewCreditBureauReport = false;
                $scope.errorMessage = [];
                $scope.isStalePeriodExceeded = false;
                $scope.reportEntityType = "CreditBureau";
                resourceFactory.loanApplicationReferencesResource.getByLoanAppId({
                    loanApplicationReferenceId: loanApplicationReferenceId
                }, function (data) {
                    if(data){
                        $scope.formData = data;
                        if ($scope.formData.loanId) {
                            resourceFactory.LoanAccountResource.getLoanAccountDetails({
                                loanId: $scope.formData.loanId,
                                associations: 'all,hierarchyLookup',
                                exclude: 'guarantors'
                            }, function (loandetails) {
                                if (loandetails.status.id == 200) {
                                    $scope.loandetails = loandetails;
                                }
                            });
                        }
                        $scope.isStalePeriodExceeded = data.isStalePeriodExceeded;
                        getCreditbureauLoanProductData($scope.formData.loanProductId);
                    }
                });
                $scope.cBStatus = function () {
                    var status = undefined;
                    if ($scope.creditBureauEnquiry && $scope.creditBureauEnquiry.status && $scope.creditBureauEnquiry.status.value) {
                        status = $scope.creditBureauEnquiry.status.value;
                    }
                    return status;
                };

                function getCreditBureauReportSummary() {

                    resourceFactory.creditBureauEnquiriesResource.getAll({
                        entityType: 'loanapplication',
                        entityId: loanApplicationReferenceId,
                        trancheDisbursalId: $scope.trancheDisbursalId
                    }, function (data) {
                        if(data){
                            $scope.creditBureauEnquiries = data;
                            if ($scope.creditBureauEnquiries && $scope.creditBureauEnquiries.length > 0) {
                                $scope.creditBureauEnquiry = $scope.creditBureauEnquiries[0];
                                if ($scope.creditBureauEnquiry) {
                                    if ($scope.creditBureauEnquiry.status) {
                                        $scope.isResponPresent = true;
                                    }
                                    convertByteToString();
                                    resourceFactory.clientCreditSummary.getAll({
                                        clientId: $scope.formData.clientId,
                                        enquiryId: $scope.creditBureauEnquiry.id
                                    }, function (data) {
                                        $scope.existingLoans = data.existingLoans;
                                        $scope.creditScores = data.creditScores;
                                        constructLoanSummary();
                                    });
                                }
    
                            }
                        }
                    });
                };

                function getCreditbureauLoanProductData(loanProductId) {
                    resourceFactory.loanProductResource.getCreditbureauLoanProducts({
                        loanProductId: loanProductId,
                        associations: 'creditBureaus',
                        clientId: $scope.clientId
                    }, function (data) {
                        if(data){
                            $scope.creditbureauLoanProduct = data;
                            getCreditBureauReportSummary();
                        }
                    });
                };

                function convertByteToString(content, status) {
                    $scope.errorMessage = undefined;
                    var status = $scope.cBStatus();
                    if (status) {
                        $scope.errorMessage = $scope.creditBureauEnquiry.errors;
                    }
                    return $scope.errorMessage;
                };

                function constructLoanSummary() {
                    if (!_.isUndefined($scope.activeLoan)) {
                        delete $scope.activeLoan;
                    }
                    if (!_.isUndefined($scope.closedLoan)) {
                        delete $scope.closedLoan;
                    }
                    constructActiveLoanSummary();
                    constructClosedLoanSummary();
                    findcustomerSinceFromEachMFI();
                };

                function constructActiveLoanSummary() {
                    if ($scope.existingLoans) {
                        for (var i in $scope.existingLoans) {
                            var existingLoan = $scope.existingLoans[i];
                            if (existingLoan.source && existingLoan.source.name === 'Credit Bureau') {
                                if (existingLoan.loanStatus && existingLoan.loanStatus.id === 300) {
                                    if (_.isUndefined($scope.activeLoan)) {
                                        $scope.viewCreditBureauReport = true;
                                        $scope.activeLoan = {};
                                        $scope.activeLoan.summaries = [];
                                        $scope.activeLoan.totalSummary = {};
                                        $scope.activeLoan.totalSummary.noOfActiveLoans = 0;
                                        $scope.activeLoan.totalSummary.totalOutstandingAmount = 0;
                                        $scope.activeLoan.totalSummary.totalEMIAmount = 0;
                                        $scope.activeLoan.totalSummary.totalOverDueAmount = 0;
                                    }
                                    if (existingLoan.lenderName) {
                                        var isLenderPresent = false;
                                        var summary = {};
                                        for (var j in $scope.activeLoan.summaries) {
                                            if (existingLoan.lenderName === $scope.activeLoan.summaries[j].lenderName) {
                                                summary = $scope.activeLoan.summaries[j];
                                                isLenderPresent = true;
                                                summary.noOfActiveLoans += 1;
                                                if (summary.customerSince > existingLoan.disbursedDate) {
                                                    summary.customerSince = existingLoan.disbursedDate;
                                                }
                                                if (existingLoan.currentOutstanding) {
                                                    summary.totalOutstandingAmount += existingLoan.currentOutstanding;
                                                }
                                                summary.totalEMIAmount += convertEMIAmountToMonthlyAmount(existingLoan);
                                                if (summary.disbursalDate < existingLoan.disbursedDate) {
                                                    summary.disbursalDate = existingLoan.disbursedDate;
                                                }
                                                summary.totalOverDueAmount += existingLoan.amtOverdue;
                                                $scope.activeLoan.summaries[j] = summary;
                                                break;
                                            }
                                        }
                                        if (!isLenderPresent) {
                                            summary.lenderName = existingLoan.lenderName;
                                            summary.customerSince = existingLoan.disbursedDate;
                                            summary.noOfActiveLoans = 1;
                                            summary.totalOutstandingAmount = existingLoan.currentOutstanding;
                                            summary.totalEMIAmount = convertEMIAmountToMonthlyAmount(existingLoan);
                                            summary.disbursalDate = existingLoan.disbursedDate;
                                            summary.totalOverDueAmount = existingLoan.amtOverdue;
                                            $scope.activeLoan.summaries.push(summary);
                                        }
                                        $scope.activeLoan.totalSummary.noOfActiveLoans += 1;
                                        if (existingLoan.currentOutstanding) {
                                            $scope.activeLoan.totalSummary.totalOutstandingAmount += existingLoan.currentOutstanding;
                                        }
                                        $scope.activeLoan.totalSummary.totalEMIAmount += convertEMIAmountToMonthlyAmount(existingLoan);
                                        $scope.activeLoan.totalSummary.totalOverDueAmount += existingLoan.amtOverdue;
                                    }
                                }
                            }
                        }
                        if (!_.isUndefined($scope.activeLoan) && !_.isUndefined($scope.activeLoan.summaries)) {
                            if ($scope.activeLoan.summaries.length > 0) {
                                $scope.isReportPresent = true;
                            }
                        }
                    }
                };

                function constructClosedLoanSummary() {
                    if ($scope.existingLoans) {
                        for (var i in $scope.existingLoans) {
                            var existingLoan = $scope.existingLoans[i];
                            if (existingLoan.source && existingLoan.source.name === 'Credit Bureau') {
                                if (existingLoan.loanStatus && existingLoan.loanStatus.id === 600) {
                                    if (_.isUndefined($scope.closedLoan)) {
                                        $scope.closedLoan = {};
                                        $scope.closedLoan.summaries = [];
                                        $scope.closedLoan.totalSummary = {};
                                        $scope.closedLoan.totalSummary.noOfClosedLoans = 0;
                                        $scope.closedLoan.totalSummary.totalDisbursalAmount = 0;
                                        $scope.closedLoan.totalSummary.totalWriteOffAmount = 0;
                                    }
                                    if (existingLoan.lenderName) {
                                        var isLenderPresent = false;
                                        var summary = {};
                                        for (var j in $scope.closedLoan.summaries) {
                                            if (existingLoan.lenderName === $scope.closedLoan.summaries[j].lenderName) {
                                                summary = $scope.closedLoan.summaries[j];
                                                isLenderPresent = true;
                                                summary.noOfClosedLoans += 1;
                                                if (summary.customerSince > existingLoan.disbursedDate) {
                                                    summary.customerSince = existingLoan.disbursedDate;
                                                }
                                                summary.totalDisbursalAmount += existingLoan.amountBorrowed;
                                                if (summary.lastClosureDate) {
                                                    if (existingLoan.closedDate && summary.lastClosureDate < existingLoan.closedDate) {
                                                        summary.lastClosureDate = existingLoan.closedDate;
                                                    }
                                                } else if (existingLoan.closedDate) {
                                                    summary.lastClosureDate = existingLoan.closedDate;
                                                }
                                                summary.totalWriteOffAmount += existingLoan.writtenOffAmount;
                                                $scope.closedLoan.summaries[j] = summary;
                                                break;
                                            }
                                        }
                                        if (!isLenderPresent) {
                                            summary.lenderName = existingLoan.lenderName;
                                            summary.customerSince = existingLoan.disbursedDate;
                                            summary.noOfClosedLoans = 1;
                                            summary.totalDisbursalAmount = existingLoan.amountBorrowed;
                                            if (existingLoan.closedDate) {
                                                summary.lastClosureDate = existingLoan.closedDate;
                                            }
                                            summary.totalWriteOffAmount = existingLoan.writtenOffAmount;
                                            $scope.closedLoan.summaries.push(summary);
                                        }
                                        $scope.closedLoan.totalSummary.noOfClosedLoans += 1;
                                        $scope.closedLoan.totalSummary.totalDisbursalAmount += existingLoan.amountBorrowed;
                                        $scope.closedLoan.totalSummary.totalWriteOffAmount += existingLoan.writtenOffAmount;
                                    }
                                }
                            }
                            if (!_.isUndefined($scope.closedLoan) && !_.isUndefined($scope.closedLoan.summaries)) {
                                if ($scope.closedLoan.summaries.length > 0) {
                                    $scope.isReportPresent = true;
                                }
                            }
                        }
                    }
                };

                function findcustomerSinceFromEachMFI() {
                    if ($scope.activeLoan && $scope.activeLoan.summaries && $scope.activeLoan.summaries.length > 0) {
                        if ($scope.closedLoan && $scope.closedLoan.summaries && $scope.closedLoan.summaries.length > 0) {
                            for (var i in $scope.activeLoan.summaries) {
                                for (var j in $scope.closedLoan.summaries) {
                                    if ($scope.activeLoan.summaries[i].lenderName === $scope.closedLoan.summaries[j].lenderName) {
                                        if ($scope.activeLoan.summaries[i].customerSince > $scope.closedLoan.summaries[j].customerSince) {
                                            $scope.activeLoan.summaries[i].customerSince = $scope.closedLoan.summaries[j].customerSince
                                        } else if ($scope.closedLoan.summaries[j].customerSince > $scope.activeLoan.summaries[i].customerSince) {
                                            $scope.closedLoan.summaries[i].customerSince = $scope.activeLoan.summaries[j].customerSince
                                        }
                                    }
                                }
                            }
                        }
                    }
                };

                $scope.openViewDocument = function (enquiryId, reportEntityType) {
                    var url = $rootScope.hostUrl + '/fineract-provider/api/v1/enquiry/creditbureau/' + reportEntityType + '/' +
                        enquiryId + '/attachment';
                    url = $sce.trustAsResourceUrl(url);
                    $http.get(url, { responseType: 'arraybuffer' }).
                        success(function (data, status, headers, config) {
                            var supportedContentTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/html', 'application/xml', "text/plain"];
                            var contentType = headers('Content-Type');
                            var file = new Blob([data], { type: contentType });
                            var fileContent = URL.createObjectURL(file);
                            if (supportedContentTypes.indexOf(contentType) > -1) {
                                var docData = $sce.trustAsResourceUrl(fileContent);
                                window.open(docData);
                            }
                        });
                };

                $scope.close = function () {
                    $modalInstance.close('close');
                };

            };
            scope.viewCreditBureauDetails = function (loanApplicationReferenceId) {
                $modal.open({
                    templateUrl: 'viewCreditBureauDetails.html',
                    controller: viewCreditBureauDetailsCtrl,
                    windowClass: 'app-modal-window-full-screen',
                    resolve: {
                        loanApplicationReferenceId: function () {
                            return loanApplicationReferenceId;
                        }
                    }
                });
            };

        }
    });
    mifosX.ng.application.controller('groupMembersCreditSummaryActivityController', ['$controller', '$scope', 'ResourceFactory', '$location', '$modal', '$rootScope', '$http', '$sce', mifosX.controllers.groupMembersCreditSummaryActivityController]).run(function ($log) {
        $log.info("groupMembersCreditSummaryActivityController initialized");
    });
}(mifosX.controllers || {}));