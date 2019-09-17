(function (module) {
    mifosX.controllers = _.extend(module, {
        LoanForeclosureController: function (scope, routeParams, rootScope, resourceFactory, location, route, http, $modal, dateFilter, $filter, loanDetailsService) {
            scope.loandetails= rootScope.headerLoanDetails;
            delete rootScope.headerLoanDetails;
            scope.accountId = routeParams.id;
            scope.formData = {};
            scope.formData.loanId = scope.accountId;
            scope.taskTypeName = 'Foreclosure';
            scope.subTaskTypeName = 'Foreclosure';
            scope.formData.transactionDate = new Date();
            scope.restrictDate = new Date();
            scope.paymentModeOptions = [];
            scope.paymentTypeOptions = [];
            scope.isPaymentTypeHidden = false; 
            scope.showPreclosureReason = false;
            scope.isPaymentModeMandatory = false;
            scope.isPaymentTypeMandatory = false;
            if(scope.response && scope.response.uiDisplayConfigurations) {
                if (scope.response.uiDisplayConfigurations.preClose && scope.response.uiDisplayConfigurations.preClose.hiddenFields) {
                    scope.isPaymentTypeHidden = scope.response.uiDisplayConfigurations.preClose.hiddenFields.paymentType;
                }
                if (scope.response.uiDisplayConfigurations.loanAccount.isMandatory) {
                    scope.isPaymentModeMandatory = scope.response.uiDisplayConfigurations.loanAccount.isMandatory.transactionPaymentMode;
                    scope.isPaymentTypeMandatory = scope.response.uiDisplayConfigurations.loanAccount.isMandatory.transactionPaymentType;
                }                    
            }
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
                    locale: scope.optlang.code,
                    includePreclosureReasoon: scope.showPreclosureReason
                }, function (data) {
                    scope.foreclosuredata = data;
                    if(data.preclosureReasonOptions){
                        scope.preclosureReasonList =  data.preclosureReasonOptions;
                    }
                    scope.formData.outstandingPrincipalPortion = scope.foreclosuredata.principalPortion;
                    scope.formData.outstandingInterestPortion = scope.foreclosuredata.interestPortion;
                    scope.paymentModeOptions = scope.foreclosuredata.paymentModeOptions;
                    scope.paymentTypeOptions = scope.foreclosuredata.paymentTypeOptions;
                    if (scope.foreclosuredata.unrecognizedIncomePortion) {
                        scope.formData.interestAccruedAfterDeath = scope.foreclosuredata.unrecognizedIncomePortion;
                    }

                    scope.formData.outstandingFeeChargesPortion = scope.foreclosuredata.feeChargesPortion;
                    scope.formData.outstandingPenaltyChargesPortion = scope.foreclosuredata.penaltyChargesPortion;
                    scope.formData.foreClosureChargesPortion = scope.foreclosuredata.foreClosureChargesPortion;
                    scope.formData.excessAmountPaymentPortion = scope.foreclosuredata.excessAmountPaymentPortion;
                    scope.calculateTransactionAmount();
                    scope.paymentTypes = scope.foreclosuredata.paymentTypeOptions;
                });
            }

            scope.calculateTransactionAmount = function(){
                var transactionAmount = 0;
                transactionAmount += parseFloat(scope.foreclosuredata.principalPortion); 
                transactionAmount += parseFloat(scope.foreclosuredata.interestPortion);
                transactionAmount += parseFloat(scope.foreclosuredata.feeChargesPortion);
                transactionAmount += parseFloat(scope.foreclosuredata.penaltyChargesPortion);
                if(!_.isUndefined(scope.foreclosuredata.excessAmountPaymentPortion)){
                    if(scope.foreclosuredata.excessAmountPaymentPortion < transactionAmount){
                      transactionAmount -= parseFloat(scope.foreclosuredata.excessAmountPaymentPortion);  
                    }else{
                       transactionAmount = 0; 
                    }
                    
                }
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

            scope.getPaymentTypeOtions = function(paymentMode) {
              scope.paymentTypeOptions = [];
              if (scope.paymentTypes) {
                for (var i in scope.paymentTypes) {
                  if (scope.paymentTypes[i].paymentMode.id == paymentMode) {
                    scope.paymentTypeOptions.push(scope.paymentTypes[i]);
                  }
                }
              }
            };
            
           

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

            scope.getStatusCode = function () {
                return loanDetailsService.getStatusCode(scope.loandetails);
            };
        }
    });
    mifosX.ng.application.controller('LoanForeclosureController', ['$scope', '$routeParams', '$rootScope', 'ResourceFactory', '$location', '$route', '$http', '$modal', 'dateFilter','$filter', 'LoanDetailsService' , mifosX.controllers.LoanForeclosureController]).run(function ($log) {
        $log.info("LoanForeclosureController initialized");
    });
}(mifosX.controllers || {}));