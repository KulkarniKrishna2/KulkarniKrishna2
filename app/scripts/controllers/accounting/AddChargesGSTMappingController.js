(function (module) {
    mifosX.controllers = _.extend(module, {
        AddChargesGSTMappingController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.charges = [{}];
            scope.chargeOptions = [];
            scope.taxGroupOptions = [];
            resourceFactory.taxconfigurationsResourcetemplate.get({ entityType: "charges" }, function (data) {
                scope.chargeOptions = data.charges;
                scope.taxGroupOptions = data.taxGroupDatas;
            });
            scope.back = function () {
                location.path('/gstmapping/charges');
            }
            scope.add = function () {
                scope.charges.push({});
            }
            scope.removeCharge = function (index) {
                scope.charges.splice(index, 1);
            }
            scope.submit = function () {
                var chargeFormData = new Object();
                chargeFormData.locale = scope.optlang.code;
                chargeFormData.entityType = "charges";
                chargeFormData.entityObjects = [];
                for (var i = 0; i < scope.charges.length; i++) {
                    var temp = new Object();
                    if (scope.charges[i].chargeId) {
                        temp.entityId = scope.charges[i].chargeId;
                    }
                    if (scope.charges[i].percentage) {
                        temp.percentage = scope.charges[i].percentage;
                    }
                    if (scope.charges[i].taxGroupId) {
                        temp.taxGroupId = scope.charges[i].taxGroupId;
                    }
                    chargeFormData.entityObjects.push(temp);
                }
                resourceFactory.taxconfigurationsResource.save({ entityType: "charges" }, chargeFormData, function (data) {
                    location.path('/gstmapping/charges');
                });
            }
        }
    });
    mifosX.ng.application.controller('AddChargesGSTMappingController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.AddChargesGSTMappingController]).run(function ($log) {
        $log.info("AddChargesGSTMappingController initialized");
    });
}(mifosX.controllers || {}));