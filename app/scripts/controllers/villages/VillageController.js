(function (module) {
    mifosX.controllers = _.extend(module, {
        VillageController: function (scope, resourceFactory, location, paginatorUsingOffsetService) {
            scope.villages = [];
            scope.actualVillages = [];
            scope.searchText = "";
            scope.searchResults = [];
            scope.routeTo = function (id) {
                location.path('/viewvillage/' + id);
            };

            if (!scope.searchCriteria.villages) {
                scope.searchCriteria.villages = null;
                scope.saveSC();
            }
            scope.filterText = scope.searchCriteria.villages;

            scope.onFilter = function () {
                scope.searchCriteria.villages = scope.filterText;
                scope.saveSC();
            };


            scope.villagesPerPage = 15;

            var fetchFunction = function (offset, limit, callback) {
                 resourceFactory.villageResource.getAll({
                    offset: offset,
                    limit: limit,
                    orderBy: 'name',
                    sortOrder: 'ASC'
                }, callback);
            };

            scope.initiateWorkflow = function (villageId) {
                resourceFactory.villageResource.save({villageId: villageId, command: 'initiateWorkflow'},{}, function (data) {
                     location.path('/villageworkflow/'+data.resourceId+'/workflow');

                });
            } ;

            scope.initPage = function () {
                scope.villages = paginatorUsingOffsetService.paginate(fetchFunction, scope.villagesPerPage);
            }
            scope.initPage();
            scope.getOfficeName=function(officeName,officeReferenceNumber){
                if(!scope.isReferenceNumberAsNameEnable){
                    return officeName;
                }else{
                    return officeName+ ' - ' + officeReferenceNumber;
                }
            }
            scope.search = function () {
                scope.actualVillages = [];
                scope.searchResults = [];
                scope.filterText = "";
                if(!scope.searchText){
                    scope.initPage();
                } else {
                    var exactMatch= scope.searchRule;
                    resourceFactory.globalSearch.search({query: scope.searchText ,  resource: "villages",exactMatch: exactMatch}, function (data) {
                        var arrayLength = data.length;
                        for (var i = 0; i < arrayLength; i++) {
                            var result = data[i];
                            var village = {};
                            village.status = {};
                            village.subStatus = {};
                            if(result.entityType  == 'VILLAGE') {
                                village.villageName = result.entityName;
                                village.villageId = result.entityId;
                                village.officeName = result.parentName;
                                village.status.value = result.entityStatus.value;
                                village.status.code = result.entityStatus.code;
                                village.externalId = result.entityExternalId;
                                scope.actualVillages.push(village);
                            }
                        }
                        var numberOfVillages = scope.actualVillages.length;
                        scope.totalVillages = numberOfVillages;
                        scope.villages = scope.actualVillages.slice(0, scope.villagesPerPage);
                    });
                }
            }
        }
    });
    mifosX.ng.application.controller('VillageController', ['$scope', 'ResourceFactory', '$location','PaginatorUsingOffsetService', mifosX.controllers.VillageController]).run(function ($log) {
        $log.info("VillageController initialized");
    });
}(mifosX.controllers || {}));