(function (module) {
    mifosX.controllers = _.extend(module, {
        DeceasedDetailsActivityController: function ($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));
            scope.deceasedReasonOptions = [];
            scope.deceasedPersonOptions = [];
            scope.formData = {};
            scope.formData.locale = scope.optlang.code;
            scope.formData.dateFormat = scope.df;
            scope.isDeceasedDetailsCreated = false;

            scope.getDeceasedDetails = function () {
                resourceFactory.deceasedDetailsResource.get({ clientId: scope.clientId }, {},
                    function (data) {
                        if (angular.isDefined(data) && angular.isDefined(data.id)) {
                            scope.deceasedDetailsData = data;
                            scope.isDeceasedDetailsCreated = true;
                            scope.deceasedDetailsId = data.id;
                        }
                    });
            }

            scope.getTemplate = function () {
                resourceFactory.deceasedDetailsTemplateResource.get({ clientId: scope.clientId },
                    function (data) {
                        scope.deceasedReasonOptions = data.deceasedReasonOptions;
                        scope.deceasedPersonOptions = data.deceasedPersonOptions;
                    });
            }

            scope.init = function () {
                scope.getDeceasedDetails();
                if (!scope.isDeceasedDetailsCreated) {
                    scope.getTemplate();
                }
            }
            scope.init();
            scope.submit = function () {
                scope.formData.announceDate = dateFilter(scope.announceDate, scope.df);
                scope.formData.deceasedDate = dateFilter(scope.deceasedDate, scope.df);
                if (scope.deceasedDetailsId) {
                    resourceFactory.deceasedDetailsResource.update({ clientId: scope.clientId, deceasedDetailsId: scope.deceasedDetailsId }, this.formData,
                        function (data) {
                            scope.init();
                            scope.isDeceasedDetailsCreated = true;
                        });
                } else {
                    resourceFactory.deceasedDetailsResource.save({ clientId: scope.clientId }, this.formData,
                        function (data) {
                            scope.init();
                            scope.isDeceasedDetailsCreated = true;
                        });
                }

            };

            scope.editDeceasedDetails = function () {
                scope.getTemplate();
                scope.announceDate = new Date(scope.deceasedDetailsData.announceDate);
                scope.deceasedDate = new Date(scope.deceasedDetailsData.deceasedDate);
                scope.formData.deceasedPerson = scope.deceasedDetailsData.deceasedPerson.id;
                scope.formData.deceasedReason = scope.deceasedDetailsData.deceasedReason.id;
                scope.isDeceasedDetailsCreated = false;
            }


        }
    });
    mifosX.ng.application.controller('DeceasedDetailsActivityController', ['$controller', '$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.DeceasedDetailsActivityController]).run(function ($log) {
        $log.info("DeceasedDetailsActivityController initialized");
    });
}(mifosX.controllers || {}));