(function (module) {
    mifosX.controllers = _.extend(module, {
        datatableActivityController: function ($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.datatabledetails = "";
            scope.status = 'VIEW';
            scope.sectionedColumnHeaders = [];
            scope.isMultirow = false;
            scope.isViewMultiRowTable = false;
            scope.resourceId = "";
            scope.isWorkFlow = scope.isSystemGlobalConfigurationEnabled('work-flow');
            var  idList = ['id','client_id', 'office_id', 'group_id', 'center_id', 'loan_id', 'savings_account_id', 'gl_journal_entry_id', 'loan_application_reference_id', 'journal_entry_id', 'district_id', 'villages_id'];

            scope.getDetails = function () {
                resourceFactory.DataTablesResource.getTableDetails({
                    datatablename: scope.tableName,
                    entityId: scope.entityId, genericResultSet: 'true'
                }, function (data) {
                    scope.datatabledetails = data;
                    scope.datatabledetails.isData = (data !== undefined && data.data !== undefined && data.data.length > 0);
                    scope.datatabledetails.isColumnData = (data !== undefined && data.columnData !== undefined && data.columnData.length > 0); 
                    if (scope.datatabledetails.isData) {
                        scope.status = 'VIEW';
                        scope.datatabledetails.isMultirow = data.columnHeaders[0].columnName == "id" ? true : false;
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
                                    
                                }
                            }
                            for(var m in data.columnData){
                                for(var n in data.columnData[m].row){
                                    if(data.columnData[m].row[n].columnName == scope.datatabledetails.columnHeaders[i].columnName){
                                        if(scope.datatabledetails.columnHeaders[i].columnDisplayType== 'MULTISELECTCODELOOKUP'||scope.datatabledetails.columnHeaders[i].columnDisplayType== 'CODELOOKUP'){
                                            var multiSelectValuesAsString = data.columnData[m].row[n].value;
                                            var multiSelectValuesAsArray = JSON.parse("[" + multiSelectValuesAsString + "]");
                                            var displayArray = [];
                                            for(var x in multiSelectValuesAsArray){
                                                
                                                for(var y in scope.datatabledetails.columnHeaders[i].columnValues){
                                                    if(multiSelectValuesAsArray[x]==scope.datatabledetails.columnHeaders[i].columnValues[y].id){
                                                        displayArray.push(scope.datatabledetails.columnHeaders[i].columnValues[y].value);
                                                    }
                                                }
                                            }
                                            data.columnData[m].row[n].value = displayArray.toString();
                                        }
                                    }
                                }
                            }
    
                        }

                        if(data.sectionedColumnList !=undefined && data.sectionedColumnList != null &&  data.sectionedColumnList.length > 0){
                            scope.isSectioned = true;
                        }
                      
                        if (scope.datatabledetails.isColumnData) {
                            for (var i in data.columnHeaders) {
                                if (!scope.datatabledetails.isMultirow) {
                                    var row = {};
                                    if(data.columnHeaders[i].displayName != undefined && data.columnHeaders[i].displayName != 'null') {
                                        row.key = data.columnHeaders[i].displayName;
                                    } else {
                                        row.key = data.columnHeaders[i].columnName;
                                    }
                                    row.columnDisplayType = data.columnHeaders[i].columnDisplayType;
                                    row.formula = data.columnHeaders[i].formula;
                                    for(var j in data.columnData[0].row){
                                        if(data.columnHeaders[i].columnName == data.columnData[0].row[j].columnName){
                                           row.value = data.columnData[0].row[j].value;
                                           break;
                                        }
                                    }
                                    if(idList.indexOf(row.key) < 0)
                                    scope.singleRow.push(row);
                                } else {
                                   
                                         if(data.columnHeaders[i].displayName != undefined && data.columnHeaders[i].displayName != 'null') {
                                            var columnIndex = data.columnData[0].row.findIndex(x => x.columnName==data.columnHeaders[i].columnName);
                                            if(columnIndex>0){
                                                data.columnData[0].row[columnIndex].displayName = data.columnHeaders[i].displayName; 
                                            }
                                        }
                                    
                                }
                            }    
                        }
                    
                    if(scope.isSectioned){
                        for(var i in data.sectionedColumnList){
                            var tempSection = {
                            displayPosition:data.sectionedColumnList[i].displayPosition,
                            displayName: data.sectionedColumnList[i].displayName,
                            columns: []
                            }
                            scope.sections.push(tempSection);
                        }
                        if (scope.datatabledetails.isColumnData) {
                            for(var l in data.sectionedColumnList){
                                for (var i in data.sectionedColumnList[l].columns) {
                                        var index = scope.sections.findIndex(x => x.displayName==data.sectionedColumnList[l].displayName);
                                        if (!scope.datatabledetails.isMultirow) {   
                                            var row = {};
                                                if(data.sectionedColumnList[l].columns[i].displayName != undefined && data.sectionedColumnList[l].columns[i].displayName != 'null') {
                                                    row.key = data.sectionedColumnList[l].columns[i].displayName;
                                                } else {
                                                    row.key = data.sectionedColumnList[l].columns[i].columnName;
                                                }
                                                row.columnDisplayType = data.sectionedColumnList[l].columns[i].columnDisplayType;
                                                row.formula = data.columnHeaders[i].formula;
                                                for(var k in data.columnData[0].row){
                                                    if(data.sectionedColumnList[l].columns[i].columnName == data.columnData[0].row[k].columnName){
                                                        row.value = data.columnData[0].row[k].value;
                                                        break;
                                                    }
                                                }
                                                scope.sections[index].columns.push(row);
                                            }
                                }
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
                var entityType = scope.taskconfig['entityType'];
                entityType = entityType+"Id";
                scope.entityId = scope.taskconfig[entityType];
                if(_.isUndefined(scope.entityId)){
                  scope.entityId = scope.$parent.memberId;  
                }
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
                var data = scope.datatabledetails;  
                var colName = data.columnHeaders[0].columnName;
                    if (colName == 'id') {
                        data.columnHeaders.splice(0, 1);
                    }
                    for (var i in data.columnHeaders){
                        var colName = data.columnHeaders[i].columnName;
                        if(idList.indexOf(colName) >= 0 ){
                            data.columnHeaders.splice(i, 1);
                            scope.isCenter = colName == 'center_id' ? true : false;
                        } 
                    }

                    for (var i in data.columnHeaders) {
                        if (data.columnHeaders[i].columnDisplayType == 'DATETIME') {
                            scope.formDat[data.columnHeaders[i].columnName] = {};
                        } else if ((data.columnHeaders[i].columnDisplayType == 'CODELOOKUP' || data.columnHeaders[i].columnDisplayType == 'MULTISELECTCODELOOKUP') && data.columnHeaders[i].columnValues) {
                            scope.columnValueLookUp = data.columnHeaders[i].columnValues;
                            scope.newcolumnHeaders = angular.fromJson(data.columnHeaders);
                            for (var j in data.columnHeaders[i].columnValues) {
                                scope.newcolumnHeaders[i].columnValuesLookup = scope.columnValueLookUp;
                            }

                        }
                    }
                    scope.columnHeaders = data.columnHeaders;

                    if(data.sectionedColumnList != undefined && data.sectionedColumnList != null && data.sectionedColumnList.length > 0){
                        scope.isSectioned = true;
                        for (var i in data.sectionedColumnList) {
                            for(var j in data.sectionedColumnList[i].columns){
                                if (data.sectionedColumnList[i].columns[j].visible != undefined && !data.sectionedColumnList[i].columns[j].visible) {
                                    data.sectionedColumnList[i].columns.splice(j, 1);
                                }
                            }
                        }
                        for (var i in data.sectionedColumnList) {
                            for(var j in data.sectionedColumnList[i].columns){
                                if (data.sectionedColumnList[i].columns[j].columnDisplayType == 'DATETIME') {
                                    scope.formDat[data.sectionedColumnList[i].columns[j].columnName] = {};
                                }
                                if (data.sectionedColumnList[i].columns[j].columnDisplayType == 'CODELOOKUP' && data.sectionedColumnList[i].columns[j].columnValues) {
                                    scope.columnValueLookUp = data.sectionedColumnList[i].columns[j].columnValues;
                                    for (var k in data.sectionedColumnList[i].columns[j].columnValues) {
                                        data.sectionedColumnList[i].columns[j].columnValuesLookup = scope.columnValueLookUp;
                                    }

                                }
                            }
                        }    
                        scope.sectionedColumnHeaders = data.sectionedColumnList;
                    }
                    scope.evaluateFormulas();
            };

            scope.evaluateFormulas = function() {
                for (var i in scope.columnHeaders) {
                    if (scope.columnHeaders[i].formula) {
                        var formulaString = scope.columnHeaders[i].formula;
                        scope.formData[scope.columnHeaders[i].columnName] = "";
                        for (var j in scope.columnHeaders) {
                            if (formulaString.indexOf("{" + scope.columnHeaders[j].columnName + "}") > -1 && !_.isUndefined(scope.formData[scope.columnHeaders[j].columnName])) {
                                scope.formData[scope.columnHeaders[j].columnName] = scope.formData[scope.columnHeaders[j].columnName];
                                formulaString = formulaString.replace("{" + scope.columnHeaders[j].columnName + "}", scope.formData[scope.columnHeaders[j].columnName]);
                                if (formulaString.indexOf('{') == -1) {
                                    scope.formData[scope.columnHeaders[i].columnName] = eval(formulaString);
                                }
                            }
                        }
                    }
                }
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
                    }else if (type == 'STRING') {
                        fieldType = 'STRING';
                    } else {
                        fieldType = type ;
                    }
                }
                return fieldType;
            };
            
            scope.isNumericField = function(type) {
                var isNumericField = false;
                if (type == 'INTEGER' || type == 'DECIMAL') {
                    isNumericField = true;
                }
                return isNumericField;
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
                    } else if(scope.columnHeaders[i].columnDisplayType == 'MULTISELECTCODELOOKUP'){
                        var multiSelectAsValuesArray = this.formData[scope.columnHeaders[i].columnName];
                        this.formData[scope.columnHeaders[i].columnName] = multiSelectAsValuesArray.toString(); 
                    }
                }
                resourceFactory.DataTablesResource.save(params, this.formData, function (data) {
                    scope.activityDone();
                    scope.getDetails();
                    scope.$emit('addDatatableDetails', scope.entityId);
                });
            };

            scope.initializeEditParameters = function(){
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
            };

            scope.editData = function () {
                scope.initializeEditParameters();
                var reqparams = {datatablename: scope.tableName, entityId: scope.entityId, genericResultSet: 'true'};
                scope.processData(reqparams);
            };
            scope.processData = function(reqparams){
                resourceFactory.DataTablesResource.getTableDetails(reqparams, function (data) {
                    for (var i in data.columnHeaders) {
                        if (data.columnHeaders[i].columnDisplayType == 'DATETIME') {
                            scope.formDat[data.columnHeaders[i].columnName] = {};
                        } else if ((data.columnHeaders[i].columnDisplayType == 'CODELOOKUP' || data.columnHeaders[i].columnDisplayType == 'MULTISELECTCODELOOKUP')&& data.columnHeaders[i].columnValues) {
                            scope.columnValueLookUp = data.columnHeaders[i].columnValues;
                            scope.newcolumnHeaders = angular.fromJson(data.columnHeaders);
                            for (var j in data.columnHeaders[i].columnValues) {
                                scope.newcolumnHeaders[i].columnValuesLookup = scope.columnValueLookUp;
                            }
    
                        }
                        for(var s in data.columnData[0].row){
                            if(data.columnHeaders[i].columnName === data.columnData[0].row[s].columnName){
                                 if (data.columnHeaders[i].columnCode) {
                            //logic for display codeValue instead of codeId in view datatable details
                            for (var j in data.columnHeaders[i].columnValues) {
                                if (data.columnHeaders[i].columnDisplayType == 'CODELOOKUP') {
                                    if (data.columnData[0].row[s].value == data.columnHeaders[i].columnValues[j].id) {
                                        data.columnHeaders[i].value = data.columnHeaders[i].columnValues[j].value;
                                    }
                                } else if (data.columnHeaders[i].columnDisplayType == 'CODEVALUE') {
                                    if (data.columnData[0].row[s].value == data.columnHeaders[i].columnValues[j].id) {
                                        data.columnHeaders[i].value = data.columnHeaders[i].columnValues[j].value;
                                    }
                                }
                            }
                        } else {
                            data.columnHeaders[i].value = data.columnData[0].row[s].value;
                        }

                            }
                        }      
                    }
                    scope.columnHeaders = data.columnHeaders;

                if(data.sectionedColumnList != undefined && data.sectionedColumnList != null && data.sectionedColumnList.length >0){
                    scope.isSectioned = true;
                    for(var i in data.sectionedColumnList){
                        for (var j in data.sectionedColumnList[i].columns) { 
                            if (data.sectionedColumnList[i].columns[j].visible != undefined && !data.sectionedColumnList[i].columns[j].visible) {
                                data.sectionedColumnList[i].columns.splice(j, 1);
                            }
                        }
                    }

                    for(var i in data.sectionedColumnList){
                        for (var j in data.sectionedColumnList[i].columns) { 
                            if (data.sectionedColumnList[i].columns[j].columnCode) {
                                for(var k in data.sectionedColumnList[i].columns[j].columnValues){
                                    if(data.sectionedColumnList[i].columns[j].columnDisplayType=='CODELOOKUP'){
                                        var index = data.columnData[0].row.findIndex(x => x.columnName==data.sectionedColumnList[i].columns[j].columnName);
                                        if (data.columnData[0].row[index].value == data.sectionedColumnList[i].columns[j].columnValues[k].id) {
                                            data.sectionedColumnList[i].columns[j].value = data.sectionedColumnList[i].columns[j].columnValues[k].value;
                                        }
                                    } else if(data.sectionedColumnList[i].columns[j].columnDisplayType=='CODEVALUE'){
                                        var index = data.columnData[0].row.findIndex(x => x.columnName==data.sectionedColumnList[i].columns[j].columnName);
                                        if (data.columnData[0].row[index].value == data.sectionedColumnList[i].columns[j].columnValues[k].value) {
                                            data.sectionedColumnList[i].columns[j].value = data.sectionedColumnList[i].columns[j].columnValues[k].value;
                                        }
                                    }
                                }
                            }
                            else {
                                var index = data.columnData[0].row.findIndex(x => x.columnName==data.sectionedColumnList[i].columns[j].columnName);
                                data.sectionedColumnList[i].columns[j].value = data.columnData[0].row[index].value;
                            }
                        }
                    }
                    scope.sectionedColumnHeaders = data.sectionedColumnList;
                }
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
                for (var i in scope.columnHeaders){
                    var colName = scope.columnHeaders[i].columnName;
                    if(idList.indexOf(colName) >= 0 ){
                        scope.columnHeaders.splice(i, 1);
                        scope.isCenter = colName == 'center_id' ? true : false;
                    } 
                }

                if(!scope.isSectioned){
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
            }else{
                    for (var i in scope.sectionedColumnHeaders) {
                        for (var j in scope.sectionedColumnHeaders[i].columns) {
                            if (scope.sectionedColumnHeaders[i].columns[j].columnDisplayType == 'DATE') {
                                scope.formDat[scope.sectionedColumnHeaders[i].columns[j].columnName] = scope.sectionedColumnHeaders[i].columns[j].value;
                            } else if (scope.sectionedColumnHeaders[i].columns[j].columnDisplayType == 'DATETIME') {
                                scope.formDat[scope.sectionedColumnHeaders[i].columns[j].columnName] = {};
                                if (scope.sectionedColumnHeaders[i].columns[j].value != null) {
                                    scope.formDat[scope.sectionedColumnHeaders[i].columns[j].columnName] = {
                                        date: dateFilter(new Date(scope.sectionedColumnHeaders[i].columns[j].value), scope.df),
                                        time: dateFilter(new Date(scope.sectionedColumnHeaders[i].columns[j].value), scope.tf)
                                    };
                                }
                            } else {
                                scope.formData[scope.sectionedColumnHeaders[i].columns[j].columnName] = scope.sectionedColumnHeaders[i].columns[j].value;
                            }

                            if (scope.sectionedColumnHeaders[i].columns[j].columnCode) {
                                for (var k in scope.sectionedColumnHeaders[i].columns[j].columnValues) {
                                    if (scope.sectionedColumnHeaders[i].columns[j].columnDisplayType == 'CODELOOKUP') {
                                        if (scope.sectionedColumnHeaders[i].columns[j].value != undefined && scope.sectionedColumnHeaders[i].columns[j].value == scope.sectionedColumnHeaders[i].columns[j].columnValues[k].value) {
                                            scope.formData[scope.sectionedColumnHeaders[i].columns[j].columnName] = scope.sectionedColumnHeaders[i].columns[j].columnValues[k].id;
                                        }
                                        scope.columnValueLookUp = scope.sectionedColumnHeaders[i].columns[j].columnValues;
                                        var obj = angular.fromJson(scope.sectionedColumnHeaders[i].columns[j]);
                                        scope.sectionedColumnHeaders[i].columns[j].columnValuesLookup = scope.columnValueLookUp;
                                    } else if (scope.sectionedColumnHeaders[i].columns[j].columnDisplayType == 'CODEVALUE') {
                                        if (scope.sectionedColumnHeaders[i].columns[j].value != undefined && scope.sectionedColumnHeaders[i].columns[j].value == scope.sectionedColumnHeaders[i].columns[j].columnValues[k].value) {
                                            scope.formData[scope.sectionedColumnHeaders[i].columns[j].columnName] = scope.sectionedColumnHeaders[i].columns[j].columnValues[k].value;
                                        }
                                        scope.columnValueLookUp = scope.sectionedColumnHeaders.columns[j].columnValues;
                                        scope.sectionedColumnHeaders[i].columns[j].columnValuesLookup = scope.columnValueLookUp;
                                    }
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
                    } else if(scope.columnHeaders[i].columnDisplayType == 'MULTISELECTCODELOOKUP'){
                        var multiSelectAsValuesArray = this.formData[scope.columnHeaders[i].columnName];
                        this.formData[scope.columnHeaders[i].columnName] = multiSelectAsValuesArray.toString(); 
                    }
                }
                var reqparams = {datatablename: scope.tableName, entityId: scope.entityId, genericResultSet: 'true'};
                if(scope.isMultirow){
                    reqparams.resourceId = scope.resourceId;
                }
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
                        scope.setTaskActionExecutionError("lable.error.activity.activity.not.completed");
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

             scope.viewMultiRowDataTable = function(resourceId){
                 scope.isViewMultiRowTable = true;
                 scope.status  = "VIEW";
                 scope.resourceId = resourceId;
                 scope.processMultiRowDataTable();
             };

             scope.editMultiRowDataTable = function(){
                 scope.initializeEditParameters();
                 scope.isViewMultiRowTable = false;
                 scope.isMultirow = true;
                 scope.processMultiRowDataTable();
             };

            scope.processMultiRowDataTable = function(){
                var reqParameters = {datatablename: scope.tableName, entityId: scope.entityId, resourceId: scope.resourceId, genericResultSet: 'true'};
                scope.processData(reqParameters);
            };
            scope.hideField = function(data){
               if(idList.indexOf(data.columnName) >= 0) {
                return true;
               }
               return false;
            }
            scope.printPreview = function(print) {
                var printContents = document.getElementById(print).innerHTML;
                var popupWin = window.open('', '_blank', 'width=1024,height=720');
                popupWin.document.open();
                popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="styles/repaymentscheduleprintstyle.css" />' +
                '</head><body onload="window.print()">' + printContents + '<br></body></html>');
                popupWin.document.close();
            }

            scope.getDependencyList = function (codeId) {
                if (codeId != null) {
                    scope.columnValuesLookup = [];
                    var count = 0;
                    for (var i in scope.columnHeaders) {
                        var obj = angular.fromJson(scope.columnHeaders);
                        if (scope.columnHeaders[i].columnValues != null && scope.columnHeaders[i].columnValues != "") {
                            for (var j in scope.columnHeaders[i].columnValues) {
                                if (scope.columnHeaders[i].columnValues[j].parentId > 0 && scope.columnHeaders[i].columnValues[j].parentId === codeId) {
                                    scope.columnValuesLookup.push(scope.columnHeaders[i].columnValues[j])
                                } else {
                                    if (scope.columnHeaders[i].columnValues[j].id == codeId) {
                                        var id = scope.columnHeaders[i].columnValues[j].parentId;
                                        for (var k in scope.columnHeaders) {
                                            for (var n in scope.columnHeaders[k].columnValues) {
                                                if (scope.columnHeaders[k].columnValues[n].id === id) {
                                                    scope.formData[scope.columnHeaders[k].columnName] = scope.columnHeaders[k].columnValues[n].id;
                                                    scope.dependentCodeId = scope.columnHeaders[k].columnValues[n].id;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }

                            }
                            if (scope.columnValuesLookup != null && scope.columnValuesLookup != "" && count == 0) {
                                obj[i].columnValuesLookup = scope.columnValuesLookup;
                                count++;
                            }
                        }
                    }
                    scope.columnHeaders = obj;
                    if(scope.tempDependentCodeId != scope.dependentCodeId){
                        scope.tempDependentCodeId = angular.copy(scope.dependentCodeId);
                        scope.getDependencyList(scope.dependentCodeId);
                    }
                } else {
                    for (var i in scope.columnHeaders) {
                        if (scope.columnHeaders[i].columnDisplayType == 'CODELOOKUP' && scope.columnHeaders[i].columnValues) {
                            scope.columnValueLookUp = scope.columnHeaders[i].columnValues
                            scope.newcolumnHeaders = angular.fromJson(scope.columnHeaders);
                            for (var j in scope.columnHeaders[i].columnValues) {
                                scope.newcolumnHeaders[i].columnValuesLookup = scope.columnValueLookUp;
                            }
                        }
                    }
                    scope.columnHeaders = scope.newcolumnHeaders;
                }
            }
        }
    });
    mifosX.ng.application.controller('datatableActivityController', ['$controller','$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.datatableActivityController]).run(function ($log) {
        $log.info("datatableActivityController initialized");
    });
}(mifosX.controllers || {}));
