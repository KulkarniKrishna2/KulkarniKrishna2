(function (module) {
    mifosX.controllers = _.extend(module, {
        groupmembersActivityController: function ($q, $controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope,$filter) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.formData = {};
            scope.viewSummary=false;
            scope.viewAddMember = false;

            scope.viewManageMember = false;
            scope.viewLoanApplicationForm=false;
            scope.flag=false;
            scope.groupId = scope.taskconfig['groupId'];
            scope.isTaskComplete = false;

            scope.clientOptions = function(value){
                var deferred = $q.defer();
                resourceFactory.clientResource.getAllClientsWithoutLimit({displayName: value, orderBy : 'displayName', officeId : scope.group.officeId, sortOrder : 'ASC', orphansOnly : true, groupId:scope.groupId}, function (data) {
                    deferred.resolve(data.pageItems);
                });
                return deferred.promise;
            };

            function hideAll() {
                 scope.viewSummary = false;
                 scope.viewAddMember = false;
                 scope.viewManageMember = false;
                 scope.viewLoanApplicationForm = false;
             };

             scope.showAddMemberView = function() {
                 hideAll();
                 scope.setTaskActionExecutionError("");
                 scope.form = {};
                 scope.viewAddMember = true;

                 scope.offices = [];
                 scope.staffs = [];
                 scope.savingproducts = [];
                 scope.first = {};
                 scope.first.date = new Date();
                 scope.first.submitondate = new Date();
                 scope.addClientformData = {};
                 scope.clientNonPersonDetails = {};
                 scope.restrictDate = new Date();
                 scope.showSavingOptions = false;
                 scope.opensavingsproduct = false;
                 scope.forceOffice = null;
                 scope.showNonPersonOptions = false;
                 scope.clientPersonId = 1;
                 scope.isFamilyMembers = true;
                 var requestParams = {
                     staffInSelectedOfficeOnly: true
                 };
                 if (scope.groupId) {
                     requestParams.groupId = scope.groupId;
                 }
                 if (scope.officeId) {
                     requestParams.officeId = scope.officeId;
                 }

                if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                    scope.response.uiDisplayConfigurations.createClient.isMandatoryField && scope.response.uiDisplayConfigurations.createClient.isMandatoryField.clientClassificationId) {
                    scope.isClientClassificationMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.clientClassificationId;
                }

                if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                    scope.response.uiDisplayConfigurations.createClient.isHiddenField) {
                    scope.showStaff = !scope.response.uiDisplayConfigurations.createClient.isHiddenField.staffActivation;
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
                    scope.response.uiDisplayConfigurations.createClient.isMandatoryField.dateOfBirth) {
                    scope.isDateOfBirthMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.dateOfBirth;
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

                resourceFactory.clientTemplateResource.get(requestParams, function(data) {
                     scope.offices = data.officeOptions;
                     scope.staffs = data.staffOptions;
                     scope.addClientformData.officeId = scope.offices[0].id;
                     scope.savingproducts = data.savingProductOptions;
                     scope.genderOptions = data.genderOptions;
                     scope.clienttypeOptions = data.clientTypeOptions;
                     scope.clientClassificationOptions = data.clientClassificationOptions;
                     scope.clientNonPersonConstitutionOptions = data.clientNonPersonConstitutionOptions;
                     scope.clientNonPersonMainBusinessLineOptions = data.clientNonPersonMainBusinessLineOptions;
                     scope.clientLegalFormOptions = data.clientLegalFormOptions;
                     scope.maritalStatusOptions = data.maritalStatusOptions;
                     if (data.savingProductOptions.length > 0) {
                         scope.showSavingOptions = true;
                     }
                     if (scope.officeId) {
                         scope.addClientformData.officeId = scope.officeId;
                         for (var i in data.officeOptions) {
                             if (data.officeOptions[i].id == scope.officeId) {
                                 scope.forceOffice = data.officeOptions[i];
                                 break;
                             }
                         }
                     }
                     if (scope.groupId) {
                         if (typeof data.staffId !== "undefined") {
                             scope.addClientformData.staffId = data.staffId;
                         }
                     }
                     if (scope.staffId) {
                         for (var i in scope.staffs) {
                             if (scope.staffs[i].id == scope.staffId) {
                                 scope.addClientformData.staffId = scope.staffs[i].id;
                                 break;
                             }
                         }
                     }
                    if(scope.maritalStatusOptions[0]) {
                        scope.addClientformData.maritalStatusId = scope.maritalStatusOptions[0].id;
                    }
                 });
             };

             scope.showManageMemberView = function() {
                 hideAll();
                 scope.setTaskActionExecutionError("");
                 scope.viewManageMember = true;
             };

             function showSummaryView() {
                 hideAll();

                 scope.viewSummary = true;
             };

             function init() {
                 populateDetails();
                 showSummaryView();
             };

             scope.goToTask = function(task) {
                 location.path('/viewtask/' + task.id);
             };

             function getActiveChildTask(childTasks) {
                 if (childTasks != undefined && childTasks.length > 0) {
                     for (index in childTasks) {
                         var task = childTasks[index];
                         if (task.status != undefined && task.status.id > 1 && task.status.id < 7) {
                             return task;
                         }
                     }
                 }
                 return null;
             };

            scope.associateMember = function () {
                if(scope.client != undefined){
                    scope.associate = {};
                    scope.associate.clientMembers = [];
                    scope.associate.clientMembers[0] = scope.client.id;
                    resourceFactory.groupResource.save({groupId: scope.groupId, command: 'associateClients'}, scope.associate, function (data) {
                        scope.client = undefined;
                        refreshPage();
                    });
                }
            };

            scope.remove = function (index,id) {
                scope.indexOfClientToBeDeleted = index;
                scope.disassociate = {};
                scope.disassociate.clientMembers = [];
                scope.disassociate.clientMembers.push(id);

                resourceFactory.groupResource.save({groupId: scope.groupId, command: 'disassociateClients'}, scope.disassociate, function (data) {
                  scope.allMembers.splice(scope.indexOfClientToBeDeleted, 1);
                  refreshPage();
                });
            };
                    

            scope.cancel = function (){
                showSummaryView();
            };

            scope.viewClient = function (item) {
                scope.client = item;
            };

            scope.clientOptions = function(value){
                var deferred = $q.defer();
                resourceFactory.clientResource.getAllClientsWithoutLimit({displayName: value, orderBy : 'displayName', officeId : scope.group.officeId,
                    sortOrder : 'ASC', orphansOnly : true}, function (data) {
                    deferred.resolve(data.pageItems);
                });
                return deferred.promise;
            };

            function populateDetails() {
              resourceFactory.groupResource.get({groupId: scope.groupId,associations: 'clientMembers'}, function(data) {
                scope.group = data;
                if (data.clientMembers) {
                    scope.allMembers = data.clientMembers;

                    angular.forEach(scope.group.clientMembers, function(client) {
                        client.workflows = [];
                        resourceFactory.loanApplicationReferencesForGroupResource.get({groupId: scope.groupId,clientId: client.id}, function(data1) {
                            if (data1.length > 0) {
                                for (var j in data1) {
                                    resourceFactory.entityTaskExecutionResource.get({
                                        entityType: "loanApplication",
                                        entityId: data1[j].loanApplicationReferenceId
                                    }, function(data2) {
                                        if (data2 != undefined &&
                                            data2.status.id > 1 &&  data2.status.id < 7 ) {
                                            resourceFactory.taskExecutionChildrenResource.getAll({
                                                taskId: data2.id
                                            }, function(children) {
                                                data2.activeChildTask = getActiveChildTask(children);
                                                client.workflows.push(data2);
                                            });
                                        }
                                    });
                                };
                            }
                        });
                    });
                }
            });
          };

        init();

        scope.createLoanApplication = function(memberid) {
            hideAll();
            scope.viewLoanApplicationForm = true;
            scope.clientId = memberid;
            scope.groupId = scope.groupId;
            scope.restrictDate = new Date();
            scope.formData = {};

            scope.paymentOptions = [];

            scope.formData.submittedOnDate = dateFilter(scope.restrictDate, scope.df);
            scope.charges = [];
            scope.chargeFormData = {}; //For charges

            scope.inparams = {
                resourceType: 'template',
                activeOnly: 'true'
            };

            var SLAB_BASED = 'slabBasedCharge';
            var UPFRONT_FEE = 'upfrontFee';

            if (scope.clientId && scope.groupId) {
                scope.inparams.templateType = 'jlg';
            } else if (scope.groupId) {
                scope.inparams.templateType = 'group';
            } else if (scope.clientId) {
                scope.inparams.templateType = 'individual';
            }
            if (scope.clientId) {
                scope.inparams.clientId = scope.clientId;
                scope.formData.clientId = scope.clientId;
            }
            if (scope.groupId) {
                scope.inparams.groupId = scope.groupId;
                scope.formData.groupId = scope.groupId;
            }
            scope.inparams.staffInSelectedOfficeOnly = true;
            if(scope.inparams.templateType == 'individual' || scope.inparams.templateType == 'jlg'){
                scope.inparams.productApplicableForLoanType = 2;
                scope.inparams.entityType = 1;
                scope.inparams.entityId = scope.clientId;
            }else if(scope.inparams.templateType == 'group' || scope.inparams.templateType == 'glim'){
                scope.inparams.productApplicableForLoanType = 3;
            }

            resourceFactory.loanResource.get(scope.inparams, function(data) {
                scope.loanaccountinfo = data;

                if (data.clientName) {
                    scope.clientName = data.clientName;
                }
                if (data.group) {
                    scope.groupName = data.group.name;
                }
            });

        };

        scope.loanProductChange = function(loanProductId) {

            scope.inparams.productId = loanProductId;

            resourceFactory.loanResource.get(scope.inparams, function(data) {
                scope.loanaccountinfo = data;
                if (scope.loanaccountinfo.loanEMIPacks) {
                    var len = scope.loanaccountinfo.loanEMIPacks.length;
                    for (var i = 0; i < len; i++) {
                        scope.loanaccountinfo.loanEMIPacks[i].combinedRepayEvery = scope.loanaccountinfo.loanEMIPacks[i].repaymentEvery + ' - ' +
                        $filter('translate')(scope.loanaccountinfo.loanEMIPacks[i].repaymentFrequencyType.value);
                    }
                    scope.formData.loanEMIPackId = scope.loanaccountinfo.loanEMIPacks[0].id;
                } else {
                    scope.formData.loanAmountRequested = scope.loanaccountinfo.principal;
                    scope.formData.fixedEmiAmount = scope.loanaccountinfo.fixedEmiAmount;
                    scope.formData.numberOfRepayments = scope.loanaccountinfo.numberOfRepayments;
                    scope.formData.repayEvery = scope.loanaccountinfo.repaymentEvery;
                    scope.formData.repaymentPeriodFrequencyEnum = scope.loanaccountinfo.repaymentFrequencyType.id;
                    delete scope.formData.loanEMIPackId;
                }
                if (scope.loanaccountinfo.paymentOptions) {
                    scope.paymentOptions = scope.loanaccountinfo.paymentOptions;
                }
                scope.setDefaultGISConfig();
                if (scope.loanaccountinfo.loanOfficerId) {
                    scope.formData.loanOfficerId = scope.loanaccountinfo.loanOfficerId;
                }

                if (scope.loanaccountinfo.loanOfficerOptions) {
                    resourceFactory.clientResource.get({
                        clientId: scope.clientId
                    }, function(data) {
                        if (data.staffId != null) {
                            scope.formData.loanOfficerId = data.staffId;
                        }
                    })
                }
                if (scope.loanaccountinfo.multiDisburseLoan == true && scope.loanaccountinfo.product && scope.loanaccountinfo.product.maxTrancheCount) {
                    scope.formData.noOfTranche = parseInt(scope.loanaccountinfo.product.maxTrancheCount);
                }
                scope.formData.termFrequency = (scope.loanaccountinfo.repaymentEvery * scope.loanaccountinfo.numberOfRepayments);
                scope.formData.termPeriodFrequencyEnum = scope.loanaccountinfo.repaymentFrequencyType.id;
                scope.charges = []; //scope.loanaccountinfo.charges || [];
                scope.productLoanCharges = data.product.charges || [];
                if (scope.productLoanCharges && scope.productLoanCharges.length > 0) {
                    for (var i in scope.productLoanCharges) {
                        if (scope.productLoanCharges[i].chargeData) {
                            for (var j in scope.loanaccountinfo.chargeOptions) {
                                if (scope.productLoanCharges[i].chargeData.id == scope.loanaccountinfo.chargeOptions[j].id) {
                                    //if(scope.productLoanCharges[i].isMandatory && scope.productLoanCharges[i].isMandatory == true){
                                    var charge = scope.productLoanCharges[i].chargeData;
                                    charge.chargeId = charge.id;
                                    charge.isMandatory = scope.productLoanCharges[i].isMandatory;
                                    scope.charges.push(charge);
                                    //}
                                    break;
                                }
                            }
                        }
                    }
                }
            });
        };

        scope.setDefaultGISConfig = function() {
            if (scope.paymentOptions) {
                if (scope.responseDefaultGisData && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.paymentType) {
                    if (scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.paymentType.expectedDisbursalPaymentType) {
                        for (var i = 0; i < scope.paymentOptions.length; i++) {
                            var paymentTypeName = scope.paymentOptions[i].name;
                            var defaultPaymentTypeName = scope.responseDefaultGisData.
                            uiDisplayConfigurations.defaultGISConfig.paymentType.expectedDisbursalPaymentType;
                            if (paymentTypeName == defaultPaymentTypeName) {
                                var paymentOptionId = scope.paymentOptions[i].id;
                                scope.formData.expectedDisbursalPaymentType = paymentOptionId;
                            }
                        }
                    }
                    if (scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.paymentType.expectedRepaymentPaymentType) {
                        for (var i = 0; i < scope.paymentOptions.length; i++) {
                            var paymentTypeName = scope.paymentOptions[i].name;
                            var defaultPaymentTypeName = scope.responseDefaultGisData.
                            uiDisplayConfigurations.defaultGISConfig.paymentType.expectedRepaymentPaymentType;
                            if (paymentTypeName == defaultPaymentTypeName) {
                                var paymentOptionId = scope.paymentOptions[i].id;
                                scope.formData.expectedRepaymentPaymentType = paymentOptionId;
                            }
                        }
                    }
                }
            }
        };

        scope.calculateTermFrequency = function() {
            scope.formData.termFrequency = (scope.formData.repayEvery * scope.formData.numberOfRepayments);
            scope.formData.termPeriodFrequencyEnum = scope.formData.repaymentPeriodFrequencyEnum;
        };

        scope.addCharge = function() {
            if (scope.chargeFormData.chargeId) {
                var chargeId = scope.chargeFormData.chargeId;
                scope.chargeFormData.chargeId = undefined;
                resourceFactory.chargeResource.get({
                    chargeId: chargeId,
                    template: 'true'
                }, function(data) {
                    data.chargeId = data.id;
                    if (scope.productLoanCharges && scope.productLoanCharges.length > 0) {
                        for (var i in scope.productLoanCharges) {
                            if (scope.productLoanCharges[i].chargeData) {
                                if (data.chargeId == scope.productLoanCharges[i].chargeData.id) {
                                    data.isMandatory = scope.productLoanCharges[i].isMandatory;
                                    break;
                                }
                            }
                        }
                    }
                    scope.charges.push(data);
                });
            }
        }

        scope.deleteCharge = function(index) {
            scope.charges.splice(index, 1);
        }

        scope.submitLoanApplication = function() {
            this.formData.clientId = scope.clientId;
            this.formData.charges = [];
            if(scope.charges){
                for (var i = 0; i < scope.charges.length; i++) {
                    var charge = {};
                    if (scope.charges[i].id) {
                        charge.chargeId = scope.charges[i].id;
                    }
                    if (scope.charges[i].chargeId) {
                        charge.chargeId = scope.charges[i].chargeId;
                    }
                    charge.amount = scope.charges[i].amount;
                    if (scope.charges[i].dueDate) {
                        charge.dueDate = dateFilter(scope.charges[i].dueDate, scope.df);
                    }
                    charge.isMandatory = scope.charges[i].isMandatory;
                    charge.isAmountNonEditable = scope.charges[i].isAmountNonEditable;
                    charge.locale = scope.optlang.code;
                    charge.dateFormat = scope.df;
                    this.formData.charges.push(charge);
                }
            }
            this.formData.submittedOnDate = dateFilter(this.formData.submittedOnDate, scope.df);
            this.formData.accountType = scope.inparams.templateType;
            this.formData.locale = scope.optlang.code;
            this.formData.dateFormat = scope.df;
            resourceFactory.loanApplicationReferencesResource.save(this.formData, function(data) {
                refreshPage();
            });
        };

        function refreshPage() {
            populateDetails();
            showSummaryView();
        }

        scope.displayPersonOrNonPersonOptions = function(legalFormId) {
            if (legalFormId == scope.clientPersonId || legalFormId == null) {
                scope.showNonPersonOptions = false;
            } else {
                scope.showNonPersonOptions = true;
            }
        };

        scope.changeOffice = function(officeId) {
            resourceFactory.clientTemplateResource.get({
                staffInSelectedOfficeOnly: true,
                officeId: officeId
            }, function(data) {
                scope.staffs = data.staffOptions;
                scope.savingproducts = data.savingProductOptions;
            });
        };

        scope.setChoice = function() {
            if (this.addClientformData.active) {
                scope.choice = 1;
            } else if (!this.addClientformData.active) {
                scope.choice = 0;
            }
        };

        scope.addClientMember = function() {
            var reqDate = dateFilter(scope.first.date, scope.df);

            this.addClientformData.locale = scope.optlang.code;
            this.addClientformData.active = this.addClientformData.active || false;
            this.addClientformData.dateFormat = scope.df;
            this.addClientformData.activationDate = reqDate;

            if (scope.groupId) {
                this.addClientformData.groupId = scope.groupId;
            }

            if (scope.officeId) {
                this.addClientformData.officeId = scope.officeId;
            }

            if (scope.first.submitondate) {
                reqDate = dateFilter(scope.first.submitondate, scope.df);
                this.addClientformData.submittedOnDate = reqDate;
            }

            if (scope.first.dateOfBirth) {
                this.addClientformData.dateOfBirth = dateFilter(scope.first.dateOfBirth, scope.df);
            }

            if (this.addClientformData.legalFormId == scope.clientPersonId || this.addClientformData.legalFormId == null) {
                delete this.addClientformData.fullname;
            } else {
                delete this.addClientformData.firstname;
                delete this.addClientformData.middlename;
                delete this.addClientformData.lastname;
            }

            if (scope.first.incorpValidityTillDate) {
                this.addClientformData.clientNonPersonDetails.locale = scope.optlang.code;
                this.addClientformData.clientNonPersonDetails.dateFormat = scope.df;
                this.addClientformData.clientNonPersonDetails.incorpValidityTillDate = dateFilter(scope.first.incorpValidityTillDate, scope.df);
            }

            if (!scope.opensavingsproduct) {
                this.addClientformData.savingsProductId = null;
            }

            resourceFactory.clientResource.save(this.addClientformData, function(data) {
                if (scope.pledgeId) {
                    var updatedData = {};
                    updatedData.clientId = data.clientId;
                    resourceFactory.pledgeResource.update({
                        pledgeId: scope.pledgeId
                    }, updatedData, function(pledgeData) {});
                }
                refreshPage();
            });
        };

        scope.doPreTaskActionStep = function(actionName) {
            if (actionName === 'activitycomplete') {
                if (allworkflowsCompleted()) {
                    scope.doActionAndRefresh(actionName);
                } else {
                    scope.setTaskActionExecutionError("lable.error.activity.coapplicant.not.completed");
                }
            } else {
                scope.doActionAndRefresh(actionName);
            }
        };

        function allworkflowsCompleted() {
            var workflowCompleted = true;
            if (scope.group.clientMembers != undefined) {
                scope.group.clientMembers.forEach(function(client) {
                    for (var i in client.workflows) {
                        if (client.workflows[i].status.id < 7) {
                            workflowCompleted = false;
                            break;
                        }
                    }
                });
            }
            return workflowCompleted;
        };
  
      }
    });
    mifosX.ng.application.controller('groupmembersActivityController', ['$q','$controller','$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope','$filter', mifosX.controllers.groupmembersActivityController]).run(function ($log) {
        $log.info("groupmembersActivityController initialized");
    });
}(mifosX.controllers || {}));
