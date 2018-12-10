(function (module) {
    mifosX.controllers = _.extend(module, {
        ClaimInsurenceActivityController: function ($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));
            scope.formData = {};
            scope.formData.locale = scope.optlang.code;
            scope.formData.dateFormat = scope.df;
            scope.isClaimInsurenceCreated = false;

            scope.getTemplate = function () {
                resourceFactory.claimInsurenceTemplateResource.get({ clientId: scope.clientId },
                    function (data) {
                        scope.formData.repaidAmount = data.repaidAmount;
                        scope.formData.loanOutstanding = data.loanOutstanding;
                        scope.formData.disbursedAmount = data.disbursedAmount;
                        scope.staffOptions = data.staffOptions;
                    });
            };

            scope.init = function () {
                resourceFactory.claimInsurenceResource.get({ clientId: scope.clientId },
                    function (data) {
                        if (data && data.id) {
                            scope.isClaimInsurenceCreated = true;
                            scope.claimInsurenceData = data;
                        } else {
                            scope.getTemplate();
                        }
                    });
            };
            scope.init();

            scope.submit = function () {
                resourceFactory.claimInsurenceResource.save({ clientId: scope.clientId }, this.formData,
                    function (data) {
                        scope.init();
                    });
            };
        }
    });
    mifosX.ng.application.controller('ClaimInsurenceActivityController', ['$controller', '$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.ClaimInsurenceActivityController]).run(function ($log) {
        $log.info("ClaimInsurenceActivityController initialized");
    });
}(mifosX.controllers || {}));