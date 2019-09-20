(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateOfficeController: function (scope, resourceFactory, location, dateFilter) {
            scope.offices = [];
            scope.first = {};
            scope.first.date = new Date();
            scope.restrictDate = new Date();
            scope.isSelfActive = scope.response.uiDisplayConfigurations.createOffice.selfActive;
            scope.isAddressTypeMandatory = false;
            scope.formData = {};
            scope.formData.isFieldOffice = true
            scope.formAddressData = {};
            scope.formAddressData.addressTypes = [];
            scope.formDataList = [scope.formAddressData];
            scope.enableOfficeAddress = scope.isSystemGlobalConfigurationEnabled('enable-office-address');
            scope.addressLevels = [];   
            scope.showWardAndVillages = false;
            scope.wardAndVillages = [];
            var levelBasedAddressConfig = 'enable_level_based_address';
            scope.isLevelBasedAddressEnabled = scope.isSystemGlobalConfigurationEnabled(levelBasedAddressConfig);
            scope.pincode = false;
            scope.submitted = false;
            resourceFactory.officeResource.getAllOffices({onlyActive: true}, function (data) {
                scope.offices = data;
                scope.formData.parentId = scope.offices[0].id;
                scope.changeParentOffice();
            });
              if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createOffice) {
                if(scope.response.uiDisplayConfigurations.createOffice.isHiddenField){
                    if(scope.response.uiDisplayConfigurations.createOffice.isHiddenField.pincode){
                        scope.pincode = scope.response.uiDisplayConfigurations.createOffice.isHiddenField.pincode;
                    }
                    if(scope.response.uiDisplayConfigurations.createOffice.isHiddenField.villageTown){
                        scope.isVillageTownHidden = scope.response.uiDisplayConfigurations.createOffice.isHiddenField.villageTown;
                    }
                }
            }
            scope.changeParentOffice = function () {
                if (scope.enableOfficeAddress && scope.formData.parentId) {
                    if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createOffice && scope.response.uiDisplayConfigurations.createOffice.isMandatoryField.addressType) {
                        scope.isAddressTypeMandatory = scope.response.uiDisplayConfigurations.createOffice.isMandatoryField.addressType;
                    }
                    resourceFactory.villageResource.getAllVillages({officeId: scope.formData.parentId, limit: -1}, function (data) {
                        scope.villages = data;
                    });
                    resourceFactory.addressTemplateResource.get({}, function (data) {
                        scope.addressType = data.addressTypeOptions;
                       if(scope.isLevelBasedAddressEnabled){
                            scope.addressData = data.addressData;
                            scope.addressLevels = data.addressLevels;
                            for(var i in scope.addressLevels){
                                if(scope.addressLevels[i].identifier === 'country'){
                                    scope.countries =  scope.addressData[scope.addressLevels[i].identifier];
                                    break;
                                }
                            }
                        }else{
                            scope.countries = data.countryDatas;
                            scope.countrys = data.countryDatas;
                        }
                        scope.setDefaultGISConfig();
                    });
                }
            }
            scope.setDefaultGISConfig = function () {
                if(scope.responseDefaultGisData && scope.response && scope.response.uiDisplayConfigurations && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address){
                    if(scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.countryName) {

                        var countryName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.countryName;
                          if(scope.isLevelBasedAddressEnabled){
                                scope.defaultCountry = _.filter(scope.countries, function (country) {
                                    return country.name === countryName;
                                });
                                scope.formAddressData.countryId = scope.defaultCountry[0].id;
                                var levelLists = ['division', 'state'];
                                for(var i in scope.addressLevels){
                                    if(levelLists.indexOf(scope.addressLevels[i].identifier) >= 0 ){
                                        scope.states = scope.addressData[scope.addressLevels[i].identifier];
                                        break;
                                    }
                                }
                           }else{
                                scope.defaultCountry = _.filter(scope.countries, function (country) {
                                    return country.countryName === countryName;
                                });
                                scope.formAddressData.countryId = scope.defaultCountry[0].countryId;
                                scope.states = scope.defaultCountry[0].statesDatas;
                           }
                    }

                    if(scope.states && scope.states.length > 0 && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.stateName) {
                        var stateName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.stateName;
                       if(scope.isLevelBasedAddressEnabled){
                            scope.defaultState = _.filter(scope.states, function (state) {
                                return state.name === stateName;
                            });
                            var levelLists = ['township','district'];
                            for(var i in scope.addressLevels){
                                if(levelLists.indexOf(scope.addressData[scope.addressLevels[i].identifier]) >= 0 ){
                                    scope.districts = scope.addressData[scope.addressLevels[i].identifier];
                                    break;
                                }
                            }
                            scope.districts = scope.defaultState[0].districtDatas;
                        }else{
                            scope.defaultState = _.filter(scope.states, function (state) {
                                return state.stateName === stateName;
                            });
                            scope.formAddressData.stateId =  scope.defaultState[0].stateId;
                            scope.districts = scope.defaultState[0].districtDatas;
                       
                        }
                    }

                    if(scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.addressType) {
                        scope.formAddressData.addressTypes[0] = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.addressType;
                    }

                }
            };

            scope.changeCountry = function (countryId) {
                if(scope.formAddressData.stateId){
                    delete scope.formAddressData.stateId;
                }
                if(scope.formAddressData.districtId){
                    delete scope.formAddressData.districtId;
                }
                if(scope.formAddressData.talukaId){
                    delete scope.formAddressData.talukaId;
                }
                if(scope.formAddressData.wardAndVillagesId){
                    delete scope.formAddressData.wardAndVillagesId;
                }
                scope.states = null;
                scope.districts = null;
                scope.talukas = null;
                scope.wardAndVillages = null;

                if (countryId != null) {
                    if(scope.isLevelBasedAddressEnabled){
                        scope.selectCountry = _.filter(scope.countries, function (country) {
                            return country.id == countryId;
                        });

                        var levelLists = ['division', 'state']
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
                        });
                        scope.states = scope.selectCountry[0].statesDatas;
                    }
                }
            };

            scope.changeState = function (stateId) {
                 if(scope.formAddressData.districtId){
                    delete scope.formAddressData.districtId;
                }
                if(scope.formAddressData.talukaId){
                    delete scope.formAddressData.talukaId;
                }
                if(scope.formAddressData.wardAndVillagesId){
                    delete scope.formAddressData.wardAndVillagesId;
                }
                scope.districts = null;
                scope.talukas = null;
                scope.wardAndVillages = null;

                if (stateId != null) {
                    if(scope.isLevelBasedAddressEnabled){
                        scope.selectState = _.filter(scope.states, function (state) {
                            return state.id == stateId;
                        });
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
                        });
                        scope.districts = scope.selectState[0].districtDatas;
                    }

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
                if(scope.formAddressData.talukaId){
                    delete scope.formAddressData.talukaId;
                }

                if(scope.formAddressData.wardAndVillagesId){
                    delete scope.formAddressData.wardAndVillagesId;
                }

                scope.talukas = null;
                scope.wardAndVillages = null;

                if (districtId != null) {
                    if(scope.isLevelBasedAddressEnabled){
                        scope.selectDistrict = _.filter(scope.districts, function (districts) {
                            return districts.id == districtId;
                        });
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
                        });
                        scope.talukas = scope.selectDistrict[0].talukaDatas;
                        scope.showTalukas = true;
                    }
                }
            };

             scope.changeTaluka = function (talukaId) {

                if(scope.formAddressData.wardAndVillagesId){
                    delete scope.formAddressData.wardAndVillagesId;
                }

                scope.wardAndVillages = null;
                
                if (talukaId != null) {
                    scope.selectWardAndVillage = _.filter(scope.talukas, function (taluka) {
                        return taluka.id == talukaId;
                    })
                    scope.formAddressData.addressRegionValueId = talukaId;

                    var levelLists = ['wardleaf','village'];   
                    scope.wardAndVillagesTemp = [];                     
                    for(var i in scope.addressLevels){
                        if(levelLists.indexOf(scope.addressLevels[i].identifier) >= 0 ){
                            scope.wardAndVillagesTemp = scope.wardAndVillagesTemp.concat(scope.addressData[scope.addressLevels[i].identifier]);
                        }
                    }
                    scope.wardAndVillages = _.filter(scope.wardAndVillagesTemp, function (wardAndVillage) {
                        return wardAndVillage.parentId == talukaId;
                    });
                    scope.showWardAndVillages = (scope.wardAndVillages.length > 0); 
                }
            };

            scope.submit = function () {
                this.formData.locale = scope.optlang.code;
                var reqDate = dateFilter(scope.first.date, scope.df);
                this.formData.dateFormat = scope.df;
                this.formData.openingDate = reqDate;

                if (scope.formAddressData.countryId == null || scope.formAddressData.countryId == ""){
                    delete scope.formAddressData.countryId;
                }
                if (scope.formAddressData.stateId == null || scope.formAddressData.stateId == ""){
                    delete scope.formAddressData.stateId;
                }
                if (scope.formAddressData.districtId == null || scope.formAddressData.districtId == ""){
                    delete scope.formAddressData.districtId;
                }
                if (scope.formAddressData.talukaId == null || scope.formAddressData.talukaId == ""){
                    delete scope.formAddressData.talukaId;
                }
                if (scope.formAddressData.addressTypes == null || scope.formAddressData.addressTypes == "") {
                    delete scope.formAddressData.addressTypes;
                }
                if (scope.formAddressData.houseNo == null || scope.formAddressData.houseNo == "") {
                    delete scope.formAddressData.houseNo;
                }
                if (scope.formAddressData.addressLineOne == null || scope.formAddressData.addressLineOne == "") {
                    delete scope.formAddressData.addressLineOne;
                }
                if(scope.enableOfficeAddress){
                    this.formData.addresses=scope.formDataList;
                }

                 if(scope.isLevelBasedAddressEnabled){
                    if(scope.formAddressData.wardAndVillagesId == null && scope.formAddressData.wardAndVillagesId == ""){
                        delete scope.formAddressData.wardAndVillagesId;
                    }else if (scope.formAddressData.wardAndVillagesId){
                        scope.formAddressData.addressRegionValueId = scope.formAddressData.wardAndVillagesId;
                    }
                }

                resourceFactory.officeResource.save(this.formData, function (data) {
                    if(scope.isSelfActive && data.resourceId){
                        activateoffice(data.resourceId);
                    }else{
                        location.path('/viewoffice/' + data.resourceId); 
                    }
                });
            };

            var activateoffice = function(officeId) {
                resourceFactory.officeResource.save({ officeId: officeId, command: 'activate' }, {}, function (data) {
                    if(data.changes.status.id == 300){
                       scope.isOfficeActive = true;
                       location.path('/viewoffice/' + data.resourceId); 
                    }
                });
            }
        }
    });
    mifosX.ng.application.controller('CreateOfficeController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', mifosX.controllers.CreateOfficeController]).run(function ($log) {
        $log.info("CreateOfficeController initialized");
    });
}(mifosX.controllers || {}));
