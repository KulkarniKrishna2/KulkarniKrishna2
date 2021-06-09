(function (module) {
    mifosX.controllers = _.extend(module, {
        AddLoanChargeController: function (scope, resourceFactory, routeParams, rootScope, location, dateFilter, loanDetailsService) {
            scope.loandetails= rootScope.headerLoanDetails;
            delete rootScope.headerLoanDetails;
            scope.charges = [];
            scope.loanChargeDetails = [];
            scope.formData = {};
            scope.chargesApplicableForLoan = [];
            scope.isCollapsed = true;
            scope.loanId = routeParams.id;
            resourceFactory.loanChargeTemplateResource.get({loanId: scope.loanId}, function (data) {
                var temp = data.chargeOptions;
                for(var i in temp){
                    if(temp[i].chargeTimeType.code != "chargeTimeType.eventBasedFee"){
                        scope.charges.push(temp[i]);
                    }
                }
               scope.getLoanApplicableCharges();
            });

            scope.getLoanApplicableCharges = function () {
                resourceFactory.LoanAccountResource.getLoanAccountDetails({ loanId: routeParams.id, associations: 'charges' }, function (data) {
                    scope.loanChargeDetails = data.charges;
                    scope.chargesApplicableForLoan = scope.charges;
                    if (scope.loanChargeDetails && scope.loanChargeDetails.length > 0) {
                        for (var i in scope.loanChargeDetails) {
                            for (var j in scope.charges) {
                                if (scope.loanChargeDetails[i].chargeId == scope.charges[j].id && scope.loanChargeDetails[i].chargeTimeType.code != "chargeTimeType.specifiedDueDate") {
                                    var index = scope.charges.indexOf(scope.charges[j]);
                                    scope.chargesApplicableForLoan.splice(index, 1);
                                    break;
                                }
                            }
                        }
                    }
                });
            }

            scope.selectCharge = function(chargeId){
                for(var i in scope.charges){
                    if(scope.charges[i].id == chargeId){
                        scope.isCollapsed = false;
                        scope.chargeData = scope.charges[i];
                        scope.formData.amount = scope.charges[i].amount;
                    }
                } 
            };

            scope.cancel = function () {
                location.path('/viewloanaccount/' + scope.loanId);
            };

            scope.submit = function () {
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                if (this.formData.dueDate) {
                    this.formData.dueDate = dateFilter(this.formData.dueDate, scope.df);
                }
                ;
                resourceFactory.loanResource.save({resourceType: 'charges', loanId: scope.loanId}, this.formData, function (data) {
                    location.path('/viewloanaccount/' + data.loanId);
                });
            };

            scope.getStatusCode = function () {
                return loanDetailsService.getStatusCode(scope.loandetails);
            };

        }
    });
    mifosX.ng.application.controller('AddLoanChargeController', ['$scope', 'ResourceFactory', '$routeParams', '$rootScope', '$location', 'dateFilter',  'LoanDetailsService' , mifosX.controllers.AddLoanChargeController]).run(function ($log) {
        $log.info("AddLoanChargeController initialized");
    });
}(mifosX.controllers || {}));
