(function (module) {
    mifosX.controllers = _.extend(module, {
        GLIMLoanAccountWaiveChargeController: function (scope, resourceFactory, location, routeParams, dateFilter) {

            scope.loanId = routeParams.loanId;
            scope.loanChargeId = routeParams.chargeId;
            scope.formData = {};
            scope.formData.locale = scope.optlang.code;
            scope.formData.dateFormat = scope.df;
            scope.formData.transactionDate = new Date ();
            scope.clientMembers = [];

            resourceFactory.glimTransactionTemplateResource.get({loanId: scope.loanId , command:"waivecharge"}, function (data) {
                scope.formData.transactionAmount = data.transactionAmount;
                scope.clientMembers = data.clientMembers;
            });

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
                if (scope.formData.transactionDate) {
                    var reqDate = dateFilter(scope.formData.transactionDate, scope.df);
                    this.formData.transactionDate = reqDate;
                }
                scope.constructGlimClientMembersData();
                resourceFactory.glimTransactionResource.save({loanId: scope.loanId, command: 'waivecharge'}, this.formData, function (data) {
                    location.path('/viewloanaccount/' + scope.loanId);
                });
            }

        }
    });
    mifosX.ng.application.controller('GLIMLoanAccountWaiveChargeController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.GLIMLoanAccountWaiveChargeController]).run(function ($log) {
        $log.info("GLIMLoanAccountWaiveChargeController initialized");
    });
}(mifosX.controllers || {}));

