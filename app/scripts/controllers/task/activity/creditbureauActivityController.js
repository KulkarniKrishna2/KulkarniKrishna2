(function (module) {
    mifosX.controllers = _.extend(module, {
        creditbureauActivityController: function (scope, routeParams, $modal, resourceFactory, location, dateFilter, ngXml2json) {
            scope.onFileSelect = function ($files) {
                scope.file = $files[0];
            };
            function initTask(){
                scope.clientId = scope.taskconfig['clientId'];
                scope.loanApplicationReferenceId = scope.taskconfig['loanApplicationId'];
            };
            initTask();
            scope.viewCreditBureauReport = false;
            scope.errorMessage = [];
            scope.cbResponseError = false;
            scope.cbLoanEnqResponseError = false;
            scope.entityType = 'loanapplication';
            scope.entityId = scope.loanApplicationReferenceId;
            if (scope.entityType === 'loanapplication') {
                scope.loanApplicationReferenceId = scope.entityId;
                getLoanApplicationData();
            } else if (scope.entityType === 'loan') {
                scope.loanId = scope.entityId;
                getLoanData();
            }

            function getLoanApplicationData() {
                resourceFactory.loanApplicationReferencesResource.getByLoanAppId({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (data) {
                    scope.formData = data;
                    scope.loanProductChange(scope.formData.loanProductId);
                    getCreditbureauLoanProductData(scope.formData.loanProductId);
                });
            };

            function getLoanData() {
                resourceFactory.LoanAccountResource.getLoanAccountDetails({
                    loanId: scope.loanId,
                    associations: 'all',
                    exclude: 'guarantors'
                }, function (data) {
                    scope.loandetails = data;
                    scope.formData = scope.loandetails;
                    if (data.clientName) {
                        scope.clientName = data.clientName;
                    }
                    if (data.group) {
                        scope.groupName = data.group.name;
                    }
                    getCreditbureauLoanProductData(scope.loandetails.loanProductId);
                });
            };

            function getCreditbureauLoanProductData(loanProductId) {
                resourceFactory.loanProductResource.getCreditbureauLoanProducts({
                    loanProductId: loanProductId,
                    associations: 'creditBureaus'
                }, function (data) {
                    scope.creditbureauLoanProduct = data;
                });
            };

            scope.loanProductChange = function (loanProductId) {
                scope.inparams = {resourceType: 'template', activeOnly: 'true'};
                if (scope.formData.clientId && scope.formData.groupId) {
                    scope.inparams.templateType = 'jlg';
                } else if (scope.formData.groupId) {
                    scope.inparams.templateType = 'group';
                } else if (scope.formData.clientId) {
                    scope.inparams.templateType = 'individual';
                }
                if (scope.formData.clientId) {
                    scope.inparams.clientId = scope.formData.clientId;
                }
                if (scope.formData.groupId) {
                    scope.inparams.groupId = scope.formData.groupId;
                }
                scope.inparams.staffInSelectedOfficeOnly = true;
                scope.inparams.productId = loanProductId;
                resourceFactory.loanResource.get(scope.inparams, function (data) {
                    scope.loanaccountinfo = data;
                    if (data.clientName) {
                        scope.clientName = data.clientName;
                    }
                    if (data.group) {
                        scope.groupName = data.group.name;
                    }
                });
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
                                            summaty.totalOutstandingAmount += existingLoan.currentOutstanding;
                                            summaty.totalEMIAmount += existingLoan.installmentAmount;
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
                                        summaty.noOfActiveLoans = 1;
                                        summaty.totalOutstandingAmount = existingLoan.currentOutstanding;
                                        summaty.totalEMIAmount = existingLoan.installmentAmount;
                                        summaty.disbursalDate = existingLoan.disbursedDate;
                                        summaty.totalOverDueAmount = existingLoan.amtOverdue;
                                        scope.activeLoan.summaries.push(summaty);
                                    }
                                    scope.activeLoan.totalSummary.noOfActiveLoans += 1;
                                    scope.activeLoan.totalSummary.totalOutstandingAmount += existingLoan.currentOutstanding;
                                    scope.activeLoan.totalSummary.totalEMIAmount += existingLoan.installmentAmount;
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

            scope.isReportPresent = false;
            function constructLoanSummary() {
                if (!_.isUndefined(scope.activeLoan)) {
                    delete scope.activeLoan;
                }
                if (!_.isUndefined(scope.closedLoan)) {
                    delete scope.closedLoan;
                }
                constructActiveLoanSummary();
                constructClosedLoanSummary();
            };

            resourceFactory.creditBureauReportSummaryResource.get({
                entityType: scope.entityType,
                entityId: scope.entityId
            }, function (loansSummary) {
                scope.loansSummary = loansSummary;
                if (scope.loanId) {
                    if (scope.loansSummary.loanId == scope.loanId) {
                        scope.isResponPresent = true;
                    }
                } else {
                    scope.isResponPresent = true;
                }
                resourceFactory.clientExistingLoan.getAll({clientId: scope.formData.clientId}, function (data) {
                    scope.existingLoans = data;
                    constructLoanSummary();
                });
            });

            scope.creditBureauReport = function () {
                resourceFactory.creditBureauReportResource.get({
                    entityType: scope.entityType,
                    entityId: scope.entityId
                }, function (loansSummary) {
                    scope.loansSummary = loansSummary;
                    scope.isResponPresent = true;
                    resourceFactory.clientExistingLoan.getAll({clientId: scope.formData.clientId}, function (data) {
                        scope.existingLoans = data;
                        constructLoanSummary();
                    });
                });
            };

            scope.creditBureauReportView = function () {
                resourceFactory.creditBureauReportFileContentResource.get({
                    entityType: scope.entityType,
                    entityId: scope.entityId
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
                    }
                });
            };

            scope.convertByteToString = function (content, status) {
                var result = "";
                if (content != undefined && content != null) {
                    for (var i = 0; i < content.length; ++i) {
                        result += (String.fromCharCode(content[i]));
                    }
                }
                if (status) {
                    var jsonObj = ngXml2json.parser(result);

                    if (jsonObj.indvreportfile) {
                        if (jsonObj.indvreportfile.inquirystatus.inquiry.errors.error.lenght > 1) {
                            scope.errorMessage = jsonObj.indvreportfile.inquirystatus.inquiry.errors.error
                        } else {
                            scope.errorMessage = jsonObj.indvreportfile.inquirystatus.inquiry.errors.error.description;
                            scope.cbLoanEnqResponseError = true;
                        }
                    } else {
                        if (jsonObj.reportfile.inquirystatus.inquiry.errors.error.length > 1) {
                            scope.errorMessage = jsonObj.reportfile.inquirystatus.inquiry.errors.error;
                        } else {
                            scope.errorMessage = jsonObj.reportfile.inquirystatus.inquiry.errors.error.description;
                            scope.cbResponseError = true;
                        }

                    }
                    return scope.errorMessage;
                }
                return result;
            };

            scope.proceedToNext = function () {
                resourceFactory.loanApplicationReferencesResource.update({loanApplicationReferenceId: scope.loanApplicationReferenceId,command: 'requestforapproval'},{}, function (data) {
                    scope.$emit("activityDone",{});
                });
            };

            scope.rejectApprovalLoanAppRef = function () {
                resourceFactory.loanApplicationReferencesResource.update({
                    loanApplicationReferenceId: scope.loanApplicationReferenceId,
                    command: 'reject'
                }, {}, function (data) {
                    location.path('/viewclient/' + scope.formData.clientId);
                });
            };
        }
    });
    mifosX.ng.application.controller('creditbureauActivityController', ['$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter','ngXml2json', mifosX.controllers.creditbureauActivityController]).run(function ($log) {
        $log.info("creditbureauActivityController initialized");
    });
}(mifosX.controllers || {}));