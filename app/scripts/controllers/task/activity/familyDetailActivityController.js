(function (module) {
    mifosX.controllers = _.extend(module, {
        familyDetailActivityController: function ($controller,scope, routeParams, resourceFactory, location, $modal, route, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
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
                });
                
            }
            function populateData()
            {
                resourceFactory.familyDetails.getAll({
                    clientId: scope.clientId
                }, function (data) {
                    scope.familyMembers = data;
                    scope.showform=false;
                });
            } 
            scope.addMember = function () 
                {
                    populateTemplateData();
                    scope.showform=true;
                    scope.formData={};
                };
            scope.cancel = function () 
                {
                    scope.showform=false;
                };
            
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
                if (scope.occupationId) {
                    this.formData.occupationDetailsId = scope.occupationOption.id;
                }

                if (scope.educationId) {
                    this.formData.educationId = scope.educationId;
                }
                scope.formData.dateFormat = scope.df;
                this.formData.locale = scope.optlang.code;
                resourceFactory.familyDetails.save({clientId: scope.clientId}, this.formData, function (data) {
                    populateData();
                });
            };
        }
    });
    mifosX.ng.application.controller('familyDetailActivityController', ['$controller','$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', 'dateFilter', mifosX.controllers.familyDetailActivityController]).run(function ($log) {
        $log.info("familyDetailActivityController initialized");
    });

}(mifosX.controllers || {}));