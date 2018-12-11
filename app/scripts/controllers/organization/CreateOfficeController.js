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
            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
                scope.formData.parentId = scope.offices[0].id;
                scope.changeParentOffice();
            });
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
                        scope.countries = data.countryDatas;
                        scope.setDefaultGISConfig();
                    });
                }
            }
            scope.setDefaultGISConfig = function () {
                if(scope.responseDefaultGisData && scope.response && scope.response.uiDisplayConfigurations && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address){
                    if(scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.countryName) {

                        var countryName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.countryName;
                        scope.defaultCountry = _.filter(scope.countries, function (country) {
                            return country.countryName === countryName;

                        });
                        scope.formAddressData.countryId = scope.defaultCountry[0].countryId;
                        scope.states = scope.defaultCountry[0].statesDatas;
                    }

                    if(scope.states && scope.states.length > 0 && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.stateName) {
                        var stateName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.stateName;
                        scope.defaultState = _.filter(scope.states, function (state) {
                            return state.stateName === stateName;

                        });
                        scope.formAddressData.stateId =  scope.defaultState[0].stateId;
                        scope.districts = scope.defaultState[0].districtDatas;
                    }

                    if(scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.addressType) {
                        scope.formAddressData.addressTypes[0] = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.addressType;
                    }

                }
            };

            scope.changeCountry = function (countryId) {
                if (countryId != null) {
                    scope.selectCountry = _.filter(scope.countries, function (country) {
                        return country.countryId == countryId;
                    })
                    if(scope.formAddressData.stateId){
                        delete scope.formAddressData.stateId;
                    }
                    if(scope.formAddressData.districtId){
                        delete scope.formAddressData.districtId;
                    }
                    if(scope.formAddressData.talukaId){
                        delete scope.formAddressData.talukaId;
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
                    if(scope.formAddressData.districtId){
                        delete scope.formAddressData.districtId;
                    }
                    if(scope.formAddressData.talukaId){
                        delete scope.formAddressData.talukaId;
                    }

                    scope.districts = scope.selectState[0].districtDatas;
                    scope.talukas = null;
                }
            };

            scope.changeDistrict = function (districtId) {
                if (districtId != null) {
                    scope.selectDistrict = _.filter(scope.districts, function (districts) {
                        return districts.districtId == districtId;
                    })

                    if(scope.formAddressData.talukaId){
                        delete scope.formAddressData.talukaId;
                    }
                    scope.talukas = scope.selectDistrict[0].talukaDatas;
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
