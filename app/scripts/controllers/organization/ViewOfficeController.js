(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewOfficeController: function (scope, routeParams, route, location, resourceFactory, $rootScope, $modal) {
            scope.charges = [];
            scope.sections = [];
            
            resourceFactory.officeResource.get({officeId: routeParams.id}, function (data) {
                scope.office = data;
                $rootScope.officeName = data.name;
            });

            resourceFactory.DataTablesResource.getAllDataTables({apptable: 'm_office'}, function (data) {
                scope.datatables = data;
            });
            scope.dataTableChange = function (officedatatable) {
                resourceFactory.DataTablesResource.getTableDetails({datatablename: officedatatable.registeredTableName,
                    entityId: routeParams.id, genericResultSet: 'true'}, function (data) {
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
            };

            scope.deleteAll = function (apptableName, entityId) {
                resourceFactory.DataTablesResource.delete({datatablename: apptableName, entityId: entityId, genericResultSet: 'true'}, {}, function (data) {
                    route.reload();
                });
            };

            scope.viewDataTable = function (registeredTableName, data){
                if (scope.datatabledetails.isMultirow) {
                    location.path("/viewdatatableentry/"+registeredTableName+"/"+scope.office.id+"/"+data.row[0].value);
                }else{
                    location.path("/viewsingledatatableentry/"+registeredTableName+"/"+scope.office.id);
                }
            };

            scope.activateOffice = function() {
                $modal.open({
                    templateUrl: 'activateOffice.html',
                    controller: ActivateOfficeCtrl
                });
            };

            var ActivateOfficeCtrl = function ($scope, $modalInstance) {
                $scope.activate = function () {
                    resourceFactory.officeResource.save({officeId: routeParams.id, command:'activate'}, {}, function (data) {
                        $modalInstance.close('activate');
                        route.reload();
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.rejectOffice = function() {
                $modal.open({
                    templateUrl: 'rejectOffice.html',
                    controller: RejectOfficeCtrl
                });
            };

            var RejectOfficeCtrl = function ($scope, $modalInstance) {
                $scope.reject = function () {
                    resourceFactory.officeResource.save({officeId: routeParams.id, command:'reject'}, {}, function (data) {
                        $modalInstance.close('reject');
                        route.reload();
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
        }

    });
    mifosX.ng.application.controller('ViewOfficeController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$rootScope', '$modal', mifosX.controllers.ViewOfficeController]).run(function ($log) {
        $log.info("ViewOfficeController initialized");
    });
}(mifosX.controllers || {}));