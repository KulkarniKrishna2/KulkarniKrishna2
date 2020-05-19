(function (module) {
    mifosX.controllers = _.extend(module, {
        LoanRestructureController: function (scope, resourceFactory, location, routeParams, dateFilter) {

            scope.loanId = routeParams.id;

            resourceFactory.getLoanRestructureResource.get({ loanId: scope.loanId }, function (data) {
                scope.restructureData = data;
                scope.restructureData.expectedDisbursementDate = dateFilter(new Date(), scope.df);
            });

            scope.cancel = function () {
                location.path('/viewloanaccount/' + scope.loanId);
            };


            scope.submit = function () {
                scope.formData = {
                    clientId: scope.restructureData.clientId,
                    groupId: scope.restructureData.groupId,
                    calenderId: scope.restructureData.calenderId,
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

                if (scope.tenureType == 'EMI_AMOUNT') {
                    scope.formData.fixedEmiAmount = scope.restructureData.fixedEmiAmount;
                }

                resourceFactory.submitLoanRestructureResource.save({}, this.formData, function (data) {
                    location.path('/viewloanaccount/' + data.resourceId);
                });
            }

        }
    });
    mifosX.ng.application.controller('LoanRestructureController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.LoanRestructureController]).run(function ($log) {
        $log.info("LoanRestructureController initialized");
    });
}(mifosX.controllers || {}));

