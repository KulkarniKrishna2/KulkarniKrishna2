(function (module) {
    mifosX.controllers = _.extend(module, {
        AdditionalDetailsActivityController: function ($controller, scope, $modal, resourceFactory, dateFilter, $http, $rootScope, $upload, API_VERSION, popUpUtilService) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));
            scope.loanIds = [];
            scope.first = {};
            scope.first.date = new Date();
            scope.formData = {};

            function initTask() {
                scope.$parent.clientsCount();
                scope.centerId = scope.taskconfig.centerId;
                scope.taskInfoTrackArray = [];
                scope.isAllClientFinishedThisTask = true;
                scope.clientProfileRatingScoreForSuccess = 0;
                scope.isLoanPurposeEditable = true;
                if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.workflow &&
                    scope.response.uiDisplayConfigurations.workflow.AdditionalDetailsValidation && scope.response.uiDisplayConfigurations.workflow.AdditionalDetailsValidation.profileRatingPercentage) {
                    scope.clientProfileRatingScoreForSuccess = scope.response.uiDisplayConfigurations.workflow.AdditionalDetailsValidation.profileRatingPercentage;
                }
                resourceFactory.centerWorkflowResource.get({
                    centerId: scope.centerId,
                    eventType: scope.eventType,
                    associations: 'groupMembers,profileratings,loanaccounts,clientcbcriteria'
                }, function (data) {
                    scope.centerDetails = data;
                    scope.rejectTypes = data.rejectTypes;
                    scope.clientClosureReasons = data.clientClosureReasons;
                    scope.groupClosureReasons = data.groupClosureReasons;
                    scope.officeId = scope.centerDetails.officeId;
                    scope.centerDetails.isAllChecked = false;
                    //logic to disable and highlight member
                    for (var i = 0; i < scope.centerDetails.subGroupMembers.length; i++) {
                        if (scope.centerDetails.subGroupMembers[i].memberData) {
                            for (var j = 0; j < scope.centerDetails.subGroupMembers[i].memberData.length; j++) {
                                var clientLevelTaskTrackObj = scope.centerDetails.subGroupMembers[i].memberData[j].clientLevelTaskTrackingData;
                                var clientLevelCriteriaObj = scope.centerDetails.subGroupMembers[i].memberData[j].clientLevelCriteriaResultData;
                                scope.centerDetails.subGroupMembers[i].memberData[j].allowLoanRejection = false;
                                scope.centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = false;
                                if(!_.isUndefined(scope.centerDetails.subGroupMembers[i].memberData[j].loanAccountBasicData)){
                                    scope.centerDetails.subGroupMembers[i].memberData[j].filteredCharges = scope.filterCharges(scope.centerDetails.subGroupMembers[i].memberData[j].loanAccountBasicData.charges)
                                }
                                if (clientLevelTaskTrackObj == undefined) {
                                    scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
                                    scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-none";
                                } else if (clientLevelTaskTrackObj != undefined && clientLevelCriteriaObj != undefined) {
                                    if (scope.taskData.id != clientLevelTaskTrackObj.currentTaskId) {
                                        if (clientLevelCriteriaObj.score == 5) {
                                            scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
                                            scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-grey";
                                        } else if (clientLevelCriteriaObj.score >= 0 && clientLevelCriteriaObj.score <= 4) {
                                            scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
                                            scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-red";
                                        }
                                    } else if (scope.taskData.id == clientLevelTaskTrackObj.currentTaskId) {
                                        if (clientLevelCriteriaObj.score == 5) {
                                            scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = false;
                                            scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-grey";
                                            scope.isAllClientFinishedThisTask = false;
                                        } else if (clientLevelCriteriaObj.score >= 0 && clientLevelCriteriaObj.score <= 4) {
                                            scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = false;
                                            scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-red";
                                            scope.isAllClientFinishedThisTask = false;
                                        }
                                    }
                                } else if (clientLevelTaskTrackObj != undefined && (clientLevelCriteriaObj == undefined || clientLevelCriteriaObj == null)) {
                                    if (scope.taskData.id != clientLevelTaskTrackObj.currentTaskId) {
                                        scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
                                        scope.centerDetails.subGroupMembers[i].memberData[j].color = "background-grey";
                                    }
                                    if (scope.taskData.id == clientLevelTaskTrackObj.currentTaskId) {
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

            scope.releaseClient = function (clientId) {
                var releaseClientFormData = {};
                releaseClientFormData.locale = scope.optlang.code;
                releaseClientFormData.dateFormat = scope.df;
                releaseClientFormData.reactivationDate = dateFilter(new Date(), scope.df);
                var queryParams = { clientId: clientId, command: 'reactivate' };
                resourceFactory.clientResource.save(queryParams, releaseClientFormData, function (data) {
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
                            if (member.loanAccountBasicData) {
                                return {
                                    'memberId': member.id,
                                    'memberName': member.displayName,
                                    'fcsmNumber': member.fcsmNumber,
                                    'loanId': member.loanAccountBasicData.id,
                                    'allowLoanRejection': member.allowLoanRejection
                                };
                            }
                            return {
                                'memberId': member.id,
                                'memberName': member.displayName,
                                'fcsmNumber': member.fcsmNumber,
                                'allowLoanRejection': member.allowLoanRejection
                            };
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
                if (memberParams.loanId) {
                    $scope.loanId = memberParams.loanId;
                }
                $scope.clientClosureReasons = scope.clientClosureReasons;
                $scope.rejectClientData.closureDate = dateFilter(new Date(), scope.df);
                $scope.cancelClientClose = function () {
                    $modalInstance.dismiss('cancel');
                };
                $scope.submitClientClose = function () {
                    $scope.isError = false;
                    if ($scope.rejectClientData.rejectType == undefined || $scope.rejectClientData.rejectType == null || $scope.rejectClientData.rejectType.length == 0) {
                        $scope.isRejectType = false;
                        $scope.isError = true;
                    }
                    if ($scope.rejectClientData.closureReasonId == undefined || $scope.rejectClientData.closureReasonId == null) {
                        $scope.isReason = false;
                        $scope.isError = true;
                    }
                    if ($scope.rejectClientData.closureDate == undefined || $scope.rejectClientData.closureDate == null || $scope.rejectClientData.closureDate.length == 0) {
                        $scope.isClosureDate = false;
                        $scope.isError = true;
                    }
                    if ($scope.isError) {
                        return false;
                    }
                    if ($scope.rejectClientData.closureDate) {
                        $scope.rejectClientData.closureDate = dateFilter($scope.rejectClientData.closureDate, scope.df);
                    }
                    if ($scope.rejectClientData.rejectType != 4) {
                        resourceFactory.clientResource.save({ clientId: memberParams.memberId, command: 'close' }, $scope.rejectClientData, function (data) {
                            $modalInstance.dismiss('cancel');
                            initTask();
                        });
                    } else {
                        var loanRejectData = {
                            rejectedOnDate: $scope.rejectClientData.closureDate,
                            locale: scope.optlang.code,
                            dateFormat: scope.df,
                            rejectReasonId: $scope.rejectClientData.closureReasonId
                        };

                        var params = { command: 'reject', loanId: $scope.loanId };
                        resourceFactory.LoanAccountResource.save(params, loanRejectData, function (data) {
                            $modalInstance.dismiss('cancel');
                            initTask();
                        });
                    }
                };

            }

            //client profile rating 
            function getprofileRating(clientId) {
                resourceFactory.profileRating.get({ entityType: 1, entityId: clientId }, function (data) {
                    scope.profileRatingData = data;
                });
                initTask();
            };

            function reComputeProfileRating(clientId) {
                scope.profileRatingData = {};
                resourceFactory.computeProfileRatingTemplate.get(function (response) {
                    for (var i in response.scopeEntityTypeOptions) {
                        if (response.scopeEntityTypeOptions[i].value === 'OFFICE') {
                            scope.profileRatingData.scopeEntityType = response.scopeEntityTypeOptions[i].id;
                            scope.profileRatingData.scopeEntityId = scope.officeId;
                            break;
                        }
                    }
                    for (var i in response.entityTypeOptions) {
                        if (response.entityTypeOptions[i].value === 'CLIENT') {
                            scope.profileRatingData.entityType = response.entityTypeOptions[i].id;
                            scope.profileRatingData.entityId = clientId;
                            break;
                        }
                    }
                    scope.profileRatingData.locale = "en";
                    resourceFactory.computeProfileRating.save(scope.profileRatingData, function (response) {
                        getprofileRating(clientId);
                    });
                });
            }

            scope.isActiveMember = function (activeClientMember) {
                if (activeClientMember.status.code == 'clientStatusType.onHold' || activeClientMember.status.code == 'clientStatusType.active') {
                    return true;
                }
                return false;
            }
            scope.isActiveSubGroup = function (groupMember) {
                if (groupMember.status.value == 'Active') {
                    return true;
                }
                return false;
            }

            scope.validateClient = function (activeClientMember) {
                if (activeClientMember.profileRatingScoreData) {
                    return (activeClientMember.status.code === 'clientStatusType.onHold' || activeClientMember.profileRatingScoreData.finalScore * 20 < scope.clientProfileRatingScoreForSuccess);
                }
                return true;
            };

            scope.validateAllClients = function (centerDetails, isAllChecked) {
                scope.taskInfoTrackArray = [];
                for (var i in centerDetails.subGroupMembers) {
                    for (var j in centerDetails.subGroupMembers[i].memberData) {
                        var activeClientMember = centerDetails.subGroupMembers[i].memberData[j];
                        if (isAllChecked) {
                            if (activeClientMember.status.code != 'clientStatusType.onHold' && activeClientMember.profileRatingScoreData.finalScore * 20 >= scope.clientProfileRatingScoreForSuccess && !activeClientMember.isClientFinishedThisTask) {
                                centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = true;
                                if (activeClientMember.loanAccountBasicData) {
                                    scope.captureMembersToNextStep(activeClientMember.id, activeClientMember.loanAccountBasicData.id, activeClientMember.isMemberChecked);
                                } else {
                                    scope.captureMembersToNextStep(activeClientMember.id, null, activeClientMember.isMemberChecked);
                                }
                            }
                        } else {
                            centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = false;
                        }

                    }
                }
            }

            scope.captureMembersToNextStep = function (clientId, loanId, isChecked) {
                if (isChecked) {
                    if (loanId) {
                        scope.taskInfoTrackArray.push(
                            {
                                'clientId': clientId,
                                'loanId': loanId,
                                'currentTaskId': scope.taskData.id
                            })
                    } else {
                        scope.taskInfoTrackArray.push(
                            {
                                'clientId': clientId,
                                'currentTaskId': scope.taskData.id
                            })
                    }

                } else {
                    var idx = scope.taskInfoTrackArray.findIndex(x => x.clientId == clientId);
                    if (idx >= 0) {
                        scope.taskInfoTrackArray.splice(idx, 1);
                        scope.centerDetails.isAllChecked = false;
                    }

                }
            }

            scope.moveMembersToNextStep = function () {
                scope.errorDetails = [];
                if (scope.taskInfoTrackArray.length == 0) {
                    return scope.errorDetails.push([{ code: 'error.msg.select.atleast.one.member' }])
                }
                if(scope.errorDetails){
                    delete scope.errorDetails;
                }
                scope.taskTrackingFormData = {};
                scope.taskTrackingFormData.taskInfoTrackArray = [];

                scope.taskTrackingFormData.taskInfoTrackArray = scope.taskInfoTrackArray.slice();

                resourceFactory.clientLevelTaskTrackingResource.save(scope.taskTrackingFormData, function (trackRespose) {
                    initTask();
                })
            }

            scope.filterCharges = function (chargeData) {
                if (!_.isUndefined(chargeData)) {
                    var chargesCategory = _.groupBy(chargeData, function (value) {
                        if(_.isUndefined(value.chargeCategoryType)){
                            return;
                        }
                        return value.chargeCategoryType.id;
                    });
                    return chargesCategory;
                }
            }

            scope.editLoan = function (loanAccountBasicData, groupId) {
                scope.groupId = groupId;
                scope.loanAccountBasicData = loanAccountBasicData;
                var templateUrl = 'views/task/popup/editLoan.html';
                var controller = 'EditLoanController';
                popUpUtilService.openFullScreenPopUp(templateUrl, controller, scope);
            }

            scope.viewAdditionalDetails = function (groupId, activeClientMember) {
                $modal.open({
                    templateUrl: 'views/task/popup/viewadditionaldetail.html',
                    controller: viewAdditionalDetailCtrl,
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

            var viewAdditionalDetailCtrl = function ($scope, $modalInstance, memberParams, $sce) {
                angular.extend(this, $controller('defaultUIConfigController', {
                    $scope: $scope,
                    $key: "bankAccountDetails"
                }));
                $scope.showHouseHoldExpense = true;
                $scope.taskconfig = scope.taskconfig;
                $scope.regexFormats = scope.regexFormats;
                $scope.df = scope.df;
                $scope.clientId = memberParams.activeClientMember.id;
                $scope.groupId = memberParams.groupId;
                $scope.showaddressform = false;
                $scope.shownidentityform = false;
                $scope.shownFamilyMembersForm = false;
                $scope.showLoanAccountForm = false;
                $scope.isLoanAccountExist = true;
                $scope.displayCashFlow = true;
                $scope.displaySurveyInfo = true;
                $scope.surveyName = scope.response.uiDisplayConfigurations.viewClient.takeSurveyName;
                $scope.isDetailEditable = true;
                $scope.hideBankAccountActivate = false;
                //loan account
                if (memberParams.activeClientMember.loanAccountBasicData) {
                    $scope.loanAccountData = memberParams.activeClientMember.loanAccountBasicData;
                    $scope.isLoanAccountExist = true;
                }

                if (scope.response && scope.response.uiDisplayConfigurations){
                    if (scope.response.uiDisplayConfigurations.bankAccountDetails) {
                        $scope.isMandatoryFields = scope.response.uiDisplayConfigurations.bankAccountDetails.isMandatory;
                        $scope.isReadOnlyFields = scope.response.uiDisplayConfigurations.bankAccountDetails.isReadOnlyField;
                    }
                    if(scope.response.uiDisplayConfigurations.workflow && scope.response.uiDisplayConfigurations.workflow.hiddenFields){
                        $scope.hideBankAccountActivate = scope.response.uiDisplayConfigurations.workflow.hiddenFields.bankAccountActivate;
                    }
                }

                $scope.getBankDetails = function(isvalidIfsc){
                    if($scope.bankAccFormData.ifscCode != undefined && $scope.bankAccFormData.ifscCode === $scope.repeatBankAccFormData.ifscCodeRepeat && isvalidIfsc){
                        resourceFactory.bankIFSCResource.get({
                            ifscCode: $scope.bankAccFormData.ifscCode
                        }, function (data) {
                            $scope.bankData = data;
                            $scope.bankAccFormData.bankName = $scope.bankData.bankName;
                            $scope.bankAccFormData.branchName = $scope.bankData.branchName;
                            $scope.bankAccFormData.bankCity = $scope.bankData.bankCity;
                        });
                    }
                }

                function getClientData() {
                    resourceFactory.clientResource.get({
                        clientId: $scope.clientId,
                        associations: 'hierarchyLookup'
                    }, function (data) {
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

                $scope.getCashFlow = function () {
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
                    }, function (data) {
                        $scope.incomeAndExpenses = data;
                        $scope.totalIncomeOcc = $scope.calculateOccupationTotal();
                        $scope.totalIncomeAsset = $scope.calculateTotalAsset();
                        $scope.totalHouseholdExpense = $scope.calculateTotalExpense();
                        $scope.showSummaryView();
                    });
                };

                $scope.calculateOccupationTotal = function () {
                    var total = 0;
                    angular.forEach($scope.incomeAndExpenses, function (incomeExpense) {
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

                $scope.calculateTotalAsset = function () {
                    var total = 0;
                    angular.forEach($scope.incomeAndExpenses, function (incomeExpense) {
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

                $scope.updateTotalIncome = function (quantity, income) {
                    if ($scope.isQuantifierNeeded && quantity && income) {
                        $scope.totalIncome = parseFloat(quantity) * parseFloat(income);
                    } else {
                        $scope.totalIncome = undefined;
                    }
                };

                $scope.calculateTotalExpense = function () {
                    var total = 0;
                    angular.forEach($scope.incomeAndExpenses, function (incomeExpense) {
                        if (!_.isUndefined(incomeExpense.incomeExpenseData.cashFlowCategoryData.typeEnum) && incomeExpense.incomeExpenseData.cashFlowCategoryData.typeEnum.id == 2) {
                            if (!_.isUndefined(incomeExpense.totalExpense) && !_.isNull(incomeExpense.totalExpense)) {
                                total = total + incomeExpense.totalExpense;
                            }
                        }
                    });
                    return total;
                };

                $scope.showSummaryView = function () {
                    hideAll();
                    $scope.showSummary = true;
                };

                function refreshAndShowSummaryView() {
                    incomeAndexpense();
                };

                //edit

                $scope.editClientoccupationdetails = function (incomeExpenseId) {
                    hideAll();
                    $scope.showEditClientoccupationdetailsForm = true;
                    initEditClientoccupationdetails(incomeExpenseId);
                };

                $scope.editClientassetdetails = function (incomeExpenseId) {
                    hideAll();
                    $scope.showEditClientassetdetailsForm = true;
                    initEditClientoccupationdetails(incomeExpenseId);
                };

                $scope.editClienthouseholddetails = function (incomeExpenseId) {
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
                    }, function (data) {
                        $scope.occupations = data;
                    });

                    resourceFactory.incomeExpenseAndHouseHoldExpense.get({
                        clientId: $scope.clientId,
                        incomeAndExpenseId: $scope.incomeAndExpenseId
                    }, function (data) {
                        angular.forEach($scope.occupations, function (occ) {
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
                $scope.addClientoccupationdetails = function () {
                    hideAll();
                    $scope.showAddClientoccupationdetailsForm = true;
                    initAddClientoccupationdetails();
                };

                $scope.addClientassetdetails = function () {
                    hideAll();
                    $scope.showAddClientassetdetailsForm = true;
                    initAddClientoccupationdetails();
                };

                $scope.addClienthouseholddetails = function () {
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
                    }, function (data) {
                        $scope.occupations = data;
                    });
                };

                $scope.slectedOccupation = function (occupationId, subOccupationId) {
                    _.each($scope.occupations, function (occupation) {
                        if (occupation.id == occupationId) {
                            _.each(occupation.incomeExpenseDatas, function (iterate) {
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

                $scope.subOccupationNotAvailable = function (occupationId) {
                    _.each($scope.occupationOption, function (occupation) {
                        if (occupation == occupationId && _.isUndefined(occupation.incomeExpenseDatas)) {
                            $scope.isQuantifierNeeded = false;
                            $scope.updateTotalIncome($scope.formData.quintity, $scope.formData.totalIncome);
                            return $scope.isQuantifierNeeded;
                        }
                    })
                };

                $scope.addClientoccupationdetailsSubmit = function () {
                    $scope.formData.locale = "en";
                    resourceFactory.incomeExpenseAndHouseHoldExpense.save({
                        clientId: $scope.clientId
                    }, $scope.formData, function (data) {
                        refreshAndShowSummaryView();
                        reComputeProfileRating($scope.clientId);
                    });
                };

                $scope.addClientassetdetailsSubmit = function () {
                    $scope.addClientoccupationdetailsSubmit();
                };

                $scope.addClienthouseholddetailsSubmit = function () {
                    $scope.addClientoccupationdetailsSubmit();
                };

                $scope.editClientassetdetailsSubmit = function () {
                    $scope.editClientoccupationdetailsSubmit();
                }
                $scope.editClienthouseholddetailsSubmit = function () {
                    $scope.editClientoccupationdetailsSubmit();
                }
                $scope.editClientoccupationdetailsSubmit = function () {
                    $scope.formData.locale = "en";
                    resourceFactory.incomeExpenseAndHouseHoldExpense.update({
                        clientId: $scope.clientId,
                        incomeAndExpenseId: $scope.incomeAndExpenseId
                    },
                        $scope.formData,
                        function (data) {
                            refreshAndShowSummaryView();
                            });
                };

                $scope.close = function () {
                    $modalInstance.dismiss('close');
                    initTask();
                };

                // Document upload part

                function initDocumentUploadTask() {
                    $scope.formData = {};
                    $scope.isUploadDocumentTagMandatory = true;
                    $scope.isFileMandatory = true;
                    $scope.entityType = 'clients';
                    $scope.entityId = $scope.clientId;
                    $scope.isFileSelected = false;
                    $scope.documentTagName = 'Client Document Tags';
                    getClientAdditionalDocuments();
                };

                initDocumentUploadTask();

                function getAdditionalDocumentNames() {
                    resourceFactory.codeValueByCodeNameResources.get({ codeName: $scope.documentTagName }, function (codeValueData) {
                        $scope.additionalDocumentNames = [];
                        $scope.availableDocumentNames = [];
                        $scope.additionalDocumentNames = codeValueData;
                        $scope.availableDocumentNames = codeValueData;
                        initAdditionalDocumentNames();
                    });
                }

                function initAdditionalDocumentNames() {
                    if ($scope.clientdocuments != undefined) {
                        for (var key in $scope.clientdocuments) {
                            for (var value in $scope.clientdocuments[key]) {
                                var index = $scope.additionalDocumentNames.findIndex(obj => obj.name === $scope.clientdocuments[key][value].name);
                                if (index >= 0) {
                                    $scope.availableDocumentNames.splice(index, 1);
                                }
                            }
                        }
                    }
                }

                function getClientAdditionalDocuments() {
                    resourceFactory.clientDocumentsResource.getAllClientDocuments({ clientId: $scope.clientId }, function (data) {
                        $scope.clientdocuments = {};
                        for (var l = 0; l < data.length; l++) {
                            if (data[l].id) {
                                data[l].docUrl = documentsURL(data[l]);
                            }
                            if (data[l].tagValue) {
                                pushDocumentToTag(data[l], data[l].tagValue);
                            }
                        }
                        getAdditionalDocumentNames();
                    });
                };

                function pushDocumentToTag(document, tagValue) {
                    if ($scope.clientdocuments && $scope.clientdocuments.hasOwnProperty(tagValue)) {
                        $scope.clientdocuments[tagValue].push(document);
                    } else {
                        $scope.clientdocuments[tagValue] = [];
                        $scope.clientdocuments[tagValue].push(document);
                    }
                };

                $scope.onFileSelect = function ($files) {
                    $scope.file = $files[0];
                    $scope.isFileSelected = true;
                };

                function documentsURL(document) {
                    return API_VERSION + '/' + document.parentEntityType + '/' + document.parentEntityId + '/documents/' + document.id + '/attachment';
                };

                $scope.deleteDoc = function (documentId, index, tagValue) {
                    resourceFactory.documentsResource.delete({ entityType: $scope.entityType, entityId: $scope.entityId, documentId: documentId.id }, '', function (data) {
                        reComputeProfileRating($scope.clientId);
                        getClientAdditionalDocuments();
                    });
                };

                $scope.setFileName = function () {
                    for (var i in $scope.additionalDocumentNames) {
                        if ($scope.additionalDocumentNames[i].id == $scope.formData.tagIdentifier) {
                            $scope.filename = $scope.additionalDocumentNames[i].name;
                            $scope.formData.name = $scope.filename;
                        }
                    }
                }

                $scope.submitDocument = function () {
                    $upload.upload({
                        url: $rootScope.hostUrl + API_VERSION + '/' + $scope.entityType + '/' + $scope.entityId + '/documents',
                        data: $scope.formData,
                        file: $scope.file
                    }).then(function (data) {
                        getClientAdditionalDocuments();
                        if (!_.isUndefined($scope.formData) && !_.isUndefined($scope.formData.name)) {
                            var index = $scope.additionalDocumentNames.findIndex(x => x.name === $scope.formData.name);
                            if (index >= 0) {
                                $scope.availableDocumentNames.splice(index, 1);
                            }
                        }
                        $scope.formData = {};
                        $scope.filename = '';
                        angular.element('#file').val(null);
                        $scope.isFileSelected = false;
                        reComputeProfileRating($scope.clientId);
                    });
                };

                $scope.openViewDocument = function (documentDetail) {
                    $modal.open({
                        templateUrl: 'viewUploadedDocument.html',
                        controller: viewUploadedDocumentCtrl,
                        resolve: {
                            documentDetail: function () {
                                return documentDetail;
                            }
                        }
                    });
                };

                var viewUploadedDocumentCtrl = function ($scope, $modalInstance, documentDetail) {
                    $scope.data = documentDetail;
                    $scope.close = function () {
                        $modalInstance.close('close');
                    };
                };

                // Bank Details Part

                $scope.viewConfig = {
                    showSummary: false,
                    hasData: false,
                    approved: false
                };
                $scope.docData = {};
                $scope.repeatBankAccFormData = {};
                $scope.bankAccFormData = {};
                $scope.bankAccountTypeOptions = [];
                $scope.deFaultBankName = null;
                $scope.fileError = false;
                $scope.bankAccountDocuments = [];

                function init() {
                    resourceFactory.bankAccountDetailsResource.getAll({ entityType: $scope.entityType, entityId: $scope.entityId }, function (data) {
                        if (!_.isUndefined(data[0])) {
                            $scope.bankAccountDetailsId = data[0].id;
                            populateDetails();
                        } else {
                            populateTemplate();
                        }
                    });
                }

                init();

                function populateTemplate() {
                    resourceFactory.bankAccountDetailsTemplateResource.get({
                        entityType: $scope.entityType,
                        entityId: $scope.entityId
                    }, function (data) {
                        $scope.bankAccountTypeOptions = data.bankAccountTypeOptions;
                        $scope.bankAccFormData.accountTypeId = data.bankAccountTypeOptions[0].id;
                    });
                }

                function populateDetails() {
                    resourceFactory.bankAccountDetailsResource.get({
                        entityType: $scope.entityType,
                        entityId: $scope.entityId,
                        bankAccountDetailsId: getBankAccountDetails()
                    }, function (data) {
                        $scope.bankData = data;
                        $scope.bankAccountTypeOptions = $scope.bankData.bankAccountTypeOptions;
                        constructBankAccountDetails();
                        getBankAccountDocuments();
                    });
                }

                function constructBankAccountDetails() {
                    $scope.bankAccFormData = {
                        name: $scope.bankData.name,
                        accountNumber: $scope.bankData.accountNumber,
                        ifscCode: $scope.bankData.ifscCode,
                        micrCode: $scope.bankData.micrCode,
                        mobileNumber: $scope.bankData.mobileNumber,
                        email: $scope.bankData.email,
                        bankName: $scope.bankData.bankName,
                        bankCity: $scope.bankData.bankCity,
                        branchName: $scope.bankData.branchName
                    };
                    $scope.repeatBankAccFormData = {
                        accountNumberRepeat: $scope.bankData.accountNumber,
                        ifscCodeRepeat: $scope.bankData.ifscCode
                    };
                    if (!_.isUndefined($scope.bankData.lastTransactionDate)) {
                        $scope.bankAccFormData.lastTransactionDate = new Date(dateFilter($scope.bankData.lastTransactionDate, $scope.df));
                    }

                    if (!$scope.bankAccFormData.bankName) {
                        $scope.bankAccFormData.bankName = $scope.deFaultBankName;
                    }
                    if ($scope.bankData.accountType) {
                        $scope.bankAccFormData.accountTypeId = $scope.bankData.accountType.id;
                    } else {
                        $scope.bankAccFormData.accountTypeId = $scope.bankAccountTypeOptions[0].id;
                    }
                    $scope.bankAccountData = $scope.bankData;
                    if($scope.bankData.status.value == 'active'){
                        $scope.isDetailEditable = false;
                    }
                    if ($scope.bankData.accountNumber != undefined) {
                        $scope.viewConfig.hasData = true;
                        enableShowSummary();
                    } else {
                        disableShowSummary();
                    }

                    $scope.bankAccountDocuments = $scope.bankData.bankAccountDocuments || [];
                    for (var i = 0; i < $scope.bankAccountDocuments.length; i++) {
                        var docs = {};
                        docs = $rootScope.hostUrl + API_VERSION + '/' + $scope.entityType + '/' + $scope.entityId + '/documents/' + $scope.bankAccountDocuments[i].id + '/download';
                        $scope.bankAccountDocuments[i].docUrl = docs;
                    }
                    if (!_.isUndefined($scope.bankAccountDocuments) && $scope.bankAccountDocuments.length > 0) {
                        $scope.viewDocument($scope.bankAccountDocuments[0]);
                    }
                }

                function getBankAccountDocuments() {
                    resourceFactory.bankAccountDetailsDocumentsResource.getAllDocuments({
                        entityType: $scope.entityType,
                        entityId: $scope.entityId,
                        bankAccountDetailsId: getBankAccountDetails()
                    }, function (data) {
                        $scope.bankAccountDocuments = data.bankAccountDocuments;
                        for (var i = 0; i < $scope.bankAccountDocuments.length; i++) {
                            var docs = {};
                            if ($scope.bankAccountDocuments[i].storage && $scope.bankAccountDocuments[i].storage.toLowerCase() == 's3') {
                                docs = $rootScope.hostUrl + API_VERSION + '/' + $scope.bankAccountDocuments[i].parentEntityType + '/' + $scope.bankAccountDocuments[i].parentEntityId + '/documents/' + $scope.bankAccountDocuments[i].id + '/downloadableURL';
                            } else {
                                docs = $rootScope.hostUrl + API_VERSION + '/' + $scope.bankAccountDocuments[i].parentEntityType + '/' + $scope.bankAccountDocuments[i].parentEntityId + '/documents/' + $scope.bankAccountDocuments[i].id + '/download';
                            }
                            $scope.bankAccountDocuments[i].docUrl = docs;
                        }
                    });
                }

                function getBankAccountDetails() {
                    return $scope.bankAccountDetailsId;
                }

                $scope.createBankAccount = function () {
                    if (!isFormValid()) {
                        return false;
                    }
                    if ($scope.viewConfig.hasData) {
                        $scope.update();
                        return;
                    }
                    $scope.bankAccFormData.locale = scope.optlang.code;
                    $scope.bankAccFormData.dateFormat = scope.df;
                    submitData();
                };

                function submitData() {
                    resourceFactory.bankAccountDetailsResource.create({
                        entityType: $scope.entityType,
                        entityId: $scope.entityId
                    }, $scope.bankAccFormData,
                        function (data) {
                            $scope.bankAccountDetailsId = data.resourceId;
                            populateDetails();
                            reComputeProfileRating($scope.clientId);
                        });
                };

                function isFormValid() {
                    if (!$scope.isElemHidden('bankIFSCCodeRepeat')) {
                        if ($scope.bankAccFormData.ifscCode != $scope.repeatBankAccFormData.ifscCodeRepeat) {
                            return false;
                        }
                    }
                    if (!$scope.isElemHidden('bankAccountNumberRepeat')) {
                        if ($scope.bankAccFormData.accountNumber != $scope.repeatBankAccFormData.accountNumberRepeat) {
                            return false;
                        }
                    }
                    if ($scope.isElemMandatory('docFile')) {
                        if ((_.isUndefined($scope.docFile)) && (_.isUndefined($scope.imageId))) {
                            $scope.fileError = true;
                            return false;
                        }
                    }
                    return true;
                }

                $scope.edit = function () {
                    disableShowSummary();
                };

                $scope.update = function () {
                    if (!isFormValid()) {
                        return false;
                    }
                    $scope.bankAccFormData.locale = scope.optlang.code;
                    $scope.bankAccFormData.dateFormat = scope.df;
                    $scope.bankAccFormData.lastTransactionDate = dateFilter($scope.bankAccFormData.lastTransactionDate, scope.df);
                    updateData();
                };

                function updateData() {
                    resourceFactory.bankAccountDetailsResource.update({
                        entityType: $scope.entityType,
                        entityId: $scope.entityId,
                        bankAccountDetailsId: getBankAccountDetails()
                    }, $scope.bankAccFormData, function (data) {
                        reComputeProfileRating($scope.clientId);
                        populateDetails();
                    });
                }

                $scope.cancel = function () {
                    if ($scope.viewConfig.hasData) {
                        enableShowSummary();
                    }
                };

                function enableShowSummary() {
                    $scope.viewConfig.showSummary = true;
                }

                function disableShowSummary() {
                    $scope.viewConfig.showSummary = false;
                };

                $scope.uploadBankAccountDocument = function () {
                    $modal.open({
                        templateUrl: 'uploadBankAccountDocument.html',
                        controller: uploadBankAccountDocumentCtrl,
                        resolve: {
                            bankAccountDetails: function () {
                                return {
                                    'entityId': $scope.entityId,
                                    'entityType': $scope.entityType,
                                    'bankAccFormData': $scope.bankAccFormData,
                                    'bankAccountDocuments': $scope.bankAccountDocuments,
                                    'bankAccountDetailsId' : $scope.bankAccountDetailsId
                                };
                            }
                        }
                    });
                };

                var uploadBankAccountDocumentCtrl = function ($scope, $modalInstance, bankAccountDetails) {
                    $scope.data = {
                        documentName: ""
                    };

                    $scope.onFileSelect = function ($files) {
                        $scope.docFile = $files[0];
                    };

                    $scope.upload = function () {
                        if (!$scope.data.documentName) {
                            return false;
                        }

                        $scope.docData = {
                            name: $scope.data.documentName
                        };

                        if ($scope.docFile) {
                            if (!$scope.docFile.type.includes('image')) {
                                $scope.docformatErr = true;
                                $scope.docformatErrMsg = 'label.error.only.files.of.type.image.are.allowed';
                            } else {
                                $upload.upload({
                                    url: $rootScope.hostUrl + API_VERSION + '/' + bankAccountDetails.entityType + '/' + bankAccountDetails.entityId + '/bankaccountdetails/' + bankAccountDetails.bankAccountDetailsId + '/documents',
                                    data: $scope.docData,
                                    file: $scope.docFile
                                }).then(function (data) {
                                    if (data != undefined) {
                                        documentId = data.data.resourceId;
                                        if (documentId != undefined) {
                                            bankAccountDetails.bankAccFormData.documents = [];
                                            for (var j in bankAccountDetails.bankAccountDocuments) {
                                                bankAccountDetails.bankAccFormData.documents.push(bankAccountDetails.bankAccountDocuments[j].id);
                                            }
                                            bankAccountDetails.bankAccFormData.documents.push(documentId);
                                        }
                                        bankAccountDetails.bankAccFormData.locale = scope.optlang.code;
                                        resourceFactory.bankAccountDetailsResource.update({
                                            entityType: bankAccountDetails.entityType,
                                            entityId: bankAccountDetails.entityId,
                                            bankAccountDetailsId: getBankAccountDetails()
                                        }, bankAccountDetails.bankAccFormData, function (data) {
                                            populateDetails();
                                            reComputeProfileRating($scope.clientId);
                                        });
                                    }
                                });
                                $modalInstance.close('upload');
                            }
                        }
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                };

                $scope.viewDocument = function (document) {
                    var url = document.docUrl;
                    $http({
                        method: 'GET',
                        url: url
                    }).then(function (documentImage) {
                        $scope.documentImg = documentImage.data;
                    });
                }

                $scope.deleteDocument = function (documentId) {
                    $scope.bankAccFormData.locale = scope.optlang.code;
                    $scope.bankAccFormData.dateFormat = scope.df;
                    $scope.bankAccFormData.documents = [];
                    for (var i in $scope.bankAccountDocuments) {
                        $scope.bankAccFormData.documents.push($scope.bankAccountDocuments[i].id);
                    }
                    if (documentId) {
                        $scope.bankAccFormData.documents.splice($scope.bankAccFormData.documents.indexOf(documentId), 1);
                    }
                    updateData();
                };

                $scope.deleteBankAccountDocument = function (document) {
                    resourceFactory.bankAccountDetailsDocumentsResource.delete({
                        entityType: $scope.entityType,
                        entityId: $scope.entityId,
                        bankAccountDetailsId: $scope.bankAccountDetailsId
                    }, { 'documentId': document.id }, function (data) {
                        getBankAccountDocuments();
                    });
                };

                $scope.activateBankAccountDetails = function () {
                    resourceFactory.bankAccountDetailsActivateResource.activate({
                        entityType: $scope.entityType,
                        entityId: $scope.entityId,
                        bankAccountDetailsId: getBankAccountDetails()
                    }, {}, function (data) {
                        populateDetails();
                        enableShowSummary();
                    });
                };
                
                $scope.deActivateBankAccountDetails = function () {
                    resourceFactory.bankAccountDetailsDeActivateResource.deActivate({
                        entityType: $scope.entityType,
                        entityId: $scope.entityId,
                        bankAccountDetailsId: getBankAccountDetails()
                    }, {}, function (data) {
                        populateDetails();
                    });
                };
                $scope.activateBankAccountDetail = function () {
                    resourceFactory.bankAccountDetailsActivateResource.activate({
                        'entityId': $scope.entityId,
                        'entityType': $scope.entityType,
                        bankAccountDetailsId: $scope.bankAccountDetailsId
                    }, {}, function (data) {
                            populateDetails();
                            enableShowSummary();
                        }
                    );
                };
            };

            scope.refreshTask = function () {
                initTask();
            }
        }
    });
    mifosX.ng.application.controller('AdditionalDetailsActivityController', ['$controller', '$scope', '$modal', 'ResourceFactory', 'dateFilter', '$http', '$rootScope', '$upload', 'API_VERSION', 'PopUpUtilService', mifosX.controllers.AdditionalDetailsActivityController]).run(function ($log) {
        $log.info("AdditionalDetailsActivityController initialized");
    });
}(mifosX.controllers || {}));