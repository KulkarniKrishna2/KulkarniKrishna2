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

            resourceFactory.familyDetailsTemplate.get({clientId: scope.clientId}, function (data) {
                scope.salutationOptions = data.salutationOptions;
                scope.relationshipOptions = data.relationshipOptions;
                scope.genderOptions = data.genderOptions;
                scope.educationOptions = data.educationOptions;
                scope.occupationOptions = data.occupationOptions;
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