(function(module) {
    mifosX.controllers = _.extend(module, {
        groupLoanDisbursalActivityController: function($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            angular.extend(this, $controller('defaultActivityController', {
                $scope: scope
            }));
            scope.groupId = scope.taskconfig['groupId'];
            scope.disburseForm = false;
            scope.showLoans = true;
            scope.canForceDisburse = false;
            scope.enableClientVerification = scope.isSystemGlobalConfigurationEnabled('client-verification');
            scope.commandParam = 'disburse';
            scope.taskStatus = scope.taskconfig.status.value;
            scope.changeLoanEMIPack=false;
            scope.showEmiDetailsInDisbursement = !scope.response.uiDisplayConfigurations.workflow.loanDisbusal.hiddenField.showEmipack;
            scope.isAmountReadOnly = scope.response.uiDisplayConfigurations.workflow.loanDisbusal.isReadOnlyField.transactionAmount;
            scope.isFixedEmiReadOnly = scope.response.uiDisplayConfigurations.workflow.loanDisbusal.isReadOnlyField.fixedEmiAmount;
            scope.showClosedLoanApplicationInGroupActivity = true;
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.workflow){
                scope.showClosedLoanApplicationInGroupActivity = scope.response.uiDisplayConfigurations.workflow.showClosedLoanApplicationInGroupActivity;
            }

            function populateDetails() {
                if(scope.taskStatus != undefined && scope.taskStatus != 'completed'){
                    resourceFactory.groupResource.get({
                    groupId: scope.groupId,
                    associations: 'clientMembers'
                    }, function(data) {
                        scope.group = data;
                        scope.loanApplications = [];
                        if (data.clientMembers) {
                            scope.allMembers = data.clientMembers;
                            angular.forEach(scope.group.clientMembers, function(client) {
                                resourceFactory.loanApplicationReferencesForGroupResource.get({
                                    groupId: scope.groupId,
                                    clientId: client.id
                                }, function(data1) {
                                    if (data1.length > 0) {
                                        angular.forEach(data1, function(loanApplication) {
                                            var showLoan = scope.showClosedLoanApplicationInGroupActivity ? true: !["loanApplication.rejected", "loanApplication.cb.rejected"].includes(loanApplication.status.code);
                                            if(showLoan){
                                                loanApplication.statusInReadableFormat = getApplicationStatus(loanApplication.status.value);
                                                scope.loanApplications.push(loanApplication);
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    });
                }
            };

            function getApplicationStatus(value) {
                if(value == 'APPLICATION_CREATED') {
                    return 'Submitted';
                } else if(value == 'APPLICATION_IN_APPROVE_STAGE') {
                    return 'Approval pending';
                }else if(value == 'CB_APPROVED') {
                    return 'CB Approved';
                }else if(value == 'APPLICATION_APPROVED') {
                    return 'Approved';
                }else if(value == 'APPLICATION_ACTIVE') {
                    return 'Disbursed';
                }else if(value == 'APPLICATION_REJECTED') {
                    return 'Rejected';
                }else if(value == 'CB_REJECTED') {
                    return 'CB Rejected';
                }
            }

            populateDetails();

            scope.disburseLoan = function(loanApplicationReferenceId) {
                scope.setTaskActionExecutionError("");
                scope.showLoans = false;
                scope.disburseForm = true;
                scope.issubmitted = false;
                scope.catureFP = false;
                scope.loanApplicationReferenceId = loanApplicationReferenceId;
                scope.restrictDate = new Date();

                scope.formRequestData = {};

                scope.formRequestData.submitApplication = {};
                scope.formRequestData.submitApplication.disbursementData = [];

                scope.formRequestData.approve = {};

                scope.formRequestData.disburse = {};
                scope.formRequestData.disburse.actualDisbursementDate = dateFilter(new Date(scope.restrictDate), scope.df);

                scope.showPaymentDetails = false;

                scope.date = {};
                scope.formData = {};
                var curIndex = 0;

                //2F Authentication
                scope.catureFP = false;

                resourceFactory.loanApplicationReferencesTemplateResource.get({
                    loanApplicationReferenceId: scope.loanApplicationReferenceId
                }, function(data) {
                    scope.paymentTypes = data.paymentOptions;
                    scope.transactionAuthenticationOptions = data.transactionAuthenticationOptions;
                });

                resourceFactory.loanApplicationReferencesResource.getByLoanAppId({
                    loanApplicationReferenceId: scope.loanApplicationReferenceId
                }, function(data) {
                    scope.formData = data;
                    if(data.expectedDisbursalPaymentType) {
                        scope.formRequestData.disburse.paymentTypeId = data.expectedDisbursalPaymentType.id;
                    }
                    resourceFactory.loanApplicationReferencesResource.getChargesByLoanAppId({
                        loanApplicationReferenceId: scope.loanApplicationReferenceId,
                        command: 'loanapplicationcharges'
                    }, function(loanAppChargeData) {
                        scope.loanAppChargeData = loanAppChargeData;
                        for (var i = 0; i < scope.loanAppChargeData.length; i++) {
                            if (scope.loanAppChargeData[i].chargeId) {
                                scope.constructExistingCharges(i, scope.loanAppChargeData[i].chargeId);
                            } else {
                                curIndex++;
                            }
                        }
                    });

                    if (scope.formData.status.id > 200) {
                        resourceFactory.loanApplicationReferencesResource.getByLoanAppId({
                            loanApplicationReferenceId: scope.loanApplicationReferenceId,
                            command: 'approveddata'
                        }, function(data) {
                            scope.formData.approvedData = {};
                            scope.formData.approvedData = data;
                            scope.date.expectedDisbursementDate = dateFilter(new Date(scope.formData.approvedData.expectedDisbursementDate), scope.df);
                            if (scope.formData.approvedData.repaymentsStartingFromDate) {
                                scope.date.repaymentsStartingFromDate = dateFilter(new Date(scope.formData.approvedData.repaymentsStartingFromDate), scope.df);
                            }
                            if(scope.formData.approvedData.loanEMIPackData){
                                scope.formRequestData.submitApplication.loanEMIPackId = scope.formData.approvedData.loanEMIPackData.id;
                                scope.formRequestData.disburse.loanEMIPackId = scope.formData.approvedData.loanEMIPackData.id;         
                            }
                            if (scope.formData.noOfTranche > 0) {
                                for (var j in scope.formData.approvedData.loanApplicationSanctionTrancheDatas) {
                                    if (scope.formData.approvedData.loanApplicationSanctionTrancheDatas[j].expectedTrancheDisbursementDate) {
                                        var disbursementData = {};
                                        disbursementData.expectedDisbursementDate = dateFilter(new Date(scope.formData.approvedData.loanApplicationSanctionTrancheDatas[j].expectedTrancheDisbursementDate), scope.df);
                                        disbursementData.principal = scope.formData.approvedData.loanApplicationSanctionTrancheDatas[j].trancheAmount;
                                        disbursementData.discountOnDisbursalAmount = scope.formData.approvedData.loanApplicationSanctionTrancheDatas[j].discountOnDisbursalAmount;
                                        scope.formRequestData.submitApplication.disbursementData.push(disbursementData);
                                        if (scope.formRequestData.disburse.transactionAmount == undefined) {
                                            scope.formRequestData.disburse.transactionAmount = disbursementData.principal;
                                            if(disbursementData.discountOnDisbursalAmount){
                                                scope.formRequestData.disburse.discountOnDisbursalAmount = disbursementData.discountOnDisbursalAmount;
                                                scope.formRequestData.submitApplication.discountOnDisbursalAmount = disbursementData.discountOnDisbursalAmount ;
                                            }
                                        }
                                    }
                                }
                                scope.formRequestData.disburse.disbursementData = angular.copy(scope.formRequestData.submitApplication.disbursementData); 
                            } else {
                                if (scope.formRequestData.disburse.transactionAmount == undefined) {
                                    scope.formRequestData.disburse.transactionAmount = scope.formData.approvedData.loanAmountApproved;
                                }
                                if(scope.formData.approvedData.discountOnDisbursalAmount){
                                    scope.formRequestData.disburse.discountOnDisbursalAmount = scope.formData.approvedData.discountOnDisbursalAmount;
                                    scope.formRequestData.submitApplication.discountOnDisbursalAmount = scope.formData.approvedData.discountOnDisbursalAmount;
                                }
                            }
                            if (scope.formData.fixedEmiAmount && !_.isUndefined(scope.formData.approvedData.fixedEmiAmount)) {
                                scope.formRequestData.disburse.fixedEmiAmount = scope.formData.approvedData.fixedEmiAmount;
                            }
                            if(scope.formData.approvedData.amountForUpfrontCollection){
                                scope.formRequestData.submitApplication.amountForUpfrontCollection = scope.formData.approvedData.amountForUpfrontCollection;
                            }
                            scope.loanProductChange(scope.formData.loanProductId);
                        });
                    };
                });
            };
            scope.loanProductChange = function(loanProductId) {
                scope.inparams = {
                    resourceType: 'template',
                    activeOnly: 'true'
                };
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

                resourceFactory.loanResource.get(scope.inparams, function(data) {
                    scope.loanaccountinfo = data;
                    if (data.clientName) {
                        scope.clientName = data.clientName;
                        if(!data.isClientVerified && scope.enableClientVerification){
                            scope.canForceDisburse = true;
                        }
                    }
                    if (data.group) {
                        scope.groupName = data.group.name;
                    }

                    if (scope.loanaccountinfo.calendarOptions) {
                        scope.syncRepaymentsWithMeeting = true;
                        if (scope.response && !scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.syncDisbursementWithMeeting) {
                            scope.formRequestData.submitApplication.syncDisbursementWithMeeting = false;
                        } else {
                            scope.formRequestData.submitApplication.syncDisbursementWithMeeting = true;
                        }
                    }

                    scope.formRequestData.submitApplication.clientId = scope.formData.clientId;
                    if (scope.formData.groupId) {
                        scope.formRequestData.submitApplication.groupId = scope.formData.groupId;
                    }

                    scope.formRequestData.submitApplication.productId = scope.formData.loanProductId;
                    scope.formRequestData.submitApplication.loanOfficerId = scope.formData.loanOfficerId;
                    scope.formRequestData.submitApplication.loanPurposeId = scope.formData.loanPurposeId;
                    scope.formRequestData.submitApplication.principal = scope.formData.approvedData.loanAmountApproved;
                    scope.formRequestData.submitApplication.loanTermFrequency = scope.formData.approvedData.termFrequency;
                    scope.formRequestData.submitApplication.loanTermFrequencyType = scope.formData.approvedData.termPeriodFrequency.id;
                    scope.formRequestData.submitApplication.numberOfRepayments = scope.formData.approvedData.numberOfRepayments;
                    scope.formRequestData.submitApplication.repaymentEvery = scope.formData.approvedData.repayEvery;
                    scope.formRequestData.submitApplication.repaymentFrequencyType = scope.formData.approvedData.repaymentPeriodFrequency.id;
                    if (scope.formData.approvedData.fixedEmiAmount) {
                        scope.formRequestData.submitApplication.fixedEmiAmount = scope.formData.approvedData.fixedEmiAmount;
                    }
                    if (scope.formData.approvedData.maxOutstandingLoanBalance) {
                        scope.formRequestData.submitApplication.maxOutstandingLoanBalance = scope.formData.approvedData.maxOutstandingLoanBalance;
                    }
                    scope.formRequestData.submitApplication.fundId = scope.loanaccountinfo.fundId;
                    scope.formRequestData.submitApplication.interestRatePerPeriod = scope.loanaccountinfo.interestRatePerPeriod;
                    scope.formRequestData.submitApplication.amortizationType = scope.loanaccountinfo.amortizationType.id;
                    scope.formRequestData.submitApplication.interestType = scope.loanaccountinfo.interestType.id;
                    scope.formRequestData.submitApplication.interestCalculationPeriodType = scope.loanaccountinfo.interestCalculationPeriodType.id;
                    scope.formRequestData.submitApplication.allowPartialPeriodInterestCalcualtion = scope.loanaccountinfo.allowPartialPeriodInterestCalcualtion;
                    scope.formRequestData.submitApplication.inArrearsTolerance = scope.loanaccountinfo.inArrearsTolerance;
                    scope.formRequestData.submitApplication.graceOnPrincipalPayment = scope.loanaccountinfo.graceOnPrincipalPayment;
                    scope.formRequestData.submitApplication.graceOnInterestPayment = scope.loanaccountinfo.graceOnInterestPayment;
                    scope.formRequestData.submitApplication.graceOnArrearsAgeing = scope.loanaccountinfo.graceOnArrearsAgeing;
                    scope.formRequestData.submitApplication.transactionProcessingStrategyId = scope.loanaccountinfo.transactionProcessingStrategyId;
                    scope.formRequestData.submitApplication.graceOnInterestCharged = scope.loanaccountinfo.graceOnInterestCharged;

                    if (scope.loanaccountinfo.isInterestRecalculationEnabled && scope.loanaccountinfo.interestRecalculationData.recalculationRestFrequencyDate) {
                        scope.date.recalculationRestFrequencyDate = new Date(scope.loanaccountinfo.interestRecalculationData.recalculationRestFrequencyDate);
                    }
                    if (scope.loanaccountinfo.isInterestRecalculationEnabled && scope.loanaccountinfo.interestRecalculationData.recalculationCompoundingFrequencyDate) {
                        scope.date.recalculationCompoundingFrequencyDate = new Date(scope.loanaccountinfo.interestRecalculationData.recalculationCompoundingFrequencyDate);
                    }

                    if (scope.loanaccountinfo.isLoanProductLinkedToFloatingRate) {
                        scope.formRequestData.submitApplication.isFloatingInterestRate = false;
                    }
                    scope.fetchBankAccountDetails();
                });
            };

            scope.fetchBankAccountDetails = function () {
                resourceFactory.bankAccountDetailsResource.getAll({
                    entityType: "clients",
                    entityId: scope.formData.clientId,
                    status: "active"
                }, function (data) {
                    scope.bankAccountDetails = data;
                });
            }
            
            scope.requestApprovalLoanAppRef = function() {
                resourceFactory.loanApplicationReferencesResource.update({
                    loanApplicationReferenceId: scope.loanApplicationReferenceId,
                    command: 'requestforapproval'
                }, {}, function(data) {
                    location.path('/viewclient/' + scope.formData.clientId);
                });
            };

            scope.charges = [];
            scope.constructExistingCharges = function(index, chargeId) {
                scope.charges = [];
                resourceFactory.chargeResource.get({
                    chargeId: chargeId,
                    template: 'true'
                }, function(data) {
                    data.chargeId = data.id;
                    scope.charges.push(data);
                    curIndex++;
                    if (curIndex == scope.loanAppChargeData.length) {
                        for (var i = 0; i < scope.charges.length; i++) {
                            for (var j = 0; j < scope.loanAppChargeData.length; j++) {
                                if (scope.charges[i].chargeId == scope.loanAppChargeData[j].chargeId) {
                                    scope.charges[i].loanAppChargeId = scope.loanAppChargeData[j].loanAppChargeId;
                                    scope.charges[i].loanApplicationReferenceId = scope.loanAppChargeData[j].loanApplicationReferenceId;
                                    scope.charges[i].dueDate = scope.loanAppChargeData[j].dueDate;
                                    scope.charges[i].amount = scope.loanAppChargeData[j].amount;
                                }
                            }
                        }
                    }
                });
            };

            scope.syncRepaymentsWithMeetingchange = function() {
                if (!scope.syncRepaymentsWithMeeting) {
                    scope.formRequestData.submitApplication.syncDisbursementWithMeeting = false;
                }
            };

            scope.syncDisbursementWithMeetingchange = function() {
                if (scope.formRequestData.submitApplication.syncDisbursementWithMeeting) {
                    scope.syncRepaymentsWithMeeting = true;
                }
            };

            scope.previewRepayments = function(isDisplayData) {
                scope.formRequestPreveieData = angular.copy(scope.formRequestData.submitApplication);
                if (scope.charges.length > 0) {
                    scope.formRequestPreveieData.charges = [];
                    for (var i in scope.charges) {
                        var chargeData = {};
                        chargeData.chargeId = scope.charges[i].chargeId;
                        chargeData.amount = scope.charges[i].amount;
                        if (scope.charges[i].dueDate) {
                            chargeData.dueDate = dateFilter(new Date(scope.charges[i].dueDate), scope.df);
                        }
                        scope.formRequestPreveieData.charges.push(chargeData);
                    }
                }

                if (scope.syncRepaymentsWithMeeting) {
                    scope.formRequestPreveieData.calendarId = scope.loanaccountinfo.calendarOptions[0].id;
                } else {
                    if (scope.formRequestPreveieData.calendarId) {
                        delete scope.formRequestPreveieData.calendarId;
                    }
                }
                
                if (this.date.interestChargedFromDate) {
                    scope.formRequestPreveieData.interestChargedFromDate = this.date.interestChargedFromDate;
                }
                if (this.date.repaymentsStartingFromDate) {
                    scope.formRequestPreveieData.repaymentsStartingFromDate = dateFilter(new Date(this.date.repaymentsStartingFromDate), scope.df);
                }

                if (this.formRequestData.disburse.fixedEmiAmount) {
                    scope.formRequestPreveieData.fixedEmiAmount = this.formRequestData.disburse.fixedEmiAmount;
                }

                scope.formRequestPreveieData.loanType = scope.inparams.templateType;
                scope.formRequestPreveieData.expectedDisbursementDate = dateFilter(new Date(scope.formData.approvedData.expectedDisbursementDate), scope.df);
                scope.formRequestPreveieData.submittedOnDate = dateFilter(new Date(scope.formData.submittedOnDate), scope.df);
                scope.formRequestPreveieData.locale = scope.optlang.code;
                scope.formRequestPreveieData.dateFormat = scope.df;
                if (scope.formRequestPreveieData.interestCalculationPeriodType == 0) {
                    scope.formRequestPreveieData.allowPartialPeriodInterestCalcualtion = false;
                }
                if (scope.formRequestData.disburse.actualDisbursementDate) {
                    scope.formRequestPreveieData.expectedDisbursementDate = dateFilter(new Date(scope.formRequestData.disburse.actualDisbursementDate), scope.df);
                } else {
                    delete scope.formRequestPreveieData.expectedDisbursementDate;
                }
                scope.formRequestPreveieData.principal = scope.formData.approvedData.loanAmountApproved;
                scope.formRequestPreveieData.loanEMIPackId = this.formRequestData.disburse.loanEMIPackId;
                if (scope.formRequestPreveieData.disburse) {
                    delete scope.formRequestPreveieData.disburse;
                }

                if (scope.formRequestPreveieData.disbursementData) {
                    scope.formRequestPreveieData.disbursementData = [];
                    if (scope.formRequestData.disburse.disbursementData) {
                        for (var i = 0; i < scope.formRequestData.disburse.disbursementData.length; i++) {
                            var disbursementData = {};
                            if (i == 0) {
                                disbursementData.expectedDisbursementDate = dateFilter(new Date(scope.formRequestData.disburse.actualDisbursementDate), scope.df);
                                disbursementData.principal = scope.formRequestData.disburse.transactionAmount;
                            } else {
                                disbursementData.expectedDisbursementDate = dateFilter(new Date(scope.formRequestData.disburse.disbursementData[i].expectedDisbursementDate), scope.df);
                                disbursementData.principal = scope.formRequestData.disburse.disbursementData[i].principal;
                            }
                            scope.formRequestPreveieData.disbursementData.push(disbursementData);
                        }
                    }
                }
                if (isDisplayData) {
                    resourceFactory.loanResource.save({
                        command: 'calculateLoanSchedule'
                    }, scope.formRequestPreveieData, function(data) {
                        scope.repaymentscheduleinfo = data;
                    });
                }
            }

            scope.cancel = function(){
                scope.disburseForm = false;
                      scope.showLoans = true;
                     populateDetails();
            };

            scope.submit = function() {
                scope.issubmitted = true;
                scope.previewRepayments(false);
                if (scope.charges.length > 0) {
                    scope.formRequestData.submitApplication.charges = [];
                    for (var i in scope.charges) {
                        var chargeData = {};
                        chargeData.chargeId = scope.charges[i].chargeId;
                        chargeData.amount = scope.charges[i].amount;
                        if (scope.charges[i].dueDate) {
                            chargeData.dueDate = dateFilter(new Date(scope.charges[i].dueDate), scope.df);
                        }
                        scope.formRequestData.submitApplication.charges.push(chargeData);
                    }
                }

                if (scope.formRequestData.submitApplication.disbursementData != undefined && scope.formRequestData.submitApplication.disbursementData.length > 0) {
                    for (var i in scope.formRequestData.submitApplication.disbursementData) {
                        scope.formRequestData.submitApplication.disbursementData[i].expectedDisbursementDate = dateFilter(scope.formRequestData.submitApplication.disbursementData[i].expectedDisbursementDate, scope.df);
                    }
                } else {
                    delete scope.formRequestData.submitApplication.disbursementData;
                }

                if (scope.syncRepaymentsWithMeeting) {
                    this.formRequestData.submitApplication.calendarId = scope.loanaccountinfo.calendarOptions[0].id;
                }

                if (scope.response.uiDisplayConfigurations.loanAccount.isAutoPopulate.interestChargedFromDate) {
                    this.formRequestData.submitApplication.interestChargedFromDate = dateFilter(new Date(this.formRequestData.submitApplication.expectedDisbursementDate), scope.df);
                }
                if (scope.date.repaymentsStartingFromDate) {
                    this.formRequestData.submitApplication.repaymentsStartingFromDate = dateFilter(new Date(scope.date.repaymentsStartingFromDate), scope.df);
                }

                if (scope.date.recalculationRestFrequencyDate) {
                    var restFrequencyDate = dateFilter(scope.date.recalculationRestFrequencyDate, scope.df);
                    scope.formRequestData.submitApplication.recalculationRestFrequencyDate = restFrequencyDate;
                }
                if (scope.date.recalculationCompoundingFrequencyDate) {
                    var restFrequencyDate = dateFilter(scope.date.recalculationCompoundingFrequencyDate, scope.df);
                    scope.formRequestData.submitApplication.recalculationCompoundingFrequencyDate = restFrequencyDate;
                }
                if (this.formRequestData.submitApplication.interestCalculationPeriodType == 0) {
                    this.formRequestData.submitApplication.allowPartialPeriodInterestCalcualtion = false;
                }

                this.formRequestData.submitApplication.loanType = scope.inparams.templateType;
                this.formRequestData.submitApplication.expectedDisbursementDate = dateFilter(new Date(scope.date.expectedDisbursementDate), scope.df);
                this.formRequestData.submitApplication.submittedOnDate = dateFilter(new Date(scope.formData.submittedOnDate), scope.df);

                this.formRequestData.submitApplication.createStandingInstructionAtDisbursement = scope.formRequestData.createStandingInstructionAtDisbursement;

                this.formRequestData.submitApplication.locale = scope.optlang.code;
                this.formRequestData.submitApplication.dateFormat = scope.df;
                if (scope.formData.bankAccountDetailId) {
                    this.formRequestData.disburse.bankAccountDetailId = scope.formData.bankAccountDetailId;
                }

                if (this.formRequestData.disburse.actualDisbursementDate) {
                    this.formRequestData.disburse.actualDisbursementDate = dateFilter(new Date(this.formRequestData.disburse.actualDisbursementDate), scope.df)
                }
                this.formRequestData.disburse.locale = scope.optlang.code;
                this.formRequestData.disburse.dateFormat = scope.df;

                this.formRequestData.locale = scope.optlang.code;
                this.formRequestData.dateFormat = scope.df;

                if (scope.formData.expectedDisbursalPaymentType && scope.formData.expectedDisbursalPaymentType.name) {
                    this.formRequestData.expectedDisbursalPaymentType = scope.formData.expectedDisbursalPaymentType.id;
                }

                if (scope.formData.expectedRepaymentPaymentType && scope.formData.expectedRepaymentPaymentType.name) {
                    this.formRequestData.expectedRepaymentPaymentType = scope.formData.expectedRepaymentPaymentType.id;
                }
                if (!_.isUndefined(this.formRequestData.disburse.disbursementData) && this.formRequestData.disburse.disbursementData.length > 0) {
                    for (var i in  this.formRequestData.disburse.disbursementData) {
                        this.formRequestData.disburse.disbursementData[i].expectedDisbursementDate = dateFilter(this.formRequestData.disburse.disbursementData[i].expectedDisbursementDate, scope.df);
                    }
                }

                this.formRequestData.disburse.skipAuthenticationRule = true;

                scope.disburseData = {};
                angular.copy(scope.formRequestData, scope.disburseData);
                resourceFactory.loanApplicationReferencesResource.update({
                    loanApplicationReferenceId: scope.loanApplicationReferenceId,
                    command: scope.commandParam
                }, this.formRequestData, function(disburseData) {
                      scope.disburseForm = false;
                      scope.showLoans = true;
                     populateDetails();
                });
            };

            scope.report = false;
            scope.viewRepaymentDetails = function() {
                if (scope.repaymentscheduleinfo && scope.repaymentscheduleinfo.periods) {
                    resourceFactory.clientResource.get({
                        clientId: scope.formData.clientId
                    }, function(data) {
                        scope.clientData = data;
                    });
                    scope.repaymentData = [];
                    scope.disbursedData = [];
                    for (var i in scope.repaymentscheduleinfo.periods) {
                        if (scope.repaymentscheduleinfo.periods[i].period) {
                            scope.repaymentData.push(scope.repaymentscheduleinfo.periods[i]);
                        } else {
                            scope.disbursedData.push(scope.repaymentscheduleinfo.periods[i]);
                        }
                    }
                    scope.report = true;
                }
            };

            scope.printDiv = function(print) {
                var printContents = document.getElementById(print).innerHTML;
                var popupWin = window.open('', '_blank', 'width=300,height=300');
                popupWin.document.open();
                popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="styles/repaymentscheduleprintstyle.css" />' +
                    '</head><body onload="window.print()">' + 
                    printContents + '<br><br><table class="table"><tr><td width="210"><h4>Credit Officer</h4></td><td width="210"><h4>Branch Manager</h4></td><td><h4>Customer Signature</h4></td></tr></table></body></html>');
                popupWin.document.close();
            };

            scope.backToLoanDetails = function() {
                scope.report = false;
            }

            scope.doPreTaskActionStep = function(actionName) {
                if (actionName === 'activitycomplete') {
                    if (allLoansDisbursed()) {
                        scope.doActionAndRefresh(actionName);
                    } else {
                        scope.setTaskActionExecutionError("error.msg.all.loan.applications.are.not.disbursed");
                    }
                } else {
                    scope.doActionAndRefresh(actionName);
                }
            };

            function allLoansDisbursed() {
                var loanApplicationsDisbured = true;
                if (scope.loanApplications != undefined) {
                    scope.loanApplications.forEach(function(loanApplication) {
                        for (var i in loanApplication) {
                            if (!loanApplication.status.id > 300 ) {
                                loanApplicationsDisbured = false;
                                break;
                            }
                        }
                    });
                }
                return loanApplicationsDisbured;
            };

            scope.allowDisburse = function(){
                return (this.formData.status && this.formData.status.id === 300 && scope.loanaccountinfo);
            };

            scope.allowForceDisburse = function(){
                return (this.formData.status && this.formData.status.id === 300 && scope.canForceDisburse && scope.loanaccountinfo);
            };

            scope.forceDisburse = function () {
                scope.commandParam = 'forcedisburse';
                scope.submit(); 
            };

            scope.displayOnNoActiveLoanApplication = function(){
               return  ((scope.taskStatus != undefined && scope.taskStatus === 'completed') || (scope.loanApplications && scope.loanApplications.length <= 0));
            }

            scope.radioCheckUncheck = function () {
                if (this.formData.bankAccountDetailId) {
                    this.formData.bankAccountDetailId = null;
                }
            };

            scope.updateExpectedDateTrancheDetails = function(){
                if (scope.date.expectedDisbursementDate && scope.formRequestData.disburse.disbursementData.length > 0 && scope.loanEMIPack && scope.disbursalEMIs) {
                    if (scope.date.expectedDisbursementDate != '' && scope.date.expectedDisbursementDate != undefined) {
                        var dateValue = scope.date.expectedDisbursementDate;
                        var date = new Date(dateValue);
                        if (date.toString() != 'Invalid Date') {
                            var len = scope.formRequestData.disburse.disbursementData.length;
                            for(var i=0; i < len; i++){
                                        if(scope.loanEMIPack.repaymentFrequencyType.id === 0){
                                            date = date.setDate(date.getDate()+(parseInt(scope.loanEMIPack.repaymentEvery)*scope.disbursalEMIs[i]));
                                        }else if(scope.loanEMIPack.repaymentFrequencyType.id === 1){
                                            date = date.setDate(date.getDate()+(parseInt(scope.loanEMIPack.repaymentEvery)*7*scope.disbursalEMIs[i]));
                                        }else if(scope.loanEMIPack.repaymentFrequencyType.id === 2){
                                            date = date.setMonth(date.getMonth()+(parseInt(scope.loanEMIPack.repaymentEvery)*scope.disbursalEMIs[i]));
                                        }
                                if(!isNaN(date)){
                                    scope.formRequestData.disburse.disbursementData[i].expectedDisbursementDate = dateFilter(new Date(date), scope.df);
                                }
                                dateValue = scope.date.expectedDisbursementDate;
                                date = new Date(dateValue);
                            }
                        }
                    }
                }

            }

            scope.updateloanEmiPacks = function(){
                        if(scope.formRequestData.disburse.loanEMIPackId){
                        if (scope.loanaccountinfo) {
                        var len = scope.loanaccountinfo.loanEMIPacks.length;
                        scope.loanEMIPack = {};
                        for(var i=0; i < len; i++){
                            if(scope.loanaccountinfo.loanEMIPacks[i].id == scope.formRequestData.disburse.loanEMIPackId){
                                scope.loanEMIPack = scope.loanaccountinfo.loanEMIPacks[i];
                                break;
                            }
                        }
                        scope.formRequestData.disburse.transactionAmount = scope.loanEMIPack.sanctionAmount;
                        scope.formRequestData.disburse.fixedEmiAmount = scope.loanEMIPack.fixedEmi;
                        scope.disbursalEMIs = [0];
                         scope.formRequestData.disburse.disbursementData = [];
                        if(scope.loanEMIPack.disbursalAmount1){
                            scope.formRequestData.disburse.transactionAmount = scope.loanEMIPack.disbursalAmount1;
                            var loanApplicationSanctionTrancheDatas = {principal:scope.loanEMIPack.disbursalAmount1};
                            scope.formRequestData.disburse.disbursementData.push(loanApplicationSanctionTrancheDatas);
                        }
                        if(scope.loanEMIPack.disbursalAmount2){
                            var loanApplicationSanctionTrancheDatas = {principal:scope.loanEMIPack.disbursalAmount2};
                            scope.formRequestData.disburse.disbursementData.push(loanApplicationSanctionTrancheDatas);
                            scope.disbursalEMIs.push(scope.loanEMIPack.disbursalEmi2);
                        }
                        if(scope.loanEMIPack.disbursalAmount3){
                            var loanApplicationSanctionTrancheDatas = {principal:scope.loanEMIPack.disbursalAmount3};
                            scope.formRequestData.disburse.disbursementData.push(loanApplicationSanctionTrancheDatas);
                            scope.disbursalEMIs.push(scope.loanEMIPack.disbursalEmi3);
                        }
                        if(scope.loanEMIPack.disbursalAmount4){
                            var loanApplicationSanctionTrancheDatas = {principal:scope.loanEMIPack.disbursalAmount4};
                            scope.formRequestData.disburse.disbursementData.push(loanApplicationSanctionTrancheDatas);
                            scope.disbursalEMIs.push(scope.loanEMIPack.disbursalEmi4);
                        }
                        scope.updateExpectedDateTrancheDetails();
                        
                        }
                    
                        }
            }
            scope.showAddTranche = function(){
                if(scope.formRequestData.disburse.disbursementData){
                    return  scope.formRequestData.disburse.disbursementData.length < scope.formData.noOfTranche;
                }else if(scope.loanaccountinfo){
                    return scope.loanaccountinfo.product.multiDisburseLoan;
                }
            };

            scope.addTranches = function () {
                var loanApplicationSanctionTrancheDatas = {};
                if(!scope.formRequestData.disburse.disbursementData){
                  scope.formRequestData.disburse.disbursementData = [];
                }
                scope.formRequestData.disburse.disbursementData.push(loanApplicationSanctionTrancheDatas);
            };

            scope.deleteTranches = function (index) {
                scope.formRequestData.disburse.disbursementData.splice(index, 1);
            };

            scope.validateTransactionAmount = function(index){
                if(index == 0){
                   scope.formRequestData.disburse.transactionAmount =  scope.formRequestData.disburse.disbursementData[index].principal;
                }
            }

            scope.updateTrancheDate = function() {
                if (scope.formRequestData.disburse.loanEMIPackId) {
                    var loanEMIPackDetail = scope.formData.loanEMIPackData;
                    var disbursalEMIs = [0];
                    if (loanEMIPackDetail.disbursalAmount2) {
                        disbursalEMIs.push(loanEMIPackDetail.disbursalEmi2)
                    }
                    if (loanEMIPackDetail.disbursalAmount3) {
                        disbursalEMIs.push(loanEMIPackDetail.disbursalEmi3)
                    }
                    if (loanEMIPackDetail.disbursalAmount4) {
                        disbursalEMIs.push(loanEMIPackDetail.disbursalEmi4)
                    }
                    if (scope.formRequestData.disburse.disbursementData && scope.formRequestData.disburse.disbursementData.length > 0) {
                        if (scope.formRequestData.disburse.actualDisbursementDate && scope.formRequestData.disburse.actualDisbursementDate.toString() != 'Invalid Date') {
                            var date = new Date(scope.formRequestData.disburse.actualDisbursementDate);
                            var repaymentPeriodFrequencyEnum = loanEMIPackDetail.repaymentFrequencyType.id;
                            if (date.toString() != 'Invalid Date') {
                                var len = scope.formRequestData.disburse.disbursementData.length;
                                for (var i = 0; i < len; i++) {
                                    if (repaymentPeriodFrequencyEnum === 0) {
                                        date = date.setDate(date.getDate() + (parseInt(loanEMIPackDetail.repaymentEvery) * disbursalEMIs[i]));
                                    } else if (repaymentPeriodFrequencyEnum === 1) {
                                        date = date.setDate(date.getDate() + (parseInt(loanEMIPackDetail.repaymentEvery) * 7 * disbursalEMIs[i]));
                                    } else if (repaymentPeriodFrequencyEnum === 2) {
                                        date = date.setMonth(date.getMonth() + (parseInt(loanEMIPackDetail.repaymentEvery) * disbursalEMIs[i]));
                                    }
                                    if (!isNaN(date)) {
                                        scope.formRequestData.disburse.disbursementData[i].expectedDisbursementDate = dateFilter(new Date(date), scope.df);
                                    }
                                    date = new Date(scope.formRequestData.disburse.actualDisbursementDate);
                                }
                            }
                        }
                    }
                } else if (scope.formRequestData.disburse.disbursementData && scope.formRequestData.disburse.disbursementData.length > 0) {
                    for (var i = 0; i < scope.formRequestData.disburse.disbursementData.length; i++) {
                        scope.formRequestData.disburse.disbursementData[i].expectedDisbursementDate = dateFilter(new Date(scope.formRequestData.disburse.disbursementData[i].expectedDisbursementDate), scope.df);
                    }
                    if (scope.formRequestData.disburse.actualDisbursementDate && scope.formRequestData.disburse.actualDisbursementDate.toString() != 'Invalid Date') {
                        var dateValue = scope.formRequestData.disburse.actualDisbursementDate;
                        if ((new Date(dateValue)).toString() != 'Invalid Date') {
                            for (var i in scope.formRequestData.loanApplicationSanctionTrancheDatas) {
                                scope.formRequestData.disburse.disbursementData[i].expectedDisbursementDate = dateFilter(new Date(scope.formRequestData.disburse.disbursementData[i].expectedDisbursementDate), scope.df);
                            }
                            scope.formRequestData.disburse.disbursementData[0].expectedDisbursementDate = dateFilter(new Date(dateValue), scope.df);
                        }
                    }
                }
            };
        }
    });
    mifosX.ng.application.controller('groupLoanDisbursalActivityController', ['$controller', '$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.groupLoanDisbursalActivityController]).run(function($log) {
        $log.info("groupLoanDisbursalActivityController initialized");
    });
}(mifosX.controllers || {}));