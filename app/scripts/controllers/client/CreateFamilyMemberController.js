(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateFamilyMemberController: function ($q,scope, routeParams, resourceFactory, location, $modal, route, dateFilter) {

            scope.clientId = routeParams.clientId;
            scope.salutationOptions = [];
            scope.relationshipOptions = [];
            scope.genderOptions = [];
            scope.educationOptions = [];
            scope.occupationOptions = [];
            scope.subOccupations = [];
            scope.isExisitingClient = false;
            scope.formData = {};
            scope.first = {};
            scope.isDateOfBirthMandatory = false;
            scope.displayAge = false;
            scope.minAge = 0;
            scope.maxAge = 0;
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

            resourceFactory.familyDetailsTemplate.get({clientId: scope.clientId}, function (data) {
                scope.salutationOptions = data.salutationOptions;
                scope.relationshipOptions = data.relationshipOptions;
                scope.genderOptions = data.genderOptions;
                scope.educationOptions = data.educationOptions;
                scope.occupationOptions = data.occupationOptions;
            });

            scope.$watch('first.dateOfBirth', function(newValue, oldValue){
                if(scope.first.dateOfBirth != null)
                {
                    var ageDifMs = Date.now() - scope.first.dateOfBirth.getTime();
                    var ageDate = new Date(ageDifMs); // miliseconds from epoch
                    scope.displayAge = true;
                    scope.age = Math.abs(ageDate.getUTCFullYear() - 1970);
                }else{
                    scope.displayAge = false;
                }
            });

            scope.submit = function () {
                if (scope.salutationId) {
                    this.formData.salutationId = scope.salutationId;
                }
                if (scope.relationshipId) {
                    this.formData.relationshipId = scope.relationshipId;
                }
                if (scope.genderId) {
                    this.formData.genderId = scope.genderId;
                }
                if (scope.formData.dateOfBirth) {
                    this.formData.dateOfBirth = dateFilter(scope.formData.dateOfBirth, scope.df);
                }
                if (scope.educationId) {
                    this.formData.educationId = scope.educationId;
                }
                if (scope.first.dateOfBirth) {
                    this.formData.dateOfBirth = dateFilter(scope.first.dateOfBirth, scope.df);
                    this.formData.age = scope.age;
                }
                scope.formData.dateFormat = scope.df;
                this.formData.locale = scope.optlang.code;
                resourceFactory.familyDetails.save({clientId: scope.clientId}, this.formData, function (data) {
                    location.path('/listfamilydetails/' + scope.clientId)
                });
            };

            scope.viewClient = function (item) {
                scope.client = item;
            };

            scope.showOrHideSearch = function(){
                if(scope.isExisitingClient){
                    scope.isExisitingClient = false;
                } else {
                    scope.isExisitingClient = true;
                }
            }

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
                        if(data.dateOfBirth.length > 0){
                            var dateOfBirth= dateFilter(new Date(data.dateOfBirth), scope.df);
                            scope.formData.dateOfBirth  = dateOfBirth;
                            var age = Math.floor((new Date() - new Date(dateOfBirth)) / (31557600000));
                            scope.formData.age = age;
                        }
                    }
                });
            };

        }
    });
    mifosX.ng.application.controller('CreateFamilyMemberController', ['$q','$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', 'dateFilter', mifosX.controllers.CreateFamilyMemberController]).run(function ($log) {
        $log.info("CreateFamilyMemberController initialized");
    });

}(mifosX.controllers || {}));