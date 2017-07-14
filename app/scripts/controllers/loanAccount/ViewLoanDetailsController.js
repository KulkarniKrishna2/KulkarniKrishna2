(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewLoanDetailsController: function (scope, routeParams, resourceFactory, location, route, http, $modal, dateFilter, API_VERSION, $sce, $rootScope) {
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
            scope.glimPaymentAsGroup = false;
            scope.glimAsGroupConfigName = 'glim-payment-as-group';
            scope.hidePrepayButton = scope.response.uiDisplayConfigurations.viewLoanAccountDetails.isHiddenFeild.prepayLoanButton;
            scope.isGlimChargesAvailbale = true;
            scope.buttons = {};
            scope.singlebuttons = [];
            scope.allowPaymentsOnClosedLoanConfigName = "allow-payments-on-closed-loans";

            resourceFactory.configurationResource.get({configName: scope.glimAsGroupConfigName}, function (configData) {
                if(configData){
                    scope.glimPaymentAsGroup = configData.enabled;
                }
            });

            scope.slabBasedCharge = 'Slab Based';
            scope.flatCharge = "Flat";

            scope.isGlimEnabled = function(){
                return scope.isGlim && !scope.glimPaymentAsGroup;
            };

            scope.isGlimActiveLoan = function(isActive){
                return scope.isGlim && !scope.glimPaymentAsGroup && isActive;
            };

            scope.isGlimRecovery = function(taskPermission){
                return (scope.isGlimEnabled() &&  taskPermission =='RECOVERYPAYMENT_LOAN') ;
            };

            scope.glimAllowedFunctionaility = function(task){
                return ((scope.restrictedGlimFunctionality.indexOf(task)>-1) && scope.isGlim ) || (task=='RECOVERYPAYMENT_LOAN' && scope.isGlimEnabled());
            };

            scope.hideAccruals = function(transaction){
                if((transaction.type.accrual || transaction.type.accrualSuspense || transaction.type.accrualWrittenOff || transaction.type.accrualSuspenseReverse)
                    && !scope.hideTransactions.type.accrual){
                    return false;
                }
                return true;
            };

            scope.routeTo = function (loanId, transactionId, transactionTypeId) {
                if (transactionTypeId == 2 || transactionTypeId == 4 || transactionTypeId == 1 || transactionTypeId == 16 || transactionTypeId == 8
                    || transactionTypeId == scope.addSubsidyTransactionTypeId || transactionTypeId == scope.revokeSubsidyTransactionTypeId ) {
                    location.path('/viewloantrxn/' + loanId + '/trxnId/' + transactionId);
                }
                ;
            };
            scope.hideTransactionDetails = false;


            scope.clickEvent = function (eventName, accountId) {
                eventName = eventName || "";
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
                        if (scope.loandetails.flatInterestRate != null) {
                            location.path('/loanaccount/' + accountId + '/disburse/type/flatinterest');
                        }else {
                            location.path('/loanaccount/' + accountId + '/disburse');
                        }
                        break;
                    case "disburse.tranche":
                        if (scope.loandetails.flatInterestRate != null && scope.loandetails.status.value == "Approved") {
                            location.path('/loanaccount/' + accountId + '/disburse/type/flatinterest');
                        }else {
                            location.path('/loanaccount/' + accountId + '/disburse');
                        }
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
                    case "disburse.tranche.creditbureaureport":
                        if(scope.isCBCheckReq === true && scope.loandetails.status.id == 300){
                            location.path('/creditbureaureport/loan/'+accountId+'/'+scope.trancheDisbursalId);
                        }else if(scope.isCBCheckReq === true && scope.trancheDisbursalId && scope.loandetails.loanApplicationReferenceId && scope.loandetails.loanApplicationReferenceId > 0 && scope.loandetails.status.id == 200){
                            location.path('/creditbureaureport/loan/'+accountId+'/'+scope.trancheDisbursalId);
                        }
                        break;
                    case "refundByCash":
                        location.path('/loanaccount/' + accountId + '/refundByCash');
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
            resourceFactory.LoanAccountResource.getLoanAccountDetails({loanId: routeParams.id,  associations:multiTranchDataRequest+",repaymentSchedule,loanApplicationReferenceId,hierarchyLookup,meeting", exclude: 'guarantors'}, function (data) {
                scope.loandetails = data;

                resourceFactory.glimResource.getAllByLoan({loanId: routeParams.id}, function (data) {
                    scope.glimClientsDetails = data;
                    var totalGlimChargeAmount = 0;
                    for(var i=0;i<data.length;i++){
                        if(angular.isDefined(scope.glimClientsDetails[i].disbursedAmount)){
                            scope.glimClientsDetails[i].disbursedAmount = scope.glimClientsDetails[i].disbursedAmount;
                        }else if(angular.isDefined(scope.glimClientsDetails[i].approvedAmount)){
                            scope.glimClientsDetails[i].disbursedAmount = scope.glimClientsDetails[i].approvedAmount;
                        }else{
                            scope.glimClientsDetails[i].disbursedAmount = scope.glimClientsDetails[i].proposedAmount;
                        }

                        if(angular.isDefined(scope.glimClientsDetails[i].totalFeeChargeOutstanding)){
                            totalGlimChargeAmount = totalGlimChargeAmount+parseFloat(scope.glimClientsDetails[i].totalFeeChargeOutstanding);
                        }
                    }
                    scope.isGlimChargesAvailbale = (totalGlimChargeAmount>0);
                    scope.isGlim = data.length>0;
                });

                resourceFactory.DataTablesResource.getAllDataTables({apptable: 'm_loan', associatedEntityId: scope.loandetails.loanProductId}, function (data) {
                    scope.loandatatables = data;
                });
               
                if(scope.loandetails.isInterestRecalculationEnabled && data.status.value == "Active"){
                    scope.showOriginalSchedule = true;
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
                            taskPermissionName: 'CREATE_LOANCHARGE'
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
                                taskPermissionName: 'CREATE_LOANCHARGE'
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
                            }
                        ]

                    };
                    creditBureauCheckIsRequired();
                }

                if (data.status.value == "Active") {
                    scope.isShowCreditBureauButtonShow(data.loanType.value);
                    scope.buttons = { singlebuttons: [
                        {
                            name: "button.addloancharge",
                            icon: "icon-plus-sign",
                            taskPermissionName: 'CREATE_LOANCHARGE'
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
                                taskPermissionName: 'WRITEOFF_LOAN'
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
                                taskPermissionName: 'READ_LOAN'
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
                            }
                        ]

                    };

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
                        scope.buttons.singlebuttons.splice(1, 0, {
                            name: "button.assignloanofficer",
                            icon: "icon-user",
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
                            taskPermissionName: 'FORECLOSURE_LOAN'
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
                    if(scope.loandetails.repaymentSchedule && scope.loandetails.repaymentSchedule.totalPaidInAdvance){
                        scope.buttons.options.push( {
                            name: "button.refundByCash",
                            taskPermissionName: 'REFUNDBYCASH_LOAN'
                        });

                    }
                }
                if (data.status.value == "Overpaid" && !scope.isGlim ) {
                    scope.singlebuttons.push(
                        {
                            name: "button.refund",
                            icon: "icon-exchange",
                            taskPermissionName: 'REFUND_LOAN'
                        });
                    scope.singlebuttons.push({
                            name: "button.transferFunds",
                            icon: "icon-exchange",
                            taskPermissionName: 'CREATE_ACCOUNTTRANSFER'
                        });
                }
                
                if ((data.status.value == "Overpaid" ||  data.status.value == "Closed (obligations met)")) {
                    if (scope.isGlim) {
                        scope.singlebuttons.push({
                            name: "button.makerepayment",
                            icon: "icon-dollar",
                            taskPermissionName: 'REPAYMENT_LOAN'
                        });
                    }else {
                        resourceFactory.configurationResource.get({configName: scope.allowPaymentsOnClosedLoanConfigName}, function (configData) {
                            if (configData) {
                                if (configData.enabled) {
                                    scope.singlebuttons.push({
                                        name: "button.makerepayment",
                                        icon: "icon-dollar",
                                        taskPermissionName: 'REPAYMENT_LOAN'
                                    });
                                }
                            }
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
                    scope.buttons = {singlebuttons: scope.singlebuttons};
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
            });

            fetchBankTransferDetails = function(){
                resourceFactory.bankAccountTransferResource.getAll({entityType: 'loans', entityId: routeParams.id}, function (data) {
                    scope.transferDetails = data;
                });
            };

            function disbursalSettings(data) {
                if (data.canDisburse) {
                    var disburseButtonLabel = 'button.disburse';
                    if(scope.loandetails.multiDisburseLoan){
                        disburseButtonLabel = 'button.disburse.tranche';
                    }

                    var addDisburseTrancheButton = true;
                    var addDisburseToSavingsTrancheButton = true;
                    for(var i = 0; i < scope.buttons.singlebuttons.length; i++){
                        if(scope.buttons.singlebuttons[i].name == "button.disburse.tranche"){
                            addDisburseTrancheButton = false;
                        }
                        if(scope.buttons.singlebuttons[i].name == "button.disbursetosavings"){
                            addDisburseToSavingsTrancheButton = false;
                        }
                    }
                    if(addDisburseTrancheButton) {
                        scope.buttons.singlebuttons.splice(1, 0, {
                            name: disburseButtonLabel,
                            icon: "icon-flag",
                            taskPermissionName: 'DISBURSE_LOAN'
                        });
                    }
                    if(addDisburseToSavingsTrancheButton) {
                    scope.buttons.singlebuttons.splice(1, 0, {
                        name: "button.disbursetosavings",
                        icon: "icon-flag",
                        taskPermissionName: 'DISBURSETOSAVINGS_LOAN'
                    });
                    }
                    creditBureauCheckIsRequired();
                }
            };

            scope.isRepaymentSchedule = false;
            scope.istransactions = false;
            scope.iscollateral = false;
            scope.isMultiDisburseDetails = false;
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
                    resourceFactory.LoanAccountResource.getLoanAccountDetails({loanId: routeParams.id, associations: associations, isFetchSpecificData: true}, function (data) {
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

            resourceFactory.loanResource.getAllNotes({loanId: routeParams.id,resourceType:'notes'}, function (data) {
                scope.loanNotes = data;
            });

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
                resourceFactory.LoanDocumentResource.getLoanDocuments({loanId: routeParams.id}, function (data) {
                    for (var i in data) {
                        var loandocs = {};
                        loandocs = API_VERSION + '/loans/' + data[i].parentEntityId + '/documents/' + data[i].id + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                        data[i].docUrl = loandocs;
                    }
                    scope.loandocuments = data;
                });

            };

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
                            loandocs = API_VERSION + '/loans/' + d.loanId + '/documents/' + d.scannedDocumentId + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
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
                    entityId: routeParams.id, genericResultSet: 'true'}, function (data) {
                    scope.datatabledetails = data;
                    scope.datatabledetails.isData = data.data.length > 0 ? true : false;
                    scope.datatabledetails.isMultirow = data.columnHeaders[0].columnName == "id" ? true : false;
                    scope.showDataTableAddButton = !scope.datatabledetails.isData || scope.datatabledetails.isMultirow;
                    scope.showDataTableEditButton = scope.datatabledetails.isData && !scope.datatabledetails.isMultirow;
                    scope.singleRow = [];
                    for (var i in data.columnHeaders) {
                        if (scope.datatabledetails.columnHeaders[i].columnCode) {
                            for (var j in scope.datatabledetails.columnHeaders[i].columnValues) {
                                for (var k in data.data) {
                                    if (data.data[k].row[i] == scope.datatabledetails.columnHeaders[i].columnValues[j].id) {
                                        data.data[k].row[i] = scope.datatabledetails.columnHeaders[i].columnValues[j].value;
                                    }
                                }
                            }
                        }
                    }
                    if (scope.datatabledetails.isData) {
                        for (var i in data.columnHeaders) {
                            if (!scope.datatabledetails.isMultirow) {
                                var row = {};
                                if(data.columnHeaders[i].displayName != undefined && data.columnHeaders[i].displayName != 'null') {
                                    row.key = data.columnHeaders[i].displayName;
                                } else {
                                    row.key = data.columnHeaders[i].columnName;
                                }
                                row.value = data.data[0].row[i];
                                scope.singleRow.push(row);
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
                    location.path("/viewdatatableentry/"+registeredTableName+"/"+scope.loandetails.id+"/"+data.row[0]);
                }else{
                    location.path("/viewsingledatatableentry/"+registeredTableName+"/"+scope.loandetails.id);
                }
            };

            scope.viewLoanChargeDetails = function (chargeId) {
                location.path('/loan/'+scope.loandetails.id+'/viewcharge/'+chargeId).search({loanstatus:scope.loandetails.status.value});
            };

            scope.viewRepaymentDetails = function() {

                scope.loanApprovedDate = new Date(scope.loandetails.timeline.approvedOnDate);
                scope.loanApprovedDate = dateFilter(scope.loanApprovedDate, scope.df);

                if(scope.report == false){
                    scope.repaymentscheduleinfo = scope.loandetails.originalSchedule;
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
                scope.baseURL += "?output-type=" + encodeURIComponent(scope.formData.outputType) + "&tenantIdentifier=" + $rootScope.tenantIdentifier+"&locale="+scope.optlang.code;

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
                scope.viewReportDetails = $sce.trustAsResourceUrl(scope.baseURL);

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
                scope.baseURL += "?output-type=" + encodeURIComponent(scope.formData.outputType) + "&tenantIdentifier=" + $rootScope.tenantIdentifier+"&locale="+scope.optlang.code;

                var reportParams = "";
                var paramName = "R_transactionId";
                reportParams += encodeURIComponent(paramName) + "=" + encodeURIComponent(transactionId);
                if (reportParams > "") {
                    scope.baseURL += "&" + reportParams;
                }
                // allow untrusted urls for iframe http://docs.angularjs.org/error/$sce/insecurl
                scope.viewReportDetails = $sce.trustAsResourceUrl(scope.baseURL);

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

            scope.deleteDocument = function (documentId, index) {
                resourceFactory.LoanDocumentResource.delete({loanId: scope.loandetails.id, documentId: documentId}, '', function (data) {
                    scope.loandocuments.splice(index, 1);
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
                if(scope.response && scope.response.uiDisplayConfigurations && (!disbursementDetail.actualDisbursementDate || disbursementDetail.actualDisbursementDate == null)
                    && ((scope.status == 'Submitted and pending approval' && !scope.response.uiDisplayConfigurations.
                        viewLoanAccountDetails.isHiddenFeild.editTranches) || (scope.status =='Approved' && !scope.response.uiDisplayConfigurations.
                        viewLoanAccountDetails.isHiddenFeild.editTranches) || scope.status == 'Active')){
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
                    windowClass: 'app-modal-window'
                });
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
                if(scope.count == 0 && action == 'deletedisbursedetails'){
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
                resourceFactory.clientExistingLoan.getAll({
                    clientId: $rootScope.clientId,
                    loanApplicationId: null,
                    loanId: null,
                    trancheDisbursalId: null
                }, function (data) {
                    scope.existingLoans = data;
                    constructLoanSummary();
                });

            };

            scope.creditBureauReportView = function () {
                resourceFactory.creditBureauReportFileContentResource.get({
                    entityType: 'client',
                    entityId: $rootScope.clientId
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
                resourceFactory.configurationResource.get({configName: 'tranche-disbursal-credit-check'}, function (response) {
                    scope.isTrancheDisbursalCreditCheck = response.enabled;
                    if (scope.isTrancheDisbursalCreditCheck == true) {
                        resourceFactory.configurationResource.get({configName: 'credit-check'}, function (response) {
                            scope.isCreditCheck = response.enabled;
                            if (scope.isCreditCheck== true) {
                                resourceFactory.loanProductResource.getCreditbureauLoanProducts({
                                    loanProductId: scope.loandetails.loanProductId,
                                    associations: 'creditBureaus'
                                }, function (creditbureauLoanProduct) {
                                    scope.creditbureauLoanProduct = creditbureauLoanProduct;
                                    if (scope.creditbureauLoanProduct.isActive == true) {
                                        scope.isCBCheckReq = true;
                                        var cbButton = {
                                            name: "button.disburse.tranche.creditbureaureport",
                                            icon: "icon-flag",
                                            taskPermissionName: 'READ_CREDIT_BUREAU_CHECK'
                                        };
                                        for (var i in scope.buttons.singlebuttons) {
                                            if (scope.buttons.singlebuttons[i].taskPermissionName == 'DISBURSE_LOAN') {
                                                scope.buttons.singlebuttons[i] = cbButton;
                                                break;
                                            }
                                        }
                                        if(!_.isUndefined(scope.loandetails.disbursementDetails)){
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
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            };
        }
    });

    mifosX.ng.application.controller('ViewLoanDetailsController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', '$http', '$modal', 'dateFilter', 'API_VERSION', '$sce', '$rootScope', mifosX.controllers.ViewLoanDetailsController]).run(function ($log) {
        $log.info("ViewLoanDetailsController initialized");
    });
}(mifosX.controllers || {}));
