(function(module) {
    mifosX.controllers = _.extend(module, {
        CGTBasicActivityController: function($controller, scope, routeParams, $modal, resourceFactory, location, dateFilter, ngXml2json, route, $http, $rootScope, $sce, CommonUtilService, $route, $upload, API_VERSION, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', {
                $scope: scope
            }));

            scope.loanIds = [];
            scope.first = {};
            scope.first.date = new Date();
            scope.formData = {};

            function initTask() {
                scope.centerId = scope.taskconfig.centerId;
                resourceFactory.centerWorkflowResource.get({
                    centerId: scope.centerId,
                    associations: 'groupMembers,profileratings,loanaccounts'
                }, function(data) {
                    scope.centerDetails = data;
                });

            };
            initTask();

            scope.generateDocument = function(document) {
                resourceFactory.documentsGenerateResource.generate({
                    entityType: scope.entityType,
                    entityId: scope.entityId,
                    identifier: document.reportIdentifier
                }, function(data) {
                    document.id = data.resourceId;
                    var loandocs = {};
                    loandocs = API_VERSION + '/' + document.parentEntityType + '/' + document.parentEntityId + '/documents/' + document.id + '/attachment?' + commonUtilService.commonParamsForNewWindow();
                    document.docUrl = loandocs;
                })
            };

            scope.addLoan = function(value, loanId) {
                if (value) {
                    scope.loanIds.push(loanId);
                } else {
                    var indexOfLoanId = scope.loanIds.indexOf(loanId);
                    if (indexOfLoanId >= 0) {
                        scope.loanIds.splice(indexOfLoanId, 1);
                    }
                }

            };

            scope.submit = function() {
                var completedDate = dateFilter(scope.first.date, scope.df);
                this.formData.dateFormat = scope.df;
                this.formData.locale = scope.optlang.code;
                this.formData.loanAccounts = scope.loanIds;
                this.completedDate = completedDate;

                resourceFactory.cgtBasicActivityResource.persistCgtCompletionDate(this.formData, function(data) {

                });
            };

            scope.viewMemberDetails = function(groupId, activeClientMember) {
                $modal.open({
                    templateUrl: 'views/task/popup/viewmember.html',
                    controller: ViewMemberCtrl,
                    windowClass: 'app-modal-window',
                    size: 'lg',
                    resolve: {
                        memberParams: function() {
                            return {
                                'groupId': groupId,
                                'activeClientMember': activeClientMember
                            };
                        }
                    }
                });
            }

            var ViewMemberCtrl = function($scope, $modalInstance, memberParams) {
                $scope.clientId = memberParams.activeClientMember.id;
                $scope.groupId = memberParams.groupId;
                $scope.showaddressform = false;
                $scope.shownidentityform = false;
                $scope.shownFamilyMembersForm = false;
                $scope.showLoanAccountForm = false;
                $scope.isLoanAccountExist = false;

                //loan account
                if (memberParams.activeClientMember.loanAccountBasicData) {
                    $scope.loanAccountData = memberParams.activeClientMember.loanAccountBasicData;
                    $scope.isLoanAccountExist = true;
                }
                $scope.setDefaultGISConfig = function() {
                    if (scope.responseDefaultGisData && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address) {
                        if (scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.countryName) {

                            var countryName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.countryName;
                            $scope.defaultCountry = _.filter($scope.countries, function(country) {
                                return country.countryName === countryName;

                            });
                            $scope.formData.countryId = $scope.defaultCountry[0].countryId;
                            $scope.states = $scope.defaultCountry[0].statesDatas;
                        }

                        if ($scope.states && $scope.states.length > 0 && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.stateName) {
                            var stateName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.stateName;
                            $scope.defaultState = _.filter(scope.states, function(state) {
                                return state.stateName === stateName;

                            });
                            $scope.formData.stateId = scope.defaultState[0].stateId;
                            $scope.districts = scope.defaultState[0].districtDatas;
                        }

                    }

                };

                $scope.changeCountry = function(countryId) {
                    if (countryId != null) {
                        $scope.selectCountry = _.filter($scope.countries, function(country) {
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

                $scope.changeState = function(stateId) {
                    if (stateId != null) {
                        $scope.selectState = _.filter($scope.states, function(state) {
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

                $scope.changeDistrict = function(districtId) {
                    if (districtId != null) {
                        $scope.selectDistrict = _.filter($scope.districts, function(districts) {
                            return districts.districtId == districtId;
                        })

                        if ($scope.formData.talukaId) {
                            delete $scope.formData.talukaId;
                        }
                        $scope.talukas = $scope.selectDistrict[0].talukaDatas;
                    }
                }

                $scope.changeVillage = function() {
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
                        resourceFactory.villageResource.get({
                            villageId: $scope.formData.villageId
                        }, function(response) {
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
                    resourceFactory.clientResource.get({
                        clientId: $scope.clientId,
                        associations: 'hierarchyLookup'
                    }, function(data) {
                        $scope.clientDetails = data;
                        if ($scope.clientDetails.lastname != undefined) {
                            $scope.clientDetails.displayNameInReverseOrder = $scope.clientDetails.lastname.concat(" ");
                        }
                        if ($scope.clientDetails.middlename != undefined) {
                            $scope.clientDetails.displayNameInReverseOrder = $scope.clientDetails.displayNameInReverseOrder.concat($scope.clientDetails.middlename).concat(" ");
                        }
                        if ($scope.clientDetails.firstname != undefined) {
                            $scope.clientDetails.displayNameInReverseOrder = $scope.clientDetails.displayNameInReverseOrder.concat($scope.clientDetails.firstname);
                        }
                    });
                }
                getClientData();

                function getprofileRating() {
                    resourceFactory.profileRating.get({
                        entityType: 1,
                        entityId: scope.clientId
                    }, function(data) {
                        scope.profileRatingData = data;
                    });
                };
                getprofileRating();

                $scope.entityAddressLoaded = false;
                $scope.fetchEntityAddress = function() {
                    if (!$scope.entityAddressLoaded) {
                        resourceFactory.addressDataResource.getAll({
                            entityType: "clients",
                            entityId: $scope.clientId
                        }, function(response) {
                            if (response != null) {
                                $scope.addressData = response;
                            }
                        });
                        $scope.entityAddressLoaded = true;
                    }
                }

                $scope.loadNewAdressForm = function() {
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
                    resourceFactory.addressTemplateResource.get({}, function(data) {
                        $scope.addressType = data.addressTypeOptions;
                        $scope.countries = data.countryDatas;
                        $scope.setDefaultGISConfig();
                    });

                    resourceFactory.villageResource.getAllVillages({
                        officeId: routeParams.officeId,
                        limit: 1000
                    }, function(data) {
                        $scope.villages = data;
                    });
                }

                $scope.submit = function() {

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
                    resourceFactory.addressResource.create({
                        entityType: $scope.entityType,
                        entityId: $scope.clientId
                    }, {
                        addresses: $scope.formDataList
                    }, function(data) {
                        $scope.showaddressform = false;
                        resourceFactory.addressDataResource.getAll({
                            entityType: "clients",
                            entityId: $scope.clientId
                        }, function(response) {
                            if (response != null) {
                                $scope.addressData = response;
                            }
                        });
                    });
                };

                $scope.closeAddressForm = function() {
                    $scope.showaddressform = false;
                }

                //client identities related

                $scope.clientIdentityDocumentsLoaded = false;
                $scope.getClientIdentityDocuments = function() {
                    if (!$scope.clientIdentityDocumentsLoaded) {
                        resourceFactory.clientResource.getAllClientDocuments({
                            clientId: $scope.clientId,
                            anotherresource: 'identifiers'
                        }, function(data) {
                            $scope.identitydocuments = data;
                            for (var i = 0; i < $scope.identitydocuments.length; i++) {
                                resourceFactory.clientIdentifierResource.get({
                                    clientIdentityId: $scope.identitydocuments[i].id
                                }, function(data) {
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

                $scope.loadIdentitiesForm = function() {
                    $scope.shownidentityform = true;

                    $scope.identityFormData = {};
                    $scope.first = {};
                    $scope.documenttypes = [];
                    $scope.statusTypes = [];
                    resourceFactory.clientIdenfierTemplateResource.get({
                        clientId: $scope.clientId
                    }, function(data) {
                        $scope.documenttypes = data.allowedDocumentTypes;
                        $scope.identityFormData.documentTypeId = data.allowedDocumentTypes[0].id;
                        $scope.statusTypes = data.clientIdentifierStatusOptions;
                        if (data.clientIdentifierStatusOptions && scope.response &&
                            scope.response.uiDisplayConfigurations.clientIdentifier.hiddenFields.status) {
                            $scope.identityFormData.status = data.clientIdentifierStatusOptions[1].id;
                        }
                    });

                }

                $scope.submitIdentitfyForm = function() {
                    $scope.identityFormData.locale = scope.optlang.code;
                    $scope.identityFormData.dateFormat = scope.df;
                    if ($scope.first.documentIssueDate) {
                        $scope.identityFormData.documentIssueDate = dateFilter($scope.first.documentIssueDate, scope.df);
                    }
                    if ($scope.first.documentExpiryDate) {
                        $scope.identityFormData.documentExpiryDate = dateFilter($scope.first.documentExpiryDate, scope.df);
                    }
                    resourceFactory.clientIdenfierResource.save({
                        clientId: $scope.clientId
                    }, $scope.identityFormData, function(data) {
                        $scope.shownidentityform = false;
                        $scope.getClientIdentityDocuments();
                    });
                };

                $scope.closeIdentityForm = function() {
                    $scope.shownidentityform = false;
                }

                $scope.uploadClientDocumentIdentifier = function(clientIdentifierId) {
                    $scope.shownUploadIdentifierDocumentForm = true;
                    $scope.shownidentityform = false;
                    $scope.clientIdentifierId = clientIdentifierId;
                    $scope.documentFormData = {};

                }

                $scope.onFileSelect = function($files) {
                    $scope.file = $files[0];
                };

                $scope.uploadDocument = function() {
                    $upload.upload({
                        url: $rootScope.hostUrl + API_VERSION + '/client_identifiers/' + $scope.clientIdentifierId + '/documents',
                        data: $scope.documentFormData,
                        file: $scope.file
                    }).then(function(data) {
                        $scope.shownUploadIdentifierDocumentForm = false;
                        $scope.getClientIdentityDocuments();
                    });
                };

                $scope.closeDocumentUploadForm = function() {
                    $scope.shownUploadIdentifierDocumentForm = false;
                }

                var viewDocumentCtrl = function($scope, $modalInstance, documentDetail) {
                    $scope.data = documentDetail;
                    $scope.close = function() {
                        $modalInstance.close('close');
                    };
                };

                $scope.openViewDocument = function(documentDetail) {
                    $modal.open({
                        templateUrl: 'viewDocument.html',
                        controller: viewDocumentCtrl,
                        resolve: {
                            documentDetail: function() {
                                return documentDetail;
                            }
                        }
                    });
                };

                $scope.download = function(docUrl) {
                    var url = $rootScope.hostUrl + docUrl + CommonUtilService.commonParamsForNewWindow();
                    window.open(url);
                }

                $scope.familyDetailsLoaded = false;
                $scope.getFamilyDetails = function() {
                    if (!$scope.familyDetailsLoaded) {
                        resourceFactory.familyDetails.getAll({
                            clientId: $scope.clientId
                        }, function(data) {
                            $scope.familyMembers = data;
                        });
                        $scope.familyDetailsLoaded = true;
                    }
                };

                $scope.familyMembersForm = function() {
                    $scope.shownFamilyMembersForm = true;
                    $scope.salutationOptions = [];
                    $scope.relationshipOptions = [];
                    $scope.genderOptions = [];
                    $scope.educationOptions = [];
                    $scope.occupationOptions = [];
                    $scope.subOccupations = [];
                    $scope.isExisitingClient = false;
                    $scope.familyMembersFormData = {};

                    resourceFactory.familyDetailsTemplate.get({
                        clientId: $scope.clientId
                    }, function(data) {
                        $scope.salutationOptions = data.salutationOptions;
                        $scope.relationshipOptions = data.relationshipOptions;
                        $scope.genderOptions = data.genderOptions;
                        $scope.educationOptions = data.educationOptions;
                        $scope.occupationOptions = data.occupationOptions;
                    });

                }

                $scope.submitFamilyMembers = function() {
                    $scope.familyMembersFormData.dateFormat = scope.df;
                    $scope.familyMembersFormData.locale = scope.optlang.code;
                    resourceFactory.familyDetails.save({
                        clientId: $scope.clientId
                    }, $scope.familyMembersFormData, function(data) {
                        $scope.shownFamilyMembersForm = false;
                        $scope.getFamilyDetails();
                    });
                };

                $scope.closeFamilyMembersForm = function() {
                    $scope.shownFamilyMembersForm = false;
                }

                //loan account

                $scope.getLoanAccountFormDetails = function() {
                    $scope.showLoanAccountForm = true;
                    $scope.clientId = $scope.clientId;
                    $scope.groupId = $scope.groupId;
                    $scope.restrictDate = new Date();
                    $scope.loanAccountFormData = {};
                    $scope.temp = {};
                    $scope.chargeFormData = {}; //For charges
                    $scope.date = {};
                    $scope.loanAccountFormData.isSubsidyApplicable = false;
                    $scope.repeatsOnDayOfMonthOptions = [];
                    $scope.selectedOnDayOfMonthOptions = [];
                    $scope.slabBasedCharge = "Slab Based";
                    $scope.flatCharge = "Flat";
                    $scope.upfrontFee = "Upfront Fee";
                    $scope.interestRatesListPerPeriod = [];
                    $scope.interestRatesListAvailable = false;
                    $scope.isCenter = false;
                    $scope.installmentAmountSlabChargeType = 1;
                    $scope.showIsDeferPaymentsForHalfTheLoanTerm = scope.response.uiDisplayConfigurations.loanAccount.isShowField.isDeferPaymentsForHalfTheLoanTerm;
                    var SLAB_BASED = 'slabBasedCharge';
                    var UPFRONT_FEE = 'upfrontFee';
                    $scope.paymentModeOptions = [];
                    $scope.repaymentTypeOption = [];
                    $scope.disbursementTypeOption = [];
                    $scope.applicableOnRepayment = 1;
                    $scope.applicableOnDisbursement = 2;
                    $scope.canDisburseToGroupBankAccounts = false;
                    $scope.allowBankAccountsForGroups = scope.isSystemGlobalConfigurationEnabled('allow-bank-account-for-groups');
                    $scope.allowDisbursalToGroupBankAccounts = scope.isSystemGlobalConfigurationEnabled('allow-multiple-bank-disbursal');
                    $scope.parentGroups = [];

                    for (var i = 1; i <= 28; i++) {
                        $scope.repeatsOnDayOfMonthOptions.push(i);
                    }

                    $scope.date.first = new Date(); //submittedOnDate
                    $scope.date.second = new Date(); //expectedDisbursementDate
                    $scope.inparams = {
                        resourceType: 'template',
                        activeOnly: 'true'
                    };
                    $scope.inparams.clientId = $scope.clientId;
                    $scope.loanAccountFormData.clientId = $scope.clientId;
                    $scope.inparams.groupId = $scope.groupId;
                    $scope.loanAccountFormData.groupId = $scope.groupId;
                    $scope.inparams.templateType = 'jlg';
                    $scope.inparams.staffInSelectedOfficeOnly = true;
                    $scope.inparams.productApplicableForLoanType = 2;
                    $scope.inparams.entityType = 1;
                    $scope.inparams.entityId = $scope.clientId;

                    if (scope.response && scope.response.uiDisplayConfigurations.loanAccount) {

                        $scope.showExternalId = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.externalId;
                        $scope.extenalIdReadOnlyType = scope.response.uiDisplayConfigurations.loanAccount.isReadOnlyField.externalId;
                        $scope.showRepaymentFrequencyNthDayType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.repaymentFrequencyNthDayType;
                        $scope.showRepaymentFrequencyDayOfWeekType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.repaymentFrequencyDayOfWeekType;
                        $scope.showBrokenPeriodType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.brokenPeriodMethodType;
                    }

                    resourceFactory.loanResource.get($scope.inparams, function(data) {
                        $scope.paymentModeOptions = data.paymentModeOptions;
                        $scope.products = data.productOptions;
                        if (data.interestRatesListPerPeriod != undefined && data.interestRatesListPerPeriod.length > 0) {
                            $scope.interestRatesListPerPeriod = data.interestRatesListPerPeriod;
                            $scope.interestRatesListAvailable = true;
                        }
                    });
                }

                $scope.updateSlabBasedChargeForEmiPack = function(principal) {
                    if (principal) {
                        $scope.loanAccountFormData.principal = principal;
                        $scope.updateSlabBasedAmountOnChangePrincipalOrRepayment();
                    }
                }

                $scope.updateSlabBasedAmountOnChangePrincipalOrRepaymentForEmiPack = function() {
                    if ($scope.loanAccountFormData.loanEMIPackId != undefined) {
                        for (var i in $scope.loanaccountinfo.loanEMIPacks) {
                            if ($scope.loanaccountinfo.loanEMIPacks[i].id == $scope.loanAccountFormData.loanEMIPackId) {
                                var loanAmountRequested = $scope.loanaccountinfo.loanEMIPacks[i].sanctionAmount;
                                var numberOfRepayments = $scope.loanaccountinfo.loanEMIPacks[i].numberOfRepayments;
                                $scope.updateSlabBasedAmountChargeAmount(loanAmountRequested, numberOfRepayments);
                                break;
                            }
                        }
                    }
                }

                $scope.updateSlabBasedAmountChargeAmount = function(loanAmountRequested, numberOfRepayments) {
                    if (loanAmountRequested != '' && loanAmountRequested != undefined && numberOfRepayments != '' && numberOfRepayments != undefined) {
                        for (var i in $scope.charges) {
                            if ($scope.charges[i].chargeCalculationType.value == $scope.slabBasedCharge && $scope.charges[i].slabs.length > 0) {
                                for (var j in $scope.charges[i].slabs) {
                                    var slabBasedValue = $scope.getSlabBasedAmount($scope.charges[i].slabs[j], loanAmountRequested, numberOfRepayments);
                                    if (slabBasedValue != null) {
                                        $scope.charges[i].amount = slabBasedValue;
                                        break;
                                    } else {
                                        $scope.charges[i].amount = undefined;
                                    }
                                }
                            }
                        }
                    }
                }

                $scope.loanProductChange = function(loanProductId) {
                    $scope.inparams.productId = loanProductId;
                    $scope.interestRatesListPerPeriod = [];
                    $scope.interestRatesListAvailable = false;
                    $scope.inparams.fetchRDAccountOnly = scope.response.uiDisplayConfigurations.loanAccount.savingsAccountLinkage.reStrictLinkingToRDAccount;
                    resourceFactory.loanResource.get($scope.inparams, function(data) {
                        $scope.loanaccountinfo = data;
                        $scope.previewClientLoanAccInfo();
                        $scope.canDisburseToGroupBankAccounts = data.product.allowDisbursementToGroupBankAccounts;
                        $scope.productLoanCharges = data.product.charges || [];
                        if ($scope.productLoanCharges && $scope.productLoanCharges.length > 0) {
                            for (var i in $scope.productLoanCharges) {
                                if ($scope.productLoanCharges[i].chargeData) {
                                    for (var j in $scope.loanaccountinfo.chargeOptions) {
                                        if ($scope.productLoanCharges[i].chargeData.id == $scope.loanaccountinfo.chargeOptions[j].id) {
                                            var charge = $scope.productLoanCharges[i].chargeData;
                                            charge.chargeId = charge.id;
                                            charge.isMandatory = $scope.productLoanCharges[i].isMandatory;
                                            charge.isAmountNonEditable = $scope.productLoanCharges[i].isAmountNonEditable;
                                            if (charge.chargeCalculationType.value == $scope.slabBasedCharge && charge.slabs.length > 0) {
                                                for (var i in charge.slabs) {
                                                    var slabBasedValue = $scope.getSlabBasedAmount(charge.slabs[i], $scope.loanAccountFormData.principal, $scope.loanAccountFormData.numberOfRepayments);
                                                    if (slabBasedValue != null) {
                                                        charge.amount = slabBasedValue;
                                                    }
                                                }
                                            }
                                            $scope.charges.push(charge);
                                            break;
                                        }
                                    }
                                }
                            }
                        }

                        if ($scope.loanaccountinfo.loanOfficerOptions != undefined && $scope.loanaccountinfo.loanOfficerOptions.length > 0 && !$scope.loanAccountFormData.loanOfficerId) {
                            resourceFactory.clientResource.get({
                                clientId: $scope.clientId
                            }, function(data) {
                                if (data.staffId != null) {
                                    for (var i in $scope.loanaccountinfo.loanOfficerOptions) {
                                        if ($scope.loanaccountinfo.loanOfficerOptions[i].id == data.staffId) {
                                            $scope.loanAccountFormData.loanOfficerId = data.staffId;
                                            break;
                                        }
                                    }
                                }
                            })
                        }

                        if (data.interestRatesListPerPeriod != undefined && data.interestRatesListPerPeriod.length > 0) {
                            $scope.interestRatesListPerPeriod = data.interestRatesListPerPeriod;
                            $scope.interestRatesListAvailable = true;
                        }
                    });

                }

                $scope.inRange = function(min, max, value) {
                    return (value >= min && value <= max);
                };

                $scope.getSlabBasedAmount = function(slab, amount, repayment) {
                    var slabValue = 0;
                    slabValue = (slab.type.id == $scope.installmentAmountSlabChargeType) ? amount : repayment;
                    var subSlabvalue = 0;
                    subSlabvalue = (slab.type.id != $scope.installmentAmountSlabChargeType) ? amount : repayment;
                    //check for if value fall in slabs
                    if ($scope.inRange(slab.minValue, slab.maxValue, slabValue)) {

                        if (slab.subSlabs != undefined && slab.subSlabs.length > 0) {
                            for (var i in slab.subSlabs) {
                                //check for sub slabs range
                                if ($scope.inRange(slab.subSlabs[i].minValue, slab.subSlabs[i].maxValue, subSlabvalue)) {
                                    return slab.subSlabs[i].amount;
                                }
                            }

                        }
                        return slab.amount;
                    }
                    return null;

                };

                $scope.previewClientLoanAccInfo = function() {
                    $scope.previewRepayment = false;
                    $scope.charges = []; //scope.loanaccountinfo.charges || [];
                    $scope.loanAccountFormData.disbursementData = $scope.loanaccountinfo.disbursementDetails || [];

                    if ($scope.loanaccountinfo.calendarOptions) {
                        $scope.temp.syncRepaymentsWithMeeting = true;
                        if (scope.response && !scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.syncDisbursementWithMeeting) {
                            $scope.loanAccountFormData.syncDisbursementWithMeeting = false;
                        } else {
                            $scope.loanAccountFormData.syncDisbursementWithMeeting = true;
                        }

                    }
                    if (scope.response && scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.fundId != null) {
                        $scope.loanAccountFormData.fundId = scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.fundId;
                        if ($scope.loanaccountinfo.fundOptions) {
                            for (var i in $scope.loanaccountinfo.fundOptions) {
                                if ($scope.loanaccountinfo.fundOptions[i].id == scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.fundId) {
                                    $scope.loanAccountFormData.fundId = scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.fundId;
                                }
                            }
                        }
                    } else {
                        $scope.loanAccountFormData.fundId = $scope.loanaccountinfo.fundId;
                    }
                    $scope.loanAccountFormData.productId = $scope.loanaccountinfo.loanProductId;
                    $scope.loanAccountFormData.principal = $scope.loanaccountinfo.principal;
                    $scope.loanAccountFormData.loanTermFrequencyType = $scope.loanaccountinfo.termPeriodFrequencyType.id;
                    $scope.loanAccountFormData.numberOfRepayments = $scope.loanaccountinfo.numberOfRepayments;
                    $scope.loanAccountFormData.repaymentEvery = $scope.loanaccountinfo.repaymentEvery;
                    $scope.loanAccountFormData.repaymentFrequencyType = $scope.loanaccountinfo.repaymentFrequencyType.id;
                    $scope.loanAccountFormData.interestRatePerPeriod = $scope.loanaccountinfo.interestRatePerPeriod;
                    $scope.loanAccountFormData.amortizationType = $scope.loanaccountinfo.amortizationType.id;
                    $scope.loanAccountFormData.interestType = $scope.loanaccountinfo.interestType.id;
                    $scope.loanAccountFormData.interestCalculationPeriodType = $scope.loanaccountinfo.interestCalculationPeriodType.id;
                    $scope.loanAccountFormData.allowPartialPeriodInterestCalcualtion = $scope.loanaccountinfo.allowPartialPeriodInterestCalcualtion;
                    $scope.loanAccountFormData.inArrearsTolerance = $scope.loanaccountinfo.inArrearsTolerance;
                    $scope.loanAccountFormData.graceOnPrincipalPayment = $scope.loanaccountinfo.graceOnPrincipalPayment;
                    $scope.loanAccountFormData.recurringMoratoriumOnPrincipalPeriods = $scope.loanaccountinfo.recurringMoratoriumOnPrincipalPeriods;
                    $scope.loanAccountFormData.graceOnInterestPayment = $scope.loanaccountinfo.graceOnInterestPayment;
                    $scope.loanAccountFormData.graceOnArrearsAgeing = $scope.loanaccountinfo.graceOnArrearsAgeing;
                    $scope.loanAccountFormData.transactionProcessingStrategyId = $scope.loanaccountinfo.transactionProcessingStrategyId;
                    $scope.loanAccountFormData.graceOnInterestCharged = $scope.loanaccountinfo.graceOnInterestCharged;
                    $scope.loanAccountFormData.fixedEmiAmount = $scope.loanaccountinfo.fixedEmiAmount;
                    $scope.loanAccountFormData.maxOutstandingLoanBalance = $scope.loanaccountinfo.maxOutstandingLoanBalance;
                    $scope.loanAccountFormData.loanOfficerId = $scope.loanaccountinfo.loanOfficerId;
                    if ($scope.loanaccountinfo.brokenPeriodMethodType) {
                        $scope.loanAccountFormData.brokenPeriodMethodType = $scope.loanaccountinfo.brokenPeriodMethodType.id;
                    } else {
                        $scope.loanAccountFormData.brokenPeriodMethodType = "";
                    }

                    if ($scope.loanaccountinfo.isInterestRecalculationEnabled && $scope.loanaccountinfo.interestRecalculationData.recalculationRestFrequencyDate) {
                        $scope.date.recalculationRestFrequencyDate = new Date($scope.loanaccountinfo.interestRecalculationData.recalculationRestFrequencyDate);
                    }
                    if ($scope.loanaccountinfo.isInterestRecalculationEnabled && $scope.loanaccountinfo.interestRecalculationData.recalculationCompoundingFrequencyDate) {
                        $scope.date.recalculationCompoundingFrequencyDate = new Date($scope.loanaccountinfo.interestRecalculationData.recalculationCompoundingFrequencyDate);
                    }

                    if ($scope.loanaccountinfo.isLoanProductLinkedToFloatingRate) {
                        $scope.loanAccountFormData.isFloatingInterestRate = false;
                        $scope.loanAccountFormData.interestRateDifferential = $scope.loanaccountinfo.interestRateDifferential;
                    }
                    $scope.loanAccountFormData.collectInterestUpfront = $scope.loanaccountinfo.product.collectInterestUpfront;
                }

                $scope.newLoanAccountSubmit = function() {
                    // Make sure charges, overdue charges and collaterals are empty before initializing.
                    delete $scope.loanAccountFormData.charges;
                    var reqFirstDate = dateFilter($scope.date.first, scope.df);
                    var reqSecondDate = dateFilter($scope.date.second, scope.df);
                    var reqThirdDate = dateFilter($scope.date.third, scope.df);
                    var reqFourthDate = dateFilter($scope.date.fourth, scope.df);
                    var reqFifthDate = dateFilter($scope.date.fifth, scope.df);
                    $scope.loanAccountFormData.loanTermFrequency = $scope.loanTerm;
                    if ($scope.charges.length > 0) {
                        $scope.loanAccountFormData.charges = [];
                        for (var i in $scope.charges) {
                            if ($scope.charges[i].amount > 0) {
                                $scope.loanAccountFormData.charges.push({
                                    chargeId: $scope.charges[i].chargeId,
                                    amount: $scope.charges[i].amount,
                                    dueDate: dateFilter($scope.charges[i].dueDate, scope.df),
                                    upfrontChargesAmount: $scope.charges[i].glims
                                });
                            }
                        }
                    }

                    if ($scope.loanaccountinfo.overdueCharges && $scope.loanaccountinfo.overdueCharges.length > 0) {
                        $scope.loanAccountFormData.overdueCharges = [];
                        for (var i in $scope.loanaccountinfo.overdueCharges) {
                            if ($scope.loanaccountinfo.overdueCharges[i].chargeData.amount > 0) {
                                $scope.loanAccountFormData.overdueCharges.push({
                                    productChargeId: $scope.loanaccountinfo.overdueCharges[i].id,
                                    amount: $scope.loanaccountinfo.overdueCharges[i].chargeData.amount
                                });
                            }
                        }
                    }

                    if ($scope.loanAccountFormData.disbursementData.length > 0) {
                        for (var i in $scope.loanAccountFormData.disbursementData) {
                            $scope.loanAccountFormData.disbursementData[i].expectedDisbursementDate = dateFilter($scope.loanAccountFormData.disbursementData[i].expectedDisbursementDate, scope.df);
                        }
                    }

                    if ($scope.temp.syncRepaymentsWithMeeting) {
                        $scope.loanAccountFormData.calendarId = $scope.loanaccountinfo.calendarOptions[0].id;
                    }
                    $scope.loanAccountFormData.interestChargedFromDate = reqThirdDate;
                    $scope.loanAccountFormData.repaymentsStartingFromDate = reqFourthDate;
                    $scope.loanAccountFormData.locale = scope.optlang.code;
                    $scope.loanAccountFormData.dateFormat = scope.df;
                    $scope.loanAccountFormData.loanType = $scope.inparams.templateType;
                    $scope.loanAccountFormData.expectedDisbursementDate = reqSecondDate;
                    $scope.loanAccountFormData.submittedOnDate = reqFirstDate;
                    $scope.loanAccountFormData.recalculationRestFrequencyStartDate = dateFilter($scope.recalculationRestFrequencyStartDate, scope.df);
                    $scope.loanAccountFormData.recalculationCompoundingFrequencyStartDate = dateFilter($scope.recalculationCompoundingFrequencyStartDate, scope.df);

                    if ($scope.date.recalculationRestFrequencyDate) {
                        var restFrequencyDate = dateFilter($scope.date.recalculationRestFrequencyDate, scope.df);
                        $scope.loanAccountFormData.recalculationRestFrequencyDate = restFrequencyDate;
                    }
                    if ($scope.date.recalculationCompoundingFrequencyDate) {
                        var restFrequencyDate = dateFilter($scope.date.recalculationCompoundingFrequencyDate, scope.df);
                        $scope.loanAccountFormData.recalculationCompoundingFrequencyDate = restFrequencyDate;
                    }
                    if ($scope.loanAccountFormData.interestCalculationPeriodType == 0) {
                        $scope.loanAccountFormData.allowPartialPeriodInterestCalcualtion = false;
                    }
                    if ($scope.loanAccountFormData.repaymentFrequencyType == 2 && $scope.loanAccountFormData.repaymentFrequencyNthDayType) {
                        $scope.loanAccountFormData.repeatsOnDayOfMonth = $scope.selectedOnDayOfMonthOptions;
                    } else {
                        $scope.loanAccountFormData.repeatsOnDayOfMonth = [];
                    }

                    if (!$scope.loanaccountinfo.isLoanProductLinkedToFloatingRate) {
                        delete $scope.loanAccountFormData.interestRateDifferential;
                        delete $scope.loanAccountFormData.isFloatingInterestRate;
                    } else {
                        if ($scope.loanAccountFormData.interestRatePerPeriod != undefined) {
                            delete $scope.loanAccountFormData.interestRatePerPeriod;
                        }
                    }

                    resourceFactory.loanResource.save($scope.loanAccountFormData, function(data) {
                        $scope.showLoanAccountForm = false;
                        $scope.getClientAccounts();
                    });
                };

                if (scope.response && scope.response.uiDisplayConfigurations.loanAccount.isAutoPopulate.interestChargedFromDate) {
                    scope.$watch('date.second ', function() {
                        if ($scope.date.second != '' && $scope.date.second != undefined) {
                            $scope.date.third = $scope.date.second;
                        }
                    });
                }

                $scope.closeLoanAccountForm = function() {
                    $scope.showLoanAccountForm = false;
                }

                $scope.getCashFlow = function() {
                    $scope.showSummary = true;
                    $scope.showAddClientoccupationdetailsForm = false;
                    $scope.showEditClientoccupationdetailsForm = false;
                    $scope.showAddClientassetdetailsForm = false;
                    $scope.showEditClientassetdetailsForm = false;
                    $scope.showAddClienthouseholddetailsForm = false;
                    $scope.showEditClienthouseholddetailsForm = false;
                    $scope.totalIncome = 0;
                    refreshAndShowSummaryView();
                }

                function hideAll() {
                    $scope.showSummary = false;
                    $scope.showAddClientoccupationdetailsForm = false;
                    $scope.showEditClientoccupationdetailsForm = false;
                    $scope.showAddClientassetdetailsForm = false;
                    $scope.showEditClientassetdetailsForm = false;
                    $scope.showAddClienthouseholddetailsForm = false;
                    $scope.showEditClienthouseholddetailsForm = false;
                };

                function incomeAndexpense() {
                    resourceFactory.incomeExpenseAndHouseHoldExpense.getAll({
                        clientId: $scope.clientId
                    }, function(data) {
                        $scope.incomeAndExpenses = data;
                        $scope.totalIncomeOcc = $scope.calculateOccupationTotal();
                        $scope.totalIncomeAsset = $scope.calculateTotalAsset();
                        $scope.totalHouseholdExpense = $scope.calculateTotalExpense();
                        $scope.showSummaryView();
                    });
                };

                $scope.calculateOccupationTotal = function() {
                    var total = 0;
                    angular.forEach($scope.incomeAndExpenses, function(incomeExpense) {
                        if (!_.isUndefined(incomeExpense.incomeExpenseData.cashFlowCategoryData.categoryEnum) && incomeExpense.incomeExpenseData.cashFlowCategoryData.categoryEnum.id == 1) {
                            if (!_.isUndefined(incomeExpense.totalIncome) && !_.isNull(incomeExpense.totalIncome)) {
                                if (!_.isUndefined(incomeExpense.totalExpense) && !_.isNull(incomeExpense.totalExpense)) {
                                    total = total + incomeExpense.totalIncome - incomeExpense.totalExpense;
                                } else {
                                    total = total + incomeExpense.totalIncome;
                                }
                            }
                        }
                    });
                    return total;
                };

                $scope.calculateTotalAsset = function() {
                    var total = 0;
                    angular.forEach($scope.incomeAndExpenses, function(incomeExpense) {
                        if (!_.isUndefined(incomeExpense.incomeExpenseData.cashFlowCategoryData.categoryEnum) && incomeExpense.incomeExpenseData.cashFlowCategoryData.categoryEnum.id == 2) {
                            if (!_.isUndefined(incomeExpense.totalIncome) && !_.isNull(incomeExpense.totalIncome)) {
                                if (!_.isUndefined(incomeExpense.totalExpense) && !_.isNull(incomeExpense.totalExpense)) {
                                    total = total + incomeExpense.totalIncome - incomeExpense.totalExpense;
                                } else {
                                    total = total + incomeExpense.totalIncome;
                                }
                            }
                        }
                    });
                    return total;
                };

                $scope.updateTotalIncome = function(quantity, income) {
                    if ($scope.isQuantifierNeeded && quantity && income) {
                        $scope.totalIncome = parseFloat(quantity) * parseFloat(income);
                    } else {
                        $scope.totalIncome = undefined;
                    }
                };

                $scope.calculateTotalExpense = function() {
                    var total = 0;
                    angular.forEach($scope.incomeAndExpenses, function(incomeExpense) {
                        if (!_.isUndefined(incomeExpense.incomeExpenseData.cashFlowCategoryData.typeEnum) && incomeExpense.incomeExpenseData.cashFlowCategoryData.typeEnum.id == 2) {
                            if (!_.isUndefined(incomeExpense.totalExpense) && !_.isNull(incomeExpense.totalExpense)) {
                                total = total + incomeExpense.totalExpense;
                            }
                        }
                    });
                    return total;
                };

                $scope.showSummaryView = function() {
                    hideAll();
                    $scope.showSummary = true;
                };

                function refreshAndShowSummaryView() {
                    incomeAndexpense();
                };

                //edit

                $scope.editClientoccupationdetails = function(incomeExpenseId) {
                    hideAll();
                    $scope.showEditClientoccupationdetailsForm = true;
                    initEditClientoccupationdetails(incomeExpenseId);
                };

                $scope.editClientassetdetails = function(incomeExpenseId) {
                    hideAll();
                    $scope.showEditClientassetdetailsForm = true;
                    initEditClientoccupationdetails(incomeExpenseId);
                };

                $scope.editClienthouseholddetails = function(incomeExpenseId) {
                    hideAll();
                    $scope.showEditClienthouseholddetailsForm = true;
                    initEditClientoccupationdetails(incomeExpenseId);
                };

                function initEditClientoccupationdetails(incomeExpenseId) {
                    $scope.incomeAndExpenseId = incomeExpenseId;
                    $scope.formData = {};
                    $scope.formData.isMonthWiseIncome = false;
                    $scope.isQuantifierNeeded = false;

                    resourceFactory.cashFlowCategoryResource.getAll({
                        isFetchIncomeExpenseDatas: true
                    }, function(data) {
                        $scope.occupations = data;
                    });

                    resourceFactory.incomeExpenseAndHouseHoldExpense.get({
                        clientId: $scope.clientId,
                        incomeAndExpenseId: $scope.incomeAndExpenseId
                    }, function(data) {
                        angular.forEach($scope.occupations, function(occ) {
                            if (occ.id == data.incomeExpenseData.cashflowCategoryId) {
                                $scope.occupationOption = occ;
                            }
                        });
                        $scope.formData.incomeExpenseId = data.incomeExpenseData.id;
                        $scope.formData.quintity = data.quintity;
                        $scope.formData.totalIncome = data.defaultIncome;
                        $scope.formData.totalExpense = data.totalExpense;

                        $scope.formData.isPrimaryIncome = data.isPrimaryIncome;
                        $scope.formData.isRemmitanceIncome = data.isRemmitanceIncome;
                        $scope.isQuantifierNeeded = data.incomeExpenseData.isQuantifierNeeded;
                        if (scope.isQuantifierNeeded) {
                            $scope.updateTotalIncome($scope.formData.quintity, $scope.formData.totalIncome);
                        }
                        $scope.quantifierLabel = data.incomeExpenseData.quantifierLabel;
                    });
                };

                // create activity
                $scope.addClientoccupationdetails = function() {
                    hideAll();
                    $scope.showAddClientoccupationdetailsForm = true;
                    initAddClientoccupationdetails();
                };

                $scope.addClientassetdetails = function() {
                    hideAll();
                    $scope.showAddClientassetdetailsForm = true;
                    initAddClientoccupationdetails();
                };

                $scope.addClienthouseholddetails = function() {
                    hideAll();
                    $scope.showAddClienthouseholddetailsForm = true;
                    initAddClientoccupationdetails();
                };

                function initAddClientoccupationdetails() {
                    $scope.formData = {};
                    $scope.subOccupations = [];
                    $scope.formData.clientMonthWiseIncomeExpense = [];
                    $scope.formData.isMonthWiseIncome = false;
                    $scope.isQuantifierNeeded = false;
                    $scope.quantifierLabel = undefined;

                    resourceFactory.cashFlowCategoryResource.getAll({
                        isFetchIncomeExpenseDatas: true
                    }, function(data) {
                        $scope.occupations = data;
                    });
                };

                $scope.slectedOccupation = function(occupationId, subOccupationId) {
                    _.each($scope.occupations, function(occupation) {
                        if (occupation.id == occupationId) {
                            _.each(occupation.incomeExpenseDatas, function(iterate) {
                                if (iterate.cashflowCategoryId == occupationId && iterate.id == subOccupationId) {
                                    if (iterate.defaultIncome) {
                                        $scope.formData.totalIncome = iterate.defaultIncome;
                                    }
                                    if (iterate.defaultExpense) {
                                        $scope.formData.totalExpense = iterate.defaultExpense;
                                    }
                                    if (iterate.isQuantifierNeeded == true) {
                                        $scope.quantifierLabel = iterate.quantifierLabel;
                                        $scope.isQuantifierNeeded = iterate.isQuantifierNeeded;
                                    }
                                    $scope.isQuantifierNeeded = iterate.isQuantifierNeeded;
                                    $scope.updateTotalIncome($scope.formData.quintity, $scope.formData.totalIncome);
                                }
                            })
                        }

                    });
                };

                $scope.subOccupationNotAvailable = function(occupationId) {
                    _.each($scope.occupationOption, function(occupation) {
                        if (occupation == occupationId && _.isUndefined(occupation.incomeExpenseDatas)) {
                            $scope.isQuantifierNeeded = false;
                            $scope.updateTotalIncome($scope.formData.quintity, $scope.formData.totalIncome);
                            return $scope.isQuantifierNeeded;
                        }
                    })
                };

                $scope.addClientoccupationdetailsSubmit = function() {
                    $scope.formData.locale = "en";
                    resourceFactory.incomeExpenseAndHouseHoldExpense.save({
                        clientId: $scope.clientId
                    }, $scope.formData, function(data) {
                        refreshAndShowSummaryView();
                    });
                };

                $scope.addClientassetdetailsSubmit = function() {
                    $scope.addClientoccupationdetailsSubmit();
                };

                $scope.addClienthouseholddetailsSubmit = function() {
                    $scope.addClientoccupationdetailsSubmit();
                };

                $scope.editClientassetdetailsSubmit = function() {
                    $scope.editClientoccupationdetailsSubmit();
                }
                $scope.editClienthouseholddetailsSubmit = function() {
                    $scope.editClientoccupationdetailsSubmit();
                }
                $scope.editClientoccupationdetailsSubmit = function() {
                    $scope.formData.locale = "en";
                    resourceFactory.incomeExpenseAndHouseHoldExpense.update({
                            clientId: $scope.clientId,
                            incomeAndExpenseId: $scope.incomeAndExpenseId
                        },
                        $scope.formData,
                        function(data) {
                            refreshAndShowSummaryView();
                        });
                };

            }

        }
    });
    mifosX.ng.application.controller('CGTBasicActivityController', ['$controller', '$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter', 'ngXml2json', '$route', '$http', '$rootScope', '$sce', 'CommonUtilService', '$route', '$upload', 'API_VERSION', 'dateFilter', mifosX.controllers.CGTBasicActivityController]).run(function($log) {
        $log.info("CGTBasicActivityController initialized");
    });
}(mifosX.controllers || {}));