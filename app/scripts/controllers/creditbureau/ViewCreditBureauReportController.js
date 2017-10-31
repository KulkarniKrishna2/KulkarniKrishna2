(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewCreditBureauReportController: function (scope, resourceFactory, location, routeParams) {
            scope.clientId = routeParams.clientId;
            scope.enquiryId = routeParams.enquiryId;
            scope.isResponPresent = false;
            resourceFactory.creditBureauReportSummaryByEnquiryIdResource.get({'enquiryId' : scope.enquiryId},function (data) {
                scope.creditBureauReportSummary = data;
                if (scope.creditBureauReportSummary && scope.creditBureauReportSummary.cbStatus) {
                    scope.isResponPresent = true;
                }
                convertByteToString();
            });
            scope.cBStatus = function () {
                var status = undefined;
                if (scope.creditBureauReportSummary && scope.creditBureauReportSummary.cbStatus && scope.creditBureauReportSummary.cbStatus.value) {
                    status = scope.creditBureauReportSummary.cbStatus.value;
                }
                return status;
            };
            function convertByteToString(content, status) {
                scope.errorMessage = undefined;
                var status = scope.cBStatus();
                if (status) {
                    scope.errorMessage = scope.creditBureauReportSummary.errors ;
                }
                return scope.errorMessage;
            };
            resourceFactory.clientCreditSummary.getAll({
                clientId: scope.clientId,
                enquiryId: scope.enquiryId
            }, function (data) {
                scope.existingLoans = data.existingLoans;
                scope.creditScores = data.creditScores ;
                constructLoanSummary();
            });

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
                        var isValidData = false;
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
                        var isValidData = false;
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
                resourceFactory.creditBureauReportByEnquiryIdResource.get({
                    enquiryId: scope.enquiryId
                }, function (creditBureauReportSummary) {
                    scope.creditBureauReportSummary = creditBureauReportSummary;
                    if (scope.creditBureauReportSummary && scope.creditBureauReportSummary.cbStatus) {
                        scope.isResponPresent = true;
                    }
                    convertByteToString();
                    resourceFactory.clientCreditSummary.getAll({
                        clientId: scope.clientId,
                        enquiryId: scope.enquiryId
                    }, function (data) {
                        scope.existingLoans = data.existingLoans;
                        scope.creditScores = data.creditScores ;
                        constructLoanSummary();
                    });
                });
            };

            scope.creditBureauReportView = function () {
                resourceFactory.creditBureauReportFileContentByEnquiryIdResource.get({
                    enquiryId: scope.enquiryId
                }, function (fileContentData) {
                    if (fileContentData.reportFileType.value == 'HTML') {
                        var result = "";
                        for (var i = 0; i < fileContentData.fileContent.length; ++i) {
                            result += (String.fromCharCode(fileContentData.fileContent[i]));
                        }
                        var popupWin = window.open('', '_blank', 'width=1000,height=500');
                        popupWin.document.open();
                        popupWin.document.write(result);
                        popupWin.document.close();
                    } else if (fileContentData.reportFileType.value == 'XML') {
                        var result = "";
                        for (var i = 0; i < fileContentData.fileContent.length; ++i) {
                            result += (String.fromCharCode(fileContentData.fileContent[i]));
                        }
                        var newWindow = window.open('', '_blank', 'toolbar=0, location=0, directories=0, status=0, scrollbars=1, resizable=1, copyhistory=1, menuBar=1, width=640, height=480, left=50, top=50', true);
                        var preEl = newWindow.document.createElement("pre");
                        var codeEl = newWindow.document.createElement("code");
                        codeEl.appendChild(newWindow.document.createTextNode(result));
                        preEl.appendChild(codeEl);
                        newWindow.document.body.appendChild(preEl);
                    }
                });
            };

            scope.cancel = function () {
                location.path('/viewclient/' + scope.clientId);
            };
        }
    });
    mifosX.ng.application.controller('ViewCreditBureauReportController', ['$scope', 'ResourceFactory', '$location', '$routeParams', mifosX.controllers.ViewCreditBureauReportController]).run(function ($log) {
        $log.info("ViewCreditBureauReportController initialized");
    });
}(mifosX.controllers || {}));