/**
 * Created by jagadeeshakn on 8/12/2016.
 */
(function (module) {
    mifosX.controllers = _.extend(module, {
        EditVillageAddressController: function (scope, routeParams, location, resourceFactory) {
            scope.addressId = routeParams.addressId;
            scope.villageId = routeParams.id;
            scope.countries = [];
            scope.states = [];
            scope.districts = [];
            scope.talukas = [];
            scope.formData = {};
            scope.entityType="villages";
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

            scope.getVillageAddress = function () {
                resourceFactory.entityAddressResource.getAddress({
                    entityType: scope.entityType,
                    entityId: scope.villageId,
                    addressId: scope.addressId
                }, function (data) {

                    if (data.postalCode) {
                        scope.formData.postalCode = data.postalCode;
                    }
                    scope.districts = data.stateData.districtDatas;
                    if (data.districtData && data.districtData.districtId) {
                        scope.formData.districtId = data.districtData.districtId;
                    }
                    scope.states = data.countryData.statesDatas;
                    if (data.stateData && data.stateData.stateId) {
                        scope.formData.stateId = data.stateData.stateId;
                    }
                    if (data.countryData.countryId) {
                        scope.formData.countryId = data.countryData.countryId;
                    }
                    scope.talukas = data.districtData.talukaDatas;
                    if (data.talukaData && data.talukaData.talukaId) {
                        scope.formData.talukaId = data.talukaData.talukaId;
                    }
                });
            }

            resourceFactory.addressTemplateResource.get({},function (data) {
                scope.countries = data.countryDatas;
                scope.getVillageAddress();
            });

            scope.changeCountry = function (countryId) {
                if (countryId !=null) {
                    scope.selectCountry = _.filter(scope.countries, function (country) {
                        return country.countryId == countryId;
                    })
                    if(scope.formData.stateId){
                        delete scope.formData.stateId;
                    }
                    if(scope.formData.districtId){
                        delete scope.formData.districtId;
                    }
                    scope.states = scope.selectCountry[0].statesDatas;
                    scope.districts = null;
                    scope.talukas = null;
                    
                }
            }
            scope.validatePincode = function (stateId) {
                scope.showPicodeStartingDigitError = false;
                scope.isPincodeLengthSatisfy = false;
                scope.pincodeLengthValidation();
                if (stateId != null) {
                    scope.selectState = _.filter(scope.states, function (state) {
                        return state.stateId == stateId;
                    })
                    scope.stateName = scope.selectState[0].stateName;
                    scope.picodeValidation = true;
                    if (scope.response && scope.response.uiDisplayConfigurations &&
                        scope.response.uiDisplayConfigurations.createVillage.isValidatePinCodeField.active) {
                        if (scope.pincodeStartDigitMap && scope.pincodeStartDigitMap[scope.stateName]) {
                            scope.pincodeStartDigit = scope.pincodeStartDigitMap[scope.stateName];
                            var pincodeStart = scope.formData.postalCode.substring(0, 1);
                            if (scope.pincodeStartDigit != pincodeStart) {
                                scope.showPicodeStartingDigitError = true;
                            } else {
                                scope.showPicodeStartingDigitError = false;
                            }
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

            scope.setPicodeStartDigitForState = function(state){
                scope.picodeValidation = false;
                if(state) {
                    scope.stateName = state[0].stateName;
                    if (scope.pincodeStartDigitMap && scope.pincodeStartDigitMap[scope.stateName]) {
                        scope.formData.postalCode = scope.pincodeStartDigitMap[scope.stateName];
                    }
                }
            }

            scope.pincodeLengthValidation = function(){
                if( scope.formData.postalCode &&  scope.formData.postalCode.toString().length != scope.pincodeLenght){
                    scope.isPincodeLengthSatisfy = false;
                    scope.errorDetails = [];
                    var errorObj = new Object();
                    errorObj.args = {
                        params: []
                    };
                    errorObj.args.params.push({value: 'label.mustbe6digitnumber'});
                    scope.errorDetails.push(errorObj);
                }else{
                    scope.isPincodeLengthSatisfy = true;
                }
            }

            scope.changeState = function (stateId) {
                scope.showPicodeStartingDigitError = false;
                if (stateId != null) {
                    scope.selectState = _.filter(scope.states, function (state) {
                        return state.stateId == stateId;
                    })
                    if(scope.formData.districtId){
                        delete scope.formData.districtId;
                    }
                    scope.districts = scope.selectState[0].districtDatas;
                    scope.talukas = null;
                    scope.setPicodeStartDigitForState(scope.selectState);
                }
            }

            scope.changeDistrict = function (districtId) {
                if (districtId != null) {
                    scope.talukas = null;
                    scope.selectDistrict = _.filter(scope.districts, function (districts) {
                        return districts.districtId == districtId;
                    })

                    if(scope.formData.talukaId){
                        delete scope.formData.talukaId;
                    }
                    scope.talukas = scope.selectDistrict[0].talukaDatas;
                }
            }
            scope.submit = function () {
                scope.pincodeLengthValidation();
                scope.formData.entityId = scope.villageId;
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;
                scope.formData.addressId = scope.addressId;

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

                if (!scope.showPicodeStartingDigitError && scope.isPincodeLengthSatisfy) {
                    resourceFactory.entityAddressResource.update({
                        entityType: scope.entityType,
                        entityId: scope.villageId,
                        addressId: scope.addressId
                    }, scope.formData, function (data) {

                        location.path('/viewvillage/' + scope.villageId);
                    });
                }

            };
        }

    });
    mifosX.ng.application.controller('EditVillageAddressController', ['$scope', '$routeParams', '$location', 'ResourceFactory',mifosX.controllers.EditVillageAddressController]).run(function ($log) {
        $log.info("EditVillageAddressController initialized");
    });
}(mifosX.controllers || {}));