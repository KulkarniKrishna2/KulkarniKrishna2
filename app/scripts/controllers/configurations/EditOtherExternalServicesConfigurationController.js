/**
 * Created by 27 on 04-08-2015.
 */
(function (module) {
    mifosX.controllers = _.extend(module, {
        EditOtherExternalServicesConfigurationController: function ($scope, resourceFactory, $routeParams, location) {
            $scope.formData = {};
            $scope.serviceId = $routeParams.serviceId;
            //$scope.name = $routeParams.name;
            resourceFactory.otherExternalServicesResource.get({serviceId: $scope.serviceId}, function (data) {
                $scope.formData.propertiesForm = [];
                $scope.serviceData = data;
                $scope.serviceData.properties.forEach(function (item) {
                    var propertyForm = {
                        name: item.name,
                        incomingvalue: item.value,
                        incomingisEncrypted: item.isEncrypted,
                        value: item.value,
                        isEncrypted: item.isEncrypted
                    };
                    $scope.formData.propertiesForm.push(propertyForm);
                });
            });

            $scope.cancel = function () {
                location.path('/otherexternalservices/'+ $scope.serviceId);
            };

            $scope.submit = function () {
                var deltaPropertiesForm = [];
                $scope.formData.propertiesForm.forEach(function (item) {
                    if(item.value != item.incomingvalue || item.isEncrypted != item.incomingisEncrypted){
                        var propertyForm = {
                            name: item.name,
                            value: item.value,
                            isEncrypted: item.isEncrypted
                        };
                        deltaPropertiesForm.push(propertyForm);
                    }
                });

                if(deltaPropertiesForm.length > 0){
                    resourceFactory.otherExternalServicePropertiesResource.put({serviceId: $scope.serviceId}, deltaPropertiesForm, function (data) {
                        location.path('/otherexternalservices/' + $scope.serviceId);
                    });
                }else{
                    $scope.cancel();
                }

            };
        }

    });
    mifosX.ng.application.controller('EditOtherExternalServicesConfigurationController', ['$scope', 'ResourceFactory', '$routeParams', '$location', mifosX.controllers.EditOtherExternalServicesConfigurationController]).run(function ($log) {
        $log.info("EditOtherExternalServicesConfigurationController initialized");
    });

}(mifosX.controllers || {}));
