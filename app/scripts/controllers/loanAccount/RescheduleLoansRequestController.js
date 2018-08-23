(function (module) {
    mifosX.controllers = _.extend(module, {
        RescheduleLoansRequestController: function (scope, resourceFactory, routeParams, rootScope, location, dateFilter, loanDetailsService) {
            scope.loandetails = rootScope.headerLoanDetails;
            delete rootScope.headerLoanDetails;
            scope.loanId = routeParams.loanId;
            scope.formData = {};
            scope.rejectData = {};
            scope.formData.submittedOnDate = new Date();
            scope.isGLIM = false;
            resourceFactory.loanRescheduleResource.template({scheduleId:'template'},function(data){
                if (data.length > 0) {
                    scope.formData.rescheduleReasonId = data.rescheduleReasons[0].id;
                }
                scope.codes = data.rescheduleReasons;
            });
            scope.cancel = function () {
                location.path('/viewloanaccount/' + scope.loanId);
            };

            resourceFactory.glimResource.getAllByLoan({loanId: scope.loanId}, function (glimData) {
                scope.isGLIM = (glimData != undefined && glimData.length > 0 && glimData[0].isActive);
            });

            scope.submit = function () {
                this.formData.loanId = scope.loanId;
                this.formData.dateFormat = scope.df;
                this.formData.locale = scope.optlang.code;
                this.formData.rescheduleFromDate = dateFilter(this.formData.rescheduleFromDate, scope.df);
                this.formData.adjustedDueDate = dateFilter(this.formData.adjustedDueDate, scope.df);
                this.formData.submittedOnDate = dateFilter(this.formData.submittedOnDate, scope.df);
                this.formData.rescheduleReasonComment = scope.comments;
                this.formData.specificToInstallment = scope.specificToInstallment;
                resourceFactory.loanRescheduleResource.put(this.formData, function (data) {
                    scope.requestId = data.resourceId;
                    location.path('/loans/' + scope.loanId + '/viewreschedulerequest/'+ data.resourceId);
                });
            };

            scope.getStatusCode = function () {
                return loanDetailsService.getStatusCode(scope.loandetails);
            };

        }
        
    });
    mifosX.ng.application.controller('RescheduleLoansRequestController', ['$scope', 'ResourceFactory', '$routeParams', '$rootScope', '$location', 'dateFilter' , 'LoanDetailsService' , mifosX.controllers.RescheduleLoansRequestController]).run(function ($log) {
        $log.info("RescheduleLoansRequestController initialized");
    });
}(mifosX.controllers || {}));