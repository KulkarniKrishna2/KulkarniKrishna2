(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateVillageController: function (scope, resourceFactory, location, dateFilter) {
            scope.offices = [];
            scope.data = {};
            scope.first = {};
            scope.first.submitondate = new Date ();
            scope.formData = {};
            scope.restrictDate = new Date();
            scope.first.date = new Date();
            scope.countrys = [];
            scope.states = [];
            scope.districts = [];
            scope.talukas = [];
            scope.formAddressData = {};
            scope.formDataList = [scope.formAddressData];
            scope.pincodeStartDigit = 0;
            scope.showPicodeStartingDigitError = false;
            scope.pincodeStartDigitMap =[];
            scope.stateName = [];
            scope.picodeValidation = false;
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createVillage.isValidatePinCodeField.active) {
                if (scope.response && scope.response.uiDisplayConfigurations.createVillage.isValidatePinCodeField.pinCodeValues) {
                    scope.pincodeStartDigitMap = scope.response.uiDisplayConfigurations.createVillage.isValidatePinCodeField.pinCodeValues;
                }
            }
            resourceFactory.villageTemplateResource.get(function (data) {
                scope.offices = data.officeOptions;
                scope.formData.officeId = data.officeOptions[0].id;

                if(scope.response && scope.response.uiDisplayConfigurations.createVillage.isReadOnlyField.active == true){
                    scope.choice = 1;
                }else{
                    scope.choice = 0;
                }
            });

            resourceFactory.addressTemplateResource.get({}, function (data) {
                scope.countries = data.countryDatas;
                scope.setDefaultGISConfig();
            });

            scope.setDefaultGISConfig = function () {
                if(scope.responseDefaultGisData && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address){
                    if(scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.countryName) {

                        var countryName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.countryName;
                        scope.defaultCountry = _.filter(scope.countries, function (country) {
                            return country.countryName === countryName;

                        });
                        scope.formAddressData.countryId = scope.defaultCountry[0].countryId;
                        scope.states = scope.defaultCountry[0].statesDatas;
                    }

                    if(scope.states && scope.states.length > 0 && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.stateName) {
                        scope.stateName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.stateName;
                        scope.defaultState = _.filter(scope.states, function (state) {
                            scope.setPicodeStartDigitForState(scope.defaultState);
                            return state.stateName === scope.stateName;

                        });
                        scope.formAddressData.stateId =  scope.defaultState[0].stateId;
                        scope.districts = scope.defaultState[0].districtDatas;
                    }

                }

            };

            scope.changeCountry = function (countryId) {
                if (countryId != null) {
                    scope.selectCountry = _.filter(scope.countries, function (country) {
                        return country.countryId == countryId;
                    })
                    if (scope.formAddressData.stateId) {
                        delete scope.formAddressData.stateId;
                    }
                    if (scope.formAddressData.districtId) {
                        delete scope.formAddressData.districtId;
                    }

                    scope.states = scope.selectCountry[0].statesDatas;
                    scope.districts = null;
                    scope.talukas = null;
                }
            }

            scope.validatePincode = function (stateId) {
                scope.picodeValidation = true;
                    if (scope.response && scope.response.uiDisplayConfigurations &&
                        scope.response.uiDisplayConfigurations.createVillage.isValidatePinCodeField.active) {
                        if (scope.pincodeStartDigitMap && scope.pincodeStartDigitMap[scope.stateName]) {
                            scope.pincodeStartDigit = scope.pincodeStartDigitMap[scope.stateName];
                            var pincodeStart = scope.formAddressData.postalCode.substring(0, 1);
                            if(scope.pincodeStartDigit != pincodeStart){
                                scope.showPicodeStartingDigitError = true;
                            }else{
                                scope.showPicodeStartingDigitError = false;
                            }
                        }
                    }
            }

            scope.setPicodeStartDigitForState = function(state){
                if(state) {
                    scope.stateName = state[0].stateName;
                    if (scope.pincodeStartDigitMap && scope.pincodeStartDigitMap[scope.stateName]) {
                        scope.formAddressData.postalCode = scope.pincodeStartDigitMap[scope.stateName];
                    }
                }
            }

            scope.handlePatternPincode = (function() {
                var regex = /^([1-9])([0-9]){5}$/;
                return {
                    test: function(value) {
                        if (!scope.picodeValidation) {
                            return true;
                        } else {
                            return regex.test(value);
                        }
                    }
                };
            })();

            scope.changeState = function (stateId) {
                if (stateId != null) {
                    scope.selectState = _.filter(scope.states, function (state) {
                        return state.stateId == stateId;
                    })
                    if (scope.formAddressData.districtId) {
                        delete scope.formAddressData.districtId;
                    }
                    scope.districts = scope.selectState[0].districtDatas;
                    scope.talukas = null;
                    scope.setPicodeStartDigitForState(scope.selectState);
                }
            }
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
            }


            scope.setChoice = function () {
                if (this.formData.active) {
                    scope.choice = 1;
                }
                else if (!this.formData.active) {
                    scope.choice = 0;
                }
            };

            scope.submit = function () {

                if(scope.response && scope.response.uiDisplayConfigurations.createVillage.isReadOnlyField.active == true){
                    scope.formData.active = true;
                }

                var reqDate = dateFilter(scope.first.date, scope.df);
                this.formData.activatedOnDate = reqDate;

                if (scope.first.submitondate) {
                    reqDate = dateFilter(scope.first.submitondate, scope.df);
                    this.formData.submittedOnDate = reqDate;
                }
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

                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.active = this.formData.active || false;
                this.formData.addresses=scope.formDataList;
                if(!scope.isKarnataka && !scope.isMaharashtra) {
                    resourceFactory.villageResource.save(this.formData, function (data) {
                        location.path('/viewvillage/' + data.resourceId);
                    });
                }
            };
        }
    });
    mifosX.ng.application.controller('CreateVillageController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', mifosX.controllers.CreateVillageController]).run(function ($log) {
        $log.info("CreateVillageController initialized");
    });
}(mifosX.controllers || {}));
