(function (module) {
    mifosX.controllers = _.extend(module, {
        CreditBureauCheckActivityController: function ($controller, scope, routeParams, $modal, resourceFactory, location, dateFilter, ngXml2json, route, $http, $rootScope, $sce, CommonUtilService, $route, $upload, API_VERSION) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));

            scope.showBulkCBInitiate = false;

            function initTask() {
                scope.$parent.clientsCount();
                scope.centerId = scope.taskconfig.centerId;
                scope.taskInfoTrackArray = [];
                scope.isAllClientFinishedThisTask = true;
                scope.isLoanPurposeEditable= true;
                resourceFactory.centerWorkflowResource.get({ centerId: scope.centerId, eventType : scope.eventType, associations: 'groupMembers,loanaccounts,cbexistingloanssummary,clientcbcriteria,loanproposalreview,memberattendance'}, function (data) {
                    scope.centerDetails = data;
                    scope.rejectTypes = data.rejectTypes;
                    scope.clientClosureReasons = data.clientClosureReasons;
                    scope.groupClosureReasons = data.groupClosureReasons;
                    scope.officeId = scope.centerDetails.officeId;
                    scope.centerDetails.isAllChecked = false;
                    for(var i in scope.centerDetails.subGroupMembers){
                        for(var j in scope.centerDetails.subGroupMembers[i].memberData){
                            if(!scope.centerDetails.subGroupMembers[i].memberData[j].cbExistingLoansSummaryData && scope.centerDetails.subGroupMembers[i].memberData[j].loanAccountBasicData){
                                scope.showBulkCBInitiate = true;
                                break;
                            }
                        }
                    }
                    //logic to disable and highlight member
                    for(var i = 0; i < scope.centerDetails.subGroupMembers.length; i++){
                        if(scope.centerDetails.subGroupMembers[i].memberData){
                            for(var j = 0; j < scope.centerDetails.subGroupMembers[i].memberData.length; j++){

                                var clientLevelTaskTrackObj =  scope.centerDetails.subGroupMembers[i].memberData[j].clientLevelTaskTrackingData;
                                var clientLevelCriteriaObj =  scope.centerDetails.subGroupMembers[i].memberData[j].clientLevelCriteriaResultData;
                                scope.centerDetails.subGroupMembers[i].memberData[j].allowLoanRejection = true;
                                scope.centerDetails.subGroupMembers[i].memberData[j].isMemberChecked = false;
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

            scope.initiateCreditBureauReport = function (client) {
                if(client.pendingCbEnquiryId){
                    scope.refreshData(client.loanAccountBasicData.id,client.pendingCbEnquiryId);
                }else{
                    scope.errorDetails=[];
                    scope.entityType = "loan";
                    scope.isForce = false;
                    scope.isClientCBCriteriaToRun = true;
                    var loanId = client.loanAccountBasicData.id;
                    resourceFactory.creditBureauReportResource.get({
                        entityType: scope.entityType,
                        entityId: loanId,
                        isForce: scope.isForce,
                        isClientCBCriteriaToRun : scope.isClientCBCriteriaToRun
                    }, function (loansSummary) {
                        scope.checkCBData = loansSummary;
                        scope.getCbEnquiryData(scope.checkCBData.creditBureauEnquiryId);
                    });
                }
                
            };

            scope.getCbEnquiryData = function(enquiryId){
                resourceFactory.creditBureauReportSummaryByEnquiryIdResource.get({'enquiryId' : enquiryId},function(summary){
                    scope.checkCBData = summary;
                    if(scope.checkCBData != null && scope.checkCBData.errors == null){
                        initTask();
                    }else{
                        if(scope.checkCBData != null && scope.checkCBData.errors != null){
                            var errorObj = new Object();
                            errorObj.args = {
                                params: []
                            };
                            var description = scope.checkCBData.errors[0].description;
                            errorObj.args.params.push({value: description});

                            return scope.errorDetails.push(errorObj);
                        }
                    }
                    
                })
            }


            scope.refreshData = function(loanId, enquiryId){
                resourceFactory.fetchCreditBureauReportByEnquiryIdResource.get({
                    enquiryId: enquiryId,
                    entityType: "loan",
                    entityId: loanId,
                    isClientCBCriteriaToRun : true
                }, function(data) {
                    scope.getCbEnquiryData(enquiryId);                    
                });

            };


            scope.initiateBulkCreditBureauReport = function () {
                scope.errorDetails = [];
                scope.entityType = "center";
                scope.isForce = false;
                scope.isClientCBCriteriaToRun = true;

                resourceFactory.creditBureauBulkReportResource.get({
                    entityType: scope.entityType,
                    entityId:  scope.centerId ,
                    isForce: scope.isForce,
                    isClientCBCriteriaToRun : scope.isClientCBCriteriaToRun
                }, function (loansSummary) {
                    if(loansSummary != null && loansSummary[0].errors == null){
                        initTask();
                    }else{
                        if(loansSummary != null && loansSummary[0].errors != null){
                            var errorObj = new Object();
                            var description = loansSummary[0].errors[0].description;
                            errorObj.args = {
                                params: []
                            };
                            errorObj.args.params.push({value: description});
                            return scope.errorDetails.push(errorObj);
                        }
                    }
                });
            };

            scope.openViewDocument = function(enquiryId) {
                scope.reportEntityType = "CreditBureau";
                var url = $rootScope.hostUrl + '/fineract-provider/api/v1/enquiry/creditbureau/' + scope.reportEntityType + '/' +
                    enquiryId + '/attachment?' + CommonUtilService.commonParamsForNewWindow();
                url = $sce.trustAsResourceUrl(url);
                $http.get(url, { responseType: 'arraybuffer' }).
                success(function(data, status, headers, config) {
                    var supportedContentTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/html', 'application/xml'];
                    var contentType = headers('Content-Type');
                    var file = new Blob([data], { type: contentType });
                    var fileContent = URL.createObjectURL(file);
                    if (supportedContentTypes.indexOf(contentType) > -1) {
                        var docData = $sce.trustAsResourceUrl(fileContent);
                        window.open(docData);
                    }
                });
            };

            //Credit Bureau Review
            scope.captureReviewReason = function(clientId, loanId, reviewId){
                $modal.open({
                    templateUrl : 'views/task/popup/loanproposalreview.html',
                    controller : reviewReasonCtrl,
                    backdrop: 'static',
                    windowClass: 'app-modal-window-full-screen',
                    resolve: {
                        reviewParameterInfo: function () {
                            return { 'clientId': clientId, 'loanId': loanId, 'reviewId' : reviewId };
                        }
                    }
                })
            }

            var reviewReasonCtrl = function($scope, $modalInstance, reviewParameterInfo){
				$scope.df = scope.df;
                $scope.clientId = reviewParameterInfo.clientId;
                $scope.loanId = reviewParameterInfo.loanId;
                $scope.reviewId = reviewParameterInfo.reviewId;
                $scope.reviewFormData = {};
                $scope.isReasonNotesMandatory = false;
                $scope.isAttachmentMandatory = false;
                $scope.isPrepayAtBSSReason = false;
                $scope.isErrorneousReason = false;
                $scope.isPrepayAtBSSReason = false;
                $scope.isOutstandingReason = false;
                $scope.showReasonNotesOption = true;
                $scope.showAttachmentOption = false;
                $scope.clientLoanAccounts = [];
                $scope.preClosureTempFormData = [];
                $scope.preClosureFormData = [];
                $scope.isAccChecked = false;

                resourceFactory.loanProposalReviewTemplateResource.get({loanId: $scope.loanId}, function (data) {
                   $scope.codeValues = data;
                });

                $scope.reviewReasonChange = function(reviewReasonId){
                    for(var i = 0; i < $scope.codeValues.length; i++){
                        if($scope.codeValues[i].id == reviewReasonId){
                            if($scope.codeValues[i].systemIdentifier == "OSDPD"){
                                $scope.isReasonNotesMandatory = true;
                                $scope.isAttachmentMandatory = true;
                                $scope.isPrepayAtBSSReason = false;
                                $scope.isErrorneousReason = false;
                                $scope.showReasonNotesOption = true;
                                $scope.showAttachmentOption = true;
                                $scope.isOutstandingReason = true;
                                $scope.preClosureTempFormData = [];
                                 $scope.isAccChecked = false;
                            }
                            if($scope.codeValues[i].systemIdentifier == "PPBSS"){
                                $scope.isReasonNotesMandatory = false;
                                $scope.isAttachmentMandatory = false;
                                $scope.isPrepayAtBSSReason = true;
                                $scope.showReasonNotesOption = true;
                                $scope.showAttachmentOption = false;
                                $scope.isErrorneousReason = false;
                                $scope.isOutstandingReason = false;
                                 resourceFactory.clientAccountsOverviewsResource.get({clientId: $scope.clientId}, function (data) {
                                    $scope.clientLoanAccounts = data.loanAccounts;
                                });
                            }
                            if($scope.codeValues[i].systemIdentifier == "ERCB" || $scope.codeValues[i].systemIdentifier == "BLCNT"){
                                $scope.isReasonNotesMandatory = false;
                                $scope.isAttachmentMandatory = false;
                                $scope.isPrepayAtBSSReason = false;
                                $scope.showReasonNotesOption = true;
                                $scope.showAttachmentOption = false;
                                $scope.isOutstandingReason = false;
                                $scope.isErrorneousReason = true;
                                $scope.preClosureTempFormData = [];
                                $scope.isAccChecked = false;
                            }
                        }
                    }
                }

                $scope.close = function () {
                    $modalInstance.dismiss('close');
                };

                $scope.detectPreclosureAccount = function(loanAccount,isAccChecked,idx){
                    if(isAccChecked){
                        $scope.preClosureTempFormData.push(
                            {'preclosureLoanId' : loanAccount.id, 
                             'preclosureAmount' : loanAccount.loanBalance,
                             'locale' : scope.optlang.code,
                             'dateFormat' : scope.df});
                    }else{
                        $scope.preClosureTempFormData[idx] = undefined;
                    }

                }

                $scope.onFileSelect = function ($files) {
                  $scope.file = $files[0];
                };

                $scope.submitReview = function(){
                    $scope.errorDetails = [];
                    $scope.reviewFormData.locale = scope.optlang.code;
                    $scope.reviewFormData.clientId = $scope.clientId;
                    if($scope.isOutstandingReason){
                        if($scope.file == undefined){
                            return $scope.errorDetails.push([{code: 'error.msg.file.mandatory'}]);
                        }
                        if($scope.reviewFormData.reviewReasonNotes == undefined){
                            return $scope.errorDetails.push([{code: 'error.msg.reason.notes.mandatory'}]);
                        }
                         $upload.upload({
                            url: $rootScope.hostUrl + API_VERSION + '/loans/' + $scope.loanId + '/proposalreview/withattachment',
                            data: {'data' : $scope.reviewFormData} ,
                            file: $scope.file
                        }).then(function (data) {
                            $modalInstance.close();
                             initTask();
                        });
                    }

                    
                    if($scope.isPrepayAtBSSReason){
                        if($scope.preClosureTempFormData == undefined || $scope.preClosureTempFormData.length == 0){
                            return $scope.errorDetails.push([{code: 'error.msg.select.prepay.account'}]);
                        }
                        for (var i in $scope.preClosureTempFormData) {
                            if ($scope.preClosureTempFormData[i].preclosureDate) {
                                var reqDate = dateFilter($scope.preClosureTempFormData[i].preclosureDate, scope.df);
                                $scope.preClosureTempFormData[i].preclosureDate = reqDate;
                                $scope.errorDetails = [];
                            } else {
                                return $scope.errorDetails.push([{
                                    code: 'error.msg.preclosure.date.required'
                                }]);
                            }
                        }
                      
                        $scope.reviewFormData.preclosures = [];
                        $scope.reviewFormData.preclosures = $scope.preClosureTempFormData.slice();
                    }
                    
                    if($scope.isPrepayAtBSSReason || $scope.isErrorneousReason){
                        resourceFactory.loanProposalReviewResource.save({loanId: $scope.loanId}, $scope.reviewFormData, function (data) {
                          $modalInstance.close();
                          initTask();
                        });
                    }   
                }

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }//end of reviewReasonCtrl

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
                $scope.clientData = {};
                $scope.clientMaritalStatus = {};


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

                resourceFactory.clientResource.get({ clientId: $scope.clientId }, function (data) {
                    if (data != null && data != undefined) {
                        $scope.clientData = data;
                        if (data.maritalStatus != null && data.maritalStatus != undefined) { $scope.clientMaritalStatus = data.maritalStatus; }
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
                                    if (charge.chargeCategoryType.value != "doubleInsuranceCharge") { $scope.charges.push(charge) }
                                    else {
                                        if ($scope.clientMaritalStatus.name == "Married") {
                                            $scope.charges.push(charge)
                                        }
                                    }
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
                    if ((charge.chargeCalculationType.value == 'slabBasedCharge') || charge.isAmountNonEditable || charge.isSlabBased) {
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
                                if ($scope.clientData.staffId != null) {
                                    for (var i in $scope.loanaccountinfo.loanOfficerOptions) {
                                        if ($scope.loanaccountinfo.loanOfficerOptions[i].id == $scope.clientData.staffId) {
                                            $scope.loanAccountFormData.loanOfficerId = $scope.clientData.staffId;
                                            break;
                                        }
                                    }
                                }
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
                    if(data.loanPurposeId) {
                        resourceFactory.loanPurposeGroupResource.getAll({isFetchLoanPurposeDatas: 'true'}, function (loanPurposeGroupsdata) {
                            $scope.loanPurposeGroups = loanPurposeGroupsdata;
                            $scope.getParentLoanPurpose(data.loanPurposeId);
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
                $scope.getParentLoanPurpose = function(loanPurposeId) {
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
                if(!memberParams.allowLoanRejection){
                    var idx = $scope.rejectTypes.findIndex(x => x.code == 'rejectType.loanRejection');
                    if(idx >= 0){
                        $scope.rejectTypes.splice(idx,1);
                    }    
                }
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
            //end rejection controller

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

            //CB critieria result view
            scope.openViewCBCriteriaResult = function(criteriaResult){
                    var templateUrl = 'views/task/popup/clientcbcriteriaresult.html';
                    $modal.open({
                        templateUrl: templateUrl,
                        controller: viewClientCBCriteriaResultCtrl,
                        windowClass: 'modalwidth700',
                        resolve: {
                            memberParams: function () {
                                return { 'criteriaResult': criteriaResult };
                            }
                        }
                    });
            }

            var viewClientCBCriteriaResultCtrl = function ($scope, $modalInstance, memberParams) {
				$scope.df = scope.df;
                $scope.cbCriteriaResult = JSON.parse(memberParams.criteriaResult);

                $scope.close = function () {
                    $modalInstance.dismiss('close');
                };
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
            scope.showCBInitiate = function(member){
                if(member.cbExistingLoansSummaryData && member.loanAccountBasicData){
                    if(member.cbExistingLoansSummaryData.isCBReportExpired){
                        return true;
                    }else{
                        return false;
                    }
                }
                return true;
            }
            scope.hideClient = function(activeClientMember){
                if(activeClientMember.status.code == 'clientStatusType.onHold' || scope.eventType == 'loancycle'){
                    return true;
                }
                return false;
            }
            scope.disableCBCheck = function(activeClientMember){
                if(activeClientMember.isClientFinishedThisTask||(activeClientMember.cbExistingLoansSummaryData == undefined && !scope.isCBCheckEnable)){
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
                            if(activeClientMember.status.code != 'clientStatusType.onHold' && !activeClientMember.isClientFinishedThisTask && (activeClientMember.cbExistingLoansSummaryData != undefined || scope.isCBCheckEnable)){
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
    mifosX.ng.application.controller('CreditBureauCheckActivityController', ['$controller', '$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter', 'ngXml2json', '$route', '$http', '$rootScope', '$sce', 'CommonUtilService', '$route', '$upload', 'API_VERSION', mifosX.controllers.CreditBureauCheckActivityController]).run(function ($log) {
        $log.info("CreditBureauCheckActivityController initialized");
    });
}(mifosX.controllers || {}));