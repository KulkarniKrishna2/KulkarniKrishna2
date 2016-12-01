(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewCgtController: function (scope, resourceFactory, routeParams, location, $rootScope, $route) {
            scope.cgt = {};
            $rootScope.cgtId = routeParams.cgtId;
            $rootScope.isCgtDayComplete = false;
            $rootScope.isCgtComplete = false;

            resourceFactory.cgtResource.getCgtById({id: routeParams.cgtId}, function (data) {
                scope.cgt = data;
                scope.cgt.entityId = data.entityId;

            });


            scope.createCgtDays = function (cgtDayCreationType) {
                var json = {cgtDayCreationType : cgtDayCreationType};
                resourceFactory.cgtDaysResource.save({id: routeParams.cgtId}, json, function (data) {
                    $route.reload();
                });
            }

            scope.canCgtBeCompleted = function(){
                var isAllCgtDaysCompleted = true;
                if(scope.cgt.dayDatas) {
                    for (var i = 0; i < scope.cgt.dayDatas.length; i++) {
                        if (scope.cgt.dayDatas[i].status == "NEW") {
                            isAllCgtDaysCompleted = false;
                            break;
                        } else {
                            isAllCgtDaysCompleted = true;
                        }
                    }
                }
                if(scope.cgt.status.value == "NEW" || scope.cgt.status.value == 'COMPLETE' || scope.cgt.status.value == 'REJECT'){
                    isAllCgtDaysCompleted = false;
                }
                return isAllCgtDaysCompleted;
            }

            scope.completeCgtDay = function (cgtDayId) {
                $rootScope.isCgtDayComplete = true;
                location.path("/updatecgtdays/" + cgtDayId);
            }

            scope.completeCgt = function (cgtId) {
                $rootScope.isCgtComplete = true;
                location.path("/completecgt/" + cgtId);
            }

            scope.rejectCgt = function (cgtId) {
                $rootScope.isCgtComplete = false;
                location.path("/rejectcgt/" + cgtId);
            }
        }
    });
    mifosX.ng.application.controller('ViewCgtController', ['$scope', 'ResourceFactory', '$routeParams', '$location', '$rootScope', '$route', mifosX.controllers.ViewCgtController]).run(function ($log) {
        $log.info("ViewCgtController initialized");
    });
}(mifosX.controllers || {}));

