(function (module) {
    mifosX.controllers = _.extend(module, {
        NewcamActivityController: function ($controller, scope, resourceFactory, API_VERSION, location, dateFilter, http, routeParams, API_VERSION, $rootScope,localStorageService,$modal, $sce) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.approveloanapplicationdetails = "";
            scope.status = 'SUMMARY';
            scope.loanApplicationReferenceId = scope.taskconfig['loanApplicationId'];
            scope.clientId = scope.taskconfig['clientId'];
            scope.approvalType = scope.taskconfig['approvalType'];
            scope.identitydocuments = [];
            scope.formValidationData = {};
            scope.showViewCBHistoryReport = true;

            scope.ruleScore = -1;
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.creditBureau){
                scope.showViewCBHistoryReport = !scope.response.uiDisplayConfigurations.creditBureau.isHiddenField.viewHistoryCBReportButton;
            }
            function initTask() {
                scope.clientId = scope.taskconfig['clientId'];
                scope.loanApplicationReferenceId = scope.taskconfig['loanApplicationId'];
                scope.entityType = "loanapplication";
                scope.entityId = scope.loanApplicationReferenceId;
            };
            initTask();

            scope.onApproval = function(){
                location.path('/approveloanapplicationreference/' + getLoanApplicationId());
            };

            scope.onReject = function(){

            };

            function getLoanApplicationId(){
                return scope.taskconfig['loanApplicationId'];
            }

            scope.restrictDate = new Date();

            scope.formRequestData = {};
            scope.formRequestData.approvedOnDate = dateFilter(new Date(scope.restrictDate), scope.df);

            scope.charges = [];
            scope.existingCharges = [];
            var curIndex = 0;

            function fetchClientData(){
                resourceFactory.clientResource.get({clientId: scope.clientId}, function (data) {
                    scope.clientData = data;
                    if (data.staffId != null) {
                        scope.formValidationData.loanOfficerId = data.staffId;
                    }
                    if (data.imagePresent) {
                        http({
                            method: 'GET',
                            url: $rootScope.hostUrl + API_VERSION + '/client/' + scope.clientId + '/images?maxHeight=150'
                        }).then(function (imageData) {
                            scope.imageData = imageData.data[0];
                            http({
                                method: 'GET',
                                url: $rootScope.hostUrl + API_VERSION + '/client/' + scope.clientId + '/images/'+scope.imageData.imageId+'?maxHeight=150'
                            }).then(function (imageData) {
                                scope.image = imageData.data;
                            });
                        });
                    }
                });


                resourceFactory.clientResource.getAllClientDocuments({clientId: scope.clientId, anotherresource: 'identifiers'}, function (data) {
                    scope.identitydocuments = data;
                    for (var i = 0; i < scope.identitydocuments.length; i++) {
                        resourceFactory.clientIdentifierResource.get({clientIdentityId: scope.identitydocuments[i].id}, function (data) {
                            for (var j = 0; j < scope.identitydocuments.length; j++) {
                                if (data.length > 0 && scope.identitydocuments[j].id == data[0].parentEntityId) {
                                    for (var l in data) {

                                        var loandocs = {};
                                        loandocs = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                                        data[l].docUrl = loandocs;
                                    }
                                    scope.identitydocuments[j].documents = data;
                                }
                            }
                        });
                    }
                });

                try{
                    resourceFactory.workDetailResource.get({clientId: scope.clientId}, function (data) {
                        scope.workData = data;
                    });
                }catch(err){

                }

                resourceFactory.familyDetails.getAll({clientId: scope.clientId}, function (data) {
                    scope.familyMembers = data;
                });

                try{
                    resourceFactory.clientDocumentVerificationResource.get({clientId: scope.clientId}, function (data) {
                        var accessToken = localStorageService.getFromLocalStorage("tokendetails").access_token;
                        for (var l in data) {
                            for( i in data[l].documents){
                                data[l].documents[i].docUrl = API_VERSION + '/clients/' + scope.clientId + '/documents/' + data[l].documents[i].id + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier+'&access_token='+accessToken;;
                            }
                        }
                        scope.clientdocumentverifications = data;
                    });
                }catch(err){

                }
            }
            scope.incomeAndexpense = function(){
                resourceFactory.incomeExpenseAndHouseHoldExpense.getAll({clientId: scope.clientId},function(data){
                    scope.incomeAndExpenses = data;
                    scope.totalIncomeOcc = scope.calculateOccupationTotal();
                    scope.totalIncomeAsset = scope.calculateTotalAsset();
                    scope.totalHouseholdExpense = scope.calculateTotalExpense();
                });
            };

            scope.showSummary = function () {
                scope.forceCriteriaDisable = true;
                fetchClientData();
                scope.incomeAndexpense();
                // existingLoans();
                //scope.getCreditBureauReportSummary();
                resourceFactory.loanApplicationReferencesResource.getByLoanAppId({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (applicationData) {
                    scope.formData = applicationData;
                    scope.loanProductChange(applicationData.loanProductId);
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
                            showEditForm();
                        });
                    }else if(scope.formData.status.id === 200){
                        showEditForm();
                    }else if(scope.formData.status.id > 200){
                        scope.status = 'SUMMARY';
                    }
                    if(scope.approvalType != undefined && scope.approvalType == "lenderApprove"){
                        scope.status = 'SUMMARY';
                    }
                });

                scope.forceCriteriaDisable = true;

            }

            scope.showSummary();

            function showEditForm(){
                scope.status = 'UPDATE';
            }

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
                    resourceFactory.loanApplicationReferencesResource.getByLoanAppId({
                        loanApplicationReferenceId: scope.loanApplicationReferenceId,
                        command: 'approveddata'
                    }, function (approveddata) {
                        if (approveddata.loanAppSanctionId) {
                            scope.formRequestData = approveddata;
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
                            if (approveddata.loanApplicationSanctionTrancheDatas) {
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
                        scope.formRequestData.maxOutstandingLoanBalance = scope.loanaccountinfo.maxOutstandingLoanBalance;
                        scope.formDataForValidtion();
                    });
                });
            };

            scope.formValidationData = {};
            scope.formDataForValidtion = function () {
                scope.formValidationData.submittedOnDate = dateFilter(scope.formData.submittedOnDate, scope.df);
                scope.formValidationData.clientId = scope.formData.clientId;
                if (scope.formData.groupId) {
                    scope.formValidationData.groupId = scope.formData.groupId;
                }
                scope.previewClientLoanAccInfo();
                if (scope.loanaccountinfo.loanOfficerOptions && !scope.formData.loanOfficerId) {
                    resourceFactory.clientResource.get({clientId: routeParams.clientId}, function (data) {
                        // scope.clientData = data;
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

            scope.$watch('formRequestData.expectedDisbursementDate', function () {
                if (scope.formRequestData.loanApplicationSanctionTrancheDatas && scope.formRequestData.loanApplicationSanctionTrancheDatas[0]) {
                    if (scope.formRequestData.expectedDisbursementDate != '' && scope.formRequestData.expectedDisbursementDate != undefined) {
                        var dateValue = scope.formRequestData.expectedDisbursementDate;
                        if ((new Date(dateValue)).toString() != 'Invalid Date') {
                            scope.formRequestData.loanApplicationSanctionTrancheDatas[0].expectedTrancheDisbursementDate = dateFilter(new Date(dateValue), scope.df);
                        }
                    }
                }
            });

            scope.submit = function (onComplete) {
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
                var command = 'approve';
                if(scope.approvalType != undefined){
                    if(scope.approvalType == "requestForLenderApproval") {
                     command = 'requestforlenderapproval';
                    }
                    if(scope.approvalType == "lenderApprove") {
                        command = 'lenderApprove';
                    }
                }
                resourceFactory.loanApplicationReferencesResource.update({
                    loanApplicationReferenceId: scope.loanApplicationReferenceId,
                    command: command
                }, this.submitData, function (data) {
                    scope.status = 'SUMMARY';
                    onComplete();
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
            };

            scope.deleteCharge = function (index) {
                scope.charges.splice(index, 1);
            };

            scope.report = false;

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

            scope.$on('activityApprove', function (event, data) {
                if (!_.isUndefined(scope.approveloanapplicationform) && scope.approveloanapplicationform.$valid) {
                    scope.submit();
                }else{
                    scope.issubmitted = true;
                }
            });

            scope.doPreTaskActionStep = function(actionName){
                if(actionName === 'approve'){
                    if(scope.approvalType != undefined && scope.approvalType == "lenderApprove"){
                        resourceFactory.loanApplicationReferencesResource.update({
                            loanApplicationReferenceId: scope.loanApplicationReferenceId,
                            command: 'lenderApprove'
                        }, {}, function (data) {
                            scope.doActionAndRefresh(actionName);
                        });
                    }else{
                        if (!_.isUndefined(scope.approveloanapplicationform) && scope.approveloanapplicationform.$valid) {
                            scope.submit(function (){
                                scope.doActionAndRefresh(actionName);
                            });
                        }
                    }
                }else{
                    scope.doActionAndRefresh(actionName);
                }
            };

            scope.calculateOccupationTotal = function(){
                var total = 0;
                angular.forEach(scope.incomeAndExpenses, function(data){
                    if(!_.isUndefined(data.incomeExpenseData.cashFlowCategoryData.categoryEnum) && data.incomeExpenseData.cashFlowCategoryData.categoryEnum.id == 1){
                        if(!_.isUndefined(data.totalIncome) && !_.isNull(data.totalIncome)){
                            total = total + data.totalIncome;
                        }
                    }
                });
                return total;
            };

            scope.calculateTotalAsset = function(){
                var total = 0;
                angular.forEach(scope.incomeAndExpenses, function(data){
                    if(!_.isUndefined(data.incomeExpenseData.cashFlowCategoryData.categoryEnum) && data.incomeExpenseData.cashFlowCategoryData.categoryEnum.id == 2){
                        if(!_.isUndefined(data.totalIncome) && !_.isNull(data.totalIncome)){
                            total = total + data.totalIncome;
                        }
                    }
                });
                return total;
            };

            scope.calculateTotalExpense = function(){
                var total = 0;
                angular.forEach(scope.incomeAndExpenses, function(data){
                    if(!_.isUndefined(data.incomeExpenseData.cashFlowCategoryData.typeEnum) && data.incomeExpenseData.cashFlowCategoryData.typeEnum.id == 2){
                        if(!_.isUndefined(data.totalExpense) && !_.isNull(data.totalExpense)){
                            total = total + data.totalExpense;
                        }
                    }
                });
                return total;
            };

            scope.viewCreditBureauReport = false;
            scope.errorMessage = [];
            scope.cbResponseError = false;
            scope.cbLoanEnqResponseError = false;

            scope.trancheDisbursalId = routeParams.trancheDisbursalId;
            scope.cbStatusPending="PENDING";
            scope.cbStatusSuccess="SUCCESS";
            scope.cbStatusError="ERROR";



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

            var confirmCbEnquiryCtrl = function ($scope, $modalInstance) {
                $scope.initiateCBEnquiry = function () {
                    $modalInstance.close('initiateCBEnquiry');
                    location.path('/create/creditbureau/client/' + scope.clientId);
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.routeToViewCBReport = function (id) {
                location.path('/clients/'+scope.clientId+'/view/creditbureau/'+id+'/summary');
             };
 
             scope.routeToViewCBReportHistory = function (id) {
                 scope.fetchType = "history";
                 location.path('/clients/'+scope.clientId+'/view/creditbureau/'+id+'/summary').search({
                         fetchType:scope.fetchType});
             };

            scope.routeToLoanNextAction = function (loan) {
                var loanId = loan.id;
                var trancheDisbursalId = undefined;
                if(loan.productId){
                    scope.isTrancheDisbursalCreditCheck = scope.isSystemGlobalConfigurationEnabled('tranche-disbursal-credit-check');
                    if (scope.isTrancheDisbursalCreditCheck == true) {
                        scope.isCreditCheck = scope.isSystemGlobalConfigurationEnabled('credit-check');
                        if (scope.isCreditCheck == true) {
                            resourceFactory.loanProductResource.getCreditbureauLoanProducts({
                                loanProductId: loan.productId,
                                associations: 'creditBureaus',
                                clientId : scope.clientId
                            }, function (creditbureauLoanProduct) {
                                scope.creditbureauLoanProduct = creditbureauLoanProduct;
                                if (scope.creditbureauLoanProduct.isActive == true) {
                                    scope.isCBCheckReq = true;
                                    var multiTranchDataRequest = "multiDisburseDetails,emiAmountVariations";
                                    var loanApplicationReferenceId = "loanApplicationReferenceId";
                                    resourceFactory.LoanAccountResource.getLoanAccountDetails({loanId: loanId,  associations:multiTranchDataRequest+",loanApplicationReferenceId", exclude: 'guarantors'}, function (data) {
                                        scope.loandetails = data;
                                        if(!_.isUndefined(scope.loandetails.disbursementDetails)){
                                            var expectedDisbursementDate = undefined;
                                            for(var i in scope.loandetails.disbursementDetails){
                                                if(_.isUndefined(scope.loandetails.disbursementDetails[i].actualDisbursementDate)){
                                                    if(_.isUndefined(expectedDisbursementDate)){
                                                        expectedDisbursementDate = scope.loandetails.disbursementDetails[i].expectedDisbursementDate;
                                                        trancheDisbursalId = scope.loandetails.disbursementDetails[i].id;
                                                    }else{
                                                        if(expectedDisbursementDate > scope.loandetails.disbursementDetails[i].expectedDisbursementDate){
                                                            expectedDisbursementDate = scope.loandetails.disbursementDetails[i].expectedDisbursementDate;
                                                            trancheDisbursalId = scope.loandetails.disbursementDetails[i].id;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        routeToLoanNextActionUrl(loanId,trancheDisbursalId);
                                    });
                                }else{
                                    routeToLoanNextActionUrl(loanId,trancheDisbursalId);
                                }
                            });
                        }else{
                            routeToLoanNextActionUrl(loanId,trancheDisbursalId);
                        }
                    }else{
                        routeToLoanNextActionUrl(loanId,trancheDisbursalId);
                    }
                }else{
                    routeToLoanNextActionUrl(loanId,trancheDisbursalId);
                }
            };

            scope.clientCreditBureauReportSummaryLoaded = false;
            scope.getCreditBureauReportSummary = function () {
                if(!scope.clientCreditBureauReportSummaryLoaded){
                    scope.clientCreditBureauReportSummaryLoaded = true;
                    scope.limitForCB = scope.response.uiDisplayConfigurations.creditBureau.getlimit;
                    resourceFactory.creditBureauEnquiriesResource.getAll({"limit":scope.limitForCB},{
                        entityType: "client",
                        entityId: scope.clientId
                    }, function (data) {
                        scope.creditBureauEnquiries = data;
                        scope.checkIfStalePeriodExpired();
                    });
                }
            }
            scope.checkIfStalePeriodExpired = function () {
                var lastInitiatedDate = new Date('10/15/1800');
                if (scope.creditBureauEnquiries.length > 0) {
                    for (var i = 0; i < scope.creditBureauEnquiries.length; i++) {
                        if (scope.creditBureauEnquiries[i].status.code != "ERROR") {
                            var tempDate = new Date(scope.creditBureauEnquiries[i].createdDate);
                            if (tempDate > lastInitiatedDate) {
                                var lastInitiatedDate = tempDate;
                                var j = i;
                            }
                        }
                    }
                    if (j != undefined) {
                        scope.isStalePeriodExceeded = scope.creditBureauEnquiries[j].isStalePeriodExceeded;
                    }
                }
            }

            var viewCBEnquiryHistory = function(offset,limit,callback){
                resourceFactory.creditBureauEnquiriesResource.getAll({limit:limit,offset:offset,fetchType:scope.fetchType},{
                    entityType: "client",
                    entityId: scope.clientId
                }, callback);
            }
            scope.viewCreditBureauEnquiryHistory = function () {
                scope.showHistoryHeading = true;
                scope.creditBureauEnquiriesHistory = paginatorUsingOffsetService.paginate(viewCBEnquiryHistory, scope.limitForCBHistory);
            };

            scope.viewEnquiryDocument = function(enquiryId, reportEntityType) {
                var reportEntityType = "CreditBureau";
                var url = $rootScope.hostUrl + '/fineract-provider/api/v1/enquiry/creditbureau/' + reportEntityType + '/' +
                    enquiryId + '/attachment';
                url = $sce.trustAsResourceUrl(url);
                http.get(url, { responseType: 'arraybuffer' }).
                success(function(data, status, headers, config) {
                    var supportedContentTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/html', 'application/xml', 'text/plain'];
                    var contentType = headers('Content-Type');
                    var file = new Blob([data], { type: contentType });
                    var fileContent = URL.createObjectURL(file);
                    if (supportedContentTypes.indexOf(contentType) > -1) {
                        var docData = $sce.trustAsResourceUrl(fileContent);
                        window.open(docData);
                    }
                });
            };

            scope.isReportPresent = false;
          /*  function constructLoanSummary() {
                if (!_.isUndefined(scope.activeLoan)) {
                    delete scope.activeLoan;
                }
                if (!_.isUndefined(scope.closedLoan)) {
                    delete scope.closedLoan;
                }
                constructActiveLoanSummary();
                constructClosedLoanSummary();
            };*/

            scope.getNumberArray = function(num) {
                return new Array(num);
            };

            scope.runCriteriaCheck = function(){
                scope.taskCriteriaCheck();
            };

            scope.showImageModal = function (name, imageUrl) {
                scope.selectedImageName = name;
                scope.selectedImageUrl = imageUrl;
                $modal.open({
                    templateUrl: 'views/common/imagepopup.html',
                    controller: ViewImageCtrl,
                    windowClass: 'modalwidth800'
                });
            };
            var ViewImageCtrl = function ($scope, $modalInstance) {
                $scope.selectedImageName = scope.selectedImageName;
                $scope.selectedImageUrl = scope.selectedImageUrl;
                $scope.cancelImageModal = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.viewCamReport = function () {
                //scope.printbtn = true;
                scope.report = true;
                scope.viewLoanReport = false;
                scope.viewReport = true;
                scope.hidePentahoReport = true;
                scope.formData.outputType = 'PDF';
                scope.baseURL = $rootScope.hostUrl + API_VERSION + "/runreports/" + encodeURIComponent("TW CAM Report");
                scope.baseURL += "?output-type=" + encodeURIComponent(scope.formData.outputType)+"&locale="+scope.optlang.code;

                var reportParams = "";
                var paramName = "R_loanApplicationId";
                reportParams += encodeURIComponent(paramName) + "=" + encodeURIComponent(scope.loanApplicationReferenceId);
                if (reportParams > "") {
                    scope.baseURL += "&" + reportParams;
                }
                // allow untrusted urls for iframe http://docs.angularjs.org/error/$sce/insecurl
                baseURL = $sce.trustAsResourceUrl(scope.baseURL);
                http.get(baseURL, { responseType: 'arraybuffer' }).
                success(function(data, status, headers, config) {
                    var contentType = headers('Content-Type');
                    var file = new Blob([data], { type: contentType });
                    var fileContent = URL.createObjectURL(file);
                    scope.viewReportDetails = $sce.trustAsResourceUrl(fileContent);
                });

            };
        }
    });
    mifosX.ng.application.controller('NewcamActivityController', ['$controller','$scope', 'ResourceFactory', 'API_VERSION', '$location', 'dateFilter','$http', '$routeParams', 'API_VERSION', '$rootScope','localStorageService','$modal', '$sce', mifosX.controllers.NewcamActivityController]).run(function ($log) {
        $log.info("NewcamActivityController initialized");
    });
}(mifosX.controllers || {}));