(function (module) {
    mifosX.controllers = _.extend(module, {
        datatableActivityController: function ($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.datatabledetails = "";
            scope.status = 'VIEW';

            scope.getDetails = function () {
                resourceFactory.DataTablesResource.getTableDetails({
                    datatablename: scope.tableName,
                    entityId: scope.entityId, genericResultSet: 'true'
                }, function (data) {
                    scope.datatabledetails = data;
                    scope.datatabledetails.isData = (data !== undefined && data.data !== undefined && data.data.length > 0);
                    if (scope.datatabledetails.isData) {
                        scope.status = 'VIEW';
                        scope.datatabledetails.isMultirow = data.columnHeaders[0].columnName == "id" ? true : false;
                        scope.showDataTableAddButton = !scope.datatabledetails.isData || scope.datatabledetails.isMultirow;
                        scope.showDataTableEditButton = scope.datatabledetails.isData && !scope.datatabledetails.isMultirow;
                        scope.singleRow = [];
                        for (var i in data.columnHeaders) {
                            if (scope.datatabledetails.columnHeaders[i].columnCode) {
                                for (var j in scope.datatabledetails.columnHeaders[i].columnValues) {
                                    for (var k in data.data) {
                                        if (data.data[k].row[i] == scope.datatabledetails.columnHeaders[i].columnValues[j].id) {
                                            data.data[k].row[i] = scope.datatabledetails.columnHeaders[i].columnValues[j].value;
                                        }
                                    }
                                }
                            }
                        }
                        if (scope.datatabledetails.isData) {
                            for (var i in data.columnHeaders) {
                                if (!scope.datatabledetails.isMultirow) {
                                    var row = {};
                                    row.key = data.columnHeaders[i].columnName;
                                    row.columnDisplayType = data.columnHeaders[i].columnDisplayType;
                                    row.value = data.data[0].row[i];
                                    scope.singleRow.push(row);
                                }
                            }
                        }
                    } else {
                        scope.status = 'ADD';
                        scope.addData();
                    }
                });

            };

            scope.$on('inittask', function (event, data) {
                console.log("inside init task"); // 'Some data'
                initTask();
            });

            function initTask() {
                scope.tableName = scope.taskconfig['datatablename'];
                scope.entityId = scope.taskconfig['clientId'];
                scope.getDetails();
            };

            initTask();

            scope.addData = function () {
                scope.status = 'ADD';
                scope.fromEntity = 'client';
                scope.columnHeaders = [];
                scope.formData = {};
                scope.formDat = {};
                scope.tf = "HH:mm";
                scope.client = false;
                scope.group = false;
                scope.center = false;
                scope.office = false;
                scope.savingsaccount = false;
                scope.loanproduct = false;
                scope.showSelect = true;
                scope.clientName = 'chan';
                resourceFactory.DataTablesResource.getTableDetails({
                    datatablename: scope.tableName,
                    entityId: scope.entityId,
                    genericResultSet: 'true'
                }, function (data) {

                    var colName = data.columnHeaders[0].columnName;
                    if (colName == 'id') {
                        data.columnHeaders.splice(0, 1);
                    }

                    colName = data.columnHeaders[0].columnName;
                    if (colName == 'client_id' || colName == 'office_id' || colName == 'group_id' || colName == 'center_id' || colName == 'loan_id' || colName == 'savings_account_id') {
                        data.columnHeaders.splice(0, 1);
                        scope.isCenter = colName == 'center_id' ? true : false;
                    }

                    for (var i in data.columnHeaders) {
                        if (data.columnHeaders[i].columnDisplayType == 'DATETIME') {
                            scope.formDat[data.columnHeaders[i].columnName] = {};
                        }
                    }
                    scope.columnHeaders = data.columnHeaders;

                });
            };

            scope.changeVillage = function (id) {
                scope.villageId = id.id;
                scope.villageName = id.value;

                if (scope.tableName == "Address" && scope.fromEntity == "client") {
                    resourceFactory.villageResource.get({villageId: scope.villageId}, function (data) {
                        scope.villageData = data;
                        for (var i in scope.columnHeaders) {
                            if (scope.columnHeaders [i].columnName == "Taluk") {
                                scope.formData[scope.columnHeaders[i].columnName] = data.taluk;
                            } else if (scope.columnHeaders[i].columnName == "District") {
                                scope.formData[scope.columnHeaders[i].columnName] = data.district;
                            } else if (scope.columnHeaders[i].columnName == "State") {
                                scope.formData[scope.columnHeaders[i].columnName] = data.state;
                            } else if (scope.columnHeaders[i].columnName == "Pincode") {
                                scope.formData[scope.columnHeaders[i].columnName] = data.pincode;
                            }

                        }
                    });
                }
            }

            //return input type
            scope.fieldType = function (type) {
                var fieldType = "";
                if (type) {
                    if (type == 'CODELOOKUP' || type == 'CODEVALUE') {
                        fieldType = 'SELECT';
                    } else if (type == 'DATE') {
                        fieldType = 'DATE';
                    } else if (type == 'DATETIME') {
                        fieldType = 'DATETIME';
                    } else if (type == 'BOOLEAN') {
                        fieldType = 'BOOLEAN';
                    } else {
                        fieldType = 'TEXT';
                    }
                }
                return fieldType;
            };

            scope.dateTimeFormat = function () {
                for (var i in scope.columnHeaders) {
                    if (scope.columnHeaders[i].columnDisplayType == 'DATETIME') {
                        return scope.df + " " + scope.tf;
                    }
                }
                return scope.df;
            };

            scope.cancel = function () {
                if (scope.fromEntity == 'client') {
                    location.path('/viewclient/' + scope.entityId).search({});
                } else if (scope.fromEntity == 'group') {
                    location.path('/viewgroup/' + scope.entityId).search({});
                } else if (scope.fromEntity == 'center') {
                    location.path('/viewcenter/' + scope.entityId).search({});
                } else if (scope.fromEntity == 'loan') {
                    location.path('/viewloanaccount/' + scope.entityId).search({});
                } else if (scope.fromEntity == 'savings') {
                    location.path('/viewsavingaccount/' + scope.entityId).search({});
                } else if (scope.fromEntity == 'office') {
                    location.path('/viewoffice/' + scope.entityId).search({});
                }
                ;
            };
            scope.submit = function () {
                if (scope.showSelect == false) {
                    for (var i in scope.columnHeaders) {
                        if (scope.columnHeaders [i].columnName == "Village Name") {
                            this.formData[scope.columnHeaders[i].columnName] = scope.villageName;
                        }
                    }
                }
                var params = {datatablename: scope.tableName, entityId: scope.entityId, genericResultSet: 'true'};
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.dateTimeFormat();
                //below logic, for the input field if data is not entered, this logic will put "", because
                //if no data entered in input field , that field name won't send to server side.
                for (var i = 0; i < scope.columnHeaders.length; i++) {
                    if (!_.contains(_.keys(this.formData), scope.columnHeaders[i].columnName)) {
                        this.formData[scope.columnHeaders[i].columnName] = "";
                    }
                    if (scope.columnHeaders[i].columnDisplayType == 'DATE') {
                        this.formData[scope.columnHeaders[i].columnName] = dateFilter(this.formDat[scope.columnHeaders[i].columnName],
                            this.formData.dateFormat);
                    } else if (scope.columnHeaders[i].columnDisplayType == 'DATETIME') {
                        this.formData[scope.columnHeaders[i].columnName] = dateFilter(this.formDat[scope.columnHeaders[i].columnName].date, scope.df)
                            + " " + dateFilter(this.formDat[scope.columnHeaders[i].columnName].time, scope.tf);
                    }
                }
                resourceFactory.DataTablesResource.save(params, this.formData, function (data) {
                    scope.activityDone();
                    scope.getDetails();
                });
            };

            scope.editData = function () {
                scope.status = 'EDIT';
                scope.formDat = {};
                scope.columnHeaders = [];
                scope.formData = {};
                scope.isViewMode = false;
                scope.tf = "HH:mm";
                scope.client = false;
                scope.group = false;
                scope.center = false;
                scope.office = false;
                scope.savingsaccount = false;
                scope.loanproduct = false;
                var reqparams = {datatablename: scope.tableName, entityId: scope.entityId, genericResultSet: 'true'};
                resourceFactory.DataTablesResource.getTableDetails(reqparams, function (data) {
                    for (var i in data.columnHeaders) {
                        if (data.columnHeaders[i].columnCode) {
                            //logic for display codeValue instead of codeId in view datatable details
                            for (var j in data.columnHeaders[i].columnValues) {
                                if (data.columnHeaders[i].columnDisplayType == 'CODELOOKUP') {
                                    if (data.data[0].row[i] == data.columnHeaders[i].columnValues[j].id) {
                                        data.columnHeaders[i].value = data.columnHeaders[i].columnValues[j].value;
                                    }
                                } else if (data.columnHeaders[i].columnDisplayType == 'CODEVALUE') {
                                    if (data.data[0].row[i] == data.columnHeaders[i].columnValues[j].id) {
                                        data.columnHeaders[i].value = data.columnHeaders[i].columnValues[j].value;
                                    }
                                }
                            }
                        } else {
                            data.columnHeaders[i].value = data.data[0].row[i];
                        }
                    }
                    scope.columnHeaders = data.columnHeaders;
                    scope.editDatatableEntry();
                    // scope.$emit("activityEdit", {});
                });
            };

            scope.editDatatableEntry = function () {
                scope.isViewMode = false;
                var colName = scope.columnHeaders[0].columnName;
                if (colName == 'id') {
                    scope.columnHeaders.splice(0, 1);
                }

                colName = scope.columnHeaders[0].columnName;
                if (colName == 'client_id' || colName == 'office_id' || colName == 'group_id' || colName == 'center_id' || colName == 'loan_id' || colName == 'savings_account_id') {
                    scope.columnHeaders.splice(0, 1);
                    scope.isCenter = colName == 'center_id' ? true : false;
                }

                for (var i in scope.columnHeaders) {

                    if (scope.columnHeaders[i].columnDisplayType == 'DATE') {
                        scope.formDat[scope.columnHeaders[i].columnName] = scope.columnHeaders[i].value;
                    } else if (scope.columnHeaders[i].columnDisplayType == 'DATETIME') {
                        scope.formDat[scope.columnHeaders[i].columnName] = {};
                        if (scope.columnHeaders[i].value != null) {
                            scope.formDat[scope.columnHeaders[i].columnName] = {
                                date: dateFilter(new Date(scope.columnHeaders[i].value), scope.df),
                                time: dateFilter(new Date(scope.columnHeaders[i].value), scope.tf)
                            };
                        }
                    } else {
                        scope.formData[scope.columnHeaders[i].columnName] = scope.columnHeaders[i].value;
                    }
                    if (scope.columnHeaders[i].columnCode) {
                        for (var j in scope.columnHeaders[i].columnValues) {
                            if (scope.columnHeaders[i].value == scope.columnHeaders[i].columnValues[j].value) {
                                if (scope.columnHeaders[i].columnDisplayType == 'CODELOOKUP') {
                                    scope.formData[scope.columnHeaders[i].columnName] = scope.columnHeaders[i].columnValues[j].id;
                                } else if (scope.columnHeaders[i].columnDisplayType == 'CODEVALUE') {
                                    scope.formData[scope.columnHeaders[i].columnName] = scope.columnHeaders[i].columnValues[j].value;
                                }
                            }
                        }
                    }
                }
            };

            scope.editSubmit = function () {
                if (scope.showSelect == false) {
                    for (var i in scope.columnHeaders) {
                        if (scope.columnHeaders [i].columnName == "Village Name") {
                            this.formData[scope.columnHeaders[i].columnName] = scope.villageName;
                        }
                    }
                }
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.dateTimeFormat();
                for (var i = 0; i < scope.columnHeaders.length; i++) {
                    if (!_.contains(_.keys(this.formData), scope.columnHeaders[i].columnName)) {
                        this.formData[scope.columnHeaders[i].columnName] = "";
                    }
                    if (scope.columnHeaders[i].columnDisplayType == 'DATE') {
                        this.formData[scope.columnHeaders[i].columnName] = dateFilter(this.formDat[scope.columnHeaders[i].columnName], this.formData.dateFormat);
                    } else if (scope.columnHeaders[i].columnDisplayType == 'DATETIME') {
                        this.formData[scope.columnHeaders[i].columnName] = dateFilter(this.formDat[scope.columnHeaders[i].columnName].date, scope.df) + " " +
                            dateFilter(this.formDat[scope.columnHeaders[i].columnName].time, scope.tf);
                    }
                }
                var reqparams = {datatablename: scope.tableName, entityId: scope.entityId, genericResultSet: 'true'};
                resourceFactory.DataTablesResource.update(reqparams, this.formData, function (data) {
                    scope.getDetails();
                    scope.activityEdit();
                });
            };

            scope.doPreTaskActionStep = function(actionName){
                if(actionName === 'activitycomplete'){
                    if(isDataTableCompleted()){
                        scope.doActionAndRefresh(actionName);
                    }else{
                        scope.setTaskActionExecutionError("lable.error.activity.survey.not.completed");
                    }
                }else{
                    scope.doActionAndRefresh(actionName);
                }
            };

            function isDataTableCompleted(){
                var surveyCompleted   = true;
                if (scope.status != 'VIEW'){
                    surveyCompleted=false;
                }
                return surveyCompleted;
            };
        }
    });
    mifosX.ng.application.controller('datatableActivityController', ['$controller','$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.datatableActivityController]).run(function ($log) {
        $log.info("datatableActivityController initialized");
    });
}(mifosX.controllers || {}));
