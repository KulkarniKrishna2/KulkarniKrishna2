(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewCustomerAccountLimitsController: function (scope, routeParams, resourceFactory, location, dateFilter) {

            scope.formData = {};
            scope.clientId = routeParams.clientId;
            scope.isUpdate = false;
            resourceFactory.customerAccountLimitsResource.get({clientId: routeParams.clientId}, function (data) {
                if (data && data.id) {
                    scope.accountLimit = data;
                    scope.limitOnTotalDisbursementAmount = scope.accountLimit.limitOnTotalDisbursementAmount;
                    scope.limitOnTotalLoanOutstandingAmount = scope.accountLimit.limitOnTotalLoanOutstandingAmount;
                    scope.dailyWithdrawalLimit = scope.accountLimit.dailyWithdrawalLimit;
                    scope.dailyTransferLimit = scope.accountLimit.dailyTransferLimit;
                    scope.limitOnTotalOverdraftAmount = scope.accountLimit.limitOnTotalOverdraftAmount;
                    scope.isUpdate = true;
                }
            });
            scope.create = function () {
                location.path('/clients/' + scope.clientId + '/createclientaccountlimits');
            }
            scope.edit = function () {
                location.path('/clients/' + scope.clientId + '/editclientaccountlimits');
            }
            scope.cancel = function () {
                location.path('/viewclient/' + scope.clientId);
            }
        }
    });
    mifosX.ng.application.controller('ViewCustomerAccountLimitsController', ['$scope', '$routeParams', 'ResourceFactory', '$location', 'dateFilter', mifosX.controllers.ViewCustomerAccountLimitsController]).run(function ($log) {
        $log.info("ViewCustomerAccountLimitsController initialized");
    });
}(mifosX.controllers || {}));