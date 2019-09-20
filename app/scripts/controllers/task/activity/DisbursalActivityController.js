(function (module) {
    mifosX.controllers = _.extend(module, {
        DisbursalActivityController: function ($controller, scope, routeParams, $modal, resourceFactory, location, dateFilter, ngXml2json, route, $http, $rootScope, $sce, CommonUtilService, $route, $upload, API_VERSION) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));

            function initTask() {
                scope.$parent.clientsCount();
                scope.centerId = scope.taskconfig.centerId;
                scope.isLoanPurposeEditable= true;
                scope.chargesCategory = [];
                resourceFactory.centerWorkflowResource.get({ centerId: scope.centerId,eventType : scope.eventType, associations: 'groupMembers,profileratings,loanaccounts,clientcbcriteria' }, function (data) {
                    scope.centerDetails = data;
                    //logic to disable and highlight member
                    for(var i = 0; i < scope.centerDetails.subGroupMembers.length; i++){
                        if(scope.centerDetails.subGroupMembers[i].memberData){
                            for(var j = 0; j < scope.centerDetails.subGroupMembers[i].memberData.length; j++){

                              var clientLevelTaskTrackObj =  scope.centerDetails.subGroupMembers[i].memberData[j].clientLevelTaskTrackingData;
                              var clientLevelCriteriaObj =  scope.centerDetails.subGroupMembers[i].memberData[j].clientLevelCriteriaResultData;
                              if(clientLevelTaskTrackObj == undefined){
                                  if (scope.eventType && scope.eventType == 'create') {
                                      scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
                                  } else {
                                      scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
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
                                        }else if(clientLevelCriteriaObj.score >= 0 && clientLevelCriteriaObj.score <= 4){
                                            scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = false;
                                            scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-red";
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

                if (scope.response && scope.response.uiDisplayConfigurations.loanAccount) {

                    $scope.showExternalId = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.externalId;
                    $scope.extenalIdReadOnlyType = scope.response.uiDisplayConfigurations.loanAccount.isReadOnlyField.externalId;
                    $scope.showRepaymentFrequencyNthDayType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.repaymentFrequencyNthDayType;
                    $scope.showRepaymentFrequencyDayOfWeekType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.repaymentFrequencyDayOfWeekType;
                    $scope.showBrokenPeriodType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.brokenPeriodMethodType;
                    $scope.isLoanPurposeRequired = scope.response.uiDisplayConfigurations.loanAccount.isMandatory.loanPurposeId;
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
                                        for(var i in charge.slabs) {
                                            var slabBasedValue = $scope.getSlabBasedAmount(charge.slabs[i],$scope.editLoanAccountdata.principal,$scope.editLoanAccountdata.numberOfRepayments);
                                            if(slabBasedValue != null){
                                                charge.amountOrPercentage = slabBasedValue;
                                            }
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

                $scope.getSlabBasedAmount = function(slab, amount , repayment){
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
                        for(var j in data.slabs){
                            var slabBasedValue = $scope.getSlabBasedAmount(data.slabs[j],$scope.editLoanAccountdata.principal,$scope.editLoanAccountdata.numberOfRepayments);
                            if(slabBasedValue != null){
                                data.amountOrPercentage = slabBasedValue;
                                return data;
                            }else {
                                data.amountOrPercentage = undefined;
                            }
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
                                                for (var i in charge.slabs) {
                                                    var slabBasedValue = $scope.getSlabBasedAmount(charge.slabs[i], $scope.loanAccountFormData.principal, $scope.loanAccountFormData.numberOfRepayments);
                                                    if (slabBasedValue != null) {
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
                                    amount: $scope.charges[i].amountOrPercentage,
                                    dueDate: dateFilter($scope.charges[i].dueDate, scope.df)
                                });
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
                    if(!_.isUndefined($scope.loanaccountinfo.calendarOptions)){
                        $scope.editLoanAccountdata.calendarId = $scope.loanaccountinfo.calendarOptions[0].id;
                    }


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
                    $scope.editLoanAccountdata.loanType = $scope.inparams.templateType = 'jlg';
                    $scope.editLoanAccountdata.expectedDisbursementDate = dateFilter(new Date(dateFilter($scope.loanAccountData.expectedDisbursementOnDate,scope.df)),scope.df);
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

                $scope.validateEmiPack = function(loanaccountinfo,principle){
                    angular.forEach(loanaccountinfo.loanEMIPacks, function(itm,$index){
                        if(itm.sanctionAmount > principle) {
                            loanaccountinfo.loanEMIPacks.splice($index);
                        }
                    });
                }
                $scope.getLoanData = function(loanId){
                    resourceFactory.loanResource.get({loanId: loanId, template: true, associations: 'charges,meeting',staffInSelectedOfficeOnly:true}, function (data) {
                        $scope.loanaccountinfo = data;
                        $scope.charges = data.charges;
                        $scope.validateEmiPack($scope.loanaccountinfo,$scope.loanaccountinfo.approvedPrincipal);
                    });
                }
                $scope.constructFormData = function (data) {
                    $scope.editLoanAccountdata.productId = data.loanProductId;
                     //since loan product change disabled
                  //  $scope.loanProductChange($scope.editLoanAccountdata.productId);
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

            scope.loanDisburse = function (groupId, activeClientMember) {
                if (activeClientMember.subStatus && activeClientMember.subStatus.code === "clientSubStatusType.blacklist") {
                    scope.openClientValidationPopUp(groupId, activeClientMember);
                } else {
                    scope.openLoanDisbursalPopUp(groupId, activeClientMember);
                }
            }

            scope.openClientValidationPopUp = function (groupId, activeClientMember) {
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
            
            var ClientValidationCtrl = function ($scope, $modalInstance, memberParams) {
                $scope.df = scope.df;
                $scope.confirm = function () {
                    $modalInstance.dismiss('cancel');
                    scope.openLoanDisbursalPopUp(memberParams.groupId, memberParams.activeClientMember);
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }

            scope.openLoanDisbursalPopUp = function (groupId, activeClientMember) {
                $modal.open({
                    templateUrl: 'views/task/popup/loandisburse.html',
                    controller: LoanDisburseCtrl,
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {},
                    windowClass: 'app-modal-window-full-screen',
                    resolve: {
                        memberParams: function () {
                            return { 'groupId': groupId, 'activeClientMember': activeClientMember };
                        }
                    }
                });
            }

            scope.bulkLoanDisburse = function () {
                $modal.open({
                    templateUrl: 'views/task/popup/bulkloandisburse.html',
                    controller: BulkLoanDisburseCtrl,
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {},
                    windowClass: 'app-modal-window-full-screen',
                    resolve: {
                        memberParams: function () {
                            return { 'data': scope.centerDetails.subGroupMembers, 'paymentTypes': scope.paymentTypes, 'paymentModeOptions': scope.paymentModeOptions };
                        }
                    }
                });
            }

            scope.selectAllLoan = false;
            scope.loanToBulkDisbursement = [];
            scope.paymentTypes = [];
            scope.paymentModeOptions = [];
            scope.paymentTypeOptions = [];
            scope.isTemplateAvailable = false;
            scope.addAllLoansToBulkDisburse = function (val) {
                for (var i in scope.centerDetails.subGroupMembers) {
                    var groupMember = scope.centerDetails.subGroupMembers[i];
                    for (var j in groupMember.memberData) {
                        var activeClientMember = groupMember.memberData[j];
                        if (!activeClientMember.isClientFinishedThisTask && activeClientMember.loanAccountBasicData) {
                            activeClientMember.loanAccountBasicData.selected = val;
                            var disburseDate = new Date(activeClientMember.loanAccountBasicData.expectedDisbursementOnDate);
                            if(disburseDate>new Date()){
                                activeClientMember.loanAccountBasicData.selected = false;
                            }
                            scope.getDisbursalTemplate(activeClientMember.loanAccountBasicData.id);
                        }
                    }
                }
            }
            scope.selectedLoan = function (id) {
                scope.getDisbursalTemplate(id);
            }
            scope.getDisbursalTemplate = function (loanId) {
                if (!scope.isTemplateAvailable) {
                    resourceFactory.loanTrxnsTemplateResource.get({ loanId: loanId, command: 'disburse' }, function (data) {
                        scope.paymentTypes = data.paymentTypeOptions;
                        scope.paymentModeOptions = data.paymentModeOptions;
                    });
                    scope.isTemplateAvailable = true;
                }
            }

            var BulkLoanDisburseCtrl = function ($scope, $modalInstance, memberParams) {
                $scope.paymentTypes = memberParams.paymentTypes;
                $scope.paymentModeOptions = memberParams.paymentModeOptions;
                $scope.loanData = memberParams.data;
                $scope.applicableOnRepayment = 1;
                $scope.data = {};
                $scope.taskPermissionName = 'DISBURSE_LOAN';
                $scope.commandParam = "disburse";
                $scope.paymentMode = 3;
                
                $scope.getPaymentTypeOtions = function (modeId) {
                    $scope.paymentTypeOptions = [];
                    if ($scope.paymentTypes) {
                        var type = $scope.applicableOnRepayment;
                        for (var i in $scope.paymentTypes) {
                            if (($scope.paymentTypes[i].paymentMode == undefined ||
                                $scope.paymentTypes[i].paymentMode.id == modeId) &&
                                ($scope.paymentTypes[i].applicableOn == undefined || $scope.paymentTypes[i].applicableOn.id != type)) {
                                 $scope.paymentTypeOptions.push($scope.paymentTypes[i]);
                            }
                        }
                    }
                }
                $scope.getPaymentTypeOtions($scope.paymentMode);
                if($scope.paymentTypeOptions.length>0){
                    $scope.data.paymentTypeId = $scope.paymentTypeOptions[0].id;
                }
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
                
                $scope.submit = function () {
                    $scope.batchRequests = [];
                    for (var i in $scope.loanData) {
                        var groupMember = $scope.loanData[i];
                        for (var j in groupMember.memberData) {
                            var activeClientMember = groupMember.memberData[j];                            
                            if (!activeClientMember.isClientFinishedThisTask && activeClientMember.loanAccountBasicData) {
                                if (activeClientMember.loanAccountBasicData.selected == true) {
                                    $scope.constructRequestBody(activeClientMember.loanAccountBasicData);                                   
                                }
                            }
                        }
                    }
                    resourceFactory.batchResource.post({ 'enclosingTransaction': true }, $scope.batchRequests, function (data) {
                        if(data.length > 0 && (data[data.length-1].requestId == data.length)){
                            $modalInstance.close();
                            initTask();
                        }else{
                            $modalInstance.close();
                        }
                    });
                    
                }

                $scope.constructRequestBody = function (loanData) {
                    $scope.formData = {};
                    $scope.formData.locale = scope.optlang.code;
                    $scope.formData.dateFormat = scope.df;
                    $scope.formData.actualDisbursementDate = new Date();
                    var reqDate = new Date();
                    if(loanData.expectedDisbursementOnDate){
                        var disburseDate = new Date(loanData.expectedDisbursementOnDate);
                        reqDate = dateFilter(disburseDate, scope.df);                        
                    }else{                        
                        reqDate = dateFilter($scope.formData.actualDisbursementDate, scope.df);
                    }
                    $scope.formData.actualDisbursementDate = reqDate;
                    $scope.formData.paymentTypeId = $scope.data.paymentTypeId;
                    $scope.formData.transactionAmount = loanData.principalAmount;
                    if (loanData.loanEMIPackData) {
                        $scope.formData.loanEMIPackId = loanData.loanEMIPackData.id;
                        $scope.formData.fixedEmiAmount = loanData.loanEMIPackData.fixedEmi;
                    }
                    var relativeUrl = "loans/" + loanData.id + "?command=" + $scope.commandParam;
                    $scope.batchRequests.push({
                        requestId: ($scope.batchRequests.length+1), relativeUrl: relativeUrl,
                        method: "POST", body: JSON.stringify(this.formData)
                    });
                    
                }
            }    

            var LoanDisburseCtrl = function ($scope, $modalInstance, memberParams) {
				$scope.df = scope.df;
                $scope.clientId = memberParams.activeClientMember.id;
                $scope.groupId = memberParams.groupId;
                $scope.showaddressform = true;
                $scope.shownidentityform = true;
                $scope.shownFamilyMembersForm = true;
                $scope.showLoanAccountForm = false;
                $scope.isLoanAccountExist = false;
                $scope.paymentTypes = [];
                $scope.paymentModeOptions = [];
                $scope.paymentTypeOptions = [];
                $scope.formData = {};
                $scope.taskPermissionName = 'DISBURSE_LOAN';
                $scope.formData.actualDisbursementDate = new Date();
                $scope.taskInfoTrackArray = [];
                $scope.catureFP = false ;
                $scope.commandParam = "disburse";
                
                //loan account
                if (memberParams.activeClientMember.loanAccountBasicData) {
                    $scope.loanAccountData = memberParams.activeClientMember.loanAccountBasicData;
                    $scope.loanId = $scope.loanAccountData.id;
                    $scope.isLoanAccountExist = true;
                    $scope.formData.actualDisbursementDate = new Date($scope.loanAccountData.expectedDisbursementOnDate);
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
                $scope.checkBiometricRequired = function() {
                    if( $scope.transactionAuthenticationOptions &&  $scope.transactionAuthenticationOptions.length > 0) {
                        for(var i in $scope.transactionAuthenticationOptions) {
                            var paymentTypeId = Number($scope.transactionAuthenticationOptions[i].paymentTypeId) ;
                            var amount = Number($scope.transactionAuthenticationOptions[i].amount) ;
                            var authenticationType = $scope.transactionAuthenticationOptions[i].authenticationType ;
                            if(authenticationType === 'Aadhaar fingerprint' && $scope.formData.paymentTypeId === paymentTypeId && $scope.formData.transactionAmount>= amount) {
                                $scope.formData.disburseTransactionAuthentication= scope.response.uiDisplayConfigurations.loanAccount.disbursement.disburseTransactionAuthentication;
                                $scope.formData.authenticationType = $scope.transactionAuthenticationOptions[i].authenticationType ;
                                $scope.catureFP = true ;
                                return ;
                            }
                        }
                    }
                    scope.catureFP = false ;
                };
                getClientData();
                function formDisbursementData() {
                    resourceFactory.loanTrxnsTemplateResource.get({loanId: $scope.loanId, command: 'disburse'}, function (data) {
                        $scope.paymentTypes = data.paymentTypeOptions;
                        if(data.loanEMIPacks){
                            $scope.loanEMIPacks = data.loanEMIPacks;
                            if(data.loanEMIPackData){
                               $scope.formData.loanEMIPackId = data.loanEMIPackData.id;
                            }
                        }
                        $scope.sanctionAmount = data.amount;
                        $scope.paymentModeOptions = data.paymentModeOptions;
                        $scope.transactionAuthenticationOptions = data.transactionAuthenticationOptions ;
                        $scope.updatePaymentType(data.expectedPaymentId);
                        $scope.formData.transactionAmount = data.amount;
                        $scope.netAmount = data.netDisbursalAmount;
                        $scope.nextRepaymentDate = new Date(data.possibleNextRepaymentDate) || new Date();
                        if (data.fixedEmiAmount) {
                            $scope.formData.fixedEmiAmount = data.fixedEmiAmount;
                            $scope.showEMIAmountField = true;
                        }
                        if($scope.showNetDisbursalAmount && ($scope.netAmount && $scope.netAmount < $scope.formData.transactionAmount)) {
                            $scope.showNetDisbursalAmount = true;
                        }else{
                            $scope.showNetDisbursalAmount = false;
                        }
                        $scope.formData.discountOnDisbursalAmount=data.discountOnDisbursalAmount;
                        if ($scope.formData.discountOnDisbursalAmount){
                            $scope.showdiscountOnDisburse = true;
                        }
                        if(data.expectedFirstRepaymentOnDate){
                            $scope.formData.repaymentsStartingFromDate = new Date(data.expectedFirstRepaymentOnDate);
                            $scope.showRepaymentsStartingFromDateField = true;
                        }
                        $scope.showPaymentTypeForChargeDisbursement = data.splitDisbursementForCharges;
                        if(data.splitDisbursementForCharges){
                            $scope.formData.paymentTypeIdForChargeDisbursement = data.paymentTypeIdForChargeDisbursement;
                        }
                        $scope.checkBiometricRequired();
                    });
                }
                formDisbursementData();
                $scope.updatePaymentType = function (expectedPaymentTypeId) {
                    if (expectedPaymentTypeId) {
                        for (var i in $scope.paymentTypes) {
                            if (expectedPaymentTypeId == $scope.paymentTypes[i].id) {
                                $scope.formData.paymentTypeId = expectedPaymentTypeId;
                                if ($scope.paymentTypes[i].paymentMode) {
                                    $scope.paymentMode = $scope.paymentTypes[i].paymentMode.id;
                                    $scope.getPaymentTypeOtions();
                                }
                            }
                        }

                    } else {
                        $scope.paymentMode = 3;
                        $scope.getPaymentTypeOtions();
                        if ($scope.paymentTypeOptions.length > 0) {
                            $scope.formData.paymentTypeId = $scope.paymentTypeOptions[0].id;
                        }
                    }

                };

                $scope.getPaymentTypeOtions = function () {
                    $scope.paymentTypeOptions = [];
                    if ($scope.paymentTypes) {
                        var type = scope.applicableOnRepayment;
                        for (var i in $scope.paymentTypes) {
                            if (($scope.paymentTypes[i].paymentMode == undefined ||
                                $scope.paymentTypes[i].paymentMode.id == $scope.paymentMode) &&
                                ($scope.paymentTypes[i].applicableOn == undefined || $scope.paymentTypes[i].applicableOn.id != type)) {
                                $scope.paymentTypeOptions.push($scope.paymentTypes[i]);
                            }
                        }
                    }
                }
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
                $scope.submit = function () {
                    this.formData.locale = scope.optlang.code;
                    this.formData.dateFormat = scope.df;
                    var reqDate = dateFilter($scope.formData.actualDisbursementDate, scope.df);
                    this.formData.actualDisbursementDate = reqDate;
                    if(this.formData.loanEMIPackId && this.formData.loanEMIPackId>0){
                        for(var i in scope.loanEMIPacks){
                            if($scope.loanEMIPacks[i].id == this.formData.loanEMIPackId ){
                                this.formData.transactionAmount = $scope.loanEMIPacks[i].sanctionAmount;
                                this.formData.fixedEmiAmount = $scope.loanEMIPacks[i].fixedEmi;
                            }
                        }
                    }


                    resourceFactory.LoanAccountResource.save({loanId: $scope.loanId, command: 'disburse'}, this.formData, function (data) {

                        $modalInstance.dismiss('cancel');
                        initTask();
                    });
                }

                $scope.forceDisburse = function () {
                    $scope.commandParam = 'forceDisburse';
                    $scope.submit();
                };

            }
        }
    });
    mifosX.ng.application.controller('DisbursalActivityController', ['$controller', '$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter', 'ngXml2json', '$route', '$http', '$rootScope', '$sce', 'CommonUtilService', '$route', '$upload', 'API_VERSION', mifosX.controllers.DisbursalActivityController]).run(function ($log) {
        $log.info("DisbursalActivityController initialized");
    });
}(mifosX.controllers || {}));