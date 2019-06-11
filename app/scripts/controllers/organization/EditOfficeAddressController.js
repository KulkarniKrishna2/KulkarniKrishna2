(function (module) {
    mifosX.controllers = _.extend(module, {
        EditOfficeAddressController: function (scope, routeParams, location, resourceFactory) {
            scope.addressId = routeParams.addressId;
            scope.officeId = routeParams.officeId;
            scope.addressType = [];
            scope.countries = [];
            scope.states = [];
            scope.districts = [];
            scope.talukas = [];
            scope.formData = {};
            scope.formData.addressTypes = [];
            scope.entityType = "offices";
            scope.pincode = false;
            scope.isVillageTownMandatory = false;
            scope.isCountryReadOnly = false;
            scope.isAddressTypeMandatory = false;
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createOffice && scope.response.uiDisplayConfigurations.createOffice.isHiddenField.pincode) {
                scope.pincode = scope.response.uiDisplayConfigurations.createOffice.isHiddenField.pincode;
            }
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createOffice && scope.response.uiDisplayConfigurations.createOffice.isMandatoryField.villageTown) {
                scope.isVillageTownMandatory = scope.response.uiDisplayConfigurations.createOffice.isMandatoryField.villageTown;
            }
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.defaultGISConfig.isReadOnlyField.countryName) {
                scope.isCountryReadOnly = scope.response.uiDisplayConfigurations.defaultGISConfig.isReadOnlyField.countryName;
            }
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createOffice && scope.response.uiDisplayConfigurations.createOffice.isMandatoryField.addressType) {
                scope.isAddressTypeMandatory = scope.response.uiDisplayConfigurations.createOffice.isMandatoryField.addressType;
            }
            resourceFactory.addressTemplateResource.get({}, function (data) {
                scope.addressType = data.addressTypeOptions;
                scope.countries = data.countryDatas;
                scope.getEntityAddress();
            });

            scope.getEntityAddress = function () {
                resourceFactory.entityAddressResource.getAddress({entityType: scope.entityType, entityId: scope.officeId, addressId: scope.addressId, template: true}, function (data) {
                    if (data.addressEntityData[0].addressType) {
                        scope.addressTypeId = data.addressEntityData[0].addressType.id;
                    }
                    if (data.houseNo) {
                        scope.formData.houseNo = data.houseNo;
                    }
                    if (data.addressLineOne) {
                        scope.formData.addressLineOne = data.addressLineOne;
                    }
                    if (data.villageTown) {
                        scope.formData.villageTown = data.villageTown;
                    }
                    if (data.postalCode) {
                        scope.formData.postalCode = data.postalCode;
                    }
                    scope.districts = data.stateData.districtDatas
                    scope.states = data.countryData.statesDatas;
                    if (data.stateData && data.stateData.stateId) {
                        scope.formData.stateId = data.stateData.stateId;
                    }
                    if (data.countryData && data.countryData.countryId) {
                        scope.formData.countryId = data.countryData.countryId;
                    }
                    for (var i in scope.districts) {
                        if (data.talukaData.districtId == scope.districts[i].districtId) {
                            scope.talukas = scope.districts[i].talukaDatas;
                        }
                    }
                    if (data.talukaData && data.talukaData.talukaId) {
                        scope.formData.talukaId = data.talukaData.talukaId;
                        scope.formData.districtId = data.talukaData.districtId;
                    }
                });
            };

            scope.changeCountry = function (countryId) {
                if (countryId != null) {
                    scope.selectCountry = _.filter(scope.countries, function (country) {
                        return country.countryId == countryId;
                    })
                    if (scope.formData.stateId) {
                        delete scope.formData.stateId;
                    }
                    if (scope.formData.districtId) {
                        delete scope.formData.districtId;
                    }
                    if (scope.formData.talukaId) {
                        delete scope.formData.talukaId;
                    }
                    scope.states = scope.selectCountry[0].statesDatas;
                    scope.districts = null;
                    scope.talukas = null;

                }
            };

            scope.changeState = function (stateId) {
                if (stateId != null) {
                    scope.selectState = _.filter(scope.states, function (state) {
                        return state.stateId == stateId;
                    })
                    if (scope.formData.districtId) {
                        delete scope.formData.districtId;
                    }
                    if (scope.formData.talukaId) {
                        delete scope.formData.talukaId;
                    }
                    scope.districts = scope.selectState[0].districtDatas;
                    scope.getActiveDistricts();
                    scope.talukas = null;
                }
            };
            scope.activeStatus = 300;
            scope.getActiveDistricts = function(){
                var tempDist = [];
                for(var i in scope.districts){
                    if(scope.districts[i].status.id==scope.activeStatus){
                        tempDist.push(scope.districts[i]);
                    }
                }
                scope.districts = tempDist;
            }

            scope.changeDistrict = function (districtId) {
                if (districtId != null) {
                    scope.talukas = null;
                    scope.selectDistrict = _.filter(scope.districts, function (districts) {
                        return districts.districtId == districtId;
                    })

                    if (scope.formData.talukaId) {
                        delete scope.formData.talukaId;
                    }
                    scope.talukas = scope.selectDistrict[0].talukaDatas;
                }
            };

            scope.submit = function () {
                scope.formData.entityId = scope.officeId;
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;
                scope.formData.addressId = scope.addressId;
                scope.formData.addressTypes = [scope.addressTypeId];

                if (scope.formData.countryId == null || scope.formData.countryId == "") {
                    delete scope.formData.countryId;
                }
                if (scope.formData.stateId == null || scope.formData.stateId == "") {
                    delete scope.formData.stateId;
                }
                if (scope.formData.districtId == null || scope.formData.districtId == "") {
                    delete scope.formData.districtId;
                }
                if (scope.formData.talukaId == null || scope.formData.talukaId == "") {
                    delete scope.formData.talukaId;
                }
                if (scope.formData.addressTypes == null || scope.formData.addressTypes == "") {
                    delete scope.formData.addressTypes;
                }
                if (scope.formData.houseNo == null || scope.formData.houseNo == "") {
                    delete scope.formData.houseNo;
                }
                if (scope.formData.addressLineOne == null || scope.formData.addressLineOne == "") {
                    delete scope.formData.addressLineOne;
                }

                resourceFactory.entityAddressResource.update({entityType: scope.entityType, entityId: scope.officeId, addressId: scope.addressId}, scope.formData, function (data) {
                    location.path('/viewoffice/' + scope.officeId);
                });
            };
        }

    });
    mifosX.ng.application.controller('EditOfficeAddressController', ['$scope', '$routeParams', '$location', 'ResourceFactory', mifosX.controllers.EditOfficeAddressController]).run(function ($log) {
        $log.info("EditOfficeAddressController initialized");
    });
}(mifosX.controllers || {}));