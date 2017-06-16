(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateClientAccountLimitsController: function (scope, resourceFactory, location, routeParams) {
            scope.formData = {};
            scope.clientId = routeParams.clientId;
            scope.isUpdate = false;
            resourceFactory.customerAccountLimitsResource.get({clientId: routeParams.clientId}, function (data) {
                if (data && data.id) {
                    scope.accountLimit = data;
                    scope.limitId = scope.accountLimit.id;
                    scope.formData.limitOnTotalDisbursementAmount = scope.accountLimit.limitOnTotalDisbursementAmount;
                    scope.formData.limitOnTotalLoanOutstandingAmount = scope.accountLimit.limitOnTotalLoanOutstandingAmount;
                    scope.formData.dailyWithdrawalLimit = scope.accountLimit.dailyWithdrawalLimit;
                    scope.formData.dailyTransferLimit = scope.accountLimit.dailyTransferLimit;
                    scope.formData.limitOnTotalOverdraftAmount = scope.accountLimit.limitOnTotalOverdraftAmount;
                    scope.isUpdate = true;
                }
            });

            scope.isEmpty = function (obj) {
                for (var i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        var values = Object.values(obj);
                        for(var j in values){
                            if(values[j].length > 0){
                                return false;
                            }
                        }
                        return true;
                    }
                }
                return true;
            };

            scope.submit = function () {
                scope.formData.locale = scope.optlang.code;
                if (scope.isUpdate) {
                    resourceFactory.customerAccountLimitsResource.update({
                        clientId: routeParams.clientId,
                        limitId: scope.accountLimit.id
                    }, this.formData, function (data) {
                        location.path('/clients/' + scope.clientId + '/accountlimits');
                    });
                } else {
                    resourceFactory.customerAccountLimitsResource.save({clientId: routeParams.clientId}, this.formData, function (data) {
                        location.path('/clients/' + scope.clientId + '/accountlimits');
                    });
                }
            };

            scope.cancel = function () {
                location.path('/clients/' + scope.clientId + '/accountlimits');
            }
        }
    });
    mifosX.ng.application.controller('CreateClientAccountLimitsController', ['$scope', 'ResourceFactory', '$location', '$routeParams', mifosX.controllers.CreateClientAccountLimitsController]).run(function ($log) {
        $log.info("CreateClientAccountLimitsController initialized");
    });
}(mifosX.controllers || {}));