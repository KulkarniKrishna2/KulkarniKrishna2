(function (module) {
    mifosX.controllers = _.extend(module, {
        BulkLoanApplicationActivityController: function ($controller, scope, routeParams, $modal, resourceFactory, location, dateFilter, ngXml2json, route, $http, $rootScope, $sce, CommonUtilService, $route, $upload, API_VERSION) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));

            function initTask() {
                scope.$parent.clientsCount();
                scope.centerId = scope.taskconfig.centerId;
                scope.taskInfoTrackArray = [];
                scope.chargesCategory = [];
                scope.isLoanPurposeEditable= true;
                scope.isAllClientFinishedThisTask = true;
                resourceFactory.centerWorkflowResource.get({ centerId: scope.centerId, eventType : scope.eventType, associations: 'groupMembers,profileratings,loanaccounts,clientcbcriteria' }, function (data) {
                    scope.centerDetails = data;
                    scope.rejectTypes = data.rejectTypes;
                    scope.clientClosureReasons = data.clientClosureReasons;
                    scope.groupClosureReasons = data.groupClosureReasons;
                    scope.centerDetails.isAllChecked = false;
                    //logic to disable and highlight member
                    for(var i = 0; i < scope.centerDetails.subGroupMembers.length; i++){
                        if(scope.centerDetails.subGroupMembers[i].memberData){
                            for(var j = 0; j < scope.centerDetails.subGroupMembers[i].memberData.length; j++){

                                var clientLevelTaskTrackObj =  scope.centerDetails.subGroupMembers[i].memberData[j].clientLevelTaskTrackingData;
                                var clientLevelCriteriaObj =  scope.centerDetails.subGroupMembers[i].memberData[j].clientLevelCriteriaResultData;
                                scope.centerDetails.subGroupMembers[i].memberData[j].allowLoanRejection = false;
                                scope.centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = false;
                                if(clientLevelTaskTrackObj == undefined || clientLevelTaskTrackObj == null){
                                    if (scope.eventType && scope.eventType == 'create') {
                                        scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
                                    } else {
                                        scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = false;
                                    }
                                    scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-none";
                                }else if(clientLevelTaskTrackObj != undefined && clientLevelCriteriaObj != undefined){
                                    if(scope.taskData.id != clientLevelTaskTrackObj.currentTaskId){
                                        if(clientLevelCriteriaObj.score == 5){
                                            scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
                                            scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-grey";
                                        }else if(clientLevelCriteriaObj.score >= 0 && clientLevelCriteriaObj.score <= 4){
                                            scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
                                            scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-red";
                                        }
                                    }else if(scope.taskData.id == clientLevelTaskTrackObj.currentTaskId){
                                        if(clientLevelCriteriaObj.score == 5){
                                            scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = false;
                                            scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-grey";
                                            scope.isAllClientFinishedThisTask = false;
                                        }else if(clientLevelCriteriaObj.score >= 0 && clientLevelCriteriaObj.score <= 4){
                                            scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = false;
                                            scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-red";
                                            scope.isAllClientFinishedThisTask = false;
                                        }
                                    }
                                }else if(clientLevelTaskTrackObj != undefined && (clientLevelCriteriaObj == undefined || clientLevelCriteriaObj == null)){
                                    if(scope.taskData.id != clientLevelTaskTrackObj.currentTaskId){
                                        scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
                                        scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-grey";
                                    }
                                    if(scope.taskData.id == clientLevelTaskTrackObj.currentTaskId){
                                        scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = false;
                                        scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-none";
                                        scope.isAllClientFinishedThisTask = false;
                                    }
                                }
                            }
                        }

                    }
                });

            };
            initTask();
            scope.filterCharges = function (chargeData,categoryId) {
                if (chargeData != undefined) {
                    var chargesCategory = _.groupBy(chargeData, function (value) {
                        return value.chargeCategoryType.id;
                    });
                    return chargesCategory[categoryId];
                }
            }

            scope.openViewMemeberPopUp = function(groupId, activeClientMember){
                $modal.open({
                    templateUrl: 'views/task/popup/viewmember.html',
                    controller: ViewMemberCtrl,
                    backdrop: 'static',
                    windowClass: 'app-modal-window-full-screen',
                    size: 'lg',
                    resolve: {
                        memberParams: function () {
                            return { 'groupId': groupId, 'activeClientMember': activeClientMember };
                        }
                    }
                });
            }
            scope.openClientValidationPopUp = function(groupId, activeClientMember) {
                $modal.open({
                    templateUrl: 'clientvalidation.html',
                    controller: ClientValidationCtrl,
                    resolve: {
                        memberParams: function () {
                            return { 'groupId': groupId, 'activeClientMember': activeClientMember };
                        }
                    }
                });
            }
            var ClientValidationCtrl =  function($scope, $modalInstance,memberParams){
				$scope.df = scope.df;
                $scope.confirm = function () {
                    $modalInstance.dismiss('cancel');
                    scope.openViewMemeberPopUp(memberParams.groupId, memberParams.activeClientMember);
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }
            scope.viewMemberDetails = function (groupId, activeClientMember) {
                if(activeClientMember.subStatus && activeClientMember.subStatus.code === "clientSubStatusType.blacklist"){
                    scope.openClientValidationPopUp(groupId, activeClientMember);
                }else{
                    scope.openViewMemeberPopUp(groupId, activeClientMember);
                }

            }

            var ViewMemberCtrl = function ($scope, $modalInstance, memberParams) {
                $scope.regexFormats = scope.regexFormats;
				$scope.df = scope.df;
                $scope.clientId = memberParams.activeClientMember.id;
                $scope.groupId = memberParams.groupId;
                $scope.showaddressform = true;
                $scope.shownidentityform = true;
                $scope.shownFamilyMembersForm = true;
                $scope.showLoanAccountForm = true;
                $scope.showLoanProductList = false;
                $scope.isLoanAccountExist = false;
                $scope.showOnlyLoanTab = false;
                $scope.showDeleteClientIdentifierAction = false;

                //loan account
                if (memberParams.activeClientMember.loanAccountBasicData) {
                    $scope.loanAccountData = memberParams.activeClientMember.loanAccountBasicData;
                    $scope.isLoanAccountExist = true;
                }

                $scope.close = function () {
                    $modalInstance.dismiss('close');
                    initTask();
                };
                $scope.closeLoanAccountForm = function () {
                    $scope.showLoanProductList = false;
                    $scope.isLoanAccountExist = false;
                }

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

                $scope.getLoanAccountFormDetails = function () {
                    $scope.showLoanProductList = true;
                    $scope.isLoanAccountExist = true;
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
                    $scope.isCenter = false;
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
                    $scope.inparams = { resourceType: 'template', activeOnly: 'true' };
                    $scope.inparams.clientId = $scope.clientId;
                    $scope.loanAccountFormData.clientId = $scope.clientId;
                    $scope.inparams.groupId = $scope.groupId;
                    $scope.loanAccountFormData.groupId = $scope.groupId;
                    $scope.inparams.templateType = 'jlg';
                    $scope.inparams.staffInSelectedOfficeOnly = true;
                    $scope.inparams.productApplicableForLoanType = 2;
                    $scope.inparams.entityType = 1;
                    $scope.inparams.entityId = $scope.clientId;

                    if (scope.response && scope.response.uiDisplayConfigurations.loanAccount) {

                        $scope.showExternalId = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.externalId;
                        $scope.extenalIdReadOnlyType = scope.response.uiDisplayConfigurations.loanAccount.isReadOnlyField.externalId;
                        $scope.showRepaymentFrequencyNthDayType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.repaymentFrequencyNthDayType;
                        $scope.showRepaymentFrequencyDayOfWeekType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.repaymentFrequencyDayOfWeekType;
                        $scope.showBrokenPeriodType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.brokenPeriodMethodType;
                    }

                    resourceFactory.loanResource.get($scope.inparams, function (data) {
                        $scope.paymentModeOptions = data.paymentModeOptions;
                        $scope.products = data.productOptions;
                        if (data.interestRatesListPerPeriod != undefined && data.interestRatesListPerPeriod.length > 0) {
                            $scope.interestRatesListPerPeriod = data.interestRatesListPerPeriod;
                            $scope.interestRatesListAvailable = true;
                        }
                    });
                }

                $scope.updateSlabBasedChargeForEmiPack = function (loanEMIPack) {
                    if (loanEMIPack) {
                        $scope.loanAccountFormData.principal = loanEMIPack.sanctionAmount;
                        $scope.loanAccountFormData.numberOfRepayments = loanEMIPack.numberOfRepayments;
                        $scope.updateSlabBasedAmountOnChangePrincipalOrRepayment();
                    }
                }

                $scope.updateSlabBasedAmountOnChangePrincipalOrRepayment = function () {
                    if ($scope.loanAccountFormData.principal != '' && $scope.loanAccountFormData.principal != undefined && $scope.loanAccountFormData.numberOfRepayments != '' && $scope.loanAccountFormData.numberOfRepayments != undefined) {
                        for (var i in $scope.charges) {
                            if (($scope.charges[i].chargeCalculationType.value == $scope.slabBasedCharge || $scope.charges[i].isSlabBased) && $scope.charges[i].slabs.length > 0) {
                                var slabBasedValue = $scope.getSlabBasedAmount($scope.charges[i].slabs, $scope.loanAccountFormData.principal, $scope.loanAccountFormData.numberOfRepayments);
                                if (slabBasedValue != null) {
                                    $scope.charges[i].amount = slabBasedValue;
                                } else {
                                    $scope.charges[i].amount = undefined;
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
                        if ($scope.productLoanCharges && $scope.productLoanCharges.length > 0) {
                            for (var i in $scope.productLoanCharges) {
                                if ($scope.productLoanCharges[i].chargeData) {
                                    for (var j in $scope.loanaccountinfo.chargeOptions) {
                                        if ($scope.productLoanCharges[i].chargeData.id == $scope.loanaccountinfo.chargeOptions[j].id) {
                                            var charge = $scope.productLoanCharges[i].chargeData;
                                            charge.chargeId = charge.id;
                                            charge.isMandatory = $scope.productLoanCharges[i].isMandatory;
                                            charge.isAmountNonEditable = $scope.productLoanCharges[i].isAmountNonEditable;
                                            if (charge.chargeCalculationType.value == $scope.slabBasedCharge && charge.slabs.length > 0) {
                                                var slabBasedValue = $scope.getSlabBasedAmount(charge.slabs, $scope.loanAccountFormData.principal, $scope.loanAccountFormData.numberOfRepayments);
                                                if (slabBasedValue != null) {
                                                    charge.amount = slabBasedValue;
                                                }
                                            }
                                            charge.isShowDate = false;
                                            if(charge.chargeTimeType.code == 'chargeTimeType.specifiedDueDate'){
                                                charge.isShowDate = true;
                                            }
                                            $scope.charges.push(charge);
                                            break;
                                        }
                                    }
                                }
                            }
                        }

                        if ($scope.loanaccountinfo.loanOfficerOptions != undefined && $scope.loanaccountinfo.loanOfficerOptions.length > 0 && !$scope.loanAccountFormData.loanOfficerId) {
                            resourceFactory.clientResource.get({ clientId: $scope.clientId }, function (data) {
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

                        if (data.interestRatesListPerPeriod != undefined && data.interestRatesListPerPeriod.length > 0) {
                            $scope.interestRatesListPerPeriod = data.interestRatesListPerPeriod;
                            $scope.interestRatesListAvailable = true;
                        }

                    });
                    resourceFactory.loanPurposeGroupResource.getAll(function (data) {
                        $scope.loanPurposeGroups = data;
                    });
                }

                $scope.isChargeAmountNonEditable = function (charge) {
                    if ((charge.chargeCalculationType.value == 'slabBasedCharge') || charge.isAmountNonEditable || charge.isSlabBased) {
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
                        if ($scope.loanaccountinfo.fundOptions) {
                            for (var i in $scope.loanaccountinfo.fundOptions) {
                                if ($scope.loanaccountinfo.fundOptions[i].id == scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.fundId) {
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
                    } else {
                        $scope.loanAccountFormData.brokenPeriodMethodType = "";
                    }

                    if ($scope.loanaccountinfo.isInterestRecalculationEnabled && $scope.loanaccountinfo.interestRecalculationData.recalculationRestFrequencyDate) {
                        $scope.date.recalculationRestFrequencyDate = new Date($scope.loanaccountinfo.interestRecalculationData.recalculationRestFrequencyDate);
                    }
                    if ($scope.loanaccountinfo.isInterestRecalculationEnabled && $scope.loanaccountinfo.interestRecalculationData.recalculationCompoundingFrequencyDate) {
                        $scope.date.recalculationCompoundingFrequencyDate = new Date($scope.loanaccountinfo.interestRecalculationData.recalculationCompoundingFrequencyDate);
                    }

                    if ($scope.loanaccountinfo.isLoanProductLinkedToFloatingRate) {
                        $scope.loanAccountFormData.isFloatingInterestRate = false;
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
                                    var slabBasedValue = $scope.getSlabBasedAmount(data.slabs, $scope.loanAccountFormData.principal, $scope.loanAccountFormData.numberOfRepayments);
                                    if (slabBasedValue != null) {
                                        data.amount = slabBasedValue;
                                    }else{
                                        data.amount = undefined;
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

                $scope.inRange = function (min, max, value) {
                    return (value >= min && value <= max);
                };

                $scope.getSlabBasedAmount = function (slabs, amount, repayment) {
                    if(slabs){
                        for(var j in slabs){
                            var slab = slabs[j];
                            var slabValue = 0;
                            slabValue = (slab.type.id == $scope.installmentAmountSlabChargeType) ? amount : repayment;
                            var subSlabvalue = 0;
                            subSlabvalue = (slab.type.id != $scope.installmentAmountSlabChargeType) ? amount : repayment;
                            //check for if value fall in slabs
                            if ($scope.inRange(slab.minValue, slab.maxValue, slabValue)) {

                                if (slab.subSlabs != undefined && slab.subSlabs.length > 0) {
                                    for (var i in slab.subSlabs) {
                                        //check for sub slabs range
                                        if ($scope.inRange(slab.subSlabs[i].minValue, slab.subSlabs[i].maxValue, subSlabvalue)) {
                                            return slab.subSlabs[i].amount;
                                        }
                                    }

                                }
                                return slab.amount;
                            }
                        }
                        
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
                            if ($scope.charges[i].amount > 0 || $scope.charges[i].isSlabBased) {
                                $scope.loanAccountFormData.charges.push({
                                    chargeId: $scope.charges[i].chargeId,
                                    amount: $scope.charges[i].amount,
                                    upfrontChargesAmount: $scope.charges[i].glims
                                });
                                if(!_.isUndefined($scope.charges[i].dueDate)){
                                    $scope.loanAccountFormData.charges.push({
                                        dueDate: dateFilter($scope.charges[i].dueDate, scope.df)
                                    });
                                }
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
                    if ($scope.loanAccountFormData.interestCalculationPeriodType == 0) {
                        $scope.loanAccountFormData.allowPartialPeriodInterestCalcualtion = false;
                    }
                    if ($scope.loanAccountFormData.repaymentFrequencyType == 2 && $scope.loanAccountFormData.repaymentFrequencyNthDayType) {
                        $scope.loanAccountFormData.repeatsOnDayOfMonth = $scope.selectedOnDayOfMonthOptions;
                    } else {
                        $scope.loanAccountFormData.repeatsOnDayOfMonth = [];
                    }

                    if (!$scope.loanaccountinfo.isLoanProductLinkedToFloatingRate) {
                        delete $scope.loanAccountFormData.interestRateDifferential;
                        delete $scope.loanAccountFormData.isFloatingInterestRate;
                    }
                    else {
                        if ($scope.loanAccountFormData.interestRatePerPeriod != undefined) {
                            delete $scope.loanAccountFormData.interestRatePerPeriod;
                        }
                    }

                    resourceFactory.loanResource.save($scope.loanAccountFormData, function (data) {
                        $scope.clientJlgLoanAccount();
                        if(data.loanId){
                            $scope.closeLoanAccountForm();
                        }
                        
                    });
                };

                $scope.clientJlgLoanAccount = function () {
                    $scope.type = 'jlg';
                    resourceFactory.clientJlgLoanAccount.get({ type: $scope.type, clientId: $scope.clientId, groupId: $scope.groupId }, function (data) {
                        $scope.loanAccountData = data;
                        $scope.isLoanAccountExist = true;
                        $scope.showLoanAccountForm = true;
                        $scope.showLoanProductList = false;
                    });

                    if (scope.response && scope.response.uiDisplayConfigurations.loanAccount.isAutoPopulate.interestChargedFromDate) {
                        scope.$watch('date.second ', function () {
                            if ($scope.date.second != '' && $scope.date.second != undefined) {
                                $scope.date.third = $scope.date.second;
                            }
                        });
                    }

                    $scope.closeLoanAccountForm = function () {
                        $scope.showLoanAccountForm = false;
                    }
                };
                $scope.onLoanPurposeGroupChange = function (loanPurposegroupId) {
                    $scope.loanAccountFormData.loanPurposeId = undefined;
                    $scope.isLoanPurpose = false;
                    if(loanPurposegroupId){
                        resourceFactory.loanPurposeGroupResource.get({
                            loanPurposeGroupsId: loanPurposegroupId, isFetchLoanPurposeDatas : 'true'
                        }, function (data) {
                            $scope.loanPurposeOptions = data.loanPurposeDatas;
                            $scope.isLoanPurpose = true;
                        });
                        
                    }else{
                        $scope.loanPurposeOptions = [];
                    }
                    
                    
                }
            }

            //lona account edit 

            scope.editLoan = function (loanAccountBasicData, groupId) {
                $modal.open({
                    templateUrl: 'views/task/popup/editLoan.html',
                    controller: editLoanCtrl,
                    backdrop: 'static',
                    windowClass: 'app-modal-window-full-screen',
                    size: 'lg',
                    resolve: {
                        memberParams: function () {
                            return { 'groupId': groupId, 'loanAccountBasicData': loanAccountBasicData };
                        }
                    }
                });
            }

            var editLoanCtrl = function ($scope, $modalInstance, memberParams) {
                $scope.df = scope.df;
                $scope.showLoanAccountForm = true;
                $scope.editLoanAccountdata = {};
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
                $scope.isCenter = false;
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
                $scope.inparams = { resourceType: 'template', activeOnly: 'true' };
                $scope.inparams.clientId = $scope.clientId;
                $scope.loanAccountFormData.clientId = $scope.clientId;
                $scope.inparams.groupId = $scope.groupId;
                $scope.loanAccountFormData.groupId = $scope.groupId;
                $scope.inparams.templateType = 'jlg';
                $scope.inparams.staffInSelectedOfficeOnly = true;
                $scope.inparams.productApplicableForLoanType = 2;
                $scope.inparams.entityType = 1;
                $scope.inparams.entityId = $scope.clientId;
                $scope.formData = {};
                $scope.isEmiAmountEditable= true;
                if($scope.loanAccountData.loanPurposeId) {
                    resourceFactory.loanPurposeGroupResource.getAll({isFetchLoanPurposeDatas: 'true'}, function (loanPurposeGroupsdata) {
                        $scope.loanPurposeGroups = loanPurposeGroupsdata;
                        $scope.getParentLoanPurpose($scope.editLoanAccountdata.loanPurposeId);
                    });
                }

                if (scope.response && scope.response.uiDisplayConfigurations.loanAccount) {

                    $scope.showExternalId = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.externalId;
                    $scope.extenalIdReadOnlyType = scope.response.uiDisplayConfigurations.loanAccount.isReadOnlyField.externalId;
                    $scope.showRepaymentFrequencyNthDayType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.repaymentFrequencyNthDayType;
                    $scope.showRepaymentFrequencyDayOfWeekType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.repaymentFrequencyDayOfWeekType;
                    $scope.showBrokenPeriodType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.brokenPeriodMethodType;
                }

                resourceFactory.loanResource.get($scope.inparams, function (data) {
                    $scope.paymentModeOptions = data.paymentModeOptions;
                    $scope.products = data.productOptions;
                    if (data.interestRatesListPerPeriod != undefined && data.interestRatesListPerPeriod.length > 0) {
                        $scope.interestRatesListPerPeriod = data.interestRatesListPerPeriod;
                        $scope.interestRatesListAvailable = true;
                    }
                });

                $scope.previewClientLoanAccInfo = function (refreshLoanCharges) {
                    if ( _.isUndefined(refreshLoanCharges)) {
                        refreshLoanCharges = false; }
                    $scope.previewRepayment = false;
                    for (var i in $scope.loanaccountinfo.charges) {
                        if ($scope.loanaccountinfo.charges[i].dueDate) {
                            if($scope.loanaccountinfo.charges[i].chargeTimeType.value == "Disbursement" ||
                                $scope.loanaccountinfo.charges[i].chargeTimeType.value == "Tranche Disbursement"){
                                $scope.loanaccountinfo.charges[i].dueDate = null;
                            }else{
                                $scope.loanaccountinfo.charges[i].dueDate = new Date($scope.loanaccountinfo.charges[i].dueDate);
                            }

                        }
                        if($scope.loanaccountinfo.charges[i].chargeCalculationType.value == $scope.slabBasedCharge) {
                            $scope.loanaccountinfo.charges[i] = $scope.updateChargeForSlab($scope.loanaccountinfo.charges[i]);                        
                        }
                    }
                    $scope.charges = $scope.loanaccountinfo.charges || [];
                    if(refreshLoanCharges){
                        $scope.charges = [];
                    }
                    $scope.productLoanCharges = $scope.loanaccountinfo.product.charges || [];

                    if($scope.productLoanCharges && $scope.productLoanCharges.length > 0){
                        for(var i in $scope.productLoanCharges){
                            if($scope.productLoanCharges[i].chargeData && !$scope.productLoanCharges[i].chargeData.penalty){
                                var isChargeAdded = false;
                                var loanChargeAmount = 0;
                                for(var j in scope.charges){
                                    if($scope.productLoanCharges[i].chargeData.id == $scope.charges[j].chargeId){
                                        $scope.charges[j].isMandatory = $scope.productLoanCharges[i].isMandatory;
                                        $scope.charges[j].isAmountNonEditable = $scope.productLoanCharges[i].isAmountNonEditable;
                                        isChargeAdded = true;
                                        loanChargeAmount = $scope.charges[j].amountOrPercentage;
                                        break;
                                    }
                                }

                                if((refreshLoanCharges &&  $scope.productLoanCharges[i].chargeData.penalty == false)  || (isChargeAdded == false &&  $scope.productLoanCharges[i].isMandatory == true)){
                                    var charge = $scope.productLoanCharges[i].chargeData;
                                    charge.chargeId = charge.id;
                                    charge.id = null;
                                    if(isChargeAdded){
                                        charge.amountOrPercentage = loanChargeAmount;
                                    }else{
                                        charge.amountOrPercentage = charge.amount;
                                    }                                    
                                    charge.isMandatory = $scope.productLoanCharges[i].isMandatory;
                                    charge.isAmountNonEditable = $scope.productLoanCharges[i].isAmountNonEditable;
                                    if(charge.chargeCalculationType.value == scope.slabBasedCharge){
                                        var slabBasedValue = $scope.getSlabBasedAmount(charge.slabs,$scope.editLoanAccountdata.principal,$scope.editLoanAccountdata.numberOfRepayments);
                                            if(slabBasedValue != null){
                                                charge.amountOrPercentage = slabBasedValue;
                                            }
                                    }
                                    $scope.charges.push(charge);
                                }

                            }

                        }

                    }
                    
                }

                $scope.inRange = function(min,max,value){
                    return (value>=min && value<=max);
                };

                $scope.getSlabBasedAmount = function(slabs, amount , repayment){
                    if(slabs){
                        for(var j in slabs){
                            var slab = slabs[j];
                            var slabValue = amount;
                            if(slab.type.id != 1){
                                slabValue = repayment;
                            }
                            var subSlabvalue = 0;
                            if(slab.type.id != $scope.installmentAmountSlabChargeType){
                                subSlabvalue = amount;
                            }else{
                                subSlabvalue = repayment;
                            }
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
                        }
                    }
                    
                    return null;

                };

                    $scope.updateSlabBasedCharges = function(){    
                        if($scope.editLoanAccountdata.principal != '' && $scope.editLoanAccountdata.principal != undefined){
                            for(var i in $scope.charges){
                                if($scope.charges[i].chargeCalculationType.value == $scope.slabBasedCharge || $scope.charges[i].isSlabBased) {
                                     $scope.charges[i] = $scope.updateChargeForSlab($scope.charges[i]);
                                }
                            }
                        }
                    };

                    $scope.deleteCharge = function (index) {
                        $scope.charges.splice(index, 1);
                    }

                     $scope.$watch('editLoanAccountdata.principal', function(){
                            $scope.updateSlabBasedCharges();
                        });

                    $scope.updateChargeForSlab = function(data){
                        if(data.isSlabBased || data.chargeCalculationType.value == $scope.slabBasedCharge){               
                            var slabBasedValue = $scope.getSlabBasedAmount(data.slabs, $scope.editLoanAccountdata.principal, $scope.editLoanAccountdata.numberOfRepayments);
                            if (slabBasedValue != null) {
                                data.amountOrPercentage = slabBasedValue;
                            } else {
                                data.amountOrPercentage = undefined;
                            }
                        }
                        return data;
                    }

                 $scope.addCharge = function () {
                    if ($scope.chargeFormData.chargeId) {
                    resourceFactory.chargeResource.get({chargeId: $scope.chargeFormData.chargeId, template: 'true'}, function (data) {
                            data.chargeId = data.id;
                            data.id = null;
                            data.amountOrPercentage = data.amount;
                            data.isMandatory = false;
                            data = $scope.updateChargeForSlab(data);
                            $scope.charges.push(data);
                            
                            $scope.chargeFormData.chargeId = undefined;
                        });
                    }
                } 
                $scope.isChargeAmountNonEditable = function (charge) {
                    if ((charge.chargeCalculationType.value == $scope.slabBasedCharge) || charge.isAmountNonEditable || charge.isSlabBased) {
                        return true;
                    }
                    return false;
                };
                //on loan product change
                $scope.loanProductChange = function (loanProductId) {
                    $scope.inparams.productId = loanProductId;
                    $scope.interestRatesListPerPeriod = [];
                    $scope.interestRatesListAvailable = false;
                    $scope.charges = [];
                    $scope.inparams.fetchRDAccountOnly = scope.response.uiDisplayConfigurations.loanAccount.savingsAccountLinkage.reStrictLinkingToRDAccount;
                    $scope.editLoanAccountdata.loanPurposeId = null;
                    $scope.formData.loanPurposeGroupId = null;
                    resourceFactory.loanResource.get($scope.inparams, function (data) {
                        $scope.loanaccountinfo = data;
                        var refreshLoanCharges  = true;
                        $scope.previewClientLoanAccInfo(refreshLoanCharges);
                        $scope.updateSlabBasedCharges();
                        $scope.canDisburseToGroupBankAccounts = data.product.allowDisbursementToGroupBankAccounts;
                        $scope.productLoanCharges = data.product.charges || [];
                        if ($scope.productLoanCharges && $scope.productLoanCharges.length > 0) {
                            for (var i in $scope.productLoanCharges) {
                                if ($scope.productLoanCharges[i].chargeData) {
                                    for (var j in $scope.loanaccountinfo.chargeOptions) {
                                        if ($scope.productLoanCharges[i].chargeData.id == $scope.loanaccountinfo.chargeOptions[j].id) {
                                            var charge = $scope.productLoanCharges[i].chargeData;
                                            charge.chargeId = charge.id;
                                            charge.isMandatory = $scope.productLoanCharges[i].isMandatory;
                                            charge.isAmountNonEditable = $scope.productLoanCharges[i].isAmountNonEditable;
                                            if ((charge.chargeCalculationType.value == $scope.slabBasedCharge || charge.isSlabBased) && charge.slabs.length > 0) {
                                                var slabBasedValue = $scope.getSlabBasedAmount(charge.slabs, $scope.loanAccountFormData.principal, $scope.loanAccountFormData.numberOfRepayments);
                                                    if (slabBasedValue != null) {
                                                        charge.amount = slabBasedValue;
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
                            resourceFactory.clientResource.get({ clientId: $scope.clientId }, function (data) {
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

                        if (data.interestRatesListPerPeriod != undefined && data.interestRatesListPerPeriod.length > 0) {
                            $scope.interestRatesListPerPeriod = data.interestRatesListPerPeriod;
                            $scope.interestRatesListAvailable = true;
                        }
                    });

                }

                 $scope.updateDataFromEmiPack = function(loanEMIPacks){
                    for(var i in loanEMIPacks){
                            if(loanEMIPacks[i].id==parseInt($scope.editLoanAccountdata.loanEMIPackId)){
                                $scope.editLoanAccountdata.fixedEmiAmount = loanEMIPacks[i].fixedEmi;
                                $scope.editLoanAccountdata.principal = loanEMIPacks[i].sanctionAmount;
                                $scope.editLoanAccountdata.repaymentEvery = loanEMIPacks[i].repaymentEvery;
                                $scope.editLoanAccountdata.repaymentFrequencyType = loanEMIPacks[i].repaymentFrequencyType.id;
                                $scope.editLoanAccountdata.numberOfRepayments = loanEMIPacks[i].numberOfRepayments;
                                $scope.editLoanAccountdata.repaymentEvery =  loanEMIPacks[i].repaymentEvery;
                                $scope.editLoanAccountdata.loanTermFrequencyType =  loanEMIPacks[i].repaymentFrequencyType.id;
                                $scope.editLoanAccountdata.loanTermFrequencyType =  loanEMIPacks[i].repaymentFrequencyType.id;
                                $scope.editLoanAccountdata.loanTermFrequency = parseInt(loanEMIPacks[i].repaymentEvery * $scope.editLoanAccountdata.numberOfRepayments);  
                                $scope.editLoanAccountdata.loanEMIPackId = parseInt($scope.editLoanAccountdata.loanEMIPackId);
                            }
                        }
                }

                $scope.updateChargesForEdit = function(){
                    if ($scope.charges.length > 0) {
                        $scope.editLoanAccountdata.charges = [];
                        for (var i in $scope.charges) {
                            if ($scope.charges[i].amountOrPercentage > 0 || $scope.charges[i].isSlabBased) {
                                $scope.editLoanAccountdata.charges.push({
                                    id: $scope.charges[i].id,
                                    chargeId: $scope.charges[i].chargeId,
                                    amount: $scope.charges[i].amountOrPercentage          
                                });
                                if(!_.isUndefined($scope.charges[i].dueDate)){
                                   $scope.editLoanAccountdata.charges.push({
                                        dueDate: dateFilter($scope.charges[i].dueDate, scope.df)
                                   }); 
                                }
                            }
                        }
                    }else{
                        $scope.editLoanAccountdata.charges  = undefined;
                    }
                };

                $scope.constructDataFromLoanAccountInfo = function(){
                    $scope.editLoanAccountdata.syncDisbursementWithMeeting = false;
                    $scope.editLoanAccountdata.createStandingInstructionAtDisbursement = false;
                    $scope.editLoanAccountdata.transactionProcessingStrategyId = $scope.loanaccountinfo.transactionProcessingStrategyId;
                    

                    $scope.editLoanAccountdata.amortizationType = $scope.loanaccountinfo.amortizationType.id;
                    $scope.editLoanAccountdata.isTopup = $scope.loanaccountinfo.isTopup;
                    $scope.editLoanAccountdata.deferPaymentsForHalfTheLoanTerm = $scope.loanaccountinfo.deferPaymentsForHalfTheLoanTerm;
                    $scope.editLoanAccountdata.interestType = $scope.loanaccountinfo.interestType.id;

                    $scope.editLoanAccountdata.interestCalculationPeriodType = $scope.loanaccountinfo.interestCalculationPeriodType.id;
                    $scope.editLoanAccountdata.allowPartialPeriodInterestCalcualtion = $scope.loanaccountinfo.allowPartialPeriodInterestCalcualtion;
                    if($scope.loanaccountinfo.clientId){
                        $scope.editLoanAccountdata.clientId = $scope.loanaccountinfo.clientId;
                    }                    
                    $scope.editLoanAccountdata.interestRatePerPeriod = $scope.loanaccountinfo.interestRatePerPeriod;
                      
                    $scope.editLoanAccountdata.interestCalculationPeriodType = $scope.loanaccountinfo.interestCalculationPeriodType.id;
                    $scope.editLoanAccountdata.allowPartialPeriodInterestCalcualtion = $scope.loanaccountinfo.allowPartialPeriodInterestCalcualtion;
                    if($scope.loanaccountinfo.clientId){
                        $scope.editLoanAccountdata.clientId = $scope.loanaccountinfo.clientId;
                    }                    
                    $scope.editLoanAccountdata.interestRatePerPeriod = $scope.loanaccountinfo.interestRatePerPeriod;
                };

                $scope.constructSubmitData = function(){
                    $scope.updateChargesForEdit();
                    if($scope.editLoanAccountdata.loanEMIPackId){
                        $scope.updateDataFromEmiPack($scope.loanaccountinfo.loanEMIPacks);
                    }
                    $scope.constructDataFromLoanAccountInfo();
                }

                $scope.EditLoanAccountSubmit = function () {
                    $scope.editLoanAccountdata.dateFormat = scope.df;  
                    $scope.editLoanAccountdata.locale = scope.optlang.code; 
                    var todaydate = dateFilter(new Date(),scope.df);                   
                    $scope.editLoanAccountdata.interestChargedFromDate = todaydate;
                    $scope.editLoanAccountdata.submittedOnDate = todaydate;
                   $scope.editLoanAccountdata.loanType = $scope.inparams.templateType = 'jlg';
                    $scope.editLoanAccountdata.expectedDisbursementDate = todaydate;                 
                    $scope.editLoanAccountdata.disbursementData = [];                    
                    $scope.constructSubmitData();
                    resourceFactory.loanResource.put({loanId: memberParams.loanAccountBasicData.id}, $scope.editLoanAccountdata, function (data) {
                        $scope.closeLoanAccountForm();
                        initTask();
                    });
                };

                $scope.closeLoanAccountForm = function () {
                    $scope.showLoanAccountForm = false;
                }

                $scope.getLoanData = function(loanId){
                    resourceFactory.loanResource.get({loanId: loanId, template: true, associations: 'charges,meeting',staffInSelectedOfficeOnly:true}, function (data) {
                        $scope.loanaccountinfo = data;
                        $scope.charges = data.charges;
                        for (var j in $scope.charges) {
                            var charge = $scope.charges[j];
                            if(!_.isUndefined(charge.dueDate)){
                                charge.dueDate = new Date(dateFilter(charge.dueDate, scope.df)); 
                            }
                            charge.isShowDate = false;
                            if (charge.chargeTimeType.code == 'chargeTimeType.specifiedDueDate') {
                                charge.isShowDate = true;
                            }
                        }
                    });
                }
                  

                $scope.constructFormData = function (data) {
                    $scope.editLoanAccountdata.productId = data.loanProductId;
                    $scope.editLoanAccountdata.loanPurposeId = data.loanPurposeId;
                    if(data.loanEMIPackData){
                        $scope.editLoanAccountdata.loanEMIPackId = data.loanEMIPackData.id;
                        $scope.editLoanAccountdata.principal = data.loanEMIPackData.sanctionAmount;
                        $scope.editLoanAccountdata.numberOfRepayments = data.loanEMIPackData.numberOfRepayments;
                    }
                    if($scope.editLoanAccountdata.loanPurposeId) {
                        resourceFactory.loanPurposeGroupResource.getAll({isFetchLoanPurposeDatas: 'true'}, function (loanPurposeGroupsdata) {
                            $scope.loanPurposeGroups = loanPurposeGroupsdata;
                            $scope.getParentLoanPurpose($scope.editLoanAccountdata.loanPurposeId);
                        });
                    }
                    $scope.getLoanData(data.id);
                 }

                 $scope.updateSlabBasedChargeForEmiPack = function(loanEMIPackData){
                    $scope.editLoanAccountdata.numberOfRepayments = loanEMIPackData.numberOfRepayments;
                    $scope.editLoanAccountdata.principal = loanEMIPackData.sanctionAmount;
                    $scope.updateSlabBasedCharges();
                 };

                $scope.constructFormData(memberParams.loanAccountBasicData);

                $scope.closeLoanAccountForm = function () {
                    $scope.showLoanAccountForm = false;
                    $modalInstance.dismiss('closeLoanAccountForm');
                }
                $scope.close = function () {
                    $modalInstance.dismiss('close');
                };
                $scope.getParentLoanPurpose = function (loanPurposeId) {
                    if($scope.loanPurposeGroups && $scope.loanPurposeGroups.length>0){
                       for(var i=0; i< $scope.loanPurposeGroups.length; i++){
                            if($scope.loanPurposeGroups[i].loanPurposeDatas && $scope.loanPurposeGroups[i].loanPurposeDatas.length >0){

                                for(var j=0; j< $scope.loanPurposeGroups[i].loanPurposeDatas.length; j++){
                                    if($scope.loanPurposeGroups[i].loanPurposeDatas[j].id == loanPurposeId){
                                        $scope.formData.loanPurposeGroupId = $scope.loanPurposeGroups[i].id;
                                        scope.isLoanPurposeEditable= false;
                                        $scope.onLoanPurposeGroupChange($scope.formData.loanPurposeGroupId,scope.isLoanPurposeEditable);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                };
                $scope.onLoanPurposeGroupChange = function (loanPurposegroupId,isLoanPurposeEditable) {
                    if(isLoanPurposeEditable!=false){
                        $scope.editLoanAccountdata.loanPurposeId = undefined;
                    }
                    if(loanPurposegroupId){
                        resourceFactory.loanPurposeGroupResource.get({
                            loanPurposeGroupsId: loanPurposegroupId, isFetchLoanPurposeDatas : 'true'
                        }, function (data) {
                            $scope.loanPurposeOptions = data.loanPurposeDatas;
                        });
                    }else{
                        $scope.loanPurposeOptions = [];
                    }
                    
                   
                }

            }
            scope.releaseClient = function (clientId) {
                var releaseClientFormData = {};
                releaseClientFormData.locale = scope.optlang.code;
                releaseClientFormData.dateFormat = scope.df;
                releaseClientFormData.reactivationDate = dateFilter(new Date(),scope.df);
                var queryParams = {clientId: clientId, command: 'reactivate'};
                resourceFactory.clientResource.save(queryParams,releaseClientFormData, function (data) {
                    initTask();
                });

            }

             //client reject reason method call
             scope.clientRejection = function (member) {
                var templateUrl = 'views/task/popup/closeclient.html';
                
                $modal.open({
                    templateUrl: templateUrl,
                    controller: clientCloseCtrl,
                    windowClass: 'modalwidth700',
                    resolve: {
                        memberParams: function () {
                            return { 'memberId': member.id,
                                'memberName': member.displayName,
                                'fcsmNumber':member.fcsmNumber,
                                'allowLoanRejection' : member.allowLoanRejection };
                        }
                    }
                });
            }
            var clientCloseCtrl = function ($scope, $modalInstance, memberParams) {
				$scope.df = scope.df;
                $scope.error = null;
                $scope.isError = false;
                $scope.isClosureDate = true;
                $scope.isRejectType = true;
                $scope.isReason = true;
                $scope.rejectClientData = {};
                $scope.memberName = memberParams.memberName;
                $scope.fcsmNumber = memberParams.fcsmNumber;
                $scope.rejectClientData.locale = scope.optlang.code;
                $scope.rejectClientData.dateFormat = scope.df;
                $scope.rejectTypes = scope.rejectTypes;
                /*if(!memberParams.allowLoanRejection){
                    var idx = $scope.rejectTypes.findIndex(x => x.code == 'rejectType.loanRejection');
                    if(idx >= 0){
                        $scope.rejectTypes.splice(idx,1);
                    }    
                }*/
                $scope.clientClosureReasons = scope.clientClosureReasons;
                $scope.rejectClientData.closureDate = dateFilter(new Date(), scope.df);
                $scope.cancelClientClose = function () {
                    $modalInstance.dismiss('cancel');
                };
                $scope.submitClientClose = function () {
                    $scope.isError = false;
                    if($scope.rejectClientData.rejectType==undefined || $scope.rejectClientData.rejectType==null || $scope.rejectClientData.rejectType.length==0){
                        $scope.isRejectType = false;
                        $scope.isError = true;
                    }
                    if($scope.rejectClientData.closureReasonId==undefined || $scope.rejectClientData.closureReasonId==null){
                        $scope.isReason = false;
                        $scope.isError = true;
                    }
                    if($scope.rejectClientData.closureDate==undefined || $scope.rejectClientData.closureDate==null || $scope.rejectClientData.closureDate.length==0){
                        $scope.isClosureDate = false;
                        $scope.isError = true;
                    }
                    if($scope.isError){
                        return false;
                    }
                    if($scope.rejectClientData.closureDate){
                        $scope.rejectClientData.closureDate = dateFilter($scope.rejectClientData.closureDate, scope.df);
                    }
                    resourceFactory.clientResource.save({clientId: memberParams.memberId, command: 'close'}, $scope.rejectClientData, function (data) {
                       $modalInstance.dismiss('cancel');
                       initTask();
                    });
                };

            }

            scope.groupRejection = function (member) {
                var templateUrl = 'views/task/popup/closegroup.html';
                $modal.open({
                    templateUrl: templateUrl,
                    controller: groupCloseCtrl,
                    windowClass: 'modalwidth700',
                    resolve: {
                        memberParams: function () {
                            return { 'memberId': member.id,
                                'memberName': member.name,
                                'fcsmNumber':member.fcsmNumber };
                        }
                    }
                });
            }
            var groupCloseCtrl = function ($scope, $modalInstance, memberParams) {
				$scope.df = scope.df;
                $scope.error = null;
                $scope.isError = false;
                $scope.isClosureDate = true;
                $scope.isReason = true;
                $scope.rejectGroupData = {};
                $scope.memberName = memberParams.memberName;
                $scope.fcsmNumber = memberParams.fcsmNumber;
                $scope.rejectGroupData.locale = scope.optlang.code;
                $scope.rejectGroupData.dateFormat = scope.df;
                $scope.rejectGroupData.closureDate = dateFilter(new Date(), scope.df);
                $scope.groupClosureReasons = scope.groupClosureReasons;

                $scope.cancelGroupClose = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.submitGroupClose = function () {
                    $scope.isError = false;
                    if($scope.rejectGroupData.closureReasonId==undefined || $scope.rejectGroupData.closureReasonId==null){
                        $scope.isReason = false;
                        $scope.isError = true;
                    }
                    if($scope.rejectGroupData.closureDate==undefined || $scope.rejectGroupData.closureDate==null || $scope.rejectGroupData.closureDate.length==0){
                        $scope.isClosureDate = false;
                        $scope.isError = true;
                    }
                    if($scope.isError){
                        return false;
                    }
                    if($scope.rejectGroupData.closureDate){
                        $scope.rejectGroupData.closureDate = dateFilter($scope.rejectGroupData.closureDate, scope.df);
                    }
                    resourceFactory.groupResource.save({groupId: memberParams.memberId, command: 'close'}, $scope.rejectGroupData, function (data) {
                        $modalInstance.dismiss('cancel');
                        initTask();
                    });
                };
            }

            scope.captureMembersToNextStep = function(clientId, loanId, isChecked){
                if(isChecked){
                    scope.taskInfoTrackArray.push(
                        {'clientId' : clientId,
                            'currentTaskId' : scope.taskData.id,
                            'loanId' : loanId})
                }else{
                    var idx = scope.taskInfoTrackArray.findIndex(x => x.clientId == clientId);
                    if(idx >= 0){
                        scope.taskInfoTrackArray.splice(idx,1);
                        scope.centerDetails.isAllChecked = false;
                    }

                }
            }
            
            scope.moveMembersToNextStep = function(){
                scope.errorDetails = [];
                if(scope.taskInfoTrackArray.length == 0){
                    return scope.errorDetails.push([{code: 'error.msg.select.atleast.one.member'}])
                }

                scope.taskTrackingFormData = {};
                scope.taskTrackingFormData.taskInfoTrackArray = [];

                scope.taskTrackingFormData.taskInfoTrackArray = scope.taskInfoTrackArray.slice();
                 
                resourceFactory.clientLevelTaskTrackingResource.save(scope.taskTrackingFormData, function(trackRespose) {
                    initTask();
                })

            }
            scope.isActiveMember = function(activeClientMember){
                if(activeClientMember.status.code == 'clientStatusType.onHold' || activeClientMember.status.code == 'clientStatusType.active'){
                    return true;
                }
                return false;
            }
            scope.isActiveSubGroup = function(groupMember){
                if(groupMember.status.value == 'Active'){
                    return true;
                }
                return false;
            }

            scope.hideClient = function(activeClientMember){
                if(activeClientMember.status.code == 'clientStatusType.onHold' || scope.eventType == 'loancycle'){
                    return true;
                }
                return false;
            }
            scope.validateAllClients = function(centerDetails,isAllChecked){
                scope.taskInfoTrackArray = [];
                for(var i in centerDetails.subGroupMembers){
                    for(var j in centerDetails.subGroupMembers[i].memberData){
                        var activeClientMember = centerDetails.subGroupMembers[i].memberData[j];
                        if(isAllChecked){
                            if(activeClientMember.status.code != 'clientStatusType.onHold' && activeClientMember.loanAccountBasicData != undefined && !activeClientMember.isClientFinishedThisTask){
                                centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = true;
                                scope.captureMembersToNextStep(activeClientMember.id, activeClientMember.loanAccountBasicData.id, activeClientMember.isMemberChecked);
                            }
                        }else{
                            centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = false;
                        }

                    }
                }
            }
        }
    });
    mifosX.ng.application.controller('BulkLoanApplicationActivityController', ['$controller', '$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter', 'ngXml2json', '$route', '$http', '$rootScope', '$sce', 'CommonUtilService', '$route', '$upload', 'API_VERSION', mifosX.controllers.BulkLoanApplicationActivityController]).run(function ($log) {
        $log.info("BulkLoanApplicationActivityController initialized");
    });
}(mifosX.controllers || {}));