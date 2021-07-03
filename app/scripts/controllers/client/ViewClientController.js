(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewClientController: function (scope, routeParams, route, location, resourceFactory, http, $modal, API_VERSION, $rootScope, $upload, dateFilter, commonUtilService, localStorageService,$sce,paginatorUsingOffsetService, popUpUtilService) {
            scope.clientId = routeParams.id;
            if(!_.isUndefined($rootScope.isClientAdditionalDetailTabActive)){
                delete $rootScope.isClientAdditionalDetailTabActive;
            }else{
                var savedTabs = localStorageService.getFromLocalStorage("tabPersistence");
                var lsClientId = localStorageService.getFromLocalStorage("lsClientId");

                // ----- clearing local storage of loan accounts -----
                var savedTabArrayValue = localStorageService.getFromLocalStorage("loanAccountTabPersistance");
                var lsLoadnId = localStorageService.getFromLocalStorage("lsLoanId");
                if(savedTabArrayValue && lsLoadnId) {
                   delete lsLoadnId.lsLoadIdValue;
                   delete savedTabArrayValue.savedTabArrayValue;
                   localStorageService.addToLocalStorage('lsLoanId', lsLoadnId);
                   localStorageService.addToLocalStorage('loanAccountTabPersistance', {savedTabArrayValue: 0}); 
                }
                

                if(lsClientId) {
                    if(scope.clientId != lsClientId.lsClientIdValue) {
                        if(savedTabs){
                            delete savedTabs.clientTabset;
                            delete savedTabs.clientADTabset;
                            delete lsClientId.lsClientIdValue;
                            localStorageService.addToLocalStorage('tabPersistence', savedTabs);
                            localStorageService.addToLocalStorage('lsClientId', {lsClientIdValue: scope.clientId});
                        }
                    }
                } else {
                    localStorageService.addToLocalStorage('lsClientId', {lsClientIdValue: scope.clientId});
                }
                
                console.log(savedTabs);
                // if(savedTabs ){
                //     delete savedTabs.clientTabset;
                //     delete savedTabs.clientADTabset;
                //     localStorageService.addToLocalStorage('tabPersistence', savedTabs);
                // }
            }
            
            scope.client = [];
            scope.identitydocuments = [];
            scope.buttons = [];
            scope.clientdocuments = [];
            scope.staffData = {};
            scope.formData = {};
            scope.openLoan = true;
            scope.openLoanApplications = true;
            scope.openSaving = true;
            scope.openShares = true ;
            scope.updateDefaultSavings = false;
            scope.charges = [];
            scope.showClosedPledges = false;
            scope.id = routeParams.id;
            scope.pledges = [];
            scope.dob = "label.input.dateofbirth";
            scope.addressData = [];
            scope.addressId ;
            var addressConfig = 'enable-clients-address';
            scope.enableClientAddress = scope.isSystemGlobalConfigurationEnabled(addressConfig);
            scope.isBetaEnabled = scope.isSystemGlobalConfigurationEnabled('enable-beta');
            scope.isS3Enabled = scope.isSystemGlobalConfigurationEnabled(scope.globalConstants.AMAZON_S3);
            scope.loancycledetail = [];
            scope.smartCardData = [];
            scope.smartformData = {};
            scope.displayAddButton = true;
            scope.isUpdate = false;
            scope.showNoteField = false;
            scope.showSmartcard = true;
            // scope.clientId = routeParams.id;
            scope.entityType = routeParams.entityType;
            if(!scope.entityType){
                scope.entityType = "client";
            }
            scope.entityId = routeParams.id;
            scope.isCenter=false;
            scope.loanApplicationReferenceId = routeParams.loanApplicationReferenceId;
            scope.pincode = false;
            scope.sections = [];
            scope.displayNameInReverseOrder = false;
            var levelVasedAddressConfig = 'enable_level_based_address';
            scope.activateOnReinitiate = true;
            scope.hideVillage = false;
            scope.isLevelBasedAddressEnabled = scope.isSystemGlobalConfigurationEnabled(levelVasedAddressConfig);
            scope.crnNumber = false;
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.viewClient &&
                scope.response.uiDisplayConfigurations.viewClient.isHiddenField){
                if(scope.response.uiDisplayConfigurations.viewClient.isHiddenField.enableSmartCard){
                    scope.enableSmartCard =  scope.response.uiDisplayConfigurations.viewClient.isHiddenField.enableSmartCard;
                }
                if(scope.response && scope.response.uiDisplayConfigurations.viewClient.isHiddenField.initiateCreditBureau){
                    scope.hideInitiateCreditBureau = scope.response.uiDisplayConfigurations.viewClient.isHiddenField.initiateCreditBureau;
                }
                if(scope.response.uiDisplayConfigurations.viewClient.isHiddenField.pincode){
                    scope.pincode = scope.response.uiDisplayConfigurations.viewClient.isHiddenField.pincode;
                }
                if(scope.response.uiDisplayConfigurations.viewClient.isHiddenField.displayNameInReverseOrder){
                    scope.displayNameInReverseOrder = scope.response.uiDisplayConfigurations.viewClient.isHiddenField.displayNameInReverseOrder;
                }
                if(scope.response.uiDisplayConfigurations.cashFlow.hiddenFields.assetDetails){
                    scope.assetDetails = scope.response.uiDisplayConfigurations.cashFlow.hiddenFields.assetDetails;
                }
                if(scope.response.uiDisplayConfigurations.cashFlow.hiddenFields.houseHoldExpenses){
                    scope.houseHoldExpenses = scope.response.uiDisplayConfigurations.cashFlow.hiddenFields.houseHoldExpenses;
                }
                if(scope.response.uiDisplayConfigurations.viewClient.isHiddenField.referenceNo){
                    scope.refNo = scope.response.uiDisplayConfigurations.viewClient.isHiddenField.referenceNo;
                }
                if(scope.response.uiDisplayConfigurations.viewClient.isHiddenField){
                    scope.showBlackList = !scope.response.uiDisplayConfigurations.viewClient.isHiddenField.blackList;
                }
                if(scope.response.uiDisplayConfigurations.viewClient.isHiddenField){
                    scope.showWhiteList = !scope.response.uiDisplayConfigurations.viewClient.isHiddenField.whiteList;
                }
                if(scope.response.uiDisplayConfigurations.viewClient.isHiddenField){
                    scope.createLoanApplication = scope.response.uiDisplayConfigurations.viewClient.isHiddenField.createLoanApplication;
                }
                if(scope.response.uiDisplayConfigurations.viewClient.isHiddenField.crnNumber){
                    scope.crnNumber = scope.response.uiDisplayConfigurations.viewClient.isHiddenField.crnNumber;
                }
                if(scope.response.uiDisplayConfigurations.viewClient.isHiddenField.makeCall){
                    scope.makeCall =  scope.response.uiDisplayConfigurations.viewClient.isHiddenField.makeCall;
                }
                
            }
            scope.isStalePeriodExceeded = false;
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createNewLoan &&
                scope.response.uiDisplayConfigurations.createNewLoan.isHiddenField && scope.response.uiDisplayConfigurations.createNewLoan.isHiddenField.newLoan) {
                scope.hideNewLoan = scope.response.uiDisplayConfigurations.createNewLoan.isHiddenField.newLoan;
            }
            scope.enableClientVerification = scope.isSystemGlobalConfigurationEnabled('client-verification');
            if(scope.response && scope.response.uiDisplayConfigurations) {
                scope.isSavingAccountEnable = scope.response.uiDisplayConfigurations.viewClient.createSavingAccount;
                scope.activateOnReinitiate = scope.response.uiDisplayConfigurations.viewClient.activateOnReinitiate;
                scope.hideVillage = scope.response.uiDisplayConfigurations.entityType.isHiddenMenu.village;     
            }
            scope.showViewCBHistoryReport = !scope.response.uiDisplayConfigurations.creditBureau.isHiddenField.viewHistoryCBReportButton;
            scope.limitForCBHistory = scope.response.uiDisplayConfigurations.creditBureau.getEnquiryHistoryLimit;
            scope.fetchType = "history";
            scope.showHistoryHeading = false;
               
            scope.routeToLoan = function (id) {
                location.path('/viewloanaccount/' + id);
            };
            scope.routeToLoanApplication = function (loanAppData) {
                location.path('/viewloanapplicationreference/' + loanAppData.loanApplicationReferenceId);
            };
            scope.routeToChargeOverview = function () {
                location.path(scope.pathToChargeOverview());
            };

            scope.pathToChargeOverview =function (){
                return ('/viewclient/'+ scope.client.id + '/chargeoverview');
            }

            scope.routeToCharge = function (chargeId) {
                location.path('/viewclient/'+ scope.client.id + '/charges/' + chargeId);
            };

            scope.routeToSaving = function (id, depositTypeCode) {
                if (depositTypeCode === "depositAccountType.savingsDeposit") {
                    location.path('/viewsavingaccount/' + id);
                } else if (depositTypeCode === "depositAccountType.fixedDeposit") {
                    location.path('/viewfixeddepositaccount/' + id);
                } else if (depositTypeCode === "depositAccountType.recurringDeposit") {
                    location.path('/viewrecurringdepositaccount/' + id);
                }
            };

            scope.initiateCreditBureauEnquiry = function () {
                if (!_.isUndefined(scope.isStalePeriodExceeded) && !scope.isStalePeriodExceeded) {
                    $modal.open({
                        templateUrl: 'confirmCbEnquiry.html',
                        controller: confirmCbEnquiryCtrl
                    });
                }else {
                    location.path('/create/creditbureau/client/' + scope.clientId);
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

            var confirmCbEnquiryCtrl = function ($scope, $modalInstance) {
                $scope.initiateCBEnquiry = function () {
                    $modalInstance.close('initiateCBEnquiry');
                    location.path('/create/creditbureau/client/' + scope.clientId);
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.showViewBtn = false; 
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
                        console.log('Line 335 : ',scope.creditBureauEnquiries);
                        for(var i=0; i<data.length; i++) {
                           if(data[i].status.code == "SUCCESS") {
                                scope.showViewBtn = true;   
                            } 
                        }
                        
                        
                        scope.showCBReport = false;
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
           
            scope.routeToViewCBReport = function (id) {
               location.path('/clients/'+scope.clientId+'/view/creditbureau/'+id+'/summary');
            };

            scope.routeToViewCBReportHistory = function (id) {
                scope.fetchType = "history";
                location.path('/clients/'+scope.clientId+'/view/creditbureau/'+id+'/summary').search({
                        fetchType:scope.fetchType});
            };

            scope.routeToShareAccount = function(id) {
                location.path('/viewshareaccount/'+id)
            };

            scope.haveFile = [];
            var isLoadClientDataTables = false;
            function getClientData(){
                resourceFactory.clientResource.get({clientId: routeParams.id, associations:'hierarchyLookup'}, function (data) {
                    scope.client = data;
                    if(!scope.client.mobileNo){
                        if(scope.response.uiDisplayConfigurations.createClient.defaultMobileNumber){
                            if(scope.response.uiDisplayConfigurations.createClient.defaultMobileNumber.length>0){
                                scope.client.mobileNo=scope.response.uiDisplayConfigurations.createClient.defaultMobileNumber;
                            }                        
                        }
                    }
                    if(scope.client.lastname != undefined){
                        scope.client.displayNameInReverseOrder = scope.client.lastname.concat(" ");
                    }
                    if(scope.client.middlename != undefined && scope.client.displayNameInReverseOrder != undefined){
                        scope.client.displayNameInReverseOrder = scope.client.displayNameInReverseOrder.concat(scope.client.middlename).concat(" ");
                    }
                    if(scope.client.firstname != undefined && scope.client.displayNameInReverseOrder != undefined){
                        scope.client.displayNameInReverseOrder = scope.client.displayNameInReverseOrder.concat(scope.client.firstname);
                    }
                    $rootScope.clientname=data.displayName;
                    scope.isClosedClient = scope.client.status.value == 'Closed';
                    scope.isActiveClient = scope.client.status.value == 'Active';
                    scope.staffData.staffId = data.staffId;
                    if(scope.client.dateOfBirth != undefined && scope.client.dateOfBirth != null){
                        calculateClientAge(scope.client.dateOfBirth);
                    }
    
                    if(data.groups.length > 0 && data.groups[0].groupLevel==1){
                        scope.isCenter=true;
                    }
                    if(data.groups.length > 0 && data.groups.length ==1 && data.groups[0].groupLevel==2) {
                        scope.group = data.groups[0];
                    }
                    if(data.groups.length > 0 && data.groups.length ==1 && data.groups[0].groupLevel==1) {
                        scope.center = data.groups[0];
                    }
    
                    if(isLoadClientDataTables){
                        scope.getClientDatatables();
                    }

                    scope.getClientActiveLoanApplications();
    
                    var clientStatus = new mifosX.models.ClientStatus();
    
                    if (clientStatus.statusKnown(data.status.value)) {
                        scope.buttons = clientStatus.getStatus(data.status.value);
                        scope.savingsActionbuttons = [
                            {
                                name: "button.deposit",
                                type: "100",
                                icon: "icon-arrow-right",
                                taskPermissionName: "DEPOSIT_SAVINGSACCOUNT"
                            },
                            {
                                name: "button.withdraw",
                                type: "100",
                                icon: "icon-arrow-left",
                                taskPermissionName: "WITHDRAW_SAVINGSACCOUNT"
                            },
                            {
                                name: "button.deposit",
                                type: "300",
                                icon: "icon-arrow-right",
                                taskPermissionName: "DEPOSIT_RECURRINGDEPOSITACCOUNT"
                            },
                            {
                                name: "button.withdraw",
                                type: "300",
                                icon: "icon-arrow-left",
                                taskPermissionName: "WITHDRAW_RECURRINGDEPOSITACCOUNT"
                            }
                        ];
                    }
                    if(data.status.value == "Active"){
                        if(!scope.response.uiDisplayConfigurations.shares.hidesharesmodule)
                        {   scope.buttons.push({
                                name: "label.button.newshareaccount",
                                href: "#/createshareaccount",
                                icon: "icon-plus",
                                taskPermissionName: "CREATE_SHAREACCOUNT"
                            });
                        }   
                    }
                    if (data.status.value == "Pending" || data.status.value == "Active") {
                        if (data.staffId) {
    
                        }else {
                            scope.buttons.push(clientStatus.getStatus("Assign Staff"));
                        }
                        if (!scope.client.isWorkflowEnabled) {
                            var editOption = {
                                name: "label.button.edit",
                                href: "#/editclient",
                                icon: "icon-edit",
                                taskPermissionName: "UPDATE_CLIENT"
                            };
                            scope.buttons.splice(1, 0, editOption);
                            if (data.status.value == "Pending") {
                                var activateOption = {
                                    name: "label.button.activate",
                                    href: "#/client",
                                    subhref: "activate",
                                    icon: "icon-ok-sign",
                                    taskPermissionName: "ACTIVATE_CLIENT"
                                };
                                scope.buttons.splice(1, 0, activateOption);
                            }
                        }
                    }
                    if (data.status.value == "Closed" && !scope.activateOnReinitiate) {
                        var activateOption = {
                            name: "label.button.activate",
                            icon: "icon-ok-sign",
                            taskPermissionName: "ACTIVATE_CLIENT"
                        };
                        if (scope.client && scope.client.isGroupOrCenterCountReached) {
                            activateOption.href = "#/transferwhileactivation";
                        } else {
                            activateOption.href = "#/client";
                            activateOption.subhref = "activate";
                        }
                        scope.buttons.splice(0, 1, activateOption);
                    }
                    if(!scope.showBlackList){
                        scope.buttons.splice(8,1);
                    }
                    
                    if(scope.showWhiteList && data.status.value == "Active" && data.subStatus && data.subStatus.value == "Blacklist"){
                        var whitelistButton = {
                            name: "label.button.whitelist",
                            href: "#/client",
                            subhref: "whitelist",
                            icon: "icon-ok-sign ng-scope",
                            taskPermissionName: "WHITELIST_CLIENT"
                        };
                        scope.buttons.splice(8, 1, whitelistButton);
                    }
    
                    scope.buttonsArray = {
                        options: [
                            {
                                name: "button.clientscreenreports"
                            }
                        ]
                    };
    
                    scope.buttonsArray.singlebuttons = scope.buttons;
    
                    scope.isLoanApplication = scope.isSystemGlobalConfigurationEnabled('loan-application');
                    for(var i in scope.buttonsArray.singlebuttons){
                        if(scope.buttonsArray.singlebuttons[i].taskPermissionName === 'CREATE_LOANAPPLICATIONREFERENCE' && scope.isLoanApplication && !scope.createLoanApplication){
                            scope.buttonsArray.singlebuttons[i].isEnableButton = scope.isLoanApplication;                     
                        }
                        if(scope.buttonsArray.singlebuttons[i].taskPermissionName === 'CREATE_SAVINGSACCOUNT'){
                            scope.buttonsArray.singlebuttons[i].isEnableButton = scope.isSavingAccountEnable;
                        }
                    };

                    for (var i in scope.buttonsArray.singlebuttons) {
                        if (scope.hideNewLoan && scope.buttonsArray.singlebuttons[i].name == 'label.button.newloan') {
                            scope.buttonsArray.singlebuttons.splice(i,1);
                            break;
                        }
                    };
                });
            }
            getClientData();
            scope.navigateToSavingsOrDepositAccount = function (eventName, accountId, savingProductType) {
                switch (eventName) {
                    case "deposit":
                        if (savingProductType == 100)
                            location.path('/savingaccount/' + accountId + '/deposit');
                        if (savingProductType == 300)
                            location.path('/recurringdepositaccount/' + accountId + '/deposit');
                        break;
                    case "withdraw":
                        if (savingProductType == 100)
                            location.path('/savingaccount/' + accountId + '/withdrawal');
                        if (savingProductType == 300)
                            location.path('/recurringdepositaccount/' + accountId + '/withdrawal');
                        break;
                }
            };
            
            scope.clientActiveLoanApplicationsLoaded = false;
            scope.getClientActiveLoanApplications = function (){
                var status = 'active';
                scope.loanApplications = [];
                if(!scope.clientActiveLoanApplicationsLoaded){
                    scope.clientActiveLoanApplicationsLoaded = true;
                    getLoanApplications(status);
                    getClientImageAndSignature();
                }else{
                    angular.copy(scope.activeLoanApplications,scope.loanApplications);
                }
            };

            function getLoanApplications (status){
                resourceFactory.loanApplicationOverViewsResource.getByClientId({clientId: routeParams.id, status:status}, function (data) {
                    if(status == 'active'){
                        scope.activeLoanApplications = data;
                        angular.copy(scope.activeLoanApplications,scope.loanApplications);
                        if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createLoanApplication.newLoanApplicationLimitAllowed) {
                            if(scope.activeLoanApplications.length > 0){
                                for(var j=0 ;j<scope.activeLoanApplications.length; j++){
                                    if (!(scope.activeLoanApplications[j].status.id >= 400)) {
                                        for(var i in scope.buttonsArray.singlebuttons){
                                            if(scope.buttonsArray.singlebuttons[i].taskPermissionName === 'CREATE_LOANAPPLICATIONREFERENCE'){
                                                scope.buttonsArray.singlebuttons[i].isEnableButton = false;
                                                break;
                                            }
                                        }
                                        break;
                                    } 
                                }
                            }
                        }
                    }else if(status == 'rejected'){
                        scope.rejectedLoanApplications = data;
                        angular.copy(scope.rejectedLoanApplications,scope.loanApplications);
                    }
                });
            };

            scope.clientRejectedLoanApplicationsLoaded = false;
            scope.getClientRejectedLoanApplications = function (){
                var status = 'rejected';
                scope.loanApplications = [];
                if(!scope.clientRejectedLoanApplicationsLoaded){
                    scope.clientRejectedLoanApplicationsLoaded = true;
                    getLoanApplications(status);
                }else{
                    angular.copy(scope.rejectedLoanApplications,scope.loanApplications);
                }
            };

            scope.setLoanApplications = function () {
                if (scope.openLoanApplications) {
                    scope.openLoanApplications = false;
                    scope.getClientRejectedLoanApplications();
                } else {
                    scope.openLoanApplications = true;
                    scope.getClientActiveLoanApplications();
                }
            };

            scope.clientAccountsLoaded = false;
            scope.getAllClientAccounts = function () {
                if (!scope.clientAccountsLoaded) {
                    scope.clientAccountsLoaded = true;
                    resourceFactory.clientAccountsOverviewResource.get({ clientId: routeParams.id }, function (data) {
                        scope.clientAccounts = data;
                        scope.pledges = scope.clientAccounts.pledges;
                        if (data.savingsAccounts) {
                            for (var i in data.savingsAccounts) {
                                if (data.savingsAccounts[i].status.value == "Active") {
                                    scope.updateDefaultSavings = true;
                                    break;
                                }
                            }
                        }
                    });
                }
            };

            function getClientImageAndSignature (){
                getClientClientSummary ();
                if (scope.client.imagePresent) {
                    var params = '';
                    if(scope.isS3Enabled){
                        params = '?maxHeight=150&downloadableUrl=true';
                    }
                    http({
                        method: 'GET',
                        url: $rootScope.hostUrl + API_VERSION + '/client/' + routeParams.id + '/images' + params
                    }).then(function (imageData) {
                        scope.imageData = imageData.data[0];
                        if(scope.imageData.storageType == 1 || !scope.isS3Enabled){
                            http({
                                method: 'GET',
                                url: $rootScope.hostUrl + API_VERSION + '/client/' + routeParams.id + '/images/'+scope.imageData.imageId+'?maxHeight=150'
                            }).then(function (imageData) {
                                scope.image = imageData.data;
                            });
                        }else{
                            scope.image = scope.imageData.downloadableUrl;
                        }
                    });
                }

                http({
                    method: 'GET',
                    url: $rootScope.hostUrl + API_VERSION + '/clients/' + routeParams.id + '/documents'
                }).then(function (docsData) {
                    var docId = -1;
                    for (var i = 0; i < docsData.data.length; ++i) {
                        if (docsData.data[i].name == 'clientSignature') {
                            docId = docsData.data[i].id;
                            scope.signature_url = $rootScope.hostUrl + API_VERSION + '/clients/' + routeParams.id + '/documents/' + docId + '/attachment';
                        }
                    }
                });
            };

            function getClientClientSummary (){
                resourceFactory.runReportsResource.get({reportSource: 'ClientSummary', genericResultSet: 'false', R_clientId: routeParams.id}, function (data) {
                    scope.client.ClientSummary = data[0];
                    scope.loancycledetail = data;
                });
            };

            scope.clientDatatablesLoaded = false;
            scope.getClientDatatables = function (){
                if(!scope.clientDatatablesLoaded){
                    if(!_.isUndefined(scope.client.id)){
                        isLoadClientDataTables = true;
                        scope.clientDatatablesLoaded = true;
                        var associatedEntityLegalId = scope.client.legalForm != undefined ? scope.client.legalForm.id : null;
                        var associatedEntityClientTypeId = scope.client.clientType.id != undefined ? scope.client.clientType.id : null;
                        var associatedEntityClassificationId = scope.client.clientClassification.id != undefined ? scope.client.clientClassification.id : null;
                        var dataTableParams = {apptable: 'm_client', associatedEntityLegalId: associatedEntityLegalId,associatedEntityClientTypeId:associatedEntityClientTypeId,associatedEntityClassificationId:associatedEntityClassificationId, isFetchBasicData : false};
                        resourceFactory.DataTablesResource.getAllDataTables(dataTableParams, function (data) {
                            scope.datatables = data;
                        });
                    }else{
                        isLoadClientDataTables = true;
                        getClientData();
                    }
                }
            };

            scope.clientChargesLoaded = false;
            scope.getClientCharges = function(){
                if(!scope.clientChargesLoaded){
                    scope.clientChargesLoaded = true;
                    resourceFactory.clientChargesResource.getCharges({clientId: routeParams.id, pendingPayment:true, chargeStatus:"active"}, function (data) {
                        scope.charges = data.pageItems;
                    });
                }
            };

            function calculateClientAge(dateOfBirth){
                dateOfBirth = new Date(dateFilter(dateOfBirth, scope.df));
                var ageDifMs = Date.now() - dateOfBirth.getTime();
                var ageDifMs = Date.now() - dateOfBirth.getTime();
                var ageDate = new Date(ageDifMs); // miliseconds from epoch
                scope.displayAge = true;
                scope.age = Math.abs(ageDate.getUTCFullYear() - 1970);
            }

            scope.uploadPic = function () {
                $modal.open({
                    templateUrl: 'uploadpic.html',
                    controller: UploadPicCtrl
                });
            };
            var UploadPicCtrl = function ($scope, $modalInstance) {
                $scope.onFileSelect = function ($files) {
                    scope.file = $files[0];
                };
                $scope.upload = function () {
                    if (scope.file) {
                        $upload.upload({
                            url: $rootScope.hostUrl + API_VERSION + '/client/' + routeParams.id + '/images',
                            data: {},
                            file: scope.file
                        }).then(function (imageData) {
                            // to fix IE not refreshing the model
                            if (!scope.$$phase) {
                                scope.$apply();
                            }
                            $modalInstance.close('upload');
                            route.reload();
                        });
                    }
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            scope.capturePic = function () {
                $modal.open({
                    templateUrl: 'capturepic.html',
                    controller: CapturePicCtrl,
                    windowClass: 'modalwidth700'
                });
            };
            var CapturePicCtrl = function ($scope, $modalInstance) {

                $scope.video = null;
                $scope.picture = null;
                $scope.error = null;
                $scope.channel={};
                
                $scope.onVideoSuccess = function () {
                    $scope.video = $scope.channel.video;
                    $scope.error = null;
                };

                $scope.onVideoError = function (err) {
                    if(typeof err != "undefined")
                        $scope.error = err.message + '(' + err.name + ')';
                };

                $scope.takeScreenshot = function () {
                    var picCanvas = document.createElement('canvas');
                    var width = $scope.video.width;
                    var height = $scope.video.height;

                    picCanvas.width = width;
                    picCanvas.height = height;
                    var ctx = picCanvas.getContext("2d");
                    ctx.drawImage($scope.video, 0, 0, width, height);
                    var imageData = ctx.getImageData(0, 0, width, height);
                    document.querySelector('#clientSnapshot').getContext("2d").putImageData(imageData, 0, 0);
                    $scope.picture = picCanvas.toDataURL();
                };

                $scope.uploadscreenshot = function () {
                    if($scope.picture != null) {
                        http({
                            method: 'POST',
                            url: $rootScope.hostUrl + API_VERSION + '/client/' + routeParams.id + '/images',
                            data: $scope.picture
                        }).then(function (imageData) {
                            if (!scope.$$phase) {
                                scope.$apply();
                            }
                            $modalInstance.close('upload');
                            $scope.closeWebCam();
                            route.reload();
                        });
                    }
                };

                $scope.cancel = function () {
                    $scope.closeWebCam();
                    $modalInstance.dismiss('cancel');
                };

                $scope.closeWebCam = function(){
                    var mediaStream = window.MediaStream;

                    if (typeof mediaStream === 'undefined' && typeof webkitMediaStream !== 'undefined') {
                        mediaStream = webkitMediaStream;
                    }

                    /*global MediaStream:true */
                    if (typeof mediaStream !== 'undefined' && !('stop' in MediaStream.prototype)) {
                        mediaStream.prototype.stop = function() {
                            this.getAudioTracks().forEach(function(track) {
                                track.stop();
                            });

                            this.getVideoTracks().forEach(function(track) {
                                track.stop();
                            });
                        };
                    }
                };

                $scope.reset = function () {
                    $scope.picture = null;
                }
            };
            scope.deletePic = function () {
                $modal.open({
                    templateUrl: 'deletePic.html',
                    controller: DeletePicCtrl
                });
            };
            var DeletePicCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    http({
                        method: 'DELETE',
                        url: $rootScope.hostUrl + API_VERSION + '/client/' + routeParams.id + '/images'
                    }).then(function (imageData) {
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                        $modalInstance.close('delete');
                        route.reload();
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.outboundCallData = {"origin": "client","referenceId": null}
            scope.call = function(){
                resourceFactory.outboundCallResource.save({clientId : routeParams.id},scope.outboundCallData, function(data) {
                    $scope.close();
                });
            }; 

            scope.uploadSig = function () {
                $modal.open({
                    templateUrl: 'uploadsig.html',
                    controller: UploadSigCtrl
                });
            };
            var UploadSigCtrl = function ($scope, $modalInstance) {
                $scope.onFileSelect = function ($files) {
                    scope.file = $files[0];
                };
                $scope.formatErr = false;
                $scope.upload = function () {
                    if (scope.file) {
                        if (scope.file.type != "application/pdf" && !scope.file.type.includes("image")) {
                            $scope.formatErr = true;
                            $scope.signformatErrMsg = "label.error.files.can.be.image.or.of.type.pdf";
                        } else {
                            $upload.upload({
                                url: $rootScope.hostUrl + API_VERSION + '/clients/' + routeParams.id + '/documents',
                                data: {
                                    name: 'clientSignature',
                                    description: 'client signature'
                                },
                                file: scope.file
                            }).then(function (imageData) {
                                // to fix IE not refreshing the model
                                if (!scope.$$phase) {
                                    scope.$apply();
                                }
                                $modalInstance.close('upload');
                                route.reload();
                            });
                        }
                    }
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.unassignStaffCenter = function () {
                $modal.open({
                    templateUrl: 'clientunassignstaff.html',
                    controller: ClientUnassignCtrl
                });
            };
            var DeleteAllDataFromDatatable = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    resourceFactory.DataTablesResource.delete({datatablename: scope.apptableNameForDeleteAll, entityId: scope.entityIdforDeleteAll, genericResultSet: 'true'}, {}, function (data) {
                        $modalInstance.close('delete');
                        route.reload();
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            var ClientUnassignCtrl = function ($scope, $modalInstance) {
                $scope.unassign = function () {
                    resourceFactory.clientResource.save({clientId: routeParams.id, command: 'unassignstaff'}, scope.staffData, function (data) {
                        $modalInstance.close('unassign');
                        route.reload();
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.isClosed = function (loanaccount) {
                if (loanaccount.status.code === "loanStatusType.closed.written.off" ||
                    loanaccount.status.code === "loanStatusType.closed.obligations.met" ||
                    loanaccount.status.code === "loanStatusType.closed.reschedule.outstanding.amount" ||
                    loanaccount.status.code === "loanStatusType.withdrawn.by.client" ||
                    loanaccount.status.code === "loanStatusType.rejected") {
                    return true;
                } else {
                    return false;
                }
            };
            scope.isSavingClosed = function (savingaccount) {
                if (savingaccount.status.code === "savingsAccountStatusType.withdrawn.by.applicant" ||
                    savingaccount.status.code === "savingsAccountStatusType.closed" ||
                    savingaccount.status.code === "savingsAccountStatusType.pre.mature.closure" ||
                    savingaccount.status.code === "savingsAccountStatusType.rejected") {
                    return true;
                } else {
                    return false;
                }
            };

            scope.isShareClosed = function (shareAccount) {
                if ( shareAccount.status.code === "shareAccountStatusType.closed" ||
                    shareAccount.status.code === "shareAccountStatusType.rejected") {
                    return true;
                } else {
                    return false;
                }
            };
            scope.setLoan = function () {
                if (scope.openLoan) {
                    scope.openLoan = false
                } else {
                    scope.openLoan = true;
                }
            };
            scope.setSaving = function () {
                if (scope.openSaving) {
                    scope.openSaving = false;
                } else {
                    scope.openSaving = true;
                }
            };

            scope.isGetAllClientsNotes = false;
            scope.getAllClientsNotes = function () {
                if(!scope.isGetAllClientsNotes){
                    resourceFactory.clientNotesResource.getAllNotes({clientId: routeParams.id}, function (data) {
                        scope.clientNotes = data;
                        scope.isGetAllClientsNotes = true;
                    });
                }
            }

            scope.setShares = function () {
                if (scope.openShares) {
                    scope.openShares = false;
                } else {
                    scope.openShares = true;
                }
            };



            scope.entityAddressLoaded = false;
            scope.fetchEntityAddress = function () {
                if(!scope.entityAddressLoaded) {
                    scope.entityType = "clients";
                    resourceFactory.addressDataResource.getAll({
                        entityType: scope.entityType,
                        entityId: routeParams.id
                    }, function (response) {
                        if (response != null) {
                            scope.addressData = response;
                        }
                    });
                    scope.entityAddressLoaded = true;
                }
            }
            scope.deleteAddress = function (addressId) {
                scope.addressId = addressId;
                $modal.open({
                    templateUrl: 'deleteaddress.html',
                    controller: AddressDeleteCtrl
                });
            };

            var AddressDeleteCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    resourceFactory.entityAddressResource.delete({entityType: scope.entityType, entityId: routeParams.id, addressId: scope.addressId}, function (response) {
                        $modalInstance.close('delete');
                        if(response != null) {
                            route.reload();
                        }
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            scope.smartCardDataLoaded = false;
            scope.fetchSmartCardData = function() {
                if(!scope.smartCardDataLoaded) {
                    scope.entityType = "clients";
                    resourceFactory.smartCardDataResource.getAll({
                        entityId: routeParams.id,
                        entityType: scope.entityType
                    }, function (response) {
                        if (response != null) {
                            scope.smartCardData = response;
                        }
                    });
                    scope.smartCardDataLoaded = true;
                }
            }

            scope.inactivate = function (smartCard) {
                scope.smartCard = smartCard;
                scope.showNoteField = true;
                scope.showSmartcard = false;
            };

            scope.submit = function () {
                scope.entityType = "clients";
                scope.smartformData.locale = scope.optlang.code;
                scope.smartformData.dateFormat = scope.df;
                scope.smartformData.cardNumber = scope.smartCard.cardNumber;
                resourceFactory.smartCardDataResource.update({entityId: routeParams.id, entityType: scope.entityType, command: 'inactivate' },scope.smartformData, function (response) {
                    if(response != null) {
                        route.reload();
                    }
                });
            };
            scope.cancel = function () {
                route.reload();
            };
            scope.clientIdentityDocumentsLoaded = false;
            scope.getClientIdentityDocuments = function () {
                if(!scope.clientIdentityDocumentsLoaded) {
                    resourceFactory.clientResource.getAllClientDocuments({
                        clientId: routeParams.id,
                        anotherresource: 'identifiers'
                    }, function (data) {
                        scope.identitydocuments = data;
                        for (var i = 0; i < scope.identitydocuments.length; i++) {
                            resourceFactory.clientIdentifierResource.get({clientIdentityId: scope.identitydocuments[i].id}, function (data) {
                                for (var j = 0; j < scope.identitydocuments.length; j++) {
                                    if (data.length > 0 && scope.identitydocuments[j].id == data[0].parentEntityId) {
                                        for (var l in data) {

                                            var loandocs = {};
                                            loandocs = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment';
                                            data[l].docUrl = loandocs;
                                        }
                                        scope.identitydocuments[j].documents = data;
                                    }
                                }
                            });
                        }
                    });
                    scope.clientIdentityDocumentsLoaded = true;
                }
            };

            scope.verify = function(){
                location.path('/clientverificationdetails/'+scope.client.id);
            };

            scope.dataTableChange = function (clientdatatable) {
                resourceFactory.DataTablesResource.getTableDetails({datatablename: clientdatatable.registeredTableName,
                    entityId: routeParams.id, genericResultSet: 'true'}, function (data) {
                    scope.datatabledetails = data;
                    scope.datatabledetails.isData = data.data.length > 0 ? true : false;
                    scope.datatabledetails.isColumnData = data.columnData.length > 0 ? true : false;
                    scope.datatabledetails.isMultirow = data.columnHeaders[0].columnName == "id" ? true : false;
                    if (scope.datatabledetails.isMultirow == false) {
                        var indexI = data.columnHeaders.findIndex(x => x.columnName === 'client_id');
                        if (indexI > -1) {
                            data.columnHeaders.splice(indexI, 1);
                        }
                    } else if (scope.datatabledetails.isMultirow == true) {
                        for (var m in data.columnData) {
                            var indexJ = data.columnData[m].row.findIndex(x => x.columnName === 'client_id');
                            if (indexJ > -1) {
                                data.columnData[m].row.splice(indexJ, 1);
                            }
                        }
                    }
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
                                
                            }
                        }
                        for(var m in data.columnData){
                            for(var n in data.columnData[m].row){
                                if(data.columnData[m].row[n].columnName == scope.datatabledetails.columnHeaders[i].columnName){
                                    if(scope.datatabledetails.columnHeaders[i].columnDisplayType== 'MULTISELECTCODELOOKUP'||scope.datatabledetails.columnHeaders[i].columnDisplayType== 'CODELOOKUP'){
                                        var multiSelectValuesAsString = data.columnData[m].row[n].value;
                                        var multiSelectValuesAsArray = JSON.parse("[" + multiSelectValuesAsString + "]");
                                        var displayArray = [];
                                        for(var x in multiSelectValuesAsArray){
                                            
                                            for(var y in scope.datatabledetails.columnHeaders[i].columnValues){
                                                if(multiSelectValuesAsArray[x]==scope.datatabledetails.columnHeaders[i].columnValues[y].id){
                                                    displayArray.push(scope.datatabledetails.columnHeaders[i].columnValues[y].value);
                                                }
                                            }
                                        }
                                        data.columnData[m].row[n].value = displayArray.toString();
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
                                row.columnDisplayType = data.columnHeaders[i].columnDisplayType;
                                for(var j in data.columnData[0].row){
                                    if(data.columnHeaders[i].columnName == data.columnData[0].row[j].columnName){
                                       row.value = data.columnData[0].row[j].value;
                                       break;
                                    }
                                }
                                scope.singleRow.push(row);
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

            scope.viewstandinginstruction = function () {
                location.path('/liststandinginstructions/' + scope.client.officeId + '/' + scope.client.id);
            };
            scope.createstandinginstruction = function () {
                location.path('/createstandinginstruction/' + scope.client.officeId + '/' + scope.client.id + '/fromsavings');
            };

            scope.addDataTableEntry =  function(datatable, client){
                $rootScope.isClientAdditionalDetailTabActive = true;
                ///makedatatableentry/{{datatable.registeredTableName}}/{{client.id}}?fromEntity=client
                location.path('/makedatatableentry/'+datatable.registeredTableName+'/'+client.id).search({"fromEntity":"client"});
            };

            scope.editDataTableEntry =  function(datatable, client){
                $rootScope.isClientAdditionalDetailTabActive = true;
                ///viewsingledatatableentry/{{datatable.registeredTableName}}/{{client.id}}?mode=edit&&fromEntity=client
                location.path('/viewsingledatatableentry/'+datatable.registeredTableName+'/'+client.id).search({"mode":"edit","fromEntity":"client"});
            };

            scope.deleteAllDataTableEntry = function (apptableName, entityId) {
                $rootScope.isClientAdditionalDetailTabActive = true;
                scope.apptableNameForDeleteAll = apptableName;
                scope.entityIdforDeleteAll = entityId;
                $modal.open({
                    templateUrl: 'deletealldatafromdatatable.html',
                    controller: DeleteAllDataFromDatatable
                });
            };

            scope.clientDocumentsLoaded = false;
            scope.getClientDocuments = function () {
                if(!scope.clientDocumentsLoaded) {
                    resourceFactory.clientDocumentsResource.getAllClientDocuments({clientId: routeParams.id}, function (data) {
                        scope.clientdocuments = {};
                        for (var l = 0; l < data.length; l++) {
                            if (data[l].id) {
                                var loandocs = {};
                                loandocs = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment';
                                data[l].docUrl = loandocs;
                            }
                            if(data[l].tagValue){
                                scope.pushDocumentToTag(data[l], data[l].tagValue);
                            } else {
                                scope.pushDocumentToTag(data[l], 'uploadedDocuments');
                            }
                        }
                    });
                    scope.clientDocumentsLoaded = true;
                }
            };

            scope.pushDocumentToTag = function(document, tagValue){
                if (scope.clientdocuments.hasOwnProperty(tagValue)) {
                    scope.clientdocuments[tagValue].push(document);
                } else {
                    scope.clientdocuments[tagValue] = [];
                    scope.clientdocuments[tagValue].push(document);
                }
            };

            scope.deleteDocument = function (doc) {
                $modal.open({
                    templateUrl: 'deleteClientDocument.html',
                    controller: ClientDocumentDeleteCtrl,
                    resolve: {
                        document: function () {
                            return doc;
                        }
                    }
                });
            };

            var ClientDocumentDeleteCtrl = function ($scope, $modalInstance, document) {
                $scope.delete = function () {
                    resourceFactory.clientDocumentsResource.delete({ clientId: routeParams.id, documentId: document.id }, '', function (data) {
                        if (document.reportIdentifier) {
                            delete document.id;
                        }
                        else {
                            $modalInstance.close('delete');
                            route.reload();
                        }
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.generateDocument = function (document){
                resourceFactory.documentsGenerateResource.generate({entityType:'clients', entityId: routeParams.id, identifier: document.reportIdentifier}, function(data){
                    document.id = data.resourceId;
                    var loandocs = {};
                    loandocs = API_VERSION + '/' + document.parentEntityType + '/' + document.parentEntityId + '/documents/' + document.id + '/attachment';
                    document.docUrl = loandocs;
                })
            };

            scope.reGenerateDocument = function (document){
                resourceFactory.documentsGenerateResource.reGenerate({entityType:'clients', entityId: routeParams.id, identifier: document.id}, function(data){
                    document.id = data.resourceId;
                    var loandocs = {};
                    loandocs = API_VERSION + '/' + document.parentEntityType + '/' + document.parentEntityId + '/documents/' + document.id + '/attachment';
                    document.docUrl = loandocs;
                })
            };
            
            scope.viewDataTable = function (registeredTableName, data) {
                if (scope.datatabledetails.isMultirow) {
                    location.path("/viewdatatableentry/" + registeredTableName + "/" + scope.client.id + "/" + data.row[0].value);
                } else {
                    location.path("/viewsingledatatableentry/" + registeredTableName + "/" + scope.client.id);
                }
            };

            scope.downloadDocument = function (documentId) {
                resourceFactory.clientDocumentsResource.get({clientId: routeParams.id, documentId: documentId}, '', function (data) {
                    scope.clientdocuments.splice(index, 1);
                });
            };

            scope.isLoanNotClosed = function (loanaccount) {
                if (loanaccount.status.code === "loanStatusType.closed.written.off" ||
                    loanaccount.status.code === "loanStatusType.closed.obligations.met" ||
                    loanaccount.status.code === "loanStatusType.closed.reschedule.outstanding.amount" ||
                    loanaccount.status.code === "loanStatusType.withdrawn.by.client" ||
                    loanaccount.status.code === "loanStatusType.rejected") {
                    return false;
                } else {
                    return true;
                }
            };

            scope.loanAppStatusId = 400;
            scope.isLoanAppIncompleted = function (loanAddData) {
                if (loanAddData.status.id < scope.loanAppStatusId || loanAddData.status.id == 500) {
                    return true;
                }  
                return false;
            };

            scope.isSavingNotClosed = function (savingaccount) {
                if (savingaccount.status.code === "savingsAccountStatusType.withdrawn.by.applicant" ||
                    savingaccount.status.code === "savingsAccountStatusType.closed" ||
                    savingaccount.status.code === "savingsAccountStatusType.pre.mature.closure" ||
                    savingaccount.status.code === "savingsAccountStatusType.rejected") {
                    return false;
                }
                return true;
            };

            scope.isShareNotClosed = function (shareAccount) {
                if ( shareAccount.status.code === "shareAccountStatusType.closed" ||
                    shareAccount.status.code === "shareAccountStatusType.rejected") {
                    return false;
                } else {
                    return true;
                }
            };
            scope.saveNote = function () {
                resourceFactory.clientResource.save({clientId: routeParams.id, anotherresource: 'notes'}, this.formData, function (data) {
                    var today = new Date();
                    var loggedInUserName = scope.currentSession.user.name;
                    temp = { id: data.resourceId, note: scope.formData.note, createdByUsername: loggedInUserName, createdOn: today };
                    scope.clientNotes.push(temp);
                    scope.formData.note = "";
                    scope.predicate = '-id';
                });
            }



            scope.deleteClientIdentifierDocument = function (id) {
                $modal.open({
                    templateUrl: 'deleteClientIdentifierDocument.html',
                    controller: ClientIdentifierDeleteCtrl,
                    resolve: {
                        entityId: function () {
                            return id;
                        }
                    }  
                });
            };   
 
            var ClientIdentifierDeleteCtrl = function ($scope, $modalInstance, entityId) {
                $scope.delete = function () {
                    resourceFactory.clientIdenfierResource.delete({ clientId: scope.clientId, id: entityId }, {}, function (data) {
                        if (scope.enableClientVerification) {
                            resourceFactory.clientResource.get({ clientId: scope.formData.clientId, isFetchAdressDetails: true }, function (clientData) {
                                scope.client.isVerified = clientData.isVerified;
                            });
                        }
                        $modalInstance.close('delete');
                        route.reload();
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            var DeleteClientIdentifierCtrl = function ($scope, $modalInstance, deleteIdentifierdata) {
                $scope.confirm = function () {
                    resourceFactory.clientIdenfierResource.delete({clientId: deleteIdentifierdata.clientId, id: deleteIdentifierdata.entityId}, '', function (data) {
                        if(scope.enableClientVerification){
                               resourceFactory.clientResource.get({clientId: deleteIdentifierdata.clientId, isFetchAdressDetails : true}, function (clientData) {
                                scope.client.isVerified = clientData.isVerified; 
                              }); 
                        }
                        scope.identitydocuments.splice(deleteIdentifierdata.index, 1);
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.downloadClientIdentifierDocument = function (identifierId, documentId) {
                console.log(identifierId, documentId);
            };

            scope.waiveCharge = function(chargeId){
                resourceFactory.clientChargesResource.waive({clientId: routeParams.id, resourceType:chargeId}, function (data) {
                    route.reload();
                });
            }

            scope.showSignature = function()
            {
                $modal.open({
                    templateUrl: 'clientSignature.html',
                    controller: ViewLargerClientSignature,
                    size: "lg"
                });
             };

            scope.showWithoutSignature = function()
            {
                $modal.open({
                    templateUrl: 'clientWithoutSignature.html',
                    controller: ViewClientWithoutSignature,
                    size: "lg"
                });
            };

            scope.showPicture = function () {
                $modal.open({
                    templateUrl: 'photo-dialog.html',
                    controller: ViewLargerPicCtrl,
                    size: "lg"
                });
            };

            var ViewClientWithoutSignature = function($scope,$modalInstance){
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            var ViewLargerClientSignature = function($scope,$modalInstance){
                    var loadSignature = function(){
                     http({
                        method: 'GET',
                        url: $rootScope.hostUrl + API_VERSION + '/clients/' + routeParams.id + '/documents'
                     }).then(function (docsData) {
                        var docId = -1;
                        for (var i = 0; i < docsData.data.length; ++i) {
                            if (docsData.data[i].name == 'clientSignature') {
                                docId = docsData.data[i].id;
                                scope.signature_url = $rootScope.hostUrl + API_VERSION + '/clients/' + routeParams.id + '/documents/' + docId + '/download';
                            }
                        }
                    if (scope.signature_url != null) {
                        http({
                            method: 'GET',
                                url: $rootScope.hostUrl + API_VERSION + '/clients/' + routeParams.id + '/documents/' + docId + '/download'
                    }).then(function (docsData) {
                            $scope.largeImage = docsData.data;
                        });
                    }
                    });
                };
                loadSignature();
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
             };

            var ViewLargerPicCtrl = function ($scope, $modalInstance) {
                var loadImage = function () {
                    if (scope.client.imagePresent) {
                        var params = '';
                        if(scope.isS3Enabled){
                            params = '?maxHeight=860&downloadableUrl=true';
                        }
                        http({
                            method: 'GET',
                            url: $rootScope.hostUrl + API_VERSION + '/client/' + routeParams.id + '/images'+params
                        }).then(function (imageData) {
                            $scope.Image = imageData.data[0];
                            if($scope.Image.storageType == 1 || !scope.isS3Enabled){
                                http({
                                method: 'GET',
                                url: $rootScope.hostUrl + API_VERSION + '/client/' + routeParams.id + '/images/'+$scope.Image.imageId+'?maxHeight=860'
                                }).then(function (imageData) {
                                    $scope.largeImage = imageData.data;
                                });
                            }else{
                                 $scope.largeImage = scope.imageData.downloadableUrl;
                            }
                        });
                        
                    }
                };
                loadImage();
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }

            scope.deletePledge = function(id){
                resourceFactory.pledgeResource.delete({pledgeId: id}, function (data) {
                    resourceFactory.clientAccountsBasicDetailsResource.get({clientId: routeParams.id}, function (data) {
                        scope.pledges = data.pledges;
                    });
                });

            };

            scope.requestApprovalLoanAppRef = function (loanApplicationReferenceId) {
                resourceFactory.loanApplicationReferencesResource.update({
                    loanApplicationReferenceId: loanApplicationReferenceId,
                    command: 'requestforapproval'
                }, {}, function (data) {
                    location.path('/viewloanapplicationreference/' + loanApplicationReferenceId);
                });
            };

            scope.familyDetailsLoaded = false;
            scope.familyDetails = function(){
                if(!scope.familyDetailsLoaded) {
                    resourceFactory.familyDetails.getAll({clientId: routeParams.id}, function (data) {
                        scope.familyMembers = data;
                        scope.checkIfFamilyMemberIsExistingCustomer(scope.familyMembers);
                        scope.differentiateFamilyMemberDetailsBaseOnReferenceId(scope.familyMembers);
                    });
                    scope.familyDetailsLoaded = true;
                }
            };

            scope.checkIfFamilyMemberIsExistingCustomer = function(familyMembers){
                for(var i in familyMembers){
                    familyMembers[i].isExistingCustomer = false;
                    if(familyMembers[i].clientReference){
                        familyMembers[i].isExistingCustomer = true;
                    }
                }
            }

            scope.routeTo = function (id) {
                location.path('/clients/' + routeParams.id + '/viewfamilydetails/' + id);
            };

            scope.routeToClientDetails = function (familyMember) {
                if( familyMember.clientReference ){
                    location.path('/viewclient/' + familyMember.clientReference);
                }
            };

            scope.showEdit = function (id) {
                location.path('/clients/' + routeParams.id + '/editfamilydetails/' + id);
            };

            var FamilyDetailsDeleteCtrl = function ($scope, $modalInstance, familyDetailsId) {
                $scope.delete = function () {
                    resourceFactory.familyDetails.delete({
                        clientId: scope.id,
                        familyDetailId: familyDetailsId
                    }, {}, function (data) {
                        $modalInstance.close('delete');
                        route.reload();
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            scope.deleteFamilyDetail = function (id) {
                $modal.open({
                    templateUrl: 'deletefamilydetail.html',
                    controller: FamilyDetailsDeleteCtrl,
                    resolve: {
                        familyDetailsId: function () {
                            return id;
                        }
                    }
                });
            };
            scope.incomeAndexpenseLoaded = false;
            scope.incomeAndexpense = function(){
                if(!scope.incomeAndexpenseLoaded) {
                    resourceFactory.incomeExpenseAndHouseHoldExpense.getAll({clientId: routeParams.id}, function (data) {
                        scope.incomeAndExpenses = data;
                        scope.totalIncomeOcc = scope.calculateOccupationTotal();
                        scope.totalIncomeAsset = scope.calculateTotalAsset();
                        scope.totalHouseholdExpense = scope.calculateTotalExpense();
                    });
                    scope.incomeAndexpenseLoaded = true;
                }
            };


            scope.calculateOccupationTotal = function(){
                var total = 0;
                angular.forEach(scope.incomeAndExpenses, function(incomeExpense){
                    if(!_.isUndefined(incomeExpense.incomeExpenseData.cashFlowCategoryData.categoryEnum) && incomeExpense.incomeExpenseData.cashFlowCategoryData.categoryEnum.id == 1){
                        if(!_.isUndefined(incomeExpense.totalIncome) && !_.isNull(incomeExpense.totalIncome)){
                            if(!_.isUndefined(incomeExpense.totalExpense) && !_.isNull(incomeExpense.totalExpense)){
                                total = total + incomeExpense.totalIncome-incomeExpense.totalExpense;
                            }
                            else
                            {
                                total = total + incomeExpense.totalIncome;
                            }
                        }
                    }
                });
                return total;
            };

            scope.calculateTotalAsset = function(){
                var total = 0;
                angular.forEach(scope.incomeAndExpenses, function(incomeExpense){
                    if(!_.isUndefined(incomeExpense.incomeExpenseData.cashFlowCategoryData.categoryEnum) && incomeExpense.incomeExpenseData.cashFlowCategoryData.categoryEnum.id == 2){
                        if(!_.isUndefined(incomeExpense.totalIncome) && !_.isNull(incomeExpense.totalIncome)){
                            if(!_.isUndefined(incomeExpense.totalExpense) && !_.isNull(incomeExpense.totalExpense)){
                                total = total + incomeExpense.totalIncome-incomeExpense.totalExpense;
                            }
                            else
                            {
                                total = total + incomeExpense.totalIncome;
                            }
                        }
                    }
                });
                return total;
            };

            scope.calculateTotalExpense = function(){
                var total = 0;
                angular.forEach(scope.incomeAndExpenses, function(incomeExpense){
                    if(!_.isUndefined(incomeExpense.incomeExpenseData.cashFlowCategoryData.typeEnum) && incomeExpense.incomeExpenseData.cashFlowCategoryData.typeEnum.id == 2){
                        if(!_.isUndefined(incomeExpense.totalExpense) && !_.isNull(incomeExpense.totalExpense)){
                            total = total + incomeExpense.totalExpense;
                        }
                    }
                });
                return total;
            };

            scope.showEditClientIncome = function(id){
                location.path('/clients/'+scope.id+'/editclientoccupation/'+id);
            };

            scope.showEditClientAsset = function(id){
                location.path('/clients/'+scope.id+'/editclientasset/'+id);
            };

            scope.editClientIdentifier = function(id){
                location.path('/clients/'+scope.id+'/identifiers/'+id);
            };
            scope.showEditClientHouseHoldExpense = function(id){
                location.path('/clients/'+scope.id+'/editclienthouseholdexpense/'+id);
            };

            scope.existingLoansLoaded = false;
            scope.existingLoans = function(){
                if(!scope.existingLoansLoaded) {
                    resourceFactory.clientExistingLoan.getAll({clientId: routeParams.id}, function (data) {
                        scope.existingLoans = data;
                    });
                    scope.existingLoansLoaded = true;
                }
            };

            scope.showEditClientExistLoan = function(id){
                location.path('/clients/'+scope.id+'/editclientexistingloan/'+id);
            }

            scope.routeToViewExistingLoan = function(id){
                location.path('/clients/'+scope.id+'/viewclientexistingloan/'+id);
            }

            function getprofileRating(){
                resourceFactory.profileRating.get({entityType: 1,entityId : routeParams.id}, function (data) {
                    scope.profileRatingData = data;
                });
            };
            getprofileRating();
            scope.reComputeProfileRating = function () {
                scope.profileRatingData = {};
                resourceFactory.computeProfileRatingTemplate.get(function (response) {
                    for(var i in response.scopeEntityTypeOptions){
                        if(response.scopeEntityTypeOptions[i].value === 'OFFICE'){
                            scope.profileRatingData.scopeEntityType = response.scopeEntityTypeOptions[i].id;
                            scope.profileRatingData.scopeEntityId =  scope.client.officeId;
                            break;
                        }
                    }
                    for(var i in response.entityTypeOptions){
                        if(response.entityTypeOptions[i].value === 'CLIENT'){
                            scope.profileRatingData.entityType = response.entityTypeOptions[i].id;
                            scope.profileRatingData.entityId =  routeParams.id;
                            break;
                        }
                    }
                    scope.profileRatingData.locale = "en";
                    resourceFactory.computeProfileRating.save(scope.profileRatingData, function (response) {
                        getprofileRating();
                    });
                });
            }

            scope.isRefundOption = function(loanaccount){
                return (loanaccount.status.value =='Overpaid' && loanaccount.loanType.value != 'GLIM');
            };

            scope.isDisburseOption = function(loanaccount){
                return (!loanaccount.status.pendingApproval && !loanaccount.status.active  && loanaccount.loanType.value != 'GLIM' && loanaccount.status.value!='Overpaid');
            };

            scope.isRepaymentOption = function(loanaccount){
                return (loanaccount.status.active && loanaccount.loanType.value != 'GLIM');
            };
            scope.isApproveOption = function(loanaccount){
                return (loanaccount.status.pendingApproval && loanaccount.loanType.value != 'GLIM');
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

            var viewDocumentCtrl= function ($scope, $modalInstance, documentDetail) {
                $scope.data = documentDetail;
                $scope.close = function () {
                    $modalInstance.close('close');
                };
               
            };
            scope.openViewDocument = function (documentDetail) {
                $modal.open({
                    templateUrl: 'viewDocument.html',
                    controller: viewDocumentCtrl,
                    resolve: {
                        documentDetail: function () {
                            return documentDetail;
                        }
                    }
                });
            };

            function routeToLoanNextActionUrl(loanId,trancheDisbursalId){
                if(_.isUndefined(trancheDisbursalId)){
                    location.path('/loanaccount/'+loanId+'/disburse');
                }else{
                    location.path('/creditbureaureport/loan/'+loanId+'/'+trancheDisbursalId+'/'+scope.clientId);
                }
            };

            scope.differentiateFamilyMemberDetailsBaseOnReferenceId = function(familyMembers){
                scope.familyDetailsOfClient = [];
                scope.familyMemberOf = [];
                for(var i in familyMembers){
                    if(familyMembers[i].clientReference == scope.clientId){
                        scope.familyMemberOf.push(familyMembers[i]);
                    }
                    else if(familyMembers[i].id){
                        scope.familyDetailsOfClient.push(familyMembers[i]);
                    }

                }
            };

            scope.routeToClient = function (id) {
              location.path('/viewclient/' + id);   
            };

            scope.getClientLimits = function () {
             resourceFactory.clientLimitsResource.get({clientId: routeParams.id}, function (data) {
                        scope.clientLimits = data;
                        if(!_.isUndefined(scope.clientLimits.superlimit) && scope.clientLimits.superlimit != 0){
                           scope.displayAddButton = false;
                           scope.isUpdate = true;
                        }
                    });
            }

            scope.createSuperLimit = function() {
                var templateUrl = 'views/clients/addsuperlimit.html';
                var controller = 'AddSuperLimitController';
                popUpUtilService.openDefaultScreenPopUp(templateUrl, controller, scope);
                scope.submit() ? scope.displayAddButton = false : scope.displayAddButton = true;
            }

            scope.editSuperLimit = function() {
                var templateUrl = 'views/clients/editsuperlimit.html';
                var controller = 'EditSuperLimitController';
                popUpUtilService.openDefaultScreenPopUp(templateUrl, controller, scope);
            }

            scope.createProductCategoryLimit = function() {
                var templateUrl = 'views/clients/addproductcategorylimit.html';
                var controller = 'AddProductCategoryLimitController';
                popUpUtilService.openDefaultScreenPopUp(templateUrl, controller, scope);
            }

            scope.editProductCategoryLimit = function(limitValue) {
                var templateUrl = 'views/clients/editproductcategorylimit.html';
                var controller = 'EditProductCategoryLimitController';
                scope.limitValue = limitValue;
                popUpUtilService.openDefaultScreenPopUp(templateUrl, controller, scope);
            }

            scope.lockOrUnLockClient = function () {
                var action = 'lock';
                if(scope.client.isLocked){
                    action = 'unlock';
                }
                resourceFactory.lockOrUnlockEntityResource.lockOrUnlock({
                    entityType: 'client',
                    entityId: scope.entityId,
                    'command': action
                }, function (responseData) {
                    scope.client.isLocked = !scope.client.isLocked;
                });
            };

            scope.download = function(file){
                var url = $rootScope.hostUrl + file.docUrl;
                var fileType = file.fileName.substr(file.fileName.lastIndexOf('.') + 1);
                commonUtilService.downloadFile(url,fileType,file.fileName);
            };

            scope.getLoanStatusCode = function (loan) {
                if (loan.status) {
                    if (loan.subStatus && loan.subStatus.code != 'loanSubStatusType.invalid') {
                        return loan.status.code + "." + loan.subStatus.code;
                    }
                    return loan.status.code;
                }
            };

            scope.getLoanStatusValue = function (loan, subStatusRequested) {
                if (loan.status) {
                    if (loan.subStatus && loan.subStatus.code != 'loanSubStatusType.invalid' && subStatusRequested) {
                        return loan.subStatus.value;
                    }
                    return loan.status.value;
                }
            };
            scope.getOfficeName=function(officeName,officeReferenceNumber){
                if(!scope.isReferenceNumberAsNameEnable){
                    return officeName;
                }else{
                    return officeName+ ' - ' + officeReferenceNumber;
                }
            };

            scope.talukaLevelValueExists = function(address){
                return(scope.isLevelBasedAddressEnabled && (address.addressRegionValueData.Taluka || address.addressRegionValueData.Town || address.addressRegionValueData.VillageTract));
            };

            scope.hideId = function(row){
                return  (row.columnName === 'id');
            };
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

            scope.routeToCreditHistory = function() {
                location.path('/clients/' + scope.clientId + '/credithistory').search({clientName: scope.client.displayName}); 
            }

            scope.routeToClientLoansPaymentSettelment = function() {
                location.path('/clients/' + scope.clientId + '/loans/payment/settlement'); 
            }
            scope.getStatusCode = function () {
                if (scope.client.status) {
                    if (scope.client.subStatus && scope.client.subStatus.id == 600) {
                        return scope.client.status.code + "." + scope.client.subStatus.code;
                    } else {
                        return scope.client.status.code;
                    }
                }
            };



            // Score Card Functions

            scope.inputObj;

            scope.getScoreCardList = function() {
                resourceFactory.scoreCardsListResource.get({clientId: routeParams.id}, function (data) {
                    console.log('Score Card List :',data);
                    scope.scoreCardList = data;
                });
            }
            scope.getScoreCardList();

            scope.outputErrorB = false;
            scope.outputExpand = false;
            scope.listStyleValue;
            scope.ruleResultHierarchyLv2LocalInputs = [];
            scope.ruleResultHierarchyLv2 = [];
            scope.ruleResultHierarchyLv2Temp = [];
            scope.localInputsLv2 = true;
            scope.getScoreCardResult = function(displayName) {
                for(var i=0; i<scope.scoreCardList.length; i++) {
                    if(scope.scoreCardList[i].display == displayName) {
                        scope.listStyleValue = displayName;
                        if(scope.scoreCardList[i].input !== undefined) {
                            scope.inputObj = Object.entries(scope.scoreCardList[i].input);
                        } else {
                            scope.inputObj = [];
                            scope.inputExpand = false;
                        }

                        if(scope.scoreCardList[i].output !== undefined) {
                            scope.outputError = false;
                            scope.outputErrorB = true;
                            scope.outputExpand = true;
                            // scope.outputObj = Object.entries(scope.scoreCardList[i].output);
                            scope.outputObj = scope.scoreCardList[i].ruleResult.output;
                            console.log(scope.outputObj);
                        } else {
                            scope.outputObj = [];
                            scope.outputExpand = true;
                            if(scope.scoreCardList[i].ruleResult.output.error != undefined) {
                                scope.outputError = true;
                                scope.outputErrorB = false;
                                scope.outputErrorMsg = scope.scoreCardList[i].ruleResult.output.error;
                            }
                        }
                        
                        // Level 1 Rule Result Hierarchy
                        scope.ruleResultHierarchy = scope.scoreCardList[i].ruleResult.ruleResultHierarchy;
                        console.log(scope.ruleResultHierarchy);
                        if(scope.ruleResultHierarchy.length > 0) {
                            for(var j=0; j<scope.ruleResultHierarchy.length; j++) {
                                if(scope.ruleResultHierarchy[j].localInputs !== undefined) {
                                    scope.localInputs = Object.entries(scope.ruleResultHierarchy[j].localInputs);
                                } else {
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            scope.getLv2LocalInputs = function(ruleResultLv2Name) {
                if(ruleResultLv2Name !== undefined) {
                   return Object.entries(ruleResultLv2Name); 
                }
                return;
            }

            scope.inputExpand = false;
            scope.outputExpand = true;
            scope.ruleResultExpand = true;
            scope.inputResultExpand = function() {
                if(scope.inputExpand == false) {
                    scope.inputExpand = true;
                } else {
                    scope.inputExpand = false;
                }
            }

            scope.outputResultExpand = function() {
                if(scope.outputExpand == true) {
                    scope.outputExpand = false;
                } else {
                    scope.outputExpand = true;
                }
            }

            scope.ruleResultExpandFun = function() {
                if(scope.ruleResultExpand == true) {
                    scope.ruleResultExpand = false;
                } else {
                    scope.ruleResultExpand = true;
                }
            }

            scope.ruleResultExpandValue = '';
            scope.ruleResultExpandValueBoolean = true;
            scope.ruleResultHierarchyContentExpandFun = function(value) {
                if(scope.ruleResultExpandValue != value) {
                    scope.ruleResultExpandValue = value;
                } else {
                    scope.ruleResultExpandValue = '';
                }
            }


            // Credit Bureau Functions
            scope.bureaReportDetails = [];
            scope.paymentStartYear;
            scope.paymentEndYear;
            scope.paymentTotalYears;
            scope.paymentYearsList = ['Years'];
            scope.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            scope.jan = [];
            scope.feb = [];
            scope.mar = [];
            scope.apr = [];
            scope.may = [];
            scope.jun = [];
            scope.jul = [];
            scope.aug = [];
            scope.sep = [];
            scope.oct = [];
            scope.nov = [];
            scope.dec = [];
            scope.payementHistory = [];
            scope.displayBoolean = false;
            scope.existingLoansArray = [];
            scope.existingLoanIdArray = [];
            scope.showCBReport = false;
            scope.totalNumberOfLoans = 0;
            scope.presentLoanNumber = 1;
            scope.bureauScore;
            scope.enquiryHistory = [];
            scope.addressList = [];
            scope.kycList = [];
            scope.contactList = [];
            scope.enquiryBankList = [];
            scope.enquiryErrorMsg = false;
            scope.addressErrorMsg = false;
            scope.kycErrorMsg = false;
            scope.contactErrorMsg = false;
            scope.loanInfoErrorMsg = false;
            scope.scoreErrorMsg = false;
            scope.options = [{ name: "Active", id: 'Active' }, { name: "Closed", id: 'Closed' }, { name: "Show All Loans", id: 'all' }];
            scope.selectedOption = scope.options[2];

            scope.getBureauReportData = function(enquiryIdValue) {
                console.log(enquiryIdValue);
                scope.bureaReportDetails = [];
                scope.existingLoanIdArray = [];
                scope.jan = [];
                scope.feb = [];
                scope.mar = [];
                scope.apr = [];
                scope.may = [];
                scope.jun = [];
                scope.jul = [];
                scope.aug = [];
                scope.sep = [];
                scope.oct = [];
                scope.nov = [];
                scope.dec = [];
                scope.paymentYearsList = ['Years'];
                scope.bureaReportDetails = [];
                scope.payementHistory = [];

                resourceFactory.getB2cCreditbureauResource.get({enquiryId: enquiryIdValue}, function (data) {
                    console.log('CB Data :', data);
                    scope.showCBReport = true;
                    // scope.bureaReportDetails.push(data.bureauData.existingLoans[0]);
                    // scope.existingLoansArray = data.bureauData.existingLoans;
                    scope.bureaReportDetails.push(data.existingLoans[0]);
                    if(data.existingLoans != undefined && data.existingLoans != [] && data.existingLoans.length != 0) {
                        scope.loanInfoErrorMsg = false;
                        scope.existingLoansArray = data.existingLoans;
                        console.log(scope.existingLoansArray);
                    } else {
                        scope.loanInfoErrorMsg = true;
                    }

                    if(data.bureauScore[0] != undefined && data.bureauScore[0] != [] && data.bureauScore.length != 0) {
                        scope.scoreErrorMsg = false;
                        scope.bureauScore = data.bureauScore[0];
                    } else {
                        scope.scoreErrorMsg = true;
                    }
                    
                    if(data.enquiryHistory != undefined && data.enquiryHistory != [] && data.enquiryHistory.length != 0) {
                        scope.enquiryErrorMsg = false;
                        scope.enquiryHistory = data.enquiryHistory;
                        console.log(scope.bureauScore);
                    } else {
                        scope.enquiryErrorMsg = true;
                    }

                    if(data.bureauConsumerInformation.addressList != undefined && data.bureauConsumerInformation.addressList != [] && data.bureauConsumerInformation.addressList.length != 0) {
                        scope.addressErrorMsg = false;
                        scope.addressList = data.bureauConsumerInformation.addressList;
                        console.log(scope.addressList);
                    } else {
                        scope.addressErrorMsg = true;
                    }

                    if(data.bureauConsumerInformation.bureauConsumerKycData != undefined && data.bureauConsumerInformation.bureauConsumerKycData != [] && data.bureauConsumerInformation.bureauConsumerKycData.length != 0) {
                        scope.kycErrorMsg = false;
                        scope.kycList = data.bureauConsumerInformation.bureauConsumerKycData;
                        console.log(scope.kycList);
                    } else {
                        scope.kycErrorMsg = true;
                    }

                    if(data.bureauConsumerInformation.contactList != undefined && data.bureauConsumerInformation.contactList != [] && data.bureauConsumerInformation.contactList.length != 0) {
                        scope.contactErrorMsg = false;
                        scope.contactList = data.bureauConsumerInformation.contactList;
                        console.log(scope.contactList);
                    } else {
                        scope.contactErrorMsg = true;
                    }
                    
                    for(var a=0; a<scope.existingLoansArray.length; a++) {
                        scope.existingLoanIdArray.push(scope.existingLoansArray[a].existingLoanId);
                    }
                    scope.totalNumberOfLoans = scope.existingLoanIdArray.length;
                    console.log(scope.existingLoanIdArray);
                    
                    scope.payementHistory = scope.bureaReportDetails[0].creditBureauExistingLoanPaymentDetails;
                    // scope.paymentStartYear = scope.bureaReportDetails[0].disbursedOnDate[0];
                    // scope.paymentEndYear = scope.bureaReportDetails[0].lastPaymentDate[0];
                    if(scope.payementHistory[0].date[0] < scope.payementHistory[scope.payementHistory.length - 1].date[0]) {
                        scope.paymentStartYear = scope.payementHistory[0].date[0];
                        scope.paymentEndYear = scope.payementHistory[scope.payementHistory.length - 1].date[0];
                    } else {
                        scope.paymentEndYear = scope.payementHistory[0].date[0];
                        scope.paymentStartYear = scope.payementHistory[scope.payementHistory.length - 1].date[0];
                    }
                    scope.paymentTotalYears  = scope.paymentEndYear - scope.paymentStartYear;

                    scope.tempStartYear = scope.paymentStartYear;
                    scope.tempEndYear = scope.paymentEndYear;
                    for(var k=0; k<=scope.paymentTotalYears; k++) {
                        if(scope.tempStartYear <= scope.tempEndYear) {
                            scope.paymentYearsList.push(scope.tempStartYear);
                            scope.tempStartYear = scope.tempStartYear + 1;
                        } else {
                            break;
                        }
                    }
                    scope.payementHistory = scope.payementHistory.reverse();
                    console.log(scope.payementHistory);
                    console.log(scope.paymentYearsList);

                        scope.janFun();
                        scope.febFun();
                        scope.marFun();
                        scope.aprFun();
                        scope.mayFun();
                        scope.junFun();
                        scope.julFun();
                        scope.augFun();
                        scope.sepFun();
                        scope.octFun();
                        scope.novFun();
                        scope.decFun();
                });
            }

            scope.showLoanDetails = function(existingLoanIdValue) {
                console.log(existingLoanIdValue);
                scope.jan = [];
                scope.feb = [];
                scope.mar = [];
                scope.apr = [];
                scope.may = [];
                scope.jun = [];
                scope.jul = [];
                scope.aug = [];
                scope.sep = [];
                scope.oct = [];
                scope.nov = [];
                scope.dec = [];
                scope.paymentYearsList = ['Years'];
                scope.bureaReportDetails = [];
                scope.payementHistory = [];
                scope.totalNumberOfLoans = 0;
                scope.totalNumberOfLoans = scope.existingLoanIdArray.length;
                scope.loanInfoErrorMsg = false;

                if(existingLoanIdValue == undefined) {
                    scope.loanInfoErrorMsg = true;
                }
                
                for(var i=0; i<scope.existingLoansArray.length; i++) {
                    if(scope.existingLoansArray[i].existingLoanId == existingLoanIdValue) {
                        scope.loanInfoErrorMsg = false;
                        scope.bureaReportDetails.push(scope.existingLoansArray[i]);
                        console.log(scope.bureaReportDetails);
                        scope.payementHistory = [];
                        scope.payementHistory = scope.bureaReportDetails[0].creditBureauExistingLoanPaymentDetails;
                        // scope.paymentStartYear = scope.bureaReportDetails[0].disbursedOnDate[0];
                        // scope.paymentEndYear = scope.bureaReportDetails[0].lastPaymentDate[0];
                        if(scope.payementHistory[0].date[0] < scope.payementHistory[scope.payementHistory.length - 1].date[0]) {
                            scope.paymentStartYear = scope.payementHistory[0].date[0];
                            scope.paymentEndYear = scope.payementHistory[scope.payementHistory.length - 1].date[0];
                        } else {
                            scope.paymentEndYear = scope.payementHistory[0].date[0];
                            scope.paymentStartYear = scope.payementHistory[scope.payementHistory.length - 1].date[0];
                        }
                        // scope.paymentStartYear = scope.payementHistory[0].date[0];
                        // scope.paymentEndYear = scope.payementHistory[scope.payementHistory.length - 1].date[0];
                        console.log(scope.paymentEndYear);
                        console.log(scope.paymentStartYear);
                        scope.paymentTotalYears  = scope.paymentEndYear - scope.paymentStartYear;

                        scope.tempStartYear = scope.paymentStartYear;
                        scope.tempEndYear = scope.paymentEndYear;
                        for(var k=0; k<=scope.paymentTotalYears; k++) {
                            if(scope.tempStartYear <= scope.tempEndYear) {
                                scope.paymentYearsList.push(scope.tempStartYear);
                                scope.tempStartYear = scope.tempStartYear + 1;
                            } else {
                                break;
                            }
                        }
                        scope.payementHistory = scope.payementHistory.reverse();
                        console.log(scope.payementHistory);
                        console.log(scope.paymentYearsList);
                            scope.janFun();
                            scope.febFun();
                            scope.marFun();
                            scope.aprFun();
                            scope.mayFun();
                            scope.junFun();
                            scope.julFun();
                            scope.augFun();
                            scope.sepFun();
                            scope.octFun();
                            scope.novFun();
                            scope.decFun();
                    }
                }
            }

            scope.showNextBtn = true;
            scope.showPrvBtn = false;
            scope.nextBtn = function(value) {
                console.log(value);
                for(var i=0; i<scope.existingLoanIdArray.length; i++) {
                    if((value == scope.existingLoanIdArray[i]) && (value != scope.existingLoanIdArray[scope.existingLoanIdArray.length-1])) {
                        scope.showLoanDetails(scope.existingLoanIdArray[i+1]);
                        scope.showPrvBtn = true;
                        scope.presentLoanNumber = scope.presentLoanNumber + 1;

                        if(scope.existingLoanIdArray[i+1] == (scope.existingLoanIdArray[scope.existingLoanIdArray.length-1])) {
                            scope.showNextBtn = false;
                        }
                    }
                    
                }
            }

            scope.prvBtn = function(value) {
                console.log(value);
                for(var i=0; i<scope.existingLoanIdArray.length; i++) {
                    if((value == scope.existingLoanIdArray[i]) && (value != scope.existingLoanIdArray[0])) {
                        scope.showLoanDetails(scope.existingLoanIdArray[i-1]);
                        scope.showNextBtn = true;
                        scope.presentLoanNumber = scope.presentLoanNumber - 1;
                        if(scope.existingLoanIdArray[i-1] == (scope.existingLoanIdArray[0])) {
                            scope.showPrvBtn = false;
                        }
                    }
                    
                }
            }

            scope.loanFilter = function(value) {
                console.log(value);
                scope.presentLoanNumber = 1;
                scope.showPrvBtn = false;
                scope.showNextBtn = true;
                if(value != 'all') {
                    scope.existingLoanIdArray = [];
                    for(var i=0; i<scope.existingLoansArray.length; i++) {
                        if(value == scope.existingLoansArray[i].receivedLoanStatus) {
                            scope.existingLoanIdArray.push(scope.existingLoansArray[i].existingLoanId);
                        }
                    }
                    scope.showLoanDetails(scope.existingLoanIdArray[0]);
                } else {
                    scope.existingLoanIdArray = [];
                    for(var a=0; a<scope.existingLoansArray.length; a++) {
                        scope.existingLoanIdArray.push(scope.existingLoansArray[a].existingLoanId);
                    }
                    scope.showLoanDetails(scope.existingLoanIdArray[0]);
                }
                
            }

            scope.janBoolean = false;
            scope.janFun = function() {
                scope.jan = [];
                for(var j=1; j<scope.paymentYearsList.length; j++) {
                    scope.janBoolean = false;
                    for(var i=0; i<scope.payementHistory.length; i++) {
                        if(scope.paymentYearsList[j] == scope.payementHistory[i].date[0] && scope.payementHistory[i].date[1] == 1) {
                            scope.jan.push(scope.payementHistory[i].dpdRaw);
                            scope.janBoolean = true;
                        }
                    }
                    if(scope.janBoolean == false) {
                        scope.jan.push('--');
                    }
                }
                console.log('Jan Month :',scope.jan);
            }

            scope.febBoolean = false;
            scope.febFun = function() {
                scope.feb = [];
                for(var j=1; j<scope.paymentYearsList.length; j++) {
                    scope.febBoolean = false;
                    for(var i=0; i<scope.payementHistory.length; i++) {
                        if(scope.paymentYearsList[j] == scope.payementHistory[i].date[0] && scope.payementHistory[i].date[1] == 2) {
                            scope.feb.push(scope.payementHistory[i].dpdRaw);
                            scope.febBoolean = true;
                        }
                    }
                    if(scope.febBoolean == false) {
                        scope.feb.push('--');
                    }
                }
                console.log('Feb Month :',scope.feb);
            }

            scope.marBoolean = false;
            scope.marFun = function() {
                scope.mar = [];
                for(var j=1; j<scope.paymentYearsList.length; j++) {
                    scope.marBoolean = false;
                    for(var i=0; i<scope.payementHistory.length; i++) {
                        if(scope.paymentYearsList[j] == scope.payementHistory[i].date[0] && scope.payementHistory[i].date[1] == 3) {
                            scope.mar.push(scope.payementHistory[i].dpdRaw);
                            scope.marBoolean = true;
                        }
                    }
                    if(scope.marBoolean == false) {
                        scope.mar.push('--');
                    }
                }
                console.log('Mar Month :',scope.mar);
            }

            scope.aprBoolean = false;
            scope.aprFun = function() {
                scope.apr = [];
                for(var j=1; j<scope.paymentYearsList.length; j++) {
                    scope.aprBoolean = false;
                    for(var i=0; i<scope.payementHistory.length; i++) {
                        if(scope.paymentYearsList[j] == scope.payementHistory[i].date[0] && scope.payementHistory[i].date[1] == 4) {
                            scope.apr.push(scope.payementHistory[i].dpdRaw);
                            scope.aprBoolean = true;
                        }
                    }
                    if(scope.aprBoolean == false) {
                        scope.apr.push('--');
                    }
                }
                console.log('Apr Month :',scope.apr);
            }
            
            scope.mayBoolean = false;
            scope.mayFun = function() {
                scope.may = [];
                for(var j=1; j<scope.paymentYearsList.length; j++) {
                    scope.mayBoolean = false;
                    for(var i=0; i<scope.payementHistory.length; i++) {
                        if(scope.paymentYearsList[j] == scope.payementHistory[i].date[0] && scope.payementHistory[i].date[1] == 5) {
                            scope.may.push(scope.payementHistory[i].dpdRaw);
                            scope.mayBoolean = true;
                        }
                    }
                    if(scope.mayBoolean == false) {
                        scope.may.push('--');
                    }
                }
                console.log('May Month :',scope.may);
            }

            scope.junBoolean = false;
            scope.junFun = function() {
                scope.jun = [];
                for(var j=1; j<scope.paymentYearsList.length; j++) {
                    scope.junBoolean = false;
                    for(var i=0; i<scope.payementHistory.length; i++) {
                        if(scope.paymentYearsList[j] == scope.payementHistory[i].date[0] && scope.payementHistory[i].date[1] == 6) {
                            scope.jun.push(scope.payementHistory[i].dpdRaw);
                            scope.junBoolean = true;
                        }
                    }
                    if(scope.junBoolean == false) {
                        scope.jun.push('--');
                    }
                }
                console.log('Jun Month :',scope.jun);
            }

            scope.julBoolean = false;
            scope.julFun = function() {
                scope.jul = [];
                for(var j=1; j<scope.paymentYearsList.length; j++) {
                    scope.julBoolean = false;
                    for(var i=0; i<scope.payementHistory.length; i++) {
                        if(scope.paymentYearsList[j] == scope.payementHistory[i].date[0] && scope.payementHistory[i].date[1] == 7) {
                            scope.jul.push(scope.payementHistory[i].dpdRaw);
                            scope.julBoolean = true;
                        }
                    }
                    if(scope.julBoolean == false) {
                        scope.jul.push('--');
                    }
                }
                console.log('Jul Month :',scope.jul);
            }

            scope.augBoolean = false;
            scope.augFun = function() {
                scope.aug = [];
                for(var j=1; j<scope.paymentYearsList.length; j++) {
                    scope.augBoolean = false;
                    for(var i=0; i<scope.payementHistory.length; i++) {
                        if(scope.paymentYearsList[j] == scope.payementHistory[i].date[0] && scope.payementHistory[i].date[1] == 8) {
                            scope.aug.push(scope.payementHistory[i].dpdRaw);
                            scope.augBoolean = true;
                        }
                    }
                    if(scope.augBoolean == false) {
                        scope.aug.push('--');
                    }
                }
                console.log('Aug Month :',scope.aug);
            }

            scope.sepBoolean = false;
            scope.sepFun = function() {
                scope.sep = [];
                for(var j=1; j<scope.paymentYearsList.length; j++) {
                    scope.sepBoolean = false;
                    for(var i=0; i<scope.payementHistory.length; i++) {
                        if(scope.paymentYearsList[j] == scope.payementHistory[i].date[0] && scope.payementHistory[i].date[1] == 9) {
                            scope.sep.push(scope.payementHistory[i].dpdRaw);
                            scope.sepBoolean = true;
                        }
                    }
                    if(scope.sepBoolean == false) {
                        scope.sep.push('--');
                    }
                }
                console.log('Sep Month :',scope.sep);
            }

            scope.octBoolean = false;
            scope.octFun = function() {
                scope.oct = [];
                for(var j=1; j<scope.paymentYearsList.length; j++) {
                    scope.octBoolean = false;
                    for(var i=0; i<scope.payementHistory.length; i++) {
                        if(scope.paymentYearsList[j] == scope.payementHistory[i].date[0] && scope.payementHistory[i].date[1] == 10) {
                            scope.oct.push(scope.payementHistory[i].dpdRaw);
                            scope.octBoolean = true;
                        }
                    }
                    if(scope.octBoolean == false) {
                        scope.oct.push('--');
                    }
                }
                console.log('Oct Month :',scope.oct);
            }

            scope.novBoolean = false;
            scope.novFun = function() {
                scope.nov = [];
                for(var j=1; j<scope.paymentYearsList.length; j++) {
                    scope.novBoolean = false;
                    for(var i=0; i<scope.payementHistory.length; i++) {
                        if(scope.paymentYearsList[j] == scope.payementHistory[i].date[0] && scope.payementHistory[i].date[1] == 11) {
                            scope.nov.push(scope.payementHistory[i].dpdRaw);
                            scope.novBoolean = true;
                        }
                    }
                    if(scope.novBoolean == false) {
                        scope.nov.push('--');
                    }
                }
                console.log('Nov Month :',scope.nov);
            }

            scope.decBoolean = false;
            scope.decFun = function() {
                scope.dec = [];
                for(var j=1; j<scope.paymentYearsList.length; j++) {
                    scope.decBoolean = false;
                    for(var i=0; i<scope.payementHistory.length; i++) {
                        if(scope.paymentYearsList[j] == scope.payementHistory[i].date[0] && scope.payementHistory[i].date[1] == 12) {
                            scope.dec.push(scope.payementHistory[i].dpdRaw);
                            scope.decBoolean = true;
                        }
                    }
                    if(scope.decBoolean == false) {
                        scope.dec.push('--');
                    }
                }
                console.log('Dec Month :',scope.dec);
            }




        }
    });

    mifosX.ng.application.controller('ViewClientController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$modal', 'API_VERSION', '$rootScope', '$upload', 'dateFilter', 'CommonUtilService', 'localStorageService','$sce','PaginatorUsingOffsetService', 'PopUpUtilService', mifosX.controllers.ViewClientController]).run(function ($log) {
        $log.info("ViewClientController initialized");
    });
}(mifosX.controllers || {}));
