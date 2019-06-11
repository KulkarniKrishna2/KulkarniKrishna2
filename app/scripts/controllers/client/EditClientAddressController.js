/**
 * Created by jagadeeshakn on 7/29/2016.
 */
(function (module) {
    mifosX.controllers = _.extend(module, {
        EditClientAddressController: function (scope, routeParams, location, resourceFactory) {
            scope.addressId = routeParams.addressId;
            scope.clientId = routeParams.clientId;
            scope.addressType = [];
            scope.countries = [];
            scope.states = [];
            scope.districts = [];
            scope.talukas = [];
            scope.formData = {};
            scope.formData.addressTypes = [];
            scope.entityType="clients";
            scope.pincode = false;
            scope.isVillageTownMandatory = false;
            scope.isCountryReadOnly = false;
            scope.isAddressTypeMandatory = false;
            scope.isStreetNameMandatory=false;
            scope.isHouseNoMandatory=false;
            scope.showUpdateAddressFromCenter = false;

            scope.upadateDefaultAddress = function () {
                resourceFactory.clientDefaultAddressResource.get({ clientId: routeParams.clientId }, function (response) {
                    if (response.addressData.length > 0) {
                        if (response.villageName) {
                            scope.formData.villageTown = response.villageName;
                        }
                        if (response.addressData[0].countryData) {
                            scope.formData.countryId = response.addressData[0].countryData.countryId;
                            scope.changeCountry(scope.formData.countryId);
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

            if(scope.response != undefined){
                scope.isNameAutoPopulate = scope.response.uiDisplayConfigurations.createCenter.isAutoPopulate.name;
                var villageConfig = 'populate_client_address_from_villages';
                scope.isPopulateClientAddressFromVillages = scope.isSystemGlobalConfigurationEnabled(villageConfig);
                
                if(scope.isPopulateClientAddressFromVillages && !scope.isNameAutoPopulate ){
                    scope.showUpdateAddressFromCenter = true;
                }
            }

            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient.isHiddenField.pincode) {
                scope.pincode = scope.response.uiDisplayConfigurations.createClient.isHiddenField.pincode;
            }
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient.isMandatoryField.villageTown) {
                scope.isVillageTownMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.villageTown;
            }
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.defaultGISConfig.isReadOnlyField.countryName) {
                scope.isCountryReadOnly = scope.response.uiDisplayConfigurations.defaultGISConfig.isReadOnlyField.countryName;
            }
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient.isMandatoryField.addressType) {
                scope.isAddressTypeMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.addressType;
            }
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient.isMandatoryField) {
                scope.isStreetNameMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.streetName;
                scope.isHouseNoMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.houseNo;
            }
            resourceFactory.addressTemplateResource.get({},function (data) {
                scope.addressType = data.addressTypeOptions;
                scope.countries = data.countryDatas;
                scope.getClientAddress();
            });

            scope.getClientAddress = function () {
                resourceFactory.entityAddressResource.getAddress({
                    entityType: scope.entityType,
                    entityId: scope.clientId,
                    addressId: scope.addressId,
                    template: true
                }, function (data) {
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
                    if(data.districtData && data.districtData.districtId){
                        scope.formData.districtId = data.districtData.districtId;
                    }
                   for(var i in scope.districts)
                    {
                        if( data.districtData && data.districtData.districtId == scope.districts[i].districtId){
                            scope.talukas = scope.districts[i].talukaDatas;
                            if(scope.talukas.length >0){
                                scope.isShowTaluka= true;
                            }
                        }
                    }
                    if (data.talukaData && data.talukaData.talukaId) {
                        scope.formData.talukaId = data.talukaData.talukaId;
                    }
                });
            }

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
                    if(scope.formData.talukaId){
                        delete scope.formData.talukaId;
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
                    if(scope.formData.districtId){
                        delete scope.formData.districtId;
                    }
                    if(scope.formData.talukaId){
                        delete scope.formData.talukaId;
                    }
                    scope.districts = scope.selectState[0].districtDatas;
                    scope.getActiveDistricts();
                    scope.talukas = null;
                }
            }
           
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

                    if(scope.formData.talukaId){
                        delete scope.formData.talukaId;
                    }
                    scope.talukas = scope.selectDistrict[0].talukaDatas;
                    if(scope.talukas.length > 0){
                        scope.isShowTaluka = true;
                    }else{
                        scope.isShowTaluka= false;
                    }
                }
            }
            
            scope.submit = function () {

                scope.formData.entityId = scope.clientId;
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;
                scope.formData.addressId = scope.addressId;
                scope.formData.addressTypes = [scope.addressTypeId];
                
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
                                
                resourceFactory.entityAddressResource.update({entityType:scope.entityType,entityId :scope.clientId,addressId :scope.addressId }, scope.formData, function (data) {

                    location.path('/viewclient/' + scope.clientId);
                });
            };
        }

    });
    mifosX.ng.application.controller('EditClientAddressController', ['$scope', '$routeParams', '$location', 'ResourceFactory',mifosX.controllers.EditClientAddressController]).run(function ($log) {
        $log.info("EditClientAddressController initialized");
    });
}(mifosX.controllers || {}));