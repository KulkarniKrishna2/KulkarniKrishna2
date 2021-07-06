(function (module) {
    mifosX.controllers = _.extend(module, {
        DisbursalActivityController: function ($controller, scope, routeParams, $modal, resourceFactory, location, dateFilter, ngXml2json, route, $http, $rootScope, $sce, CommonUtilService, $route, $upload, API_VERSION, popUpUtilService) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));

            scope.hideExpectedDisbursementDate = false;
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.workflow &&
                scope.response.uiDisplayConfigurations.workflow.hiddenFields) {
                scope.hideExpectedDisbursementDate = scope.response.uiDisplayConfigurations.workflow.hiddenFields.expectedDisbursementDate;
            }

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
                              if(!_.isUndefined(scope.centerDetails.subGroupMembers[i].memberData[j].loanAccountBasicData)){
                                scope.centerDetails.subGroupMembers[i].memberData[j].filteredCharges = scope.filterCharges(scope.centerDetails.subGroupMembers[i].memberData[j].loanAccountBasicData.charges);
                              }
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
                if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.workflow &&
                    scope.response.uiDisplayConfigurations.workflow.isReadOnlyField) {
                    scope.isLoanProductReadOnly = scope.response.uiDisplayConfigurations.workflow.isReadOnlyField.loanProductForSpecificSteps;
                }
                var templateUrl = 'views/task/popup/editLoan.html';
                var controller = 'EditLoanController';
                popUpUtilService.openFullScreenPopUp(templateUrl, controller, scope);
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
                    if(loanData.expectedDisbursementOnDate && !scope.hideExpectedDisbursementDate){
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
                    if(!scope.hideExpectedDisbursementDate){
                        $scope.formData.actualDisbursementDate = new Date($scope.loanAccountData.expectedDisbursementOnDate);
                    }
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
                        $scope.showPaymentTypeForRepaymentAtDisbursement = data.isRepaymentAtDisbursement;
                        if(data.isRepaymentAtDisbursement){
                            $scope.formData.paymentTypeForRepaymentAtDisbursement = data.paymentTypeForRepaymentAtDisbursement;
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

            scope.refreshTask = function () {
                initTask();
            }
        }
    });
    mifosX.ng.application.controller('DisbursalActivityController', ['$controller', '$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter', 'ngXml2json', '$route', '$http', '$rootScope', '$sce', 'CommonUtilService', '$route', '$upload', 'API_VERSION', 'PopUpUtilService', mifosX.controllers.DisbursalActivityController]).run(function ($log) {
        $log.info("DisbursalActivityController initialized");
    });
}(mifosX.controllers || {}));