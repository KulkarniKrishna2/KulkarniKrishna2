(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewVillageController: function (scope, routeParams, location, resourceFactory, dateFilter, route, $modal, $rootScope) {
            scope.village = {};
            scope.addressId ;
            scope.datatabledetails = {};
            scope.datatabledetails.isData;
            resourceFactory.DataTablesResource.getAllDataTables({apptable: 'chai_villages', isFetchBasicData: true}, function (data) {
                scope.datatables = data;
                if(scope.datatables && scope.datatables[0]){
                scope.dataTableChange(scope.datatables[0].datatablename);
                }
            });

            resourceFactory.villageResource.get({villageId: routeParams.id, associations: 'setOfCenters,hierarchy'}, function (data) {

                scope.village = data;
                $rootScope.villageNameDataParameter = scope.village.villageName;
                $rootScope.villageId = scope.village.villageId;
                scope.activationDate = new Date(scope.village.timeline.activatedOnDate);
                scope.village.timeline.activatedOnDate = dateFilter(scope.activationDate, scope.df);
                scope.submittedDate = new Date(scope.village.timeline.submittedOnDate);
                scope.village.timeline.submittedOnDate = dateFilter(scope.submittedDate, scope.df);
            });

            scope.dataTableChange = function (datatable) {
                if(datatable){
                scope.datatabledetails = {};
                scope.datatabledetails.isData;
                resourceFactory.DataTablesResource.getTableDetails({datatablename: datatable.registeredTableName, entityId: routeParams.id, genericResultSet: 'true'}, function (data) {
                    scope.datatabledetails = data;
                    scope.datatabledetails.isData = data.data.length > 0 ? true : false;
                    scope.datatabledetails.isMultirow = data.columnHeaders[0].columnName == "id" ? true : false;
                    scope.datatabledetails.isColumnData = data.columnData.length > 0 ? true : false;
                    scope.showDataTableAddButton = !scope.datatabledetails.isData || scope.datatabledetails.isMultirow;
                    scope.showDataTableEditButton = scope.datatabledetails.isData && !scope.datatabledetails.isMultirow;
                    scope.singleRow = [];
                    scope.isSectioned = false;
                    scope.sections = [];
                    for (var i in data.columnHeaders) {
                        if (scope.datatabledetails.columnHeaders[i].columnCode) {
                            for (var j in scope.datatabledetails.columnHeaders[i].columnValues) {
                                for (var k in data.data) {
                                    if (data.data[k].row[i] == scope.datatabledetails.columnHeaders[i].columnValues[j].id) {
                                        data.data[k].row[i] = scope.datatabledetails.columnHeaders[i].columnValues[j].value;
                                    }
                                }
                                for(var m in data.columnData){
                                    for(var n in data.columnData[m].row){
                                        if(data.columnData[m].row[n].columnName == scope.datatabledetails.columnHeaders[i].columnName && data.columnData[m].row[n].value == scope.datatabledetails.columnHeaders[i].columnValues[j].id){
                                            data.columnData[m].row[n].value = scope.datatabledetails.columnHeaders[i].columnValues[j].value;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if(data.sectionedColumnList != null && data.sectionedColumnList !=undefined && data.sectionedColumnList.length > 0){
                        scope.isSectioned = true;
                    }
                    
                    if (scope.datatabledetails.isColumnData) {
                        for (var i in data.columnHeaders) {
                            if (!scope.datatabledetails.isMultirow) {
                                var row = {};
                                row.key = data.columnHeaders[i].columnName;
                                for(var j in data.columnData[0].row){
                                    if(data.columnHeaders[i].columnName == data.columnData[0].row[j].columnName){
                                       row.value = data.columnData[0].row[j].value;
                                       break;
                                    }
                                }
                                scope.singleRow.push(row);
                            }
                            var index = scope.datatabledetails.columnData[0].row.findIndex(x => x.columnName==data.columnHeaders[i].columnName);
                            if(index > 0 ){
                                if(data.columnHeaders[i].displayName != undefined && data.columnHeaders[i].displayName != 'null') {
                                    scope.datatabledetails.columnData[0].row[index].displayName = data.columnHeaders[i].displayName;
                                } 
                            }
                        }
                    }
                    for(var l in data.sectionedColumnList){
                        var tempSection = {
                            displayPosition:data.sectionedColumnList[l].displayPosition,
                            displayName: data.sectionedColumnList[l].displayName,
                            cols: []
                        }
                        scope.sections.push(tempSection);
                    }
                    if(scope.isSectioned){
                        if (scope.datatabledetails.isColumnData) {
                            for(var l in data.sectionedColumnList){
                                for (var i in data.sectionedColumnList[l].columns) {
                                    for (var j in data.columnHeaders) {
                                        if(data.sectionedColumnList[l].columns[i].columnName == data.columnHeaders[j].columnName ){
                                            var index = scope.sections.findIndex(x => x.displayName==data.sectionedColumnList[l].displayName);
                                            if (!scope.datatabledetails.isMultirow) {
                                                var row = {};
                                                if(data.columnHeaders[j].displayName != undefined && data.columnHeaders[j].displayName != 'null') {
                                                    row.key = data.columnHeaders[j].displayName;
                                                } else {
                                                    row.key = data.columnHeaders[j].columnName;
                                                }
                                                row.columnDisplayType = data.columnHeaders[j].columnDisplayType;
                                                for(var k in data.columnData[0].row){
                                                    if(data.columnHeaders[j].columnName == data.columnData[0].row[k].columnName){
                                                        row.value = data.columnData[0].row[k].value;
                                                        break;
                                                    }
                                                }
                                                scope.sections[index].cols.push(row);
                                            }
                                        } 
                                    }
                                }
                            }
                        }
                    }
                });
            }
            };

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

            scope.deleteAll = function (apptableName, entityId) {
                resourceFactory.DataTablesResource.delete({datatablename: apptableName, entityId: entityId, genericResultSet: 'true'}, {}, function (data) {
                    route.reload();
                });
            };
            scope.getOfficeName=function(officeName,officeReferenceNumber){
                if(!scope.isReferenceNumberAsNameEnable){
                    return officeName;
                }else{
                    return officeName+ ' - ' + officeReferenceNumber;
                }
            }

            scope.initiateWorkflow = function (villageId) {
                resourceFactory.villageResource.save({villageId: villageId, command: 'initiateWorkflow'},{}, function (data) {
                    location.path('/villageworkflow/'+data.resourceId+'/workflow');

                });
            };
        }
    });
    mifosX.ng.application.controller('ViewVillageController', ['$scope', '$routeParams', '$location', 'ResourceFactory', 'dateFilter', '$route', '$modal', '$rootScope', mifosX.controllers.ViewVillageController]).run(function ($log) {
        $log.info("ViewVillageController initialized");
    });
}(mifosX.controllers || {}));
