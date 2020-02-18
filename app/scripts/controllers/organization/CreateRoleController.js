(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateRoleController: function (scope, location, resourceFactory,dateFilter) {
            scope.formData = {};
            scope.showRoleBasedLimits = false;
            scope.formData.operationalStartTime = new Date();
            scope.formData.operationalStartTime.setHours(0);
            scope.formData.operationalStartTime.setMinutes(0);
            scope.formData.operationalStartTime.setMilliseconds(0);
            
            scope.formData.operationalEndTime = new Date();
            scope.formData.operationalEndTime.setHours(23);
            scope.formData.operationalEndTime.setMinutes(59);
            scope.formData.operationalEndTime.setMilliseconds(0);

            resourceFactory.currencyConfigResource.get(function (data) {
                scope.roleBasedLimits =  []
                for (var i = 0; i < data.selectedCurrencyOptions.length; i++) {
                    scope.roleBasedLimits[i] = {};
                    scope.roleBasedLimits[i].displayLabel = data.selectedCurrencyOptions[i].displayLabel;
                    scope.roleBasedLimits[i].currencyCode = data.selectedCurrencyOptions[i].code;
                    scope.roleBasedLimits[i].maxLoanApprovalAmount = null;
                }
            });

            scope.submit = function () {
                scope.formData.timeFormat='HH:mm:ss';

                scope.formData.operationalStartTime = dateFilter(scope.formData.operationalStartTime,'HH:mm');
                scope.formData.operationalStartTime = scope.formData.operationalStartTime.concat(":00");

                scope.formData.operationalEndTime = dateFilter(scope.formData.operationalEndTime,'HH:mm');
                scope.formData.operationalEndTime = scope.formData.operationalEndTime.concat(":00");

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

                resourceFactory.roleResource.save(scope.formData, function (data) {
                    location.path("/admin/viewrole/" + data.resourceId);
                });
            };
        }
    });
    mifosX.ng.application.controller('CreateRoleController', ['$scope', '$location', 'ResourceFactory','dateFilter', mifosX.controllers.CreateRoleController]).run(function ($log) {
        $log.info("CreateRoleController initialized");
    });
}(mifosX.controllers || {}));