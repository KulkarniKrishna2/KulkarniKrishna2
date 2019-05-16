(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateOfficeTaxMappingController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.office = [{}];
            scope.officeOptions = [];
            scope.taxGroupOptions = [];
            resourceFactory.taxconfigurationsResourcetemplate.get({ entityType: "office" }, function (data) {
                scope.officeOptions = data.offices;
                scope.taxGroupOptions = data.taxGroupDatas;
            });
            scope.back = function () {
                location.path('/gstmapping/officeMappings');
            }
            scope.add = function () {
                scope.office.push({});
            }
            scope.removeOffice = function (index) {
                scope.office.splice(index, 1);
            }
            scope.submit = function () {
                var officeFormData = new Object();
                officeFormData.locale = scope.optlang.code;
                officeFormData.entityType = "office";
                officeFormData.entityObjects = [];
                for (var i = 0; i < scope.office.length; i++) {
                    var temp = new Object();
                    if (scope.office[i].officeId) {
                        temp.entityId = scope.office[i].officeId;
                    }
                    if (scope.office[i].taxGroupId) {
                        temp.taxGroupId = scope.office[i].taxGroupId;
                    }
                    officeFormData.entityObjects.push(temp);
                }
                resourceFactory.taxconfigurationsResource.save({ entityType: "office" }, officeFormData, function (data) {
                    location.path('/gstmapping/officeMappings');
                });
            }
        }
    });
    mifosX.ng.application.controller('CreateOfficeTaxMappingController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.CreateOfficeTaxMappingController]).run(function ($log) {
        $log.info("CreateOfficeTaxMappingController initialized");
    });
}(mifosX.controllers || {}));