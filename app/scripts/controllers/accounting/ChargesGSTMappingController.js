(function (module) {
    mifosX.controllers = _.extend(module, {
        ChargesGSTMappingController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.charges = [{}];
            scope.chargeOptions = [];
            scope.taxGroupOptions = [];
            scope.chargesData = [];
            resourceFactory.taxconfigurationsResourcetemplate.get({ entityType: "charges" }, function (data) {
                scope.chargeOptions = data.charges;
                scope.taxGroupOptions = data.taxGroupDatas;
            });
            resourceFactory.taxconfigurationsResource.query({ entityType: "charges" }, function (data) {
                scope.chargesData = data;
            });
            scope.addCharge = function () {
                scope.charges.push({});
                location.path('/gstmapping/addcharges');
            }
            scope.back = function () {
                location.path('/gstmapping/charges');
            }
            scope.add = function () {
                scope.charges.push({});
            }
            scope.removeCharge = function (index) {
                scope.charges.splice(index, 1);
            }
            scope.edit = function (entityId) {
                location.path('/editgstmapping/charges/' + entityId);
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
    mifosX.ng.application.controller('ChargesGSTMappingController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.ChargesGSTMappingController]).run(function ($log) {
        $log.info("ChargesGSTMappingController initialized");
    });
}(mifosX.controllers || {}));