(function (module) {
    mifosX.controllers = _.extend(module, {
        existingLoanActivityController: function (scope, routeParams, resourceFactory, location, $modal, route, dateFilter) {

            scope.addExistingLoan = false;
            scope.formData = {};

            function initTask(){
                scope.clientId = scope.taskconfig['clientId'];
                existingLoans();
                scope.activityDone();
            };

            initTask();

            function existingLoans(){
              resourceFactory.clientExistingLoan.getAll({clientId: scope.clientId}, function(data){
                    // console.log(data);
                    scope.existingLoans = data;
              });
            };

            scope.addLoan = function () {
                resourceFactory.clientExistingLoanTemplate.get({clientId: scope.clientId}, function (data) {
                    scope.existingLoanSourceOption = data.existingLoanSourceOption;
                    scope.creditBureauProductsOption = data.creditBureauProductsOption;
                    scope.lenderOption = data.lenderOption;
                    scope.loanTypeOption = data.loanTypeOption;
                    scope.externalLoanPurposeOption = data.externalLoanPurposeOption;
                    scope.loanTenaureOption = data.loanTenaureOption;
                    scope.termPeriodFrequencyType = data.termPeriodFrequencyType;
                    scope.loanStatusOption = data.loanStatusOption;
                    scope.addExistingLoan = true;
                });
            };

            scope.submit = function () {
                scope.formData.archive = "1";
                if (!_.isUndefined(scope.formData.disbursedDate)) {
                    this.formData.disbursedDate = dateFilter(scope.formData.disbursedDate, scope.df);
                }
                this.formData.dateFormat = scope.df;
                this.formData.locale = scope.optlang.code;
                resourceFactory.clientExistingLoan.save({clientId: scope.clientId}, this.formData, function (data) {
                    existingLoans();
                    scope.addExistingLoan = false;
                });
            };

            scope.cancel = function () {
                scope.addExistingLoan = false;
            };

        }
    });
    mifosX.ng.application.controller('existingLoanActivityController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', 'dateFilter', mifosX.controllers.existingLoanActivityController]).run(function ($log) {
        $log.info("existingLoanActivityController initialized");
    });

}(mifosX.controllers || {}));