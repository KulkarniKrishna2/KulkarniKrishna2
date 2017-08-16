(function (module) {
    mifosX.controllers = _.extend(module, {
        familyDetailActivityController: function ($controller,scope, routeParams, resourceFactory, location, $modal, route, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.clientId = scope.taskconfig['clientId'];
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
                populateTemplateData();
                resourceFactory.familyDetails.getAll({
                    clientId: scope.clientId
                }, function (data) {
                    scope.familyMembers = data;
                    scope.showform=false;
                });
            } 
            scope.addMember = function () 
                {
                    scope.familyMemberId=undefined;
                    scope.showform=true;
                    scope.formData={};
                };
            scope.cancel = function () 
                {
                    scope.showform=false;
                };
            scope.submit = function () {
                scope.formData.dateFormat = scope.df;
                this.formData.locale = scope.optlang.code;
                if(scope.familyMemberId==undefined){
                    resourceFactory.familyDetails.save({clientId: scope.clientId}, this.formData, function (data) {
                    populateData();
                    });    
                }
                else
                {
                    resourceFactory.familyDetails.update({clientId: scope.clientId,familyDetailId: scope.familyMemberId}   
                        , scope.formData, function (data) {
                        populateData();
                });
                }
                
            };

            scope.showEdit = function (id) {
                scope.familyMemberId=id;
                scope.formData={};
                var i=0;
                var member={};
                for(i=0;i<scope.familyMembers.length;i++){
                    if(scope.familyMembers[i].id==id){
                        member=scope.familyMembers[i];
                        break;
                    }
                }
                if(member.salutation!=undefined){
                    scope.formData.salutationId=member.salutation.id;
                }
                if(member.relationship!=undefined){
                    scope.formData.relationshipId=member.relationship.id;
                }
                if(member.gender!=undefined){
                    scope.formData.genderId=member.gender.id;
                }
                if(member.occupation!=undefined){
                    var j=0;
                    for(j=0;j<scope.occupationOptions.length;j++){
                        if(scope.occupationOptions[j].id==member.occupation.cashflowCategoryId){
                            scope.occupationOption=scope.occupationOptions[j];
                            scope.formData.occupationDetailsId=member.occupation.id;
                        }
                    }
                    
                }
                if(member.education!=undefined){
                    scope.formData.educationId=member.education.id;
                }
                scope.formData.isDependent=member.isDependent;
                scope.formData.isSeriousIllness=member.isSeriousIllness;
                scope.formData.isDeceased=member.isDeceased;
                scope.formData.firstname=member.firstname;
                scope.formData.lastname=member.lastname;
                scope.formData.age=member.age;
                if(!member.middlename==undefined){
                    scope.formData.middlename=member.middlename;
                }
                scope.showform=true;
            };

            var FamilyDetailsDeleteCtrl = function ($scope, $modalInstance, familyDetailsId) {
                $scope.delete = function () {
                    resourceFactory.familyDetails.delete({
                        clientId: scope.clientId,
                        familyDetailId: familyDetailsId
                    }, {}, function (data) {
                        $modalInstance.close('delete');
                        route.reload();
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.deleteFamilyDetail = function (id) {
                $modal.open({
                    templateUrl: 'deletefamilydetail.html',
                    controller: FamilyDetailsDeleteCtrl,
                    resolve: {
                        familyDetailsId: function () {
                            return id;
                        }
                    }
                });
            };
        }
    });
    mifosX.ng.application.controller('familyDetailActivityController', ['$controller','$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', 'dateFilter', mifosX.controllers.familyDetailActivityController]).run(function ($log) {
        $log.info("familyDetailActivityController initialized");
    });

}(mifosX.controllers || {}));