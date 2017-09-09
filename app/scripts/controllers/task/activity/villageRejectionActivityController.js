(function (module) {
    mifosX.controllers = _.extend(module, {
        villageRejectionActivityController: function ($controller, scope, resourceFactory, location, routeParams, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.districtId = scope.taskconfig['districtId'];
            scope.formData = {};

            resourceFactory.districtsResource.get({districtId: scope.districtId}, function(data){
                scope.district = data;
                resourceFactory.districtsVillageResource.query({districtId: scope.districtId}, function(data){
                    scope.villages = data;
                });
            });

            scope.submit = function () {
                scope.formData.villages = [];
                for (var i = 0; i < villages.length; i++) {
                    if (villages[i].checkbox) {
                        scope.formData.villages.push(villages[i].toString());
                    }
                }
                resourceFactory.bulkVillageResource.reject({}, scope.formData, function (data) {
                    location.path('/districts');
                });
            };
        }

    });
    mifosX.ng.application.controller('villageRejectionActivityController', ['$controller', '$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.villageRejectionActivityController]).run(function ($log) {
        $log.info("villageRejectionActivityController initialized");
    });
}(mifosX.controllers || {}));