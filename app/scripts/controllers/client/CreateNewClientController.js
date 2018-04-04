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
            scope.countrys = [];
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
            if($rootScope.tenantIdentifier == "chaitanya"){
                scope.isDateOfBirthMandatory = true;
            }
            scope.invalidClassificationId = false;
            scope.submitted = false;
            scope.isStaffMandatory = false;
            scope.isStaffRequired = false;

            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                scope.response.uiDisplayConfigurations.createClient.isMandatoryField && scope.response.uiDisplayConfigurations.createClient.isMandatoryField.clientClassificationId) {
                scope.isClientClassificationMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.clientClassificationId;
            }
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                scope.response.uiDisplayConfigurations.createClient.isHiddenField) {
                scope.showStaff = !scope.response.uiDisplayConfigurations.createClient.isHiddenField.staffActivation;
                scope.showLegalForm = !scope.response.uiDisplayConfigurations.createClient.isHiddenField.legalForm;
                scope.showMiddleName = !scope.response.uiDisplayConfigurations.createClient.isHiddenField.middleName;
                scope.showExternalId = !scope.response.uiDisplayConfigurations.createClient.isHiddenField.externalId;
                scope.showSubmittedOn = !scope.response.uiDisplayConfigurations.createClient.isHiddenField.submittedOn;
                scope.showOpenSavingsProduct = !scope.response.uiDisplayConfigurations.createClient.isHiddenField.openSavingsProduct;
            }
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                scope.response.uiDisplayConfigurations.createClient.isHiddenField && scope.response.uiDisplayConfigurations.createClient.isHiddenField.hideClientClassification) {
                scope.hideClientClassification = scope.response.uiDisplayConfigurations.createClient.isHiddenField.hideClientClassification;
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
            function getMaximumRestrictedDate(restrictedDate) {

                restrictedDate.setYear(restrictedDate.getFullYear() - scope.minAge);
                return restrictedDate;
            };

            function getMinimumRestrictedDate(restrictedDate) {

                restrictedDate.setYear(restrictedDate.getFullYear() - scope.maxAge);
                return restrictedDate;
            };


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
                scope.isWorkflowEnabled = data.isWorkflowEnabled;
                scope.maritalStatusOptions = data.maritalStatusOptions;

                if(scope.genderOptions[0]) {
                    scope.formData.genderId = scope.genderOptions[0].id;
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
                        scope.addressType = data.addressTypeOptions;
                        scope.countries = data.countryDatas;
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
                if(villageId != null){

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
                    resourceFactory.villageResource.get({villageId:villageId},function (response) {
                        if (response.addressData.length > 0) {
                            if(response.villageName){
                                scope.formAddressData.villageTown = response.villageName;
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
            }

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

            scope.enableContinue = function(){
                scope.enableCreateClientLoop = true;
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
                         
                            resourceFactory.pledgeResource.update({pledgeId: routeParams.pledgeId}, updatedData, function (pledgeData) {

                            });
                        }
                        if(scope.loanApplicationReferenceId){
                            resourceFactory.loanCoApplicantsResource.add({loanApplicationReferenceId: scope.loanApplicationReferenceId, clientId: data.clientId}, function(coappData){
                                location.path('/viewclient/' + data.clientId+'/'+scope.loanApplicationReferenceId);
                            });
                        }
                        resourceFactory.entityTaskExecutionResource.get({entityType:'CLIENT_ONBOARDING',entityId:data.clientId}, function (taskData) {
                         if(taskData.id==undefined)
                        {
                            if (scope.enableCreateClientLoop){
                                location.path('/createclient/').search({groupId: scope.groupId,officeId: scope.officeId,staffId: scope.staffId,centerId: scope.centerId,clientId: data.clientId});
                            } else{
                                location.path('/viewclient/' + data.clientId).search('');
                            }
                        }
                        else
                        {
                            location.path('/viewtask/'+ taskData.id);
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
