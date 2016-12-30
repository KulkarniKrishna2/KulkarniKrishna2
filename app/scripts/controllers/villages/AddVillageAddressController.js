/**
 * Created by jagadeeshakn on 8/12/2016.
 */
(function (module) {
    mifosX.controllers = _.extend(module, {
        AddVillageAddressController: function (scope, routeParams, location, resourceFactory) {
            scope.villageId = routeParams.id;
            scope.countrys = [];
            scope.states = [];
            scope.districts = [];
            scope.talukas = [];
            scope.formData = {};
            scope.formDataList = [scope.formData];

            scope.pincodeStartDigit = 0;
            scope.showPicodeStartingDigitError = false;
            scope.pincodeStartDigitMap =[];
            scope.stateName = [];
            scope.picodeValidation = false;
            scope.isPincodeLengthSatisfy = true;
            scope.pincodeLenght = 6;
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createVillage.isValidatePinCodeField.active) {
                if (scope.response && scope.response.uiDisplayConfigurations.createVillage.isValidatePinCodeField.pinCodeValues.startDigit) {
                    scope.pincodeStartDigitMap = scope.response.uiDisplayConfigurations.createVillage.isValidatePinCodeField.pinCodeValues.startDigit;
                    scope.pincodeLenght = scope.response.uiDisplayConfigurations.createVillage.isValidatePinCodeField.pinCodeValues.pincodeLenght;
                }
            }

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
                        scope.setPicodeStartDigitForState(scope.defaultState);
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

                    scope.states = scope.selectCountry[0].statesDatas;
                    scope.districts = null;
                    scope.talukas = null;
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

                    if(scope.formData.talukaId){
                        delete scope.formData.talukaId;
                    }
                    scope.talukas = scope.selectDistrict[0].talukaDatas;
                }
            }


            scope.validatePincode = function (stateId) {
                scope.isPincodeLengthSatisfy = false;
                scope.picodeValidation = true;
                scope.pincodeLengthValidation();
                if (scope.response && scope.response.uiDisplayConfigurations &&
                    scope.response.uiDisplayConfigurations.createVillage.isValidatePinCodeField.active) {
                    if (scope.pincodeStartDigitMap && scope.pincodeStartDigitMap[scope.stateName]) {
                        scope.pincodeStartDigit = scope.pincodeStartDigitMap[scope.stateName];
                        var pincodeStart = scope.formData.postalCode.substring(0, 1);
                        if(scope.pincodeStartDigit != pincodeStart){
                            scope.showPicodeStartingDigitError = true;
                        }else{
                            scope.showPicodeStartingDigitError = false;
                        }
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

            scope.pincodeLengthValidation = function(){
                if(scope.formData.postalCode && scope.formData.postalCode.toString().length != scope.pincodeLenght){
                    scope.isPincodeLengthSatisfy = false;
                }else{
                    scope.isPincodeLengthSatisfy = true;
                }
            }

            scope.setPicodeStartDigitForState = function(state){
                    if(state) {
                        scope.stateName = state[0].stateName;
                        if (scope.pincodeStartDigitMap && scope.pincodeStartDigitMap[scope.stateName]) {
                            scope.formData.postalCode = scope.pincodeStartDigitMap[scope.stateName];
                        }
                    }
                }


            scope.submit = function () {

                scope.entityType = "villages";
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

                if(!scope.showPicodeStartingDigitError && scope.isPincodeLengthSatisfy) {
                    resourceFactory.addressResource.create({
                        entityType: scope.entityType,
                        entityId: scope.villageId
                    }, {addresses: scope.formDataList}, function (data) {

                        location.path('/viewvillage/' + scope.villageId);
                    });
                }
            };
        }

    });
    mifosX.ng.application.controller('AddVillageAddressController', ['$scope', '$routeParams', '$location', 'ResourceFactory',mifosX.controllers.AddVillageAddressController]).run(function ($log) {
        $log.info("AddVillageAddressController initialized");
    });
}(mifosX.controllers || {}));