(function (module) {
    mifosX.controllers = _.extend(module, {

        CreditBureauReportController: function (scope, routeParams, $modal, resourceFactory, location, dateFilter, ngXml2json,route,API_VERSION, $rootScope) {

            scope.isResponPresent = false;
            scope.viewCreditBureauReport = false;
            scope.errorMessage = [];
            scope.cbResponseError = false;
            scope.entityType = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            scope.trancheDisbursalId = routeParams.trancheDisbursalId;
            scope.clientId = routeParams.clientId;
            scope.reportEntityType = "CreditBureau";
            scope.url =API_VERSION +'/enquiry/creditbureau'+ '/' +  scope.entityType + '/' +  scope.entityId +'/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
            if (scope.entityType === 'loanapplication') {
                scope.loanApplicationReferenceId = scope.entityId;
                getLoanApplicationData();
            } else if (scope.entityType === 'loan') {
                scope.loanId = scope.entityId;
                getLoanData();
            }
            scope.isStalePeriodExceeded = false;

            function getLoanApplicationData() {
                resourceFactory.loanApplicationReferencesResource.getByLoanAppId({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (data) {
                    scope.formData = data;
                    if(scope.formData.loanId){
                        resourceFactory.LoanAccountResource.getLoanAccountDetails({
                            loanId: scope.formData.loanId,
                            associations: 'all,hierarchyLookup',
                            exclude: 'guarantors'
                        }, function (loandetails) {
                            if(loandetails.status.id == 200){
                                scope.loandetails = loandetails;
                            }
                        });
                    }
                    scope.isStalePeriodExceeded = data.isStalePeriodExceeded;
                    scope.loanProductChange(scope.formData.loanProductId);
                    getCreditbureauLoanProductData(scope.formData.loanProductId);
                });
            };

            function getLoanData() {
                resourceFactory.LoanAccountResource.getLoanAccountDetails({
                    loanId: scope.loanId,
                    associations: 'all,hierarchyLookup',
                    exclude: 'guarantors'
                }, function (data) {
                    scope.loandetails = data;
                    scope.formData = data;
                    if (data.clientName) {
                        scope.clientName = data.clientName;
                    }
                    if (data.group) {
                        scope.groupName = data.group.name;
                    }
                    getCreditbureauLoanProductData(data.loanProductId);
                });
            };

            function getCreditbureauLoanProductData(loanProductId) {
                resourceFactory.loanProductResource.getCreditbureauLoanProducts({
                    loanProductId: loanProductId,
                    associations: 'creditBureaus',
                    clientId: scope.clientId
                }, function (data) {
                    scope.creditbureauLoanProduct = data;
                    getCreditBureauReportSummary();
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
                findcustomerSinceFromEachMFI();
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

            function getCreditBureauReportSummary() {
                
                resourceFactory.creditBureauEnquiriesResource.getAll({
                        entityType: scope.entityType,
                        entityId: scope.entityId
                    }, function (data) {
                        scope.creditBureauEnquiries = data;
                        if(scope.creditBureauEnquiries && scope.creditBureauEnquiries.length > 0){
                            scope.creditBureauEnquiry = scope.creditBureauEnquiries[0];
                            if(scope.creditBureauEnquiry){
                                if (scope.creditBureauEnquiry.status) {
                                    scope.isResponPresent = true;
                                }
                                convertByteToString();
                                resourceFactory.clientCreditSummary.getAll({
                                    clientId: scope.formData.clientId,
                                    loanApplicationId: scope.loanApplicationReferenceId,
                                    loanId: scope.loanId,
                                    trancheDisbursalId: scope.trancheDisbursalId
                                }, function (data) {
                                    scope.existingLoans = data.existingLoans;
                                    scope.creditScores = data.creditScores ;
                                    constructLoanSummary();
                                });
                            }
                           
                        }
                });
            };

            scope.cBStatus = function () {
                var status = undefined;
                if (scope.creditBureauEnquiry && scope.creditBureauEnquiry.status && scope.creditBureauEnquiry.status.value) {
                    status = scope.creditBureauEnquiry.status.value;
                }
                return status;
            };

            scope.creditBureauReport = function () {
                resourceFactory.creditBureauReportResource.get({
                    entityType: scope.entityType,
                    entityId: scope.entityId
                }, function (loansSummary) {
                    scope.isResponPresent = false;
                    scope.isStalePeriodExceeded = false;
                    getCreditBureauReportSummary();
                });
            };

            function convertByteToString(content, status) {
                scope.errorMessage = undefined;
                var status = scope.cBStatus();
                if (status) {
                    scope.errorMessage = scope.creditBureauEnquiry.errors ;
                }
                return scope.errorMessage;
            };

            scope.proceedToNext = function () {
                if (scope.loandetails && (scope.loanId || scope.formData.loanId)) {
                    scope.canForceDisburse = false;
                    if(_.isUndefined(scope.loanId) && scope.loandetails.status.id == 200){
                        scope.loanId = scope.formData.loanId;
                        scope.enableClientVerification = scope.isSystemGlobalConfigurationEnabled('client-verification');
                        if(scope.enableClientVerification && scope.loandetails.clientData && !scope.loandetails.clientData.isVerified){
                            scope.canForceDisburse = true;
                        }
                    }
                    if (!_.isUndefined(scope.loandetails.flatInterestRate) && scope.loandetails.flatInterestRate != null) {
                        location.path('/loanaccount/' + scope.loanId + '/disburse/type/flatinterest');
                    }else if(scope.canForceDisburse) {
                        location.path('/loanaccount/' + scope.loanId + '/forcedisburse');
                    }else {
                        location.path('/loanaccount/' + scope.loanId + '/disburse');
                    }
                } else {
                    resourceFactory.loanApplicationReferencesResource.update({
                        loanApplicationReferenceId: scope.loanApplicationReferenceId,
                        command: 'requestforapproval'
                    }, {}, function (data) {
                        location.path('/viewclient/' + scope.formData.clientId);
                    });
                }
            };

            scope.rejectApprovalLoanAppRef = function () {
                resourceFactory.loanApplicationReferencesResource.update({
                    loanApplicationReferenceId: scope.loanApplicationReferenceId,
                    command: 'reject'
                }, {}, function (data) {

                    location.path('/viewclient/' + scope.formData.clientId);
                });
            };

            scope.refreshCreditBureauReport = function () {
                resourceFactory.fetchCreditBureauReportByEnquiryIdResource.get({
                    enquiryId: scope.creditBureauEnquiry.id
                }, function (data) {
                    route.reload();
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

    mifosX.ng.application.controller('CreditBureauReportController', ['$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter', 'ngXml2json','$route','API_VERSION','$rootScope', mifosX.controllers.CreditBureauReportController]).run(function ($log) {
        $log.info("CreditBureauReportController initialized");
    });
}(mifosX.controllers || {}));