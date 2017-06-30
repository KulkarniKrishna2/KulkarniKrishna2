(function (module) {
    mifosX.controllers = _.extend(module, {
        ListFamilyDetailController: function (scope, routeParams, resourceFactory, location, $modal, route) {

            scope.clientId = routeParams.clientId;

            resourceFactory.familyDetails.getAll({clientId: scope.clientId}, function (data) {
                scope.familyMembers = data;
                    scope.checkIfFamilyMemberIsExistingCustomer(scope.familyMembers);
                    scope.differentiateFamilyMemberDetailsBaseOnReferenceId(scope.familyMembers);
            });

            scope.checkIfFamilyMemberIsExistingCustomer = function(familyMembers){
                for(var i in familyMembers){
                    familyMembers[i].isExistingCustomer = false;
                    if(familyMembers[i].clientReference){
                        familyMembers[i].isExistingCustomer = true;
                    }
                }
            }

            scope.routeTo = function (id) {
                location.path('/clients/' + scope.clientId + '/viewfamilydetails/' + id);
            };

            scope.showEdit = function (id) {
                location.path('/clients/' + scope.clientId + '/editfamilydetails/' + id);
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

             scope.routeToClientDetails = function (familyMember) {
                if( familyMember.clientReference ){
                    location.path('/viewclient/' + familyMember.clientReference);
                }
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
            scope.differentiateFamilyMemberDetailsBaseOnReferenceId = function(familyMembers){
                scope.familyDetailsOfClient = [];
                scope.familyMemberOf = [];
                for(var i in familyMembers){
                    if(familyMembers[i].clientReference == scope.clientId){
                        scope.familyMemberOf.push(familyMembers[i]);
                    }
                    else if(familyMembers[i].id){
                        scope.familyDetailsOfClient.push(familyMembers[i]);
                    }

                }
            }
            scope.routeToClient = function (id) {
              location.path('/viewclient/' + id);   
           };
        }

    });
    mifosX.ng.application.controller('ListFamilyDetailController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', mifosX.controllers.ListFamilyDetailController]).run(function ($log) {
        $log.info("ListFamilyDetailController initialized");
    });

}(mifosX.controllers || {}));