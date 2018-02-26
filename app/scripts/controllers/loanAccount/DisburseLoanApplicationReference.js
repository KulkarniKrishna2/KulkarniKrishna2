(function (module) {
    mifosX.controllers = _.extend(module, {

        DisburseLoanApplicationReference: function (scope, routeParams, resourceFactory, location, $modal, dateFilter) {

            scope.issubmitted = false;
            scope.loanApplicationReferenceId = routeParams.loanApplicationReferenceId;
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

            //2F Authentication
            scope.catureFP = false ;
            scope.enableClientVerification = scope.isSystemGlobalConfigurationEnabled('client-verification');
            scope.canForceDisburse = false;
            scope.commandParam = 'disburse';
            scope.canDisburseToGroupBankAccounts = false;
            scope.allowBankAccountsForGroups = scope.isSystemGlobalConfigurationEnabled('allow-bank-account-for-groups');
            scope.allowDisbursalToGroupBankAccounts = scope.isSystemGlobalConfigurationEnabled('allow-multiple-bank-disbursal');
            scope.groupBankAccountDetailsData = [];
            scope.bankAccountTemplate={};
            scope.isInvalid = false;
            scope.applicableOnRepayment = 1;
            scope.paymentTypes = [];

            resourceFactory.loanApplicationReferencesTemplateResource.get({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (data) {
                scope.paymentTypes = data.paymentOptions;
                scope.paymentModeOptions = data.paymentModeOptions;
                scope.transactionAuthenticationOptions = data.transactionAuthenticationOptions;
            });

            resourceFactory.loanApplicationReferencesResource.getByLoanAppId({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (data) {
                scope.formData = data;
                if(scope.formData.expectedDisbursalPaymentType && scope.formData.expectedDisbursalPaymentType.name){
                    scope.formRequestData.disburse.paymentTypeId = scope.formData.expectedDisbursalPaymentType.id;
                    if(scope.formData.expectedDisbursalPaymentType.paymentMode){
                        scope.disbursementMode = scope.formData.expectedDisbursalPaymentType.paymentMode.id;
                    }else{
                        scope.disbursementMode = 3;
                    }
                    scope.changeDisbursalMode();
                    
                }
                scope.accountType = scope.formData.accountType.value.toLowerCase();
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
                    resourceFactory.clientResource.get({clientId: scope.formData.clientId, isFetchAdressDetails : true}, function (clientData) {
                        scope.client = clientData;
                       if (scope.formData.status.id === 300 && scope.enableClientVerification && !scope.client.isVerified){
                        scope.canForceDisburse = true;
                       }
                    });
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
                                        scope.formRequestData.disburse.transactionAmount =  disbursementData.principal;
                                    }
                                    if(disbursementData.discountOnDisbursalAmount){
                                        scope.formRequestData.disburse.discountOnDisbursalAmount = disbursementData.discountOnDisbursalAmount;
                                        scope.formRequestData.submitApplication.discountOnDisbursalAmount = disbursementData.discountOnDisbursalAmount ;
                                    }
                                }
                            }
                        } else {
                            if (scope.formRequestData.disburse.transactionAmount == undefined) {
                                scope.formRequestData.disburse.transactionAmount = scope.formData.approvedData.netLoanAmount;
                            }
                        }
                        if (scope.formData.approvedData.fixedEmiAmount) {
                            scope.formRequestData.disburse.fixedEmiAmount = scope.formData.approvedData.fixedEmiAmount;
                        }
                        scope.loanProductChange(scope.formData.loanProductId);
                    });
                }
                ;
            });


            //2F Authentication
            scope.catureFP = false ;

            scope.checkBiometricRequired = function() {
                if( scope.transactionAuthenticationOptions &&  scope.transactionAuthenticationOptions.length > 0) {
                    for(var i in scope.transactionAuthenticationOptions) {
                        var paymentTypeId = Number(scope.transactionAuthenticationOptions[i].paymentTypeId) ;
                        var amount = Number(scope.transactionAuthenticationOptions[i].amount) ;
                        var authenticationType = scope.transactionAuthenticationOptions[i].authenticationType ;
                        if(authenticationType === 'Aadhaar fingerprint' && scope.formRequestData.disburse.paymentTypeId === paymentTypeId && scope.formRequestData.disburse.transactionAmount>= amount) {
                            scope.catureFP = true ;
                            scope.formRequestData.disburse.authenticationRuleId = scope.transactionAuthenticationOptions[i].authenticationRuleId ;
                            return ;
                        }
                    }
                }
                scope.catureFP = false ;
                delete scope.formData.authenticationRuleId ;
            };

            var FingerPrintController = function ($scope, $modalInstance) {
                $scope.isFingerPrintCaptured = false ;

                $scope.submit = function () {
                    if($scope.isFingerPrintCaptured === true) {
                        $modalInstance.close('Close');
                        scope.finalSubmit() ;
                    }
                };

                $scope.clearFingerPrint = function() {
                    imagedata= document.getElementById("biometric");
                    imagedata.src= "#";
                    delete scope.formRequestData.disburse.clientAuthData ;
                    delete scope.formRequestData.disburse.location ;
                    delete scope.formRequestData.disburse.authenticationType ;
                    $scope.isFingerPrintCaptured = false ;
                };

                $scope.captureFingerprint = function() {
                    //Get this url from platform
                    var url = "https://localhost:15001/CaptureFingerprint";
                    if (window.XMLHttpRequest)
                    {// code for IE7+, Firefox, Chrome, Opera, Safari

                        xmlhttp=new XMLHttpRequest();

                    }
                    else
                    {// code for IE6, IE5
                        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");

                    }
                    xmlhttp.onreadystatechange=function()
                    {
                        if (xmlhttp.readyState==4 && xmlhttp.status==200)
                        {
                            fpobject = JSON.parse(xmlhttp.responseText);
                            imagedata= document.getElementById("biometric");
                            imagedata.src= "data:image;base64,"+fpobject.Base64BMPIMage;
                            scope.formRequestData.disburse.clientAuthData = fpobject.Base64ISOTemplate ;
                            scope.formRequestData.disburse.location = {} ;
                            scope.formRequestData.disburse.location.locationType = "pincode" ;
                            scope.formRequestData.disburse.location.pincode = "560010" ;
                            scope.formRequestData.disburse.authenticationType = "fingerprint" ;
                            $scope.isFingerPrintCaptured = true ;
                        }

                        xmlhttp.onerror = function () {
                            alert("Check If Morpho Service/Utility is Running");
                        }

                    }
                    var timeout = 5;
                    var fingerindex = 1;
                    xmlhttp.open("POST",url+"?"+timeout+"$"+fingerindex,true);
                    xmlhttp.send();
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                    delete scope.formRequestData.disburse.clientAuthData ;
                    delete scope.formRequestData.disburse.location ;
                    delete scope.formRequestData.disburse.authenticationType ;
                    $scope.isFingerPrintCaptured = false ;
                };
            };

            scope.getFingerPrint = function () {
                $modal.open({
                    templateUrl: 'fingerprint.html',
                    controller: FingerPrintController
                });
            };


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

                    if(scope.formData.approvedData.amountForUpfrontCollection){
                        scope.formRequestData.submitApplication.amountForUpfrontCollection = scope.formData.approvedData.amountForUpfrontCollection;
                    }

                    if(scope.formData.approvedData.discountOnDisbursalAmount){
                        scope.formRequestData.disburse.discountOnDisbursalAmount = scope.formData.approvedData.discountOnDisbursalAmount;
                        scope.formRequestData.submitApplication.discountOnDisbursalAmount = scope.formData.approvedData.discountOnDisbursalAmount;
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
                    this.formRequestData.submitApplication.interestChargedFromDate = this.date.interestChargedFromDate;
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
                if(scope.formData.approvedData.netLoanAmount && scope.formData.approvedData.netLoanAmount > 0){
                     scope.formRequestPreveieData.principal = scope.formData.approvedData.netLoanAmount;
                }else{
                   scope.formRequestPreveieData.principal = scope.formData.approvedData.loanAmountApproved; 
                }
                
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
                scope.checkBiometricRequired() ;
                if(scope.catureFP==true) {
                    scope.getFingerPrint() ;
                }else {
                    scope.finalSubmit() ;
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
                scope.finalSubmit(); 
            };

            scope.finalSubmit = function () {
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
                        scope.formRequestData.submitApplication.disbursementData[i].expectedDisbursementDate = dateFilter(scope.formRequestData.submitApplication.disbursementData[i].expectedDisbursementDate, scope.df);
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

                if (this.formRequestData.disburse.actualDisbursementDate) {
                    this.formRequestData.disburse.actualDisbursementDate = dateFilter(new Date(this.formRequestData.disburse.actualDisbursementDate), scope.df)
                }
                this.formRequestData.disburse.locale = scope.optlang.code;
                this.formRequestData.disburse.dateFormat = scope.df;

                this.formRequestData.locale = scope.optlang.code;
                this.formRequestData.dateFormat = scope.df;

                if(scope.formData.expectedDisbursalPaymentType && scope.formData.expectedDisbursalPaymentType.name){
                    this.formRequestData.expectedDisbursalPaymentType = scope.formData.expectedDisbursalPaymentType.id;
                    if(scope.formData.expectedDisbursalPaymentType.paymentMode){
                        scope.disbursementMode = scope.formData.expectedDisbursalPaymentType.paymentMode.id;
                    }else{
                        scope.disbursementMode = 3;
                    }
                }

                if(scope.formData.expectedRepaymentPaymentType && scope.formData.expectedRepaymentPaymentType.name){
                    this.formRequestData.expectedRepaymentPaymentType = scope.formData.expectedDisbursalPaymentType.id;
                }

                this.formRequestData.disburse.skipAuthenticationRule = true;

                scope.disburseData = {};
                angular.copy(scope.formRequestData,scope.disburseData);
                delete scope.disburseData.submitApplication.syncRepaymentsWithMeeting;
                resourceFactory.loanApplicationReferencesResource.update({
                    loanApplicationReferenceId: scope.loanApplicationReferenceId,
                        command: scope.commandParam
                    }, this.formRequestData, function (disburseData) {
                        location.path('/viewclient/' + scope.formData.clientId);
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
                if (scope.accountType == 'individual') {
                    location.path('/viewclient/' + scope.formData.clientId);
                } else if (scope.formData.groupId) {
                    location.path('/viewgroup/' + scope.formData.groupId);
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
                } else 
                if ((scope.multipleBankDisbursalData.findIndex(x => x.groupBankAccountDetailAssociationId == scope.bankAccountTemplate.bankAccountAssociation.groupBankAccountDetailAssociationId) < 0) && scope.bankAccountTemplate.disbursalAmount) {
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
                } else{
                    scope.isInvalid = true;
                    scope.errorMessage = "label.error.bank.account.already.present";
                }
            };

            scope.deleteRecord = function(index){
                scope.multipleBankDisbursalData.splice(index,1);
            };

            scope.backToLoanDetails = function () {
                scope.report = false;
            }

            scope.changeDisbursalMode = function(){
                scope.disbursementTypeOption = [];
                resourceFactory.loanApplicationReferencesTemplateResource.get({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (data) {
                    scope.paymentTypes = data.paymentOptions;
                    scope.paymentModeOptions = data.paymentModeOptions;
                    if(scope.paymentTypes){
                        for(var i in scope.paymentTypes){
                            if((scope.paymentTypes[i].paymentMode== undefined || 
                                scope.paymentTypes[i].paymentMode.id==scope.disbursementMode) && 
                                (scope.paymentTypes[i].applicableOn== undefined || scope.paymentTypes[i].applicableOn.id != scope.applicableOnRepayment)){
                                scope.disbursementTypeOption.push(scope.paymentTypes[i]);
                            }
                        }
                    
                    }
                });
                
            };
        }
    });
    mifosX.ng.application.controller('DisburseLoanApplicationReference', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal','dateFilter', mifosX.controllers.DisburseLoanApplicationReference]).run(function ($log) {
        $log.info("DisburseLoanApplicationReference initialized");
    });
}(mifosX.controllers || {}));