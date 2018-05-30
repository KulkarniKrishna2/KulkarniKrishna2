(function(module) {
    mifosX.controllers = _.extend(module, {
        CGTBasicActivityController: function($controller, scope, routeParams, $modal, resourceFactory, location, dateFilter, route, $http, $rootScope,CommonUtilService, $route, $upload, API_VERSION, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', {
                $scope: scope
            }));

            scope.loanIds = [];
            scope.first = {};
            scope.first.date = new Date();
            scope.formData = {};

            function initTask() {
                scope.centerId = scope.taskconfig.centerId;
                resourceFactory.centerWorkflowResource.get({
                    centerId: scope.centerId,
                    associations: 'groupMembers,profileratings,loanaccounts'
                }, function(data) {
                    scope.centerDetails = data;
                    scope.rejectTypes = data.rejectTypes;
                    scope.clientClosureReasons = data.clientClosureReasons;
                    scope.groupClosureReasons = data.groupClosureReasons;
                    scope.officeId = scope.centerDetails.officeId;
                });

            };
            initTask();

            scope.generateDocument = function(document) {
                resourceFactory.documentsGenerateResource.generate({
                    entityType: scope.entityType,
                    entityId: scope.entityId,
                    identifier: document.reportIdentifier
                }, function(data) {
                    document.id = data.resourceId;
                    var loandocs = {};
                    loandocs = API_VERSION + '/' + document.parentEntityType + '/' + document.parentEntityId + '/documents/' + document.id + '/attachment?' + commonUtilService.commonParamsForNewWindow();
                    document.docUrl = loandocs;
                })
            };

            scope.addLoan = function(value, loanId) {
                if (value) {
                    scope.loanIds.push(loanId);
                } else {
                    var indexOfLoanId = scope.loanIds.indexOf(loanId);
                    if (indexOfLoanId >= 0) {
                        scope.loanIds.splice(indexOfLoanId, 1);
                    }
                }
            };

            scope.submit = function() {
                var completedDate = dateFilter(scope.first.date, scope.df);
                this.formData.dateFormat = scope.df;
                this.formData.locale = scope.optlang.code;
                this.formData.loanAccounts = scope.loanIds;
                this.formData.completedDate = completedDate;
                this.formData.loanOfficerId = scope.centerDetails.staffId;

                resourceFactory.cgtBasicActivityResource.persistCgtCompletionDate(this.formData, function(data) {
                    initTask();
                });
            };

            //client profile rating 
            function getprofileRating(activeClientMember){
                resourceFactory.profileRating.get({entityType: 1,entityId : activeClientMember.id}, function (data) {
                    scope.profileRatingData = data;
                });
                initTask();
            };

            scope.reComputeProfileRating = function (activeClientMember) {
                scope.profileRatingData = {};
                resourceFactory.computeProfileRatingTemplate.get(function (response) {
                    for(var i in response.scopeEntityTypeOptions){
                        if(response.scopeEntityTypeOptions[i].value === 'OFFICE'){
                            scope.profileRatingData.scopeEntityType = response.scopeEntityTypeOptions[i].id;
                            scope.profileRatingData.scopeEntityId =  scope.officeId;
                            break;
                        }
                    }
                    for(var i in response.entityTypeOptions){
                        if(response.entityTypeOptions[i].value === 'CLIENT'){
                            scope.profileRatingData.entityType = response.entityTypeOptions[i].id;
                            scope.profileRatingData.entityId =  activeClientMember.id;
                            break;
                        }
                    }
                    scope.profileRatingData.locale = "en";
                    resourceFactory.computeProfileRating.save(scope.profileRatingData, function (response) {
                        getprofileRating(activeClientMember);
                    });
                });
            }

            scope.viewMemberDetails = function(groupId, activeClientMember) {
                $modal.open({
                    templateUrl: 'views/task/popup/viewmember.html',
                    controller: ViewMemberCtrl,
                    backdrop: 'static',
                    windowClass: 'app-modal-window-full-screen',
                    size: 'lg',
                    resolve: {
                        memberParams: function() {
                            return {
                                'groupId': groupId,
                                'activeClientMember': activeClientMember
                            };
                        }
                    }
                });
            }

            var ViewMemberCtrl = function($scope, $modalInstance, memberParams) {
                $scope.clientId = memberParams.activeClientMember.id;
                $scope.groupId = memberParams.groupId;
                $scope.showaddressform = false;
                $scope.shownidentityform = false;
                $scope.shownFamilyMembersForm = false;
                $scope.displayCashFlow = true;
                $scope.showLoanAccountForm = true;
                $scope.isLoanAccountExist = true;


                //loan account
                if (memberParams.activeClientMember.loanAccountBasicData) {
                    $scope.loanAccountData = memberParams.activeClientMember.loanAccountBasicData;
                    $scope.isLoanAccountExist = true;
                }
               

                function getClientData() {
                    resourceFactory.clientResource.get({
                        clientId: $scope.clientId,
                        associations: 'hierarchyLookup'
                    }, function(data) {
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

                if (scope.response && scope.response.uiDisplayConfigurations.loanAccount.isAutoPopulate.interestChargedFromDate) {
                    scope.$watch('date.second ', function() {
                        if ($scope.date.second != '' && $scope.date.second != undefined) {
                            $scope.date.third = $scope.date.second;
                        }
                    });
                }

                $scope.closeLoanAccountForm = function() {
                    $scope.showLoanAccountForm = false;
                }

                $scope.getCashFlow = function() {
                    $scope.showSummary = true;
                    $scope.showAddClientoccupationdetailsForm = false;
                    $scope.showEditClientoccupationdetailsForm = false;
                    $scope.showAddClientassetdetailsForm = false;
                    $scope.showEditClientassetdetailsForm = false;
                    $scope.showAddClienthouseholddetailsForm = false;
                    $scope.showEditClienthouseholddetailsForm = false;
                    $scope.totalIncome = 0;
                    refreshAndShowSummaryView();
                }

                function hideAll() {
                    $scope.showSummary = false;
                    $scope.showAddClientoccupationdetailsForm = false;
                    $scope.showEditClientoccupationdetailsForm = false;
                    $scope.showAddClientassetdetailsForm = false;
                    $scope.showEditClientassetdetailsForm = false;
                    $scope.showAddClienthouseholddetailsForm = false;
                    $scope.showEditClienthouseholddetailsForm = false;
                };

                function incomeAndexpense() {
                    resourceFactory.incomeExpenseAndHouseHoldExpense.getAll({
                        clientId: $scope.clientId
                    }, function(data) {
                        $scope.incomeAndExpenses = data;
                        $scope.totalIncomeOcc = $scope.calculateOccupationTotal();
                        $scope.totalIncomeAsset = $scope.calculateTotalAsset();
                        $scope.totalHouseholdExpense = $scope.calculateTotalExpense();
                        $scope.showSummaryView();
                    });
                };

                $scope.calculateOccupationTotal = function() {
                    var total = 0;
                    angular.forEach($scope.incomeAndExpenses, function(incomeExpense) {
                        if (!_.isUndefined(incomeExpense.incomeExpenseData.cashFlowCategoryData.categoryEnum) && incomeExpense.incomeExpenseData.cashFlowCategoryData.categoryEnum.id == 1) {
                            if (!_.isUndefined(incomeExpense.totalIncome) && !_.isNull(incomeExpense.totalIncome)) {
                                if (!_.isUndefined(incomeExpense.totalExpense) && !_.isNull(incomeExpense.totalExpense)) {
                                    total = total + incomeExpense.totalIncome - incomeExpense.totalExpense;
                                } else {
                                    total = total + incomeExpense.totalIncome;
                                }
                            }
                        }
                    });
                    return total;
                };

                $scope.calculateTotalAsset = function() {
                    var total = 0;
                    angular.forEach($scope.incomeAndExpenses, function(incomeExpense) {
                        if (!_.isUndefined(incomeExpense.incomeExpenseData.cashFlowCategoryData.categoryEnum) && incomeExpense.incomeExpenseData.cashFlowCategoryData.categoryEnum.id == 2) {
                            if (!_.isUndefined(incomeExpense.totalIncome) && !_.isNull(incomeExpense.totalIncome)) {
                                if (!_.isUndefined(incomeExpense.totalExpense) && !_.isNull(incomeExpense.totalExpense)) {
                                    total = total + incomeExpense.totalIncome - incomeExpense.totalExpense;
                                } else {
                                    total = total + incomeExpense.totalIncome;
                                }
                            }
                        }
                    });
                    return total;
                };

                $scope.updateTotalIncome = function(quantity, income) {
                    if ($scope.isQuantifierNeeded && quantity && income) {
                        $scope.totalIncome = parseFloat(quantity) * parseFloat(income);
                    } else {
                        $scope.totalIncome = undefined;
                    }
                };

                $scope.calculateTotalExpense = function() {
                    var total = 0;
                    angular.forEach($scope.incomeAndExpenses, function(incomeExpense) {
                        if (!_.isUndefined(incomeExpense.incomeExpenseData.cashFlowCategoryData.typeEnum) && incomeExpense.incomeExpenseData.cashFlowCategoryData.typeEnum.id == 2) {
                            if (!_.isUndefined(incomeExpense.totalExpense) && !_.isNull(incomeExpense.totalExpense)) {
                                total = total + incomeExpense.totalExpense;
                            }
                        }
                    });
                    return total;
                };

                $scope.showSummaryView = function() {
                    hideAll();
                    $scope.showSummary = true;
                };

                function refreshAndShowSummaryView() {
                    incomeAndexpense();
                };

                //edit

                $scope.editClientoccupationdetails = function(incomeExpenseId) {
                    hideAll();
                    $scope.showEditClientoccupationdetailsForm = true;
                    initEditClientoccupationdetails(incomeExpenseId);
                };

                $scope.editClientassetdetails = function(incomeExpenseId) {
                    hideAll();
                    $scope.showEditClientassetdetailsForm = true;
                    initEditClientoccupationdetails(incomeExpenseId);
                };

                $scope.editClienthouseholddetails = function(incomeExpenseId) {
                    hideAll();
                    $scope.showEditClienthouseholddetailsForm = true;
                    initEditClientoccupationdetails(incomeExpenseId);
                };

                function initEditClientoccupationdetails(incomeExpenseId) {
                    $scope.incomeAndExpenseId = incomeExpenseId;
                    $scope.formData = {};
                    $scope.formData.isMonthWiseIncome = false;
                    $scope.isQuantifierNeeded = false;

                    resourceFactory.cashFlowCategoryResource.getAll({
                        isFetchIncomeExpenseDatas: true
                    }, function(data) {
                        $scope.occupations = data;
                    });

                    resourceFactory.incomeExpenseAndHouseHoldExpense.get({
                        clientId: $scope.clientId,
                        incomeAndExpenseId: $scope.incomeAndExpenseId
                    }, function(data) {
                        angular.forEach($scope.occupations, function(occ) {
                            if (occ.id == data.incomeExpenseData.cashflowCategoryId) {
                                $scope.occupationOption = occ;
                            }
                        });
                        $scope.formData.incomeExpenseId = data.incomeExpenseData.id;
                        $scope.formData.quintity = data.quintity;
                        $scope.formData.totalIncome = data.defaultIncome;
                        $scope.formData.totalExpense = data.totalExpense;

                        $scope.formData.isPrimaryIncome = data.isPrimaryIncome;
                        $scope.formData.isRemmitanceIncome = data.isRemmitanceIncome;
                        $scope.isQuantifierNeeded = data.incomeExpenseData.isQuantifierNeeded;
                        if (scope.isQuantifierNeeded) {
                            $scope.updateTotalIncome($scope.formData.quintity, $scope.formData.totalIncome);
                        }
                        $scope.quantifierLabel = data.incomeExpenseData.quantifierLabel;
                    });
                };

                // create activity
                $scope.addClientoccupationdetails = function() {
                    hideAll();
                    $scope.showAddClientoccupationdetailsForm = true;
                    initAddClientoccupationdetails();
                };

                $scope.addClientassetdetails = function() {
                    hideAll();
                    $scope.showAddClientassetdetailsForm = true;
                    initAddClientoccupationdetails();
                };

                $scope.addClienthouseholddetails = function() {
                    hideAll();
                    $scope.showAddClienthouseholddetailsForm = true;
                    initAddClientoccupationdetails();
                };

                function initAddClientoccupationdetails() {
                    $scope.formData = {};
                    $scope.subOccupations = [];
                    $scope.formData.clientMonthWiseIncomeExpense = [];
                    $scope.formData.isMonthWiseIncome = false;
                    $scope.isQuantifierNeeded = false;
                    $scope.quantifierLabel = undefined;

                    resourceFactory.cashFlowCategoryResource.getAll({
                        isFetchIncomeExpenseDatas: true
                    }, function(data) {
                        $scope.occupations = data;
                    });
                };

                $scope.slectedOccupation = function(occupationId, subOccupationId) {
                    _.each($scope.occupations, function(occupation) {
                        if (occupation.id == occupationId) {
                            _.each(occupation.incomeExpenseDatas, function(iterate) {
                                if (iterate.cashflowCategoryId == occupationId && iterate.id == subOccupationId) {
                                    if (iterate.defaultIncome) {
                                        $scope.formData.totalIncome = iterate.defaultIncome;
                                    }
                                    if (iterate.defaultExpense) {
                                        $scope.formData.totalExpense = iterate.defaultExpense;
                                    }
                                    if (iterate.isQuantifierNeeded == true) {
                                        $scope.quantifierLabel = iterate.quantifierLabel;
                                        $scope.isQuantifierNeeded = iterate.isQuantifierNeeded;
                                    }
                                    $scope.isQuantifierNeeded = iterate.isQuantifierNeeded;
                                    $scope.updateTotalIncome($scope.formData.quintity, $scope.formData.totalIncome);
                                }
                            })
                        }

                    });
                };

                $scope.subOccupationNotAvailable = function(occupationId) {
                    _.each($scope.occupationOption, function(occupation) {
                        if (occupation == occupationId && _.isUndefined(occupation.incomeExpenseDatas)) {
                            $scope.isQuantifierNeeded = false;
                            $scope.updateTotalIncome($scope.formData.quintity, $scope.formData.totalIncome);
                            return $scope.isQuantifierNeeded;
                        }
                    })
                };

                $scope.addClientoccupationdetailsSubmit = function() {
                    $scope.formData.locale = "en";
                    resourceFactory.incomeExpenseAndHouseHoldExpense.save({
                        clientId: $scope.clientId
                    }, $scope.formData, function(data) {
                        refreshAndShowSummaryView();
                    });
                };

                $scope.addClientassetdetailsSubmit = function() {
                    $scope.addClientoccupationdetailsSubmit();
                };

                $scope.addClienthouseholddetailsSubmit = function() {
                    $scope.addClientoccupationdetailsSubmit();
                };

                $scope.editClientassetdetailsSubmit = function() {
                    $scope.editClientoccupationdetailsSubmit();
                }
                $scope.editClienthouseholddetailsSubmit = function() {
                    $scope.editClientoccupationdetailsSubmit();
                }
                $scope.editClientoccupationdetailsSubmit = function() {
                    $scope.formData.locale = "en";
                    resourceFactory.incomeExpenseAndHouseHoldExpense.update({
                            clientId: $scope.clientId,
                            incomeAndExpenseId: $scope.incomeAndExpenseId
                        },
                        $scope.formData,
                        function(data) {
                            refreshAndShowSummaryView();
                        });
                };

                $scope.close = function () {
                    $modalInstance.dismiss('close');
                };

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
                    $scope.charges = scope.loanaccountinfo.charges || [];
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
                        if(data.isSlabBased){               
                                for(var j in data.slabs){
                                    var slabBasedValue = $scope.getSlabBasedAmount(data.slabs[j],$scope.editLoanAccountdata.principal,$scope.editLoanAccountdata.numberOfRepayments);
                                    if(slabBasedValue != null){
                                        data.amountOrPercentage = slabBasedValue;
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
                        for (var i in scope.charges) {
                            if ($scope.charges[i].amountOrPercentage > 0) {
                                $scope.editLoanAccountdata.charges.push({
                                    id: scope.charges[i].id,
                                    chargeId: scope.charges[i].chargeId,
                                    amount: scope.charges[i].amountOrPercentage,
                                    dueDate: dateFilter(scope.charges[i].dueDate, scope.df)
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

                $scope.constructFormData = function (data) {
                    $scope.editLoanAccountdata.productId = data.loanProductId;
                    $scope.loanProductChange($scope.editLoanAccountdata.productId);
                    $scope.editLoanAccountdata.loanPurposeId = data.loanPurposeId;
                    if(data.loanEMIPackData){
                        $scope.editLoanAccountdata.loanEMIPackId = data.loanEMIPackData.id;
                        $scope.editLoanAccountdata.principal = data.loanEMIPackData.sanctionAmount;
                        $scope.editLoanAccountdata.numberOfRepayments = data.loanEMIPackData.numberOfRepayments;
                    }
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
            }
            //client reject reason method call
            scope.clientRejection = function (memberId) {
                var templateUrl = 'views/task/popup/closeclient.html';
                
                $modal.open({
                    templateUrl: templateUrl,
                    controller: clientCloseCtrl,
                    windowClass: 'modalwidth700',
                    resolve: {
                        memberParams: function () {
                            return { 'memberId': memberId };
                        }
                    }
                });
            }
            var clientCloseCtrl = function ($scope, $modalInstance, memberParams) {

                $scope.error = null;
                $scope.isError = false;
                $scope.isClosureDate = true;
                $scope.isRejectType = true;
                $scope.isReason = true;
                $scope.rejectClientData = {};                
                $scope.rejectClientData.locale = scope.optlang.code;
                $scope.rejectClientData.dateFormat = scope.df;
                $scope.rejectTypes = scope.rejectTypes;
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

            scope.groupRejection = function (memberId) {
                var templateUrl = 'views/task/popup/closegroup.html';
                $modal.open({
                    templateUrl: templateUrl,
                    controller: groupCloseCtrl,
                    windowClass: 'modalwidth700',
                    resolve: {
                        memberParams: function () {
                            return { 'memberId': memberId };
                        }
                    }
                });
            }
            var groupCloseCtrl = function ($scope, $modalInstance, memberParams) {

                $scope.error = null;
                $scope.isError = false;
                $scope.isClosureDate = true;
                $scope.isReason = true;
                $scope.rejectGroupData = {};                
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
        }
    });
    mifosX.ng.application.controller('CGTBasicActivityController', ['$controller', '$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter', '$route', '$http', '$rootScope','CommonUtilService', '$route', '$upload', 'API_VERSION', 'dateFilter', mifosX.controllers.CGTBasicActivityController]).run(function($log) {
        $log.info("CGTBasicActivityController initialized");
    });
}(mifosX.controllers || {}));