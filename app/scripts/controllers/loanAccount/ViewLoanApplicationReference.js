(function (module) { 
    mifosX.controllers = _.extend(module, {
        ViewLoanApplicationReference: function (scope, routeParams, resourceFactory, location, dateFilter, $filter,$modal) {

            scope.loanApplicationReferenceId = routeParams.loanApplicationReferenceId;
            var curIndex = 0;
            scope.isDisplayActions = false;
            scope.isCBCheckReq = false;
            scope.riskCaluculation = {};
            scope.riskCheckDone = false;
            scope.showRiskDetail =false;
            scope.codes = [];
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.workflow &&
                scope.response.uiDisplayConfigurations.workflow.isMandatory) {
                    scope.isRejectReasonMandatory = scope.response.uiDisplayConfigurations.workflow.isMandatory.rejectReason;
            }

            scope.isWorkflowEnabled = false;

            scope.initData = function () {
                scope.isWorkFlow = scope.isSystemGlobalConfigurationEnabled('work-flow');
                scope.isCreditCheck = scope.isSystemGlobalConfigurationEnabled('credit-check');
                resourceFactory.loanApplicationReferencesResource.getByLoanAppId({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (data) {
                    scope.formData = data;
                    scope.accountType = scope.formData.accountType.value.toLowerCase();
                    if(scope.formData.isWorkflowEnabled == true && scope.formData.workflowId){
                        scope.isWorkflowEnabled = true;
                    }
                    if(scope.formData.loanProductId && scope.formData.status.id < 300){
                        resourceFactory.loanProductResource.getCreditbureauLoanProducts({loanProductId: scope.formData.loanProductId,associations: 'creditBureaus',clientId : scope.formData.clientId},function (creditbureauLoanProduct) {
                            scope.creditbureauLoanProduct = creditbureauLoanProduct;
                            if(scope.creditbureauLoanProduct.isActive == true){
                                scope.isCBCheckReq = true;
                            }
                            scope.isDisplayActions = true;
                        });
                    }else{
                        scope.isDisplayActions = true;
                    }
                    scope.loanProductChange(scope.formData.loanProductId);
                    resourceFactory.loanApplicationReferencesResource.getChargesByLoanAppId({
                        loanApplicationReferenceId: scope.loanApplicationReferenceId,
                        command: 'loanapplicationcharges'
                    }, function (loanAppChargeData) {
                        scope.loanAppChargeData = loanAppChargeData;
                        for(var i = 0; i < scope.loanAppChargeData.length; i++){
                            if(scope.loanAppChargeData[i].chargeId){
                                scope.constructExistingCharges(i,scope.loanAppChargeData[i].chargeId);
                            }else{
                                curIndex++;
                            }
                        }
                    });
                    if(scope.formData.status.id > 200){
                        resourceFactory.loanApplicationReferencesResource.getByLoanAppId({
                            loanApplicationReferenceId: scope.loanApplicationReferenceId,
                            command: 'approveddata'
                        }, function (data) {
                            scope.formData.approvedData = {};
                            scope.formData.approvedData = data;
                        });
                    };
                });
            };

            scope.initData();

            function fetchRiskCalculation (){
                resourceFactory.riskCalculation.getForLoanAppId({loanApplicationReferenceId: scope.loanApplicationReferenceId},
                    function (data) {
                        scope.riskCalculation = data;
                        if(scope.riskCalculation !== undefined && scope.riskCalculation.status !== undefined){
                            scope.riskCheckDone = false;
                        }
                    }
                );
            }
            fetchRiskCalculation();

            scope.doRiskCheck = function () {
                resourceFactory.riskCalculation.save({loanApplicationReferenceId: scope.loanApplicationReferenceId},{}, function (response) {
                    fetchRiskCalculation();
                });
            }

            scope.triggerRiskDetail = function(){
                if(scope.showRiskDetail){
                    scope.showRiskDetail = false;
                }else{
                    scope.showRiskDetail = true;
                }
            }

            scope.loanProductChange = function (loanProductId) {

                scope.inparams = {resourceType: 'template', activeOnly: 'true'};
                    scope.inparams.templateType = scope.accountType;
                if (scope.formData.clientId) {
                    scope.inparams.clientId = scope.formData.clientId;
                }
                if (scope.formData.groupId) {
                    scope.inparams.groupId = scope.formData.groupId;
                }
                scope.inparams.staffInSelectedOfficeOnly = true;
                scope.inparams.productId = loanProductId;

                resourceFactory.loanResource.get(scope.inparams, function (data) {
                    scope.loanaccountinfo = data;
                    if (data.clientName) {
                        scope.clientName = data.clientName;
                    }
                    if (data.group) {
                        scope.loanGroupName = data.group.name;
                    }
                });
            };

            scope.requestApprovalLoanAppRef = function () {
                resourceFactory.loanApplicationReferencesResource.update({loanApplicationReferenceId: scope.loanApplicationReferenceId,command: 'requestforapproval'},{}, function (data) {
                    location.path('/viewclient/' + scope.formData.clientId);
                });
            };

            scope.charges = [];
            scope.constructExistingCharges = function (index,chargeId,isMandatory) {
                resourceFactory.chargeResource.get({chargeId: chargeId, template: 'true'}, function (data) {
                    data.chargeId = data.id;
                    scope.charges.push(data);
                    curIndex++;
                    if(curIndex == scope.loanAppChargeData.length){
                        for(var i = 0 ; i < scope.charges.length; i++){
                            for(var j = 0; j < scope.loanAppChargeData.length; j++){
                                if(scope.charges[i].chargeId == scope.loanAppChargeData[j].chargeId){
                                    scope.charges[i].loanAppChargeId = scope.loanAppChargeData[j].loanAppChargeId;
                                    scope.charges[i].loanApplicationReferenceId = scope.loanAppChargeData[j].loanApplicationReferenceId;
                                    scope.charges[i].dueDate = scope.loanAppChargeData[j].dueDate;
                                    scope.charges[i].amount = scope.loanAppChargeData[j].amount;
                                    scope.charges[i].isMandatory = scope.loanAppChargeData[j].isMandatory;
                                }
                            }
                        }
                        scope.penalCharges = $filter('filter')(scope.charges, { penalty: true }) || [];
                        scope.feeCharges = $filter('filter')(scope.charges, { penalty: false }) || [];
                    }
                });
            };

            scope.undoApprovalLoanAppRef = function () {
                resourceFactory.loanApplicationReferencesResource.update({
                    loanApplicationReferenceId: scope.loanApplicationReferenceId,
                    command: 'undoapprove'
                }, {}, function (data) {
                    location.path('/viewclient/' + scope.formData.clientId);
                });
            };

            scope.rejectApprovalLoanAppRef = function () {
                resourceFactory.loanApplicationReferencesResource.update({
                    loanApplicationReferenceId: scope.loanApplicationReferenceId,
                    command: 'reject'
                }, {}, function (data) {
                    location.path('/viewclient/' + scope.formData.clientId);
                });
            };

            scope.rejectWithReason = function (){
                resourceFactory.loanApplicationRejectReasonsResource.get({},function (data) {
                    scope.codes =  data;
                    scope.reject();
                });
            };
            scope.reject = function () {
                $modal.open({
                    templateUrl: 'reject.html',
                    controller: RejectCtrl,
                    windowClass: 'modalwidth700'
                });
            };

            var RejectCtrl = function ($scope, $modalInstance) {
                $scope.rejectioReasonsAvailable = false;
                $scope.displayDescription = false;
                $scope.isRejectReasonMandatory = scope.isRejectReasonMandatory;
                $scope.error = null;
                $scope.rejectFormData = {};
                $scope.values = [];
                if(scope.codes && scope.codes.length >= 1){ 
                    $scope.codes = scope.codes; 
                    $scope.rejectioReasonsAvailable= true;
                }else{
                    $scope.rejectioReasonsAvailable= false;
                }

                $scope.cancelReject = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.submitReject = function () {
                    if ($scope.rejectioReasonsAvailable == true) {
                        if ($scope.isRejectReasonMandatory && (!$scope.rejectFormData.reasonCode ||
                             (!_.isUndefined($scope.codes) && !$scope.rejectFormData.selectedReason) || ($scope.displayDescription && !$scope.rejectFormData.description))) {
                            $scope.error = 'label.mandatory.fields.cannot.be.blank';
                            return false;
                        }
                    }
                    resourceFactory.loanApplicationReferencesResource.update({
                        loanApplicationReferenceId: scope.loanApplicationReferenceId,
                        command: 'reject'
                    }, $scope.rejectFormData, function (data) {
                        $modalInstance.close('reject');
                        location.path('/viewclient/' + scope.formData.clientId);
                    });
                };

                $scope.getDependentCodeValues = function(codeName){
                    $scope.values = $scope.codes[$scope.codes.findIndex(x => x.name == codeName)].values;
                };

                $scope.initDescription = function(reasonId){
                    $scope.subOtherReason = $scope.values[$scope.values.findIndex(x => x.id == reasonId)].name.indexOf("Other")>-1;
                    if($scope.subOtherReason==true){
                        $scope.displayDescription = true;
                      }else{
                        $scope.displayDescription = false;
                      }
                };
            };
        }
    });
    mifosX.ng.application.controller('ViewLoanApplicationReference', ['$scope', '$routeParams', 'ResourceFactory', '$location', 'dateFilter', '$filter','$modal', mifosX.controllers.ViewLoanApplicationReference]).run(function ($log) {
        $log.info("ViewLoanApplicationReference initialized");
    });
}(mifosX.controllers || {}));