(function (module) {
    mifosX.controllers = _.extend(module, {
        EditRoleController: function (scope, routeParams, location, resourceFactory) {
            scope.formData = {};
            scope.roleId = routeParams.id;
            scope.showRoleBasedLimits = true;
            resourceFactory.roleResource.get({roleId: scope.roleId}, function (data) {
                scope.formData.id = data.id;
                scope.formData.name = data.name;
                scope.formData.description = data.description;
                scope.formData.disabled = undefined;
                scope.roleBasedLimits = [];
                var existingCurrencyCodes = []
                for (var i = 0; i < data.roleBasedLimits.length; i++) {
                    scope.roleBasedLimits[i] = {};
                    scope.roleBasedLimits[i].displayLabel = data.roleBasedLimits[i].currencyData.displayLabel;
                    scope.roleBasedLimits[i].currencyCode = data.roleBasedLimits[i].currencyData.code;
                    scope.roleBasedLimits[i].maxLoanApprovalAmount = data.roleBasedLimits[i].maxLoanApprovalAmount;
                    existingCurrencyCodes[i] = scope.roleBasedLimits[i].currencyCode;
                }
                for (var i = 0; i < data.currencyOptions.length; i++) {
                    var newCurrencyCode = data.currencyOptions[i].code;
                    if(! (existingCurrencyCodes.indexOf(newCurrencyCode) > - 1)){
                        var newRoleBasedLimit = {};
                        newRoleBasedLimit.displayLabel = data.currencyOptions[i].displayLabel;
                        newRoleBasedLimit.currencyCode = newCurrencyCode;
                        newRoleBasedLimit.maxLoanApprovalAmount = null;
                        scope.roleBasedLimits.push(newRoleBasedLimit);
                    }
                }    

            });
            scope.submit = function (){
                scope.formData.locale = scope.optlang.code;
                scope.formData.roleBasedLimits =  []
                for (var i = 0; i < scope.roleBasedLimits.length; i++) {
                    if(!isNaN(parseFloat(scope.roleBasedLimits[i].maxLoanApprovalAmount)) && isFinite(scope.roleBasedLimits[i].maxLoanApprovalAmount)){
                        var newRoleBasedLimit = {};
                        newRoleBasedLimit.currencyCode = scope.roleBasedLimits[i].currencyCode;
                        newRoleBasedLimit.maxLoanApprovalAmount = scope.roleBasedLimits[i].maxLoanApprovalAmount;
                        scope.formData.roleBasedLimits.push(newRoleBasedLimit);
                    }
                }

                if (!scope.formData.roleBasedLimits.length > 0) {
                    delete scope.formData.roleBasedLimits;
                }
                resourceFactory.roleResource.update({roleId: scope.roleId}, scope.formData, function (data) {
                    location.path("/admin/viewrole/" + scope.roleId);
                });
            };
        }
    });
    mifosX.ng.application.controller('EditRoleController', ['$scope', '$routeParams', '$location', 'ResourceFactory', mifosX.controllers.EditRoleController]).run(function ($log) {
        $log.info("EditRoleController initialized");
    });
}(mifosX.controllers || {}));
