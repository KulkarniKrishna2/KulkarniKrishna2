(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewVillageController: function (scope, routeParams, location, resourceFactory, dateFilter, route, $modal) {
            scope.village = {};
            scope.addressId ;

            resourceFactory.villageResource.get({villageId: routeParams.id, associations: 'setOfCenters,hierarchy'}, function (data) {

                scope.village = data;
                scope.activationDate = new Date(scope.village.timeline.activatedOnDate);
                scope.village.timeline.activatedOnDate = dateFilter(scope.activationDate, scope.df);
                scope.submittedDate = new Date(scope.village.timeline.submittedOnDate);
                scope.village.timeline.submittedOnDate = dateFilter(scope.submittedDate, scope.df);
            });

            scope.expandAll = function (center, expanded) {
                center.isExpanded = expanded;
            };
            scope.expandGroup = function (group, expanded) {
                group.isExpanded = expanded;
            };
            scope.expandClient = function (client, expanded) {
                client.isExpanded = expanded;
            };

            scope.routeToCenter = function (id) {
                location.path('/viewcenter/' + id);
            };
            scope.routeToLoan = function (id) {
                location.path('/viewloanaccount/' + id);
            };
            scope.routeToGroup = function (id) {
                location.path('/viewgroup/' + id);
            };
            scope.routeToClient = function (id) {
                location.path('/viewclient/' + id);
            };
            scope.deleteVillage = function () {
                $modal.open({
                    templateUrl: 'deletevillage.html',
                    controller: VillageDeleteCtrl
                });
            };
            var VillageDeleteCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    resourceFactory.villageResource.delete({villageId: routeParams.id}, {}, function (data) {
                        $modalInstance.close('delete');
                        location.path('/villages');
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            scope.deleteVillageAddress = function (addressId) {
                scope.addressId = addressId;
                $modal.open({
                    templateUrl: 'deletevillageaddress.html',
                    controller: VillageAddressDeleteCtrl
                });
            }
            scope.entityType = "villages";
            var VillageAddressDeleteCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    resourceFactory.entityAddressResource.delete({entityType: scope.entityType, entityId: routeParams.id, addressId: scope.addressId}, function (response) {
                        $modalInstance.close('delete');
                        if(response != null) {
                            route.reload();
                        }
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            scope.changeState = function (disabled) {
                resourceFactory.villageResource.update({'villageId': routeParams.id}, {disabled: !disabled}, function (data) {
                    route.reload();
                });
            };

            scope.expand = function(data){
                data.expanded = !data.expanded;
            };

            function getprofileRating(){
                resourceFactory.profileRating.get({entityType: 6,entityId : routeParams.id}, function (data) {
                    scope.profileRatingData = data;
                });
            };
            getprofileRating();
            scope.reComputeProfileRating = function () {
                scope.profileRatingData = {};
                resourceFactory.computeProfileRatingTemplate.get(function (response) {
                    for(var i in response.scopeEntityTypeOptions){
                        if(response.scopeEntityTypeOptions[i].value === 'OFFICE'){
                            scope.profileRatingData.scopeEntityType = response.scopeEntityTypeOptions[i].id;
                            scope.profileRatingData.scopeEntityId =  scope.village.officeId;
                            break;
                        }
                    }
                    for(var i in response.entityTypeOptions){
                        if(response.entityTypeOptions[i].value === 'VILLAGE'){
                            scope.profileRatingData.entityType = response.entityTypeOptions[i].id;
                            scope.profileRatingData.entityId =  routeParams.id;
                            break;
                        }
                    }
                    scope.profileRatingData.locale = "en";
                    resourceFactory.computeProfileRating.save(scope.profileRatingData, function (response) {
                        getprofileRating();
                    });
                });
            };

            scope.initiateWorkflow = function (villageId) {
                resourceFactory.villageResource.save({villageId: villageId, command: 'initiateWorkflow'},{}, function (data) {
                    location.path('/villageworkflow/'+data.resourceId+'/workflow');

                });
            };
        }
    });
    mifosX.ng.application.controller('ViewVillageController', ['$scope', '$routeParams', '$location', 'ResourceFactory', 'dateFilter', '$route', '$modal', mifosX.controllers.ViewVillageController]).run(function ($log) {
        $log.info("ViewVillageController initialized");
    });
}(mifosX.controllers || {}));
