(function (module) {
    mifosX.controllers = _.extend(module, {
        LoanRestructureController: function (scope, resourceFactory, location, routeParams, dateFilter, $modal) {

            scope.loanId = routeParams.id;
            scope.isTopup = false;
            scope.isEditable = false;
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.loanrestructure &&
                scope.response.uiDisplayConfigurations.loanrestructure.isHiddenField){
                scope.isShowEditButton = !scope.response.uiDisplayConfigurations.loanrestructure.isHiddenField.editButton;
            }

            resourceFactory.getLoanRestructureResource.get({ loanId: scope.loanId }, function (data) {
                scope.restructureData = data;
                scope.isTopup = data.isTopup;
                scope.restructureData.expectedDisbursementDate = dateFilter(new Date(), scope.df);
            });

            scope.cancel = function () {
                location.path('/viewloanaccount/' + scope.loanId);
            };

            var LoanRestructureCtrl = function ($scope, $modalInstance, formData) {
                $scope.confirm = function () {
                    resourceFactory.submitLoanRestructureResource.save({}, formData, function (data) {
                        $modalInstance.close('delete');
                        location.path('/viewloanaccount/' + data.resourceId);
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            scope.madeEditable = function(){
               scope.isEditable = true; 
            }

            scope.submit = function () {
                scope.formData = {
                    clientId: scope.restructureData.clientId,
                    groupId: scope.restructureData.groupId,
                    calendarId: scope.restructureData.calendarId,
                    productId: scope.productId,
                    interestRate: scope.restructureData.interestRate,
                    repaymentEvery: scope.restructureData.repaymentEvery,
                    expectedDisbursementDate: scope.restructureData.expectedDisbursementDate,
                    numberOfRepayments: scope.restructureData.numberOfRepayments,
                    repaymentFrequencyType: scope.restructureData.repaymentFrequency.id,
                    loanIds: [scope.loanId],
                    locale: scope.optlang.code,
                    dateFormat: scope.df
                };
                if(scope.restructureData.fundId){
                    scope.formData.fundId = scope.restructureData.fundId;
                }
                if(scope.restructureData.loanOfficerId){
                    scope.formData.loanOfficerId = scope.restructureData.loanOfficerId;
                }
                if(scope.restructureData.loanPurposeId){
                    scope.formData.loanPurposeId = scope.restructureData.loanPurposeId;
                }
                if(scope.isTopup){
                    $modal.open({
                        templateUrl: 'loanrestructure.html',
                        controller: LoanRestructureCtrl,
                        resolve: {
                            formData: function () {
                                return scope.formData;
                            }
                        }
                    });
                }else{
                    resourceFactory.submitLoanRestructureResource.save({}, this.formData, function (data) {
                        location.path('/viewloanaccount/' + data.resourceId);
                    });
                }
                

                
            }

        }
    });
    mifosX.ng.application.controller('LoanRestructureController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', '$modal', mifosX.controllers.LoanRestructureController]).run(function ($log) {
        $log.info("LoanRestructureController initialized");
    });
}(mifosX.controllers || {}));

