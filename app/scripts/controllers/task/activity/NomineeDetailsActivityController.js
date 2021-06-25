(function (module) {
    mifosX.controllers = _.extend(module, {
        NomineeDetailsActivityController: function ($controller, scope, resourceFactory, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));
            scope.showAddNomineeForm = false;
            scope.showAddMemberForm = false;
            scope.formData = {};
            scope.showSummary = true;
            scope.addressType = [];
            scope.countrys = [];
            scope.states = [];
            scope.stateName = [];
            scope.formAddressData = {};
            scope.showAddNomineeButton = true;
            scope.isAddressTypeDisabled = false;
            scope.addMemberData = false;
            scope.isFamilyAddressEnabled = scope.isSystemGlobalConfigurationEnabled('enable-family-member-address');
            scope.isNomineeAddressEnabled = scope.isSystemGlobalConfigurationEnabled('enable-nominee-address');
            scope.allowMultipleNominees = scope.isSystemGlobalConfigurationEnabled('allow-multiple-nominees');

            function initTask() {
                scope.loanApplicationReferenceId = scope.taskconfig['loanApplicationId'];
                scope.clientId = scope.taskconfig['clientId'];
                scope.showSummary = true;
                refreshAndShowSummaryView();
            };

            initTask();

            function getNomineeDetails() {
                resourceFactory.loanApplicationNomineeResource.get({ loanApplicationReferenceId: scope.loanApplicationReferenceId }, function (data) {
                    scope.nomineeMembers = data;
                    if (!scope.allowMultipleNominees && !_.isEmpty(data)) {
                        scope.showAddNomineeButton = false;
                    }
                });
            };

            function populateTemplateData() {
                scope.salutationOptions = [];
                scope.relationshipOptions = [];
                scope.genderOptions = [];
                scope.educationOptions = [];
                scope.occupationOptions = [];
                scope.subOccupations = [];
                resourceFactory.familyDetailsTemplate.get({ clientId: scope.clientId }, function (data) {
                    scope.salutationOptions = data.salutationOptions;
                    scope.relationshipOptions = data.relationshipOptions;
                    scope.genderOptions = data.genderOptions;
                    scope.educationOptions = data.educationOptions;
                    scope.occupationOptions = data.occupationOptions;
                    scope.relationshipGenderData = data.relationshipGenderData;
                });

            }

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

            scope.changeMember = function (familyMemberId) {
                if (scope.isNomineeAddressEnabled) {
                    scope.addressEntityData = [];
                    scope.addressData = [];
                    scope.entityType = "familymember";
                    resourceFactory.addressDataResource.getAll({
                        entityType: scope.entityType,
                        entityId: familyMemberId
                    }, function (response) {
                        scope.addressData = response[0];
                        if (scope.addressData) {
                            scope.addressNotFound = false;
                        }
                        else {
                            scope.addressNotFound = true;
                        }
                    });
                }
            }

            scope.addAdress = function (familyMemberId) {
                scope.addMemberData = true;
                scope.formAddressData = {};
                scope.isAddressTypeDisabled = false;
                scope.isAddressPresent = false
                scope.editFamilyMember(familyMemberId);
            }

            scope.editFamilyMember = function (id) {
                scope.formData = {};
                scope.formAddressData = {};
                populateTemplateData();
                initAddClientFamilyMembersdetails();
                scope.showAddNomineeButton = false;
                scope.showAddNomineeForm = false;
                scope.familyMemberId = id;
                scope.editAddressForm = true;
                scope.showAdressAddingButton = false;
                var i = 0;
                var member = {};
                for (i = 0; i < scope.familyMembers.length; i++) {
                    if (scope.familyMembers[i].id == id) {
                        member = scope.familyMembers[i];
                        break;
                    }
                }
                if (member.salutation != undefined) {
                    scope.formData.salutationId = member.salutation.id;
                }
                if (member.relationship != undefined) {
                    scope.formData.relationshipId = member.relationship.id;
                }
                if (member.gender != undefined) {
                    scope.formData.genderId = member.gender.id;
                }

                if (member.occupation != undefined) {
                    var j = 0;
                    for (j = 0; j < scope.occupationOptions.length; j++) {
                        if (scope.occupationOptions[j].id == member.occupation.cashflowCategoryId) {
                            scope.occupationOption = scope.occupationOptions[j];
                            scope.formData.occupationDetailsId = member.occupation.id;
                        }
                    }
                }
                if (member.education != undefined) {
                    scope.formData.educationId = member.education.id;
                }
                scope.formData.isDependent = member.isDependent;
                scope.formData.isSeriousIllness = member.isSeriousIllness;
                scope.formData.isDeceased = member.isDeceased;
                scope.formData.firstname = member.firstname;
                scope.formData.lastname = member.lastname;
                if (member.dateOfBirth) {
                    scope.formData.dateOfBirth = dateFilter(new Date(member.dateOfBirth), scope.df);
                }
                scope.formData.age = member.age;
                scope.displayAge = true;
                scope.age = member.age;
                if (!member.middlename == undefined) {
                    scope.formData.middlename = member.middlename;
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
                        scope.isAddressTypeDisabled = true;
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
                scope.showAddMemberForm = true;
            }

            scope.addNominee = function () {
                scope.formData = {};
                scope.showAddNomineeForm = true;
                scope.showAddNomineeButton = false;
                initAddClientFamilyMembersdetails();
            };

            scope.addMember = function () {
                scope.formData = {};
                scope.formAddressData = {};
                scope.familyMemberId = undefined;
                scope.showAddNomineeForm = false;
                scope.showAddMemberForm = true;
                scope.showAddNomineeButton = false;
                scope.addMemberData = true;
                scope.isAddressTypeDisabled = false;
                populateTemplateData();
            };

            function initAddClientFamilyMembersdetails() {
                resourceFactory.familyDetails.getAll({ clientId: scope.clientId }, function (data) {
                    scope.familyMembers = data;
                });
            };

            scope.submit = function () {
                if (!scope.allowMultipleNominees) {
                    var percentage = 100;
                    scope.formData.percentage = percentage;
                }
                resourceFactory.loanApplicationNomineeResource.post({ loanApplicationReferenceId: scope.loanApplicationReferenceId }, scope.formData, function (data) {
                    refreshAndShowSummaryView();
                });
            };

            scope.submitAddMember = function () {
                scope.formData.dateFormat = scope.df;
                this.formData.locale = scope.optlang.code;
                if (scope.isNomineeAddressEnabled) {
                    scope.formAddressData.addressTypes = [scope.formAddressData.addressTypes[0]];
                    this.formData.addresses = [scope.formAddressData];
                }
                if (this.formData.dateOfBirth) {
                    this.formData.dateOfBirth = dateFilter(scope.formData.dateOfBirth, scope.df);
                }

                if ((scope.isAddressPresent && scope.addressData.addressEntityData[0].addressType.name == "kycAddress") || !scope.isFamilyAddressEnabled) {
                    delete this.formData.addresses;
                }

                if (scope.familyMemberId == undefined) {
                    resourceFactory.familyDetails.save({ clientId: scope.clientId }, this.formData, function (data) {
                        if (scope.addMemberData) {
                            scope.formData = {};
                            initAddingNomineeDetails();
                        }
                        else {
                            refreshAndShowSummaryView();
                        }
                    });
                }
                else {
                    resourceFactory.familyDetails.update({ clientId: scope.clientId, familyDetailId: scope.familyMemberId }
                        , scope.formData, function (data) {
                            if (scope.addMemberData) {
                                scope.formData = {};
                                scope.formData.familyMemberId = scope.familyMemberId;
                                scope.changeMember(scope.familyMemberId);
                                initAddingNomineeDetails();
                            } else {
                                initAddingNomineeDetails();
                                refreshAndShowSummaryView();
                            }
                        });
                }
            };

            scope.cancel = function () {
                if (scope.addMemberData) {
                    initAddingNomineeDetails();
                    scope.formData = {};
                    scope.formData.familyMemberId = scope.familyMemberId;
                } else {
                    refreshAndShowSummaryView();
                }
            };

            scope.deleteNominee = function (familyMemberId) {
                resourceFactory.deleteNomineeResource.delete({ loanApplicationReferenceId: scope.loanApplicationReferenceId, familyMemberId: familyMemberId }, function (data) {
                    refreshAndShowSummaryView();
                });
            };

            function refreshAndShowSummaryView() {
                getNomineeDetails();
                scope.showSummary = true;
                scope.showAddNomineeForm = false;
                scope.showAddMemberForm = false;
                scope.showAddNomineeButton = true;
            };

            function initAddingNomineeDetails() {
                initAddClientFamilyMembersdetails();
                scope.formAddressData = {};
                scope.showSummary = false;
                scope.showAddNomineeForm = true;
                scope.showAddMemberForm = false;
                scope.showAddNomineeButton = false;
                scope.addMemberData = false;
            };

            scope.$watch('formData.dateOfBirth', function (newValue, oldValue) {
                if (!_.isUndefined(scope.formData.dateOfBirth)) {
                    var ageDifMs = Date.now() - scope.formData.dateOfBirth.getTime();
                    var ageDate = new Date(ageDifMs); // miliseconds from epoch
                    scope.displayAge = true;
                    scope.age = Math.abs(ageDate.getUTCFullYear() - 1970);
                    scope.formData.age = scope.age;
                } else {
                    scope.displayAge = false;
                }
            });
        }
    });
    mifosX.ng.application.controller('NomineeDetailsActivityController', ['$controller', '$scope', 'ResourceFactory', 'dateFilter', mifosX.controllers.NomineeDetailsActivityController]).run(function ($log) {
        $log.info("NomineeDetailsActivityController initialized");
    });
}(mifosX.controllers || {}));