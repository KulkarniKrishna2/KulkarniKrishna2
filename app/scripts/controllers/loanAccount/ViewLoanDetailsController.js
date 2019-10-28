(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewLoanDetailsController: function (scope, routeParams, resourceFactory, location, route, http, $modal, dateFilter, API_VERSION, $sce, $rootScope, CommonUtilService) {
            scope.loandocuments = [];
            scope.report = false;
            scope.hidePentahoReport = true;
            scope.formData = {};
            scope.date = {};
            scope.date.payDate = new Date();
            scope.hideTransactions = [];
            scope.hideTransactions.type =[];
            scope.hideTransactions.type.accrual = false;
            scope.loandetails = [];
            scope.addSubsidyTransactionTypeId = 50;
            scope.revokeSubsidyTransactionTypeId = 51;
            scope.glimClientsDetails = [];
            scope.isGlim = false;
            scope.restrictedGlimFunctionality = ['FORECLOSURE_LOAN','REFUND_LOAN','CREATE_ACCOUNTTRANSFER'];
            scope.waiveLink = "#/loanaccountcharge/{{loandetails.id}}/waivecharge/{{charge.id}}";
            scope.isGlimTabActive = false;
            scope.futurePeriods = [];
            scope.showTransactions = true;
            scope.showCreditBureau = false;
            scope.showFutureSchedule = false;
            scope.showOriginalSchedule = false;
            scope.glimAsGroupConfigName = 'glim-payment-as-group';
            scope.isGlimPaymentAsGroup = false;
            scope.isGlimChargesAvailbale = true;
            scope.buttons = {};
            scope.singlebuttons = [];
            scope.allowPaymentsOnClosedLoanConfigName = "allow-payments-on-closed-loans";
            scope.sections = [];
            scope.refund_for_active_loan_enum_value= 18;
            scope.existingclientdetailsloaded = false;
            scope.mandatesLoaded = false;
            scope.noteLoaded = false;
            scope.slabBasedCharge = 'Slab Based';
            scope.flatCharge = "Flat";
            scope.selectedCharges = [];
            scope.charges = {};
            scope.hideNetDisbursedAmount = false;
            scope.options = [];
            scope.hideWriteoff = false;
            scope.showBankApprovalStatus = false;
            scope.displayInterestRateFromProduct = false;
            if(scope.response && scope.response.uiDisplayConfigurations){
                scope.showRetryBankTransaction = scope.response.uiDisplayConfigurations.loanAccount.isShowField.retryBankTransaction;
                scope.hideWriteoff = scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.writeOff;
                scope.hidePreviewSchedule = scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.previewSchedule;
                scope.showSavingToDisburse = scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.linkAccountId;
                if(scope.response.uiDisplayConfigurations.viewLoanAccountDetails){
                    scope.showBankApprovalStatus = scope.response.uiDisplayConfigurations.viewLoanAccountDetails.displayBankApprovalStatus;
                    scope.displayInterestRateFromProduct = scope.response.uiDisplayConfigurations.viewLoanAccountDetails.displayInterestRateFromProduct;
                }
                if(scope.response.uiDisplayConfigurations.viewLoanAccountDetails && 
                    scope.response.uiDisplayConfigurations.viewLoanAccountDetails.isHiddenFeild){
                    if(scope.response.uiDisplayConfigurations.viewLoanAccountDetails.isHiddenFeild.prepayLoanButton){
                        scope.hidePrepayButton = scope.response.uiDisplayConfigurations.viewLoanAccountDetails.isHiddenFeild.prepayLoanButton;
                    }
                    if(scope.response.uiDisplayConfigurations.viewLoanAccountDetails.isHiddenFeild.netDisbursedAmount){
                        scope.hideNetDisbursedAmount = scope.response.uiDisplayConfigurations.viewLoanAccountDetails.isHiddenFeild.netDisbursedAmount;
                    }
                    if(scope.response.uiDisplayConfigurations.viewLoanAccountDetails.isHiddenFeild.prudentialWriteOff){
                        scope.showPrudentialWriteOff = !scope.response.uiDisplayConfigurations.viewLoanAccountDetails.isHiddenFeild.prudentialWriteOff;
                    }
                } 
            }
            if(scope.showBankApprovalStatus){
                resourceFactory.bankApprovalStatusResource.get({loanId: routeParams.id}, function (bankLoanStatusData) {
                    scope.bankLoanStatus = bankLoanStatusData.value;          
                });
            }

            scope.draftedTransaction = 1;
            scope.submittedTransaction = 2;
            scope.successTransaction = 5;
            scope.failedTransaction = 6;
            scope.closedTransaction = 7;
            scope.pendingTransaction = 4;
            scope.initiatedTransaction = 3;
            scope.enableClientVerification = scope.isSystemGlobalConfigurationEnabled('client-verification');
            scope.canForceDisburse = false;
            scope.allowBankAccountsForGroups = scope.isSystemGlobalConfigurationEnabled('allow-bank-account-for-groups');
            scope.allowDisbursalToGroupBankAccounts = scope.isSystemGlobalConfigurationEnabled('allow-multiple-bank-disbursal');
            scope.canDisburseToGroupBankAccount = false;
            scope.fromEntity = 'loan';
            var  idList = ['id','client_id', 'office_id', 'group_id', 'center_id', 'loan_id', 'savings_account_id', 'gl_journal_entry_id', 'loan_application_reference_id', 'journal_entry_id'];

            scope.isGlimEnabled = function(){
                return scope.isGlim && !scope.isGlimPaymentAsGroup;
            };

            scope.isGlimActiveLoan = function(isActive){
                return scope.isGlim && !scope.isGlimPaymentAsGroup && isActive;
            };

            scope.isGlimRecovery = function(taskPermission){
                return (scope.isGlimEnabled() &&  taskPermission =='RECOVERYPAYMENT_LOAN') ;
            };

            scope.glimAllowedFunctionaility = function(task){
                return ((scope.restrictedGlimFunctionality.indexOf(task)>-1) && scope.isGlim ) || (task=='RECOVERYPAYMENT_LOAN' && scope.isGlimEnabled());
            };

            scope.hideAccruals = function(transaction){
                if((transaction.type.accrual || transaction.type.accrualSuspense || transaction.type.accrualWrittenOff || transaction.type.accrualSuspenseReverse
                    || transaction.type.accrualReverse || transaction.type.accrualIRDPosting)
                    && !scope.hideTransactions.type.accrual){
                    return false;
                }
                return true;
            };

            scope.routeTo = function (loanId, transactionId, transactionTypeId) {
                if (transactionTypeId == 2 || transactionTypeId == 4 || transactionTypeId == 1 || transactionTypeId == 16 || transactionTypeId == 8
                    || transactionTypeId == scope.addSubsidyTransactionTypeId || transactionTypeId == scope.revokeSubsidyTransactionTypeId || transactionTypeId == scope.refund_for_active_loan_enum_value) {
                    location.path('/viewloantrxn/' + loanId + '/trxnId/' + transactionId);
                }
                ;
            };
            scope.hideTransactionDetails = false;
            scope.entityType ="loan";

            scope.clickEvent = function (eventName, accountId) {
                eventName = eventName || "";
                $rootScope.headerLoanDetails = scope.loandetails;
                switch (eventName) {
                    case "addloancharge":
                        location.path('/addloancharge/' + accountId);
                        break;
                    case "addcollateral":
                        location.path('/addcollateral/' + accountId);
                        break;
                    case "assignloanofficer":
                        location.path('/assignloanofficer/' + accountId);
                        break;
                    case "modifyapplication":
                        location.path('/editloanaccount/' + accountId);
                        break;
                    case "approve":
                        location.path('/loanaccount/' + accountId + '/approve');
                        break;
                    case "reject":
                        location.path('/loanaccount/' + accountId + '/reject');
                        break;
                    case "withdrawnbyclient":
                        location.path('/loanaccount/' + accountId + '/withdrawnByApplicant');
                        break;
                    case "delete":
                        resourceFactory.LoanAccountResource.delete({loanId: accountId}, {}, function (data) {
                            var destination = '/viewgroup/' + data.groupId;
                            if (data.clientId) destination = '/viewclient/' + data.clientId;
                            location.path(destination);
                        });
                        break;
                    case "undoapproval":
                        location.path('/loanaccount/' + accountId + '/undoapproval');
                        break;
                    case "disburse":
                        if(scope.isCBCheckReq === true && ( _.isUndefined(scope.trancheDisbursalId) || scope.trancheDisbursalId == null)){
                            location.path('/loanaccount/' + accountId + '/disburse');
                        }else if (scope.loandetails.flatInterestRate != null) {
                            location.path('/loanaccount/' + accountId + '/disburse/type/flatinterest');
                        }else {
                            location.path('/loanaccount/' + accountId + '/disburse');
                        }
                        break;
                    case "disburse.tranche":
                            location.path('/loanaccount/' + accountId + '/disburse');
                        break;
                    case "disbursetosavings":
                        location.path('/loanaccount/' + accountId + '/disbursetosavings');
                        break;
                    case "undodisbursal":
                        location.path('/loanaccount/' + accountId + '/undodisbursal');
                        break;
                    case "makerepayment":
                        location.path('/loanaccount/' + accountId + '/repayment');
                        break;
                    case "preclose":
                        location.path('/loanaccount/' + accountId + '/prepayloan');
                        break;
                    case "prepay":
                        location.path('/loanaccount/' + accountId + '/prepay');
                        break;
                    case "prepayment":
                        location.path('/loanaccount/' + accountId + '/prepayment');
                        break;
                    case "waiveinterest":
                        location.path('/loanaccount/' + accountId + '/waiveinterest');
                        break;
                    case "writeoff":
                        location.path('/loanaccount/' + accountId + '/writeoff');
                        break;
                    case "prudentialwriteoff":
                            location.path('/loanaccount/' + accountId + '/prudentialwriteoff');
                            break;
                    case "returnloan":
                        location.path('/loanaccount/' + accountId + '/returnloan');
                        break;
                    case "recoverypayment":
                        location.path('/loanaccount/' + accountId + '/recoverypayment');
                        break;
                    case "close-rescheduled":
                        location.path('/loanaccount/' + accountId + '/close-rescheduled');
                        break;
                    case "transferFunds":
                        if (scope.loandetails.clientId) {
                            location.path('/accounttransfers/fromloans/' + accountId);
                        }
                        break;
                    case "close":
                        location.path('/loanaccount/' + accountId + '/close');
                        break;
                    case "createguarantor":
                        location.path('/guarantor/' + accountId);
                        break;
                    case "listguarantor":
                        location.path('/listguarantors/' + accountId);
                        break;
                    case "recoverguarantee":
                        location.path('/loanaccount/' + accountId + '/recoverguarantee');
                        break;
                    case "unassignloanofficer":
                        location.path('/loanaccount/' + accountId + '/unassignloanofficer');
                        break;
                    case "loanscreenreport":
                        location.path('/loanscreenreport/' + accountId);
                        break;
                    case "reschedule":
                        location.path('/loans/' +accountId + '/reschedule');
                        break;
                    case "adjustrepaymentschedule":
                        location.path('/adjustrepaymentschedule/'+accountId) ;
                        break ;
                    case "undolastdisbursal":
                        location.path('/loanaccount/' + accountId + '/undolastdisbursal');
                        break;
                    case "schedulepreview":
                        scope.previewSchedule();
                        break;
                    case "addsubsidy":
                        location.path('/loanaccount/' + accountId + '/addsubsidy');
                        break;
                    case "revokesubsidy":
                        location.path('/loanaccount/' + accountId + '/revokesubsidy');
                        break;
                    case "foreclosure":
                        location.path('loanforeclosure/' + accountId);
                        break;
                    case "refund":
                        location.path('/loanaccount/' + accountId + '/refund');
                        break;
                    case "disburse.creditbureaureport":
                        if (scope.isCBCheckReq) {
                            if (scope.loandetails.loanApplicationReferenceId && scope.loandetails.loanApplicationReferenceId > 0 && scope.loandetails.status.id == 200) {
                                location.path('/creditbureaureport/loanapplication/' + scope.loandetails.loanApplicationReferenceId + '/' + $rootScope.clientId);
                            }
                        }
                        break;
                    case "force.disburse.creditbureaureport":
                        if (scope.isCBCheckReq) {
                            if (scope.loandetails.loanApplicationReferenceId && scope.loandetails.loanApplicationReferenceId > 0 && scope.loandetails.status.id == 200) {
                                location.path('/creditbureaureport/loanapplication/' + scope.loandetails.loanApplicationReferenceId + '/' + $rootScope.clientId);
                            }
                        }
                        break;
                    case "disburse.tranche.creditbureaureport":
                        if(scope.isCBCheckReq === true && scope.trancheDisbursalId && scope.trancheDisbursalId != null){
                            if(scope.loandetails.status.id == 300){
                                location.path('/creditbureaureport/loan/'+accountId+'/'+scope.trancheDisbursalId+'/'+$rootScope.clientId);
                            }else if(scope.loandetails.loanApplicationReferenceId && scope.loandetails.loanApplicationReferenceId > 0 && scope.loandetails.status.id == 200){
                                location.path('/creditbureaureport/loan/'+accountId+'/'+scope.trancheDisbursalId+'/'+$rootScope.clientId);
                            }
                        }
                        break;
                    case "force.disburse.tranche.creditbureaureport":
                        if(scope.isCBCheckReq === true && scope.trancheDisbursalId && scope.trancheDisbursalId != null){
                            if(scope.loandetails.status.id == 300){
                                location.path('/creditbureaureport/loan/'+accountId+'/'+scope.trancheDisbursalId+'/'+$rootScope.clientId);
                            }else if(scope.loandetails.loanApplicationReferenceId && scope.loandetails.loanApplicationReferenceId > 0 && scope.loandetails.status.id == 200){
                                location.path('/creditbureaureport/loan/'+accountId+'/'+scope.trancheDisbursalId+'/'+$rootScope.clientId);
                            }
                        }
                        break;
                    case "refundByCash":
                        location.path('/loanaccount/' + accountId + '/refundByCash');
                    break;
                    case "viewloanapplication":
                        location.path('/viewloanapplicationreference/' + scope.loandetails.loanApplicationReferenceId);
                    break;
                    case "forcedisburse":
                        if (scope.loandetails.flatInterestRate != null) {
                            location.path('/loanaccount/' + accountId + '/disburse/type/flatinterest');
                        }else {
                            location.path('/loanaccount/' + accountId + '/forcedisburse');
                        }
                        break;
                    case "forcedisbursetosavings":
                        location.path('/loanaccount/' + accountId + '/forcedisbursetosavings');
                        break;
                    case "applypenalties":
                        location.path('/loanaccount/' + accountId + '/applypenalties');
                        break;
                    case "disburse.to.groups.bank.accounts":
                        location.path('/loanaccount/' + accountId + '/disbursetogroupbankaccounts');
                        break;
                    case "tranche.disburse.to.groups.bank.accounts":
                        location.path('/loanaccount/' + accountId + '/disbursetogroupbankaccounts');
                        break;
                    case "viewhistory":
                        location.path('/history/' + scope.entityType +'/'+ accountId);
                        break;
                }
            };

            scope.delCharge = function (id) {
                $modal.open({
                    templateUrl: 'delcharge.html',
                    controller: DelChargeCtrl,
                    resolve: {
                        ids: function () {
                            return id;
                        }
                    }
                });
            };

            var DelChargeCtrl = function ($scope, $modalInstance, ids) {
                $scope.delete = function () {
                    resourceFactory.LoanAccountResource.delete({loanId: routeParams.id, resourceType: 'charges', chargeId: ids}, {}, function (data) {

                        $modalInstance.close('delete');
                        route.reload();
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            scope.tabs = [
                { active: true },
                { active: false },
                { active: false },
                { active: false },
                { active: false },
                { active: false },
                { active: false },
                { active: false },
                { active: false },
                { active: false },
                { active: false },
                { active: false },
                { active: false },
                { active: false },
                { active: false }
            ];

            /* For multiple disbursement loans, if second loan is due for disbursement, disburse button does not appearing,
                 hot fix is done by adding "associations: multiTranchDataRequest,isFetchSpecificData: true" in the first request itself
             */

            var multiTranchDataRequest = "multiDisburseDetails,emiAmountVariations";
            var loanApplicationReferenceId = "loanApplicationReferenceId";

            resourceFactory.LoanAccountResource.getLoanAccountDetails({loanId: routeParams.id,  associations:multiTranchDataRequest+",loanApplicationReferenceId,hierarchyLookup,meeting", exclude: 'guarantors'}, function (data) {
                scope.loandetails = data;
                if (scope.displayInterestRateFromProduct && scope.loandetails.loanEMIPackData && scope.loandetails.loanEMIPackData.interestRatePerPeriod) {
                    scope.loandetails.interestRatePerPeriod = scope.loandetails.productInterestRatePerPeriod;
                    scope.loandetails.interestRateFrequencyType = scope.loandetails.productInterestRateFrequencyType;
                    scope.loandetails.annualInterestRate = scope.loandetails.productAnnualInterestRate;
                }
                var loanType = data.loanType.code;
               if(loanType == 'accountType.glim') {
                    scope.isGlimPaymentAsGroup = scope.isSystemGlobalConfigurationEnabled(scope.glimAsGroupConfigName);
                    resourceFactory.glimResource.getAllByLoan({loanId: routeParams.id}, function (glimData) {
                            scope.glimClientsDetails = glimData;
                            var totalGlimChargeAmount = 0;
                            for (var i = 0; i < glimData.length; i++) {
                                if (angular.isDefined(scope.glimClientsDetails[i].disbursedAmount)) {
                                    scope.glimClientsDetails[i].disbursedAmount = scope.glimClientsDetails[i].disbursedAmount;
                                } else if (angular.isDefined(scope.glimClientsDetails[i].approvedAmount)) {
                                    scope.glimClientsDetails[i].disbursedAmount = scope.glimClientsDetails[i].approvedAmount;
                                } else {
                                    scope.glimClientsDetails[i].disbursedAmount = scope.glimClientsDetails[i].proposedAmount;
                                }

                                if (angular.isDefined(scope.glimClientsDetails[i].totalFeeChargeOutstanding)) {
                                    totalGlimChargeAmount = totalGlimChargeAmount + parseFloat(scope.glimClientsDetails[i].totalFeeChargeOutstanding);
                                }
                            }
                            scope.isGlimChargesAvailbale = (totalGlimChargeAmount > 0);
                            scope.isGlim = glimData.length > 0;
                    });
                }
               
                resourceFactory.DataTablesResource.getAllDataTables({apptable: 'm_loan', associatedEntityId: scope.loandetails.loanProductId, isFetchBasicData : false,isFetchAssociateTable: true}, function (data) {
                    scope.datatables = data;
                });
                scope.showOriginalSchedule = true;
                if(scope.loandetails.isInterestRecalculationEnabled && data.status.value == "Active"){
                    
                    if(scope.loandetails.transactionProcessingStrategyCode == 'rbi-india-strategy'){
                        scope.showFutureSchedule = true;
                       
                    }
                }
                 if(data.status.value == "Submitted and pending approval" || data.status.value == "Approved"){
                    scope.showTransactions = false;  
                }        
                if(data.clientData && data.clientData.groups && data.clientData.groups.length ==1) {
                    scope.group = data.clientData.groups[0];
                }
                $rootScope.loanproductName = data.loanProductName;
                $rootScope.clientId=data.clientId;
                $rootScope.LoanHolderclientName=data.clientName;
                scope.convertDateArrayToObject('date');
                scope.recalculateInterest = data.recalculateInterest || true;
                if(scope.loandetails.repaymentSchedule && scope.loandetails.repaymentSchedule.totalWaived){
                    scope.isWaived = scope.loandetails.repaymentSchedule.totalWaived > 0;
                }
                scope.date.fromDate = new Date(data.timeline.actualDisbursementDate);
                scope.date.toDate = new Date();
                scope.status = data.status.value;
                scope.chargeAction = data.status.value == "Submitted and pending approval" ? true : false;
                scope.decimals = data.currency.decimalPlaces;
                scope.canDisburseToGroupBankAccount = data.allowsDisbursementToGroupBankAccounts;
                if (scope.loandetails.charges) {
                    scope.charges = scope.loandetails.charges;
                    for (var i in scope.charges) {
                        if (scope.charges[i].paid || scope.charges[i].waived || scope.charges[i].chargeTimeType.value == 'Disbursement' || scope.loandetails.status.value != 'Active') {
                            var actionFlag = true;
                        }
                        else {
                            var actionFlag = false;
                        }
                        scope.charges[i].actionFlag = actionFlag;
                    }

                    scope.chargeTableShow = true;
                }
                else {
                    scope.chargeTableShow = false;
                }
                if (scope.status == "Submitted and pending approval" || scope.status == "Active" || scope.status == "Approved") {
                    scope.choice = true;
                }
                if (data.status.value == "Submitted and pending approval") {
                    scope.buttons = { singlebuttons: [
                        {
                            name: "button.addloancharge",
                            icon: "icon-plus-sign",
                            taskPermissionName: 'CREATE_LOANCHARGE',
                            isHidden:scope.isGlim
                        },
                        {
                            name: "button.approve",
                            icon: "icon-ok",
                            taskPermissionName: 'APPROVE_LOAN'
                        },
                        {
                            name: "button.modifyapplication",
                            icon: "icon-edit",
                            taskPermissionName: 'UPDATE_LOAN'
                        },
                        {
                            name: "button.reject",
                            icon: "icon-remove",
                            taskPermissionName: 'REJECT_LOAN'
                        }
                    ],
                        options: [
                            {
                                name: "button.assignloanofficer",
                                taskPermissionName: 'UPDATELOANOFFICER_LOAN'
                            },
                            {
                                name: "button.withdrawnbyclient",
                                taskPermissionName: 'WITHDRAW_LOAN'
                            },
                            {
                                name: "button.delete",
                                taskPermissionName: 'DELETE_LOAN'
                            },
                            {
                                name: "button.addcollateral",
                                taskPermissionName: 'CREATE_COLLATERAL'
                            },
                            {
                                name: "button.listguarantor",
                                taskPermissionName: 'READ_GUARANTOR'
                            },
                            {
                                name: "button.createguarantor",
                                taskPermissionName: 'CREATE_GUARANTOR'
                            },
                            {
                                name: "button.loanscreenreport",
                                taskPermissionName: 'READ_LOAN'
                            },
                            {
                                name: "button.viewhistory",
                                taskPermissionName: 'READ_PORTFOLIOHISTORY'
                            }
                        ]

                    };
                    if(data.isVariableInstallmentsAllowed) {
                        scope.buttons.options.push({
                            name: "button.adjustrepaymentschedule",
                            taskPermissionName: 'ADJUST_REPAYMENT_SCHEDULE'
                        }) ;
                    }
                }

                if (data.status.value == "Approved") {
                    var disburseButtonLabel = 'button.disburse';
                    if(scope.loandetails.multiDisburseLoan){
                        disburseButtonLabel = 'button.disburse.tranche';
                    }
                    if(scope.enableClientVerification && data.clientData && !data.clientData.isVerified){
                        scope.canForceDisburse = true;

                    }
                    scope.buttons = { singlebuttons: [
                        {
                            name: "button.assignloanofficer",
                            icon: "icon-user",
                            taskPermissionName: 'UPDATELOANOFFICER_LOAN'
                        },
                        {
                            name: disburseButtonLabel,
                            icon: "icon-flag",
                            taskPermissionName: 'DISBURSE_LOAN'
                        },
                        {
                            name: "button.disbursetosavings",
                            icon: "icon-flag",
                            taskPermissionName: 'DISBURSETOSAVINGS_LOAN'
                        },
                        {
                            name: "button.undoapproval",
                            icon: "icon-undo",
                            taskPermissionName: 'APPROVALUNDO_LOAN'
                        }
                    ],
                        options: [
                            {
                                name: "button.addloancharge",
                                taskPermissionName: 'CREATE_LOANCHARGE',
                                isHidden:scope.isGlim
                            },
                            {
                                name: "button.listguarantor",
                                taskPermissionName: 'READ_GUARANTOR'
                            },
                            {
                                name: "button.createguarantor",
                                taskPermissionName: 'CREATE_GUARANTOR'
                            },
                            {
                                name: "button.loanscreenreport",
                                taskPermissionName: 'READ_LOAN'
                            },
                            {
                                name: "button.viewhistory",
                                taskPermissionName: 'READ_PORTFOLIOHISTORY'
                            }
                        ]
                    };
                    if(scope.canForceDisburse && !scope.canDisburseToGroupsBanks()){
                        var buttonForceDisburse = {
                            name: "button.forcedisburse",
                            icon: "icon-flag",
                            taskPermissionName: 'FORCE_DISBURSE_LOAN'
                        };
                        var buttonForceDisburseToSavings = {
                            name: "button.forcedisbursetosavings",
                            icon: "icon-flag",
                            taskPermissionName: 'FORCE_DISBURSETOSAVINGS_LOAN'
                        };
                        scope.buttons.singlebuttons.push(buttonForceDisburse);
                        scope.buttons.singlebuttons.push(buttonForceDisburseToSavings)
                    }

                    if(scope.canDisburseToGroupsBanks()){
                       var buttonDisburseToGroupBankAccount = {
                            name: "button.disburse.to.groups.bank.accounts",
                            icon: "icon-flag",
                            taskPermissionName: 'DISBURSE_TOGROUPSBANKACCOUNTS_LOAN'
                        }; 
                        if(scope.loandetails.multiDisburseLoan){
                            buttonDisburseToGroupBankAccount.name = "button.tranche.disburse.to.groups.bank.accounts";
                        }
                        scope.buttons.singlebuttons.splice(scope.buttons.singlebuttons.findIndex(x=>x.taskPermissionName ==='DISBURSE_LOAN'),1);
                        scope.buttons.singlebuttons.push(buttonDisburseToGroupBankAccount);

                    }
                    creditBureauCheckIsRequired();
                    if (scope.showSavingToDisburse) {
                        scope.buttons.singlebuttons.splice(2, 1);
                    }
                }

                if (data.status.value == "Active") {
                    scope.isShowCreditBureauButtonShow(data.loanType.value);
                    scope.buttons = { singlebuttons: [
                        {
                            name: "button.addloancharge",
                            icon: "icon-plus-sign",
                            taskPermissionName: 'CREATE_LOANCHARGE',
                            isHidden:scope.isGlim
                        },
                        {
                            name: "button.makerepayment",
                            icon: "icon-dollar",
                            taskPermissionName: 'REPAYMENT_LOAN'
                        },
                        {
                            name: "button.undodisbursal",
                            icon: "icon-undo",
                            taskPermissionName: 'DISBURSALUNDO_LOAN'
                        }
                    ],
                        options: [
                            {
                                name: "button.addsubsidy",
                                taskPermissionName: 'READ_SUBSIDY'
                            },
                            {
                                name: "button.waiveinterest",
                                taskPermissionName: 'WAIVEINTERESTPORTION_LOAN'
                            },
                            {
                                name: "button.writeoff",
                                taskPermissionName: 'WRITEOFF_LOAN',
                                isHidden:scope.hideWriteoff
                            },
                            {
                                name: "button.close-rescheduled",
                                taskPermissionName: 'CLOSEASRESCHEDULED_LOAN'
                            },
                            {
                                name: "button.close",
                                taskPermissionName: 'CLOSE_LOAN'
                            },
                            {
                                name: "button.loanscreenreport",
                                taskPermissionName: 'READ_LOAN'
                            },
                            {
                                name: "button.schedulepreview",
                                taskPermissionName: 'READ_LOAN',
                                isHidden:scope.hidePreviewSchedule
                            },
                            {
                                name: "button.listguarantor",
                                taskPermissionName: 'READ_GUARANTOR'
                            },
                            {
                                name: "button.createguarantor",
                                taskPermissionName: 'CREATE_GUARANTOR'
                            },
                            {
                                name: "button.recoverguarantee",
                                taskPermissionName: 'RECOVERGUARANTEES_LOAN'
                            },
                            {
                                name: "button.reschedule",
                                taskPermissionName: 'CREATE_RESCHEDULELOAN'
                            },
                            {
                                name: "button.refundByCash",
                                taskPermissionName: 'REFUNDBYCASH_LOAN'
                            },
                            {
                                name: "button.applypenalties",
                                taskPermissionName: 'EXECUTE_OVERDUECHARGE'
                            },
                            {
                                name: "button.viewhistory",
                                taskPermissionName: 'READ_PORTFOLIOHISTORY'
                            },
                            {
                                name: "button.returnloan",
                                taskPermissionName: 'RETURNLOAN_LOAN'
                            }
                        ]

                    };
                    
                    if(scope.showPrudentialWriteOff){
                       scope.buttons.options.push({
                            name: "button.prudentialwriteoff",
                            taskPermissionName: 'PRUDENTIAL_WRITEOFF'
                        });
                    }

                    if(data.loanApplicationReferenceId && data.loanApplicationReferenceId > 0){
                        scope.buttons.options.push({
                            name: "button.viewloanapplication",
                            taskPermissionName: 'READ_LOANAPPLICATIONREFERENCE'
                        });
                    }
                    if (!angular.isUndefined(scope.loandetails.interestRecalculationData) && scope.loandetails.interestRecalculationData.isSubsidyApplicable) {
                        resourceFactory.LoanAccountResource.getLoanAccountDetails({loanId: scope.loandetails.id, associations: 'transactions', isFetchSpecificData: true,exclude:'loanBasicDetails'}, function (transactionData) {
                            scope.loandetails.transactions = transactionData.transactions;
                            if(scope.loandetails.transactions && scope.loandetails.transactions.length > 0){
                                for(var i = 0; i < scope.loandetails.transactions.length; i++){
                                    if(scope.loandetails.transactions[i].type.value == "Add Subsidy"){
                                        scope.buttons.options.unshift({
                                            name: "button.revokesubsidy",
                                            taskPermissionName: 'READ_SUBSIDY'
                                        });
                                        break;
                                    }
                                }
                            }
                        

                            if(scope.loandetails.transactions && scope.loandetails.transactions.length > 0) {
                                for (var i = 0; i < scope.loandetails.transactions.length; i++) {
                                    if (angular.isUndefined(scope.loandetails.interestRecalculationData) || !scope.loandetails.interestRecalculationData.isSubsidyApplicable) {
                                        scope.buttons.options.splice(0, 1);
                                        break;
                                    }
                                }
                            }
                        });
                    }

                    scope.getOfficeName=function(officeName,officeReferenceNumber){
                        if(!scope.isReferenceNumberAsNameEnable || officeReferenceNumber==undefined){
                            return officeName;
                        }else{
                            return officeName+ ' - ' + officeReferenceNumber;
                        }
                    }
                   
                    if (data.canDisburse) {
                        disbursalSettings(data);
                    }else{
                        if(data.multiDisburseLoan){
                            scope.getSpecificData('multiDisburseDetails');
                        }
                    }

                    //loan officer not assigned to loan, below logic
                    //helps to display otherwise not
                    if (!data.loanOfficerName) {
                        scope.buttons.options.splice(1, 0, {
                            name: "button.assignloanofficer",
                            taskPermissionName: 'UPDATELOANOFFICER_LOAN'
                        });
                    }

                    if(scope.recalculateInterest && scope.loandetails.interestRecalculationData){
                        scope.hideTransactionDetails = scope.loandetails.interestRecalculationData.isCompoundingToBePostedAsTransaction || false;
                        scope.buttons.singlebuttons.splice(1, 0, {
                            name: "button.preclose",
                            icon: "icon-money",
                            taskPermissionName: 'REPAYMENT_LOAN'
                        });
                    }else{
                        scope.buttons.singlebuttons.splice(1, 0, {
                            name: "button.foreclosure",
                            icon: "icon-money",
                            taskPermissionName: 'FORECLOSURE_LOAN',
                            isHidden:scope.isGlim
                        });
                        if (!scope.hidePrepayButton) {
                            scope.buttons.singlebuttons.splice(1, 0, {
                                name: "button.prepay",
                                icon: "icon-money",
                                taskPermissionName: 'REPAYMENT_LOAN'
                            });
                        }
                    }
                    if(scope.recalculateInterest && scope.loandetails.interestRecalculationData){
                        scope.buttons.options.push( {
                            name: "button.prepayment",
                            taskPermissionName: 'PREPAYMENT_LOAN'
                        });

                    }
                    var count = 0;
                    if(data.disbursementDetails){
                        for(var i in data.disbursementDetails){
                            if(data.disbursementDetails[i].actualDisbursementDate){
                               count++;
                            }
                            if (!data.canDisburse) {
                                if(data.status.value != "Submitted and pending approval" &&   _.isUndefined(data.disbursementDetails[i].actualDisbursementDate)){
                                    scope.loandetails.canDisburse = true;
                                    disbursalSettings(scope.loandetails);
                                    break;
                                }
                            }
                        }
                        if(count > 1){
                            scope.buttons.options.push({
                                name: "button.undolastdisbursal",
                                taskPermissionName: 'DISBURSALLASTUNDO_LOAN'
                            });
                        }
                    }

                }
                if (data.status.value == "Rejected") {
                    scope.options.push(
                        {
                            name: "button.viewhistory",
                            taskPermissionName: 'READ_PORTFOLIOHISTORY'
                        });
                    scope.buttons = {options: scope.options};
                }

                if (data.status.value == "Overpaid" && !scope.isGlim ) {
                    scope.singlebuttons.push(
                        {
                            name: "button.refund",
                            icon: "icon-exchange",
                            taskPermissionName: 'REFUND_LOAN',
                            isHidden:scope.isGlim
                        });
                    scope.singlebuttons.push({
                            name: "button.transferFunds",
                            icon: "icon-exchange",
                            taskPermissionName: 'CREATE_ACCOUNTTRANSFER',
                            isHidden:scope.isGlim
                        });
                }
                
                if ((data.status.value == "Overpaid" ||  data.status.value == "Closed (obligations met)")) {
                    if (scope.isSystemGlobalConfigurationEnabled(scope.allowPaymentsOnClosedLoanConfigName)) {
                        scope.singlebuttons.push({
                            name: "button.makerepayment",
                            icon: "icon-dollar",
                            taskPermissionName: 'REPAYMENT_LOAN'
                        });
                    }
                }
                if (data.status.value == "Closed (written off)") {
                    scope.singlebuttons.push(
                        {
                            name: "button.recoverypayment",
                            icon: "icon-briefcase",
                            taskPermissionName: 'RECOVERYPAYMENT_LOAN'
                        });
                }
                if (data.status.value == "Overpaid" ||  data.status.value == "Closed (written off)" || data.status.value == "Closed (obligations met)") {
                    scope.options.push(
                        {
                            name: "button.viewhistory",
                            taskPermissionName: 'READ_PORTFOLIOHISTORY'
                        });
                    scope.buttons = {singlebuttons: scope.singlebuttons,options: scope.options};
                }
                scope.isWriteOff = false;
                if(scope.loandetails.summary!=null) {
                    if (scope.loandetails.summary.writeoffReasonId != null) {
                        scope.isWriteOff = true;
                    }
                }
                //scope.getAllLoanNotes();
                scope.convertDateArrayToObject('date');

                if($rootScope.hasPermission('READ_BANK_TRANSACTION')){
                    fetchBankTransferDetails();
                }
                scope.isOverPaidOrGLIM();
                // fetchBankDetailAssociation();
                //enableOrDisableLoanLockButtons();
            });

            fetchBankTransferDetails = function(){
                resourceFactory.bankAccountTransferResource.getAll({entityType: 'loans', entityId: routeParams.id}, function (data) {
                    scope.transferDetails = data;
                    scope.closedTransferDetails = [];
                    scope.activeTransferDetails = [];
                    for(var i in scope.transferDetails){
                        if(scope.transferDetails[i].status !=undefined && scope.transferDetails[i].status.id != null && scope.transferDetails[i].status.id != undefined){
                            if(scope.transferDetails[i].status.id== scope.closedTransaction){
                                scope.closedTransferDetails.push(scope.transferDetails[i]);
                            }
                            else{
                                scope.activeTransferDetails.push(scope.transferDetails[i]);
                            }
                        }
                    } 
                    if(scope.activeTransferDetails.length > 0) {
                        scope.transferDetails = scope.activeTransferDetails;
                    }else{
                       scope.transferDetails = scope.closedTransferDetails; 
                       scope.viewClosedTransactions = true;
                    }
                });
            };

            scope.fetchBankDetailAssociation = function(){
                if(angular.isUndefined(scope.loanBankAccountDetailAssociation)){
                    resourceFactory.bankAccountDetailResources.getAll({entityType: "loans",entityId: routeParams.id}, function (data) {
                        scope.loanBankAccountDetailAssociation = data;
                    });
                }
            };

            function disbursalSettings(data) {
                var closedStatus = [400,500,600,601,602];//WITHDRAWN_BY_CLIENT,REJECTED,CLOSED_OBLIGATIONS_MET,CLOSED_WRITTEN_OFF,CLOSED_RESCHEDULE_OUTSTANDING_AMOUNT
                if (data.canDisburse) {
                    var disburseButtonLabel = 'button.disburse';
                    if(scope.loandetails.multiDisburseLoan){
                        disburseButtonLabel = 'button.disburse.tranche';
                    }
                    var canForceDisburseTranche = false;
                    if(scope.enableClientVerification && data.clientData && !data.clientData.isVerified && !scope.canDisburseToGroupsBanks()){
                        scope.canForceDisburseTranche = true;

                    }
                    var addDisburseTrancheButton = true;
                    var addDisburseToSavingsTrancheButton = true;
                    if(scope.canForceDisburseTranche){
                        var addForceDisburseTrancheButton = true;
                        var addForceDisburseToSavingsTrancheButton = true;
                    }

                    if(scope.canDisburseToGroupsBanks()){
                        var addDisburseToGroupBankAccount = true;
                     }
                    for(var i = 0; i < scope.buttons.singlebuttons.length; i++){
                        if(scope.buttons.singlebuttons[i].name == "button.disburse.tranche"){
                            addDisburseTrancheButton = false;
                        }
                        if(scope.buttons.singlebuttons[i].name == "button.disbursetosavings"){
                            addDisburseToSavingsTrancheButton = false;
                        }
                        if(scope.canForceDisburseTranche){
                            if(scope.buttons.singlebuttons[i].name == "button.forcedisburse"){
                                addForceDisburseTrancheButton = false;
                            }
                            if(scope.buttons.singlebuttons[i].name == "button.forcedisbursetosavings"){
                                addForceDisburseToSavingsTrancheButton = false;
                            }
                        }
                       if(scope.canDisburseToGroupsBanks()){
                            if(scope.buttons.singlebuttons[i].name == "button.disburse.to.groups.bank.accounts"){
                              addDisburseToGroupBankAccount = false;
                            }
                            if(scope.buttons.singlebuttons[i].name == "button.tranche.disburse.to.groups.bank.accounts"){
                              addDisburseToGroupBankAccount = false;
                            } 
                        }
                    }
                    
                    if(!scope.isCBCheckReq && addDisburseTrancheButton && !scope.canDisburseToGroupsBanks() && closedStatus.indexOf(data.status.id) < 0) {
                        scope.buttons.singlebuttons.splice(1, 0, {
                            name: disburseButtonLabel,
                            icon: "icon-flag",
                            taskPermissionName: 'DISBURSE_LOAN'
                        });
                    }
                    if(addDisburseToSavingsTrancheButton && closedStatus.indexOf(data.status.id) < 0) {
                        scope.buttons.singlebuttons.splice(1, 0, {
                            name: "button.disbursetosavings",
                            icon: "icon-flag",
                            taskPermissionName: 'DISBURSETOSAVINGS_LOAN'
                        });
                    }

                    if(scope.canForceDisburseTranche && addForceDisburseTrancheButton && closedStatus.indexOf(data.status.id) < 0){
                        scope.buttons.singlebuttons.splice(1, 0, {
                            name: "button.forcedisburse",
                            icon: "icon-flag",
                            taskPermissionName: 'FORCE_DISBURSE_LOAN'
                        });
                    }

                    if(scope.canForceDisburseTranche && addForceDisburseToSavingsTrancheButton && closedStatus.indexOf(data.status.id) < 0){
                        scope.buttons.singlebuttons.splice(1, 0, {
                            name: "button.forcedisbursetosavings",
                            icon: "icon-flag",
                            taskPermissionName: 'FORCE_DISBURSETOSAVINGS_LOAN'
                        });
                    }

                    if(scope.canDisburseToGroupsBanks() && addDisburseToGroupBankAccount && closedStatus.indexOf(data.status.id) < 0){
                        if(scope.loandetails.multiDisburseLoan){
                            scope.buttons.singlebuttons.splice(1, 0, {
                            name: "button.tranche.disburse.to.groups.bank.accounts",
                            icon: "icon-flag",
                            taskPermissionName: 'DISBURSE_TOGROUPSBANKACCOUNTS_LOAN'
                            });
                        }else{
                           scope.buttons.singlebuttons.splice(1, 0, {
                            name: "button.disburse.to.groups.bank.accounts",
                            icon: "icon-flag",
                            taskPermissionName: 'DISBURSE_TOGROUPSBANKACCOUNTS_LOAN'
                            }); 
                        } 
                    }

                    creditBureauCheckIsRequired();
                }
            };

            scope.isRepaymentSchedule = false;
            scope.istransactions = false;
            scope.iscollateral = false;
            scope.isMultiDisburseDetails = true;
            scope.isInterestRatesPeriods = false;
            scope.ischarges = false;
            scope.isFutureSchedule = false;
            scope.getSpecificData = function (associations){
                scope.isDataAlreadyFetched = false;
                if(associations === 'repaymentSchedule'){
                    associations = "repaymentSchedule,originalSchedule";
                }
                if(associations === 'multiDisburseDetails'){
                    associations = "multiDisburseDetails,emiAmountVariations";
                }
                if((associations === 'repaymentSchedule'  || associations === 'repaymentSchedule,originalSchedule' )&& scope.isRepaymentSchedule === true){
                    scope.isDataAlreadyFetched = true;
                }else if((associations === 'futureSchedule')){
                    associations = 'futureSchedule';
                    if(scope.isFutureSchedule === true){
                        scope.isDataAlreadyFetched = true;
                    }
                } else if(associations === 'transactions' && scope.istransactions === true){
                    scope.isDataAlreadyFetched = true;
                }else if(associations === 'collateral' && scope.iscollateral === true){
                    scope.isDataAlreadyFetched = true;
                }else if(associations === 'multiDisburseDetails,emiAmountVariations' && scope.isMultiDisburseDetails === true){
                    scope.isDataAlreadyFetched = true;
                }else if(associations === 'interestRatesPeriods' && scope.isInterestRatesPeriods === true){
                    scope.isDataAlreadyFetched = true;
                }else if(associations === 'charges' && scope.ischarges === true){
                    scope.isDataAlreadyFetched = true;
                }
                if(!scope.isDataAlreadyFetched){
                    resourceFactory.LoanAccountResource.getLoanAccountDetails({loanId: routeParams.id, associations: associations, isFetchSpecificData: true,exclude:'loanBasicDetails'}, function (data) {
                        scope.loanSpecificData = data;
                        if(associations === 'repaymentSchedule' || associations === 'repaymentSchedule,originalSchedule'){
                            scope.isRepaymentSchedule = true;
                            scope.loandetails.originalSchedule = scope.loanSpecificData.originalSchedule;
                            scope.loandetails.repaymentSchedule = scope.loanSpecificData.repaymentSchedule;
                            scope.isWaived = scope.loandetails.repaymentSchedule.totalWaived > 0;
                        }else if(associations === 'futureSchedule'){
                            scope.isFutureSchedule = true;
                            scope.futurePeriods = data.repaymentSchedule.futurePeriods;
                        } else if(associations === 'transactions'){
                            scope.istransactions = true;
                            scope.loandetails.transactions = scope.loanSpecificData.transactions;
                            scope.convertDateArrayToObject('date');
                        }else if(associations === 'collateral'){
                            scope.iscollateral = true;
                            scope.loandetails.collateral = scope.loanSpecificData.collateral;
                        }else if(associations === 'multiDisburseDetails,emiAmountVariations'){
                            scope.isMultiDisburseDetails = true;
                            scope.loandetails.disbursementDetails = scope.loanSpecificData.disbursementDetails;
                            scope.loandetails.emiAmountVariations = scope.loanSpecificData.emiAmountVariations;
                            disbursalSettings(scope.loandetails);
                        }else if(associations === 'interestRatesPeriods'){
                            scope.isInterestRatesPeriods = true;
                            scope.loandetails.interestRatesPeriods = scope.loanSpecificData.interestRatesPeriods;
                        }else if(associations === 'charges'){
                            scope.ischarges = true;
                            scope.loandetails.charges = scope.loanSpecificData.charges;
                            if (scope.loandetails.charges) {
                                scope.charges = scope.loandetails.charges;
                                for (var i in scope.charges) {
                                    if (scope.charges[i].paid || scope.charges[i].waived || scope.charges[i].chargeTimeType.value == 'Disbursement' || scope.loandetails.status.value != 'Active') {
                                        var actionFlag = true;
                                    }
                                    else {
                                        var actionFlag = false;
                                    }
                                    scope.charges[i].actionFlag = actionFlag;
                                }

                                scope.chargeTableShow = true;
                            }else {
                                scope.chargeTableShow = false;
                            }
                        }
                    });
                }
            };

            scope.fetchNotes = function() {
                if(!scope.noteLoaded) {
                    scope.noteLoaded = true;
                    resourceFactory.loanResource.getAllNotes({
                        loanId: routeParams.id,
                        resourceType: 'notes'
                    }, function (data) {
                        scope.loanNotes = data;
                    });
                }
            }

            scope.getChargeWaiveLink = function(loanId, chargeId){
                var suffix = "loanaccountcharge/"+loanId+"/waivecharge/"+chargeId
                var link = scope.isGlim?"#/glim"+suffix:"#/"+suffix;
                return link;
            }

            scope.saveNote = function () {
                resourceFactory.loanResource.save({loanId: routeParams.id, resourceType: 'notes'}, this.formData, function (data) {
                    var today = new Date();
                    temp = { id: data.resourceId, note: scope.formData.note, createdByUsername: "test", createdOn: today };
                    scope.loanNotes.push(temp);
                    scope.formData.note = "";
                    scope.predicate = '-id';
                });
            };

            scope.getLoanDocuments = function () {
                scope.loandocuments = {};
                resourceFactory.LoanDocumentResource.getLoanDocuments({loanId: routeParams.id}, function (data) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].id) {
                            var loandocs = {};
                            loandocs = API_VERSION + '/loans/' + data[i].parentEntityId + '/documents/' + data[i].id + '/attachment';
                            data[i].docUrl = loandocs;
                        }
                        if(data[i].tagValue){
                            scope.pushDocumentToTag(data[i], data[i].tagValue);
                        } else {
                            scope.pushDocumentToTag(data[i], 'uploadedDocuments');
                        }
                    }
                });
            };

            scope.pushDocumentToTag = function(document, tagValue) {
                if (scope.loandocuments.hasOwnProperty(tagValue)) {
                    scope.loandocuments[tagValue].push(document);
                } else {
                    scope.loandocuments[tagValue] = [];
                    scope.loandocuments[tagValue].push(document);
                }
            }

            scope.generateDocument = function (document){
                resourceFactory.documentsGenerateResource.generate({entityType:'loans',entityId: routeParams.id, identifier: document.reportIdentifier}, function(data){
                    document.id = data.resourceId;
                    var loandocs = {};
                    loandocs = API_VERSION + '/' + document.parentEntityType + '/' + document.parentEntityId + '/documents/' + document.id + '/attachment';
                    document.docUrl = loandocs;
                })
            };

            scope.reGenerateDocument = function (document){
                resourceFactory.documentsGenerateResource.reGenerate({entityType:'loans', entityId: routeParams.id, identifier: document.id}, function(data){
                    document.id = data.resourceId;
                    var loandocs = {};
                    loandocs = API_VERSION + '/' + document.parentEntityType + '/' + document.parentEntityId + '/documents/' + document.id + '/attachment';
                    document.docUrl = loandocs;
                })
            };

            scope.getMandatesOnSelect = function () {
                if(!scope.mandatesLoaded){
                    scope.getMandates();
                    scope.mandatesLoaded = true;
                }
            }

            scope.getMandates = function () {
                resourceFactory.mandateResource.getAll({loanId: routeParams.id}, function (data) {
                    var activeExists = false;
                    var inProcessExists = false;
                    scope.updateCancelPossible = false;
                    scope.createPossible = false;

                    if(data && data.length > 0){
                        var len = data.length;
                        for (var i=0; i < len; i++) {
                            var d = data[i];
                            if(d.mandateStatus.code === 'ACTIVE'){
                                activeExists = true;
                            }else if(d.mandateStatus.code === 'CREATE_REQUESTED'
                                || d.mandateStatus.code === 'UPDATE_REQUESTED'
                                || d.mandateStatus.code === 'CANCEL_REQUESTED'){
                                inProcessExists = true;
                                d.editdeletePossible = true;
                            }else if(d.mandateStatus.code === 'CREATE_INPROCESS'
                                || d.mandateStatus.code === 'UPDATE_INPROCESS'
                                || d.mandateStatus.code === 'CANCEL_INPROCESS'){
                                inProcessExists = true;
                            }
                            loandocs = API_VERSION + '/loans/' + d.loanId + '/documents/' + d.scannedDocumentId + '/attachment';
                            d.docUrl = loandocs;
                        }
                    }
                    if(activeExists && !inProcessExists){
                        scope.updateCancelPossible = true;
                    }
                    if(!activeExists && !inProcessExists){
                        scope.createPossible = true;
                    }
                    scope.mandates = data;
                });

            };

            scope.deleteMandate = function (loanId, mandateId) {
                resourceFactory.mandateResource.delete({loanId: loanId, mandateId: mandateId}, '', function (data) {
                    scope.getMandates();
                });
            };

            scope.routeToRepaymentSchedule = function (glimId, disbursedAmount, clientId, clientName) {
                $rootScope.principalAmount = disbursedAmount;
                scope.disbursementDate = angular.isDefined(scope.loandetails.timeline.actualDisbursementDate) ? new Date(scope.loandetails.timeline.actualDisbursementDate):new Date(scope.loandetails.timeline.expectedDisbursementDate);
                $rootScope.disbursementDate = dateFilter(scope.disbursementDate, scope.df);
                $rootScope.loanId = scope.loandetails.id;
                $rootScope.clientName = clientName;
                $rootScope.clientId = clientId;
                location.path('/viewglimrepaymentschedule/' + glimId);
            }

            if ($rootScope.activeGlimTab != undefined && $rootScope.activeGlimTab) {
                scope.isGlimTabActive = $rootScope.activeGlimTab;
                delete $rootScope.activeGlimTab;
            }

            scope.getTotalAmount = function (amount1, amount2, amount3, amount4) {
                amount4 = amount4 == null ? 0 : amount4;
                return (amount1 + amount2 + amount3 + amount4).toFixed(2);
            }

            scope.isShowCreditBureauButtonShow = function(loanType){
                var isGroup = loanType == "Group";
                scope.showCreditBureau = true && (!scope.isGlim && !isGroup);
            }

            scope.getTotalOutstandingLoanBalance = function () {
                return scope.glimPrincipalOutstandingAmount + scope.glimInterestOutstandingAmount + scope.glimFeeOutstandingAmount + scope.glimFeepenaltyOutstandingAmount
                + scope.glimFeepenaltyOutstandingAmount.toFixed(2);
            }


            scope.dataTableChange = function (datatable) {
                resourceFactory.DataTablesResource.getTableDetails({datatablename: datatable.registeredTableName,
                    entityId: routeParams.id, genericResultSet: 'true',associateAppTable:'m_loan'}, function (data) {
                    scope.datatabledetails = data;
                    scope.datatabledetails.isData = data.data.length > 0 ? true : false;
                    scope.datatabledetails.isMultirow = data.columnHeaders[0].columnName == "id" ? true : false;
                    scope.datatabledetails.isColumnData = data.columnData.length > 0 ? true : false;
                    scope.showDataTableAddButton = !scope.datatabledetails.isData || scope.datatabledetails.isMultirow;
                    scope.showDataTableEditButton = scope.datatabledetails.isData && !scope.datatabledetails.isMultirow;
                    scope.singleRow = [];
                    scope.isSectioned = false;
                    scope.sections = [];
                    for (var i in data.columnHeaders) {
                        if (scope.datatabledetails.columnHeaders[i].columnCode) {
                            for (var j in scope.datatabledetails.columnHeaders[i].columnValues) {
                                for (var k in data.data) {
                                    if (data.data[k].row[i] == scope.datatabledetails.columnHeaders[i].columnValues[j].id) {
                                        data.data[k].row[i] = scope.datatabledetails.columnHeaders[i].columnValues[j].value;
                                    }
                                }
                                for(var m in data.columnData){
                                    for(var n in data.columnData[m].row){
                                        if(data.columnData[m].row[n].columnName == scope.datatabledetails.columnHeaders[i].columnName && data.columnData[m].row[n].value == scope.datatabledetails.columnHeaders[i].columnValues[j].id){
                                            data.columnData[m].row[n].value = scope.datatabledetails.columnHeaders[i].columnValues[j].value;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if(data.sectionedColumnList != null && data.sectionedColumnList !=undefined && data.sectionedColumnList.length > 0){
                        scope.isSectioned = true;
                    }
                    
                    if (scope.datatabledetails.isColumnData) {
                        for (var i in data.columnHeaders) {
                            if (!scope.datatabledetails.isMultirow) {
                                var row = {};
                                if(data.columnHeaders[i].displayName != undefined && data.columnHeaders[i].displayName != 'null') {
                                    row.key = data.columnHeaders[i].displayName;
                                } else {
                                    row.key = data.columnHeaders[i].columnName;
                                }
                                for(var j in data.columnData[0].row){
                                    if(data.columnHeaders[i].columnName == data.columnData[0].row[j].columnName){
                                       row.value = data.columnData[0].row[j].value;
                                       break;
                                    }
                                }
                                if(idList.indexOf(row.key) < 0){
                                    scope.singleRow.push(row);
                                }
                                
                            }

                            var index = scope.datatabledetails.columnData[0].row.findIndex(x => x.columnName==data.columnHeaders[i].columnName);
                            if(index > 0 ){
                                if(data.columnHeaders[i].displayName != undefined && data.columnHeaders[i].displayName != 'null') {
                                    scope.datatabledetails.columnData[0].row[index].displayName = data.columnHeaders[i].displayName;

                                } 
                            }
                        }
                    }
                    for(var l in data.sectionedColumnList){
                        var tempSection = {
                        displayPosition:data.sectionedColumnList[l].displayPosition,
                        displayName: data.sectionedColumnList[l].displayName,
                        cols: []
                        }
                    scope.sections.push(tempSection);
                    }
                    if(scope.isSectioned){
                        if (scope.datatabledetails.isColumnData) {
                            for(var l in data.sectionedColumnList){
                                for (var i in data.sectionedColumnList[l].columns) {
                                    for (var j in data.columnHeaders) {
                                        if(data.sectionedColumnList[l].columns[i].columnName == data.columnHeaders[j].columnName ){
                                            var index = scope.sections.findIndex(x => x.displayName==data.sectionedColumnList[l].displayName);
                                            if (!scope.datatabledetails.isMultirow) {   
                                                var row = {};
                                                if(data.columnHeaders[j].displayName != undefined && data.columnHeaders[j].displayName != 'null') {
                                                    row.key = data.columnHeaders[j].displayName;
                                                } else {
                                                    row.key = data.columnHeaders[j].columnName;
                                                }
                                                row.columnDisplayType = data.columnHeaders[j].columnDisplayType;
                                                for(var k in data.columnData[0].row){
                                                    if(data.columnHeaders[j].columnName == data.columnData[0].row[k].columnName){
                                                        row.value = data.columnData[0].row[k].value;
                                                        break;
                                                    }
                                                }
                                                scope.sections[index].cols.push(row);
                                            }
                                        } 
                                    }
                                }
                            }
                        }
                    }
                });
            };

            scope.export = function () {
                scope.report = true;
                scope.printbtn = false;
                scope.viewReport = false;
                scope.viewLoanReport = true;
                scope.viewTransactionReport = false;
            };

            scope.viewJournalEntries = function(){
                location.path("/searchtransaction/").search({loanId: scope.loandetails.id});
            };

            scope.viewLoanDetails = function () {
                scope.report = false;
                scope.hidePentahoReport = true;
                scope.viewReport = false;
            };

            scope.backToLoanDetails = function () {
                scope.previewRepayment = "";
                scope.report = false;
            }

            scope.viewLoanCollateral = function (collateralId){
                location.path('/loan/'+scope.loandetails.id+'/viewcollateral/'+collateralId).search({status:scope.loandetails.status.value});
            };

            scope.viewDataTable = function (registeredTableName,data){
                if (scope.datatabledetails.isMultirow) {
                    var multiURL = "/viewdatatableentry/"+registeredTableName+"/"+scope.loandetails.id+"/" + data.row[0].value;
                    location.path(multiURL).search({fromEntity:scope.fromEntity});
                }else{
                    var singleURL = "/viewsingledatatableentry/"+registeredTableName+"/"+scope.loandetails.id;
                    location.path(singleURL).search({fromEntity:scope.fromEntity});
                }
            };

            scope.viewLoanChargeDetails = function (chargeId) {
                location.path('/loan/'+scope.loandetails.id+'/viewcharge/'+chargeId).search({loanstatus:scope.loandetails.status.value});
            };

            scope.viewRepaymentDetails = function() {

                scope.loanApprovedDate = new Date(scope.loandetails.timeline.approvedOnDate);
                scope.loanApprovedDate = dateFilter(scope.loanApprovedDate, scope.df);

                if(scope.report == false){
                    scope.repaymentscheduleinfo = scope.loandetails.repaymentSchedule;
                    if(scope.loandetails.originalSchedule != undefined){
                        scope.repaymentscheduleinfo =  scope.loandetails.originalSchedule;
                    }
                    scope.repaymentData = [];
                    scope.disbursedData = [];
                    for(var i in scope.repaymentscheduleinfo.periods) {
                        if(scope.repaymentscheduleinfo.periods[i].period) {
                            scope.repaymentData.push(scope.repaymentscheduleinfo.periods[i]);
                        } else {
                            scope.disbursedData.push(scope.repaymentscheduleinfo.periods[i]);
                        }
                    }
                }
                scope.previewRepayment = true;
                scope.report = true;
            }

            scope.printDiv = function(print) {
                var printContents = document.getElementById(print).innerHTML;
                var popupWin = window.open('', '_blank', 'width=300,height=300');
                popupWin.document.open();
                popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="styles/repaymentscheduleprintstyle.css" />' +
                '</head><body onload="window.print()">' + printContents + '<br></body></html>');
                popupWin.document.close();
            }

            scope.viewprintdetails = function () {
                //scope.printbtn = true;
                scope.report = true;
                scope.viewTransactionReport = false;
                scope.viewReport = true;
                scope.hidePentahoReport = true;
                scope.formData.outputType = 'PDF';
                scope.baseURL = $rootScope.hostUrl + API_VERSION + "/runreports/" + encodeURIComponent("Client Loan Account Schedule");
                scope.baseURL += "?output-type=" + encodeURIComponent(scope.formData.outputType)  +"&locale="+scope.optlang.code;

                var reportParams = "";
                scope.startDate = dateFilter(scope.date.fromDate, 'yyyy-MM-dd');
                scope.endDate = dateFilter(scope.date.toDate, 'yyyy-MM-dd');
                var paramName = "R_startDate";
                reportParams += encodeURIComponent(paramName) + "=" + encodeURIComponent(scope.startDate)+ "&";
                paramName = "R_endDate";
                reportParams += encodeURIComponent(paramName) + "=" + encodeURIComponent(scope.endDate)+ "&";
                paramName = "R_selectLoan";
                reportParams += encodeURIComponent(paramName) + "=" + encodeURIComponent(scope.loandetails.accountNo);
                if (reportParams > "") {
                    scope.baseURL += "&" + reportParams;
                }
                // allow untrusted urls for iframe http://docs.angularjs.org/error/$sce/insecurl
                baseURL = $sce.trustAsResourceUrl(scope.baseURL);

                http.get(baseURL, {responseType: 'arraybuffer'}).
                success(function (data, status, headers, config) {
                    var contentType = headers('Content-Type');
                    var file = new Blob([data], {type: contentType});
                    var fileContent = URL.createObjectURL(file);

                    scope.viewReportDetails = $sce.trustAsResourceUrl(fileContent);
                });

            };

            scope.viewloantransactionreceipts = function (transactionId) {
                //scope.printbtn = true;
                scope.report = true;
                scope.viewTransactionReport = true;
                scope.viewLoanReport = false;
                scope.viewReport = true;
                scope.hidePentahoReport = true;
                scope.formData.outputType = 'PDF';
                scope.baseURL = $rootScope.hostUrl + API_VERSION + "/runreports/" + encodeURIComponent("Loan Transaction Receipt");
                scope.baseURL += "?output-type=" + encodeURIComponent(scope.formData.outputType)+"&locale="+scope.optlang.code;

                var reportParams = "";
                var paramName = "R_transactionId";
                reportParams += encodeURIComponent(paramName) + "=" + encodeURIComponent(transactionId);
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
            scope.viewloantransactionjournalentries = function(transactionId){
                var transactionId = "L" + transactionId;
                if(scope.loandetails.clientId != null && scope.loandetails.clientId != ""){
                    location.path('/viewtransactions/' + transactionId).search({productName: scope.loandetails.loanProductName,loanId:scope.loandetails.id,clientId: scope.loandetails.clientId,
                        accountNo: scope.loandetails.accountNo,clientName: scope.loandetails.clientName,isTransactionReferenceNumber:true});
                }else{
                    location.path('/viewtransactions/' + transactionId).search({productName: scope.loandetails.loanProductName,loanId:scope.loandetails.id,accountNo: scope.loandetails.accountNo,
                        groupId :scope.loandetails.group.id,groupName :scope.loandetails.group.name,isTransactionReferenceNumber:true});

                }

            };

            scope.printReport = function () {
                window.print();
                window.close();
            }

            scope.deleteAll = function (apptableName, entityId) {
                resourceFactory.DataTablesResource.delete({datatablename: apptableName, entityId: entityId, genericResultSet: 'true'}, {}, function (data) {
                    route.reload();
                });
            };

            scope.deleteDocument = function (document, index, tagValue) {
                resourceFactory.LoanDocumentResource.delete({loanId: scope.loandetails.id, documentId: document.id}, '', function (data) {
                    if(document.reportIdentifier) {
                     delete document.id ;
                    }else {
                        scope.loandocuments[tagValue].splice(index, 1);
                    }
                });
            };

            scope.downloadDocument = function (documentId) {

            };

            scope.transactionSort = {
                column: ['date','id'],
                descending: true
            };
            scope.changeTransactionSort = function(column) {
                var sort = scope.transactionSort;
                if (sort.column == column) {
                    sort.descending = !sort.descending;
                } else {
                    sort.column = column;
                    sort.descending = true;
                }
            };

            scope.showEdit = function(disbursementDetail){
                if(scope.response && scope.response.uiDisplayConfigurations && ((scope.status == 'Submitted and pending approval' && !scope.response.uiDisplayConfigurations.
                        viewLoanAccountDetails.isHiddenFeild.editTranches)|| (scope.status =='Approved' && !scope.response.uiDisplayConfigurations.
                        viewLoanAccountDetails.isHiddenFeild.editTranches) || (scope.status == 'Active' && (!disbursementDetail.actualDisbursementDate || disbursementDetail.actualDisbursementDate == null)))){
                    return true;
                }
                return false;
            };

            scope.showApprovedAmountBasedOnStatus = function () {
                if (scope.status == 'Submitted and pending approval' || scope.status == 'Withdrawn by applicant' || scope.status == 'Rejected') {
                    return false;
                }
                return true;
            };
            scope.showDisbursedAmountBasedOnStatus = function(){
                if(scope.status == 'Submitted and pending approval' ||scope.status == 'Withdrawn by applicant' || scope.status == 'Rejected' ||
                    scope.status == 'Approved'){
                    return false;
                }
                return true;
            };

            scope.checkStatus = function(){
                if(scope.status == 'Active' || scope.status == 'Closed (obligations met)' || scope.status == 'Overpaid' ||
                    scope.status == 'Closed (rescheduled)' || scope.status == 'Closed (written off)'){
                    return true;
                }
                return false;
            };

            scope.previewSchedule = function () {
                $modal.open({
                    templateUrl: 'showschedule.html',
                    controller: PreviewScheduleCtrl,
                    windowClass: 'app-modal-window-full-screen'
                });
            };

            scope.showTaxDetails = function (charge) {
                scope.chargeId = charge;
                $modal.open({
                    templateUrl: 'showTaxDetails.html',
                    controller: showTaxDetailsCtrl,
                    windowClass: 'app-modal-window'
                });
            };

            var showTaxDetailsCtrl = function ($scope, $modalInstance) {
                
                resourceFactory.loanResource.get({ resourceType: 'charges', loanId: routeParams.id, resourceId: scope.chargeId}, function (data) {
                    $scope.charge = data;
                    $scope.taxDetails = data.loanChargeTaxDetails;
                });

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            var PreviewScheduleCtrl = function ($scope, $modalInstance) {
                $scope.loandetails = scope.loandetails;
                resourceFactory.loanResource.get({loanId: routeParams.id, resourceType: 'schedulepreview'}, function (data) {
                    $scope.repaymentscheduleinfo = data;
                });

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            /***
             * we are using orderBy(https://docs.angularjs.org/api/ng/filter/orderBy) filter to sort fields in ui
             * api returns dates in array format[yyyy, mm, dd], converting the array of dates to date object
             * @param dateFieldName
             */
            scope.convertDateArrayToObject = function(dateFieldName){
                for(var i in scope.loandetails.transactions){
                    scope.loandetails.transactions[i][dateFieldName] = new Date(scope.loandetails.transactions[i].date);
                }
            };

            scope.showAddDeleteTrancheButtons = function(action){
                scope.return = true;
                if(scope.status == 'Closed (obligations met)' || scope.status == 'Overpaid' ||
                    scope.status == 'Closed (rescheduled)' || scope.status == 'Closed (written off)' ||
                    scope.status =='Submitted and pending approval'){
                    scope.return = false;
                }
                scope.totalDisbursedAmount = 0;
                scope.count = 0;
                for(var i in scope.loandetails.disbursementDetails){
                    if(scope.loandetails.disbursementDetails[i].actualDisbursementDate != null){
                        scope.totalDisbursedAmount += scope.loandetails.disbursementDetails[i].principal;
                    }
                    else{
                        scope.count +=  1;
                    }
                }
                if(scope.totalDisbursedAmount == scope.loandetails.approvedPrincipal || scope.return == false){
                    return false;
                }
                if(scope.count == 1 && action == 'deletedisbursedetails'){
                    return false;
                }

                return true;
            };

            scope.viewTransferDetails = function(transferData){
                location.path('/viewbankaccounttransfers/'+'loans/' + transferData.entityId+'/'+transferData.transactionId);
            };

            scope.retryTransfer = function(transferData){
                if(transferData.status.id==6){
                    resourceFactory.bankAccountTransferResource.save({bankTransferId: transferData.transactionId, command: 'retry'}, function (data) {
                        fetchBankTransferDetails();
                    });
                }
            };

            scope.reject = function (transferData) {
                var statusList = [scope.draftedTransaction,scope.submittedTransaction,scope.failedTransaction];

                if(statusList.indexOf(transferData.status.id) >= 0){
                    resourceFactory.bankAccountTransferResource.save({bankTransferId: transferData.transactionId, command: 'reject'}, function (data) {
                    fetchBankTransferDetails();
                    });
                }
                
            };
            scope.forceReject = function (transferData) {
                var statusList = [scope.initiatedTransaction,scope.pendingTransaction];

                if(statusList.indexOf(transferData.status.id) >= 0){
                    resourceFactory.bankAccountTransferResource.save({bankTransferId: transferData.transactionId, command: 'force_reject'}, function (data) {
                    fetchBankTransferDetails();
                    });
                }
                
            };

            scope.closeBankTransfer = function (transferData) {

                if(transferData.status.id == scope.successTransaction){
                    resourceFactory.bankAccountTransferResource.save({bankTransferId: transferData.transactionId, command: 'close'}, function (data) {
                    fetchBankTransferDetails();
                    });
                }
                
            };

            scope.removeLoanBankAccountAssociation = function (bankAccountDetailId){
                resourceFactory.loanBankAccountAssociationResources.delete({entityType: "loans",entityId: scope.loandetails.id, bankAccountId: bankAccountDetailId}, function (data) {
                    scope.bankAccountDetails = data;
                    route.reload();
                });
            }

            function constructActiveLoanSummary() {
                if (scope.existingLoans) {
                    for (var i in scope.existingLoans) {
                        var existingLoan = scope.existingLoans[i];
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
                        dData = true;
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
                if(scope.activeLoan && scope.activeLoan.summaries && scope.activeLoan.summaries.length > 0){
                    if(scope.closedLoan && scope.closedLoan.summaries && scope.closedLoan.summaries.length > 0){
                        for(var i in scope.activeLoan.summaries){
                            for(var j in scope.closedLoan.summaries){
                                if(scope.activeLoan.summaries[i].lenderName === scope.closedLoan.summaries[j].lenderName){
                                    if (scope.activeLoan.summaries[i].customerSince > scope.closedLoan.summaries[j].customerSince) {
                                        scope.activeLoan.summaries[i].customerSince = scope.closedLoan.summaries[j].customerSince
                                    }else if(scope.closedLoan.summaries[j].customerSince > scope.activeLoan.summaries[i].customerSince){
                                        scope.closedLoan.summaries[i].customerSince = scope.activeLoan.summaries[j].customerSince
                                    }
                                }
                            }
                        }
                    }
                }
            };

            function convertEMIAmountToMonthlyAmount(existingLoan){
                if(existingLoan.loanTenurePeriodType.value.toLowerCase() === 'months'){
                    return existingLoan.installmentAmount;
                }else if(existingLoan.loanTenurePeriodType.value.toLowerCase() === 'weeks'){
                    if(existingLoan.repaymentFrequencyMultipleOf && existingLoan.repaymentFrequencyMultipleOf === 2){
                        return convertBIWeeklyEMIAmountToMonthly(existingLoan);
                    } else {
                        return convertWeeklyEMIAmountToMonthly(existingLoan);
                    }
                }else if(existingLoan.loanTenurePeriodType.value.toLowerCase() === 'days'){
                    return convertDailyEMIAmountToMonthly(existingLoan);
                }else{
                    return 0.00;
                }
            };

            function convertBIWeeklyEMIAmountToMonthly(existingLoan){
                return (existingLoan.installmentAmount/14) * 30;
            };

            function convertWeeklyEMIAmountToMonthly(existingLoan){
                return (existingLoan.installmentAmount/7) * 30;
            };

            function convertDailyEMIAmountToMonthly(existingLoan){
                return existingLoan.installmentAmount * 30;
            };

            scope.getCreditBureauReportSummary = function () {
                if(!scope.existingclientdetailsloaded) {
                    if(_.isUndefined(scope.fileContentData)){
                        resourceFactory.creditBureauReportFileContentResource.get({
                            entityType: 'client',
                            entityId: $rootScope.clientId
                        }, function (fileContentData) {
                            scope.fileContentData = fileContentData;
                        });
                    }

                    scope.existingclientdetailsloaded = true;
                    resourceFactory.creditBureauEnquiriesResource.getAll({
                        entityType: "loanapplication",
                        entityId: scope.loandetails.loanApplicationReferenceId
                     }, function (data) {
                        scope.creditBureauEnquiries = data;
                        if(scope.creditBureauEnquiries && scope.creditBureauEnquiries.length > 0){
                            scope.creditBureauEnquiry = scope.creditBureauEnquiries[0];
                            if(scope.creditBureauEnquiry){
                                if (scope.creditBureauEnquiry.status) {
                                    scope.isResponPresent = true;
                                        resourceFactory.clientCreditSummary.getAll({
                                            clientId: $rootScope.clientId,
                                            enquiryId: scope.creditBureauEnquiry.id
                                        }, function (data) {
                                            scope.existingLoans = data.existingLoans;
                                            scope.creditScores = data.creditScores ;
                                            constructLoanSummary();
                                        });
                                } 
                                if(scope.creditBureauEnquiry.errors){
                                    scope.errorMessage = scope.loansSummary.errors;
                                }                               
                            }                          
                        }
                    });
                }
            };

            var viewDocumentCtrl= function ($scope, $modalInstance, reportDetails) {
                $scope.data = reportDetails;
                $scope.close = function () {
                    $modalInstance.close('close');
                };   
            };

            scope.creditBureauReportView = function () {
                if(scope.creditBureauEnquiry && scope.creditBureauEnquiry.id){
                    var reportEntityType = "CreditBureau";
                    $modal.open({
                        templateUrl: 'viewDocument.html',
                        controller: viewDocumentCtrl,
                         resolve: {
                            reportDetails: function () {
                                return {'enquiryId' : scope.creditBureauEnquiry.id,'reportEntityType' : reportEntityType};
                            }
                        }
                    });
                }              
            };

            scope.isOverPaidLoan = false;
            scope.isOverPaidOrGLIM = function(){
                var statusCheckforGlim = ["submitted and pending approval","approved",
                    "rejected"];
               if ((scope.loandetails.status.value.toLowerCase() == "overpaid") || (scope.isGlim && (statusCheckforGlim.indexOf(scope.loandetails.status.value.toLowerCase())<0))){
                scope.isOverPaidLoan = true;
               }
            };

            scope.isCBCheckReq = false;
            function creditBureauCheckIsRequired() {
                if(scope.isCBCheckReq === false && scope.loandetails.status.id == 300){
                    getCreditBureauCheckIsRequired();
                }else if(scope.isCBCheckReq === false && scope.loandetails.loanApplicationReferenceId && scope.loandetails.loanApplicationReferenceId > 0 && scope.loandetails.status.id == 200){
                    getCreditBureauCheckIsRequired();
                }
            }

            function getCreditBureauCheckIsRequired() {
                scope.isTrancheDisbursalCreditCheck = scope.isSystemGlobalConfigurationEnabled('tranche-disbursal-credit-check');
                scope.isCreditCheck = scope.isSystemGlobalConfigurationEnabled('credit-check');
                if ((scope.isTrancheDisbursalCreditCheck && scope.loandetails.multiDisburseLoan) || (scope.isCreditCheck && scope.loandetails.status.id == 200)) {
                    if (scope.isCreditCheck) {
                        resourceFactory.loanProductResource.getCreditbureauLoanProducts({
                            loanProductId: scope.loandetails.loanProductId,
                            associations: 'creditBureaus',
                            clientId:$rootScope.clientId
                        }, function (creditbureauLoanProduct) {
                            scope.creditbureauLoanProduct = creditbureauLoanProduct;
                            if (scope.creditbureauLoanProduct.isActive == true) {
                                scope.isCBCheckReq = true;
                                addCBCheckButtons();
                                if(!_.isUndefined(scope.loandetails.disbursementDetails) && scope.loandetails.disbursementDetails.length > 0){
                                    var expectedDisbursementDate = undefined;
                                    for(var i in scope.loandetails.disbursementDetails){
                                        if(_.isUndefined(scope.loandetails.disbursementDetails[i].actualDisbursementDate)){
                                            if(_.isUndefined(expectedDisbursementDate)){
                                                expectedDisbursementDate = scope.loandetails.disbursementDetails[i].expectedDisbursementDate;
                                                scope.trancheDisbursalId = scope.loandetails.disbursementDetails[i].id;
                                            }else{
                                                if(new Date(expectedDisbursementDate) > new Date(scope.loandetails.disbursementDetails[i].expectedDisbursementDate)){
                                                    expectedDisbursementDate = scope.loandetails.disbursementDetails[i].expectedDisbursementDate;
                                                    scope.trancheDisbursalId = scope.loandetails.disbursementDetails[i].id;
                                                }
                                            }
                                        }
                                    }
                                    if(scope.trancheDisbursalId && scope.trancheDisbursalId != null){
                                        addCBCheckButtons();
                                    }
                                }
                            }
                        });
                    }
                }
            };

            function addCBCheckButtons() {
                var cbButton = {
                    name : "",
                    icon: "icon-flag",
                    taskPermissionName: 'READ_CREDIT_BUREAU_CHECK'
                };
                for (var i in scope.buttons.singlebuttons) {
                    if (scope.buttons.singlebuttons[i].taskPermissionName == 'FORCE_DISBURSE_LOAN') {
                        var cbButtonLabel = {};
                        angular.copy(cbButton,cbButtonLabel);
                        if(scope.loandetails.status.id == 200){
                            cbButtonLabel.name = "button.force.disburse.creditbureaureport";
                        }else{
                            if(!scope.loandetails.multiDisburseLoan){
                                cbButtonLabel.name = "button.force.disburse.creditbureaureport";
                            }else{
                                cbButtonLabel.name = "button.force.disburse.tranche.creditbureaureport";
                            }
                        }
                        scope.buttons.singlebuttons[i] = cbButtonLabel;
                    }else if (scope.buttons.singlebuttons[i].taskPermissionName == 'DISBURSE_LOAN') {
                        var cbButtonLabel = {};
                        angular.copy(cbButton,cbButtonLabel);
                        if(scope.loandetails.status.id == 200){
                            cbButtonLabel.name = "button.disburse.creditbureaureport";
                        }else{
                            if(!scope.loandetails.multiDisburseLoan){
                                cbButtonLabel.name = "button.disburse.creditbureaureport";
                            }else{
                                cbButtonLabel.name = "button.disburse.tranche.creditbureaureport";
                            }
                        }
                        scope.buttons.singlebuttons[i] = cbButtonLabel;
                    }
                }
            }

            scope.selectClosedTransactions = function(value){
                if(value){
                    scope.transferDetails = scope.closedTransferDetails;
                }else{
                    scope.transferDetails =  scope.activeTransferDetails; 
                }
            };
            scope.lockOrUnLockLoan = function () {
                var action = 'lock';
                if(scope.loandetails.isLocked){
                    action = 'unlock';
                }
                resourceFactory.lockOrUnlockEntityResource.lockOrUnlock({
                    entityType: 'loan',
                    entityId: routeParams.id,
                    'command': action
                }, function (responseData) {
                    scope.loandetails.isLocked = !scope.loandetails.isLocked;
                    //enableOrDisableLoanLockButtons();
                });
            };

            scope.getLoanTopDetails = function(){
                if(scope.loanTopupDetails == undefined || scope.loanTopupDetails.length==0){                    
                    resourceFactory.loanTopupResource.get({loanId: routeParams.id}, function (data) {
                        scope.loanTopupDetails = data;
                    });
                }
            }

            var enableOrDisableLoanLockButtons = function () {
                for(var i in scope.buttons.singlebuttons){
                    if(scope.buttons.singlebuttons[i].taskPermissionName == 'DISBURSALUNDO_LOAN'){
                        scope.buttons.singlebuttons[i].isEnableButton = !scope.loandetails.isLocked;
                    }
                }
            };

            scope.canDisburseToGroupsBanks = function(){
                return (scope.canDisburseToGroupBankAccount && scope.allowBankAccountsForGroups && scope.allowDisbursalToGroupBankAccounts);
            };

            scope.download = function(file){
                var url =$rootScope.hostUrl + file.docUrl;
                var fileType = file.fileName.substr(file.fileName.lastIndexOf('.') + 1);
                CommonUtilService.downloadFile(url,fileType);
            }

            scope.selectAllCharges = function () {
                scope.selectedCharges = [];
                scope.charges.forEach(element => {
                    if (!element.actionFlag) {
                        if (scope.charges.selectallcharges) {
                            element.selected = true;
                            scope.selectedCharges.push(element);
                        } else {
                            element.selected = false;
                        }
                    }
                });
            }

            scope.addForSelection = function(charge){
                if(charge.selected){
                    scope.selectedCharges.push(charge);
                }else{

                    for(var i = 0; i < scope.selectedCharges.length; i++){
                        if ( scope.selectedCharges[i].id === charge.id) {
                            scope.selectedCharges.splice(i, 1);
                            break;
                        }
                    }
                }
            }

            scope.waivecharges = function () {
                $modal.open({
                    templateUrl: 'waivecharge.html',
                    controller: WaiveChargeCtrl,
                    resolve: {
                        selectedCharges: function () {
                            return scope.selectedCharges;
                        }
                    }
                });
            };

            var WaiveChargeCtrl = function ($scope, $modalInstance, selectedCharges) {
                $scope.selectedCharges = selectedCharges;
                $scope.submit = function () {
                    var formData = {};
                    var waiverChargeIds = [];
                    selectedCharges.forEach(element => {
                        waiverChargeIds.push(element.id);
                    });
                    formData.chargeIds = waiverChargeIds;
                    resourceFactory.loanChargesResource.save({loanId: routeParams.id,command:'waive'}, formData, function (data) {
                        $modalInstance.close('delete');
                        route.reload();
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            scope.hideField = function(data){
               if(idList.indexOf(data.columnName) >= 0) {
                return true;
               }
               return false;
            }
            scope.getStatusCode = function () {
                if (scope.loandetails.status) {
                    if (scope.loandetails.subStatus) {
                        return scope.loandetails.status.code + "." + scope.loandetails.subStatus.code;
                    } else {
                        return scope.loandetails.status.code;
                    }
                }
            };

            scope.isHiddenButton = function(isHide){
                if(isHide){
                    return (isHide==true);
                }
                return false;
            }
        }
    });

    mifosX.ng.application.controller('ViewLoanDetailsController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', '$http', '$modal', 'dateFilter', 'API_VERSION', '$sce', '$rootScope', 'CommonUtilService', mifosX.controllers.ViewLoanDetailsController]).run(function ($log) {
        $log.info("ViewLoanDetailsController initialized");
    });
}(mifosX.controllers || {}));
