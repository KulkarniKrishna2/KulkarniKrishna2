(function(module) {
    mifosX.controllers = _.extend(module, {
        CGTBasicActivityController: function($controller, scope, routeParams, $modal, resourceFactory, location, dateFilter, route, $http, $rootScope,commonUtilService, $route, $upload, API_VERSION, dateFilter, popUpUtilService) {
            angular.extend(this, $controller('defaultActivityController', {
                $scope: scope
            }));

            scope.loanIds = [];
            scope.first = {};
            scope.first.date = new Date();
            scope.formData = {};
            scope.entityType = "loans";

            function initTask() {
                scope.$parent.clientsCount();
                scope.centerId = scope.taskconfig.centerId;
                scope.taskInfoTrackArray = [];
                scope.isAllClientFinishedThisTask = true;
                scope.clientProfileRatingScoreForSuccess = 0;
                scope.isLoanPurposeEditable= true;
                if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.workflow &&
                    scope.response.uiDisplayConfigurations.workflow.CGTValidation && scope.response.uiDisplayConfigurations.workflow.CGTValidation.profileRatingPercentage) {
                    scope.clientProfileRatingScoreForSuccess = scope.response.uiDisplayConfigurations.workflow.CGTValidation.profileRatingPercentage;
                }
                resourceFactory.centerWorkflowResource.get({
                    centerId: scope.centerId,
                    eventType : scope.eventType,
                    associations: 'groupMembers,profileratings,loanaccounts,clientcbcriteria'
                }, function(data) {
                    scope.centerDetails = data;
                    scope.rejectTypes = data.rejectTypes;
                    scope.clientClosureReasons = data.clientClosureReasons;
                    scope.groupClosureReasons = data.groupClosureReasons;
                    scope.officeId = scope.centerDetails.officeId;
                    scope.centerDetails.isAllChecked = false;
                    //logic to disable and highlight member
                    for(var i = 0; i < scope.centerDetails.subGroupMembers.length; i++){
                        if(scope.centerDetails.subGroupMembers[i].memberData){
                            for(var j = 0; j < scope.centerDetails.subGroupMembers[i].memberData.length; j++){

                                var clientLevelTaskTrackObj =  scope.centerDetails.subGroupMembers[i].memberData[j].clientLevelTaskTrackingData;
                                var clientLevelCriteriaObj =  scope.centerDetails.subGroupMembers[i].memberData[j].clientLevelCriteriaResultData;
                                scope.centerDetails.subGroupMembers[i].memberData[j].allowLoanRejection = false;
                                scope.centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = false;
                                if(clientLevelTaskTrackObj == undefined){
                                    scope.centerDetails.subGroupMembers[i].memberData[j].isClientFinishedThisTask = true;
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

            scope.generateDocument = function(activeClientMember) {
                resourceFactory.reportGenerateResource.generate({
                    entityType: scope.entityType,
                    entityId: activeClientMember.loanAccountBasicData.id
                }, function(data) {
                    activeClientMember.document = {};
                    activeClientMember.loanAccountBasicData.documentId = data.resourceId;
                })
            };

            scope.reGenerateDocument = function (activeClientMember){
                resourceFactory.documentsGenerateResource.reGenerate({entityType: scope.entityType, entityId: activeClientMember.loanAccountBasicData.id, identifier: activeClientMember.document.id }, function(data){
                    activeClientMember.document = {};
                    activeClientMember.loanAccountBasicData.documentId = data.resourceId;
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
                //tracking request validation
                if(scope.taskInfoTrackArray.length == 0){
                    scope.errorDetails = [];
                    return scope.errorDetails.push([{code: 'error.msg.select.atleast.one.member'}])
                }
                if(scope.errorDetails){
                    delete scope.errorDetails;
                }
                scope.batchRequests = [];

                //cgt request body formation
                var completedDate = dateFilter(scope.first.date, scope.df);
                this.formData.dateFormat = scope.df;
                this.formData.locale = scope.optlang.code;
                this.formData.loanAccounts = scope.loanIds;
                this.formData.completedDate = completedDate;
                this.formData.loanOfficerId = scope.centerDetails.staffId;
                var relativeUrl = "cgt/completiondate";
                var requestSequence = 1;
                scope.batchRequests.push({requestId: requestSequence, relativeUrl: relativeUrl,
                            method: "POST", body: JSON.stringify(scope.formData)});

                //tracking request body formation 
                scope.taskTrackingFormData = {};
                scope.taskTrackingFormData.taskInfoTrackArray = [];
                scope.taskTrackingFormData.taskInfoTrackArray = scope.taskInfoTrackArray.slice();
                var relativeTrackUrl = "tasktracking/clientlevel";
                requestSequence = requestSequence + 1;
                scope.batchRequests.push({requestId: requestSequence, relativeUrl: relativeTrackUrl,
                            method: "POST", body: JSON.stringify(scope.taskTrackingFormData)});

                //batch call
                resourceFactory.batchResource.post({'enclosingTransaction':true},scope.batchRequests, function (data) {
                    initTask();
                });

            };

            //client profile rating 
            function getprofileRating(clientId){
                resourceFactory.profileRating.get({entityType: 1,entityId : clientId}, function (data) {
                    scope.profileRatingData = data;
                });
                initTask();
            };
            scope.validateClient = function(activeClientMember){
                if(activeClientMember.profileRatingScoreData){
                   return (activeClientMember.profileRatingScoreData.finalScore *20 < scope.clientProfileRatingScoreForSuccess); 
                }
                return true;
            };

            scope.score = function(activeClientMember){
                if(activeClientMember && activeClientMember.profileRatingScoreData && activeClientMember.profileRatingScoreData.finalScore){
                    var tempscore = activeClientMember.profileRatingScoreData.finalScore * 20 || 0;
                    return "'"+tempscore+"%'";
                }
                return '0%';
            }

            
            scope.reComputeProfileRating = function (clientId) {
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
                            scope.profileRatingData.entityId =  clientId;
                            break;
                        }
                    }
                    scope.profileRatingData.locale = "en";
                    resourceFactory.computeProfileRating.save(scope.profileRatingData, function (response) {
                        getprofileRating(clientId);
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
                        if ($scope.date.second != undefined && $scope.date.second != '') {
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
                        scope.reComputeProfileRating($scope.clientId);
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
                            scope.reComputeProfileRating($scope.clientId);
                        });
                };

                $scope.close = function () {
                    $modalInstance.dismiss('close');
                    initTask();
                };
                $scope.getSurveyDetails = function() {
                    $scope.survayData = {};
                    $scope.isValidEntityType = false;
                    $scope.isSurveyDone = true;
                    scope.surveyEntityTypeId = scope.response.uiDisplayConfigurations.viewClient.surveyEntityTypeId;
                    if(scope.surveyEntityTypeId.length > 0){
                        resourceFactory.takeSurveysResource.getAll({entityType : scope.surveyEntityTypeId,entityId:$scope.clientId}, function (surveys) {
                            $scope.surveys = surveys;
                            if($scope.surveys.length > 0){
                                $scope.viewSurveyDetails = true;
                            }else{
                                if($scope.surveyName.length > 0){
                                    resourceFactory.surveyResourceByName.getBySurveyName({surveyName: $scope.surveyName}, function (surveyData) {
                                        $scope.viewSurveyDetails = false;
                                        $scope.isValidEntityType = true;
                                        $scope.completeSurveyData = surveyData;
                                        $scope.surveyData = {};
                                        $scope.surveyId = surveyData.id;
                                        $scope.entityTypeId = surveyData.entityTypeId;
                                        $scope.questionDatas = surveyData.questionDatas;
                                    });
                                }
                            }
                        });
                    }

                }

                $scope.submitSurveyDetails = function(){
                    $scope.survayData = {};
                    $scope.survayData.surveyId = $scope.surveyId;
                    $scope.survayData.entityId = $scope.clientId;
                    $scope.survayData.surveyedOn = new Date();
                    $scope.survayData.surveyedBy = scope.centerDetails.staffId;
                    if(!_.isUndefined($scope.survayData.scorecardValues)){
                        $scope.survayData.scorecardValues = [];
                    }
                    var responseCount=0;
                    if($scope.questionDatas && $scope.questionDatas.length > 0){
                        for(var i in $scope.questionDatas){
                            if($scope.questionDatas[i].responseDatas){
                                for(var j in $scope.questionDatas[i].responseDatas){
                                    if($scope.questionDatas[i].responseDatas[j].responseId && $scope.questionDatas[i].responseDatas[j].responseId > 0){
                                        if(_.isUndefined($scope.survayData.scorecardValues)){
                                            $scope.survayData.scorecardValues = [];
                                        }
                                        responseCount = responseCount+1;
                                        var scorecardValue = {};
                                        scorecardValue.questionId  = $scope.questionDatas[i].id;
                                        scorecardValue.responseId  = $scope.questionDatas[i].responseDatas[j].responseId;
                                        scorecardValue.value  = $scope.questionDatas[i].responseDatas[j].value;
                                        $scope.survayData.scorecardValues.push(scorecardValue);
                                    }
                                }
                            }
                        }
                    }
                    if($scope.questionDatas.length>0 && $scope.questionDatas.length!=responseCount){
                        $scope.isSurveyDone = false;
                        return false;
                    }else{
                        $scope.isSurveyDone = true;
                    }
                    resourceFactory.takeSurveysResource.post({entityType: $scope.entityTypeId,entityId: $scope.clientId},$scope.survayData, function (data) {
                        $scope.viewSurveyDetails = true;
                        resourceFactory.takeSurveysResource.getAll({entityType : $scope.entityTypeId,entityId:$scope.clientId}, function (surveys) {
                            $scope.surveys = surveys;
                            scope.reComputeProfileRating($scope.clientId);
                        });
                    });
                }
                $scope.closeSurveyForm = function(){
                    $modalInstance.dismiss('takeNewSurveyFrom');
                }
                $scope.removeIndex = function (questionIndex, index) {
                    if (!_.isUndefined(questionIndex) && !_.isUndefined(index)) {
                        if ($scope.questionDatas[questionIndex] && $scope.questionDatas[questionIndex].responseDatas) {
                            for (var i = 0; i < $scope.questionDatas[questionIndex].responseDatas.length; i++) {
                                if (i != index && $scope.questionDatas[questionIndex].responseDatas[i].responseId) {
                                    $scope.questionDatas[questionIndex].responseDatas[i].responseId = undefined;
                                }
                            }
                        }
                    }

                };
            }

            scope.editLoan = function (loanAccountBasicData, groupId) {
                scope.groupId = groupId;
                scope.loanAccountBasicData = loanAccountBasicData;
                var templateUrl = 'views/task/popup/editLoan.html';
                var controller = 'EditLoanController';
                popUpUtilService.openFullScreenPopUp(templateUrl, controller, scope);
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
                            if(member.loanAccountBasicData){
                                return { 'memberId': member.id,
                                'memberName': member.displayName,
                                'fcsmNumber':member.fcsmNumber,
                                'loanId':member.loanAccountBasicData.id,
                                'allowLoanRejection' : member.allowLoanRejection };
                            }
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
                if(memberParams.loanId){
                   $scope.loanId =  memberParams.loanId;
                }
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
                    if($scope.rejectClientData.rejectType != 4){
                        resourceFactory.clientResource.save({clientId: memberParams.memberId, command: 'close'}, $scope.rejectClientData, function (data) {
                       $modalInstance.dismiss('cancel');
                       initTask();
                    });
                    }else{
                        var loanRejectData = {rejectedOnDate:$scope.rejectClientData.closureDate,
                                              locale:scope.optlang.code,
                                              dateFormat:scope.df,
                                              rejectReasonId:$scope.rejectClientData.closureReasonId
                                             };

                        var params = {command: 'reject',loanId:$scope.loanId};
                        resourceFactory.LoanAccountResource.save(params, loanRejectData, function (data) {
                            $modalInstance.dismiss('cancel');
                            initTask();
                        });
                    };
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
                                'fcsmNumber':member.fcsmNumber
                            };
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
            scope.download = function(activeClientMember) {
                var url = {};
                url =$rootScope.hostUrl + API_VERSION + '/' + scope.entityType + '/' + activeClientMember.loanAccountBasicData.id + '/documents/' + activeClientMember.loanAccountBasicData.documentId + '/attachment';
                commonUtilService.downloadFile(url," ");
            }
            scope.validateAllClients = function(centerDetails,isAllChecked){
                scope.taskInfoTrackArray = [];
                for(var i in centerDetails.subGroupMembers){
                    for(var j in centerDetails.subGroupMembers[i].memberData){
                        var activeClientMember = centerDetails.subGroupMembers[i].memberData[j];
                        if(isAllChecked){
                            if(activeClientMember.status.code != 'clientStatusType.onHold' && activeClientMember.profileRatingScoreData.finalScore *20 >= scope.clientProfileRatingScoreForSuccess && !activeClientMember.isClientFinishedThisTask){
                                centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = true;
                                scope.captureMembersToNextStep(activeClientMember.id, activeClientMember.loanAccountBasicData.id, activeClientMember.isMemberChecked);
                                scope.addLoan(activeClientMember.isMemberChecked,activeClientMember.loanAccountBasicData.id);
                            }
                        }else{
                            centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = false;
                            scope.addLoan(activeClientMember.isMemberChecked,activeClientMember.loanAccountBasicData.id);
                        }

                    }
                }
            }

            scope.refreshTask = function () {
                initTask();
            }
        }
    });
    mifosX.ng.application.controller('CGTBasicActivityController', ['$controller', '$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter', '$route', '$http', '$rootScope','CommonUtilService', '$route', '$upload', 'API_VERSION', 'dateFilter', 'PopUpUtilService', mifosX.controllers.CGTBasicActivityController]).run(function($log) {
        $log.info("CGTBasicActivityController initialized");
    });
}(mifosX.controllers || {}));