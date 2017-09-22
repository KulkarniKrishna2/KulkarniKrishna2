
(function (module) {
    mifosX.controllers = _.extend(module, {
        OverdueChargeController: function (scope, resourceFactory, location, translate, routeParams, dateFilter) {
            scope.first = {};
            scope.formData = {};
            scope.tillDate = new Date();
            scope.restrictDate = new Date();

            scope.submit = function () {
                var reqDate = dateFilter(scope.tillDate, scope.df);
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.tillDate = reqDate;
                resourceFactory.overdueChargeResource.run(this.formData, function (data) {
                    location.path('/organization');
                });
            }
        }
    });
    mifosX.ng.application.controller('OverdueChargeController', ['$scope', 'ResourceFactory', '$location', '$translate', '$routeParams', 'dateFilter', mifosX.controllers.OverdueChargeController]).run(function ($log) {
        $log.info("OverdueChargeController initialized");
    });
}(mifosX.controllers || {}));
