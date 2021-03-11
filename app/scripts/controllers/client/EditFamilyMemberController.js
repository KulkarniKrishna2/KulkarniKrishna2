(function (module) {
    mifosX.controllers = _.extend(module, {
        EditFamilyMemberController: function ($q,scope, routeParams, resourceFactory, location, $modal, route, dateFilter) {

            scope.clientId = routeParams.clientId;
            scope.familyDetailId = routeParams.familyDetailId;
            scope.isExisitingClient = false;
            scope.showOrHideSearch = false;
            scope.formData = {};
            scope.isDateOfBirthMandatory = false;
            scope.isValidAge = true;

            scope.salutationOptions = [];
            scope.relationshipOptions = [];
            scope.genderOptions = [];
            scope.educationOptions = [];
            scope.occupationOptions = [];
            scope.subOccupations = [];
            if(scope.response && scope.response.uiDisplayConfigurations.viewClient.familyDeatils.isValidateDOBField.active && scope.response.uiDisplayConfigurations.viewClient.familyDeatils.isValidateDOBField.ageCriteria){
                scope.familyMemberMinAge = scope.response.uiDisplayConfigurations.viewClient.familyDeatils.isValidateDOBField.ageCriteria.minAge;
                scope.familyMemberMaxAge = scope.response.uiDisplayConfigurations.viewClient.familyDeatils.isValidateDOBField.ageCriteria.maxAge;
            }
            if(scope.response && scope.response.uiDisplayConfigurations.createClient.isValidateFirstName) {
                scope.firstNamePattern = scope.response.uiDisplayConfigurations.createClient.isValidateFirstName.firstNamePattern;
            }
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.viewClient && scope.response.uiDisplayConfigurations.viewClient.familyDeatils && scope.response.uiDisplayConfigurations.viewClient.familyDeatils.isMandatoryField) {
                scope.isAgeMandatory = scope.response.uiDisplayConfigurations.viewClient.familyDeatils.isMandatoryField.age;
                scope.isfamilyMemeberIDTypeMandatory = scope.response.uiDisplayConfigurations.viewClient.familyDeatils.isMandatoryField.familyMemeberIDType;
                scope.isAgeRequired = scope.response.uiDisplayConfigurations.viewClient.familyDeatils.isMandatoryField.age;
                scope.isfamilyMemeberIDTypeRequired = scope.response.uiDisplayConfigurations.viewClient.familyDeatils.isMandatoryField.familyMemeberIDType;
            }
            scope.$watch('formData.dateOfBirth', function (newValue, oldValue) {
                if (scope.formData.dateOfBirth != undefined && scope.formData.dateOfBirth != "") {
                    var ageDifMs = Date.now() - scope.formData.dateOfBirth.getTime();
                    var ageDate = new Date(ageDifMs); // miliseconds from epoch
                    scope.formData.age = Math.abs(ageDate.getUTCFullYear() - 1970);
                } 
            });
            scope.minAge = 0;
            scope.maxAge = 130;
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.viewClient && scope.response.uiDisplayConfigurations.viewClient.familyDeatils) {
                if (scope.response.uiDisplayConfigurations.viewClient.familyDeatils.isMandatoryField.dateOfBirth) {
                    scope.isDateOfBirthMandatory = scope.response.uiDisplayConfigurations.viewClient.familyDeatils.isMandatoryField.dateOfBirth;
                }
                if (scope.response.uiDisplayConfigurations.viewClient.familyDeatils.isValidateDOBField && scope.response.uiDisplayConfigurations.viewClient.familyDeatils.isValidateDOBField.active) {
                    if (scope.response.uiDisplayConfigurations.viewClient.familyDeatils.isValidateDOBField.ageCriteria.minAge > 0) {
                        scope.minAge = scope.response.uiDisplayConfigurations.viewClient.familyDeatils.isValidateDOBField.ageCriteria.minAge;
                    }
                    if (scope.response.uiDisplayConfigurations.viewClient.familyDeatils.isValidateDOBField.ageCriteria.maxAge > 0) {
                        scope.maxAge = scope.response.uiDisplayConfigurations.viewClient.familyDeatils.isValidateDOBField.ageCriteria.maxAge;
                    }
                }
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

            resourceFactory.familyDetailsTemplate.get({clientId: scope.clientId}, function (data) {
                scope.salutationOptions = data.salutationOptions;
                scope.relationshipOptions = data.relationshipOptions;
                scope.genderOptions = data.genderOptions;
                scope.educationOptions = data.educationOptions;
                scope.occupationOptions = data.occupationOptions;
                scope.relationshipGenderData = data.relationshipGenderData;

                resourceFactory.clientIdenfierTemplateResource.get({ clientId: scope.clientId }, function (data) {
                    scope.documentTypes = data.allowedDocumentTypes;
                });

                resourceFactory.familyDetails.get({
                    clientId: scope.clientId,
                    familyDetailId: scope.familyDetailId
                }, function (data) {
                    //console.log(JSON.stringify(data));
                    scope.formData.firstname = data.firstname;
                    scope.formData.middlename = data.middlename;
                    scope.formData.lastname = data.lastname;
                    if(data.dateOfBirth){
                        scope.formData.dateOfBirth = dateFilter(new Date(data.dateOfBirth), scope.df);
                    }
                    scope.age = data.age;
                    scope.displayAge = true;
                    scope.formData.age = data.age;
                    scope.formData.isDependent = data.isDependent;
                    scope.formData.isSeriousIllness = data.isSeriousIllness;
                    scope.formData.isDeceased = data.isDeceased;
                    if(data.clientReference){
                        scope.formData.clientReference = data.clientReference;
                        scope.isExisitingClient = true;
                    } else {
                        scope.isExisitingClient = false;
                    }
                    if(data.salutation){
                        scope.formData.salutationId = data.salutation.id;
                    }
                    if(data.relationship){
                        scope.formData.relationshipId = data.relationship.id;
                        scope.changeMandatoryFields(data.relationship.id);
                    }
                    if(data.gender){
                        scope.formData.genderId = data.gender.id;
                    }
                    if(data.education){
                        scope.formData.educationId = data.education.id;
                    }
                    if(data.occupation){
                        scope.occupationOption = data.occupation;
                        scope.formData.occupationDetailsId = scope.occupationOption.id;
                    }
                    if(data.documentType && data.documentType.id){
                        scope.formData.documentTypeId = data.documentType.id;
                    }
                    if(data.documentKey){
                        scope.formData.documentKey = data.documentKey;
                    }
                });
            });

            scope.$watch('formData.dateOfBirth', function(newValue, oldValue){
                if(scope.formData.dateOfBirth != null)
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
               

            scope.routeTo = function () {
                if( scope.formData.clientReference ){
                    location.path('/viewclient/' + scope.formData.clientReference);
                }
            };

            scope.removeAssociation = function(){
                scope.removeFamilyMemberAssociation();
            }

            scope.showOrHideSearch = function(){
                if(scope.showOrHideSearch){
                    scope.showOrHideSearch = false;
                } else {
                    scope.showOrHideSearch = true;
                }
            }

              scope.viewClient = function (item) {
                scope.client = item;
            };

            scope.clientOptions = function(value){
                var deferred = $q.defer();
                resourceFactory.globalSearch.search({query: value, resource: 'clients', exactMatch: routeParams.exactMatch,
                orderBy : 'displayName',
                sortOrder : 'ASC',
                limit:200}, function (data) {
                    for (var i in data){
                        if( data[i].entityId == scope.clientId){
                            data.splice(i,1);
                            break;
                        }
                    }
                    deferred.resolve(data);
                });
                return deferred.promise;
            };

             scope.add = function () {
                if(scope.available != ""){
                    scope.getClientDetails(scope.available.entityId);
                }
            };

            scope.getClientDetails = function (clientId) {
                scope.selected = clientId;
                resourceFactory.clientResource.get({clientId: clientId}, function (data) {
                    if (data){
                        scope.client = data;
                        scope.formData.firstname = data.firstname;
                        scope.formData.lastname = data.lastname;
                        scope.formData.clientReference = data.id;
                        scope.genderId = data.gender.id;
                        if(data.dateOfBirth){
                            var dateOfBirth= dateFilter(new Date(data.dateOfBirth), scope.df);
                            scope.formData.dateOfBirth  = dateOfBirth;
                            var age = Math.floor((new Date() - new Date(dateOfBirth)) / (31557600000));
                            scope.formData.age = age;
                            scope.age = age;
                        } else {
                            scope.formData.dateOfBirth = undefined;
                            scope.formData.age = undefined;
                            scope.age = undefined;
                        }
                    }
                });
            };

            var FamilyDetailsDeleteCtrl = function ($scope, $modalInstance, familyDetailsId) {
                $scope.delete = function () {
                     resourceFactory.familyDetails.update({
                    clientId: scope.clientId,
                    familyDetailId: scope.familyDetailId,
                    command: 'removeFamilyMemberClientAssociation'
                }, scope.formData, function (data) {
                    scope.isExisitingClient = false;
                    scope.formData.clientReference = undefined;
                    $modalInstance.dismiss('cancel');
                    /*location.path('/listfamilydetails/' + scope.clientId)*/
                });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.removeFamilyMemberAssociation = function () {
                $modal.open({
                    templateUrl: 'removeFamilyMemberAssociation.html',
                    controller: FamilyDetailsDeleteCtrl,
                    resolve: {
                        familyDetailsId: function () {
                            return scope.familyDetailId;
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
                scope.changeMandatoryFields(value);
            };
            scope.changeMandatoryFields = function (value) {
                scope.isAgeMandatory = scope.isAgeRequired;
                scope.isfamilyMemeberIDTypeMandatory = scope.isfamilyMemeberIDTypeRequired;
                if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.relationshipOptions && scope.response.uiDisplayConfigurations.relationshipOptions.AgeMandatoryFor && scope.response.uiDisplayConfigurations.relationshipOptions.AgeMandatoryFor.length > 0) {
                    scope.AgeMandatoryRelationshipOptions = scope.response.uiDisplayConfigurations.relationshipOptions.AgeMandatoryFor && scope.response.uiDisplayConfigurations.relationshipOptions.AgeMandatoryFor;
                }
                if (scope.relationshipOptions && scope.relationshipOptions.length > 0) {
                    for (var i in scope.relationshipOptions) {
                        if (scope.relationshipOptions[i].id == value) {
                            if (scope.AgeMandatoryRelationshipOptions) {
                                for (var j in scope.AgeMandatoryRelationshipOptions) {
                                    if (scope.relationshipOptions[i].name.toLowerCase() == scope.AgeMandatoryRelationshipOptions[j].toLowerCase()) {
                                        scope.isAgeMandatory = true;
                                        scope.isfamilyMemeberIDTypeMandatory = true;
                                    }
                                }
                            }
                        }
                    }
                }
            };
                        
            scope.validateAge = function(){
                if(!_.isUndefined(scope.familyMemberMinAge) && !_.isUndefined(scope.familyMemberMaxAge)){
                    scope.isValidAge = false;
                    if(scope.formData.age){
                        if(scope.familyMemberMinAge <= scope.formData.age && scope.formData.age <= scope.familyMemberMaxAge){
                            scope.isValidAge = true;
                        }
                    }
                }
            };

            scope.submit = function () {
                if(scope.formData.dateOfBirth) {
                    scope.formData.dateOfBirth = dateFilter(scope.formData.dateOfBirth, scope.df);
                }
                scope.formData.dateFormat = scope.df;
                scope.formData.locale = scope.optlang.code;
                if (!scope.formData.documentTypeId) {
                    if (scope.formData.documentKey != undefined) {
                        delete scope.formData.documentKey;
                        delete scope.formData.documentTypeId;
                    }
                }
                resourceFactory.familyDetails.update({
                    clientId: scope.clientId,
                    familyDetailId: scope.familyDetailId
                }, scope.formData, function (data) {
                    location.path('/listfamilydetails/' + scope.clientId)
                });
            };

            scope.documentTypeChange = function(){
                scope.formData.documentKey = undefined;
            }
        }
    });
    mifosX.ng.application.controller('EditFamilyMemberController', ['$q','$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', 'dateFilter', mifosX.controllers.EditFamilyMemberController]).run(function ($log) {
        $log.info("EditFamilyMemberController initialized");
    });

}(mifosX.controllers || {}));