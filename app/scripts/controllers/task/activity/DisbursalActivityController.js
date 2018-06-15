(function (module) {
    mifosX.controllers = _.extend(module, {
        DisbursalActivityController: function ($controller, scope, routeParams, $modal, resourceFactory, location, dateFilter, ngXml2json, route, $http, $rootScope, $sce, CommonUtilService, $route, $upload, API_VERSION) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));

            function initTask() {
                scope.centerId = scope.taskconfig.centerId;
                resourceFactory.centerWorkflowResource.get({ centerId: scope.centerId, associations: 'groupMembers,profileratings,loanaccounts,clientcbcriteria' }, function (data) {
                    scope.centerDetails = data;
                    //logic to disable and highlight member
                    for(var i = 0; i < scope.centerDetails.subGroupMembers.length; i++){

                        for(var j = 0; j < scope.centerDetails.subGroupMembers[i].memberData.length; j++){

                              var clientLevelTaskTrackObj =  scope.centerDetails.subGroupMembers[i].memberData[j].clientLevelTaskTrackingData;
                              var clientLevelCriteriaObj =  scope.centerDetails.subGroupMembers[i].memberData[j].clientLevelCriteriaResultData;
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
                });

            };
            initTask();

            scope.loanDisburse = function (groupId, activeClientMember) {
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

            var LoanDisburseCtrl = function ($scope, $modalInstance, memberParams) {
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

                //loan account
                if (memberParams.activeClientMember.loanAccountBasicData) {
                    $scope.loanAccountData = memberParams.activeClientMember.loanAccountBasicData;
                    $scope.loanId = $scope.loanAccountData.id;
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
                function formDisbursementData() {
                    resourceFactory.loanTrxnsTemplateResource.get({loanId: $scope.loanId, command: 'disburse'}, function (data) {
                        $scope.paymentTypes = data.paymentTypeOptions;
                        if(data.loanEMIPacks){
                            $scope.loanEMIPacks = data.loanEMIPacks;
                            if(data.loanEMIPackData){
                               $scope.formData.loanEMIPackId = data.loanEMIPackData.id;
                            }
                        }
                        
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
                    if($scope.clientId != null && scope.taskData.id !=null && $scope.loanId){
                        $scope.taskInfoTrackArray.push(
                            {'clientId' : $scope.clientId, 
                             'currentTaskId' : scope.taskData.id,
                             'loanId' : $scope.loanId})
                    }    

                    //tracking request validation
                    $scope.errorDetails = [];
                    if($scope.taskInfoTrackArray.length == 0){
                        return $scope.errorDetails.push([{code: 'error.msg.select.atleast.one.member'}])
                    }

                    $scope.batchRequests = [];

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
                    var relativeUrl = "loans/" + $scope.loanId + "?command=disburse"
                    var requestSequence = 1;
                    $scope.batchRequests.push({requestId: requestSequence, relativeUrl: relativeUrl,
                            method: "POST", body: JSON.stringify(this.formData)});


                   //tracking request body formation 
                    $scope.taskTrackingFormData = {};
                    $scope.taskTrackingFormData.taskInfoTrackArray = [];
                    $scope.taskTrackingFormData.taskInfoTrackArray = $scope.taskInfoTrackArray.slice();
                    var relativeTrackUrl = "tasktracking/clientlevel";
                    requestSequence = requestSequence + 1;
                    $scope.batchRequests.push({requestId: requestSequence, relativeUrl: relativeTrackUrl,
                                method: "POST", body: JSON.stringify($scope.taskTrackingFormData)});

                    //batch call
                    resourceFactory.batchResource.post({'enclosingTransaction':true},$scope.batchRequests, function (data) {
                        $modalInstance.close();
                        initTask();
                    });


                    /*resourceFactory.LoanAccountResource.save({loanId: $scope.loanId, command: 'disburse'}, this.formData, function (data) {
                        $modalInstance.dismiss('cancel');
                    });*/
                }  

            }
        }
    });
    mifosX.ng.application.controller('DisbursalActivityController', ['$controller', '$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter', 'ngXml2json', '$route', '$http', '$rootScope', '$sce', 'CommonUtilService', '$route', '$upload', 'API_VERSION', mifosX.controllers.DisbursalActivityController]).run(function ($log) {
        $log.info("DisbursalActivityController initialized");
    });
}(mifosX.controllers || {}));