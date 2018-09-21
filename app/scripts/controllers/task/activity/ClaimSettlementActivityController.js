(function (module) {
    mifosX.controllers = _.extend(module, {
        ClaimSettlementActivityController: function ($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));
            scope.formData = {};
            scope.formData.locale = scope.optlang.code;
            scope.formData.dateFormat = scope.df;
            scope.isClaimSettlementCreated = false;

            scope.getTemplate = function () {
                resourceFactory.claimSettlementTemplateResource.get({ clientId: scope.clientId },
                    function (data) {
                        scope.formData.repaidAmount = data.repaidAmount;
                        scope.formData.loanOutstanding = data.loanOutstanding;
                    });
            };

            scope.init = function () {
                resourceFactory.claimSettlementResource.get({ clientId: scope.clientId },
                    function (data) {
                        if (data && data.id) {
                            scope.isClaimSettlementCreated = true;
                            scope.claimSettlementData = data;
                        } else {
                            scope.getTemplate();
                        }
                    });
            };
            scope.init();


            scope.submit = function () {
                resourceFactory.claimSettlementResource.save({ clientId: scope.clientId }, this.formData,
                    function (data) {
                        scope.init();
                    });
            };
        }
    });
    mifosX.ng.application.controller('ClaimSettlementActivityController', ['$controller', '$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.ClaimSettlementActivityController]).run(function ($log) {
        $log.info("ClaimSettlementActivityController initialized");
    });
}(mifosX.controllers || {}));