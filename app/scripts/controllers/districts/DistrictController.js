(function (module) {
    mifosX.controllers = _.extend(module, {
        DistrictController: function(scope, resourceFactory, location) {
            scope.districts = [];
            scope.formData = {};

            if (!scope.searchCriteria.distircts) {
                scope.searchCriteria.distircts = {};
                scope.searchCriteria.distircts.filterText = null;
                scope.searchCriteria.distircts.countryId = null;
                scope.searchCriteria.distircts.stateId = null;
                scope.saveSC();
            }
            scope.filterText = scope.searchCriteria.distircts.filterText;
            scope.formData.countryId = scope.searchCriteria.distircts.countryId;
            scope.formData.stateId = scope.searchCriteria.distircts.stateId;

            resourceFactory.addressTemplateResource.get({}, function(data) {
                scope.countries = data.countryDatas;
                if (scope.formData.countryId) {
                    scope.changeCountry(scope.formData.countryId);
                }
                if (scope.formData.stateId) {
                    scope.fetchDistricts();
                }
            });

            scope.onFilter = function() {
                scope.searchCriteria.distircts.filterText = scope.filterText;
                scope.searchCriteria.distircts.countryId = scope.formData.countryId;
                scope.searchCriteria.distircts.stateId = scope.formData.stateId;
                scope.saveSC();
            };

            scope.changeCountry = function(countryId) {
                if (countryId != null) {
                    scope.selectCountry = _.filter(scope.countries, function(country) {
                        return country.countryId == countryId;
                    })
                    scope.states = scope.selectCountry[0].statesDatas;
                }
            };
            scope.fetchDistricts = function(){
                resourceFactory.districtsResource.query({stateId:scope.formData.stateId}, function(data){
                    scope.districts = data;
                    scope.onFilter();
                });
            };
            scope.initiateWorkflow = function (districtId) {
                resourceFactory.districtsResource.save({districtId: districtId, command: 'initiateWorkflow'},{}, function (data) {
                     location.path('/districtworkflow/'+data.resourceId+'/workflow');
                });
            };

            scope.routeToDistrict = function(id){
                location.path('/districts/'+id);
            }
        }
    });
    mifosX.ng.application.controller('DistrictController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.DistrictController]).run(function ($log) {
        $log.info("DistrictController initialized");
    });
}(mifosX.controllers || {}));