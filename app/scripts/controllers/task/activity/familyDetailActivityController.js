(function (module) {
    mifosX.controllers = _.extend(module, {
        familyDetailActivityController: function ($controller,scope, routeParams, resourceFactory, location, $modal, route, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.clientId = scope.taskconfig['clientId'];
            scope.first = {};
            scope.isDateOfBirthMandatory = false;
            scope.displayAge = false;
            scope.minAge = 0;
            scope.maxAge = 0;
            scope.addressType = [];
            scope.countrys = [];
            scope.states = [];
            scope.stateName = [];
            scope.formAddressData = {};
            scope.showAddressForm = false;
            scope.isFamilyAddressEnabled = scope.isSystemGlobalConfigurationEnabled('enable-family-member-address');
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient && 
                scope.response.uiDisplayConfigurations.createClient.isValidateDOBField && scope.response.uiDisplayConfigurations.createClient.isValidateDOBField.active) {
                if(scope.response.uiDisplayConfigurations.createClient.isMandatoryField.dateOfBirth){
                    scope.isDateOfBirthMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.dateOfBirth;
                }
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

            function init()
            {
                scope.showform=false;
                
                populateData();
            }
            init();
            function populateTemplateData()
            {
                scope.salutationOptions = [];
                scope.relationshipOptions = [];
                scope.genderOptions = [];
                scope.educationOptions = [];
                scope.occupationOptions = [];
                scope.subOccupations = [];
                resourceFactory.familyDetailsTemplate.get({clientId: scope.clientId}, function (data) {
                    scope.salutationOptions = data.salutationOptions;
                    scope.relationshipOptions = data.relationshipOptions;
                    scope.genderOptions = data.genderOptions;
                    scope.educationOptions = data.educationOptions;
                    scope.occupationOptions = data.occupationOptions;
                    scope.relationshipGenderData = data.relationshipGenderData;
                });
                
            }
            function populateData()
            {
                populateTemplateData();
                resourceFactory.familyDetails.getAll({
                    clientId: scope.clientId
                }, function (data) {
                    scope.familyMembers = data;
                    scope.showform=false;
                });
            } 
            scope.addMember = function () 
                {
                    scope.familyMemberId=undefined;
                    scope.showform=true;
                    scope.formData={};
                    scope.formAddressData={};
                    scope.editAddressForm = false;    
                    scope.showAdressAddingButton = true      
                    scope.showAddressForm = false   
                    scope.isAddressPresent = false;     
                };
            scope.cancel = function () 
                {
                    scope.showform=false;
                };
            scope.submit = function () {
                scope.formData.dateFormat = scope.df;
                this.formData.locale = scope.optlang.code;
                if(this.formData.dateOfBirth){
                    this.formData.dateOfBirth = dateFilter(scope.formData.dateOfBirth, scope.df);
                }
                if (scope.showAddressForm) {
                    scope.formAddressData.addressTypes = [scope.formAddressData.addressTypes[0]];
                    this.formData.addresses = [scope.formAddressData];
                }
                if ((scope.isAddressPresent && scope.addressData.addressEntityData[0].addressType.name == "kycAddress") || !scope.showAddressForm) {
                    delete this.formData.addresses;
                }
                
                if (this.formData.dateOfBirth) {
                    this.formData.dateOfBirth = dateFilter(scope.formData.dateOfBirth, scope.df);
                }
                if(scope.familyMemberId==undefined){
                    resourceFactory.familyDetails.save({clientId: scope.clientId}, this.formData, function (data) {
                    populateData();
                    });    
                }
                else
                {
                    resourceFactory.familyDetails.update({clientId: scope.clientId,familyDetailId: scope.familyMemberId}   
                        , scope.formData, function (data) {
                        populateData();
                });
                }
                
            };

            scope.addAddress = function () {
                scope.showAddressForm = true;
                scope.showAdressAddingButton = false;
            };

            scope.showEdit = function (id) {
                scope.familyMemberId=id;
                scope.formData={};
                scope.formAddressData = {};
                scope.isAddressPresent = false;     
                scope.showAddressForm = false   
                scope.editAddressForm = true;
                scope.showAdressAddingButton = true;
                var i=0;
                var member={};
                for(i=0;i<scope.familyMembers.length;i++){
                    if(scope.familyMembers[i].id==id){
                        member=scope.familyMembers[i];
                        break;
                    }
                }
                if(member.salutation!=undefined){
                    scope.formData.salutationId=member.salutation.id;
                }
                if(member.relationship!=undefined){
                    scope.formData.relationshipId=member.relationship.id;
                }
                if(member.gender!=undefined){
                    scope.formData.genderId=member.gender.id;
                }

                scope.addressEntityData = [];
                scope.addressData = [];
                scope.entityType = "familymember";
                resourceFactory.addressDataResource.getAll({
                    entityType: scope.entityType,
                    entityId: scope.familyMemberId
                }, function (response) {
                    scope.addressData = response[0];
                    if (scope.addressData) {
                        scope.showAddressForm = true;
                        scope.showAdressAddingButton = false;
                        scope.isAddressPresent = true;
                        if (scope.addressData.addressEntityData[0].addressType) {
                            scope.formAddressData.addressTypes = [scope.addressData.addressEntityData[0].addressType.id];
                        }
                        scope.formAddressData.houseNo = scope.addressData.houseNo;
                        scope.formAddressData.addressLineOne = scope.addressData.addressLineOne;
                        scope.formAddressData.villageTown = scope.addressData.villageTown;
                        scope.formAddressData.postalCode = scope.addressData.postalCode;
                        scope.formAddressData.stateId = scope.addressData.stateData.stateId;
                        scope.formAddressData.addressId = scope.addressData.addressId;
                    }
                });

                if(member.occupation!=undefined){
                    var j=0;
                    for(j=0;j<scope.occupationOptions.length;j++){
                        if(scope.occupationOptions[j].id==member.occupation.cashflowCategoryId){
                            scope.occupationOption=scope.occupationOptions[j];
                            scope.formData.occupationDetailsId=member.occupation.id;
                        }
                    }
                    
                }
                if(member.education!=undefined){
                    scope.formData.educationId=member.education.id;
                }
                scope.formData.isDependent=member.isDependent;
                scope.formData.isSeriousIllness=member.isSeriousIllness;
                scope.formData.isDeceased=member.isDeceased;
                scope.formData.firstname=member.firstname;
                scope.formData.lastname=member.lastname;
                if(member.dateOfBirth){
                    scope.formData.dateOfBirth = dateFilter(new Date(member.dateOfBirth), scope.df);
                }
                scope.formData.age=member.age;
                scope.displayAge = true;
                scope.age = member.age;
                if(!member.middlename==undefined){
                    scope.formData.middlename=member.middlename;
                }
                scope.showform=true;
            };

            if (scope.isFamilyAddressEnabled == true) {
                resourceFactory.addressTemplateResource.get({}, function (data) {
                    scope.countries = data.countryDatas;
                    scope.addressType = data.addressTypeOptions;
                    scope.setDefaultGISConfig();
                });
            }
            scope.setDefaultGISConfig = function () {
                if (scope.responseDefaultGisData && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address) {
                    if (scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.countryName) {

                        var countryName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.countryName;
                        scope.defaultCountry = _.filter(scope.countries, function (country) {
                            return country.countryName === countryName;

                        });
                        scope.formAddressData.countryId = scope.defaultCountry[0].countryId;
                        scope.states = scope.defaultCountry[0].statesDatas;
                    }

                    if (scope.states && scope.states.length > 0 && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.stateName) {
                        scope.stateName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.stateName;
                        scope.defaultState = _.filter(scope.states, function (state) {
                            return state.stateName === scope.stateName;

                        });
                        scope.formAddressData.stateId = scope.defaultState[0].stateId;
                    }

                }

            };

            var FamilyDetailsDeleteCtrl = function ($scope, $modalInstance, familyDetailsId) {
				$scope.df = scope.df;
                $scope.delete = function () {
                    resourceFactory.familyDetails.delete({
                        clientId: scope.clientId,
                        familyDetailId: familyDetailsId
                    }, {}, function (data) {
                        $modalInstance.close('delete');
                        route.reload();
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.deleteFamilyDetail = function (id) {
                $modal.open({
                    templateUrl: 'deletefamilydetail.html',
                    controller: FamilyDetailsDeleteCtrl,
                    resolve: {
                        familyDetailsId: function () {
                            return id;
                        }
                    }
                });
            };
            
            scope.findRelationCodeValue = function(value){
                scope.formData.genderId = null;
                if(scope.relationshipGenderData && scope.relationshipGenderData.codeValueRelations){
                    for(var i in scope.relationshipGenderData.codeValueRelations){
                        if(scope.relationshipGenderData.codeValueRelations[i].codeValueFrom === value){
                                scope.formData.genderId = scope.relationshipGenderData.codeValueRelations[i].codeValueTo;
                        }
                    }
                }
            }

            scope.$watch('formData.dateOfBirth', function(newValue, oldValue){
                if(!_.isUndefined(scope.formData.dateOfBirth))
                {
                    var ageDifMs = Date.now() - scope.formData.dateOfBirth.getTime();
                    var ageDate = new Date(ageDifMs); // miliseconds from epoch
                    scope.displayAge = true;
                    scope.age = Math.abs(ageDate.getUTCFullYear() - 1970);
                    scope.formData.age = scope.age;
                }else{
                    scope.displayAge = false;
                }
            });
        }
    });
    mifosX.ng.application.controller('familyDetailActivityController', ['$controller','$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', 'dateFilter', mifosX.controllers.familyDetailActivityController]).run(function ($log) {
        $log.info("familyDetailActivityController initialized");
    });

}(mifosX.controllers || {}));