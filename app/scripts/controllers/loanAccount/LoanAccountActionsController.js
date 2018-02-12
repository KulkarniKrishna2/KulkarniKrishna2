(function (module) {
    mifosX.controllers = _.extend(module, {
        LoanAccountActionsController: function (scope, resourceFactory, location, routeParams, $modal, dateFilter, http, API_VERSION, $rootScope, $sce) {

            scope.action = routeParams.action || "";
            scope.accountId = routeParams.id;
            scope.formData = {};
            scope.showDateField = true;
            scope.showNoteField = true;
            scope.showAmountField = false;
            scope.restrictDate = new Date();
            // Transaction UI Related
            scope.isTransaction = false;
            scope.showPaymentDetails = false;
            scope.paymentTypes = [];
            scope.expectedDisbursementDate = [];
            scope.disbursementDetails = [];
            scope.isFlatInterestRate = false;
            scope.showTrancheAmountTotal = 0;
            scope.showDiscountAmountTotal = 0;
            scope.processDate = false;
            scope.showAmountDispaly = false;
            scope.trancheError = false;
            scope.showRepaymentsStartingFromDateField = false;
            scope.isRecieptNumbermandatory = false;

            //glim
            scope.isGLIM = false;
            scope.GLIMData = {};
            scope.clientMembers = [];
            scope.showOverPaidSection = false;
            scope.glimAsGroupConfigName = 'glim-payment-as-group';
            scope.isGlimPaymentAsGroup = scope.isSystemGlobalConfigurationEnabled(scope.glimAsGroupConfigName);
            scope.isDefaultAmountSection = false;
            scope.showRunReport = false;
            scope.enableClientVerification = scope.isSystemGlobalConfigurationEnabled('client-verification');

            scope.isInterBranchTransaction = (location.search().isInterBranchSearch != undefined && location.search().isInterBranchSearch== 'true');

            scope.paymentModeOptions = [];
            scope.paymentTypeOptions = [];
            scope.applicableOnRepayment = 1;
            scope.applicableOnDisbursement = 2;
            
            
            resourceFactory.configurationResource.get({configName: scope.glimAsGroupConfigName}, function (configData) {
                if(configData){
                    scope.glimPaymentAsGroup = configData.enabled;
                }
            });
            scope.showPenaltiesNotApplicable = false;
            scope.showFetchButton = false;
            scope.submitbutton = 'label.button.save';

            scope.isAnyActiveMember = function(){
                for(var i=0;i<scope.clientMembers.length;i++){
                    if(scope.clientMembers[i].isActive){
                            return true;
                    }
                }
                return false;
            };

            scope.isGlimEnabled = function(){
                return scope.isGLIM && !scope.isGlimPaymentAsGroup;
            };

            scope.showGlimTransactionSection = function(){
                return ((scope.action == 'repayment' || scope.action == 'waiveinterest' || scope.action == 'writeoff') && scope.isGlimEnabled());
            };

            scope.showDefaultEmiSection = function(){
                return scope.showGlimRepaymentSection() && scope.isAnyActiveMember();
            };

            scope.showGlimRepaymentSection = function(){
                return (scope.action == 'repayment')  && scope.isGlimEnabled();
            };

            scope.editGlimTransaction = function(){
                 return (scope.action == 'modifytransaction' && scope.isGlimEnabled());
            };


            //2F Authentication
            scope.catureFP = false ;

            scope.changeOverPaymentStatus = function(){
                if(scope.showOverPaidSection==true){
                    for(var i=0;i<scope.clientMembers.length;i++){
                        if(!scope.clientMembers[i].isActive){
                            scope.clientMembers[i].transactionAmount = 0;
                        }
                    }
                    scope.getTotalAmount(scope.clientMembers, 'transactionAmount');
                }
                scope.showOverPaidSection = !scope.showOverPaidSection;
            };

            scope.changeDefaultAmountStatus = function(){                
                scope.isDefaultAmountSection = !scope.isDefaultAmountSection;
            };

            scope.copyInstallmentAmount = function(){
                for(var i=0;i<scope.clientMembers.length;i++){
                    if(scope.clientMembers[i].isActive){
                        scope.clientMembers[i].transactionAmount = scope.clientMembers[i].installmentAmount;
                    }
                }
                scope.getTotalAmount(scope.clientMembers, 'transactionAmount');
            };

            scope.checkBiometricRequired = function() {
                if( scope.transactionAuthenticationOptions &&  scope.transactionAuthenticationOptions.length > 0) {
                    for(var i in scope.transactionAuthenticationOptions) {
                        var paymentTypeId = Number(scope.transactionAuthenticationOptions[i].paymentTypeId) ;
                        var amount = Number(scope.transactionAuthenticationOptions[i].amount) ;
                        var authenticationType = scope.transactionAuthenticationOptions[i].authenticationType ;
                        if(authenticationType === 'Aadhaar fingerprint' && scope.formData.paymentTypeId === paymentTypeId && scope.formData.transactionAmount>= amount) {
                            scope.catureFP = true ;
                            scope.formData.authenticationRuleId = scope.transactionAuthenticationOptions[i].authenticationRuleId ;
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
                    delete scope.formData.clientAuthData ;
                    delete scope.formData.location ;
                    delete scope.formData.authenticationType ;
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
                            scope.formData.clientAuthData = fpobject.Base64ISOTemplate ;
                            scope.formData.location = {} ;
                            scope.formData.location.locationType = "pincode" ;
                            scope.formData.location.pincode = "560010" ;
                            scope.formData.authenticationType = "fingerprint" ;
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
                    delete scope.formData.clientAuthData ;
                    delete scope.formData.location ;
                    delete scope.formData.authenticationType ;
                    $scope.isFingerPrintCaptured = false ;
                };
            };

            scope.getFingerPrint = function () {
                $modal.open({
                    templateUrl: 'fingerprint.html',
                    controller: FingerPrintController
                });
            };

            scope.glimAutoCalPrincipalAmount = function () {
                var totalPrincipalAmount = 0.0;
                for(var i in scope.clientMembers){
                    if(scope.clientMembers[i].isClientSelected && scope.clientMembers[i].transactionAmount){
                        totalPrincipalAmount += parseFloat(scope.clientMembers[i].transactionAmount);
                    }
                }
                if(scope.action == 'approve'){
                    scope.formData.approvedLoanAmount = totalPrincipalAmount;
                }else if(scope.action == 'disburse' || scope.action == 'forcedisburse'){
                    scope.formData.transactionAmount = totalPrincipalAmount;
                }
            };

            scope.createClientMembersForGLIM = function(){
                resourceFactory.glimResource.getAllByLoan({loanId: scope.accountId}, function (glimData) {
                    scope.clientMembers = glimData;
                    if(glimData.length>0){
                      scope.isGLIM = glimData[0].isActive;  
                    }
                    if(scope.isGLIM){
                        for(var i=0;i<glimData.length;i++){
                            scope.clientMembers[i].id = glimData[i].id;
                            scope.clientMembers[i].isClientSelected = glimData[i].isClientSelected;
                            if(scope.action == "approve"){
                                if(glimData[i].approvedAmount == undefined){
                                    scope.clientMembers[i].transactionAmount = glimData[i].proposedAmount;
                                }else{
                                    scope.clientMembers[i].transactionAmount = glimData[i].approvedAmount;
                                }
                            }else{
                                if(glimData[i].disbursedAmount == undefined){
                                    scope.clientMembers[i].transactionAmount = glimData[i].approvedAmount;
                                }else{
                                    scope.clientMembers[i].transactionAmount = glimData[i].disbursedAmount;
                                }
                            }
                        }
                        if(scope.action == 'approve' || scope.action == 'disburse' || scope.action == 'forcedisburse'){
                            scope.glimAutoCalPrincipalAmount();
                        }
                    }
                });
            };
            scope.formDisburseToSavingsData = function(){
                scope.modelName = 'actualDisbursementDate';
                    resourceFactory.loanTrxnsTemplateResource.get({loanId: scope.accountId, command: 'disburseToSavings'}, function (data) {
                       scope.formData.transactionAmount = data.amount;
                        scope.formData[scope.modelName] = new Date();
                        if (data.fixedEmiAmount) {
                            scope.formData.fixedEmiAmount = data.fixedEmiAmount;
                            scope.showEMIAmountField = true;
                        }
                    });
                    scope.title = 'label.heading.disburseloanaccount';
                    scope.labelName = 'label.input.disbursedondate';
                    scope.isTransaction = false;
                    scope.showAmountField = true;
            };


            scope.getPaymentTypeOtions = function(){
                scope.paymentTypeOptions =[];
                if( scope.paymentTypes){
                        var type = scope.applicableOnRepayment;
                        if(scope.action!="disburse"){
                            type = scope.applicableOnDisbursement;
                        }
                        for(var i in scope.paymentTypes){
                            if((scope.paymentTypes[i].paymentMode== undefined || 
                                scope.paymentTypes[i].paymentMode.id==scope.formData.paymentMode) && 
                                (scope.paymentTypes[i].applicableOn== undefined || scope.paymentTypes[i].applicableOn.id != type)){
                                scope.paymentTypeOptions.push(scope.paymentTypes[i]);
                            }
                        }
                }
            }

            scope.formDisbursementData = function(){
                scope.modelName = 'actualDisbursementDate';
                    if(scope.response){
                        scope.showNetDisbursalAmount = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.netDisbursalAmount;
                    }                    
                    scope.showdiscountOnDisburse = false;
                    scope.disableDiscount = true;
                    resourceFactory.loanTrxnsTemplateResource.get({loanId: scope.accountId, command: 'disburse'}, function (data) {
                        scope.paymentTypes = data.paymentTypeOptions;
                        scope.paymentModeOptions = data.paymentModeOptions;
                        scope.transactionAuthenticationOptions = data.transactionAuthenticationOptions ;
                        if (scope.paymentTypeOptions.length > 0) {
                            scope.formData.paymentTypeId = scope.paymentTypeOptions[0].id;
                            if(scope.paymentTypeOptions[0].paymentMode){
                                scope.paymentMode = scope.paymentTypeOptions[0].paymentMode.id;
                            }
                        }
                        scope.formData.transactionAmount = data.amount;
                        scope.netAmount = data.netDisbursalAmount;
                        scope.nextRepaymentDate = new Date(data.possibleNextRepaymentDate) || new Date();
                        scope.formData[scope.modelName] = new Date();
                        if (data.fixedEmiAmount) {
                            scope.formData.fixedEmiAmount = data.fixedEmiAmount;
                            scope.showEMIAmountField = true;
                        }
                        if(scope.showNetDisbursalAmount && (scope.netAmount && scope.netAmount < scope.formData.transactionAmount)) {
                            scope.showNetDisbursalAmount = true;
                        }else{
                            scope.showNetDisbursalAmount = false;
                        }
                        scope.formData.discountOnDisbursalAmount=data.discountOnDisbursalAmount;
                        if (scope.formData.discountOnDisbursalAmount){
                            scope.showdiscountOnDisburse = true;
                        }
                        if(data.expectedFirstRepaymentOnDate){
                            scope.formData.repaymentsStartingFromDate = new Date(data.expectedFirstRepaymentOnDate);
                            scope.showRepaymentsStartingFromDateField = true;
                        }
                    });
                    if(routeParams.type && routeParams.type == 'flatinterest'){
                        scope.showdiscountOnDisburse = true;
                        scope.disableDiscount = false;
                    }
                    scope.title = 'label.heading.disburseloanaccount';
                    scope.labelName = 'label.input.disbursedondate';
                    scope.isTransaction = true;
                    scope.showAmountField = true;
                    scope.createClientMembersForGLIM();
            };

            switch (scope.action) {
                case "approve":
                    scope.taskPermissionName = 'APPROVE_LOAN';
                    resourceFactory.loanTemplateResource.get({loanId: scope.accountId, templateType: 'approval'}, function (data) {
                        scope.title = 'label.heading.approveloanaccount';
                        scope.labelName = 'label.input.approvedondate';
                        scope.modelName = 'approvedOnDate';
                        scope.formData[scope.modelName] =  new Date();
                        scope.showApprovalAmount = true;
                        if(scope.response  && scope.response.uiDisplayConfigurations &&
                            scope.response.uiDisplayConfigurations.loanAccount &&
                            scope.response.uiDisplayConfigurations.loanAccount.isHiddenField &&
                            !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.creditApprisalReportButton){
                            scope.showRunReport = true;
                        }
                        scope.formData.approvedLoanAmount =  data.approvalAmount;
                        scope.createClientMembersForGLIM();
                    });
                    resourceFactory.LoanAccountResource.getLoanAccountDetails({loanId: scope.accountId, associations: 'multiDisburseDetails'}, function (data) {
                        scope.expectedDisbursementDate = new Date(data.timeline.expectedDisbursementDate);
                        scope.clientId = data.clientId;
                        scope.isFlatInterestRate = data.flatInterestRate != null;
                        if(data.disbursementDetails != ""){
                            scope.disbursementDetails = data.disbursementDetails;
                            scope.approveTranches = true;
                        }
                        for(var i in data.disbursementDetails){
                            scope.disbursementDetails[i].expectedDisbursementDate = new Date(data.disbursementDetails[i].expectedDisbursementDate);
                            scope.disbursementDetails[i].principal = data.disbursementDetails[i].principal;
                            scope.showTrancheAmountTotal += Number(data.disbursementDetails[i].principal) ;
                            scope.showDiscountAmountTotal += Number(data.disbursementDetails[i].discountOnDisbursalAmount != null ? data.disbursementDetails[i].discountOnDisbursalAmount : 0) ;

                        }
                    });
                    break;
                case "reject":
                    scope.title = 'label.heading.rejectloanaccount';
                    scope.labelName = 'label.input.rejectedondate';
                    scope.modelName = 'rejectedOnDate';
                    scope.formData[scope.modelName] = new Date();
                    scope.taskPermissionName = 'REJECT_LOAN';
                    break;
                case "withdrawnByApplicant":
                    scope.title = 'label.heading.withdrawloanaccount';
                    scope.labelName = 'label.input.withdrawnondate';
                    scope.modelName = 'withdrawnOnDate';
                    scope.formData[scope.modelName] = new Date();
                    scope.taskPermissionName = 'WITHDRAW_LOAN';
                    break;
                case "undoapproval":
                    scope.title = 'label.heading.undoapproveloanaccount';
                    scope.showDateField = false;
                    scope.taskPermissionName = 'APPROVALUNDO_LOAN';
                    break;
                case "undodisbursal":
                    scope.title = 'label.heading.undodisburseloanaccount';
                    scope.showDateField = false;
                    scope.taskPermissionName = 'DISBURSALUNDO_LOAN';
                    break;
                case "undolastdisbursal":
                    scope.title = 'label.heading.undolastdisbursal';
                    scope.showDateField = false;
                    scope.taskPermissionName = 'DISBURSALLASTUNDO_LOAN';
                    break;
                case "disburse":
                    scope.formDisbursementData();
                    scope.getPaymentTypeOtions();
                    scope.taskPermissionName = 'DISBURSE_LOAN';
                    break;
                case "disbursetosavings":
                    scope.formDisburseToSavingsData();
                    scope.getPaymentTypeOtions();
                    scope.taskPermissionName = 'DISBURSETOSAVINGS_LOAN';
                    break;
                case "repayment":
                    scope.modelName = 'transactionDate';
                    resourceFactory.glimResource.getAllByLoan({loanId: scope.accountId}, function (glimData) {
                        scope.GLIMData = glimData;
                        if(glimData.length>0 ){
                            scope.isGLIM = glimData[0].isActive;
                        }
                        resourceFactory.loanTrxnsTemplateResource.get({loanId: scope.accountId, command: 'repayment'}, function (data) {
                            scope.paymentTypes = data.paymentTypeOptions;                            
                            scope.paymentModeOptions = data.paymentModeOptions;
                            if (scope.paymentTypeOptions.length > 0) {
                                scope.formData.paymentTypeId = scope.paymentTypeOptions[0].id;
                                if(scope.paymentTypeOptions[0].paymentMode){
                                    scope.paymentMode = scope.paymentTypeOptions[0].paymentMode.id;
                                }
                            }
                            if (scope.isGLIM && !scope.isGlimPaymentAsGroup) {
                                scope.formData[scope.modelName] = new Date();
                            } else {
                                scope.formData.transactionAmount = data.amount;
                                scope.formData[scope.modelName] = new Date(data.date) || new Date();
                                if (data.penaltyChargesPortion > 0) {
                                    scope.showPenaltyPortionDisplay = true;
                                }
                            }
                            if(data.loanOverdueChargeData){
                                scope.penaltyamount = data.penaltyChargesPortion;
                                scope.overduechargespresent = true;
                                scope.overdueDetailsFetched = false;
                                scope.loanOverdueChargeData = data.loanOverdueChargeData;
                            }
                            scope.getPaymentTypeOtions();
                        });
                    });
                    scope.title = 'label.heading.loanrepayments';
                    scope.labelName = 'label.input.transactiondate';
                    scope.isTransaction = true;
                    scope.showAmountField = true;
                    scope.taskPermissionName = 'REPAYMENT_LOAN';
                    scope.isRecieptNumbermandatory = scope.response.uiDisplayConfigurations.paymentDetails.isMandatory.receiptNumber;

                    break;
                case "prepayment":
                    scope.modelName = 'transactionDate';
                    scope.formData.transactionDate =  new Date();
                    resourceFactory.paymentTypeResource.getAll({}, function (data) {
                        scope.paymentTypes = data;
                        scope.getPaymentTypeOtions();
                        if (data.length > 0) {
                            scope.formData.paymentTypeId = data[0].id;
                        }
                        scope.formData[scope.modelName] = new Date();
                    });
                    scope.title = 'label.heading.loanprepayments';
                    scope.labelName = 'label.input.transactiondate';
                    scope.isTransaction = true;
                    scope.showAmountField = true;
                    scope.taskPermissionName = 'PREPAYMENT_LOAN';
                    break;
                case "prepayloan":
                    scope.modelName = 'transactionDate';
                    scope.formData.transactionDate =  new Date();
                    resourceFactory.loanTrxnsTemplateResource.get({loanId: scope.accountId, command: 'prepayLoan'}, function (data) {
                        scope.paymentTypes = data.paymentTypeOptions;
                        scope.paymentModeOptions = data.paymentModeOptions;
                        scope.getPaymentTypeOtions();
                        if (scope.paymentTypeOptions.length > 0) {
                            scope.formData.paymentTypeId = scope.paymentTypeOptions[0].id;
                            if(scope.paymentTypeOptions[0].paymentMode){
                                scope.paymentMode = scope.paymentTypeOptions[0].paymentMode.id;
                            }
                        }
                        scope.formData.transactionAmount = data.amount;
                        if(data.penaltyChargesPortion>0){
                            scope.showPenaltyPortionDisplay = true;
                        }
                        scope.principalPortion = data.principalPortion;
                        scope.interestPortion = data.interestPortion;
                        scope.processDate = true;
                    });
                    scope.title = 'label.heading.preclose';
                    scope.labelName = 'label.input.transactiondate';
                    scope.isTransaction = true;
                    scope.showAmountField = true;
                    scope.taskPermissionName = 'REPAYMENT_LOAN';
                    scope.action = 'repayment';
                    break;
                case "prepay":
                    scope.modelName = 'transactionDate';
                    scope.formData.transactionDate =  new Date();
                    resourceFactory.loanTrxnsTemplateResource.get({loanId: scope.accountId, command: 'prepayLoan'}, function (data) {
                        scope.paymentTypes = data.paymentTypeOptions;
                        scope.paymentModeOptions = data.paymentModeOptions;
                        scope.getPaymentTypeOtions();
                        if (scope.paymentTypeOptions.length > 0) {
                            scope.formData.paymentTypeId = scope.paymentTypeOptions[0].id;
                            if(scope.paymentTypeOptions[0].paymentMode){
                                scope.paymentMode = scope.paymentTypeOptions[0].paymentMode.id;
                            }
                        }
                        scope.formData.transactionAmount = data.amount;
                        if(data.penaltyChargesPortion>0){
                            scope.showPenaltyPortionDisplay = true;
                        }
                        scope.principalPortion = data.principalPortion;
                        scope.interestPortion = data.interestPortion;
                        scope.processDate = true;
                    });
                    scope.title = 'label.heading.prepayloan';
                    scope.labelName = 'label.input.transactiondate';
                    scope.isTransaction = true;
                    scope.showAmountField = true;
                    scope.taskPermissionName = 'REPAYMENT_LOAN';
                    scope.action = 'repayment';
                    break;
                case "waiveinterest":
                    scope.modelName = 'transactionDate';
                    scope.isTotalOutstandingInterest=scope.response.uiDisplayConfigurations.loanAccount.waiveInterest.isTotalOutstandingInterest;
                    resourceFactory.loanTrxnsTemplateResource.get({loanId: scope.accountId, command: 'waiveinterest',isTotalOutstandingInterest:scope.isTotalOutstandingInterest}, function (data) {
                        scope.paymentTypes = data.paymentTypeOptions;
                        scope.paymentModeOptions = data.paymentModeOptions;
                        resourceFactory.glimTransactionTemplateResource.get({loanId: scope.accountId, command: 'waiveinterest'}, function (responseData) {
                            if (responseData.clientMembers.length>0 && !scope.isGlimPaymentAsGroup) {
                                scope.clientMembers = responseData.clientMembers;
                                var transactionAmount = 0;
                                for (var i in responseData.clientMembers) {
                                    transactionAmount += responseData.clientMembers[i].transactionAmount;
                                }
                                scope.isGLIM = true;
                                scope.formData.transactionAmount = transactionAmount;
                            } else {
                                scope.clientMembers = undefined;
                                scope.formData.transactionAmount = data.amount;
                                scope.isGLIM = false;
                            }
                        });
                        scope.formData[scope.modelName] = new Date(data.date) || new Date();
                    });
                    scope.title = 'label.heading.loanwaiveinterest';
                    scope.labelName = 'label.input.interestwaivedon';
                    scope.showAmountField = true;
                    scope.taskPermissionName = 'WAIVEINTERESTPORTION_LOAN';
                    break;
                case "writeoff":
                    scope.modelName = 'transactionDate';
                    resourceFactory.loanTrxnsTemplateResource.get({loanId: scope.accountId, command: 'writeoff'}, function (data) {
                        scope.formData[scope.modelName] = new Date(data.date) || new Date();
                        scope.writeOffAmount = data.amount;
                        scope.reasons = data.writeOffReasonOptions;
                        scope.isLoanWriteOff = true;
                    });
                    scope.title = 'label.heading.writeoffloanaccount';
                    scope.labelName = 'label.input.writeoffondate';
                    scope.taskPermissionName = 'WRITEOFF_LOAN';
                    resourceFactory.glimTransactionTemplateResource.get({loanId: scope.accountId, command: 'writeoff'}, function (data) {
                        if (data.clientMembers.length>0 && !scope.isGlimPaymentAsGroup) {
                            scope.clientMembers = data.clientMembers;
                            scope.isGLIM = true;
                        } else {
                            scope.clientMembers = undefined;
                            scope.isGLIM = false;
                        }
                    });
                    break;
                case "close-rescheduled":
                    scope.modelName = 'transactionDate';
                    resourceFactory.loanTrxnsTemplateResource.get({loanId: scope.accountId, command: 'close-rescheduled'}, function (data) {
                        scope.formData[scope.modelName] = new Date(data.date) || new Date();
                    });
                    scope.title = 'label.heading.closeloanaccountasrescheduled';
                    scope.labelName = 'label.input.closedondate';
                    scope.taskPermissionName = 'CLOSEASRESCHEDULED_LOAN';
                    break;
                case "close":
                    scope.modelName = 'transactionDate';
                    resourceFactory.loanTrxnsTemplateResource.get({loanId: scope.accountId, command: 'close'}, function (data) {
                        scope.formData[scope.modelName] = new Date(data.date) || new Date();
                    });
                    scope.title = 'label.heading.closeloanaccount';
                    scope.labelName = 'label.input.closedondate';
                    scope.taskPermissionName = 'CLOSE_LOAN';
                    break;
                case "unassignloanofficer":
                    scope.title = 'label.heading.unassignloanofficer';
                    scope.labelName = 'label.input.loanofficerunassigneddate';
                    scope.modelName = 'unassignedDate';
                    scope.showNoteField = false;
                    scope.formData[scope.modelName] = new Date();
                    scope.taskPermissionName = 'REMOVELOANOFFICER_LOAN';
                    break;
                case "refund":
                    scope.modelName = 'transactionDate';
                    resourceFactory.loanTrxnsTemplateResource.get({loanId: scope.accountId, command: 'refund'}, function (data) {
                        scope.amount = data.amount;
                        scope.paymentTypes = data.paymentTypeOptions;
                        scope.paymentModeOptions = data.paymentModeOptions;
                        if (scope.paymentTypeOptions.length > 0) {
                            scope.formData.paymentTypeId = scope.paymentTypeOptions[0].id;
                            if(scope.paymentTypeOptions[0].paymentMode){
                                scope.paymentMode = scope.paymentTypeOptions[0].paymentMode.id;
                            }
                        }
                        scope.formData[scope.modelName] = new Date(data.date) || new Date();
                    });
                    scope.title = 'label.heading.refund';
                    scope.labelName = 'label.input.transactiondate';
                    scope.isTransaction = true;
                    scope.showAmountDispaly = true;
                    scope.taskPermissionName = 'REFUND_LOAN';
                    break;
                case "modifytransaction":
                    resourceFactory.loanTrxnsResource.get({loanId: scope.accountId, transactionId: routeParams.transactionId, template: 'true'},
                        function (data) {
                            scope.title = 'label.heading.editloanaccounttransaction';
                            scope.labelName = 'label.input.transactiondate';
                            scope.modelName = 'transactionDate';
                            scope.paymentTypes = data.paymentTypeOptions || [];
                            scope.paymentModeOptions = data.paymentModeOptions;
                            scope.formData.transactionAmount = data.amount;
                            scope.formData[scope.modelName] = new Date(data.date) || new Date();
                            scope.glimTransactions = data.glimTransactions;
                            scope.isGLIM = (data.glimTransactions.length>0);
                            if (data.paymentDetailData) {
                                if (data.paymentDetailData.paymentType) {
                                    scope.formData.paymentTypeId = data.paymentDetailData.paymentType.id;
                                    if(data.paymentDetailData.paymentType.paymentMode){
                                        scope.paymentMode = data.paymentDetailData.paymentType.paymentMode.id;
                                    }
                                }
                                scope.formData.accountNumber = data.paymentDetailData.accountNumber;
                                scope.formData.checkNumber = data.paymentDetailData.checkNumber;
                                scope.formData.routingCode = data.paymentDetailData.routingCode;
                                scope.formData.receiptNumber = data.paymentDetailData.receiptNumber;
                                scope.formData.bankNumber = data.paymentDetailData.bankNumber;
                            }
                        });
                    scope.showDateField = true;
                    scope.showNoteField = false;
                    scope.showAmountField = true;
                    scope.isTransaction = true;
                    scope.showPaymentDetails = false;
                    scope.taskPermissionName = 'ADJUST_LOAN';
                    break;
                case "deleteloancharge":
                    scope.showDelete = true;
                    scope.showNoteField = false;
                    scope.showDateField = false;
                    scope.taskPermissionName = 'DELETE_LOANCHARGE';
                    break;
                case "recoverguarantee":
                    scope.showDelete = true;
                    scope.showNoteField = false;
                    scope.showDateField = false;
                    scope.taskPermissionName = 'RECOVERGUARANTEES_LOAN';
                    break;
                case "waivecharge":
                    resourceFactory.LoanAccountResource.get({loanId: routeParams.id, resourceType: 'charges', chargeId: routeParams.chargeId}, function (data) {
                        if (data.chargeTimeType.value !== "Specified due date" && data.installmentChargeData) {
                            scope.installmentCharges = data.installmentChargeData;
                            scope.formData.installmentNumber = data.installmentChargeData[0].installmentNumber;
                            scope.installmentchargeField = true;
                        } else {
                            scope.installmentchargeField = false;
                            scope.showwaiveforspecicficduedate = true;
                        }
                    });

                    scope.title = 'label.heading.waiveloancharge';
                    scope.labelName = 'label.input.installment';
                    scope.showNoteField = false;
                    scope.showDateField = false;
                    scope.taskPermissionName = 'WAIVE_LOANCHARGE';
                    break;
                case "paycharge":
                    resourceFactory.LoanAccountResource.get({loanId: routeParams.id, resourceType: 'charges', chargeId: routeParams.chargeId, command: 'pay'}, function (data) {
                        if (data.dueDate) {
                            scope.formData.transactionDate = new Date(data.dueDate);
                        }
                        if (data.chargeTimeType.value === "Instalment Fee" && data.installmentChargeData) {
                            scope.installmentCharges = data.installmentChargeData;
                            scope.formData.installmentNumber = data.installmentChargeData[0].installmentNumber;
                            scope.installmentchargeField = true;
                        }
                    });
                    scope.title = 'label.heading.payloancharge';
                    scope.showNoteField = false;
                    scope.showDateField = false;
                    scope.paymentDatefield = true;
                    scope.taskPermissionName = 'PAY_LOANCHARGE';
                    break;
                case "editcharge":
                    resourceFactory.LoanAccountResource.get({loanId: routeParams.id, resourceType: 'charges', chargeId: routeParams.chargeId}, function (data) {
                        if (data.amountOrPercentage) {
                            scope.showEditChargeAmount = true;
                            scope.formData.amount = data.amountOrPercentage;
                            if (data.dueDate) {
                                scope.formData.dueDate = new Date(data.dueDate);
                                scope.showEditChargeDueDate = true;
                            }
                        }

                    });
                    scope.title = 'label.heading.editcharge';
                    scope.showNoteField = false;
                    scope.showDateField = false;
                    scope.taskPermissionName = 'UPDATE_LOANCHARGE';
                    break;
                case "editdisbursedate":
                    resourceFactory.LoanAccountResource.getLoanAccountDetails({loanId: routeParams.id, associations: 'multiDisburseDetails'}, function (data) {
                        scope.showEditDisburseDate = true;
                        scope.formData.approvedLoanAmount = data.approvedPrincipal;
                        scope.expectedDisbursementDate = new Date(data.timeline.expectedDisbursementDate);
                        for(var i in data.disbursementDetails){
                            data.disbursementDetails[i].expectedDisbursementDate = new Date(data.disbursementDetails[i].expectedDisbursementDate);
                            if(routeParams.disbursementId == data.disbursementDetails[i].id){
                                scope.formData.updatedExpectedDisbursementDate = new Date(data.disbursementDetails[i].expectedDisbursementDate);
                                scope.formData.updatedPrincipal = data.disbursementDetails[i].principal;
                                scope.id = data.disbursementDetails[i].id;
                            }
                        }
                        scope.disbursementDetails = data.disbursementDetails;
                    });

                    scope.title = 'label.heading.editdisbursedate';
                    scope.showNoteField = false;
                    scope.showDateField = false;
                    scope.taskPermissionName = 'UPDATE_DISBURSEMENTDETAIL';
                    break;
                case "recoverypayment":
                    scope.modelName = 'transactionDate';
                    resourceFactory.loanTrxnsTemplateResource.get({loanId: scope.accountId, command: 'recoverypayment'}, function (data) {
                        scope.paymentTypes = data.paymentTypeOptions;
                        scope.paymentModeOptions = data.paymentModeOptions;
                        if (scope.paymentTypeOptions.length > 0) {
                            scope.formData.paymentTypeId = scope.paymentTypeOptions[0].id;
                            if(scope.paymentTypeOptions[0].paymentMode){
                                scope.paymentMode = scope.paymentTypeOptions[0].paymentMode.id;
                            }
                        }
                        scope.formData.transactionAmount = data.amount;
                        scope.formData[scope.modelName] = new Date();
                    });
                    scope.title = 'label.heading.recoverypayment';
                    scope.labelName = 'label.input.transactiondate';
                    scope.isTransaction = true;
                    scope.showAmountField = true;
                    scope.taskPermissionName = 'RECOVERYPAYMENT_LOAN';
                    break;
                case "adddisbursedetails":
                    resourceFactory.LoanAccountResource.getLoanAccountDetails({loanId: routeParams.id, associations: 'multiDisburseDetails'}, function (data) {
                        scope.addDisburseDetails = true;
                        scope.formData.approvedLoanAmount = data.approvedPrincipal;
                        scope.expectedDisbursementDate = new Date(data.timeline.expectedDisbursementDate);
                        scope.isFlatInterestRate = false;
                        if(data.disbursementDetails != ""){
                            scope.disbursementDetails = data.disbursementDetails;
                        }
                        if (scope.disbursementDetails.length > 0) {
                            for (var i in scope.disbursementDetails) {
                                scope.disbursementDetails[i].expectedDisbursementDate = new Date(scope.disbursementDetails[i].expectedDisbursementDate);
                            }
                        }
                        scope.disbursementDetails.push({
                        });
                    });

                    scope.title = 'label.heading.adddisbursedetails';
                    scope.showNoteField = false;
                    scope.showDateField = false;
                    scope.taskPermissionName = 'UPDATE_DISBURSEMENTDETAIL';
                    break;
                case "deletedisbursedetails":
                    resourceFactory.LoanAccountResource.getLoanAccountDetails({loanId: routeParams.id, associations: 'multiDisburseDetails'}, function (data) {
                        scope.deleteDisburseDetails = true;
                        scope.formData.approvedLoanAmount = data.approvedPrincipal;
                        scope.expectedDisbursementDate = new Date(data.timeline.expectedDisbursementDate);
                        if(data.disbursementDetails != ""){
                            scope.disbursementDetails = data.disbursementDetails;
                        }
                        if (scope.disbursementDetails.length > 0) {
                            for (var i in scope.disbursementDetails) {
                                scope.disbursementDetails[i].expectedDisbursementDate = new Date(scope.disbursementDetails[i].expectedDisbursementDate);
                            }
                        }
                    });

                    scope.title = 'label.heading.deletedisbursedetails';
                    scope.showNoteField = false;
                    scope.showDateField = false;
                    scope.taskPermissionName = 'UPDATE_DISBURSEMENTDETAIL';
                    break;
                case "addsubsidy":
                    scope.modelName = 'subsidyReleaseDate';
                    scope.title = 'label.heading.addsubsidy';
                    scope.labelName = 'label.input.subsidyreleasedate';
                    resourceFactory.loanTrxnsTemplateResource.get({loanId: scope.accountId, command: 'repayment'}, function (data) {
                        scope.paymentTypes = data.paymentTypeOptions;
                        scope.paymentModeOptions = data.paymentModeOptions;
                        if (scope.paymentTypeOptions.length > 0) {
                            scope.formData.paymentTypeId = scope.paymentTypeOptions[0].id;
                            if(scope.paymentTypeOptions[0].paymentMode){
                                scope.paymentMode = scope.paymentTypeOptions[0].paymentMode.id;
                            }
                        }
                        scope.formData[scope.modelName] = new Date(data.date) || new Date();
                    });
                    scope.isTransaction = true;
                    scope.showSubsidyamountReleasedField = true;
                    scope.showNoteField = false;
                    scope.taskPermissionName = 'SUBSIDYADD_LOAN';
                    break;
                case "revokesubsidy":
                    scope.modelName = 'subsidyRevokeDate';
                    scope.title = 'label.heading.revokesubsidy';
                    scope.labelName = 'label.input.subsidyrevokedate';
                    scope.isTransaction = false;
                    scope.showSubsidyamountRevokedField = true;
                    scope.showNoteField = false;
                    scope.taskPermissionName = 'SUBSIDYREVOKE_LOAN';
                    break;
                case "refundByCash":
                    scope.modelName = 'transactionDate';
                    resourceFactory.loanTrxnsTemplateResource.get({loanId: scope.accountId, command: 'refundByCash'}, function (data) {
                        scope.formData.transactionAmount = data.amount;
                        scope.paymentTypes = data.paymentTypeOptions;
                        scope.paymentModeOptions = data.paymentModeOptions;
                        if (scope.paymentTypeOptions.length > 0) {
                            scope.formData.paymentTypeId = scope.paymentTypeOptions[0].id;
                            if(scope.paymentTypeOptions[0].paymentMode){
                                scope.paymentMode = scope.paymentTypeOptions[0].paymentMode.id;
                            }
                        }
                        scope.formData[scope.modelName] = new Date(data.date) || new Date();
                    });
                    scope.title = 'label.heading.advance.refund';
                    scope.labelName = 'label.input.transactiondate';
                    scope.isTransaction = true;
                    scope.showAmountField = true;
                    scope.taskPermissionName = 'refundByCash';
                    break;
                case "forcedisburse":
                    scope.formDisbursementData();
                    scope.taskPermissionName = 'FORCE_DISBURSE_LOAN';
                    break;
                case "forcedisbursetosavings":
                    scope.formDisburseToSavingsData();
                    scope.taskPermissionName = 'FORCE_DISBURSETOSAVINGS_LOAN';
                    break;
                case "applypenalties":
                    scope.modelName = 'transactionDate';
                    resourceFactory.overdueChargeResource.get({loanIdParam:scope.accountId}, function (data) {
                        scope.loanOverdueChargeData = data;
                        if(data.isOverdueChargeApplicable){
                            scope.showDateField = true;
                            scope.showFetchButton = true;
                        }else{
                            scope.showDateField = false;
                            scope.showPenaltiesNotApplicable = true;
                        }
                    });
                    scope.title = 'label.heading.applypenalties';
                    scope.submitbutton = 'label.button.applypenalties';
                    scope.labelName = 'label.input.asondate';
                    scope.taskPermissionName = 'EXECUTE_OVERDUECHARGE';
                    scope.action = 'applypenalties';
                    scope.showNoteField = false;
                break;
            }

            scope.cancel = function () {
                if(scope.isInterBranchTransaction && (scope.action=="repayment")){
                    scope.routeToInterBranchDetails(routeParams.id);
                }else{
                    location.path('/viewloanaccount/' + routeParams.id);
                }
                
            };

            scope.addTrancheAmounts = function(){
                scope.showTrancheAmountTotal = 0;
                scope.showDiscountAmountTotal = 0;
                for(var i in scope.disbursementDetails ){
                    scope.showTrancheAmountTotal += Number(scope.disbursementDetails[i].principal);
                    scope.showDiscountAmountTotal += Number(scope.disbursementDetails[i].discountOnDisbursalAmount != null ? scope.disbursementDetails[i].discountOnDisbursalAmount : 0) ;
                }
            };

            scope.getTotalAmount = function(data, amountType) {
                var amount = 0;
                for (var i=0; i<data.length; i++) {
                    if ((data[i].isClientSelected)&& angular.isDefined(data[i][amountType])) {
                        amount = amount + parseFloat(data[i][amountType]);
                    }
                }
                if(scope.isGLIM && scope.action != 'writeoff'){
                    this.formData.transactionAmount = amount.toFixed(2);
                }else{
                    scope.writeOffAmount = amount.toFixed(2);
                }
            };

            scope.deleteTranches = function (index) {
                scope.disbursementDetails.splice(index, 1);
            };

            scope.addTranches = function () {
                scope.disbursementDetails.push({
                });
                scope.trancheError = false;
            };

            scope.getGlimTransactionAmount = function (glimTransactions) {
                var amount = 0;
                for(var i in glimTransactions) {
                    amount = amount + parseFloat(glimTransactions[i].transactionAmount);
                }
                this.formData.transactionAmount = amount;
            }

            scope.constructGlimClientMembersData = function () {
                if(scope.isGLIM){
                    this.formData.clientMembers = [];
                    for(var i in scope.clientMembers) {
                        if(scope.clientMembers[i].isClientSelected) {
                            var json = {
                                id : scope.clientMembers[i].id,
                                transactionAmount: scope.clientMembers[i].transactionAmount
                            }
                            this.formData.clientMembers.push(json);
                        }
                    }
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

            scope.finalSubmit = function() {
                scope.processDate = false;
                var params = {command: scope.action};
                if(scope.action == "recoverguarantee"){
                    params.command = "recoverGuarantees";
                }

                if (scope.action == "disburse" || scope.action == "forcedisburse"){
                    scope.constructGlimClientMembersData();
                }

                if(scope.action == "approve"){
                    this.formData.expectedDisbursementDate = dateFilter(scope.expectedDisbursementDate, scope.df);
                    if(scope.disbursementDetails != null) {
                        var numberOftranches = scope.disbursementDetails.length;
                        if( scope.approveTranches  && numberOftranches <= 0) {
                            scope.trancheError = true;
                            var errorObj = new Object();
                            errorObj.args = {
                                params: []
                            };
                            errorObj.args.params.push({value: 'error.minimum.one.tranche.required'});
                            scope.errorDetails.push(errorObj);
                        }
                        this.formData.disbursementData = [];
                        for (var i in  scope.disbursementDetails) {
                            this.formData.disbursementData.push({
                                id: scope.disbursementDetails[i].id,
                                principal: scope.disbursementDetails[i].principal,
                                expectedDisbursementDate: dateFilter(scope.disbursementDetails[i].expectedDisbursementDate, scope.df),
                                loanChargeId : scope.disbursementDetails[i].loanChargeId,
                                discountOnDisbursalAmount : scope.disbursementDetails[i].discountOnDisbursalAmount
                            });
                        }
                    }
                    if(scope.formData.approvedLoanAmount == null){
                        scope.formData.approvedLoanAmount = scope.showTrancheAmountTotal;
                    }
                    scope.constructGlimClientMembersData();
                }

                if (this.formData[scope.modelName]) {
                    this.formData[scope.modelName] = dateFilter(this.formData[scope.modelName], scope.df);
                }
                if (scope.action != "undoapproval" && scope.action != "undodisbursal" || scope.action === "paycharge") {
                    this.formData.locale = scope.optlang.code;
                    this.formData.dateFormat = scope.df;
                }
                if (scope.action == "repayment" || scope.action == "waiveinterest" || scope.action == "writeoff" || scope.action == "close-rescheduled"
                    || scope.action == "close" || scope.action == "modifytransaction" || scope.action == "recoverypayment" || scope.action == "prepayloan"
                    || scope.action == "addsubsidy" || scope.action == "revokesubsidy" ||scope.action == "refund" || scope.action == "prepayment" || scope.action == "refundByCash") {

                    if (scope.action == "modifytransaction") {
                        params.command = 'modify';
                        params.transactionId = routeParams.transactionId;
                    }
                    params.loanId = scope.accountId;
                    scope.glimCommandParam = scope.action;
                    if (scope.isGlimEnabled() && scope.action != "modifytransaction") {
                        this.formData.locale = scope.optlang.code;
                        this.formData.dateFormat = scope.df;
                        scope.constructGlimClientMembersData();
                        if(scope.action == "writeoff") {
                            this.formData.transactionAmount = scope.writeOffAmount;
                        }
                        resourceFactory.glimTransactionResource.save({loanId: params.loanId, command: scope.glimCommandParam}, this.formData, function (data) {
                            location.path('/viewloanaccount/' + params.loanId);
                        });
                    } else {
                        if (scope.isGlimEnabled() && scope.action == "modifytransaction") {
                            scope.constructGlimClientMembersData();
                            scope.constructGlimTransactions(scope.glimTransactions);                        
                        }else if (scope.isGlimEnabled()){
                            scope.constructGlimTransactions(scope.glimTransactions);
                        }
                        
                        if(scope.isInterBranchTransaction){
                            params.command = undefined;
                            resourceFactory.interBranchLoanTxnsResource.repayment(params, this.formData, function (data) {                            
                                scope.routeToInterBranchDetails(data.loanId);                                
                            });
                        }else{
                            resourceFactory.loanTrxnsResource.save(params, this.formData, function (data) {                            
                                location.path('/viewloanaccount/' + data.loanId);                                
                            });
                        }
                    }
                } else if (scope.action == "deleteloancharge") {
                    resourceFactory.LoanAccountResource.delete({loanId: routeParams.id, resourceType: 'charges', chargeId: routeParams.chargeId}, this.formData, function (data) {
                        location.path('/viewloanaccount/' + data.loanId);
                    });
                } else if (scope.action === "waivecharge") {
                    resourceFactory.LoanAccountResource.save({loanId: routeParams.id, resourceType: 'charges', chargeId: routeParams.chargeId, 'command': 'waive'}, this.formData, function (data) {
                        location.path('/viewloanaccount/' + data.loanId);
                    });
                } else if (scope.action === "paycharge") {
                    this.formData.transactionDate = dateFilter(this.formData.transactionDate, scope.df);
                    resourceFactory.LoanAccountResource.save({loanId: routeParams.id, resourceType: 'charges', chargeId: routeParams.chargeId, 'command': 'pay'}, this.formData, function (data) {
                        location.path('/viewloanaccount/' + data.loanId);
                    });
                } else if (scope.action === "editcharge") {
                    this.formData.dueDate = dateFilter(this.formData.dueDate, scope.df);
                    resourceFactory.LoanAccountResource.update({loanId: routeParams.id, resourceType: 'charges', chargeId: routeParams.chargeId}, this.formData, function (data) {
                        location.path('/viewloanaccount/' + data.loanId);
                    });
                } else if (scope.action === "editdisbursedate") {
                    this.formData.expectedDisbursementDate = dateFilter(this.formData.expectedDisbursementDate, scope.df);
                    for(var i in scope.disbursementDetails){
                        if(scope.disbursementDetails[i].id == scope.id){
                            scope.disbursementDetails[i].principal = scope.formData.updatedPrincipal;
                            scope.disbursementDetails[i].expectedDisbursementDate = dateFilter(scope.formData.updatedExpectedDisbursementDate, scope.df);
                        }
                    }
                    this.formData.disbursementData = [];
                    this.formData.updatedExpectedDisbursementDate = dateFilter(scope.formData.updatedExpectedDisbursementDate, scope.df);
                    this.formData.expectedDisbursementDate = dateFilter(scope.expectedDisbursementDate, scope.df);

                    for (var i in  scope.disbursementDetails) {
                        this.formData.disbursementData.push({
                            id: scope.disbursementDetails[i].id,
                            principal: scope.disbursementDetails[i].principal,
                            expectedDisbursementDate: dateFilter(scope.disbursementDetails[i].expectedDisbursementDate, scope.df),
                            loanChargeId : scope.disbursementDetails[i].loanChargeId,
                            discountOnDisbursalAmount : scope.disbursementDetails[i].discountOnDisbursalAmount
                        });
                    }
                    resourceFactory.LoanEditDisburseResource.update({loanId: routeParams.id, disbursementId: routeParams.disbursementId}, this.formData, function (data) {
                        location.path('/viewloanaccount/' + data.loanId);
                    });
                }else if(scope.action === "adddisbursedetails" || scope.action === "deletedisbursedetails") {
                    this.formData.disbursementData = [];
                    for (var i in  scope.disbursementDetails) {
                        this.formData.disbursementData.push({
                            id:scope.disbursementDetails[i].id,
                            principal: scope.disbursementDetails[i].principal,
                            expectedDisbursementDate: dateFilter(scope.disbursementDetails[i].expectedDisbursementDate, scope.df),
                            loanChargeId : scope.disbursementDetails[i].loanChargeId,
                            discountOnDisbursalAmount : scope.disbursementDetails[i].discountOnDisbursalAmount
                        });
                    }

                    this.formData.expectedDisbursementDate = dateFilter(scope.expectedDisbursementDate, scope.df);
                    resourceFactory.LoanAddTranchesResource.update({loanId: routeParams.id}, this.formData, function (data) {
                        location.path('/viewloanaccount/' + data.loanId);
                    });
                }
                else if (scope.action == "deleteloancharge") {
                    resourceFactory.LoanAccountResource.delete({loanId: routeParams.id, resourceType: 'charges', chargeId: routeParams.chargeId}, this.formData, function (data) {
                        location.path('/viewloanaccount/' + data.loanId);
                    });
                } else if(scope.action == "applypenalties") {
                    scope.applyPenalties();
                } else {
                    params.loanId = scope.accountId;
                    this.formData.adjustRepaymentDate = dateFilter(this.formData.adjustRepaymentDate, scope.df);
                    this.formData.repaymentsStartingFromDate = dateFilter(this.formData.repaymentsStartingFromDate, scope.df);
                    if(!scope.trancheError) {
                        resourceFactory.LoanAccountResource.save(params, this.formData, function (data) {
                            location.path('/viewloanaccount/' + data.loanId);
                        });
                    }
                }
            }


            var tempTransactionDate = "";
            scope.$watch('formData.transactionDate', function () {
                scope.onDateChange();
                var transactionDate = dateFilter(scope.formData.transactionDate, scope.df);
                if (tempTransactionDate === "" || (tempTransactionDate != transactionDate)) {
                    tempTransactionDate = transactionDate;
                    if (scope.isGLIM && scope.action == 'repayment' && !scope.isGlimPaymentAsGroup) {
                        scope.getRepaymentTemplate(scope.formData.transactionDate);
                    }
                }
            });

            scope.getRepaymentTemplate = function(date){
                var transactionDate = dateFilter(date,  scope.df);
                resourceFactory.glimTransactionTemplateResource.get({loanId: scope.accountId,  command: 'repayment', transactionDate: transactionDate}, function (data) {
                    if (data.clientMembers.length>0) {
                        scope.clientMembers = data.clientMembers;
                        var amount = 0;
                        for (var i=0; i<data.clientMembers.length; i++) {
                            if (angular.isDefined(data.clientMembers[i].transactionAmount)) {
                                amount = amount + parseFloat(data.clientMembers[i].transactionAmount);
                            }
                        }
                        if(scope.isGLIM){
                            scope.formData.transactionAmount = amount.toFixed(2);
                        }
                    } else {
                        scope.clientMembers = undefined;
                        scope.isGLIM = false;
                    }
                });
            };

            scope.runReport = function(){
                var reportURL = $rootScope.hostUrl + API_VERSION + "/runreports/" + encodeURIComponent("Credit Appraisal Memo");
                reportURL += "?output-type=" + encodeURIComponent("XLS") + "&tenantIdentifier=" + $rootScope.tenantIdentifier + "&locale=" + scope.optlang.code + "&dateFormat=" + scope.df;

                var clientIdParam = "R_clientId="+scope.clientId;
                var loanIdParam = "R_loanId="+scope.accountId;
                var reportParms = clientIdParam+"&"+loanIdParam;
                var inQueryParameters = reportParms;
                if (inQueryParameters > "") reportURL += "&" + inQueryParameters;

                // Allow untrusted urls for the ajax request.
                // http://docs.angularjs.org/error/$sce/insecurl
                reportURL = $sce.trustAsResourceUrl(reportURL);

                http.get(reportURL, {responseType: 'arraybuffer'}).
                    success(function(data, status, headers, config) {
                        var contentType = headers('Content-Type');
                        var file = new Blob([data], {type: contentType});
                        var fileContent = URL.createObjectURL(file);

                        // Pass the form data to the iframe as a data url.
                        scope.baseURL = $sce.trustAsResourceUrl(fileContent);
                    });
            };
            scope.onDateChange = function(){
                if(scope.processDate) {
                    var params = {};
                    params.locale = scope.optlang.code;
                    params.dateFormat = scope.df;
                    params.transactionDate = dateFilter(this.formData.transactionDate, scope.df);
                    params.loanId = scope.accountId;
                    params.command = 'prepayLoan';
                    resourceFactory.loanTrxnsTemplateResource.get(params, function (data) {
                        scope.formData.transactionAmount = data.amount;
                        if (data.penaltyChargesPortion > 0) {
                            scope.showPenaltyPortionDisplay = true;
                        }
                        scope.principalPortion = data.principalPortion;
                        scope.interestPortion = data.interestPortion;
                    });
                }
            };

            scope.constructGlimTransactions = function(glimTransactions){
                scope.glimMembers = [];
                if(glimTransactions){
                    for(var i=0;i<glimTransactions.length;i++){
                        scope.glimMembers[i] = {};
                       scope.glimMembers[i].id =glimTransactions[i].glimId;
                       scope.glimMembers[i].transactionAmount =glimTransactions[i].transactionAmount;
                    }
                }
                scope.formData.clientMembers = scope.glimMembers;
            };
            scope.fetchPenalties = function(){  
                var params = {};
                params.locale = scope.optlang.code;
                params.dateFormat = scope.df;
                params.date = dateFilter(this.formData.transactionDate, scope.df);
                params.loanId = scope.accountId;
                resourceFactory.overdueChargeResource.get(params, function (data) {
                    scope.overdueDetailsFetched = true;
                    scope.loanOverdueChargeData = data;
                    scope.totalpenaltyAsOnDate = scope.loanOverdueChargeData.penaltyPostedAsOnDate+ scope.loanOverdueChargeData.penaltyToBePostedAsOnDate;
                    scope.totalpenaltyTillDate =  scope.loanOverdueChargeData.penaltyPostedTillDate;
                    
                    if(scope.totalpenaltyAsOnDate > scope.totalpenaltyTillDate){
                        scope.showaddpenaltymessage = true;
                        scope.showdeletepenaltymessage = false;
                        scope.penaltydiff = scope.totalpenaltyAsOnDate -  scope.totalpenaltyTillDate;
                    }else{
                        scope.showaddpenaltymessage = false;
                        scope.showdeletepenaltymessage = true;
                        scope.penaltydiff = scope.totalpenaltyTillDate-  scope.totalpenaltyAsOnDate ;
                    }
                });
            };

            scope.routeToInterBranchDetails = function(id){
                location.path('/interbranchsearch').search({isInterBranchSearch:'true',searchText:location.search().searchText,officeId: location.search().officeId, 'loanId':id});
            };

            scope.applyPenalties = function(){  
                var formData = {};
                formData.locale = scope.optlang.code;
                formData.dateFormat = scope.df;
                formData.tillDate = dateFilter(this.formData.transactionDate, scope.df);
                resourceFactory.overdueChargeResource.run({loanIdParam: scope.accountId},formData, function (data) {
                   location.path('/viewloanaccount/' + data.loanId);
                });
            };

            scope.$watch('formData.paymentTypeId', function () {
                scope.paymentTypeOptions = [];
                scope.getPaymentTypeOtions();
            }, true);


        }
    });
    mifosX.ng.application.controller('LoanAccountActionsController', ['$scope', 'ResourceFactory', '$location', '$routeParams', '$modal', 'dateFilter', '$http', 'API_VERSION', '$rootScope', '$sce', mifosX.controllers.LoanAccountActionsController]).run(function ($log) {
        $log.info("LoanAccountActionsController initialized");
    });
}(mifosX.controllers || {}));
