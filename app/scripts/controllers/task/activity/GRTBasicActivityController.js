(function(module) {
    mifosX.controllers = _.extend(module, {
        GRTBasicActivityController: function($controller, scope, routeParams, $modal, resourceFactory, location, dateFilter, route, $http, $rootScope, $route, $upload, API_VERSION) {
            angular.extend(this, $controller('defaultActivityController', {
                $scope: scope
            }));

            scope.first = {};
            scope.first.date = new Date();
            scope.formData = {};
            scope.loanIds = [];

            function initTask() {
                scope.centerId = scope.taskconfig.centerId;
                resourceFactory.centerWorkflowResource.get({
                    centerId: scope.centerId,
                    associations: 'groupMembers,profileratings,loanaccounts'
                }, function(data) {
                    scope.centerDetails = data;
                });

            };
            initTask();

            scope.addLoan = function(value, loanId) {
                if (value) {
                    scope.loanIds.push(loanId);
                } else {
                    var indexOfLoanId = scope.loanIds.indexOf(loanId);
                    if (indexOfLoanId >= 0) {
                        scope.loanIds.splice(indexOfLoanId, 1);
                    }
                }
            };

            scope.submit = function() {
                var expectedDisbursementDate = dateFilter(scope.first.date, scope.df);
                this.formData.dateFormat = scope.df;
                this.formData.locale = scope.optlang.code;
                this.formData.loans = scope.loanIds;
                this.formData.expectedDisbursementDate = expectedDisbursementDate;
                resourceFactory.loanUpdateDisbursementDateResource.updateexpecteddisbursementdate(this.formData, function(data) {
                    initTask();
                });
            };

        }
    });
    mifosX.ng.application.controller('GRTBasicActivityController', ['$controller', '$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter','$route', '$http', '$rootScope','$route', '$upload', 'API_VERSION', mifosX.controllers.GRTBasicActivityController]).run(function($log) {
        $log.info("GRTBasicActivityController initialized");
    });
}(mifosX.controllers || {}));