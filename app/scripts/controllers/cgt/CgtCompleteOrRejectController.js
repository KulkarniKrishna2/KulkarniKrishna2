(function (module) {
    mifosX.controllers = _.extend(module, {
        CgtCompleteOrRejectController: function (scope, resourceFactory, routeParams, location, $rootScope, dateFilter) {
            scope.isCgtComplete = $rootScope.isCgtComplete;
            scope.cgtDays = {};
            scope.cgtId = routeParams.cgtId;
            scope.formData = {};
            scope.formData.selectedDate = new Date();
            scope.label = "Complete CGT";
            var action = 'complete';
            if (!scope.isCgtComplete) {
                action = 'reject'
                scope.label = "Reject CGT"
            }

            scope.completeOrRejectCGT = function() {
                var selectedDate = dateFilter(scope.formData.selectedDate, scope.df);
                if(scope.isCgtComplete) {
                    this.formData.completedDate = selectedDate;
                } else {
                    this.formData.rejectedDate = selectedDate;
                }
                delete this.formData.selectedDate;
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                resourceFactory.cgtResource.update({id: scope.cgtId, action: action}, this.formData, function (data) {
                    location.path('/viewcgt/'+scope.cgtId);

                });
            };


        }
    });
    mifosX.ng.application.controller('CgtCompleteOrRejectController', ['$scope', 'ResourceFactory', '$routeParams', '$location', '$rootScope', 'dateFilter', mifosX.controllers.CgtCompleteOrRejectController]).run(function ($log) {
        $log.info("CgtCompleteOrRejectController initialized");
    });
}(mifosX.controllers || {}));

