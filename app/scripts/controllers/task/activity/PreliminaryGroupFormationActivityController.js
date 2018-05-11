(function (module) {
    mifosX.controllers = _.extend(module, {
        PreliminaryGroupFormationActivityController: function ($controller, scope, routeParams, $modal, resourceFactory, location, dateFilter, ngXml2json, route, $http, $rootScope, $sce, CommonUtilService, $route, $upload, API_VERSION) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));

            function initTask() {
                scope.centerId = scope.taskconfig.centerId;
                resourceFactory.centerResource.get({ centerId: scope.centerId, associations: 'groupMembers,clientMembers' }, function (data) {
                    scope.centerDetails = data;
                });

            };
            initTask();


            scope.createSubGroup = function (centerDetails) {
                $modal.open({
                    templateUrl: 'views/task/popup/createsubgroup.html',
                    controller: CreateSubGroupCtrl,
                    windowClass: 'modalwidth700',
                    resolve: {
                        centerDetails: function () {
                            return centerDetails;
                        }
                    }
                });
            };

            var CreateSubGroupCtrl = function ($scope, $modalInstance, centerDetails) {
                $scope.subGroupFormData = {};
                $scope.subGroupFormData.officeId = scope.centerDetails.officeId;
                $scope.officeName = scope.centerDetails.officeName;
                $scope.subGroupFormData.staffId = scope.centerDetails.staffId;
                $scope.submitondate = new Date();
                $scope.staffName = scope.centerDetails.staffName;
                $scope.subGroupFormData.clientMembers = [];
                $scope.subGroupFormData.centerId = scope.centerDetails.id;
                $scope.subGroupFormData.locale = scope.optlang.code;
                $scope.subGroupFormData.dateFormat = scope.df;
                $scope.subGroupFormData.active = false;

                $scope.submit = function () {
                    resourceFactory.groupResource.save(this.subGroupFormData, function (data) {
                        $modalInstance.close('createsubgroup');
                        $route.reload();
                    });
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

            };

            scope.createMemberInGroup = function (groupId, officeId) {
                $modal.open({
                    templateUrl: 'views/task/popup/createmember.html',
                    controller: CreateMemberCtrl,
                    windowClass: 'app-modal-window',
                    size: 'lg',
                    resolve: {
                        groupParameterInfo: function () {
                            return { 'groupId': groupId, 'officeId': officeId };
                        }
                    }
                });
            }

            var CreateMemberCtrl = function ($scope, $modalInstance, groupParameterInfo) {

                $scope.offices = [];
                $scope.staffs = [];
                $scope.savingproducts = [];
                $scope.first = {};
                $scope.first.date = new Date();
                $scope.first.submitondate = new Date();
                $scope.formData = {};
                $scope.clientNonPersonDetails = {};
                $scope.showSavingOptions = false;
                $scope.opensavingsproduct = false;
                $scope.forceOffice = null;
                $scope.showNonPersonOptions = false;
                $scope.clientPersonId = 1;
                $scope.restrictDate = new Date();
                $scope.isDateOfBirthMandatory = false;
                $scope.enableCreateClientLoop = false;
                $scope.isClientActive = false;
                $scope.hideClientClassification = false;
                $scope.isClientClassificationMandatory = false;
                $scope.isExternalIdMandatory = false;
                $scope.isMobileNumberMandatory = false;
                $scope.isEmailIdMandatory = false;
                $scope.isGenderMandatory = false;
                $scope.displayAge = false;
                $scope.isDateOfBirthMandatory = true;
                $scope.invalidClassificationId = false;
                $scope.submitted = false;
                $scope.isStaffMandatory = false;
                $scope.isStaffRequired = false;

                if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                    scope.response.uiDisplayConfigurations.createClient.isMandatoryField && scope.response.uiDisplayConfigurations.createClient.isMandatoryField.clientClassificationId) {
                    $scope.isClientClassificationMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.clientClassificationId;
                }
                if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                    scope.response.uiDisplayConfigurations.createClient.isHiddenField) {
                    $scope.showStaff = !scope.response.uiDisplayConfigurations.createClient.isHiddenField.staffActivation;
                    $scope.showLegalForm = !scope.response.uiDisplayConfigurations.createClient.isHiddenField.legalForm;
                    $scope.showMiddleName = !scope.response.uiDisplayConfigurations.createClient.isHiddenField.middleName;
                    $scope.showExternalId = !scope.response.uiDisplayConfigurations.createClient.isHiddenField.externalId;
                    $scope.showSubmittedOn = !scope.response.uiDisplayConfigurations.createClient.isHiddenField.submittedOn;
                    $scope.showOpenSavingsProduct = !scope.response.uiDisplayConfigurations.createClient.isHiddenField.openSavingsProduct;
                }
                if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                    scope.response.uiDisplayConfigurations.createClient.isHiddenField && scope.response.uiDisplayConfigurations.createClient.isHiddenField.hideClientClassification) {
                    $scope.hideClientClassification = scope.response.uiDisplayConfigurations.createClient.isHiddenField.hideClientClassification;
                }
                if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                    scope.response.uiDisplayConfigurations.createClient.isMandatoryField) {

                    if (scope.response.uiDisplayConfigurations.createClient.isMandatoryField.dateOfBirth) {
                        $scope.isDateOfBirthMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.dateOfBirth;
                    }
                    if (scope.response.uiDisplayConfigurations.createClient.isMandatoryField.staff) {
                        $scope.isStaffMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.staff;
                    }

                }
                if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                    scope.response.uiDisplayConfigurations.createClient.isMandatoryField.gender) {
                    $scope.isGenderMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.gender;
                }
                if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                    scope.response.uiDisplayConfigurations.createClient.isMandatoryField && scope.response.uiDisplayConfigurations.createClient.isMandatoryField.externalId) {
                    $scope.isExternalIdMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.externalId;
                }
                if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient.isMandatoryField) {
                    $scope.isMobileNumberMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.mobileNumber;
                    $scope.isEmailIdMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.emailId;
                }
                $scope.minAge = 0;
                $scope.maxAge = 0;
                scope.dateOfBirthNotInRange = false;
                if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                    scope.response.uiDisplayConfigurations.createClient.isValidateDOBField && scope.response.uiDisplayConfigurations.createClient.isValidateDOBField.active) {
                    if (scope.response.uiDisplayConfigurations.createClient.isValidateDOBField.ageCriteria.minAge > 0) {
                        $scope.minAge = scope.response.uiDisplayConfigurations.createClient.isValidateDOBField.ageCriteria.minAge;

                    }
                    if (scope.response.uiDisplayConfigurations.createClient.isValidateDOBField.ageCriteria.maxAge > 0) {
                        $scope.maxAge = scope.response.uiDisplayConfigurations.createClient.isValidateDOBField.ageCriteria.maxAge;
                    }
                } else {
                    $scope.minAge = 0;
                    $scope.maxAge = scope.restrictDate;

                }
                $scope.minDateOfBirth = getMinimumRestrictedDate(new Date());
                $scope.maxDateOfBirth = getMaximumRestrictedDate(new Date());
                function getMaximumRestrictedDate(restrictedDate) {

                    restrictedDate.setYear(restrictedDate.getFullYear() - scope.minAge);
                    return restrictedDate;
                };

                function getMinimumRestrictedDate(restrictedDate) {

                    restrictedDate.setYear(restrictedDate.getFullYear() - scope.maxAge);
                    return restrictedDate;
                };

                $scope.getMemberTemplate = function () {

                    var requestParams = { 'staffInSelectedOfficeOnly': true };
                    if (groupParameterInfo.groupId) {
                        requestParams.groupId = groupParameterInfo.groupId;
                    }
                    if (groupParameterInfo.officeId) {
                        requestParams.officeId = groupParameterInfo.officeId;
                    }
                    resourceFactory.clientTemplateResource.get(requestParams, function (data) {
                        $scope.offices = data.officeOptions;
                        $scope.staffs = data.staffOptions;
                        $scope.formData.officeId = $scope.offices[0].id;
                        $scope.savingproducts = data.savingProductOptions;
                        $scope.genderOptions = data.genderOptions;
                        $scope.clienttypeOptions = data.clientTypeOptions;
                        $scope.clientClassificationOptions = data.clientClassificationOptions;
                        $scope.clientNonPersonConstitutionOptions = data.clientNonPersonConstitutionOptions;
                        $scope.clientNonPersonMainBusinessLineOptions = data.clientNonPersonMainBusinessLineOptions;
                        $scope.clientLegalFormOptions = data.clientLegalFormOptions;
                        $scope.formData.legalFormId = $scope.clientLegalFormOptions[0].id;
                        $scope.isWorkflowEnabled = data.isWorkflowEnabled;
                        $scope.maritalStatusOptions = data.maritalStatusOptions;
                        $scope.formData.active = true;

                        if ($scope.genderOptions[0]) {
                            $scope.formData.genderId = $scope.genderOptions[0].id;
                        }
                        if (scope.response != undefined && scope.response.uiDisplayConfigurations.createClient.isReadOnlyField.active) {
                            $scope.isClientActive = scope.response.uiDisplayConfigurations.createClient.isReadOnlyField.active;
                            $scope.formData.active = scope.response.uiDisplayConfigurations.createClient.isReadOnlyField.active;
                            $scope.choice = 1;
                        } else {
                            $scope.choice = 0;

                        }
                        $scope.formData.dateOfBirth = scope.dateOfBirth;
                        $scope.formData.clientClassificationId = scope.clientClassificationId;

                        if (data.savingProductOptions.length > 0) {
                            $scope.showSavingOptions = true;
                        }
                        if (groupParameterInfo.officeId) {
                            $scope.formData.officeId = groupParameterInfo.officeId;
                            for (var i in data.officeOptions) {
                                if (data.officeOptions[i].id == groupParameterInfo.officeId) {
                                    $scope.forceOffice = data.officeOptions[i];
                                    break;
                                }
                            }
                        }
                        if (groupParameterInfo.groupId) {
                            $scope.formData.groupId = groupParameterInfo.groupId;
                        }
                        /*if(routeParams.staffId) {
                            for(var i in $scope.staffs) {
                                if (scope.staffs[i].id == routeParams.staffId) {
                                    scope.formData.staffId = scope.staffs[i].id;
                                    break;
                                }
                            }
                        }*/

                    });

                };

                $scope.getMemberTemplate();

                $scope.displayPersonOrNonPersonOptions = function (legalFormId) {
                    if (legalFormId == scope.clientPersonId || legalFormId == null) {
                        scope.showNonPersonOptions = false;
                    } else {
                        scope.showNonPersonOptions = true;
                    }
                };

                $scope.submit = function () {
                    var reqDate = dateFilter($scope.first.date, scope.df);

                    $scope.formData.locale = scope.optlang.code;
                    $scope.formData.active = $scope.formData.active || false;
                    $scope.formData.dateFormat = scope.df;
                    $scope.formData.activationDate = reqDate;

                    if (scope.centerId) {
                        $scope.formData.centerId = scope.centerId;
                    }

                    if ($scope.first.submitondate) {
                        reqDate = dateFilter($scope.first.submitondate, scope.df);
                        $scope.formData.submittedOnDate = reqDate;
                    }
                    if ($scope.first.dateOfBirth) {
                        $scope.formData.dateOfBirth = dateFilter($scope.first.dateOfBirth, scope.df);
                    }
                    if ($scope.formData.clientClassificationId) {
                        $scope.formData.clientClassificationId = $scope.formData.clientClassificationId;
                    }

                    if ($scope.first.incorpValidityTillDate) {
                        $scope.formData.clientNonPersonDetails.locale = scope.optlang.code;
                        $scope.formData.clientNonPersonDetails.dateFormat = scope.df;
                        $scope.formData.clientNonPersonDetails.incorpValidityTillDate = dateFilter($scope.first.incorpValidityTillDate, scope.df);
                    }

                    if (!$scope.opensavingsproduct) {
                        $scope.formData.savingsProductId = null;
                    }

                    if ($scope.formData.clientClassificationId && scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient.isHiddenField.hideClientClassification) {
                        if (!(scope.formData.clientClassificationId)) {
                            $scope.invalidClassificationId = true;
                        } else {
                            $scope.invalidClassificationId = false;
                        }
                    } else {
                        $scope.invalidClassificationId = false;
                    }

                    if ($scope.first.dateOfBirth && scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient.isValidateDOBField.active) {
                        if (!($scope.first.dateOfBirth < $scope.maxDateOfBirth && $scope.first.dateOfBirth > $scope.minDateOfBirth)) {
                            $scope.dateOfBirthNotInRange = true;
                        } else {
                            $scope.dateOfBirthNotInRange = false;
                        }
                    } else {
                        $scope.dateOfBirthNotInRange = false;
                    }

                    if ($scope.dateOfBirthNotInRange) {
                        return false;
                    }

                    if ($scope.isStaffMandatory && ($scope.formData.staffId == undefined || $scope.formData.staffId == null)) {
                        $scope.isStaffRequired = true;
                        return false;
                    }
                    if (!$scope.dateOfBirthNotInRange || !$scope.invalidClassificationId) {

                        resourceFactory.clientResource.save($scope.formData, function (data) {
                            $modalInstance.close('createmember');
                            $route.reload();
                        });
                    }

                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

            }

            scope.viewMemberDetails = function (memberId) {
                $modal.open({
                    templateUrl: 'views/task/popup/viewmember.html',
                    controller: ViewMemberCtrl,
                    windowClass: 'app-modal-window',
                    size: 'lg',
                    resolve: {
                        memberParams: function () {
                            return { 'memberId': memberId };
                        }
                    }
                });
            }

            var ViewMemberCtrl = function ($scope, $modalInstance, memberParams) {
                $scope.clientId = memberParams.memberId;
                $scope.showaddressform = false;
                $scope.shownidentityform = false;
                $scope.shownFamilyMembersForm = false;

                $scope.setDefaultGISConfig = function () {
                    if (scope.responseDefaultGisData && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address) {
                        if (scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.countryName) {

                            var countryName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.countryName;
                            $scope.defaultCountry = _.filter($scope.countries, function (country) {
                                return country.countryName === countryName;

                            });
                            $scope.formData.countryId = $scope.defaultCountry[0].countryId;
                            $scope.states = $scope.defaultCountry[0].statesDatas;
                        }

                        if ($scope.states && $scope.states.length > 0 && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.stateName) {
                            var stateName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.stateName;
                            $scope.defaultState = _.filter(scope.states, function (state) {
                                return state.stateName === stateName;

                            });
                            $scope.formData.stateId = scope.defaultState[0].stateId;
                            $scope.districts = scope.defaultState[0].districtDatas;
                        }

                    }

                };

                $scope.changeCountry = function (countryId) {
                    if (countryId != null) {
                        $scope.selectCountry = _.filter($scope.countries, function (country) {
                            return country.countryId == countryId;
                        })
                        if ($scope.formData.stateId) {
                            delete $scope.formData.stateId;
                        }
                        if ($scope.formData.districtId) {
                            delete $scope.formData.districtId;
                        }
                        if ($scope.formData.talukaId) {
                            delete $scope.formData.talukaId;
                        }

                        $scope.states = $scope.selectCountry[0].statesDatas;
                    }
                }

                $scope.changeState = function (stateId) {
                    if (stateId != null) {
                        $scope.selectState = _.filter($scope.states, function (state) {
                            return state.stateId == stateId;
                        })
                        if ($scope.formData.districtId) {
                            delete scope.formData.districtId;
                        }
                        if ($scope.formData.talukaId) {
                            delete scope.formData.talukaId;
                        }
                        $scope.districts = $scope.selectState[0].districtDatas;
                    }
                }

                $scope.changeDistrict = function (districtId) {
                    if (districtId != null) {
                        $scope.selectDistrict = _.filter($scope.districts, function (districts) {
                            return districts.districtId == districtId;
                        })

                        if ($scope.formData.talukaId) {
                            delete $scope.formData.talukaId;
                        }
                        $scope.talukas = $scope.selectDistrict[0].talukaDatas;
                    }
                }


                $scope.changeVillage = function () {
                    if ($scope.formData.villageId != null && $scope.formData.villageId != undefined) {
                        if ($scope.formData.districtId) {
                            delete $scope.formData.districtId;
                        }
                        if ($scope.formData.talukaId) {
                            delete $scope.formData.talukaId;
                        }
                        $scope.formData.villageTown = null;
                        $scope.talukas = null;
                        $scope.formData.postalCode = null;
                        $scope.districts = null;
                        resourceFactory.villageResource.get({ villageId: $scope.formData.villageId }, function (response) {
                            if (response.addressData.length > 0) {
                                if (response.villageName) {
                                    $scope.formData.villageTown = response.villageName;
                                }
                                if (response.addressData[0].countryData) {
                                    $scope.formData.countryId = response.addressData[0].countryData.countryId;
                                    scope.changeCountry($scope.formData.countryId)
                                }
                                if (response.addressData[0].stateData) {
                                    $scope.formData.stateId = response.addressData[0].stateData.stateId;
                                    scope.changeState($scope.formData.stateId);
                                }
                                if (response.addressData[0].districtData) {
                                    $scope.formData.districtId = response.addressData[0].districtData.districtId;
                                    scope.changeDistrict($scope.formData.districtId);
                                }

                                if (response.addressData[0].talukaData) {
                                    $scope.formData.talukaId = response.addressData[0].talukaData.talukaId;
                                }
                                if (response.addressData[0].postalCode) {
                                    $scope.formData.postalCode = response.addressData[0].postalCode;
                                }
                            }

                        });
                    }
                }




                function getClientData() {
                    resourceFactory.clientResource.get({ clientId: $scope.clientId, associations: 'hierarchyLookup' }, function (data) {
                        $scope.clientDetails = data;
                        if (scope.clientDetails.lastname != undefined) {
                            scope.clientDetails.displayNameInReverseOrder = scope.clientDetails.lastname.concat(" ");
                        }
                        if (scope.clientDetails.middlename != undefined) {
                            scope.clientDetails.displayNameInReverseOrder = scope.clientDetails.displayNameInReverseOrder.concat(scope.client.middlename).concat(" ");
                        }
                        if (scope.clientDetails.firstname != undefined) {
                            scope.clientDetails.displayNameInReverseOrder = scope.clientDetails.displayNameInReverseOrder.concat(scope.client.firstname);
                        }
                    });
                }
                getClientData();


                $scope.entityAddressLoaded = false;
                $scope.fetchEntityAddress = function () {
                    if (!$scope.entityAddressLoaded) {
                        resourceFactory.addressDataResource.getAll({
                            entityType: "clients",
                            entityId: $scope.clientId
                        }, function (response) {
                            if (response != null) {
                                $scope.addressData = response;
                            }
                        });
                        $scope.entityAddressLoaded = true;
                    }
                }

                $scope.loadNewAdressForm = function () {
                    $scope.showaddressform = !$scope.showaddressform;
                    $scope.addressType = [];
                    $scope.countrys = [];
                    $scope.states = [];
                    $scope.districts = [];
                    $scope.talukas = [];
                    $scope.formData = {};
                    $scope.formDataList = [$scope.formData];
                    $scope.formData.addressTypes = [];
                    var villageConfig = 'populate_client_address_from_villages';
                    $scope.isPopulateClientAddressFromVillages = scope.isSystemGlobalConfigurationEnabled(villageConfig);
                    $scope.isAddressTypeMandatory = false;
                    $scope.isCountryReadOnly = false;
                    $scope.pincode = false;
                    $scope.isVillageTownMandatory = false;
                    $scope.isCountryReadOnly = false;
                    $scope.isAddressTypeMandatory = false;
                    if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient.isMandatoryField.addressType) {
                        $scope.isAddressTypeMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.addressType;
                    }
                    if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.defaultGISConfig.isReadOnlyField.countryName) {
                        $scope.isCountryReadOnly = scope.response.uiDisplayConfigurations.defaultGISConfig.isReadOnlyField.countryName;
                    }
                    if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient.isHiddenField.pincode) {
                        $scope.pincode = scope.response.uiDisplayConfigurations.createClient.isHiddenField.pincode;
                    }
                    if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient.isMandatoryField.villageTown) {
                        $scope.isVillageTownMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.villageTown;
                    }
                    if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.defaultGISConfig.isReadOnlyField.countryName) {
                        $scope.isCountryReadOnly = scope.response.uiDisplayConfigurations.defaultGISConfig.isReadOnlyField.countryName;
                    }
                    if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient.isMandatoryField.addressType) {
                        $scope.isAddressTypeMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.addressType;
                    }
                    resourceFactory.addressTemplateResource.get({}, function (data) {
                        $scope.addressType = data.addressTypeOptions;
                        $scope.countries = data.countryDatas;
                        $scope.setDefaultGISConfig();
                    });

                    resourceFactory.villageResource.getAllVillages({ officeId: routeParams.officeId, limit: 1000 }, function (data) {
                        $scope.villages = data;
                    });
                }

                $scope.submit = function () {

                    $scope.entityType = "clients";
                    $scope.formData.locale = scope.optlang.code;
                    $scope.formData.dateFormat = scope.df;

                    if ($scope.formData.countryId == null || $scope.formData.countryId == "") {
                        delete $scope.formData.countryId;
                    }
                    if ($scope.formData.stateId == null || $scope.formData.stateId == "") {
                        delete $scope.formData.stateId;
                    }
                    if ($scope.formData.districtId == null || $scope.formData.districtId == "") {
                        delete $scope.formData.districtId;
                    }
                    if ($scope.formData.talukaId == null || $scope.formData.talukaId == "") {
                        delete $scope.formData.talukaId;
                    }
                    if ($scope.formData.addressTypes == null || $scope.formData.addressTypes == "") {
                        delete $scope.formData.addressTypes;
                    }
                    if ($scope.formData.houseNo == null || $scope.formData.houseNo == "") {
                        delete $scope.formData.houseNo;
                    }
                    if ($scope.formData.addressLineOne == null || $scope.formData.addressLineOne == "") {
                        delete $scope.formData.addressLineOne;
                    }
                    resourceFactory.addressResource.create({ entityType: $scope.entityType, entityId: $scope.clientId }, { addresses: $scope.formDataList }, function (data) {
                        $scope.showaddressform = false;
                        resourceFactory.addressDataResource.getAll({ entityType: "clients", entityId: $scope.clientId }, function (response) {
                            if (response != null) {
                                $scope.addressData = response;
                            }
                        });
                    });
                };

                $scope.closeAddressForm = function () {
                    $scope.showaddressform = false;
                }

                //client identities related

                $scope.clientIdentityDocumentsLoaded = false;
                $scope.getClientIdentityDocuments = function () {
                    if (!$scope.clientIdentityDocumentsLoaded) {
                        resourceFactory.clientResource.getAllClientDocuments({
                            clientId: $scope.clientId,
                            anotherresource: 'identifiers'
                        }, function (data) {
                            $scope.identitydocuments = data;
                            for (var i = 0; i < $scope.identitydocuments.length; i++) {
                                resourceFactory.clientIdentifierResource.get({ clientIdentityId: $scope.identitydocuments[i].id }, function (data) {
                                    for (var j = 0; j < $scope.identitydocuments.length; j++) {
                                        if (data.length > 0 && $scope.identitydocuments[j].id == data[0].parentEntityId) {
                                            for (var l in data) {

                                                var loandocs = {};
                                                loandocs = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment?';
                                                data[l].docUrl = loandocs;
                                            }
                                            $scope.identitydocuments[j].documents = data;
                                        }
                                    }
                                });
                            }
                        });
                        $scope.clientIdentityDocumentsLoaded = true;
                    }
                };


                $scope.loadIdentitiesForm = function () {
                    $scope.shownidentityform = true;

                    $scope.identityFormData = {};
                    $scope.first = {};
                    $scope.documenttypes = [];
                    $scope.statusTypes = [];
                    resourceFactory.clientIdenfierTemplateResource.get({ clientId: $scope.clientId }, function (data) {
                        $scope.documenttypes = data.allowedDocumentTypes;
                        $scope.identityFormData.documentTypeId = data.allowedDocumentTypes[0].id;
                        $scope.statusTypes = data.clientIdentifierStatusOptions;
                        if (data.clientIdentifierStatusOptions && scope.response &&
                            scope.response.uiDisplayConfigurations.clientIdentifier.hiddenFields.status) {
                            $scope.identityFormData.status = data.clientIdentifierStatusOptions[1].id;
                        }
                    });

                }

                $scope.submitIdentitfyForm = function () {
                    $scope.identityFormData.locale = scope.optlang.code;
                    $scope.identityFormData.dateFormat = scope.df;
                    if ($scope.first.documentIssueDate) {
                        $scope.identityFormData.documentIssueDate = dateFilter($scope.first.documentIssueDate, scope.df);
                    }
                    if ($scope.first.documentExpiryDate) {
                        $scope.identityFormData.documentExpiryDate = dateFilter($scope.first.documentExpiryDate, scope.df);
                    }
                    resourceFactory.clientIdenfierResource.save({ clientId: $scope.clientId }, $scope.identityFormData, function (data) {
                        $scope.shownidentityform = false;
                        $scope.getClientIdentityDocuments();
                    });
                };

                $scope.closeIdentityForm = function () {
                    $scope.shownidentityform = false;
                }

                $scope.uploadClientDocumentIdentifier = function (clientIdentifierId) {
                    $scope.shownUploadIdentifierDocumentForm = true;
                    $scope.shownidentityform = false;
                    $scope.clientIdentifierId = clientIdentifierId;
                    $scope.documentFormData = {};

                }

                $scope.onFileSelect = function ($files) {
                    $scope.file = $files[0];
                };

                $scope.uploadDocument = function () {
                    $upload.upload({
                        url: $rootScope.hostUrl + API_VERSION + '/client_identifiers/' + $scope.clientIdentifierId + '/documents',
                        data: $scope.documentFormData,
                        file: $scope.file
                    }).then(function (data) {
                        $scope.shownUploadIdentifierDocumentForm = false;
                        $scope.getClientIdentityDocuments();
                    });
                };

                $scope.closeDocumentUploadForm = function () {
                    $scope.shownUploadIdentifierDocumentForm = false;
                }

                var viewDocumentCtrl = function ($scope, $modalInstance, documentDetail) {
                    $scope.data = documentDetail;
                    $scope.close = function () {
                        $modalInstance.close('close');
                    };
                };

                $scope.openViewDocument = function (documentDetail) {
                    $modal.open({
                        templateUrl: 'viewDocument.html',
                        controller: viewDocumentCtrl,
                        resolve: {
                            documentDetail: function () {
                                return documentDetail;
                            }
                        }
                    });
                };

                $scope.download = function (docUrl) {
                    var url = $rootScope.hostUrl + docUrl + CommonUtilService.commonParamsForNewWindow();
                    window.open(url);
                }

                $scope.familyDetailsLoaded = false;
                $scope.getFamilyDetails = function () {
                    if (!$scope.familyDetailsLoaded) {
                        resourceFactory.familyDetails.getAll({ clientId: $scope.clientId }, function (data) {
                            $scope.familyMembers = data;
                        });
                        $scope.familyDetailsLoaded = true;
                    }
                };

                $scope.familyMembersForm = function () {
                    $scope.shownFamilyMembersForm = true;
                    $scope.salutationOptions = [];
                    $scope.relationshipOptions = [];
                    $scope.genderOptions = [];
                    $scope.educationOptions = [];
                    $scope.occupationOptions = [];
                    $scope.subOccupations = [];
                    $scope.isExisitingClient = false;
                    $scope.familyMembersFormData = {};


                    resourceFactory.familyDetailsTemplate.get({ clientId: $scope.clientId }, function (data) {
                        $scope.salutationOptions = data.salutationOptions;
                        $scope.relationshipOptions = data.relationshipOptions;
                        $scope.genderOptions = data.genderOptions;
                        $scope.educationOptions = data.educationOptions;
                        $scope.occupationOptions = data.occupationOptions;
                    });

                }

                $scope.submitFamilyMembers = function () {
                    $scope.familyMembersFormData.dateFormat = scope.df;
                    $scope.familyMembersFormData.locale = scope.optlang.code;
                    resourceFactory.familyDetails.save({ clientId: $scope.clientId }, $scope.familyMembersFormData, function (data) {
                        $scope.shownFamilyMembersForm = false;
                        $scope.getFamilyDetails();
                    });
                };

                $scope.closeFamilyMembersForm = function () {
                    $scope.shownFamilyMembersForm = false;
                }


            }


        }
    });
    mifosX.ng.application.controller('PreliminaryGroupFormationActivityController', ['$controller', '$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter', 'ngXml2json', '$route', '$http', '$rootScope', '$sce', 'CommonUtilService', '$route', '$upload', 'API_VERSION', mifosX.controllers.PreliminaryGroupFormationActivityController]).run(function ($log) {
        $log.info("PreliminaryGroupFormationActivityController initialized");
    });
}(mifosX.controllers || {}));