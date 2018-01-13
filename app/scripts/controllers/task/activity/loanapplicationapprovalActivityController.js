(function (module) {
    mifosX.controllers = _.extend(module, {
        loanapplicationapprovalActivityController: function ($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.approveloanapplicationdetails = "";
            scope.status = 'SUMMARY';
            scope.loanApplicationReferenceId = scope.taskconfig['loanApplicationId'];

            scope.onReject = function(){

            };

            function getLoanApplicationId(){
                return scope.taskconfig['loanApplicationId'];
            }

            scope.restrictDate = new Date();

            scope.formRequestData = {};
            scope.formRequestData.loanApplicationSanctionTrancheDatas = [];
            scope.formRequestData.approvedOnDate = dateFilter(new Date(scope.restrictDate), scope.df);

            scope.charges = [];
            scope.existingCharges = [];
            var curIndex = 0;
            scope.formValidationData = {};
            scope.isInitLoad = true;

            resourceFactory.loanApplicationReferencesResource.getByLoanAppId({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (applicationData) {
                 scope.formData = applicationData;
                 scope.loanProductChange(scope.formData.loanProductId);
                 resourceFactory.loanApplicationReferencesResource.getByLoanAppId({
                    loanApplicationReferenceId: scope.loanApplicationReferenceId
                }, function (loanData) {
                    scope.loadLoanData(loanData);
                    scope.isInitLoad = false;
                    scope.formRequestData.maxOutstandingLoanBalance = scope.loanaccountinfo.maxOutstandingLoanBalance;
                    scope.formDataForValidtion();
                });  
            });


            scope.loadLoanData = function(loanData){
                if (loanData.loanAppSanctionId) {
                    scope.formRequestData = loanData;
                    if(scope.formRequestData.repaymentsStartingFromDate){
                        scope.formRequestData.repaymentsStartingFromDate = dateFilter(new Date(scope.formRequestData.repaymentsStartingFromDate), scope.df);
                    }
                    delete scope.formRequestData.loanAppSanctionId;
                    delete scope.formRequestData.loanApplicationReferenceId;
                    scope.formRequestData.repaymentPeriodFrequencyEnum = scope.formRequestData.repaymentPeriodFrequency.id;
                    delete scope.formRequestData.repaymentPeriodFrequency;
                    scope.formRequestData.termPeriodFrequencyEnum = scope.formRequestData.termPeriodFrequency.id;
                    delete scope.formRequestData.termPeriodFrequency;
                    scope.formRequestData.expectedDisbursementDate = dateFilter(new Date(scope.formRequestData.expectedDisbursementDate), scope.df);
                    if (loanData.loanApplicationSanctionTrancheDatas) {
                        for (var i = 0; i < scope.formRequestData.loanApplicationSanctionTrancheDatas.length; i++) {
                            scope.formRequestData.loanApplicationSanctionTrancheDatas[i].expectedTrancheDisbursementDate = dateFilter(new Date(scope.formRequestData.loanApplicationSanctionTrancheDatas[i].expectedTrancheDisbursementDate), scope.df);
                        }
                    }
                    if(scope.formRequestData.approvedOnDate){
                        scope.formRequestData.approvedOnDate = dateFilter(new Date(scope.formRequestData.approvedOnDate),scope.df);
                    }
                } else {
                    scope.formRequestData.loanAmountApproved = scope.formData.loanAmountRequested;
                    scope.formRequestData.numberOfRepayments = scope.formData.numberOfRepayments;
                    scope.formRequestData.repaymentPeriodFrequencyEnum = scope.formData.repaymentPeriodFrequency.id;
                    scope.formRequestData.repayEvery = scope.formData.repayEvery;
                    scope.formRequestData.termPeriodFrequencyEnum = scope.formData.termPeriodFrequency.id;
                    scope.formRequestData.termFrequency = scope.formData.termFrequency;
                    if (scope.formData.noOfTranche && scope.formData.noOfTranche > 0) {
                        scope.constructTranches();
                    }
                }
                if(scope.formData.fixedEmiAmount){
                    scope.formRequestData.fixedEmiAmount = scope.formData.fixedEmiAmount;
                }
            };

            scope.hideClientAdrresssBlock = scope.response.uiDisplayConfigurations.workflow.loanApproval.hiddenField.clientAddress;
            function showSummary(){
                scope.changeLoanEMIPack=false;
                scope.taskCompletedFlag=scope.isTaskCompleted();
                resourceFactory.loanApplicationReferencesResource.getByLoanAppId({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (applicationData) {
                    scope.formData = applicationData;
                    if (!scope.hideClientAdrresssBlock && applicationData.clientId != undefined && applicationData.clientId != null) {
                        resourceFactory.clientKycAddressResource.get({clientId: applicationData.clientId}, function (kycData) {
                            scope.clientKycdata = kycData.kyc;
                        });
                        resourceFactory.clientResource.get({clientId: applicationData.clientId, isFetchAdressDetails : true}, function (clientData) {
                            scope.client = clientData;
                            scope.client.dateOfBirth = dateFilter(new Date(scope.client.dateOfBirth), scope.df);
                            scope.address = clientData.addressData[0];
                        });
                    }
                    scope.loanProductChange(applicationData.loanProductId);
                    scope.charges = [];
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
                    if(scope.formData.status.id === 100){
                        resourceFactory.loanApplicationReferencesResource.update({
                            loanApplicationReferenceId: scope.loanApplicationReferenceId,
                            command: 'requestforapproval'
                        }, {}, function (data) {
                            scope.showEditForm();
                        });
                    }else if(scope.formData.status.id === 200){
                        scope.showEditForm();
                    }else if(scope.formData.status.id > 200){
                        scope.activityDone();
                    }
                });
            }

            showSummary();

            scope.showEditForm=function(){
                scope.changeLoanEMIPack=false;
                scope.status = 'UPDATE';
            };

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
                                    scope.charges[i].isMandatory = scope.loanAppChargeData[j].isMandatory;
                                }
                            }
                        }
                        angular.copy(scope.charges,scope.existingCharges);
                    }
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
                    scope.productLoanCharges = data.product.charges || [];
                    if (scope.loanaccountinfo.product.multiDisburseLoan) {
                        scope.formRequestData.loanApplicationSanctionTrancheDatas = [];
                    }
                    if (data.clientName) {
                        scope.clientName = data.clientName;
                    }
                    if (data.group) {
                        scope.groupName = data.group.name;
                    }
                   if(!scope.isInitLoad){
                     resourceFactory.loanApplicationReferencesResource.getByLoanAppId({
                        loanApplicationReferenceId: scope.loanApplicationReferenceId,
                        command: 'approveddata'
                    }, function (approveddata) {
                        scope.loadLoanData(approveddata);
                        scope.formRequestData.maxOutstandingLoanBalance = scope.loanaccountinfo.maxOutstandingLoanBalance;
                        scope.formDataForValidtion();
                    });
                   }
                });
            };

            scope.formDataForValidtion = function () {
                scope.formValidationData.submittedOnDate = dateFilter(scope.formData.submittedOnDate, scope.df);
                scope.formValidationData.clientId = scope.formData.clientId;
                if (scope.formData.groupId) {
                    scope.formValidationData.groupId = scope.formData.groupId;
                }
                scope.previewClientLoanAccInfo();
                if (scope.loanaccountinfo.loanOfficerOptions && !scope.formData.loanOfficerId) {
                    resourceFactory.clientResource.get({clientId: routeParams.clientId}, function (data) {
                        scope.clientData = data;
                        if (data.staffId != null) {
                            scope.formValidationData.loanOfficerId = data.staffId;
                        }
                    });
                } else {
                    scope.formValidationData.loanOfficerId = scope.formData.loanOfficerId;
                }
            };

            scope.previewClientLoanAccInfo = function () {

                if (scope.loanaccountinfo.calendarOptions) {
                    scope.formValidationData.syncRepaymentsWithMeeting = true;
                    if (scope.response && !scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.syncDisbursementWithMeeting) {
                        scope.formValidationData.syncDisbursementWithMeeting = false;
                    } else {
                        scope.formValidationData.syncDisbursementWithMeeting = true;
                    }
                }

                if (scope.response && scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.fundId != null) {
                    scope.formValidationData.fundId = scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.fundId;
                } else {
                    scope.formValidationData.fundId = scope.loanaccountinfo.fundId;
                }
                scope.formValidationData.productId = scope.formData.loanProductId;
                scope.formValidationData.loanPurposeId = scope.formData.loanPurposeId;
                scope.formValidationData.principal = scope.formRequestData.loanAmountApproved;

                scope.formValidationData.loanTermFrequency = scope.formRequestData.termFrequency;
                scope.formValidationData.loanTermFrequencyType = scope.formRequestData.termPeriodFrequencyEnum;
                scope.formValidationData.numberOfRepayments = scope.formRequestData.numberOfRepayments;
                scope.formValidationData.repaymentEvery = scope.formRequestData.repayEvery;
                scope.formValidationData.repaymentFrequencyType = scope.formRequestData.repaymentPeriodFrequencyEnum;

                scope.formValidationData.interestRatePerPeriod = scope.loanaccountinfo.interestRatePerPeriod;
                scope.formValidationData.amortizationType = scope.loanaccountinfo.amortizationType.id;
                scope.formValidationData.interestType = scope.loanaccountinfo.interestType.id;
                scope.formValidationData.interestCalculationPeriodType = scope.loanaccountinfo.interestCalculationPeriodType.id;
                scope.formValidationData.allowPartialPeriodInterestCalcualtion = scope.loanaccountinfo.allowPartialPeriodInterestCalcualtion;
                scope.formValidationData.inArrearsTolerance = scope.loanaccountinfo.inArrearsTolerance;
                scope.formValidationData.graceOnPrincipalPayment = scope.loanaccountinfo.graceOnPrincipalPayment;
                scope.formValidationData.graceOnInterestPayment = scope.loanaccountinfo.graceOnInterestPayment;
                scope.formValidationData.graceOnArrearsAgeing = scope.loanaccountinfo.graceOnArrearsAgeing;
                scope.formValidationData.transactionProcessingStrategyId = scope.loanaccountinfo.transactionProcessingStrategyId;
                scope.formValidationData.graceOnInterestCharged = scope.loanaccountinfo.graceOnInterestCharged;
                // scope.formValidationData.fixedEmiAmount = scope.loanaccountinfo.fixedEmiAmount;
                scope.formValidationData.maxOutstandingLoanBalance = scope.formRequestData.maxOutstandingLoanBalance;

                if (scope.loanaccountinfo.isInterestRecalculationEnabled && scope.loanaccountinfo.interestRecalculationData.recalculationRestFrequencyDate) {
                    //scope.formValidationData.recalculationRestFrequencyDate = new Date(scope.loanaccountinfo.interestRecalculationData.recalculationRestFrequencyDate);
                }
                if (scope.loanaccountinfo.isInterestRecalculationEnabled && scope.loanaccountinfo.interestRecalculationData.recalculationCompoundingFrequencyDate) {
                    //scope.formValidationData.recalculationCompoundingFrequencyDate = new Date(scope.loanaccountinfo.interestRecalculationData.recalculationCompoundingFrequencyDate);
                }

                if (scope.loanaccountinfo.isLoanProductLinkedToFloatingRate) {
                    scope.formValidationData.isFloatingInterestRate = false;
                }
                if(!_.isUndefined(scope.formRequestData.expectedDisbursementDate)){
                    scope.status = 'SUMMARY';
                }
            }

            scope.constructTranches = function () {
                var noOfTranche = scope.formData.noOfTranche;
                var i = 0;
                while (i < noOfTranche) {
                    var loanApplicationSanctionTrancheDatas = {};
                    //loanApplicationSanctionTrancheDatas.fixedEmiAmount = scope.formData.fixedEmiAmount;
                    scope.formRequestData.loanApplicationSanctionTrancheDatas.push(loanApplicationSanctionTrancheDatas);
                    i++;
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

            scope.calculateTermFrequency = function () {
                scope.formRequestData.termFrequency = (scope.formRequestData.repayEvery * scope.formRequestData.numberOfRepayments);
                scope.formRequestData.termPeriodFrequencyEnum  = scope.formRequestData.repaymentPeriodFrequencyEnum;
            };

            scope.syncRepaymentsWithMeetingchange = function () {
                if (!scope.formValidationData.syncRepaymentsWithMeeting) {
                    scope.formValidationData.syncDisbursementWithMeeting = false;
                }
            };

            scope.syncDisbursementWithMeetingchange = function () {
                if (scope.formValidationData.syncDisbursementWithMeeting) {
                    scope.formValidationData.syncRepaymentsWithMeeting = true;
                }
            };

            scope.previewRepayments = function (isDisplayData) {

                scope.repaymentscheduleinfo = {};

                var reqFirstDate = dateFilter(new Date(scope.formValidationData.submittedOnDate), scope.df);
                var reqSecondDate = dateFilter(new Date(scope.formRequestData.expectedDisbursementDate), scope.df);
                var reqThirdDate = dateFilter(new Date(scope.formRequestData.expectedDisbursementDate), scope.df);
                //var reqFourthDate = dateFilter(scope.date.fourth, scope.df);
                if (scope.charges.length > 0) {
                    scope.formValidationData.charges = [];
                    for (var i in scope.charges) {
                        scope.formValidationData.charges.push({
                            chargeId: scope.charges[i].chargeId,
                            amount: scope.charges[i].amount,
                            dueDate: dateFilter(scope.charges[i].dueDate, scope.df)
                        });
                    }
                }

                if (scope.formRequestData.loanApplicationSanctionTrancheDatas && scope.formRequestData.loanApplicationSanctionTrancheDatas.length > 0) {
                    for (var i = 0; i < scope.formRequestData.loanApplicationSanctionTrancheDatas.length; i++) {
                        var dateValue = scope.formRequestData.loanApplicationSanctionTrancheDatas[i].expectedTrancheDisbursementDate;
                        if ((new Date(dateValue)).toString() != 'Invalid Date') {
                            scope.formValidationData.disbursementData = [];
                            break;
                        }
                    }
                }

                if (scope.formValidationData.disbursementData) {
                    for (var j = 0; j < scope.formRequestData.loanApplicationSanctionTrancheDatas.length; j++) {
                        var dateValue = scope.formRequestData.loanApplicationSanctionTrancheDatas[j].expectedTrancheDisbursementDate;
                        if (scope.formRequestData.loanApplicationSanctionTrancheDatas[j].expectedTrancheDisbursementDate && (new Date(dateValue)).toString() != 'Invalid Date' && scope.formRequestData.loanApplicationSanctionTrancheDatas[j].trancheAmount) {
                            var disbursementData = {};
                            disbursementData.expectedDisbursementDate = dateFilter(new Date(scope.formRequestData.loanApplicationSanctionTrancheDatas[j].expectedTrancheDisbursementDate), scope.df);
                            disbursementData.principal = scope.formRequestData.loanApplicationSanctionTrancheDatas[j].trancheAmount;
                            scope.formValidationData.disbursementData.push(disbursementData);
                        }
                    }
                }

                if (this.formValidationData.syncRepaymentsWithMeeting) {
                    this.formValidationData.calendarId = scope.loanaccountinfo.calendarOptions[0].id;
                    scope.syncRepaymentsWithMeeting = this.formValidationData.syncRepaymentsWithMeeting;
                }
                //delete this.formValidationData.syncRepaymentsWithMeeting;

                if (scope.formRequestData.expectedDisbursementDate) {
                    this.formValidationData.interestChargedFromDate = reqThirdDate;
                }

                if(scope.formRequestData.repaymentsStartingFromDate){
                    this.formValidationData.repaymentsStartingFromDate = dateFilter(new Date(scope.formRequestData.repaymentsStartingFromDate), scope.df);
                }

                this.formValidationData.principal = this.formRequestData.loanAmountApproved;

                this.formValidationData.loanType = scope.inparams.templateType;
                if (scope.formRequestData.expectedDisbursementDate) {
                    this.formValidationData.expectedDisbursementDate = reqSecondDate;
                }

                this.formValidationData.submittedOnDate = reqFirstDate;
                if (this.formValidationData.interestCalculationPeriodType == 0) {
                    this.formValidationData.allowPartialPeriodInterestCalcualtion = false;
                }

                if(this.formRequestData.fixedEmiAmount){
                    this.formValidationData.fixedEmiAmount = this.formRequestData.fixedEmiAmount;
                }else if(this.formValidationData.fixedEmiAmount){
                    delete this.formValidationData.fixedEmiAmount;
                }

                if(this.formRequestData.maxOutstandingLoanBalance){
                    this.formValidationData.maxOutstandingLoanBalance = this.formRequestData.maxOutstandingLoanBalance;
                }

                this.formValidationData.loanTermFrequency = this.formRequestData.termFrequency;
                this.formValidationData.loanTermFrequencyType = this.formRequestData.termPeriodFrequencyEnum;
                this.formValidationData.numberOfRepayments = this.formRequestData.numberOfRepayments;
                this.formValidationData.repaymentEvery = this.formRequestData.repayEvery;
                this.formValidationData.repaymentFrequencyType = this.formRequestData.repaymentPeriodFrequencyEnum;

                this.formValidationData.locale = scope.optlang.code;
                this.formValidationData.dateFormat = scope.df;
                scope.calculateLoanScheduleData = {};
                angular.copy(scope.formValidationData, scope.calculateLoanScheduleData);
                delete scope.calculateLoanScheduleData.syncRepaymentsWithMeeting;
                if (isDisplayData) {
                    resourceFactory.loanResource.save({command: 'calculateLoanSchedule'}, scope.calculateLoanScheduleData, function (data) {
                        scope.repaymentscheduleinfo = data;
                        scope.formValidationData.syncRepaymentsWithMeeting = scope.syncRepaymentsWithMeeting;
                    });
                }
            };

            scope.$watch('formRequestData.expectedDisbursementDate', function () {
                if(scope.formRequestData.loanEMIPackId){
                    var len = scope.loanaccountinfo.loanEMIPacks.length;
                    var loanEMIPack = {};
                    for(var i=0; i < len; i++){
                        if(scope.loanaccountinfo.loanEMIPacks[i].id === scope.formRequestData.loanEMIPackId){
                            loanEMIPack = scope.loanaccountinfo.loanEMIPacks[i];
                            break;
                        }
                    }
                    var disbursalEMIs = [0];
                    if(loanEMIPack.disbursalAmount2){
                        disbursalEMIs.push(loanEMIPack.disbursalEmi2)
                    }
                    if(loanEMIPack.disbursalAmount3){
                        disbursalEMIs.push(loanEMIPack.disbursalEmi3)
                    }
                    if(loanEMIPack.disbursalAmount4){
                        disbursalEMIs.push(loanEMIPack.disbursalEmi4)
                    }
                    if (scope.formRequestData.loanApplicationSanctionTrancheDatas && scope.formRequestData.loanApplicationSanctionTrancheDatas.length > 0) {
                        if (scope.formRequestData.expectedDisbursementDate != '' && scope.formRequestData.expectedDisbursementDate != undefined) {
                            var dateValue = scope.formRequestData.expectedDisbursementDate;
                            var date = new Date(dateValue);
                            if (date.toString() != 'Invalid Date') {
                                var len = scope.formRequestData.loanApplicationSanctionTrancheDatas.length;
                                for(var i=0; i < len; i++){
                                    if(scope.formRequestData.repaymentPeriodFrequencyEnum === 0){
                                        date = date.setDate(date.getDate()+(parseInt(scope.formRequestData.repayEvery)*disbursalEMIs[i]));
                                    }else if(scope.formRequestData.repaymentPeriodFrequencyEnum === 1){
                                        date = date.setDate(date.getDate()+(parseInt(scope.formRequestData.repayEvery)*7*disbursalEMIs[i]));
                                    }else if(scope.formRequestData.repaymentPeriodFrequencyEnum === 2){
                                        date = date.setMonth(date.getMonth()+(parseInt(scope.formRequestData.repayEvery)*disbursalEMIs[i]));
                                    }
                                    scope.formRequestData.loanApplicationSanctionTrancheDatas[i].expectedTrancheDisbursementDate = dateFilter(date, scope.df);
                                    dateValue = scope.formRequestData.expectedDisbursementDate;
                                    date = new Date(dateValue);
                                }
                            }
                        }
                    }
                }else{
                    if (scope.formRequestData.loanApplicationSanctionTrancheDatas && scope.formRequestData.loanApplicationSanctionTrancheDatas[0]) {
                        if (scope.formRequestData.expectedDisbursementDate != '' && scope.formRequestData.expectedDisbursementDate != undefined) {
                            var dateValue = scope.formRequestData.expectedDisbursementDate;
                            if ((new Date(dateValue)).toString() != 'Invalid Date') {
                                scope.formRequestData.loanApplicationSanctionTrancheDatas[0].expectedTrancheDisbursementDate = dateFilter(new Date(dateValue), scope.df);
                            }
                        }

                    }
                }
            });

            scope.$watch('formRequestData.repaymentsStartingFromDate', function () {
                if(scope.formRequestData.loanEMIPackId){
                    if(scope.formRequestData.loanApplicationSanctionTrancheDatas && scope.formRequestData.loanApplicationSanctionTrancheDatas.length > 0){
                        var len = scope.formRequestData.loanApplicationSanctionTrancheDatas.length;
                        for(var i = 0; i < len ; i++){
                            if(scope.formRequestData.loanApplicationSanctionTrancheDatas[i].expectedTrancheDisbursementDate){
                                delete scope.formRequestData.loanApplicationSanctionTrancheDatas[i].expectedTrancheDisbursementDate;
                            }
                        }
                    }
                    var len = scope.loanaccountinfo.loanEMIPacks.length;
                    var loanEMIPack = {};
                    for(var i=0; i < len; i++){
                        if(scope.loanaccountinfo.loanEMIPacks[i].id === scope.formRequestData.loanEMIPackId){
                            loanEMIPack = scope.loanaccountinfo.loanEMIPacks[i];
                            break;
                        }
                    }
                    var disbursalEMIs = [0];
                    if(loanEMIPack.disbursalAmount2){
                        disbursalEMIs.push(loanEMIPack.disbursalEmi2)
                    }
                    if(loanEMIPack.disbursalAmount3){
                        disbursalEMIs.push(loanEMIPack.disbursalEmi3)
                    }
                    if(loanEMIPack.disbursalAmount4){
                        disbursalEMIs.push(loanEMIPack.disbursalEmi4)
                    }
                    if (scope.formRequestData.loanApplicationSanctionTrancheDatas && scope.formRequestData.loanApplicationSanctionTrancheDatas.length > 0) {
                        if (scope.formRequestData.repaymentsStartingFromDate != undefined && scope.formRequestData.repaymentsStartingFromDate != '') {
                            var dateValue = scope.formRequestData.repaymentsStartingFromDate;
                            var date = new Date(dateValue);
                            if (date.toString() != 'Invalid Date') {
                                var len = scope.formRequestData.loanApplicationSanctionTrancheDatas.length;
                                for(var i=0; i < len; i++){
                                    var emiPackNumber = disbursalEMIs[i];
                                    if(disbursalEMIs[i] != 0){
                                        emiPackNumber = disbursalEMIs[i] - 1;
                                    }else{
                                        if (scope.formRequestData.expectedDisbursementDate != undefined && scope.formRequestData.expectedDisbursementDate != '') {
                                            dateValue = scope.formRequestData.expectedDisbursementDate;
                                            date = new Date(dateValue);
                                        }
                                    }
                                    if(scope.formRequestData.repaymentPeriodFrequencyEnum === 0){
                                        date = date.setDate(date.getDate()+(parseInt(scope.formRequestData.repayEvery)*emiPackNumber));
                                    }else if(scope.formRequestData.repaymentPeriodFrequencyEnum === 1){
                                        date = date.setDate(date.getDate()+(parseInt(scope.formRequestData.repayEvery)*7*emiPackNumber));
                                    }else if(scope.formRequestData.repaymentPeriodFrequencyEnum === 2){
                                        date = date.setMonth(date.getMonth()+(parseInt(scope.formRequestData.repayEvery)*emiPackNumber));
                                    }
                                    scope.formRequestData.loanApplicationSanctionTrancheDatas[i].expectedTrancheDisbursementDate = dateFilter(date, scope.df);
                                    dateValue = scope.formRequestData.repaymentsStartingFromDate;
                                    date = new Date(dateValue);
                                }
                            }
                        }else{
                            var dateValue = scope.formRequestData.expectedDisbursementDate;
                            var date = new Date(dateValue);
                            if (date.toString() != 'Invalid Date') {
                                var len = scope.formRequestData.loanApplicationSanctionTrancheDatas.length;
                                for(var i=0; i < len; i++){
                                    if(scope.formRequestData.repaymentPeriodFrequencyEnum === 0){
                                        date = date.setDate(date.getDate()+(parseInt(scope.formRequestData.repayEvery)*disbursalEMIs[i]));
                                    }else if(scope.formRequestData.repaymentPeriodFrequencyEnum === 1){
                                        date = date.setDate(date.getDate()+(parseInt(scope.formRequestData.repayEvery)*7*disbursalEMIs[i]));
                                    }else if(scope.formRequestData.repaymentPeriodFrequencyEnum === 2){
                                        date = date.setMonth(date.getMonth()+(parseInt(scope.formRequestData.repayEvery)*disbursalEMIs[i]));
                                    }
                                    scope.formRequestData.loanApplicationSanctionTrancheDatas[i].expectedTrancheDisbursementDate = dateFilter(date, scope.df);
                                    dateValue = scope.formRequestData.expectedDisbursementDate;
                                    date = new Date(dateValue);
                                }
                            }
                        }
                    }
                }else{
                    if (scope.formRequestData.loanApplicationSanctionTrancheDatas && scope.formRequestData.loanApplicationSanctionTrancheDatas[0]) {
                        if (scope.formRequestData.expectedDisbursementDate != undefined && scope.formRequestData.expectedDisbursementDate != '') {
                            var dateValue = scope.formRequestData.expectedDisbursementDate;
                            if ((new Date(dateValue)).toString() != 'Invalid Date') {
                                scope.formRequestData.loanApplicationSanctionTrancheDatas[0].expectedTrancheDisbursementDate = dateFilter(new Date(dateValue), scope.df);
                            }
                        }

                    }
                }
            });

            scope.$watch('formRequestData.loanEMIPackId', function () {
                if(scope.formRequestData.loanEMIPackId){
                    var len = scope.loanaccountinfo.loanEMIPacks.length;
                    var loanEMIPack = {};
                    for(var i=0; i < len; i++){
                        if(scope.loanaccountinfo.loanEMIPacks[i].id == scope.formRequestData.loanEMIPackId){
                            loanEMIPack = scope.loanaccountinfo.loanEMIPacks[i];
                            break;
                        }
                    }
                    scope.formRequestData.loanAmountApproved = loanEMIPack.sanctionAmount;
                    scope.formRequestData.numberOfRepayments = loanEMIPack.numberOfRepayments;
                    scope.formRequestData.repaymentPeriodFrequencyEnum = loanEMIPack.repaymentFrequencyType.id;
                    scope.formRequestData.repayEvery = loanEMIPack.repaymentEvery;
                    scope.formRequestData.fixedEmiAmount = loanEMIPack.fixedEmi;
                    scope.formRequestData.termPeriodFrequencyEnum = loanEMIPack.repaymentFrequencyType.id;
                    scope.formRequestData.termFrequency = parseInt(loanEMIPack.repaymentEvery) * parseInt(loanEMIPack.numberOfRepayments);
                    var disbursalEMIs = [0];
                     scope.formRequestData.loanApplicationSanctionTrancheDatas = [];
                    if(loanEMIPack.disbursalAmount1){
                        var loanApplicationSanctionTrancheDatas = {trancheAmount:loanEMIPack.disbursalAmount1};
                        scope.formRequestData.loanApplicationSanctionTrancheDatas.push(loanApplicationSanctionTrancheDatas);
                    }
                    if(loanEMIPack.disbursalAmount2){
                        var loanApplicationSanctionTrancheDatas = {trancheAmount:loanEMIPack.disbursalAmount2};
                        scope.formRequestData.loanApplicationSanctionTrancheDatas.push(loanApplicationSanctionTrancheDatas);
                        disbursalEMIs.push(loanEMIPack.disbursalEmi2)
                    }
                    if(loanEMIPack.disbursalAmount3){
                        var loanApplicationSanctionTrancheDatas = {trancheAmount:loanEMIPack.disbursalAmount3};
                        scope.formRequestData.loanApplicationSanctionTrancheDatas.push(loanApplicationSanctionTrancheDatas);
                        disbursalEMIs.push(loanEMIPack.disbursalEmi3)
                    }
                    if(loanEMIPack.disbursalAmount4){
                        var loanApplicationSanctionTrancheDatas = {trancheAmount:loanEMIPack.disbursalAmount4};
                        scope.formRequestData.loanApplicationSanctionTrancheDatas.push(loanApplicationSanctionTrancheDatas);
                        disbursalEMIs.push(loanEMIPack.disbursalEmi4)
                    }
                    if (scope.formRequestData.loanApplicationSanctionTrancheDatas && scope.formRequestData.loanApplicationSanctionTrancheDatas.length > 0) {
                        if (scope.formRequestData.expectedDisbursementDate != '' && scope.formRequestData.expectedDisbursementDate != undefined) {
                            var dateValue = scope.formRequestData.expectedDisbursementDate;
                            var date = new Date(dateValue);
                            if (date.toString() != 'Invalid Date') {
                                var len = scope.formRequestData.loanApplicationSanctionTrancheDatas.length;
                                for(var i=0; i < len; i++){
                                    if(scope.formRequestData.repaymentPeriodFrequencyEnum === 0){
                                        date = date.setDate(date.getDate()+(parseInt(scope.formRequestData.repayEvery)*disbursalEMIs[i]));
                                    }else if(scope.formRequestData.repaymentPeriodFrequencyEnum === 1){
                                        date = date.setDate(date.getDate()+(parseInt(scope.formRequestData.repayEvery)*7*disbursalEMIs[i]));
                                    }else if(scope.formRequestData.repaymentPeriodFrequencyEnum === 2){
                                        date = date.setMonth(date.getMonth()+(parseInt(scope.formRequestData.repayEvery)*disbursalEMIs[i]));
                                    }
                                    scope.formRequestData.loanApplicationSanctionTrancheDatas[i].expectedTrancheDisbursementDate = dateFilter(date, scope.df);
                                    dateValue = scope.formRequestData.expectedDisbursementDate;
                                    date = new Date(dateValue);
                                }
                            }
                        }
                    }
                }
            });

            scope.submitForApproval = function () {
                scope.previewRepayments(false);
                scope.formRequestData.expectedDisbursementDate = dateFilter(scope.formRequestData.expectedDisbursementDate, scope.df);
                scope.formRequestData.repaymentsStartingFromDate =  dateFilter(scope.formRequestData.repaymentsStartingFromDate, scope.df);
                if(scope.formRequestData.approvedOnDate){
                    scope.formRequestData.approvedOnDate = dateFilter(new Date(scope.formRequestData.approvedOnDate),scope.df);
                }
                this.formRequestData.locale = scope.optlang.code;
                this.formRequestData.dateFormat = scope.df;

                if (scope.formRequestData.loanApplicationSanctionTrancheDatas != undefined && scope.formRequestData.loanApplicationSanctionTrancheDatas.length > 0) {
                    var length = scope.formRequestData.loanApplicationSanctionTrancheDatas.length;
                    for (var i = 0; i < length; i++) {
                        if(scope.formRequestData.loanApplicationSanctionTrancheDatas[i].expectedTrancheDisbursementDate != undefined){
                            scope.formRequestData.loanApplicationSanctionTrancheDatas[i].expectedTrancheDisbursementDate = dateFilter(scope.formRequestData.loanApplicationSanctionTrancheDatas[i].expectedTrancheDisbursementDate, scope.df);
                            scope.formRequestData.loanApplicationSanctionTrancheDatas[i].locale = scope.optlang.code;
                            scope.formRequestData.loanApplicationSanctionTrancheDatas[i].dateFormat = scope.df;
                        }else {
                            scope.formRequestData.loanApplicationSanctionTrancheDatas.splice(i, 1);
                            length = length-1;
                            i--;
                        }
                    }
                }else{
                    delete scope.formRequestData.loanApplicationSanctionTrancheDatas;
                }
                if(scope.formRequestData.loanEMIPackData && _.isUndefined(scope.formRequestData.loanEMIPackId)){
                    scope.formRequestData.loanEMIPackId = scope.formRequestData.loanEMIPackData.id;
                }
                if(scope.formRequestData.loanEMIPackData){
                    delete scope.formRequestData.loanEMIPackData;
                }
                scope.submitData = {};
                scope.submitData.formValidationData = {};
                scope.submitData.formRequestData = {};
                angular.copy(scope.formValidationData,scope.submitData.formValidationData);
                if(scope.submitData.formValidationData.syncRepaymentsWithMeeting){
                    delete scope.submitData.formValidationData.syncRepaymentsWithMeeting;
                }
                scope.submitData.formValidationData = scope.formValidationData;
                angular.copy(scope.formRequestData,scope.submitData.formRequestData);
                if (scope.charges.length > 0) {
                    scope.submitData.formRequestData.charges = [];
                    for (var i in scope.charges) {
                        var charge = {};
                        charge.chargeId = scope.charges[i].chargeId;
                        charge.amount = scope.charges[i].amount;
                        if(scope.charges[i].dueDate){
                            charge.dueDate = dateFilter(scope.charges[i].dueDate, scope.df);
                        }
                        charge.isMandatory = scope.charges[i].isMandatory;
                        //charge.locale = scope.optlang.code;
                        //charge.dateFormat = scope.df;
                        scope.submitData.formRequestData.charges.push(charge);
                    }
                }
                /**
                 * This formValidationData data is required only for validation purpose
                 * @type {{}|*}
                 */

                if(scope.submitData.formValidationData.disbursementData){
                    delete scope.submitData.formValidationData.disbursementData;
                }

                if(scope.submitData.formValidationData.fixedEmiAmount){
                    delete scope.submitData.formValidationData.disbursementData;
                }

                if(scope.submitData.formValidationData.loanOfficerId){
                    delete scope.submitData.formValidationData.loanOfficerId;
                }

                if(scope.submitData.formRequestData.fixedEmiAmount){
                    delete scope.submitData.formRequestData.fixedEmiAmount;
                }

                resourceFactory.loanApplicationReferencesResource.update({
                    loanApplicationReferenceId: scope.loanApplicationReferenceId,
                    command: 'submitforapproval'
                }, this.submitData, function (data) {
                    showSummary();
                });
            };

            scope.approve = function (onSuccess) {
                scope.previewRepayments(false);
                scope.formRequestData.expectedDisbursementDate = dateFilter(scope.formRequestData.expectedDisbursementDate, scope.df);
                scope.formRequestData.repaymentsStartingFromDate =  dateFilter(scope.formRequestData.repaymentsStartingFromDate, scope.df);
                if(scope.formRequestData.approvedOnDate){
                    scope.formRequestData.approvedOnDate = dateFilter(new Date(scope.formRequestData.approvedOnDate),scope.df);
                }
                this.formRequestData.locale = scope.optlang.code;
                this.formRequestData.dateFormat = scope.df;
                if (scope.formRequestData.loanApplicationSanctionTrancheDatas != undefined && scope.formRequestData.loanApplicationSanctionTrancheDatas.length > 0) {
                    for (var i = 0; i < scope.formRequestData.loanApplicationSanctionTrancheDatas.length; i++) {
                        scope.formRequestData.loanApplicationSanctionTrancheDatas[i].expectedTrancheDisbursementDate = dateFilter(scope.formRequestData.loanApplicationSanctionTrancheDatas[i].expectedTrancheDisbursementDate, scope.df);
                        scope.formRequestData.loanApplicationSanctionTrancheDatas[i].locale = scope.optlang.code;
                        scope.formRequestData.loanApplicationSanctionTrancheDatas[i].dateFormat = scope.df;
                    }
                }
                if(scope.formRequestData.loanEMIPackData && _.isUndefined(scope.formRequestData.loanEMIPackId)){
                    scope.formRequestData.loanEMIPackId = scope.formRequestData.loanEMIPackData.id;
                }
                if(scope.formRequestData.loanEMIPackData){
                    delete scope.formRequestData.loanEMIPackData;
                }
                scope.submitData = {};
                scope.submitData.formValidationData = {};
                angular.copy(scope.formValidationData,scope.submitData.formValidationData);
                if(scope.submitData.formValidationData.syncRepaymentsWithMeeting){
                    delete scope.submitData.formValidationData.syncRepaymentsWithMeeting;
                }
                scope.submitData.formValidationData = scope.formValidationData;
                scope.submitData.formRequestData = scope.formRequestData;
                if (scope.charges.length > 0) {
                    scope.submitData.formRequestData.charges = [];
                    for (var i in scope.charges) {
                        var charge = {};
                        charge.chargeId = scope.charges[i].chargeId;
                        charge.amount = scope.charges[i].amount;
                        if(scope.charges[i].dueDate){
                            charge.dueDate = dateFilter(scope.charges[i].dueDate, scope.df);
                        }
                        charge.isMandatory = scope.charges[i].isMandatory;
                        //charge.locale = scope.optlang.code;
                        //charge.dateFormat = scope.df;
                        scope.submitData.formRequestData.charges.push(charge);
                    }
                }
                /**
                 * This formValidationData data is required only for validation purpose
                 * @type {{}|*}
                 */
                resourceFactory.loanApplicationReferencesResource.update({
                    loanApplicationReferenceId: scope.loanApplicationReferenceId,
                    command: 'approve'
                }, this.submitData, function (data) {
                    if (onSuccess) {
                        onSuccess();
                    }
                    showSummary();
                });
            };

            scope.cancel = function () {
                if (scope.formData.groupId) {
                    location.path('/viewgroup/' + scope.formData.groupId);
                } else if (scope.formData.clientId) {
                    location.path('/viewclient/' + scope.formData.clientId);
                }
            };

            scope.addTranches = function () {
                var loanApplicationSanctionTrancheDatas = {};
                loanApplicationSanctionTrancheDatas.fixedEmiAmount = scope.formData.fixedEmiAmount;
                scope.formRequestData.loanApplicationSanctionTrancheDatas.push(loanApplicationSanctionTrancheDatas);
            };

            scope.deleteTranches = function (index) {
                scope.formRequestData.loanApplicationSanctionTrancheDatas.splice(index, 1);
            };

            scope.addCharge = function () {
                if(scope.chargeFormData){
                    if (scope.chargeFormData.chargeId) {
                        resourceFactory.chargeResource.get({chargeId: this.chargeFormData.chargeId, template: 'true'}, function (data) {
                            data.chargeId = data.id;
                            if(scope.productLoanCharges && scope.productLoanCharges.length > 0){
                                for(var i in scope.productLoanCharges){
                                    if(scope.productLoanCharges[i].chargeData){
                                        if(data.chargeId == scope.productLoanCharges[i].chargeData.id){
                                            data.isMandatory = scope.productLoanCharges[i].isMandatory;
                                            break;
                                        }
                                    }
                                }
                            }
                            scope.charges.push(data);
                            scope.chargeFormData.chargeId = undefined;
                        });
                    }
                }
            };

            scope.deleteCharge = function (index) {
                scope.charges.splice(index, 1);
            };

            scope.report = false;
            scope.viewRepaymentDetails = function() {
                if(scope.repaymentscheduleinfo && scope.repaymentscheduleinfo.periods){
                    resourceFactory.clientResource.get({clientId: scope.formData.clientId}, function (data) {
                        scope.clientData = data;
                    });
                    scope.repaymentData = [];
                    scope.disbursedData = [];
                    for(var i in scope.repaymentscheduleinfo.periods) {
                        if(scope.repaymentscheduleinfo.periods[i].period) {
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
                    '</head><body onload="window.print()">' + printContents + '<br><br><table class="table"><tr><td width="210"><h4>Credit Officer</h4></td><td width="210"><h4>Branch Manager</h4></td><td><h4>Customer Signature</h4></td></tr></table></body></html>');
                popupWin.document.close();
            };

            scope.backToLoanDetails = function () {
                scope.report = false;
            };

            scope.doPreTaskActionStep = function(actionName){
                if(actionName === 'approve'){
                    if (!_.isUndefined(scope.approveloanapplicationform) && scope.approveloanapplicationform.$valid) {
                        scope.approve(function (){
                            scope.doActionAndRefresh(actionName);
                        });
                    }else{
                        scope.issubmitted = true;
                        scope.doActionAndRefresh(actionName);
                    }
                }else if(actionName === 'activitycomplete'){
                    if(scope.status=='SUMMARY'){
                        scope.doActionAndRefresh(actionName);
                    }
                    else{
                        scope.setTaskActionExecutionError("lable.error.activity.survey.not.completed");
                    }
                }else{
                    scope.doActionAndRefresh(actionName);
                }

            };

        }


    });
    mifosX.ng.application.controller('loanapplicationapprovalActivityController', ['$controller','$scope', 'ResourceFactory', '$location',
        'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.loanapplicationapprovalActivityController]).run(function ($log) {
        $log.info("loanapplicationapprovalActivityController initialized");
    });
}(mifosX.controllers || {}));
