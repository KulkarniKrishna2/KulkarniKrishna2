
(function (module) {
    mifosX.controllers = _.extend(module, {
        GSTDataPushController: function (scope, resourceFactory, location, dateFilter) {
            scope.first = {};
            scope.formData = {};
            scope.executeAsOnDate = new Date();
            scope.restrictDate = new Date();

            scope.submit = function () {
                var reqDate = dateFilter(scope.executeAsOnDate, scope.df);
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.executeAsOnDate = reqDate;
                resourceFactory.pushGSTTransactionsResource.run(this.formData, function (data) {
                    location.path('/bc');
                });
            }
        }
    });
    mifosX.ng.application.controller('GSTDataPushController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', mifosX.controllers.GSTDataPushController]).run(function ($log) {
        $log.info("GSTDataPushController initialized");
    });
}(mifosX.controllers || {}));
