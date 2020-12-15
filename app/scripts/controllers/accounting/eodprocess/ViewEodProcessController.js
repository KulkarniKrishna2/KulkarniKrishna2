(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewEodProcessController: function (scope, resourceFactory, location, routeParams, $modal, route) {
            scope.eodClosure = {};
            scope.choice = 0;
            resourceFactory.eodProcessResource.get({ eodProcessId: routeParams.id }, function (data) {
                scope.eod = data;
            });

            scope.viewEOD = function () {
                location.path('/eodonboarding/create/' + scope.eod.id + '/workflow');
            }
            scope.rejectEOD = function () {
                resourceFactory.eodProcessResource.delete({ eodProcessId: scope.eod.id }, function (data) {
                    if (data.resourceId) {
                        location.path('/eodprocess');
                    }
                });
            }

            scope.getOfficeName = function (officeName, officeReferenceNumber) {
                if (!scope.isReferenceNumberAsNameEnable) {
                    return officeName;
                } else {
                    return officeName + ' - ' + officeReferenceNumber;
                }
            }

            scope.isDone = function (status) {
                return status ? "✓" : "—";
            };

        }
    });
    mifosX.ng.application.controller('ViewEodProcessController', ['$scope', 'ResourceFactory', '$location', '$routeParams', '$modal', '$route', mifosX.controllers.ViewEodProcessController]).run(function ($log) {
        $log.info("ViewEodProcessController initialized");
    });
}(mifosX.controllers || {}));
