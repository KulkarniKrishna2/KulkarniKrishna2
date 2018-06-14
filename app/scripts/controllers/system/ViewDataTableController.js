(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewDataTableController: function (scope, routeParams, resourceFactory, location, $modal) {
            var  idList = ['client_id', 'office_id', 'group_id', 'center_id', 'loan_id', 'savings_account_id', 'gl_journal_entry_id', 'loan_application_reference_id', 'journal_entry_id', 'district_id'];
            resourceFactory.DataTablesResource.getTableDetails({datatablename: routeParams.tableName}, function (data) {
                var temp = [];
                for (var i in data.columnHeaderData){
                    var colName = data.columnHeaderData[i].columnName;
                    if(colName == 'id'){
                        data.columnHeaderData.splice(i, 1);
                        colName = data.columnHeaderData[i].columnName;
                    }
                    
                    if(idList.indexOf(colName) >= 0 ){
                        data.columnHeaderData.splice(i, 1);
                    } 
                }

                for (var i = 0; i < data.columnHeaderData.length; i++) {
                    if (data.columnHeaderData[i].columnName.indexOf("_cd_") > 0) {
                        temp = data.columnHeaderData[i].columnName.split("_cd_");
                        data.columnHeaderData[i].columnName = temp[1];
                        data.columnHeaderData[i].code = temp[0];
                    }
                    if(data.columnHeaderData[i].sectionId != undefined && data.columnHeaderData[i].sectionId > 0){
                        data.columnHeaderData[i].sectionName = " ";
                    }
                }
                if(data.sectionDataList != undefined && data.sectionDataList != null){
                    for (var j = 0; j<data.sectionDataList.length ; j++){
                        for (var i = 0; i < data.columnHeaderData.length; i++) {
                            if(data.columnHeaderData[i].sectionId != undefined && data.columnHeaderData[i].sectionId == data.sectionDataList[j].id ){
                                data.columnHeaderData[i].sectionName = data.sectionDataList[j].displayName;
                            }
                        }
                    }
                }

                scope.datatable = data;
            });
            scope.deleteTable = function () {
                $modal.open({
                    templateUrl: 'deletetable.html',
                    controller: TableDeleteCtrl
                });
            };
            var TableDeleteCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    resourceFactory.DataTablesResource.delete({datatablename: routeParams.tableName}, {}, function (data) {
                        $modalInstance.close('delete');
                        location.path('/datatables');
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            scope.hideField = function(data){
               if(idList.indexOf(data.columnName) >= 0) {
                return true;
               }
               return false;
            }
            
        }
        
    });
    mifosX.ng.application.controller('ViewDataTableController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', mifosX.controllers.ViewDataTableController]).run(function ($log) {
        $log.info("ViewDataTableController initialized");
    });
}(mifosX.controllers || {}));
