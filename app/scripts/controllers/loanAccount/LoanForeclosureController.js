(function (module) {
    mifosX.controllers = _.extend(module, {
        LoanForeclosureController: function (scope, routeParams, resourceFactory, location, route, http, $modal, dateFilter, $filter) {
            scope.accountId = routeParams.id;
            scope.formData = {};
            scope.formData.loanId = scope.accountId;
            scope.taskTypeName = 'Foreclosure';
            scope.subTaskTypeName = 'Foreclosure';
            scope.formData.transactionDate = new Date();
            scope.restrictDate = new Date();
            scope.showPreclosureReason = scope.response.uiDisplayConfigurations.loanAccount.isMandatory.isPreclosureReasonEnabled;
            scope.specifyReason = false;            
            
            scope.showReasonDescription = function() {
                return scope.specifyReason && scope.showPreclosureReason;
            };
            
            resourceFactory.LoanAccountResource.getLoanAccountDetails({loanId: routeParams.id, associations: 'all'}, function (data) {
                scope.loandetails = data;
            });
            scope.$watch('formData.transactionDate',function(){
                scope.retrieveLoanForeclosureTemplate();
            });

            scope.retrieveLoanForeclosureTemplate = function() {
                resourceFactory.loanTrxnsTemplateResource.get({
                    loanId: routeParams.id,
                    command: 'foreclosure',
                    transactionDate: dateFilter(this.formData.transactionDate, scope.df),
                    dateFormat: scope.df,
                    locale: scope.optlang.code
                }, function (data) {
                    scope.foreclosuredata = data;
                    scope.formData.outstandingPrincipalPortion = scope.foreclosuredata.principalPortion;
                    scope.formData.outstandingInterestPortion = scope.foreclosuredata.interestPortion;
                    if (scope.foreclosuredata.unrecognizedIncomePortion) {
                        scope.formData.interestAccruedAfterDeath = scope.foreclosuredata.unrecognizedIncomePortion;
                    }

                    scope.formData.outstandingFeeChargesPortion = scope.foreclosuredata.feeChargesPortion;
                    scope.formData.outstandingPenaltyChargesPortion = scope.foreclosuredata.penaltyChargesPortion;
                    scope.formData.foreClosureChargesPortion = scope.foreclosuredata.foreClosureChargesPortion;
                    scope.calculateTransactionAmount();
                    scope.paymentTypes = scope.foreclosuredata.paymentTypeOptions;
                    if (scope.paymentTypes.length > 0) {
                        scope.formData.paymentTypeId = scope.paymentTypes[0].id;
                    }
                });
            }

            scope.calculateTransactionAmount = function(){
                var transactionAmount = 0;
                transactionAmount += parseFloat(scope.foreclosuredata.principalPortion);
                transactionAmount += parseFloat(scope.foreclosuredata.interestPortion);
                transactionAmount += parseFloat(scope.foreclosuredata.feeChargesPortion);
                transactionAmount += parseFloat(scope.foreclosuredata.penaltyChargesPortion);
                scope.formData.transactionAmount = $filter('number')(transactionAmount, 2);
                scope.formData.transactionAmount =  scope.formData.transactionAmount.replace(/,/g,"");
            };

            scope.reCalculateTransactionAmount = function(){
                scope.calculateTransactionAmount();
                var transactionAmount = 0;
                transactionAmount += parseFloat(scope.formData.transactionAmount);
                transactionAmount -= parseFloat(scope.formData.totalWaivedAmount);
                scope.formData.transactionAmount = $filter('number')(transactionAmount, 2);
                scope.formData.transactionAmount =  scope.formData.transactionAmount.replace(/,/g,"");
            };

            resourceFactory.codeValueByCodeNameResources.get({codeName: 'PreclosureReasons',searchConditions:'{"codeValueIsActive":true}'}, function (data) {
                scope.preclosureReasonList = data;
            });

            scope.getPreclosureReasonValues = function(codeId) {
                scope.specifyReason = false;
                if (codeId != undefined) {
                    var index = scope.preclosureReasonList.findIndex(x => x.id == codeId);
                    if (index > -1) {
                        if (scope.preclosureReasonList[index].name === 'Others' || scope.preclosureReasonList[index].name === 'others') {
                            scope.specifyReason = true;
                        }
                    }
                }
            };

            scope.submit = function () {
                scope.foreclosureFormData = {
                    transactionDate: dateFilter(this.formData.transactionDate, scope.df),
                    locale:  scope.optlang.code,
                    dateFormat: scope.df,
                    note: this.formData.note,
                    paymentTypeId : this.formData.paymentTypeId,
                    accountNumber : this.formData.accountNumber,
                    checkNumber : this.formData.checkNumber,
                    routingCode : this.formData.routingCode,
                    receiptNumber : this.formData.receiptNumber,
                    bankNumber : this.formData.bankNumber,
                    preclosureReasonId : this.formData.codeReasonId,
                    reasonDescription : this.formData.reasonDescription
                };
                resourceFactory.loanTrxnsResource.save({loanId: routeParams.id, command: 'foreclosure'}, scope.foreclosureFormData, function(data) {
                    location.path('/viewloanaccount/' + scope.accountId);
                });
            };

            scope.cancel = function () {
                location.path('/viewloanaccount/' + scope.accountId);
            };
        }
    });
    mifosX.ng.application.controller('LoanForeclosureController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', '$http', '$modal', 'dateFilter','$filter', mifosX.controllers.LoanForeclosureController]).run(function ($log) {
        $log.info("LoanForeclosureController initialized");
    });
}(mifosX.controllers || {}));