(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateNewClientController: function ($controller,scope, resourceFactory, location, routeParams, http, dateFilter, API_VERSION, $upload, $rootScope, routeParams) {
            angular.extend(this, $controller('defaultUIConfigController', {$scope: scope,$key:"createClient"}));
            scope.offices = [];
            scope.staffs = [];
            scope.savingproducts = [];
            scope.first = {};
            scope.first.date = new Date();
            scope.first.submitondate = new Date ();
            scope.formData = {};
            scope.clientNonPersonDetails = {};
            scope.showSavingOptions = false;
            scope.opensavingsproduct = false;
            scope.forceOffice = null;
            scope.showNonPersonOptions = false;
            scope.clientPersonId = 1;
            scope.addressType = [];
            scope.countries = [];
            scope.states = [];
            scope.districts = [];
            scope.talukas = [];
            scope.formAddressData = {};
            scope.formDataList = [scope.formAddressData];
            scope.formAddressData.addressTypes = [];
            scope.configurations = [];
            scope.enableClientAddress = false;
            scope.isPopulateClientAddressFromVillages = false;
            scope.villages = [];
            scope.village = {};
            scope.formAddressData.districtId ;
            scope.clientId = location.search().clientId;
            scope.groupId = location.search().groupId;
            scope.officeId = location.search().officeId;
            scope.staffId = location.search().staffId;
            scope.centerId = location.search().centerId;
            scope.restrictDate = new Date();
            scope.isDateOfBirthMandatory = false;
            scope.loanApplicationReferenceId = routeParams.loanApplicationReferenceId;
            scope.enableCreateClientLoop = false;
            scope.isClientActive = false;
            scope.hideClientClassification = false;
            scope.isClientClassificationMandatory = false;
            scope.isExternalIdMandatory = false;
            scope.pincode = false;
            scope.isVillageTownMandatory = false;
            scope.isCountryReadOnly = false;
            scope.isAddressTypeMandatory = false;
            scope.isMobileNumberMandatory = false;
            scope.isEmailIdMandatory = false;
            scope.isGenderMandatory = false;
            scope.displayAge = false;
            scope.isGenderAutoPopulate = false;
            if($rootScope.tenantIdentifier == "chaitanya"){
                scope.isDateOfBirthMandatory = true;
            }
            scope.invalidClassificationId = false;
            scope.submitted = false;
            scope.isStaffMandatory = false;
            scope.isStaffRequired = false;
            scope.showTalukas = true;
            scope.addressLevels = [];   
            scope.showWardAndVillages = false;
            scope.wardAndVillages = [];
            var levelVasedAddressConfig = 'enable_level_based_address';
            scope.isLevelBasedAddressEnabled = scope.isSystemGlobalConfigurationEnabled(levelVasedAddressConfig);

            scope.isGenderReadOnly = scope.response.uiDisplayConfigurations.createClient.isReadOnlyField.gender; 
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                scope.response.uiDisplayConfigurations.createClient.isMandatoryField && scope.response.uiDisplayConfigurations.createClient.isMandatoryField.clientClassificationId) {
                scope.isClientClassificationMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.clientClassificationId;
            }
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                scope.response.uiDisplayConfigurations.createClient.isValidMobileNumber && scope.response.uiDisplayConfigurations.createClient.isValidMobileNumber.mobileNumberPattern) {
                scope.mobileNumberPattern = scope.response.uiDisplayConfigurations.createClient.isValidMobileNumber.mobileNumberPattern;
            }
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                scope.response.uiDisplayConfigurations.createClient.isHiddenField) {
                scope.showStaff = !scope.response.uiDisplayConfigurations.createClient.isHiddenField.staffActivation;
                scope.showLegalForm = !scope.response.uiDisplayConfigurations.createClient.isHiddenField.legalForm;
                scope.showMiddleName = !scope.response.uiDisplayConfigurations.createClient.isHiddenField.middleName;
                scope.showExternalId = !scope.response.uiDisplayConfigurations.createClient.isHiddenField.externalId;
                scope.showSubmittedOn = !scope.response.uiDisplayConfigurations.createClient.isHiddenField.submittedOn;
                scope.showOpenSavingsProduct = !scope.response.uiDisplayConfigurations.createClient.isHiddenField.openSavingsProduct;
                scope.showActivation = !scope.response.uiDisplayConfigurations.createClient.isHiddenField.activate;
            }
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                scope.response.uiDisplayConfigurations.createClient.isHiddenField) {
                if(scope.response.uiDisplayConfigurations.createClient.isHiddenField.hideClientClassification) {
                scope.hideClientClassification = scope.response.uiDisplayConfigurations.createClient.isHiddenField.hideClientClassification;
                }
                if (scope.response.uiDisplayConfigurations.createClient.isHiddenField.clientType) {
                    scope.isHideclientType = scope.response.uiDisplayConfigurations.createClient.isHiddenField.clientType;
                }
            }

            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                scope.response.uiDisplayConfigurations.createClient.isMandatoryField) {

                if(scope.response.uiDisplayConfigurations.createClient.isMandatoryField.dateOfBirth){
                    scope.isDateOfBirthMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.dateOfBirth;
                }
                if(scope.response.uiDisplayConfigurations.createClient.isMandatoryField.staff){
                    scope.isStaffMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.staff;
                }
                
            }
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                scope.response.uiDisplayConfigurations.createClient.isMandatoryField.gender) {
                scope.isGenderMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.gender;
            }
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                scope.response.uiDisplayConfigurations.createClient.isMandatoryField && scope.response.uiDisplayConfigurations.createClient.isMandatoryField.externalId){
                scope.isExternalIdMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.externalId;
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
                scope.isMobileNumberMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.mobileNumber;
                scope.isEmailIdMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.emailId;
            }
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient.isAutoPopulate) {
                scope.isGenderAutoPopulate = scope.response.uiDisplayConfigurations.createClient.isAutoPopulate.genderOption;
            }
            scope.minAge = 0;
            scope.maxAge = 0;
            scope.dateOfBirthNotInRange = false;
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient && 
                scope.response.uiDisplayConfigurations.createClient.isValidateDOBField && scope.response.uiDisplayConfigurations.createClient.isValidateDOBField.active) {
                if (scope.response.uiDisplayConfigurations.createClient.isValidateDOBField.ageCriteria.minAge > 0) {
                    scope.minAge = scope.response.uiDisplayConfigurations.createClient.isValidateDOBField.ageCriteria.minAge;

                }
                if (scope.response.uiDisplayConfigurations.createClient.isValidateDOBField.ageCriteria.maxAge > 0) {
                    scope.maxAge = scope.response.uiDisplayConfigurations.createClient.isValidateDOBField.ageCriteria.maxAge;
                }
            } else{
                scope.minAge = 0;
                scope.maxAge = scope.restrictDate;

            }
            scope.minDateOfBirth = getMinimumRestrictedDate(new Date());
            scope.maxDateOfBirth = getMaximumRestrictedDate(new Date());

            if(scope.response.uiDisplayConfigurations.createClient.isValidateFirstName) {
                scope.firstNamePattern = scope.response.uiDisplayConfigurations.createClient.isValidateFirstName.firstNamePattern;
            }
            function getMaximumRestrictedDate(restrictedDate) {

                restrictedDate.setYear(restrictedDate.getFullYear() - scope.minAge);
                return restrictedDate;
            };

            function getMinimumRestrictedDate(restrictedDate) {

                restrictedDate.setYear(restrictedDate.getFullYear() - scope.maxAge);
                return restrictedDate;
            };
            
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                scope.response.uiDisplayConfigurations.createClient.isValidMobileNumber && scope.response.uiDisplayConfigurations.createClient.isValidMobileNumber.mobileNumberPattern) {
                scope.mobileNumberPattern = scope.response.uiDisplayConfigurations.createClient.isValidMobileNumber.mobileNumberPattern;
            }

            var requestParams = {staffInSelectedOfficeOnly:true};
            if (routeParams.groupId) {
                requestParams.groupId = routeParams.groupId;
            }
            if (routeParams.officeId) {
                requestParams.officeId = routeParams.officeId;
            }
            resourceFactory.clientTemplateResource.get(requestParams, function (data) {
                scope.offices = data.officeOptions;
                scope.staffs = data.staffOptions;
                scope.formData.officeId = scope.offices[0].id;
                scope.savingproducts = data.savingProductOptions;
                scope.genderOptions = data.genderOptions;
                scope.clienttypeOptions = data.clientTypeOptions;
                scope.clientClassificationOptions = data.clientClassificationOptions;
                scope.clientNonPersonConstitutionOptions = data.clientNonPersonConstitutionOptions;
                scope.clientNonPersonMainBusinessLineOptions = data.clientNonPersonMainBusinessLineOptions;
                scope.clientLegalFormOptions = data.clientLegalFormOptions;
                scope.formData.legalFormId = scope.clientLegalFormOptions[0].id;
                scope.isWorkflowEnabled = (data.isWorkflowEnabled && data.isWorkflowEnableForBranch);
                scope.maritalStatusOptions = data.maritalStatusOptions;

                if(scope.isGenderAutoPopulate) {
                    if(scope.genderOptions[0]) {
                        scope.formData.genderId = scope.genderOptions[0].id;
                    }
                }

                scope.defaultGender = scope.response.uiDisplayConfigurations.createClient.defaultGender;
                if(scope.defaultGender && scope.genderOptions){
                    scope.formData.genderId = scope.genderOptions[0].id;
                    for(var i in scope.genderOptions){
                        if(scope.genderOptions[i].name === scope.defaultGender){
                            scope.formData.genderId = scope.genderOptions[i].id;
                            break;
                        }
                    }
                }
                
                if(scope.response != undefined && scope.response.uiDisplayConfigurations.createClient.isReadOnlyField.active){
                     scope.isClientActive = scope.response.uiDisplayConfigurations.createClient.isReadOnlyField.active;
                     scope.formData.active = scope.response.uiDisplayConfigurations.createClient.isReadOnlyField.active;
                    scope.choice = 1;
                }else{
                    scope.choice = 0;

                }
                scope.formData.dateOfBirth = scope.dateOfBirth;
                scope.formData.clientClassificationId = scope.clientClassificationId;
                if(data.postalCode){
                    scope.formData.postalCode =  data.postalCode;
                }

                if (data.savingProductOptions.length > 0) {
                    scope.showSavingOptions = true;
                }
                if(routeParams.officeId) {
                    scope.formData.officeId = routeParams.officeId;
                    for(var i in data.officeOptions) {
                        if(data.officeOptions[i].id == routeParams.officeId) {
                            scope.forceOffice = data.officeOptions[i];
                            break;
                        }
                    }
                }
                if(routeParams.groupId) {
                    if(typeof data.staffId !== "undefined") {
                        scope.formData.staffId = data.staffId;
                    }
                }
                if(routeParams.staffId) {
                    for(var i in scope.staffs) {
                        if (scope.staffs[i].id == routeParams.staffId) {
                            scope.formData.staffId = scope.staffs[i].id;
                            break;
                        }
                    }
                }

                var addressConfig = 'enable-clients-address';
                scope.enableClientAddress = scope.isSystemGlobalConfigurationEnabled(addressConfig);
                if (scope.enableClientAddress == true) {
                    scope.enableClientAddress = true;
                    resourceFactory.villageResource.getAllVillages({officeId:scope.formData.officeId, limit: 1000},function (data) {
                        scope.villages = data;
                    });
                    resourceFactory.addressTemplateResource.get({}, function (data) {
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
                        scope.addressType = data.addressTypeOptions;
                        scope.setDefaultGISConfig();
                    });
                }

               /* if(scope.maritalStatusOptions[0]) {
                    scope.formData.maritalStatusId = scope.maritalStatusOptions[0].id;
                }*/
            });

            var villageConfig = 'populate_client_address_from_villages';
            scope.isPopulateClientAddressFromVillages = scope.isSystemGlobalConfigurationEnabled(villageConfig);

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

            scope.displayPersonOrNonPersonOptions = function (legalFormId) {
                if(legalFormId == scope.clientPersonId || legalFormId == null) {
                    scope.showNonPersonOptions = false;
                }else {
                    scope.showNonPersonOptions = true;
                }
            };
            
            scope.changeOffice = function (officeId) {
                resourceFactory.clientTemplateResource.get({staffInSelectedOfficeOnly:true, officeId: officeId
                }, function (data) {
                    scope.staffs = data.staffOptions;
                    scope.savingproducts = data.savingProductOptions;
                    scope.isWorkflowEnabled = (data.isWorkflowEnabled && data.isWorkflowEnableForBranch);
                });
                if(scope.isPopulateClientAddressFromVillages ) {
                    resourceFactory.villageResource.getAllVillages({officeId: officeId, limit: 1000}, function (data) {
                        scope.villages = data;
                    });
                }
            };

            scope.setChoice = function () {
                if (this.formData.active) {
                    scope.choice = 1;
                }
                else if (!this.formData.active) {
                    scope.choice = 0;
                }
            };
            if(routeParams.groupId) {
            	scope.cancel = '#/viewgroup/' + routeParams.groupId
            	scope.groupid = routeParams.groupId;
            }else {
            	scope.cancel = "#/clients"
            }

            scope.changeVillage = function (villageId) {

                if(scope.formAddressData.districtId){
                    delete scope.formAddressData.districtId;
                }
                if(scope.formAddressData.talukaId){
                    delete scope.formAddressData.talukaId;
                }
                scope.formAddressData.villageTown = null
                scope.talukas = null;
                scope.formAddressData.postalCode = null;
                scope.districts = null;
                scope.states= null;
                scope.countries = null;
                if(villageId != null){

                    resourceFactory.villageResource.get({villageId:villageId},function (response) {
                        if (response.addressData.length > 0) {
                            if(response.villageName){
                                scope.formAddressData.villageTown = response.villageName;
                                scope.countries = scope.countrys;
                            }
                            
                            if (response.addressData[0].countryData) {
                                scope.formAddressData.countryId = response.addressData[0].countryData.countryId;
                                scope.changeCountry(scope.formAddressData.countryId);
                            }

                            if (response.addressData[0].stateData) {
                                scope.formAddressData.stateId = response.addressData[0].stateData.stateId;
                                scope.changeState(scope.formAddressData.stateId);
                            }
                            if (response.addressData[0].districtData) {
                                scope.formAddressData.districtId = response.addressData[0].districtData.districtId;
                                scope.changeDistrict(scope.formAddressData.districtId);
                            }
                            
                            if (response.addressData[0].talukaData) {
                                scope.formAddressData.talukaId = response.addressData[0].talukaData.talukaId;
                            }

                            if (response.addressData[0].postalCode) {
                                scope.formAddressData.postalCode = response.addressData[0].postalCode;
                            }
                        }
                    });

                }

            }

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
            }

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

                    scope.districts = scope.selectState[0].districtDatas;
                    scope.getActiveDistricts();
                    scope.talukas = null;
                }
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

            scope.enableContinue = function(){
                scope.enableCreateClientLoop = true;
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
            scope.$watch('first.dateOfBirth', function(newValue, oldValue){
                if(scope.first.dateOfBirth != null)
                {
                    var ageDifMs = Date.now() - scope.first.dateOfBirth.getTime();
                    var ageDifMs = Date.now() - scope.first.dateOfBirth.getTime();
                    var ageDate = new Date(ageDifMs); // miliseconds from epoch
                    scope.displayAge = true;
                    scope.age = Math.abs(ageDate.getUTCFullYear() - 1970);
                }else{
                    scope.displayAge = false;
                }
            });

            scope.validateStaff = function(){
                if(scope.isStaffMandatory && (scope.formData.staffId==undefined || scope.formData.staffId==null)){
                    scope.isStaffRequired = true;
                }else{
                    scope.isStaffRequired = false;
                }
            };
            
            scope.submit = function () {
                var reqDate = dateFilter(scope.first.date, scope.df);

                this.formData.locale = scope.optlang.code;
                this.formData.active = this.formData.active || false;
                this.formData.dateFormat = scope.df;
                this.formData.activationDate = reqDate;

                if (routeParams.centerId) {
                    this.formData.centerId = routeParams.centerId;
                }
                if (routeParams.groupId) {
                    this.formData.groupId = routeParams.groupId;
                }

                if (routeParams.officeId) {
                    this.formData.officeId = routeParams.officeId;
                }

                if (scope.first.submitondate) {
                    reqDate = dateFilter(scope.first.submitondate, scope.df);
                    this.formData.submittedOnDate = reqDate;
                    if(!scope.showActivation){
                       this.formData.active = true;
                       this.formData.activationDate = reqDate;
                    }
                }
                if (scope.first.dateOfBirth) {
                    this.formData.dateOfBirth = dateFilter(scope.first.dateOfBirth, scope.df);
                }
                if(scope.formData.clientClassificationId){
                    this.formData.clientClassificationId = scope.formData.clientClassificationId;
                }
              
                if(scope.first.incorpValidityTillDate) {
                    this.formData.clientNonPersonDetails.locale = scope.optlang.code;
                    this.formData.clientNonPersonDetails.dateFormat = scope.df;
                    this.formData.clientNonPersonDetails.incorpValidityTillDate = dateFilter(scope.first.incorpValidityTillDate, scope.df);
                }

                if (!scope.opensavingsproduct) {
                    this.formData.savingsProductId = null;
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

                if(scope.isLevelBasedAddressEnabled){
                    if(scope.formAddressData.wardAndVillagesId == null && scope.formAddressData.wardAndVillagesId == ""){
                        delete scope.formAddressData.wardAndVillagesId;
                    }else if (scope.formAddressData.wardAndVillagesId){
                        scope.formAddressData.addressRegionValueId = scope.formAddressData.wardAndVillagesId;
                    }
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
                if (scope.formAddressData.villageId){
                    delete scope.formAddressData.villageId;
                }

                if(scope.enableClientAddress){
                    this.formData.addresses=scope.formDataList;
                }

                if(scope.formData.clientClassificationId && scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient.isHiddenField.hideClientClassification){
                   if(!(scope.formData.clientClassificationId)){
                       scope.invalidClassificationId = true;
                   }else {
                       scope.invalidClassificationId = false;
                   }
                }else {
                   scope.invalidClassificationId = false;
                }
              
                if(scope.first.dateOfBirth && scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient.isValidateDOBField.active) {
                    if(!(scope.first.dateOfBirth < scope.maxDateOfBirth && scope.first.dateOfBirth > scope.minDateOfBirth)){
                        scope.dateOfBirthNotInRange = true;
                    } else{
                        scope.dateOfBirthNotInRange = false;
                    }
                } else {
                    scope.dateOfBirthNotInRange = false;
                }

                if(scope.dateOfBirthNotInRange){
                    return false;
                }

                if(scope.isStaffMandatory && (scope.formData.staffId==undefined || scope.formData.staffId==null)){
                    scope.isStaffRequired = true;
                    return false;
                }
                if (!scope.dateOfBirthNotInRange || !scope.invalidClassificationId || !scope.pincode || !scope.isVillageTownMandatory || !isCountryReadOnly || !isAddressTypeMandatory) {

                    resourceFactory.clientResource.save(this.formData, function (data) {
                        if (routeParams.pledgeId) {
                            var updatedData = {};
                            updatedData.clientId = data.clientId;

                            resourceFactory.pledgeResource.update({
                                pledgeId: routeParams.pledgeId
                            }, updatedData, function (pledgeData) {

                            });
                        }
                        if (scope.loanApplicationReferenceId) {
                            resourceFactory.loanCoApplicantsResource.add({
                                loanApplicationReferenceId: scope.loanApplicationReferenceId,
                                clientId: data.clientId
                            }, function (coappData) {
                                location.path('/viewclient/' + data.clientId + '/' + scope.loanApplicationReferenceId);
                            });
                        }
                        resourceFactory.entityTaskExecutionResource.get({
                            entityType: 'CLIENT_ONBOARDING',
                            entityId: data.clientId
                        }, function (taskData) {
                            if(data.additionalResponseData && data.additionalResponseData.isDeDuplicationCheck){
                                location.path('/client/' + data.clientId + '/activate');
                            }else{
                                if (taskData.id == undefined) {
                                    if (scope.enableCreateClientLoop) {
                                        location.path('/createclient/').search({
                                            groupId: scope.groupId,
                                            officeId: scope.officeId,
                                            staffId: scope.staffId,
                                            centerId: scope.centerId,
                                            clientId: data.clientId
                                        });
                                    } else {
                                        if (routeParams.groupId) {
                                            location.path('/viewgroup/' + routeParams.groupId);
                                        } else {
                                            location.path('/viewclient/' + data.clientId).search('');
                                        }
                                    }
                                } else {
                                    location.path('/viewtask/' + taskData.id);
                                }
                            }
                        });
                    });
                }

            };
        }
    });
    mifosX.ng.application.controller('CreateNewClientController', ['$controller','$scope', 'ResourceFactory', '$location', '$routeParams', '$http', 'dateFilter', 'API_VERSION', '$upload', '$rootScope', '$routeParams', mifosX.controllers.CreateNewClientController]).run(function ($log) {
        $log.info("CreateNewClientController initialized");
    });
}(mifosX.controllers || {}));
