(function (module) {
    mifosX.controllers = _.extend(module, {
        BulkJlgLoanApplicationActivityController: function ($controller, scope, routeParams, $modal, resourceFactory, location, dateFilter, ngXml2json, route, $http, $rootScope, $sce, CommonUtilService, $route, $upload, API_VERSION) {
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
                    windowClass: 'app-modal-window',
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

                //loan account
                if(memberParams.activeClientMember.loanAccountBasicData){
                    $scope.loanAccountData = memberParams.activeClientMember.loanAccountBasicData;
                    $scope.isLoanAccountExist = true;
                }
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

                $scope.updateSlabBasedAmountOnChangePrincipalOrRepaymentForEmiPack = function(){
                    if($scope.loanAccountFormData.loanEMIPackId != undefined){
                        for(var i in $scope.loanaccountinfo.loanEMIPacks){
                            if($scope.loanaccountinfo.loanEMIPacks[i].id == $scope.loanAccountFormData.loanEMIPackId){
                                var loanAmountRequested = $scope.loanaccountinfo.loanEMIPacks[i].sanctionAmount;
                                var numberOfRepayments = $scope.loanaccountinfo.loanEMIPacks[i].numberOfRepayments;
                                $scope.updateSlabBasedAmountChargeAmount(loanAmountRequested , numberOfRepayments);
                                break;
                            }
                        }
                    }
                }

                $scope.updateSlabBasedAmountChargeAmount = function(loanAmountRequested, numberOfRepayments){
                    if(loanAmountRequested != '' && loanAmountRequested != undefined && numberOfRepayments != '' && numberOfRepayments != undefined){
                        for(var i in $scope.charges){
                            if($scope.charges[i].chargeCalculationType.value == $scope.slabBasedCharge && $scope.charges[i].slabs.length > 0) {
                                    for(var j in $scope.charges[i].slabs){
                                        var slabBasedValue = $scope.getSlabBasedAmount($scope.charges[i].slabs[j],loanAmountRequested,numberOfRepayments);
                                        if(slabBasedValue != null) {
                                            $scope.charges[i].amount = slabBasedValue;
                                            break;
                                        } else {
                                            $scope.charges[i].amount = undefined;
                                        }
                                    }
                            }
                        }
                    }
                }
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
                            })
                        }
    
                        if(data.interestRatesListPerPeriod != undefined && data.interestRatesListPerPeriod.length > 0){
                        $scope.interestRatesListPerPeriod = data.interestRatesListPerPeriod;
                        $scope.interestRatesListAvailable = true;
                        }
                    });
    
                }

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
    
                    if ($scope.loanAccountFormData.disbursementData.length > 0) {
                        for (var i in $scope.loanAccountFormData.disbursementData) {
                            $scope.loanAccountFormData.disbursementData[i].expectedDisbursementDate = dateFilter($scope.loanAccountFormData.disbursementData[i].expectedDisbursementDate, scope.df);
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
                        $scope.getClientAccounts();
                    });
                };

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
                windowClass: 'app-modal-window',
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
                }
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
    });
    mifosX.ng.application.controller('BulkJlgLoanApplicationActivityController', ['$controller', '$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter', 'ngXml2json', '$route', '$http', '$rootScope', '$sce', 'CommonUtilService', '$route', '$upload', 'API_VERSION', mifosX.controllers.BulkJlgLoanApplicationActivityController]).run(function ($log) {
        $log.info("BulkJlgLoanApplicationActivityController initialized");
    });
}(mifosX.controllers || {}));