/**
 * Created by jagadeeshakn on 7/20/2016.
 */
(function (module) {
    mifosX.controllers = _.extend(module, {
        AddressActivityController: function ($controller, scope, routeParams, location, resourceFactory) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            function initTask(){
                scope.clientId = scope.taskconfig['clientId'];
                scope.clientOfficeId=scope.taskconfig['officeId'];
                scope.entityType = "clients";
                scope.showform=false;
                populateAddressData();
            };
            function populateTemplateData()
            {
                scope.addressType = [];
                scope.countrys = [];
                scope.states = [];
                scope.districts = [];
                scope.talukas = [];
                scope.formData = {};
                scope.addressData={};
                scope.formDataList = [scope.formData];
                scope.formData.addressTypes = [];
                var villageConfig = 'populate_client_address_from_villages';
                scope.isPopulateClientAddressFromVillages = scope.isSystemGlobalConfigurationEnabled(villageConfig);
                
                
                resourceFactory.addressTemplateResource.get({}, function (data) {
                    scope.addressType = data.addressTypeOptions;
                    scope.countries = data.countryDatas;
                    scope.setDefaultGISConfig();
                });

                resourceFactory.villageResource.getAllVillages({officeId:scope.clientOfficeId, limit: 1000},function (data) {
                    scope.villages = data;
                });
            }
            function populateAddressData()
            {
                resourceFactory.addressDataResource.getAll({
                    entityType: scope.entityType,
                    entityId: scope.clientId
                }, function (response) {
                    if (response != null) {
                        scope.addressData = response;
                        scope.showform=false;
                    }
                });
            }
            
            scope.setDefaultGISConfig = function () {
                if(scope.responseDefaultGisData && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address){
                    if(scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.countryName) {

                        var countryName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.countryName;
                        scope.defaultCountry = _.filter(scope.countries, function (country) {
                            return country.countryName === countryName;

                        });
                        scope.formData.countryId = scope.defaultCountry[0].countryId;
                        scope.states = scope.defaultCountry[0].statesDatas;
                    }

                    if(scope.states && scope.states.length > 0 && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.stateName) {
                        var stateName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.stateName;
                        scope.defaultState = _.filter(scope.states, function (state) {
                            return state.stateName === stateName;

                        });
                        scope.formData.stateId =  scope.defaultState[0].stateId;
                        scope.districts = scope.defaultState[0].districtDatas;
                    }

                }

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
                    if(scope.formData.talukaId){
                        delete scope.formData.talukaId;
                    }

                    scope.states = scope.selectCountry[0].statesDatas;
                }
            }

            scope.changeState = function (stateId) {
                if (stateId != null) {
                    scope.selectState = _.filter(scope.states, function (state) {
                        return state.stateId == stateId;
                    })
                    if (scope.formData.districtId) {
                        delete scope.formData.districtId;
                    }
                    if(scope.formData.talukaId){
                        delete scope.formData.talukaId;
                    }
                    scope.districts = scope.selectState[0].districtDatas;
                }
            }
            scope.changeDistrict = function (districtId) {
                if (districtId != null) {
                    scope.selectDistrict = _.filter(scope.districts, function (districts) {
                        return districts.districtId == districtId;
                    })

                    if(scope.formData.talukaId){
                        delete scope.formData.talukaId;
                    }
                    scope.talukas = scope.selectDistrict[0].talukaDatas;
                }
            }

            scope.cancel = function () {
                scope.showform=false;
                scope.formData={};
            }

            scope.addAddress = function () {
                scope.showform=true;
                scope.formData={};
                populateTemplateData();
            }

            scope.changeVillage = function (villageId) {
                if (villageId != null) {
                    if (scope.formData.districtId) {
                        delete scope.formData.districtId;
                    }
                    if(scope.formData.talukaId){
                        delete scope.formData.talukaId;
                    }
                    scope.formData.villageTown =null;
                    scope.talukas = null;
                    scope.formData.postalCode = null;
                    scope.districts = null;
                    resourceFactory.villageResource.get({villageId: villageId}, function (response) {
                        if (response.addressData.length > 0) {
                            if(response.villageName){
                                scope.formData.villageTown = response.villageName;
                            }
                            if (response.addressData[0].countryData) {
                                scope.formData.countryId = response.addressData[0].countryData.countryId;
                            }
                            if (response.addressData[0].stateData) {
                               scope.states = response.addressData[0].countryData.statesDatas;
                                scope.formData.stateId = response.addressData[0].stateData.stateId;
                            }
                            if (response.addressData[0].districtData) {
                                scope.districts = response.addressData[0].stateData.districtDatas;
                                scope.formData.districtId = response.addressData[0].districtData.districtId;
                            }
                            scope.talukas = response.addressData[0].districtData.talukaDatas;
                            if (response.addressData[0].talukaData) {
                                scope.formData.talukaId = response.addressData[0].talukaData.talukaId;
                            }
                            if (response.addressData[0].postalCode) {
                                scope.formData.postalCode = response.addressData[0].postalCode;
                            }
                        }

                    });
                }
            }

                scope.submit = function () {
                scope.entityType = "clients";
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;

                if (scope.formData.countryId == null || scope.formData.countryId == ""){
                    delete scope.formData.countryId;
                }
                if (scope.formData.stateId == null || scope.formData.stateId == ""){
                    delete scope.formData.stateId;
                }
                if (scope.formData.districtId == null || scope.formData.districtId == ""){
                    delete scope.formData.districtId;
                }
                    if (scope.formData.talukaId == null || scope.formData.talukaId == ""){
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
                resourceFactory.addressResource.create({entityType:scope.entityType,entityId:scope.clientId}, {addresses: scope.formDataList}, function (data) {
                        populateAddressData();
                });

            };
            initTask();

            
            
        }

    });
    mifosX.ng.application.controller('AddressActivityController', ['$controller','$scope', '$routeParams', '$location', 'ResourceFactory',mifosX.controllers.AddressActivityController]).run(function ($log) {
        $log.info("AddressActivityController initialized");
    });
}(mifosX.controllers || {}));