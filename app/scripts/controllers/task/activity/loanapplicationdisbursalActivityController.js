(function (module) {
    mifosX.controllers = _.extend(module, {
        loanapplicationdisbursalActivityController: function ($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.loanApplicationReferenceId = scope.taskconfig['loanApplicationId'];
            scope.issubmitted = false;
            scope.restrictDate = new Date();
            scope.formRequestData = {};
            scope.formRequestData.submitApplication = {};
            scope.formRequestData.submitApplication.disbursementData = [];
            scope.formRequestData.approve = {};
            scope.formRequestData.disburse = {};
            scope.formRequestData.disburse.actualDisbursementDate = dateFilter(new Date(scope.restrictDate), scope.df);
            scope.showPaymentDetails = false;
            scope.date = {};
            var curIndex = 0;
            scope.enableClientVerification = scope.isSystemGlobalConfigurationEnabled('client-verification');
            scope.canForceDisburse = false;
            scope.commandParam = 'disburse';
            scope.canDisburseToGroupBankAccounts = false;
            scope.allowBankAccountsForGroups = scope.isSystemGlobalConfigurationEnabled('allow-bank-account-for-groups');
            scope.allowDisbursalToGroupBankAccounts = scope.isSystemGlobalConfigurationEnabled('allow-multiple-bank-disbursal');
            scope.groupBankAccountDetailsData = [];
            scope.bankAccountTemplate={};
            scope.repaymentApplicableOn = 1;
            scope.manualPaymentMode = 3;
            scope.paymentModeOptions = [];
            scope.paymentTypes = [];
            scope.paymentTypeOptions = [];

            scope.filterPaymentTypes = function(data){
                scope.paymentTypes = [];
                for(var i in data){
                    if(data[i].applicableOn == undefined || data[i].applicableOn.id != scope.repaymentApplicableOn){
                        scope.paymentTypes.push(data[i]);
                    }
                }
            };
            
            scope.amountInvalid = false;
            resourceFactory.loanApplicationReferencesTemplateResource.get({}, function (data) {
                scope.paymentTypes = data.paymentOptions;
                if (scope.paymentTypes) {
                    scope.formRequestData.disburse.paymentTypeId = scope.paymentTypes[0].id;
                }
            });

            scope.updatePaymentType = function(expectedDisbursalPaymentType, disbursementMode){
                if(expectedDisbursalPaymentType){
                    for(var i in scope.paymentTypes){
                        if(expectedDisbursalPaymentType.id==scope.paymentTypes[i].id){                            
                            if(disbursementMode){
                                scope.paymentMode = disbursementMode.id;
                            }else{
                                scope.paymentMode = scope.manualPaymentMode;
                            }
                            scope.changePaymentTypeOptions(scope.paymentMode);
                            scope.formRequestData.disburse.paymentTypeId = scope.paymentTypes[i].id;

                        }
                    }
                }else{
                    scope.paymentMode = scope.manualPaymentMode;
                }
                
            };

            scope.changePaymentTypeOptions = function(id){
                scope.paymentTypeOptions = [];
                if(id){
                    for(var i in scope.paymentTypes){
                        if(scope.paymentTypes[i].paymentMode==undefined || scope.paymentTypes[i].paymentMode.id==id){
                            scope.paymentTypeOptions.push(scope.paymentTypes[i]);
                        }
                    }
                }else{
                    scope.paymentTypeOptions = scope.paymentTypes;
                }
                if(scope.paymentTypeOptions.length>0){
                    scope.formRequestData.disburse.paymentTypeId = scope.paymentTypeOptions[0].id;
                }
            };

            scope.isAlreadyDisbursed = false;
            resourceFactory.loanApplicationReferencesResource.getByLoanAppId({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (data) {
                scope.formData = data;
                resourceFactory.loanApplicationReferencesTemplateResource.get({}, function (tempData) {
                    scope.paymentModeOptions = tempData.paymentModeOptions;
                    scope.filterPaymentTypes(tempData.paymentOptions);
                    scope.updatePaymentType(data.expectedDisbursalPaymentType ,data.disbursementMode);                    
                });
                scope.accountType = scope.formData.accountType.value.toLowerCase();
                if (scope.formData.status.id === 400) {
                    getLoanAccountDetails(scope.formData.loanId);
                }else{
                    resourceFactory.loanApplicationReferencesResource.getChargesByLoanAppId({
                        loanApplicationReferenceId: scope.loanApplicationReferenceId,
                        command: 'loanapplicationcharges'
                    }, function (loanAppChargeData) {
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
                        scope.canDisburseToGroupBankAccounts = scope.formData.allowsDisbursementToGroupBankAccounts;
                        if(scope.canDisburseToGroupsBanks()){
                            scope.groupBankAccountDetailsData = scope.formData.groupBankAccountDetails;
                            scope.multipleBankDisbursalData = [];
                        }
                        resourceFactory.loanApplicationReferencesResource.getByLoanAppId({
                            loanApplicationReferenceId: scope.loanApplicationReferenceId,
                            command: 'approveddata'
                        }, function (data) {
                            scope.formData.approvedData = {};
                            scope.formData.approvedData = data;
                            scope.date.expectedDisbursementDate = dateFilter(new Date(scope.formData.approvedData.expectedDisbursementDate), scope.df);
                            if (scope.formData.approvedData.repaymentsStartingFromDate) {
                                scope.date.repaymentsStartingFromDate = dateFilter(new Date(scope.formData.approvedData.repaymentsStartingFromDate), scope.df);
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
                            } else {
                                if (scope.formRequestData.disburse.transactionAmount == undefined) {
                                        scope.formRequestData.disburse.transactionAmount = scope.formData.approvedData.netLoanAmount;
                                }
                                if(scope.formData.approvedData.discountOnDisbursalAmount){
                                    scope.formRequestData.disburse.discountOnDisbursalAmount = scope.formData.approvedData.discountOnDisbursalAmount;
                                    scope.formRequestData.submitApplication.discountOnDisbursalAmount = scope.formData.approvedData.discountOnDisbursalAmount;
                                }
                            }
                            if (scope.formData.fixedEmiAmount) {
                                scope.formData.approvedData.fixedEmiAmount = scope.formData.fixedEmiAmount;
                                scope.formRequestData.disburse.fixedEmiAmount = scope.formData.approvedData.fixedEmiAmount;
                            }
                            scope.loanProductChange(scope.formData.loanProductId);
                        });
                    };
                }
            });

            scope.loanProductChange = function (loanProductId) {
                scope.inparams = {resourceType: 'template', activeOnly: 'true'};
                scope.inparams.templateType = scope.accountType;
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
                        if(!data.isClientVerified && scope.enableClientVerification){
                            scope.canForceDisburse = true;
                        }
                    }

                    if (data.group) {
                        scope.groupName = data.group.name;
                    }
                    if (scope.loanaccountinfo.calendarOptions) {
                        scope.formRequestData.submitApplication.syncRepaymentsWithMeeting = true;
                        if(scope.response && !scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.syncDisbursementWithMeeting){
                            scope.formRequestData.submitApplication.syncDisbursementWithMeeting = false;
                        }else{
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
                    //scope.formRequestData.submitApplication.fixedEmiAmount = scope.loanaccountinfo.fixedEmiAmount;
                    //scope.formRequestData.submitApplication.maxOutstandingLoanBalance = scope.loanaccountinfo.maxOutstandingLoanBalance;
                    if (scope.loanaccountinfo.isInterestRecalculationEnabled && scope.loanaccountinfo.interestRecalculationData.recalculationRestFrequencyDate) {
                        scope.date.recalculationRestFrequencyDate = new Date(scope.loanaccountinfo.interestRecalculationData.recalculationRestFrequencyDate);
                    }
                    if (scope.loanaccountinfo.isInterestRecalculationEnabled && scope.loanaccountinfo.interestRecalculationData.recalculationCompoundingFrequencyDate) {
                        scope.date.recalculationCompoundingFrequencyDate = new Date(scope.loanaccountinfo.interestRecalculationData.recalculationCompoundingFrequencyDate);
                    }
                    if (scope.loanaccountinfo.isLoanProductLinkedToFloatingRate) {
                        scope.formRequestData.submitApplication.isFloatingInterestRate = false;
                    }

                });
            };

            scope.requestApprovalLoanAppRef = function () {
                resourceFactory.loanApplicationReferencesResource.update({
                    loanApplicationReferenceId: scope.loanApplicationReferenceId,
                    command: 'requestforapproval'
                }, {}, function (data) {
                    location.path('/viewclient/' + scope.formData.clientId);
                });
            };

            scope.charges = [];
            scope.constructExistingCharges = function (index, chargeId) {
                resourceFactory.chargeResource.get({chargeId: chargeId, template: 'true'}, function (data) {
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

            if (scope.response && scope.response.uiDisplayConfigurations.loanAccount.isAutoPopulate.interestChargedFromDate) {
                scope.$watch('date.expectedDisbursementDate ', function () {
                    if (scope.date.expectedDisbursementDate != '' && scope.date.expectedDisbursementDate != undefined) {
                        scope.date.interestChargedFromDate = scope.date.expectedDisbursementDate;
                    }
                });
            }

            scope.syncRepaymentsWithMeetingchange = function () {
                if (!scope.formRequestData.submitApplication.syncRepaymentsWithMeeting) {
                    scope.formRequestData.submitApplication.syncDisbursementWithMeeting = false;
                }
            };

            scope.syncDisbursementWithMeetingchange = function () {
                if (scope.formRequestData.submitApplication.syncDisbursementWithMeeting) {
                    scope.formRequestData.submitApplication.syncRepaymentsWithMeeting = true;
                }
            };

            scope.previewRepayments = function (isDisplayData) {

                if (scope.charges.length > 0) {
                    scope.formRequestData.submitApplication.charges = [];
                    for (var i in scope.charges) {
                        var chargeData = {};
                        chargeData.chargeId = scope.charges[i].chargeId;
                        chargeData.amount = scope.charges[i].amount;
                        if(scope.charges[i].dueDate){
                            chargeData.dueDate = dateFilter(new Date(scope.charges[i].dueDate), scope.df);
                        }
                        scope.formRequestData.submitApplication.charges.push(chargeData);
                    }
                }

                if (this.formRequestData.submitApplication.syncRepaymentsWithMeeting) {
                    this.formRequestData.submitApplication.calendarId = scope.loanaccountinfo.calendarOptions[0].id;
                    scope.syncRepaymentsWithMeeting = this.formRequestData.submitApplication.syncRepaymentsWithMeeting;
                } else {
                    if (this.formRequestData.submitApplication.calendarId) {
                        delete this.formRequestData.submitApplication.calendarId;
                    }
                }
                // delete this.formRequestData.submitApplication.syncRepaymentsWithMeeting;

                if (this.date.interestChargedFromDate) {
                    this.formRequestData.submitApplication.interestChargedFromDate = dateFilter(new Date(this.date.interestChargedFromDate), scope.df);
                }
                if (this.date.repaymentsStartingFromDate) {
                    this.formRequestData.submitApplication.repaymentsStartingFromDate = dateFilter(new Date(this.date.repaymentsStartingFromDate), scope.df);
                }

                if (this.formRequestData.disburse.fixedEmiAmount) {
                    this.formRequestData.submitApplication.fixedEmiAmount = this.formRequestData.disburse.fixedEmiAmount;
                }

                this.formRequestData.submitApplication.loanType = scope.inparams.templateType;
                this.formRequestData.submitApplication.expectedDisbursementDate = dateFilter(new Date(scope.formData.approvedData.expectedDisbursementDate), scope.df);
                this.formRequestData.submitApplication.submittedOnDate = dateFilter(new Date(scope.formData.submittedOnDate), scope.df);
                this.formRequestData.submitApplication.locale = scope.optlang.code;
                this.formRequestData.submitApplication.dateFormat = scope.df;
                if (this.formRequestData.submitApplication.interestCalculationPeriodType == 0) {
                    this.formRequestData.submitApplication.allowPartialPeriodInterestCalcualtion = false;
                }

                scope.formRequestPreveieData = angular.copy(scope.formRequestData.submitApplication);
                delete scope.formRequestPreveieData.syncRepaymentsWithMeeting;
                if (scope.formRequestData.disburse.actualDisbursementDate) {
                    scope.formRequestPreveieData.expectedDisbursementDate = dateFilter(new Date(scope.formRequestData.disburse.actualDisbursementDate), scope.df);
                } else {
                    delete scope.formRequestPreveieData.expectedDisbursementDate;
                }
                scope.formRequestPreveieData.principal = scope.formData.approvedData.loanAmountApproved;
                if (scope.formRequestPreveieData.disburse) {
                    delete scope.formRequestPreveieData.disburse;
                }

                if (scope.formRequestPreveieData.disbursementData) {
                    scope.formRequestPreveieData.disbursementData = [];
                    if (scope.formRequestData.submitApplication.disbursementData) {
                        for (var i = 0; i < scope.formRequestData.submitApplication.disbursementData.length; i++) {
                            var disbursementData = {};
                            if(i == 0){
                                disbursementData.expectedDisbursementDate = dateFilter(new Date(scope.formRequestData.disburse.actualDisbursementDate), scope.df);
                                disbursementData.principal = scope.formRequestData.disburse.transactionAmount;
                            }else{
                                disbursementData.expectedDisbursementDate = dateFilter(new Date(scope.formRequestData.submitApplication.disbursementData[i].expectedDisbursementDate), scope.df);
                                disbursementData.principal = scope.formRequestData.submitApplication.disbursementData[i].principal;
                            }
                            scope.formRequestPreveieData.disbursementData.push(disbursementData);
                            //break;
                        }
                    }
                }
                if(isDisplayData){
                    resourceFactory.loanResource.save({command: 'calculateLoanSchedule'}, scope.formRequestPreveieData, function (data) {
                        scope.repaymentscheduleinfo = data;
                        scope.formRequestData.submitApplication.syncRepaymentsWithMeeting = scope.syncRepaymentsWithMeeting;
                    });
                }
            }

            scope.submit = function () {
                scope.previewRepayments(false);
                if (scope.charges.length > 0) {
                    scope.formRequestData.submitApplication.charges = [];
                    for (var i in scope.charges) {
                        var chargeData = {};
                        chargeData.chargeId = scope.charges[i].chargeId;
                        chargeData.amount = scope.charges[i].amount;
                        if(scope.charges[i].dueDate){
                            chargeData.dueDate = dateFilter(new Date(scope.charges[i].dueDate), scope.df);
                        }
                        scope.formRequestData.submitApplication.charges.push(chargeData);
                    }
                }

                if (scope.formRequestData.submitApplication.disbursementData != undefined && scope.formRequestData.submitApplication.disbursementData.length > 0) {
                    for (var i in  scope.formRequestData.submitApplication.disbursementData) {
                        if(i==0 && this.formRequestData.disburse.expectedDisbursementDate){
                            scope.formRequestData.submitApplication.disbursementData[i].expectedDisbursementDate = dateFilter(new Date(this.formRequestData.disburse.expectedDisbursementDate), scope.df)
                        }else{
                            scope.formRequestData.submitApplication.disbursementData[i].expectedDisbursementDate = dateFilter(scope.formRequestData.submitApplication.disbursementData[i].expectedDisbursementDate, scope.df);
                        }
                    }
                } else {
                    delete  scope.formRequestData.submitApplication.disbursementData;
                }

                if (this.formRequestData.submitApplication.syncRepaymentsWithMeeting) {
                    this.formRequestData.submitApplication.calendarId = scope.loanaccountinfo.calendarOptions[0].id;
                }
                //delete this.formRequestData.submitApplication.syncRepaymentsWithMeeting;

                if (scope.date.interestChargedFromDate) {
                    this.formRequestData.submitApplication.interestChargedFromDate = dateFilter(new Date(scope.date.interestChargedFromDate), scope.df);
                }
                if (!scope.date.repaymentsStartingFromDate || scope.date.repaymentsStartingFromDate == "") {
                    this.formRequestData.submitApplication.repaymentsStartingFromDate = undefined;
                }else{
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
                if(this.formRequestData.disburse.expectedDisbursementDate){
                    this.formRequestData.submitApplication.expectedDisbursementDate = dateFilter(new Date(this.formRequestData.disburse.expectedDisbursementDate), scope.df)
                }
                this.formRequestData.submitApplication.submittedOnDate = dateFilter(new Date(scope.formData.submittedOnDate), scope.df);

                this.formRequestData.submitApplication.createStandingInstructionAtDisbursement = scope.formRequestData.createStandingInstructionAtDisbursement;

                this.formRequestData.submitApplication.locale = scope.optlang.code;
                this.formRequestData.submitApplication.dateFormat = scope.df;

                if (this.formRequestData.disburse.actualDisbursementDate) {
                    this.formRequestData.disburse.actualDisbursementDate = dateFilter(new Date(this.formRequestData.disburse.actualDisbursementDate), scope.df);
                    this.formRequestData.submitApplication.expectedDisbursementDate = dateFilter(new Date(this.formRequestData.disburse.actualDisbursementDate), scope.df);

                }else{
                    this.formRequestData.submitApplication.expectedDisbursementDate = dateFilter(new Date(scope.date.expectedDisbursementDate), scope.df);
                }
                if(this.formRequestData.disburse.expectedDisbursementDate){
                    this.formRequestData.disburse.expectedDisbursementDate = dateFilter(new Date(this.formRequestData.disburse.expectedDisbursementDate), scope.df)
                }
                this.formRequestData.disburse.locale = scope.optlang.code;
                this.formRequestData.disburse.dateFormat = scope.df;

                this.formRequestData.locale = scope.optlang.code;
                this.formRequestData.dateFormat = scope.df;

                scope.disburseData = {};
                angular.copy(scope.formRequestData,scope.disburseData);
                delete scope.disburseData.submitApplication.syncRepaymentsWithMeeting;
                resourceFactory.loanApplicationReferencesResource.update({
                    loanApplicationReferenceId: scope.loanApplicationReferenceId,
                    command: scope.commandParam
                }, this.formRequestData, function (data) {
                    scope.activityDone();
                    getLoanAccountDetails(data.changes.loanId);
                });
            };

            scope.undoApprovalLoanAppRef = function () {
                resourceFactory.loanApplicationReferencesResource.update({
                    loanApplicationReferenceId: scope.loanApplicationReferenceId,
                    command: 'undoapprove'
                }, {}, function (data) {
                    location.path('/viewclient/' + scope.formData.clientId);
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

            scope.cancel = function () {
                if (scope.formData.groupId) {
                    location.path('/viewgroup/' + scope.formData.groupId);
                } else if (scope.formData.clientId) {
                    location.path('/viewclient/' + scope.formData.clientId);
                }
            };

            scope.report = false;
            scope.viewRepaymentDetails = function () {
                if (scope.repaymentscheduleinfo && scope.repaymentscheduleinfo.periods) {
                    resourceFactory.clientResource.get({clientId: scope.formData.clientId}, function (data) {
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

            scope.printDiv = function (print) {
                var printContents = document.getElementById(print).innerHTML;
                var popupWin = window.open('', '_blank', 'width=300,height=300');
                popupWin.document.open();
                popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="styles/repaymentscheduleprintstyle.css" />' +
                    '</head><body onload="window.print()">' + printContents + '<br><br><table class="table"><tr><td width="210"><h4>Credit Officer</h4></td><td width="210"><h4>Branch Manager</h4></td><td><h4>Customer Signature</h4></td></tr></table></body></html>');
                popupWin.document.close();
            };

            scope.backToLoanDetails = function () {
                scope.report = false;
            }

            function getLoanAccountDetails(loanId) {
                scope.loanId = loanId;
                resourceFactory.LoanAccountResource.getLoanAccountDetails({loanId: loanId,  associations: 'all', exclude: 'guarantors'}, function (data) {
                    scope.loandetails = data;
                });
                scope.isAlreadyDisbursed = true;
            };

            scope.viewLoanDetails = function () {
                location.path('/viewloanaccount/' + scope.loanId);
            };

            scope.doPreTaskActionStep = function(actionName){
                if(actionName === 'activitycomplete'){
                    if(scope.isAlreadyDisbursed){
                        scope.doActionAndRefresh(actionName);
                    }
                    else{
                        scope.setTaskActionExecutionError("lable.error.activity.survey.not.completed");
                    }
                }else{
                    scope.doActionAndRefresh(actionName);
                }

            };

            scope.forceDisburse = function () {
                scope.commandParam = 'forcedisburse';
                scope.issubmitted = true;
                scope.submit(); 
            };

            scope.disburseToGroupsBankAccounts = function(){
                scope.commandParam = 'disburseToGroupBankAccounts';
                scope.issubmitted = true;
                this.formRequestData.disburse.multipleBankDisbursalData=[];
                angular.copy(scope.multipleBankDisbursalData,  this.formRequestData.disburse.multipleBankDisbursalData);
                for(var i in this.formRequestData.disburse.multipleBankDisbursalData){
                    delete this.formRequestData.disburse.multipleBankDisbursalData[i].name;
                    delete this.formRequestData.disburse.multipleBankDisbursalData[i].loanPurpose;
                    delete this.formRequestData.disburse.multipleBankDisbursalData[i].paymentTypeName;
                    }
                scope.submit(); 
            };

            scope.canDisburseToGroupsBanks = function(){
                return (scope.canDisburseToGroupBankAccounts && scope.allowBankAccountsForGroups && scope.allowDisbursalToGroupBankAccounts);
            }; 

            scope.addDisbursalAmount = function () {   
                if(!scope.bankAccountTemplate.bankAccountAssociation){
                    scope.isInvalid = true;
                    scope.errorMessage = "error.msg.bank.account.not.selected";
                } else if(!scope.bankAccountTemplate.disbursalAmount){
                    scope.isInvalid = true;
                    scope.errorMessage = "error.msg.amount.is.invalid";
                } else if ((scope.multipleBankDisbursalData.findIndex(x => x.groupBankAccountDetailAssociationId == scope.bankAccountTemplate.bankAccountAssociation.groupBankAccountDetailAssociationId) < 0) && scope.bankAccountTemplate.disbursalAmount) {
                    scope.isInvalid = false;
                    var record = {
                        groupBankAccountDetailAssociationId: scope.bankAccountTemplate.bankAccountAssociation.groupBankAccountDetailAssociationId,
                        amount: scope.bankAccountTemplate.disbursalAmount,
                        name: scope.bankAccountTemplate.bankAccountAssociation.bankAccountDetails.name,
                        loanPurpose: scope.bankAccountTemplate.bankAccountAssociation.loanPurpose
                        
                    };
                    scope.multipleBankDisbursalData.push(record);
                    scope.bankAccountTemplate.bankAccountAssociation = undefined;
                    scope.bankAccountTemplate.disbursalAmount = undefined;
                } else {
                    scope.isInvalid = true;
                    scope.errorMessage = "label.error.bank.account.already.present";
                }
            };

            scope.deleteRecord = function(index){
                scope.multipleBankDisbursalData.splice(index,1);

            };


        }
    });
    mifosX.ng.application.controller('loanapplicationdisbursalActivityController', ['$controller','$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.loanapplicationdisbursalActivityController]).run(function ($log) {
        $log.info("loanapplicationdisbursalActivityController initialized");
    });
}(mifosX.controllers || {}));
