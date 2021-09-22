(function (module) {
    mifosX.controllers = _.extend(module, {
        roiDiscountingActivityController: function ($controller, scope, resourceFactory, API_VERSION, location, dateFilter, http, routeParams, $upload, $rootScope) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));

        // Override Function
        scope.currentRoiValue = '';
        scope.totalDiscountApplied = '';
        scope.overrideRoiForm = {
            rateOfInterest: ''
        };
        scope.enableModifyBlock = false;

        if(scope.isTaskCompleted()) {
            scope.enableModifyBlock = true;
        }
        scope.getLoanApplicationDetails = function() {
            resourceFactory.loanApplicationReferencesResource.get({loanApplicationReferenceId : scope.loanApplicationReferenceId}, function(data) {
                scope.currentRoiValue = data.interestRatePerPeriod;
                if(data.loanApplicationAdditionalDetailsData.roiDiscount != undefined) {
                    scope.totalDiscountApplied = data.loanApplicationAdditionalDetailsData.roiDiscount;
                }
            });
        }
        scope.getLoanApplicationDetails();

        scope.applyRoiDiscount = function() {
            console.log(scope.overrideRoiForm);
            resourceFactory.overrideRoiResource.update({loanApplicationReferenceId : scope.loanApplicationReferenceId}, scope.overrideRoiForm, function(data) {
                scope.getLoanApplicationDetails();
            }, function(error) {
                console.log(error);
            })
        }

        scope.enableModify = function() {
            scope.enableModifyBlock = false;
        }

    }
});
mifosX.ng.application.controller('roiDiscountingActivityController', ['$controller','$scope', 'ResourceFactory', 'API_VERSION', '$location', 'dateFilter','$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.roiDiscountingActivityController]).run(function ($log) {
    $log.info("roiDiscountingActivityController initialized");
});
}(mifosX.controllers || {}));