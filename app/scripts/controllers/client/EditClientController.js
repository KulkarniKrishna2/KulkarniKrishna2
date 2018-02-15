(function (module) {
    mifosX.controllers = _.extend(module, {
        EditClientController: function ($controller,scope, routeParams, resourceFactory, location, http, dateFilter, API_VERSION, $upload, $rootScope) {
            angular.extend(this, $controller('defaultUIConfigController', {$scope: scope,$key:"createClient"}));
            scope.offices = [];
            scope.date = {};
            scope.restrictDate = new Date();
            scope.savingproducts = [];
            scope.clientId = routeParams.id;
            scope.showSavingOptions = 'false';
            scope.opensavingsproduct = 'false';
            scope.showNonPersonOptions = false;
            scope.clientPersonId = 1;
            scope.isDateOfBirthMandatory = false;
            scope.hideClientClassification = false;
            scope.isClientClassificationMandatory = false;
            scope.isExternalIdMandatory = false;
            scope.isMobileNumberMandatory = false;
            scope.isEmailIdMandatory = false;
            scope.displayAge = false;
            if($rootScope.tenantIdentifier == "chaitanya"){
                scope.isDateOfBirthMandatory = true;
            }
            scope.invalidClassificationId = false;
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                scope.response.uiDisplayConfigurations.createClient.isMandatoryField && scope.response.uiDisplayConfigurations.createClient.isMandatoryField.clientClassificationId) {
                scope.isClientClassificationMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.clientClassificationId;
            }
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient && 
                scope.response.uiDisplayConfigurations.createClient.isHiddenField && scope.response.uiDisplayConfigurations.createClient.isHiddenField.hideClientClassification) {
                scope.hideClientClassification = scope.response.uiDisplayConfigurations.createClient.isHiddenField.hideClientClassification;
            }
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                scope.response.uiDisplayConfigurations.createClient.isMandatoryField && scope.response.uiDisplayConfigurations.createClient.isMandatoryField.externalId){
                scope.isExternalIdMandatory = scope.response.uiDisplayConfigurations.createClient.isMandatoryField.externalId;
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
            scope.maxDateOfBirth = getMaximumRestrictedDate(new Date());
            scope.minDateOfBirth = getMinimumRestrictedDate(new Date());
            function getMaximumRestrictedDate(restrictedDate) {

                restrictedDate.setYear(restrictedDate.getFullYear() - scope.minAge);
                return restrictedDate;
            };

            function getMinimumRestrictedDate(restrictedDate) {

                restrictedDate.setYear(restrictedDate.getFullYear() - scope.maxAge);
                return restrictedDate;
            };

            resourceFactory.clientResource.get({clientId: routeParams.id, template:'true', staffInSelectedOfficeOnly:true}, function (data) {
                scope.offices = data.officeOptions;
                scope.staffs = data.staffOptions;
                scope.savingproducts = data.savingProductOptions;
                scope.genderOptions = data.genderOptions;
                scope.clienttypeOptions = data.clientTypeOptions;
                scope.clientClassificationOptions = data.clientClassificationOptions;
                scope.clientNonPersonConstitutionOptions = data.clientNonPersonConstitutionOptions;
                scope.clientNonPersonMainBusinessLineOptions = data.clientNonPersonMainBusinessLineOptions;
                scope.clientLegalFormOptions = data.clientLegalFormOptions;
                scope.officeId = data.officeId;
                scope.isWorkflowEnabled = data.isWorkflowEnabled;
                scope.maritalStatusOptions = data.maritalStatusOptions;
                scope.formData = {
                    firstname: data.firstname,
                    lastname: data.lastname,
                    middlename: data.middlename,
                    active: data.active,
                    accountNo: data.accountNo,
                    staffId: data.staffId,
                    externalId: data.externalId,
                    mobileNo: data.mobileNo,
                    alternateMobileNo: data.alternateMobileNo,
                    savingsProductId: data.savingsProductId,
                    genderId: data.gender.id,
                    fullname: data.fullname,
                    clientNonPersonDetails : {
                        incorpNumber: data.clientNonPersonDetails.incorpNumber,
                        remarks: data.clientNonPersonDetails.remarks
                    },
                    email: data.emailId
                };

                if(data.gender){
                    scope.formData.genderId = data.gender.id;
                }

                if(data.clientType){
                    scope.formData.clientTypeId = data.clientType.id;
                }

                if(data.clientClassification){
                    scope.formData.clientClassificationId = data.clientClassification.id;
                }

                if(data.legalForm){
                    scope.displayPersonOrNonPersonOptions(data.legalForm.id);
                    scope.formData.legalFormId = data.legalForm.id;
                }

                if(data.clientNonPersonDetails.constitution){
                    scope.formData.clientNonPersonDetails.constitutionId = data.clientNonPersonDetails.constitution.id;
                }

                if(data.clientNonPersonDetails.mainBusinessLine){
                    scope.formData.clientNonPersonDetails.mainBusinessLineId = data.clientNonPersonDetails.mainBusinessLine.id;
                }

                if (data.savingsProductId != null) {
                    scope.opensavingsproduct = 'true';
                    scope.showSavingOptions = 'true';
                } else if (data.savingProductOptions.length > 0) {
                    scope.showSavingOptions = 'true';
                }

                if (data.dateOfBirth) {
                    var dobDate = dateFilter(data.dateOfBirth, scope.df);
                    scope.date.dateOfBirth = new Date(dobDate);
                    calculateClientAge(scope.date.dateOfBirth);
                }

                if (data.clientNonPersonDetails.incorpValidityTillDate) {
                    var incorpValidityTillDate = dateFilter(data.clientNonPersonDetails.incorpValidityTillDate, scope.df);
                    scope.date.incorpValidityTillDate = new Date(incorpValidityTillDate);
                }

                var actDate = dateFilter(data.activationDate, scope.df);
                scope.date.activationDate = new Date(actDate);
                if (!scope.isWorkflowEnabled && data.active) {
                    scope.choice = 1;
                    scope.showSavingOptions = 'false';
                    scope.opensavingsproduct = 'false';
                }

                if (data.timeline.submittedOnDate) {
                    var submittedOnDate = dateFilter(data.timeline.submittedOnDate, scope.df);
                    scope.date.submittedOnDate = new Date(submittedOnDate);
                }

                if(data.maritalStatus && data.maritalStatus.id){
                    scope.formData.maritalStatusId = data.maritalStatus.id;
                }

            });

            function calculateClientAge(dateOfBirth){
                var ageDifMs = Date.now() - dateOfBirth.getTime();
                var ageDifMs = Date.now() - dateOfBirth.getTime();
                var ageDate = new Date(ageDifMs); // miliseconds from epoch
                scope.displayAge = true;
                scope.age = Math.abs(ageDate.getUTCFullYear() - 1970);
            }

            scope.displayPersonOrNonPersonOptions = function (legalFormId) {
                if(legalFormId == scope.clientPersonId || legalFormId == null) {
                    scope.showNonPersonOptions = false;
                }else {
                    scope.showNonPersonOptions = true;
                }
            };

            scope.$watch('date.dateOfBirth', function(newValue, oldValue){
                if(scope.date.dateOfBirth != null)
                {
                    var ageDifMs = Date.now() - scope.date.dateOfBirth.getTime();
                    var ageDifMs = Date.now() - scope.date.dateOfBirth.getTime();
                    var ageDate = new Date(ageDifMs); // miliseconds from epoch
                    scope.displayAge = true;
                    scope.age = Math.abs(ageDate.getUTCFullYear() - 1970);
                }else{
                    scope.displayAge = false;
                }
            });


            scope.submit = function () {
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                if (scope.opensavingsproduct == 'false') {
                    this.formData.savingsProductId = null;
                }

                if (scope.choice === 1) {
                    if (scope.date.activationDate) {
                        this.formData.activationDate = dateFilter(scope.date.activationDate, scope.df);
                    }
                }
                if (scope.date.dateOfBirth) {
                    this.formData.dateOfBirth = dateFilter(scope.date.dateOfBirth, scope.df);
                }
                if(scope.clientClassificationId){
                    this.formData.clientClassificationId = scope.clientClassificationId;
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
                if(scope.date.dateOfBirth && scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient.isValidateDOBField.active) {
                    if(!(scope.date.dateOfBirth < scope.maxDateOfBirth && scope.date.dateOfBirth > scope.minDateOfBirth)){
                        scope.dateOfBirthNotInRange = true;
                    } else{
                        scope.dateOfBirthNotInRange = false;
                    }
                } else {
                    scope.dateOfBirthNotInRange = false;
                }

                if (scope.date.submittedOnDate) {
                    this.formData.submittedOnDate = dateFilter(scope.date.submittedOnDate, scope.df);
                }

                if (scope.date.incorpValidityTillDate) {
                    this.formData.clientNonPersonDetails.locale = scope.optlang.code;
                    this.formData.clientNonPersonDetails.dateFormat = scope.df;
                    this.formData.clientNonPersonDetails.incorpValidityTillDate = dateFilter(scope.date.incorpValidityTillDate, scope.df);
                }

                if (this.formData.legalFormId == scope.clientPersonId || this.formData.legalFormId == null) {
                    delete this.formData.fullname;
                } else {
                    delete this.formData.firstname;
                    delete this.formData.middlename;
                    delete this.formData.lastname;
                }

                 if(!scope.dateOfBirthNotInRange || !scope.invalidClassificationId) {
                resourceFactory.clientResource.update({'clientId': routeParams.id}, this.formData, function (data) {
                    location.path('/viewclient/' + routeParams.id);
                });
            }
            };

        }
    });
    mifosX.ng.application.controller('EditClientController', ['$controller','$scope', '$routeParams', 'ResourceFactory', '$location', '$http', 'dateFilter', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.EditClientController]).run(function ($log) {
        $log.info("EditClientController initialized");
    });
}(mifosX.controllers || {}));
