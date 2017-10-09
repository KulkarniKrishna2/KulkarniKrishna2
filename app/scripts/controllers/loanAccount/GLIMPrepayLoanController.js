(function (module) {
    mifosX.controllers = _.extend(module, {
        GLIMPrepayLoanController: function (scope, resourceFactory, location, routeParams, dateFilter) {

            scope.loanId = routeParams.loanId;
            scope.loanChargeId = routeParams.chargeId;
            scope.formData = {};
            scope.formData.locale = scope.optlang.code;
            scope.formData.dateFormat = scope.df;
            scope.formData.transactionDate = dateFilter(new Date(),scope.df);
            scope.paymentTypes = [];
            scope.showPaymentDetails = false;
            scope.clientMembers = [];
            scope.glimAsGroupConfigName = 'glim-payment-as-group';
            scope.isGlimPaymentAsGroup = scope.isSystemGlobalConfigurationEnabled(glimAsGroupConfigName);

            resourceFactory.glimTransactionTemplateResource.get({loanId: scope.loanId , command:"prepay"}, function (data) {
                scope.formData.transactionAmount = data.transactionAmount;
                scope.clientMembers = data.clientMembers;
            });

            resourceFactory.paymentTypeResource.getAll({}, function(data) {
                scope.paymentTypes = data;
            })

            scope.getTransactionAmount = function(data){
                var amount = 0;
                for (var i=0; i<data.length; i++) {
                    if(angular.isDefined(data[i].transactionAmount) && data[i].isClientSelected){
                        amount= amount + parseFloat(data[i].transactionAmount);
                    }
                }
                this.formData.transactionAmount = amount.toFixed(2);;
            };

            scope.cancel = function(){
                location.path('/viewloanaccount/' + scope.loanId);
            };

            scope.constructGlimClientMembersData = function () {
                this.formData.clientMembers = [];
                for(var i in scope.clientMembers) {
                    if(scope.clientMembers[i].isClientSelected) {
                        var json = {
                            id : scope.clientMembers[i].id,
                            transactionAmount: scope.clientMembers[i].transactionAmount
                        }
                        this.formData.clientMembers.push(json);
                    }
                }
            }


            scope.submit = function(){
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.transactionDate = dateFilter(this.formData.transactionDate, scope.df);
                var param = {loanId: scope.loanId, command: 'repayment'};
                if(scope.isGlimPaymentAsGroup){
                    resourceFactory.loanTrxnsResource.save(param, this.formData, function (data) {
                            location.path('/viewloanaccount/' + data.loanId);
                        });

                }else{
                    scope.constructGlimClientMembersData();
                    resourceFactory.glimTransactionResource.save(param, this.formData, function (data) {
                        location.path('/viewloanaccount/' + scope.loanId);
                    });
                }
                
            }

        }
    });
    mifosX.ng.application.controller('GLIMPrepayLoanController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.GLIMPrepayLoanController]).run(function ($log) {
        $log.info("GLIMPrepayLoanController initialized");
    });
}(mifosX.controllers || {}));

