(function (module) {
    mifosX.controllers = _.extend(module, {
        RiskProfileRatingComputeController: function (scope, routeParams, resourceFactory, location) {
            scope.formData = {};
            resourceFactory.computeProfileRatingTemplate.get(function (response) {
                scope.officeOptions = response.officeOptions;
                scope.entityTypeOptions = response.entityTypeOptions;
                for(var i in response.scopeEntityTypeOptions){
                    if(response.scopeEntityTypeOptions[i].value === 'OFFICE'){
                        scope.formData.scopeEntityType = response.scopeEntityTypeOptions[i].id;
                        break;
                    }
                }
            });
            scope.submit = function () {
                scope.formData.locale = "en";
                resourceFactory.computeProfileRating.save(scope.formData, function (response) {
                    location.path('/riskrating');
                });
            }
        }
    });
    mifosX.ng.application.controller('RiskProfileRatingComputeController', ['$scope', '$routeParams', 'ResourceFactory', '$location', mifosX.controllers.RiskProfileRatingComputeController]).run(function ($log) {
        $log.info("RiskProfileRatingComputeController initialized");
    });
}(mifosX.controllers || {}));