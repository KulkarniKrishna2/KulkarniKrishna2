(function (module) {
    mifosX.controllers = _.extend(module, {
        creditbureauActivityController: function ($controller, scope, routeParams, $modal, resourceFactory, location, dateFilter, ngXml2json, route, $http, $rootScope, $sce, commonUtilService) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.onFileSelect = function ($files) {
                scope.file = $files[0];
            };
            function initTask() {
                scope.clientId = scope.taskconfig['clientId'];
                scope.loanApplicationReferenceId = scope.taskconfig['loanApplicationId'];
            };
            initTask();
            scope.viewCreditBureauReport = false;
            scope.errorMessage = [];
            scope.cbResponseError = false;
            scope.cbLoanEnqResponseError = false;
            scope.entityType = "loanapplication";
            scope.entityId = scope.loanApplicationReferenceId;
            scope.trancheDisbursalId = routeParams.trancheDisbursalId;
            scope.cbStatusPending="PENDING";
            scope.cbStatusSuccess="SUCCESS";
            scope.cbStatusError="ERROR";
            scope.reportEntityType = "CreditBureau";
            scope.isStalePeriodExceeded = false;

            getCreditBureauReportSummary();

            function constructActiveLoanSummary() {
                if (scope.existingLoans) {
                    for (var i in scope.existingLoans) {
                        var existingLoan = scope.existingLoans[i];
                        var isValidData = false;
                        if (existingLoan.source && existingLoan.source.name === 'Credit Bureau') {
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
                                    scope.activeLoan.totalSummary.totalDpd = 0;
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
                                            summaty.totalDpd = summaty.totalDpd+","+existingLoan.dpd;
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
                                        summaty.lenderType = existingLoan.lenderType;
                                        summaty.totalDpd = existingLoan.dpd;
                                        summaty.cbMemberId = existingLoan.cbMemberId
                                        summaty.existingClient = false;
                                        if(scope.isOwnInstituteConfEnable && existingLoan.lenderName === scope.ownInstituteName){
                                            summaty.existingClient = true;
                                        }
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
                if(existingLoan.loanTenurePeriodType !=  undefined){
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
                }else{
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
                        if (existingLoan.source && existingLoan.source.name === 'Credit Bureau') {
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
                                            summaty.lenderType = existingLoan.lenderType;
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
                                        summaty.lenderType = existingLoan.lenderType;
                                        summaty.dpd = existingLoan.dpd;
                                        summaty.cbMemberId = existingLoan.cbMemberId;
                                        summaty.existingClient = false;
                                        if(scope.isOwnInstituteConfEnable && existingLoan.lenderName === scope.ownInstituteName){
                                            summaty.existingClient = true;
                                        }
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
                            if(scope.creditBureauEnquiry.errors){
                               scope.errorMessage = scope.creditBureauEnquiry.errors;
                            }

                            if(scope.creditBureauEnquiry.isStalePeriodExceeded != undefined){
                                scope.isStalePeriodExceeded = scope.creditBureauEnquiry.isStalePeriodExceeded;
                             }
                             
                            if(scope.creditBureauEnquiry.creditBureauProduct){
                               getCreditbureauLoanProductData(scope.creditBureauEnquiry.creditBureauProduct.id);
                            }
                      
                            resourceFactory.clientCreditSummary.getAll({
                                clientId: scope.formData.clientId,
                                enquiryId: scope.creditBureauEnquiry.id
                            }, function (data) {
                                scope.existingLoans = data.existingLoans;
                                scope.creditScores = data.creditScores ;
                                constructLoanSummary();
                            });
                         }

                    }

                });
            };

            scope.creditBureauReport = function (isForce) {
                if (!scope.isStalePeriodExceeded && isForce) {
                    $modal.open({
                        templateUrl: 'creditBureauReport.html',
                        controller: CreditBureauReportCtrl,
                        resolve: {
                            isForce: function () {
                                return isForce;
                            }
                        }
                    });
                }
                else {
                    resourceFactory.creditBureauReportResource.get({
                        entityType: scope.entityType,
                        entityId: scope.entityId,
                        isForce: isForce
                    }, function (loansSummary) {
                        scope.loansSummary = loansSummary;
                        if (scope.loansSummary && scope.loansSummary.cbStatus) {
                            scope.isResponPresent = true;
                        }
                        getCreditBureauReportSummary();
                    });
                };
            }

            var CreditBureauReportCtrl = function ($scope, $modalInstance, isForce) {
                $scope.creditBureauReport = function () {
                    resourceFactory.creditBureauReportResource.get({
                        entityType: scope.entityType,
                        entityId: scope.entityId,
                        isForce: isForce
                    }, function (loansSummary) {
                        $modalInstance.close('creditBureauReport');
                        scope.loansSummary = loansSummary;
                        if (scope.loansSummary && scope.loansSummary.cbStatus) {
                            scope.isResponPresent = true;
                        }
                        getCreditBureauReportSummary();
                    });
                }
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }

            scope.proceedToNext = function () {
                resourceFactory.loanApplicationReferencesResource.update({
                    loanApplicationReferenceId: scope.loanApplicationReferenceId,
                    command: 'requestforapproval'
                }, {}, function (data) {
                    scope.$emit("activityDone", {});
                });
            };
            
            scope.cBStatus = function () {
                var status = undefined;
                if (scope.creditBureauEnquiry && scope.creditBureauEnquiry.status && scope.creditBureauEnquiry.status.value) {
                    status = scope.creditBureauEnquiry.status.value;
                }
                return status;
            };

            scope.rejectApprovalLoanAppRef = function () {
                resourceFactory.loanApplicationReferencesResource.update({
                    loanApplicationReferenceId: scope.loanApplicationReferenceId,
                    command: 'reject'
                }, {}, function (data) {
                    location.path('/viewclient/' + scope.formData.clientId);
                });
            };

            function getCreditbureauLoanProductData(loanProductId) {
                resourceFactory.loanProductResource.getCreditbureauLoanProducts({
                    loanProductId: loanProductId,
                    associations: 'creditBureaus',
                    clientId: scope.clientId
                }, function (data) {
                    scope.creditbureauLoanProduct = data;
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

             scope.openViewDocument = function(enquiryId, reportEntityType) {
                var url = $rootScope.hostUrl + '/fineract-provider/api/v1/enquiry/creditbureau/' + reportEntityType + '/' +
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
        }
    });
    mifosX.ng.application.controller('creditbureauActivityController', ['$controller','$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter', 'ngXml2json','$route','$http', '$rootScope', '$sce', 'CommonUtilService', mifosX.controllers.creditbureauActivityController]).run(function ($log) {
        $log.info("creditbureauActivityController initialized");
    });
}(mifosX.controllers || {}));