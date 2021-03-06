(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateOfficeAddressController: function (scope, routeParams, location, resourceFactory) {
            scope.officeId = routeParams.officeId;
            scope.addressType = [];
            scope.countrys = [];
            scope.states = [];
            scope.districts = [];
            scope.talukas = [];
            scope.formData = {};
            scope.formDataList = [scope.formData];
            scope.addressTypes = [];
            scope.isAddressTypeMandatory = false;
            scope.isCountryReadOnly = false;
            scope.pincode = false;
            scope.isVillageTownMandatory = false;
            scope.isCountryReadOnly = false;
            scope.isAddressTypeMandatory = false;
            scope.isVillageTownHidden = false;
            var levelBasedAddressConfig = 'enable_level_based_address';
            scope.isLevelBasedAddressEnabled = scope.isSystemGlobalConfigurationEnabled(levelBasedAddressConfig);
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.defaultGISConfig.isReadOnlyField.countryName) {
                scope.isCountryReadOnly = scope.response.uiDisplayConfigurations.defaultGISConfig.isReadOnlyField.countryName;
            }
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createOffice) {
                if(scope.response.uiDisplayConfigurations.createOffice.isHiddenField){
                    if(scope.response.uiDisplayConfigurations.createOffice.isHiddenField.pincode){
                        scope.pincode = scope.response.uiDisplayConfigurations.createOffice.isHiddenField.pincode;
                    }
                    if(scope.response.uiDisplayConfigurations.createOffice.isHiddenField.villageTown){
                        scope.isVillageTownHidden = scope.response.uiDisplayConfigurations.createOffice.isHiddenField.villageTown;
                    }
                }
                
                if (scope.response.uiDisplayConfigurations.createOffice.isMandatoryField) {
                    if(scope.response.uiDisplayConfigurations.createOffice.isMandatoryField.villageTown){
                        scope.isVillageTownMandatory = scope.response.uiDisplayConfigurations.createOffice.isMandatoryField.villageTown;
                    }
                    if(scope.response.uiDisplayConfigurations.createOffice.isMandatoryField.addressType){
                        scope.isAddressTypeMandatory = scope.response.uiDisplayConfigurations.createOffice.isMandatoryField.addressType;
                    }
                }
            }          
        
            resourceFactory.addressTemplateResource.get({}, function (data) {
                scope.addressType = data.addressTypeOptions;
                if(scope.isLevelBasedAddressEnabled){
                    scope.addressData = data.addressData;
                    scope.addressLevels = data.addressLevels;
                    for(var i in scope.addressLevels){
                        if(scope.addressLevels[i].identifier === 'country'){
                            scope.countries = data.addressData[scope.addressLevels[i].identifier];
                            break;
                        }
                    }
                }else{
                    scope.countries = data.countryDatas;
                }
                scope.setDefaultGISConfig();
            });

            resourceFactory.villageResource.getAllVillages({officeId: routeParams.officeId, limit: -1}, function (data) {
                scope.villages = data;
            });

            scope.setDefaultGISConfig = function () {
                if (scope.responseDefaultGisData && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address) {
                    if (scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.countryName) {
                        var countryName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.countryName;
                        if(scope.isLevelBasedAddressEnabled){
                            scope.defaultCountry = _.filter(scope.countries, function (country) {
                                return country.name === countryName;
                            });
                            scope.formData.countryId = scope.defaultCountry[0].id;

                            var levelLists = ['division', 'state']
                            for(var i in scope.addressLevels){
                                if(levelLists.indexOf(scope.addressLevels[i].identifier) >= 0 ){
                                    scope.states = scope.addressData[scope.addressLevels[i].identifier];
                                    break;
                                }
                            }
                            if(scope.states && scope.states.length > 0 && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.stateName) {
                                var stateName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.stateName;
                                scope.defaultState = _.filter(scope.states, function (state) {
                                    return state.name === stateName;
                                });
                                var levelLists = ['township','district'];
                                for(var i in scope.addressLevels){
                                    if(levelLists.indexOf(scope.addressLevels[i].identifier) >= 0 ){
                                        scope.districts = scope.addressData[scope.addressLevels[i].identifier];
                                        break;
                                    }
                                }
                            }
                        }else{
                            scope.defaultCountry = _.filter(scope.countries, function (country) {
                                return country.countryName === countryName;
                            });
                            scope.formData.countryId = scope.defaultCountry[0].countryId;
                            scope.states = scope.defaultCountry[0].statesDatas;

                            if(scope.states && scope.states.length > 0 && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.stateName) {
                                var stateName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.stateName;
                                scope.defaultState = _.filter(scope.states, function (state) {
                                    return state.stateName === stateName;
                                });
                                scope.formData.stateId =  scope.defaultState[0].stateId;
                                scope.districts = scope.defaultState[0].districtDatas;
                            }
                        } 
                    }
                }
            };

            scope.changeCountry = function (countryId) {
                if (scope.formData.stateId) {
                    delete scope.formData.stateId;
                }
                if (scope.formData.districtId) {
                    delete scope.formData.districtId;
                }
                if(scope.formData.talukaId){
                    delete scope.formData.talukaId;
                }
                if(scope.formData.wardAndVillagesId){
                    delete scope.formData.wardAndVillagesId;
                }
                scope.states = null;
                scope.districts = null;
                scope.talukas = null;
                scope.wardAndVillages = null;
                if (countryId != null) {
                    if(scope.isLevelBasedAddressEnabled){
                        scope.selectCountry = _.filter(scope.countries, function (country) {
                            return country.id == countryId;
                        })
                        var levelLists = ['division', 'state'];
                        for(var i in scope.addressLevels){
                            if(levelLists.indexOf(scope.addressLevels[i].identifier) >= 0 ){
                                scope.statesTemp = scope.addressData[scope.addressLevels[i].identifier];
                                break;
                            }
                        }
                        scope.states = _.filter(scope.statesTemp, function (state) {
                            return state.parentId == countryId;
                        });
                    }else{
                        scope.selectCountry = _.filter(scope.countries, function (country) {
                            return country.countryId == countryId;
                        })

                         scope.states = scope.selectCountry[0].statesDatas;
                    }
                }
            };

            scope.changeState = function (stateId) {
                if (scope.formData.districtId) {
                    delete scope.formData.districtId;
                }
                if(scope.formData.talukaId){
                    delete scope.formData.talukaId;
                }
                if(scope.formData.wardAndVillagesId){
                    delete scope.formData.wardAndVillagesId;
                }
                scope.districts = null;
                scope.talukas = null;
                scope.wardAndVillages = null;
                if (stateId != null) {
                    if(scope.isLevelBasedAddressEnabled){
                        scope.selectState = _.filter(scope.states, function (state) {
                            return state.id == stateId;
                        })
                        var levelLists = ['township','district'];
                        for(var i in scope.addressLevels){
                            if(levelLists.indexOf(scope.addressLevels[i].identifier) >= 0 ){
                                scope.districtsTemp = scope.addressData[scope.addressLevels[i].identifier];
                                break;
                            }
                        }
                        scope.districts = _.filter(scope.districtsTemp, function (district) {
                            return district.parentId == stateId;
                        });
                    }else{
                        scope.selectState = _.filter(scope.states, function (state) {
                            return state.stateId == stateId;
                        })
                        scope.districts = scope.selectState[0].districtDatas;
                    }
                    scope.getActiveDistricts();
                }
            };

            scope.changeDistrict = function (districtId) {
                if(scope.formData.talukaId){
                    delete scope.formData.talukaId;
                }
                if(scope.formData.wardAndVillagesId){
                    delete scope.formData.wardAndVillagesId;
                }
                scope.talukas = null;
                scope.wardAndVillages = null;
                if (districtId != null) {
                    if(scope.isLevelBasedAddressEnabled){
                        scope.selectDistrict = _.filter(scope.districts, function (districts) {
                            return districts.id == districtId;
                        })
                        var levelLists = ['taluka','town','ward','villagetract']; 
                        var talukasTemp = [];            
                        for(var i in scope.addressLevels){
                            if((levelLists.indexOf(scope.addressLevels[i].identifier) >= 0) && scope.addressData[scope.addressLevels[i].identifier] != null ){
                                talukasTemp = talukasTemp.concat(scope.addressData[scope.addressLevels[i].identifier]);
                            }
                        }
                        scope.talukas = _.filter(talukasTemp, function (taluka) {
                            return taluka.parentId == districtId;
                        });
                        scope.showTalukas = (scope.talukas.length > 0); 

                     }else{
                        scope.selectDistrict = _.filter(scope.districts, function (districts) {
                            return districts.districtId == districtId;
                        })
                        scope.talukas = scope.selectDistrict[0].talukaDatas;
                        if(scope.talukas.length > 0){
                            scope.isShowTaluka = true;
                        }else{
                            scope.isShowTaluka = false;
                        }
                    }
                }
            };

            scope.changeTaluka = function (talukaId) {
                if(scope.formData.wardAndVillagesId){
                    delete scope.formData.wardAndVillagesId;
                }
                scope.wardAndVillages = null;
                if (talukaId != null) {
                    scope.selectWardAndVillage = _.filter(scope.talukas, function (taluka) {
                        return taluka.id == talukaId;
                    })	                    
                    scope.formData.addressRegionValueId = talukaId;
                    var levelLists = ['wardleaf','village'];
                    scope.wardAndVillagesTemp = [];             
                    for(var i in scope.addressLevels){
                        if(levelLists.indexOf(scope.addressLevels[i].identifier) >= 0 ){
                            scope.wardAndVillagesTemp = scope.wardAndVillagesTemp.concat(scope.addressData[scope.addressLevels[i].identifier]);
                        }
                    }
                    scope.wardAndVillages = _.filter(scope.wardAndVillagesTemp, function (wardAndVillages) {
                        return wardAndVillages.parentId == talukaId});
                    scope.showWardAndVillages = (scope.wardAndVillages.length > 0); 
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

            scope.changeVillage = function () {
                if (scope.formData.villageId != null && scope.formData.villageId != undefined) {
                    if (scope.formData.districtId) {
                        delete scope.formData.districtId;
                    }
                    if (scope.formData.talukaId) {
                        delete scope.formData.talukaId;
                    }
                    scope.formData.villageTown = null;
                    scope.talukas = null;
                    scope.formData.postalCode = null;
                    scope.districts = null;
                    resourceFactory.villageResource.get({
                        villageId: scope.formData.villageId
                    }, function (response) {
                        if (response.addressData.length > 0) {
                            if (response.villageName) {
                                scope.formData.villageTown = response.villageName;
                            }
                            if (response.addressData[0].countryData) {
                                scope.formData.countryId = response.addressData[0].countryData.countryId;
                                scope.changeCountry(scope.formData.countryId)
                            }
                            if (response.addressData[0].stateData) {
                                scope.formData.stateId = response.addressData[0].stateData.stateId;
                                scope.changeState(scope.formData.stateId);
                            }
                            if (response.addressData[0].districtData) {
                                scope.formData.districtId = response.addressData[0].districtData.districtId;
                                scope.changeDistrict(scope.formData.districtId);
                            }

                            if (response.addressData[0].talukaData) {
                                scope.formData.talukaId = response.addressData[0].talukaData.talukaId;
                            }
                            if (response.addressData[0].postalCode) {
                                scope.formData.postalCode = response.addressData[0].postalCode;
                            }
                        }

                    });
                }
            };

            scope.submit = function () {

                scope.entityType = "offices";
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;
                
                if(scope.isLevelBasedAddressEnabled){
                    if (scope.formData.talukaId){
                        scope.formData.addressRegionValueId = scope.formData.talukaId;
                    }
                    if(scope.formData.wardAndVillagesId == null && scope.formData.wardAndVillagesId == ""){
                        delete scope.formData.wardAndVillagesId;
                    }else if (scope.formData.wardAndVillagesId){
                        scope.formData.addressRegionValueId = scope.formData.wardAndVillagesId;
                    }
                }

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
                if (scope.addressTypes.length>0 &&  scope.addressTypes[0] != null) {
                    scope.formData.addressTypes = scope.addressTypes;
                } else {
                    delete scope.formData.addressTypes;
                }
                if (scope.formData.houseNo == null || scope.formData.houseNo == "") {
                    delete scope.formData.houseNo;
                }
                if (scope.formData.addressLineOne == null || scope.formData.addressLineOne == "") {
                    delete scope.formData.addressLineOne;
                }
                resourceFactory.addressResource.create({entityType: scope.entityType, entityId: scope.officeId}, {addresses: scope.formDataList}, function (data) {
                    location.path('/viewoffice/' + scope.officeId);
                });
            };
        }

    });
    mifosX.ng.application.controller('CreateOfficeAddressController', ['$scope', '$routeParams', '$location', 'ResourceFactory', mifosX.controllers.CreateOfficeAddressController]).run(function ($log) {
        $log.info("CreateOfficeAddressController initialized");
    });
}(mifosX.controllers || {}));