/**
 * Created by jagadeeshakn on 8/1/2016.
 */
(function (module) {
    mifosX.controllers = _.extend(module, {
        ClientCreationController: function (scope, resourceFactory, location, routeParams, http, dateFilter, API_VERSION, $upload, $rootScope, routeParams) {
            scope.offices = [];
            scope.staffs = [];
            scope.savingproducts = [];
            scope.first = {};
            scope.first.date = new Date();
            scope.first.submitondate = new Date ();
            scope.formData = {};
            scope.clientNonPersonDetails = {};
            scope.restrictDate = new Date();
            scope.showSavingOptions = false;
            scope.opensavingsproduct = false;
            scope.forceOffice = null;
            scope.showNonPersonOptions = false;
            scope.clientPersonId = 1;
            scope.isFamilyMembers = true;
            scope.isStaffMandatory = false;
            scope.isStaffRequired = false;

            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                scope.response.uiDisplayConfigurations.createClient.isMandatoryField) {
                if(scope.response.uiDisplayConfigurations.createClient.isMandatoryField.staff){
                    scope.isStaffMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.staff;
                }
                
            }
            
            scope.validateStaff = function(){
                if(scope.isStaffMandatory && (scope.formData.staffId==undefined || scope.formData.staffId==null)){
                    scope.isStaffRequired = true;
                }else{
                    scope.isStaffRequired = false;
                }
            };

            var requestParams = {staffInSelectedOfficeOnly:true};
            if (routeParams.groupId) {
                requestParams.groupId = routeParams.groupId;
            }
            if (routeParams.officeId) {
                requestParams.officeId = routeParams.officeId;
            }
            resourceFactory.clientTemplateResource.get(requestParams, function (data) {
                scope.isSAIDEnabled = scope.isSystemGlobalConfigurationEnabled('auto-populate-details-based-on-SA-id');
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
                scope.isWorkflowEnabled = (data.isWorkflowEnabled &&  data.isWorkflowEnableForBranch);
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
            });

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

            scope.submit = function () {
                var reqDate = dateFilter(scope.first.date, scope.df);

                this.formData.locale = scope.optlang.code;
                this.formData.active = this.formData.active || false;
                this.formData.dateFormat = scope.df;
                this.formData.activationDate = reqDate;

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

                if (this.formData.legalFormId == scope.clientPersonId || this.formData.legalFormId == null) {
                    delete this.formData.fullname;
                } else {
                    delete this.formData.firstname;
                    delete this.formData.middlename;
                    delete this.formData.lastname;
                }

                if(scope.first.incorpValidityTillDate) {
                    this.formData.clientNonPersonDetails.locale = scope.optlang.code;
                    this.formData.clientNonPersonDetails.dateFormat = scope.df;
                    this.formData.clientNonPersonDetails.incorpValidityTillDate = dateFilter(scope.first.incorpValidityTillDate, scope.df);
                }

                if (!scope.opensavingsproduct) {
                    this.formData.savingsProductId = null;
                }
                if(scope.isStaffMandatory && (scope.formData.staffId==undefined || scope.formData.staffId==null)){
                    scope.isStaffRequired = true;
                    return false;
                }

                resourceFactory.clientResource.save(this.formData, function (data) {
                    if(routeParams.pledgeId)
                    {
                        var updatedData = {};
                        updatedData.clientId = data.clientId;
                        resourceFactory.pledgeResource.update({ pledgeId : routeParams.pledgeId}, updatedData, function(pledgeData){
                        });
                    }
                    location.path('/viewclient/' + data.clientId);
                });
            };
        }
    });
    mifosX.ng.application.controller('ClientCreationController', ['$scope', 'ResourceFactory', '$location', '$routeParams', '$http', 'dateFilter', 'API_VERSION', '$upload', '$rootScope', '$routeParams', mifosX.controllers.ClientCreationController]).run(function ($log) {
        $log.info("ClientCreationController initialized");
    });
}(mifosX.controllers || {}));
