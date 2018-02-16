(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewCreditBureauReportController: function (scope, resourceFactory, location, routeParams, route, $modal) {
            scope.clientId = routeParams.clientId;
            scope.enquiryId = routeParams.enquiryId;
            scope.isResponPresent = false;
            scope.entityType = "client";
            scope.creditBureauEnquiry = {};
            scope.reportEntityType = "CreditBureau";
            scope.isShowForceCreaditBureau = false;
            scope.creditBureauFormdata = {'locale':scope.optlang.code};

            resourceFactory.creditBureauEnquiriesResource.getAll({
                    entityType: scope.entityType,
                    entityId: scope.clientId,
                    creditBureauEnquiryId : scope.enquiryId
                  }, function (data) {
                    scope.creditBureauEnquiries = data;
                    if(scope.creditBureauEnquiries && scope.creditBureauEnquiries.length > 0){
                        scope.creditBureauEnquiry = scope.creditBureauEnquiries[0];
                    }
                    if(scope.creditBureauEnquiry.enquiryLoanAmount && scope.creditBureauEnquiry.enquiryLoanAmount>0 && (scope.creditBureauEnquiry.status.code=='SUCCESS' || scope.creditBureauEnquiry.status.code=='ERROR' || scope.creditBureauEnquiry.status.code=='INITIATED')){
                        scope.isShowForceCreaditBureau = true;
                        scope.creditBureauFormdata.creditbureauProductId = scope.creditBureauEnquiry.creditBureauProduct.id;
                        scope.creditBureauFormdata.enquiryLoanPurposeId = scope.creditBureauEnquiry.loanPurpose.id;
                        scope.creditBureauFormdata.enquiryLoanProductId = scope.creditBureauEnquiry.loanProduct.id;
                        scope.creditBureauFormdata.enquiryLoanAmount = scope.creditBureauEnquiry.enquiryLoanAmount;
                        scope.creditBureauFormdata.isForce= true;
                    }
                    if (scope.creditBureauEnquiry && scope.creditBureauEnquiry.status) {
                        scope.isResponPresent = true;
                        clientCreditSummary();
                    }
                    convertByteToString();
            });

            scope.creditBureauReport = function () {
                resourceFactory.clientCreditBureauEnquiry.save({'clientId':scope.clientId},scope.creditBureauFormdata, function (data) {
                    location.path('/viewclient/' + scope.clientId);
                });
            };

            scope.cBStatus = function () {
                var status = undefined;
                if (scope.creditBureauEnquiry && scope.creditBureauEnquiry.status && scope.creditBureauEnquiry.status.value) {
                    status = scope.creditBureauEnquiry.status.value;
                }
                return status;
            };
            function convertByteToString(content, status) {
                scope.errorMessage = undefined;
                var status = scope.cBStatus();
                if (status) {
                    scope.errorMessage = scope.creditBureauEnquiry.errors ;
                }
                return scope.errorMessage;
            };
            function clientCreditSummary(){
                resourceFactory.clientCreditSummary.getAll({
                    clientId: scope.clientId,
                    enquiryId: scope.enquiryId
                    }, function (data) {
                    scope.existingLoans = data.existingLoans;
                    scope.creditScores = data.creditScores ;
                    constructLoanSummary();
                });
            }
            

            function constructLoanSummary() {
                if (!_.isUndefined(scope.activeLoan)) {
                    delete scope.activeLoan;
                }
                if (!_.isUndefined(scope.closedLoan)) {
                    delete scope.closedLoan;
                }
                constructActiveLoanSummary();
                constructClosedLoanSummary();
                findcustomerSinceFromEachMFI();
            };

            function constructActiveLoanSummary() {
                if (scope.existingLoans) {
                    for (var i in scope.existingLoans) {
                        var existingLoan = scope.existingLoans[i];
                        var isValidData = true;
                        if (scope.loanId) {
                            if (scope.loanId == scope.existingLoans[i].loanId) {
                                isValidData = true;
                            }
                        } else if (scope.loanApplicationReferenceId == scope.existingLoans[i].loanApplicationId) {
                            isValidData = true;
                        }
                        if (isValidData == true && existingLoan.source && existingLoan.source.name === 'Credit Bureau') {
                            if (existingLoan.loanStatus && existingLoan.loanStatus.id === 300) {
                                if (_.isUndefined(scope.activeLoan)) {
                                    scope.viewCreditBureauReport = true;
                                    scope.activeLoan = {};
                                    scope.activeLoan.summaries = [];
                                    scope.activeLoan.totalSummary = {};
                                    scope.activeLoan.totalSummary.noOfActiveLoans = 0;
                                    scope.activeLoan.totalSummary.totalOutstandingAmount = 0;
                                    scope.activeLoan.totalSummary.totalEMIAmount = 0;
                                    scope.activeLoan.totalSummary.totalOverDueAmount = 0;
                                }
                                if (existingLoan.lenderName) {
                                    var isLenderPresent = false;
                                    var summaty = {};
                                    for (var j in scope.activeLoan.summaries) {
                                        if (existingLoan.lenderName === scope.activeLoan.summaries[j].lenderName) {
                                            summaty = scope.activeLoan.summaries[j];
                                            isLenderPresent = true;
                                            summaty.noOfActiveLoans += 1;
                                            if (summaty.customerSince > existingLoan.disbursedDate) {
                                                summaty.customerSince = existingLoan.disbursedDate;
                                            }
                                            summaty.totalOutstandingAmount += existingLoan.currentOutstanding;
                                            summaty.totalEMIAmount += convertEMIAmountToMonthlyAmount(existingLoan);
                                            if (summaty.disbursalDate < existingLoan.disbursedDate) {
                                                summaty.disbursalDate = existingLoan.disbursedDate;
                                            }
                                            summaty.totalOverDueAmount += existingLoan.amtOverdue;
                                            scope.activeLoan.summaries[j] = summaty;
                                            break;
                                        }
                                    }
                                    if (!isLenderPresent) {
                                        summaty.lenderName = existingLoan.lenderName;
                                        summaty.customerSince = existingLoan.disbursedDate;
                                        summaty.noOfActiveLoans = 1;
                                        summaty.totalOutstandingAmount = existingLoan.currentOutstanding;
                                        summaty.totalEMIAmount = convertEMIAmountToMonthlyAmount(existingLoan);
                                        summaty.disbursalDate = existingLoan.disbursedDate;
                                        summaty.totalOverDueAmount = existingLoan.amtOverdue;
                                        scope.activeLoan.summaries.push(summaty);
                                    }
                                    scope.activeLoan.totalSummary.noOfActiveLoans += 1;
                                    scope.activeLoan.totalSummary.totalOutstandingAmount += existingLoan.currentOutstanding;
                                    scope.activeLoan.totalSummary.totalEMIAmount += convertEMIAmountToMonthlyAmount(existingLoan);
                                    scope.activeLoan.totalSummary.totalOverDueAmount += existingLoan.amtOverdue;
                                }
                            }
                        }
                    }
                    if (!_.isUndefined(scope.activeLoan) && !_.isUndefined(scope.activeLoan.summaries)) {
                        if (scope.activeLoan.summaries.length > 0) {
                            scope.isReportPresent = true;
                        }
                    }
                }
            };

            function constructClosedLoanSummary() {
                if (scope.existingLoans) {
                    for (var i in scope.existingLoans) {
                        var existingLoan = scope.existingLoans[i];
                        var isValidData = true;
                        if (scope.loanId) {
                            if (scope.loanId == scope.existingLoans[i].loanId) {
                                isValidData = true;
                            }
                        } else if (scope.loanApplicationReferenceId == scope.existingLoans[i].loanApplicationId) {
                            isValidData = true;
                        }
                        if (isValidData == true && existingLoan.source && existingLoan.source.name === 'Credit Bureau') {
                            if (existingLoan.loanStatus && existingLoan.loanStatus.id === 600) {
                                if (_.isUndefined(scope.closedLoan)) {
                                    scope.closedLoan = {};
                                    scope.closedLoan.summaries = [];
                                    scope.closedLoan.totalSummary = {};
                                    scope.closedLoan.totalSummary.noOfClosedLoans = 0;
                                    scope.closedLoan.totalSummary.totalDisbursalAmount = 0;
                                    scope.closedLoan.totalSummary.totalWriteOffAmount = 0;
                                }
                                if (existingLoan.lenderName) {
                                    var isLenderPresent = false;
                                    var summaty = {};
                                    for (var j in scope.closedLoan.summaries) {
                                        if (existingLoan.lenderName === scope.closedLoan.summaries[j].lenderName) {
                                            summaty = scope.closedLoan.summaries[j];
                                            isLenderPresent = true;
                                            summaty.noOfClosedLoans += 1;
                                            if (summaty.customerSince > existingLoan.disbursedDate) {
                                                summaty.customerSince = existingLoan.disbursedDate;
                                            }
                                            summaty.totalDisbursalAmount += existingLoan.amountBorrowed;
                                            if (summaty.lastClosureDate) {
                                                if (existingLoan.closedDate && summaty.lastClosureDate < existingLoan.closedDate) {
                                                    summaty.lastClosureDate = existingLoan.closedDate;
                                                }
                                            } else if (existingLoan.closedDate) {
                                                summaty.lastClosureDate = existingLoan.closedDate;
                                            }
                                            summaty.totalWriteOffAmount += existingLoan.writtenOffAmount;
                                            scope.closedLoan.summaries[j] = summaty;
                                            break;
                                        }
                                    }
                                    if (!isLenderPresent) {
                                        summaty.lenderName = existingLoan.lenderName;
                                        summaty.customerSince = existingLoan.disbursedDate;
                                        summaty.noOfClosedLoans = 1;
                                        summaty.totalDisbursalAmount = existingLoan.amountBorrowed;
                                        if (existingLoan.closedDate) {
                                            summaty.lastClosureDate = existingLoan.closedDate;
                                        }
                                        summaty.totalWriteOffAmount = existingLoan.writtenOffAmount;
                                        scope.closedLoan.summaries.push(summaty);
                                    }
                                    scope.closedLoan.totalSummary.noOfClosedLoans += 1;
                                    scope.closedLoan.totalSummary.totalDisbursalAmount += existingLoan.amountBorrowed;
                                    scope.closedLoan.totalSummary.totalWriteOffAmount += existingLoan.writtenOffAmount;
                                }
                            }
                        }
                        if (!_.isUndefined(scope.closedLoan) && !_.isUndefined(scope.closedLoan.summaries)) {
                            if (scope.closedLoan.summaries.length > 0) {
                                scope.isReportPresent = true;
                            }
                        }
                    }
                }
            };

            function findcustomerSinceFromEachMFI() {
                if (scope.activeLoan && scope.activeLoan.summaries && scope.activeLoan.summaries.length > 0) {
                    if (scope.closedLoan && scope.closedLoan.summaries && scope.closedLoan.summaries.length > 0) {
                        for (var i in scope.activeLoan.summaries) {
                            for (var j in scope.closedLoan.summaries) {
                                if (scope.activeLoan.summaries[i].lenderName === scope.closedLoan.summaries[j].lenderName) {
                                    if (scope.activeLoan.summaries[i].customerSince > scope.closedLoan.summaries[j].customerSince) {
                                        scope.activeLoan.summaries[i].customerSince = scope.closedLoan.summaries[j].customerSince
                                    } else if (scope.closedLoan.summaries[j].customerSince > scope.activeLoan.summaries[i].customerSince) {
                                        scope.closedLoan.summaries[i].customerSince = scope.activeLoan.summaries[j].customerSince
                                    }
                                }
                            }
                        }
                    }
                }
            };

            function convertEMIAmountToMonthlyAmount(existingLoan) {
                if (existingLoan.loanTenurePeriodType.value.toLowerCase() === 'months') {
                    return existingLoan.installmentAmount;
                } else if (existingLoan.loanTenurePeriodType.value.toLowerCase() === 'weeks') {
                    if (existingLoan.repaymentFrequencyMultipleOf && existingLoan.repaymentFrequencyMultipleOf === 2) {
                        return convertBIWeeklyEMIAmountToMonthly(existingLoan);
                    } else {
                        return convertWeeklyEMIAmountToMonthly(existingLoan);
                    }
                } else if (existingLoan.loanTenurePeriodType.value.toLowerCase() === 'days') {
                    return convertDailyEMIAmountToMonthly(existingLoan);
                } else {
                    return 0.00;
                }
            };

            function convertWeeklyEMIAmountToMonthly(existingLoan) {
                return (existingLoan.installmentAmount / 7) * 30;
            };

            function convertBIWeeklyEMIAmountToMonthly(existingLoan) {
                return (existingLoan.installmentAmount / 14) * 30;
            };

            function convertDailyEMIAmountToMonthly(existingLoan) {
                return existingLoan.installmentAmount * 30;
            };

            scope.initiateCreditBureauReport = function () {
               location.path('/create/creditbureau/client/' + scope.clientId);
            };

            scope.cancel = function () {
                location.path('/viewclient/' + scope.clientId);
            };

            scope.refreshCreditBureauReport = function () {
                resourceFactory.fetchCreditBureauReportByEnquiryIdResource.get({
                    enquiryId: scope.enquiryId,
                    entityType: scope.entityType,
                    entityId: scope.clientId
                }, function (data) {
                     scope.creditBureauEnquiries = data;
                    if(scope.creditBureauEnquiries && scope.creditBureauEnquiries.length > 0){
                        scope.creditBureauEnquiry = scope.creditBureauEnquiries[0];
                    }
                    if (scope.creditBureauEnquiry && scope.creditBureauEnquiry.status) {
                        scope.isResponPresent = true;
                        clientCreditSummary();
                    }
                    convertByteToString();
                });
            };

            var viewDocumentCtrl= function ($scope, $modalInstance, reportDetails) {
                $scope.data = reportDetails;
                $scope.close = function () {
                    $modalInstance.close('close');
                };   
            };
            scope.openViewDocument = function (enquiryId, reportEntityType) {
                $modal.open({
                    templateUrl: 'viewDocument.html',
                    controller: viewDocumentCtrl,
                     resolve: {
                        reportDetails: function () {
                            return {'enquiryId' : enquiryId,'reportEntityType' : reportEntityType};
                        }
                    }
                });
            };
        }
    });
    mifosX.ng.application.controller('ViewCreditBureauReportController', ['$scope', 'ResourceFactory', '$location', '$routeParams', '$route','$modal', mifosX.controllers.ViewCreditBureauReportController]).run(function ($log) {
        $log.info("ViewCreditBureauReportController initialized");
    });
}(mifosX.controllers || {}));