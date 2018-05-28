(function (module) {
    mifosX.controllers = _.extend(module, {
        BulkLoanApplicationActivityController: function ($controller, scope, routeParams, $modal, resourceFactory, location, dateFilter, ngXml2json, route, $http, $rootScope, $sce, CommonUtilService, $route, $upload, API_VERSION) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));

            function initTask() {
                scope.centerId = scope.taskconfig.centerId;
                resourceFactory.centerWorkflowResource.get({ centerId: scope.centerId, associations: 'groupMembers,profileratings,loanaccounts' }, function (data) {
                    scope.centerDetails = data;
                });

            };
            initTask();

            scope.viewMemberDetails = function (groupId, activeClientMember) {
                $modal.open({
                    templateUrl: 'views/task/popup/viewmember.html',
                    controller: ViewMemberCtrl,
                    backdrop: 'static',
                    windowClass: 'app-modal-window-full-screen',
                    size: 'lg',
                    resolve: {
                        memberParams: function () {
                            return { 'groupId': groupId, 'activeClientMember' : activeClientMember };
                        }
                    }
                });
            }

            var ViewMemberCtrl = function ($scope, $modalInstance, memberParams) {
                $scope.clientId = memberParams.activeClientMember.id;
                $scope.groupId = memberParams.groupId;
                $scope.showaddressform = true;
                $scope.shownidentityform = true;
                $scope.shownFamilyMembersForm = true;
                $scope.showLoanAccountForm = false;
                $scope.isLoanAccountExist = false;
                $scope.showOnlyLoanTab = false;

                //loan account
                if(memberParams.activeClientMember.loanAccountBasicData){
                    $scope.loanAccountData = memberParams.activeClientMember.loanAccountBasicData;
                    $scope.isLoanAccountExist = true;
                }

                $scope.close = function () {
                    $modalInstance.dismiss('close');
                };

                function getClientData() {
                    resourceFactory.clientResource.get({ clientId: $scope.clientId, associations: 'hierarchyLookup' }, function (data) {
                        $scope.clientDetails = data;
                        if ($scope.clientDetails.lastname != undefined) {
                            $scope.clientDetails.displayNameInReverseOrder = $scope.clientDetails.lastname.concat(" ");
                        }
                        if ($scope.clientDetails.middlename != undefined) {
                            $scope.clientDetails.displayNameInReverseOrder = $scope.clientDetails.displayNameInReverseOrder.concat($scope.clientDetails.middlename).concat(" ");
                        }
                        if ($scope.clientDetails.firstname != undefined) {
                            $scope.clientDetails.displayNameInReverseOrder = $scope.clientDetails.displayNameInReverseOrder.concat($scope.clientDetails.firstname);
                        }
                    });
                }
                getClientData();

                $scope.getLoanAccountFormDetails = function(){
                        $scope.showLoanAccountForm = true;
                        $scope.clientId = $scope.clientId;
                        $scope.groupId = $scope.groupId;
                        $scope.restrictDate = new Date();
                        $scope.loanAccountFormData = {};    
                        $scope.temp = {};
                        $scope.chargeFormData = {}; //For charges
                        $scope.date = {};
                        $scope.loanAccountFormData.isSubsidyApplicable = false;
                        $scope.repeatsOnDayOfMonthOptions = [];
                        $scope.selectedOnDayOfMonthOptions = [];
                        $scope.slabBasedCharge = "Slab Based";
                        $scope.flatCharge = "Flat";
                        $scope.upfrontFee = "Upfront Fee";
                        $scope.interestRatesListPerPeriod = [];
                        $scope.interestRatesListAvailable = false;
                        $scope.isCenter=false;
                        $scope.installmentAmountSlabChargeType = 1;
                        $scope.showIsDeferPaymentsForHalfTheLoanTerm = scope.response.uiDisplayConfigurations.loanAccount.isShowField.isDeferPaymentsForHalfTheLoanTerm;
                        var SLAB_BASED = 'slabBasedCharge';
                        var UPFRONT_FEE = 'upfrontFee';
                        $scope.paymentModeOptions = [];
                        $scope.repaymentTypeOption = [];
                        $scope.disbursementTypeOption = [];
                        $scope.applicableOnRepayment = 1;
                        $scope.applicableOnDisbursement = 2;
                        $scope.canDisburseToGroupBankAccounts = false;
                        $scope.allowBankAccountsForGroups = scope.isSystemGlobalConfigurationEnabled('allow-bank-account-for-groups');
                        $scope.allowDisbursalToGroupBankAccounts = scope.isSystemGlobalConfigurationEnabled('allow-multiple-bank-disbursal');
                        $scope.parentGroups = [];

                        for (var i = 1; i <= 28; i++) {
                            $scope.repeatsOnDayOfMonthOptions.push(i);
                        }

                        $scope.date.first = new Date();//submittedOnDate
                        $scope.date.second = new Date();//expectedDisbursementDate
                        $scope.inparams = {resourceType: 'template', activeOnly: 'true'};
                        $scope.inparams.clientId = $scope.clientId;
                        $scope.loanAccountFormData.clientId = $scope.clientId;
                        $scope.inparams.groupId = $scope.groupId;
                        $scope.loanAccountFormData.groupId = $scope.groupId;
                        $scope.inparams.templateType = 'jlg';
                        $scope.inparams.staffInSelectedOfficeOnly = true;
                        $scope.inparams.productApplicableForLoanType = 2;
                        $scope.inparams.entityType = 1;
                        $scope.inparams.entityId = $scope.clientId;

                        if(scope.response && scope.response.uiDisplayConfigurations.loanAccount){
                    
                            $scope.showExternalId = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.externalId;
                            $scope.extenalIdReadOnlyType = scope.response.uiDisplayConfigurations.loanAccount.isReadOnlyField.externalId;
                            $scope.showRepaymentFrequencyNthDayType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.repaymentFrequencyNthDayType;
                            $scope.showRepaymentFrequencyDayOfWeekType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.repaymentFrequencyDayOfWeekType;
                            $scope.showBrokenPeriodType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.brokenPeriodMethodType;
                        }

                        resourceFactory.loanResource.get($scope.inparams, function (data) {
                                $scope.paymentModeOptions = data.paymentModeOptions;
                                $scope.products = data.productOptions;
                                if(data.interestRatesListPerPeriod != undefined && data.interestRatesListPerPeriod.length > 0){
                                    $scope.interestRatesListPerPeriod = data.interestRatesListPerPeriod;
                                    $scope.interestRatesListAvailable = true;
                                }
                        });
                }

                $scope.updateSlabBasedChargeForEmiPack = function(principal){
                    if(principal){
                        $scope.loanAccountFormData.principal = principal;
                        $scope.updateSlabBasedAmountOnChangePrincipalOrRepayment();
                    }
                }

                $scope.updateSlabBasedAmountOnChangePrincipalOrRepayment = function () {
                    if ($scope.loanAccountFormData.principal != '' && $scope.loanAccountFormData.principal != undefined && $scope.loanAccountFormData.numberOfRepayments != '' && $scope.loanAccountFormData.numberOfRepayments != undefined) {

                        for (var i in $scope.charges) {
                            if (($scope.charges[i].chargeCalculationType.value == $scope.slabBasedCharge || $scope.charges[i].isSlabBased) && $scope.charges[i].slabs.length > 0) {
                                for (var j in $scope.charges[i].slabs) {
                                    var slabBasedValue = $scope.getSlabBasedAmount($scope.charges[i].slabs[j], $scope.loanAccountFormData.principal, $scope.loanAccountFormData.numberOfRepayments);
                                    if (slabBasedValue != null) {
                                        $scope.charges[i].amount = slabBasedValue;
                                        break;
                                    } else {
                                        $scope.charges[i].amount = undefined;
                                    }
                                }
                            }
                        }
                    }
                };

            $scope.loanProductChange = function (loanProductId) {
                    $scope.inparams.productId = loanProductId;
                    $scope.interestRatesListPerPeriod = [];
                    $scope.interestRatesListAvailable = false;
                    $scope.inparams.fetchRDAccountOnly = scope.response.uiDisplayConfigurations.loanAccount.savingsAccountLinkage.reStrictLinkingToRDAccount;
                    resourceFactory.loanResource.get($scope.inparams, function (data) {
                        $scope.loanaccountinfo = data;
                        $scope.previewClientLoanAccInfo();
                        $scope.canDisburseToGroupBankAccounts = data.product.allowDisbursementToGroupBankAccounts;
                        $scope.productLoanCharges = data.product.charges || [];
                        if($scope.productLoanCharges && $scope.productLoanCharges.length > 0){
                            for(var i in $scope.productLoanCharges){
                                if($scope.productLoanCharges[i].chargeData){
                                    for(var j in $scope.loanaccountinfo.chargeOptions){
                                        if($scope.productLoanCharges[i].chargeData.id == $scope.loanaccountinfo.chargeOptions[j].id){
                                                var charge = $scope.productLoanCharges[i].chargeData;
                                                charge.chargeId = charge.id;
                                                charge.isMandatory = $scope.productLoanCharges[i].isMandatory;
                                                charge.isAmountNonEditable = $scope.productLoanCharges[i].isAmountNonEditable;
                                                if(charge.chargeCalculationType.value == $scope.slabBasedCharge && charge.slabs.length > 0){
                                                    for(var i in charge.slabs) {
                                                        var slabBasedValue = $scope.getSlabBasedAmount(charge.slabs[i],$scope.loanAccountFormData.principal,$scope.loanAccountFormData.numberOfRepayments);
                                                        if(slabBasedValue != null){
                                                            charge.amount = slabBasedValue;
                                                        }
                                                    }
                                                }
                                                $scope.charges.push(charge);
                                             break;
                                        }
                                    }
                                }
                            }
                        }
                        
                        if ($scope.loanaccountinfo.loanOfficerOptions != undefined && $scope.loanaccountinfo.loanOfficerOptions.length > 0 && !$scope.loanAccountFormData.loanOfficerId) {
                            resourceFactory.clientResource.get({clientId: $scope.clientId}, function (data) {
                                if (data.staffId != null) {
                                    for (var i in $scope.loanaccountinfo.loanOfficerOptions) {
                                        if ($scope.loanaccountinfo.loanOfficerOptions[i].id == data.staffId) {
                                            $scope.loanAccountFormData.loanOfficerId = data.staffId;
                                            break;
                                        }
                                    }
                                }
                            })
                        }
    
                        if(data.interestRatesListPerPeriod != undefined && data.interestRatesListPerPeriod.length > 0){
                        $scope.interestRatesListPerPeriod = data.interestRatesListPerPeriod;
                        $scope.interestRatesListAvailable = true;
                        }
                    });
    
                }
                $scope.isChargeAmountNonEditable = function (charge) {
                    if ((charge.chargeTimeType.value == UPFRONT_FEE
                        && charge.chargeCalculationType.value == SLAB_BASED) || charge.isAmountNonEditable || charge.isSlabBased) {
                        return true;
                    }
                    return false;
                };
                $scope.previewClientLoanAccInfo = function () {
                    $scope.previewRepayment = false;
                    $scope.charges = [];//scope.loanaccountinfo.charges || [];
                    $scope.loanAccountFormData.disbursementData = $scope.loanaccountinfo.disbursementDetails || [];
    
                    if ($scope.loanaccountinfo.calendarOptions) {
                        $scope.temp.syncRepaymentsWithMeeting = true;
                        if (scope.response && !scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.syncDisbursementWithMeeting) {
                            $scope.loanAccountFormData.syncDisbursementWithMeeting = false;
                        } else {
                            $scope.loanAccountFormData.syncDisbursementWithMeeting = true;
                        }
    
                    }
                    if (scope.response && scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.fundId != null) {
                        $scope.loanAccountFormData.fundId = scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.fundId;
                        if($scope.loanaccountinfo.fundOptions){
                            for(var i in $scope.loanaccountinfo.fundOptions){
                                if($scope.loanaccountinfo.fundOptions[i].id == scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.fundId){
                                    $scope.loanAccountFormData.fundId = scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.fundId;
                                }
                            }
                        }
                    } else {
                        $scope.loanAccountFormData.fundId = $scope.loanaccountinfo.fundId;
                    }
                    $scope.loanAccountFormData.productId = $scope.loanaccountinfo.loanProductId;
                    $scope.loanAccountFormData.principal = $scope.loanaccountinfo.principal;
                    $scope.loanAccountFormData.loanTermFrequencyType = $scope.loanaccountinfo.termPeriodFrequencyType.id;
                    $scope.loanAccountFormData.numberOfRepayments = $scope.loanaccountinfo.numberOfRepayments;
                    $scope.loanAccountFormData.repaymentEvery = $scope.loanaccountinfo.repaymentEvery;
                    $scope.loanAccountFormData.repaymentFrequencyType = $scope.loanaccountinfo.repaymentFrequencyType.id;
                    $scope.loanAccountFormData.interestRatePerPeriod = $scope.loanaccountinfo.interestRatePerPeriod;
                    $scope.loanAccountFormData.amortizationType = $scope.loanaccountinfo.amortizationType.id;
                    $scope.loanAccountFormData.interestType = $scope.loanaccountinfo.interestType.id;
                    $scope.loanAccountFormData.interestCalculationPeriodType = $scope.loanaccountinfo.interestCalculationPeriodType.id;
                    $scope.loanAccountFormData.allowPartialPeriodInterestCalcualtion = $scope.loanaccountinfo.allowPartialPeriodInterestCalcualtion;
                    $scope.loanAccountFormData.inArrearsTolerance = $scope.loanaccountinfo.inArrearsTolerance;
                    $scope.loanAccountFormData.graceOnPrincipalPayment = $scope.loanaccountinfo.graceOnPrincipalPayment;
                    $scope.loanAccountFormData.recurringMoratoriumOnPrincipalPeriods = $scope.loanaccountinfo.recurringMoratoriumOnPrincipalPeriods;
                    $scope.loanAccountFormData.graceOnInterestPayment = $scope.loanaccountinfo.graceOnInterestPayment;
                    $scope.loanAccountFormData.graceOnArrearsAgeing = $scope.loanaccountinfo.graceOnArrearsAgeing;
                    $scope.loanAccountFormData.transactionProcessingStrategyId = $scope.loanaccountinfo.transactionProcessingStrategyId;
                    $scope.loanAccountFormData.graceOnInterestCharged = $scope.loanaccountinfo.graceOnInterestCharged;
                    $scope.loanAccountFormData.fixedEmiAmount = $scope.loanaccountinfo.fixedEmiAmount;
                    $scope.loanAccountFormData.maxOutstandingLoanBalance = $scope.loanaccountinfo.maxOutstandingLoanBalance;
                    $scope.loanAccountFormData.loanOfficerId = $scope.loanaccountinfo.loanOfficerId;
                    if ($scope.loanaccountinfo.brokenPeriodMethodType) {
                        $scope.loanAccountFormData.brokenPeriodMethodType = $scope.loanaccountinfo.brokenPeriodMethodType.id;
                    }else{
                        $scope.loanAccountFormData.brokenPeriodMethodType = "";
                    }
    
                    if ($scope.loanaccountinfo.isInterestRecalculationEnabled && $scope.loanaccountinfo.interestRecalculationData.recalculationRestFrequencyDate) {
                        $scope.date.recalculationRestFrequencyDate = new Date($scope.loanaccountinfo.interestRecalculationData.recalculationRestFrequencyDate);
                    }
                    if ($scope.loanaccountinfo.isInterestRecalculationEnabled && $scope.loanaccountinfo.interestRecalculationData.recalculationCompoundingFrequencyDate) {
                        $scope.date.recalculationCompoundingFrequencyDate = new Date($scope.loanaccountinfo.interestRecalculationData.recalculationCompoundingFrequencyDate);
                    }
    
                    if($scope.loanaccountinfo.isLoanProductLinkedToFloatingRate) {
                        $scope.loanAccountFormData.isFloatingInterestRate = false ;
                        $scope.loanAccountFormData.interestRateDifferential = $scope.loanaccountinfo.interestRateDifferential;
                    }
                    $scope.loanAccountFormData.collectInterestUpfront = $scope.loanaccountinfo.product.collectInterestUpfront;
                }

                $scope.addCharge = function () {
                    if ($scope.chargeFormData.chargeId) {
                        resourceFactory.chargeResource.get({ chargeId: this.chargeFormData.chargeId, template: 'true' }, function (data) {
                            data.chargeId = data.id;
                            data.isMandatory = false;
                            if (data.chargeCalculationType.value == $scope.slabBasedCharge && data.slabs.length > 0) {
                                for (var i in data.slabs) {
                                    var slabBasedValue = $scope.getSlabBasedAmount(data.slabs[i], $scope.loanAccountFormData.principal, $scope.loanAccountFormData.numberOfRepayments);
                                    if (slabBasedValue != null) {
                                        data.amount = slabBasedValue;
                                    }
                                }
                            }
                            $scope.charges.push(data);
                            $scope.chargeFormData.chargeId = undefined;
                        });
                    }
                }

                $scope.deleteCharge = function (index) {
                    $scope.charges.splice(index, 1);
                }

                $scope.syncRepaymentsWithMeetingchange = function () {
                    if (!$scope.temp.syncRepaymentsWithMeeting) {
                        $scope.loanAccountFormData.syncDisbursementWithMeeting = false;
                    }
                };
    
                $scope.syncDisbursementWithMeetingchange = function () {
                    if ($scope.loanAccountFormData.syncDisbursementWithMeeting) {
                        $scope.temp.syncRepaymentsWithMeeting = true;
                    }
                };

                 $scope.inRange = function(min,max,value){
                   return (value>=min && value<=max);
                };

                $scope.getSlabBasedAmount = function(slab, amount , repayment){
                    var slabValue = 0;
                    slabValue = (slab.type.id == $scope.installmentAmountSlabChargeType)?amount:repayment;
                    var subSlabvalue = 0;
                    subSlabvalue = (slab.type.id != $scope.installmentAmountSlabChargeType)?amount:repayment;
                    //check for if value fall in slabs
                    if($scope.inRange(slab.minValue,slab.maxValue,slabValue)){
                        
                            if(slab.subSlabs != undefined && slab.subSlabs.length>0){
                                for(var i in slab.subSlabs){
                                    //check for sub slabs range
                                    if($scope.inRange(slab.subSlabs[i].minValue,slab.subSlabs[i].maxValue,subSlabvalue)){
                                        return slab.subSlabs[i].amount;
                                    }
                                }
    
                            }
                            return slab.amount;
                    }
                    return null;
    
                };

                $scope.newLoanAccountSubmit = function () {
                    // Make sure charges, overdue charges and collaterals are empty before initializing.
                    delete $scope.loanAccountFormData.charges;
                    var reqFirstDate = dateFilter($scope.date.first, scope.df);
                    var reqSecondDate = dateFilter($scope.date.second, scope.df);
                    var reqThirdDate = dateFilter($scope.date.third, scope.df);
                    var reqFourthDate = dateFilter($scope.date.fourth, scope.df);
                    var reqFifthDate = dateFilter($scope.date.fifth, scope.df);
                    $scope.loanAccountFormData.loanTermFrequency = $scope.loanTerm;
                    if ($scope.charges.length > 0) {
                        $scope.loanAccountFormData.charges = [];
                        for (var i in $scope.charges) {
                            if ($scope.charges[i].amount > 0) {
                                $scope.loanAccountFormData.charges.push({
                                    chargeId: $scope.charges[i].chargeId,
                                    amount: $scope.charges[i].amount,
                                    dueDate: dateFilter($scope.charges[i].dueDate, scope.df),
                                    upfrontChargesAmount: $scope.charges[i].glims
                                });
                            }
                        }
                    }
    
                    if ($scope.loanaccountinfo.overdueCharges && $scope.loanaccountinfo.overdueCharges.length > 0) {
                        $scope.loanAccountFormData.overdueCharges = [];
                        for (var i in $scope.loanaccountinfo.overdueCharges) {
                            if ($scope.loanaccountinfo.overdueCharges[i].chargeData.amount > 0) {
                                $scope.loanAccountFormData.overdueCharges.push({
                                    productChargeId: $scope.loanaccountinfo.overdueCharges[i].id,
                                    amount: $scope.loanaccountinfo.overdueCharges[i].chargeData.amount
                                });
                            }
                        }
                    }
    
                    if ($scope.temp.syncRepaymentsWithMeeting) {
                        $scope.loanAccountFormData.calendarId = $scope.loanaccountinfo.calendarOptions[0].id;
                    }
                    $scope.loanAccountFormData.interestChargedFromDate = reqThirdDate;
                    $scope.loanAccountFormData.repaymentsStartingFromDate = reqFourthDate;
                    $scope.loanAccountFormData.locale = scope.optlang.code;
                    $scope.loanAccountFormData.dateFormat = scope.df;
                    $scope.loanAccountFormData.loanType = $scope.inparams.templateType;
                    $scope.loanAccountFormData.expectedDisbursementDate = reqSecondDate;
                    $scope.loanAccountFormData.submittedOnDate = reqFirstDate;
                    $scope.loanAccountFormData.recalculationRestFrequencyStartDate = dateFilter($scope.recalculationRestFrequencyStartDate, scope.df);
                    $scope.loanAccountFormData.recalculationCompoundingFrequencyStartDate = dateFilter($scope.recalculationCompoundingFrequencyStartDate, scope.df);
                    
                    if ($scope.date.recalculationRestFrequencyDate) {
                        var restFrequencyDate = dateFilter($scope.date.recalculationRestFrequencyDate, scope.df);
                        $scope.loanAccountFormData.recalculationRestFrequencyDate = restFrequencyDate;
                    }
                    if ($scope.date.recalculationCompoundingFrequencyDate) {
                        var restFrequencyDate = dateFilter($scope.date.recalculationCompoundingFrequencyDate, scope.df);
                        $scope.loanAccountFormData.recalculationCompoundingFrequencyDate = restFrequencyDate;
                    }
                    if($scope.loanAccountFormData.interestCalculationPeriodType == 0){
                        $scope.loanAccountFormData.allowPartialPeriodInterestCalcualtion = false;
                    }
                    if($scope.loanAccountFormData.repaymentFrequencyType == 2 && $scope.loanAccountFormData.repaymentFrequencyNthDayType){
                        $scope.loanAccountFormData.repeatsOnDayOfMonth = $scope.selectedOnDayOfMonthOptions;
                    }else{
                        $scope.loanAccountFormData.repeatsOnDayOfMonth = [];
                    }
    
                    if(!$scope.loanaccountinfo.isLoanProductLinkedToFloatingRate) {
                        delete $scope.loanAccountFormData.interestRateDifferential ;
                        delete $scope.loanAccountFormData.isFloatingInterestRate;
                    }
                    else{
                        if($scope.loanAccountFormData.interestRatePerPeriod != undefined){
                            delete $scope.loanAccountFormData.interestRatePerPeriod;
                        }
                    }
    
                    resourceFactory.loanResource.save($scope.loanAccountFormData, function (data) {
                        $scope.showLoanAccountForm = false;
                        $scope.clientJlgLoanAccount();
                    });
                };

                $scope.clientJlgLoanAccount = function(){
                    $scope.type = 'jlg';
                    resourceFactory.clientJlgLoanAccount.get({ type: $scope.type, clientId: $scope.clientId, groupId: $scope.groupId}, function (data) {
                        $scope.loanAccountData = data;
                });

                if(scope.response && scope.response.uiDisplayConfigurations.loanAccount.isAutoPopulate.interestChargedFromDate){
                    scope.$watch('date.second ', function(){
                        if($scope.date.second != '' && $scope.date.second != undefined){
                            $scope.date.third = $scope.date.second;
                        }
                    });
                }

                $scope.closeLoanAccountForm = function () {
                    $scope.showLoanAccountForm = false;
                }
            }

            //lona account edit 
            scope.editLoan = function(loanAccountBasicData,groupId){
                $modal.open({
                templateUrl: 'views/task/popup/editLoan.html',
                controller: editLoanCtrl,
                backdrop: 'static',
                windowClass: 'app-modal-window-full-screen',
                size: 'lg',
                resolve: {
                 memberParams: function () {
                     return {'groupId':groupId, 'loanAccountBasicData':loanAccountBasicData};
                        }
                    }
                });
            }
            var editLoanCtrl = function($scope, $modalInstance, memberParams){
                        $scope.showLoanAccountForm = true;
                        $scope.clientId = memberParams.loanAccountBasicData.clientId;
                        $scope.groupId = memberParams.groupId;
                        $scope.restrictDate = new Date();
                        $scope.loanAccountFormData = {};
                        $scope.temp = {};
                        $scope.chargeFormData = {}; //For charges
                        $scope.date = {};
                        $scope.loanAccountFormData.isSubsidyApplicable = false;
                        $scope.repeatsOnDayOfMonthOptions = [];
                        $scope.selectedOnDayOfMonthOptions = [];
                        $scope.slabBasedCharge = "Slab Based";
                        $scope.flatCharge = "Flat";
                        $scope.upfrontFee = "Upfront Fee";
                        $scope.interestRatesListPerPeriod = [];
                        $scope.interestRatesListAvailable = false;
                        $scope.isCenter=false;
                        $scope.installmentAmountSlabChargeType = 1;
                        $scope.showIsDeferPaymentsForHalfTheLoanTerm = scope.response.uiDisplayConfigurations.loanAccount.isShowField.isDeferPaymentsForHalfTheLoanTerm;
                        var SLAB_BASED = 'slabBasedCharge';
                        var UPFRONT_FEE = 'upfrontFee';
                        $scope.paymentModeOptions = [];
                        $scope.repaymentTypeOption = [];
                        $scope.disbursementTypeOption = [];
                        $scope.applicableOnRepayment = 1;
                        $scope.applicableOnDisbursement = 2;
                        $scope.canDisburseToGroupBankAccounts = false;
                        $scope.allowBankAccountsForGroups = scope.isSystemGlobalConfigurationEnabled('allow-bank-account-for-groups');
                        $scope.allowDisbursalToGroupBankAccounts = scope.isSystemGlobalConfigurationEnabled('allow-multiple-bank-disbursal');
                        $scope.parentGroups = [];
                        $scope.loanAccountData = memberParams.loanAccountBasicData;
                        for (var i = 1; i <= 28; i++) {
                            $scope.repeatsOnDayOfMonthOptions.push(i);
                        }

                        $scope.date.first = new Date();//submittedOnDate
                        $scope.date.second = new Date();//expectedDisbursementDate
                        $scope.inparams = {resourceType: 'template', activeOnly: 'true'};
                        $scope.inparams.clientId = $scope.clientId;
                        $scope.loanAccountFormData.clientId = $scope.clientId;
                        $scope.inparams.groupId = $scope.groupId;
                        $scope.loanAccountFormData.groupId = $scope.groupId;
                        $scope.inparams.templateType = 'jlg';
                        $scope.inparams.staffInSelectedOfficeOnly = true;
                        $scope.inparams.productApplicableForLoanType = 2;
                        $scope.inparams.entityType = 1;
                        $scope.inparams.entityId = $scope.clientId;

                        if(scope.response && scope.response.uiDisplayConfigurations.loanAccount){
                    
                            $scope.showExternalId = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.externalId;
                            $scope.extenalIdReadOnlyType = scope.response.uiDisplayConfigurations.loanAccount.isReadOnlyField.externalId;
                            $scope.showRepaymentFrequencyNthDayType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.repaymentFrequencyNthDayType;
                            $scope.showRepaymentFrequencyDayOfWeekType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.repaymentFrequencyDayOfWeekType;
                            $scope.showBrokenPeriodType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.brokenPeriodMethodType;
                        }

                        resourceFactory.loanResource.get($scope.inparams, function (data) {
                                $scope.paymentModeOptions = data.paymentModeOptions;
                                $scope.products = data.productOptions;
                                if(data.interestRatesListPerPeriod != undefined && data.interestRatesListPerPeriod.length > 0){
                                    $scope.interestRatesListPerPeriod = data.interestRatesListPerPeriod;
                                    $scope.interestRatesListAvailable = true;
                                }
                        });
                         //on loan product change
                $scope.loanProductChange = function (loanProductId) {
                    $scope.inparams.productId = loanProductId;
                    $scope.interestRatesListPerPeriod = [];
                    $scope.interestRatesListAvailable = false;
                    $scope.charges = [];
                    $scope.inparams.fetchRDAccountOnly = scope.response.uiDisplayConfigurations.loanAccount.savingsAccountLinkage.reStrictLinkingToRDAccount;
                    resourceFactory.loanResource.get($scope.inparams, function (data) {
                        $scope.loanaccountinfo = data;

                        $scope.canDisburseToGroupBankAccounts = data.product.allowDisbursementToGroupBankAccounts;
                        $scope.productLoanCharges = data.product.charges || [];
                        if($scope.productLoanCharges && $scope.productLoanCharges.length > 0){
                            for(var i in $scope.productLoanCharges){
                                if($scope.productLoanCharges[i].chargeData){
                                    for(var j in $scope.loanaccountinfo.chargeOptions){
                                        if($scope.productLoanCharges[i].chargeData.id == $scope.loanaccountinfo.chargeOptions[j].id){
                                                var charge = $scope.productLoanCharges[i].chargeData;
                                                charge.chargeId = charge.id;
                                                charge.isMandatory = $scope.productLoanCharges[i].isMandatory;
                                                charge.isAmountNonEditable = $scope.productLoanCharges[i].isAmountNonEditable;
                                                if(charge.chargeCalculationType.value == $scope.slabBasedCharge && charge.slabs.length > 0){
                                                    for(var i in charge.slabs) {
                                                        var slabBasedValue = $scope.getSlabBasedAmount(charge.slabs[i],$scope.loanAccountFormData.principal,$scope.loanAccountFormData.numberOfRepayments);
                                                        if(slabBasedValue != null){
                                                            charge.amount = slabBasedValue;
                                                        }
                                                    }
                                                }
                                                $scope.charges.push(charge);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        
                        if ($scope.loanaccountinfo.loanOfficerOptions != undefined && $scope.loanaccountinfo.loanOfficerOptions.length > 0 && !$scope.loanAccountFormData.loanOfficerId) {
                            resourceFactory.clientResource.get({clientId: $scope.clientId}, function (data) {
                                if (data.staffId != null) {
                                    for (var i in $scope.loanaccountinfo.loanOfficerOptions) {
                                        if ($scope.loanaccountinfo.loanOfficerOptions[i].id == data.staffId) {
                                            $scope.loanAccountFormData.loanOfficerId = data.staffId;
                                            break;
                                        }
                                    }
                                }
                            });
                        }
    
                        if(data.interestRatesListPerPeriod != undefined && data.interestRatesListPerPeriod.length > 0){
                        $scope.interestRatesListPerPeriod = data.interestRatesListPerPeriod;
                        $scope.interestRatesListAvailable = true;
                        }
                    });
                }

                $scope.newLoanAccountSubmit = function () {
                    // Make sure charges, overdue charges and collaterals are empty before initializing.
                    delete $scope.loanAccountFormData.charges;
                    var reqFirstDate = dateFilter($scope.date.first, scope.df);
                    var reqSecondDate = dateFilter($scope.date.second, scope.df);
                    var reqThirdDate = dateFilter($scope.date.third, scope.df);
                    var reqFourthDate = dateFilter($scope.date.fourth, scope.df);
                    var reqFifthDate = dateFilter($scope.date.fifth, scope.df);
                    $scope.loanAccountFormData.loanTermFrequency = $scope.loanTerm;
                    if ($scope.charges.length > 0) {
                        $scope.loanAccountFormData.charges = [];
                        for (var i in $scope.charges) {
                            if ($scope.charges[i].amount > 0) {
                                $scope.loanAccountFormData.charges.push({
                                    chargeId: $scope.charges[i].chargeId,
                                    amount: $scope.charges[i].amount,
                                    dueDate: dateFilter($scope.charges[i].dueDate, scope.df),
                                    upfrontChargesAmount: $scope.charges[i].glims
                                });
                            }
                        }
                    }
    
                    if ($scope.loanaccountinfo.overdueCharges && $scope.loanaccountinfo.overdueCharges.length > 0) {
                        $scope.loanAccountFormData.overdueCharges = [];
                        for (var i in $scope.loanaccountinfo.overdueCharges) {
                            if ($scope.loanaccountinfo.overdueCharges[i].chargeData.amount > 0) {
                                $scope.loanAccountFormData.overdueCharges.push({
                                    productChargeId: $scope.loanaccountinfo.overdueCharges[i].id,
                                    amount: $scope.loanaccountinfo.overdueCharges[i].chargeData.amount
                                });
                            }
                        }
                    }
    
                    if ($scope.temp.syncRepaymentsWithMeeting) {
                        $scope.loanAccountFormData.calendarId = $scope.loanaccountinfo.calendarOptions[0].id;
                    }
                    $scope.loanAccountFormData.interestChargedFromDate = reqThirdDate;
                    $scope.loanAccountFormData.repaymentsStartingFromDate = reqFourthDate;
                    $scope.loanAccountFormData.locale = scope.optlang.code;
                    $scope.loanAccountFormData.dateFormat = scope.df;
                    $scope.loanAccountFormData.loanType = $scope.inparams.templateType;
                    $scope.loanAccountFormData.expectedDisbursementDate = reqSecondDate;
                    $scope.loanAccountFormData.submittedOnDate = reqFirstDate;
                    $scope.loanAccountFormData.recalculationRestFrequencyStartDate = dateFilter($scope.recalculationRestFrequencyStartDate, scope.df);
                    $scope.loanAccountFormData.recalculationCompoundingFrequencyStartDate = dateFilter($scope.recalculationCompoundingFrequencyStartDate, scope.df);
                    
                    if ($scope.date.recalculationRestFrequencyDate) {
                        var restFrequencyDate = dateFilter($scope.date.recalculationRestFrequencyDate, scope.df);
                        $scope.loanAccountFormData.recalculationRestFrequencyDate = restFrequencyDate;
                    }
                    if ($scope.date.recalculationCompoundingFrequencyDate) {
                        var restFrequencyDate = dateFilter($scope.date.recalculationCompoundingFrequencyDate, scope.df);
                        $scope.loanAccountFormData.recalculationCompoundingFrequencyDate = restFrequencyDate;
                    }
                    if($scope.loanAccountFormData.interestCalculationPeriodType == 0){
                        $scope.loanAccountFormData.allowPartialPeriodInterestCalcualtion = false;
                    }
                    if($scope.loanAccountFormData.repaymentFrequencyType == 2 && $scope.loanAccountFormData.repaymentFrequencyNthDayType){
                        $scope.loanAccountFormData.repeatsOnDayOfMonth = $scope.selectedOnDayOfMonthOptions;
                    }else{
                        $scope.loanAccountFormData.repeatsOnDayOfMonth = [];
                    }
    
                    if(!$scope.loanaccountinfo.isLoanProductLinkedToFloatingRate) {
                        delete $scope.loanAccountFormData.interestRateDifferential ;
                        delete $scope.loanAccountFormData.isFloatingInterestRate;
                    }
                    else{
                        if($scope.loanAccountFormData.interestRatePerPeriod != undefined){
                            delete $scope.loanAccountFormData.interestRatePerPeriod;
                        }
                    }
    
                    resourceFactory.loanResource.save($scope.loanAccountFormData, function (data) {
                        $scope.showLoanAccountForm = false;
                    });
                };

                $scope.closeLoanAccountForm = function () {
                    $scope.showLoanAccountForm = false;
                    $modalInstance.dismiss('closeLoanAccountForm');
                }
                $scope.close = function () {
                    $modalInstance.dismiss('close');
                };
            }

            //client reject reason call
            scope.clientRejection = function (memberId) {
                $modal.open({
                    templateUrl: 'views/task/popup/clientreject.html',
                    controller: clientRejectionCtrl,
                    windowClass: 'modalwidth700',
                    resolve: {
                        memberParams: function () {
                            return { 'memberId': memberId };
                        }
                    }
                });
            }
            var clientRejectionCtrl = function ($scope, $modalInstance, memberParams) {

                $scope.error = null;
                $scope.rejectFormData = {};
                $scope.values = [];

                resourceFactory.codeHierarchyResource.get({codeName: 'Reject Reason'}, function (data) {
                $scope.codes = data;
                });

                $scope.cancelReject = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.submitReject = function () {
                    if((!$scope.rejectFormData.reasonCode) || !$scope.rejectFormData.description) {
                        $scope.error = 'Specify Rejection Reason';
                        return false;
                    }

                    resourceFactory.taskExecutionResource.doAction({taskId:scope.taskData.id,action:'reject'},$scope.rejectFormData, function (data) {
                        $modalInstance.close('reject');
                        $route.reload();
                    });
                };

                $scope.getDependentCodeValues = function(codeName){
                    $scope.values = $scope.codes[$scope.codes.findIndex(x => x.name == codeName)].values;
                };

                $scope.initDescription = function(reasonId){
                    if(scope.isRejectDescriptionMandatory && $scope.values[$scope.values.findIndex(x => x.id == reasonId)].description === 'Others'){
                        $scope.displayDescription = true; 
                    }else{
                        $scope.displayDescription = false;
                    }
                };
            }

            scope.groupRejection = function (memberId) {
                $modal.open({
                    templateUrl: 'views/task/popup/groupreject.html',
                    controller: groupRejectionCtrl,
                    windowClass: 'modalwidth700',
                    resolve: {
                        memberParams: function () {
                            return { 'memberId': memberId };
                        }
                    }
                });
            }
            var groupRejectionCtrl = function ($scope, $modalInstance, memberParams) {

                $scope.error = null;
                $scope.rejectFormData = {};
                $scope.values = [];

                resourceFactory.codeHierarchyResource.get({codeName: 'Reject Reason'}, function (data) {
                $scope.codes = data;
                });

                $scope.cancelReject = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.submitReject = function () {
                    if((!$scope.rejectFormData.reasonCode) || !$scope.rejectFormData.description) {
                        $scope.error = 'Specify Rejection Reason';
                        return false;
                    }

                    resourceFactory.taskExecutionResource.doAction({taskId:scope.taskData.id,action:'reject'},$scope.rejectFormData, function (data) {
                        $modalInstance.close('reject');
                        $route.reload();
                    });
                };

                $scope.getDependentCodeValues = function(codeName){
                    $scope.values = $scope.codes[$scope.codes.findIndex(x => x.name == codeName)].values;
                };

                $scope.initDescription = function(reasonId){
                    if(scope.isRejectDescriptionMandatory && $scope.values[$scope.values.findIndex(x => x.id == reasonId)].description === 'Others'){
                        $scope.displayDescription = true; 
                    }else{
                        $scope.displayDescription = false;
                    }
                };
            }
            
        }
     }
    });
    mifosX.ng.application.controller('BulkLoanApplicationActivityController', ['$controller', '$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter', 'ngXml2json', '$route', '$http', '$rootScope', '$sce', 'CommonUtilService', '$route', '$upload', 'API_VERSION', mifosX.controllers.BulkLoanApplicationActivityController]).run(function ($log) {
        $log.info("BulkLoanApplicationActivityController initialized");
    });
}(mifosX.controllers || {}));