(function (module) {
    mifosX.controllers = _.extend(module, {
        EditDataTableController: function (scope, routeParams, resourceFactory, location) {
        	
            scope.columns = [];
            scope.dropColumns = [];
            scope.formData = {};
            scope.columnnameerror = false;
            scope.columntypeerror = false;
            scope.datatableTemplate = {};
            scope.scopeOptions = {};
            scope.available = [];
            scope.selected = [];
            scope.id = {};
            scope.hasValueMandatory = false;
            scope.codeValues = [];
            scope.tempData = [];
            scope.columnArray = [];
            scope.allowSections = false;
            scope.section = {};
            scope.sectionList = [];
            scope.sections = [];
            scope.addSections =[];
            scope.dropSections = [];
            scope.changeSections = [];
            scope.originalSections = [];

            resourceFactory.codeResources.getAllCodes({}, function (data) {
                scope.codes = data.pageItems;
            });

            resourceFactory.DataTablesTemplateResource.get({}, function (data) {
                scope.scopeOptions = data;
            });

            resourceFactory.DataTablesResource.getTableDetails({datatablename: routeParams.tableName}, function (data) {
                scope.datatable = data;

                scope.formData.apptableName = data.applicationTableName;
                scope.formData.dataTableDisplayName = data.registeredTableDisplayName;
                if(data.scopingCriteriaEnum != undefined && data.scopingCriteriaEnum != null) {
                    scope.formData.restrictscope = true;
                }
                for (var n in data.scopeCriteriaData) {
                    for (var m in data.scopeCriteriaData[n].allowedValueOptions) {
                        if (m == 0) {
                            scope.changeEntity(scope.formData.restrictscope, data.scopeCriteriaData[n].name);
                        }
                        scope.selected.push(data.scopeCriteriaData[n].allowedValueOptions[m]);
                        var obj = data.scopeCriteriaData[n].allowedValueOptions[m];
                        for (var k in scope.available) {
                            if (scope.available[k].id == obj.id) {
                                scope.available.splice(k, 1);
                            }
                        }
                    }
                }

                var temp = [];
                var colName = data.columnHeaderData[0].columnName;
                if (colName == 'id') {
                    data.columnHeaderData.splice(0, 1);
                }
                colName = data.columnHeaderData[0].columnName;
                if (colName == 'client_id' || colName == 'office_id' || colName == 'group_id' || colName == 'center_id' || colName == 'loan_id' ||
                    colName == 'savings_account_id' || colName == 'gl_journal_entry_id' || colName == 'loan_application_reference_id' || colName == 'villages_id' ) {
                    data.columnHeaderData.splice(0, 1);
                }

                for (var i in data.columnHeaderData) {
                    var tempColumn = {};
                    if (data.columnHeaderData[i].columnName.indexOf("_cd_") > 0) {
                        temp = data.columnHeaderData[i].columnName.split("_cd_");
                        tempColumn.columnName = temp[1];
                    }
                    if (data.columnHeaderData[i].columnCode) {
                        tempColumn.code = data.columnHeaderData[i].columnCode;
                    }
                    scope.tempData.push(tempColumn);
                }

                for (var i in data.columnHeaderData) {

                    data.columnHeaderData[i].originalName = data.columnHeaderData[i].columnName;
                    if (data.columnHeaderData[i].columnName.indexOf("_cd_") > 0) {
                        temp = data.columnHeaderData[i].columnName.split("_cd_");
                        data.columnHeaderData[i].columnName = temp[1];
                        data.columnHeaderData[i].code = temp[0];
                    }

                    var tempColumn = {name: data.columnHeaderData[i].columnName, mandatory: !data.columnHeaderData[i].isColumnNullable, sectionId : data.columnHeaderData[i].sectionId };
                    tempColumn.originalName = data.columnHeaderData[i].originalName;
                    if (data.columnHeaderData[i].displayName != undefined && data.columnHeaderData[i].displayName != 'null') {
                        tempColumn.displayName = data.columnHeaderData[i].displayName;
                    }
                    if (data.columnHeaderData[i].dependsOnColumnName != '' && data.columnHeaderData[i].dependsOnColumnName != undefined) {
                        tempColumn.dependsOn = data.columnHeaderData[i].dependsOnColumnName;
                    }
                    tempColumn.displayPosition = data.columnHeaderData[i].orderPosition;
                    tempColumn.visible = data.columnHeaderData[i].visible;
                    tempColumn.mandatoryIfVisible = data.columnHeaderData[i].mandatoryIfVisible;
                    if (data.columnHeaderData[i].columnValues != '' && data.columnHeaderData[i].columnValues != undefined) {
                        tempColumn.columnValues = data.columnHeaderData[i].columnValues;
                    }
                    if (data.columnHeaderData[i].visibilityCriteria != '' && data.columnHeaderData[i].visibilityCriteria != undefined) {
                        tempColumn.visibilityCriteria = data.columnHeaderData[i].visibilityCriteria;
                        for (var j in data.columnHeaderData[i].visibilityCriteria) {
                            tempColumn.when = data.columnHeaderData[i].visibilityCriteria[j].columnName;
                            tempColumn.value = data.columnHeaderData[i].visibilityCriteria[j].columnValue[0].value;
                            var codeName = "";
                            for(var a in scope.tempData){
                                if(data.columnHeaderData[i].visibilityCriteria[j].columnName == scope.tempData[a].columnName){
                                    codeName = scope.tempData[a].code;
                                }
                            }
                            resourceFactory.codeValueByCodeNameResources.get({codeName: codeName} ,function(codes){
                                scope.codeValues[i] = codes;
                            });
                        }
                    }
                    var colType = data.columnHeaderData[i].columnDisplayType.toLowerCase();

                    if (colType == 'integer') {
                        colType = 'number';
                    }
                    else if (colType == 'codelookup') {
                        colType = 'dropdown';
                    }
                    tempColumn.type = colType;

                    if (colType == 'string') {
                        tempColumn.length = data.columnHeaderData[i].columnLength;
                    }

                    if (data.columnHeaderData[i].columnCode) {
                        tempColumn.code = data.columnHeaderData[i].columnCode;
                    }

                    scope.columns.push(tempColumn);
                }

                if(data.sectionDataList.length > 0){
                	scope.originalSections = new Array(data.sectionDataList.length).fill(0);
                    scope.allowSections = true;
                    for (var k in  data.sectionDataList){
                        for(var j in scope.columns){
                            if(scope.columns[j].sectionId != undefined && scope.columns[j].sectionId == data.sectionDataList[k].id){
                                scope.columns[j].sectionName = data.sectionDataList[k].displayName;
                                delete scope.columns[j].sectionId;
                            }
                        }
                        scope.originalSections.splice(data.sectionDataList[k].displayPosition-1,1,data.sectionDataList[k].displayName);
                    }
                    scope.sectionList = scope.originalSections;
                }
                else{
                    for(var j in scope.columns){
                        delete scope.columns[j].sectionId;
                    }
                }
            });

            scope.addScopeOptions = function () {
                var temp = {};
                for (var i in scope.scopeOptions) {
                    var valueObject = scope.scopeOptions[i];
                    var key = i;
                    var tempEntityName = scope.formData.apptableName;
                    var entityName = tempEntityName.split("_");
                    if(key == entityName[1]) {
                        for (var j in valueObject) {
                            temp.id = valueObject[j].id;
                            temp.allowedValues = [];
                            for (var k in valueObject[j].allowedValueOptions) {
                                if (valueObject[j].allowedValueOptions[k].id == this.availableScopes) {
                                    temp.allowedValues.push(valueObject[j].allowedValueOptions[k].id);
                                    scope.selected.push(valueObject[j].allowedValueOptions[k]);
                                    scope.scopeOptions[valueObject[j].allowedValueOptions.splice(k, 1)];
                                }
                            }
                        }
                    }
                }
            };

            scope.removeScopeOptions = function (clientscopetype) {
                for (var i in scope.scopeOptions) {
                    var valueObject = scope.scopeOptions[i];
                    var key = i;
                    var tempEntityName = scope.formData.apptableName;
                    var entityName = tempEntityName.split("_");
                    if (key == entityName[1]) {
                        for (var j in this.selectedScopes) {
                            for (var k in scope.selected) {
                                if (scope.selected[k].id == this.selectedScopes) {
                                    var temp = {};
                                    temp.id = this.selected[k].id;
                                    temp.name = this.selected[k].name;
                                    if (valueObject.length > 1) {
                                        for (var n in valueObject) {
                                            if (clientscopetype != undefined && valueObject[n].name == clientscopetype) {
                                                scope.scopeOptions[valueObject[n].allowedValueOptions.push(temp)];
                                                scope.selected.splice(k, 1);
                                            }
                                        }
                                    } else {
                                        scope.scopeOptions[valueObject[j].allowedValueOptions.push(temp)];
                                        scope.selected.splice(k, 1);
                                    }
                                }
                            }
                        }
                    }
                }
            };

            scope.resetScope = function () {
                scope.available = [];
                scope.selected = [];
                var restrictScopeEnabled = true;
                scope.changeEntity(restrictScopeEnabled, '');
            }

            scope.changeEntity = function (restrictScopeEnabled, clientScopeType) {
                for (var i in scope.scopeOptions) {
                    var tempEntityName = scope.formData.apptableName;
                    var entityName = tempEntityName.split("_");
                    var key = i;
                    if (entityName[1] == key && restrictScopeEnabled) {
                        var valueObject = scope.scopeOptions[i];
                        if (valueObject.length > 1 && scope.selected != undefined && scope.selected != '') {
                            for (var k in scope.selected) {
                                var temp = {};
                                temp.id = this.selected[k].id;
                                temp.name = this.selected[k].name;
                                for (var n in valueObject) {
                                    if (scope.formData.clientscopetype != undefined && valueObject[n].name == scope.formData.clientscopetype) {
                                        scope.scopeOptions[valueObject[n].allowedValueOptions.push(temp)];
                                    }
                                }

                            }
                        }
                        for (var j in valueObject) {
                            if (clientScopeType != '' && clientScopeType == valueObject[j].name) {
                                scope.available = [];
                                scope.selected = [];
                                scope.available = valueObject[j].allowedValueOptions;
                                scope.id = valueObject[j].id;
                                scope.formData.clientscopetype = valueObject[j].name;
                                break;
                            } else {
                                scope.available = valueObject[j].allowedValueOptions;
                                scope.id = valueObject[j].id;
                            }

                        }
                    }
                }
            }

            scope.getDependentCodeValues = function (column, index) {
                if(column.when){
                    scope.columnArray[index].hasValueMandatory = true;
                }else{
                    scope.columnArray[index].hasValueMandatory = false;
                }
                var codeName = "";
                for(var i in scope.columns){
                    if(column.when === scope.columns[i].name) {
                        codeName = scope.columns[i].code;
                    }
                }
                resourceFactory.codeValueByCodeNameResources.get({codeName: codeName} ,function(data){
                    scope.codeValues[index] = data;
                });
            }

            scope.addColumn = function () {
                if (scope.datatableTemplate.columnName && scope.datatableTemplate.columnType) {
                    scope.columnnameerror = false;
                    scope.columntypeerror = false;
                    var column = {
                        name: scope.datatableTemplate.columnName,
                        type: scope.datatableTemplate.columnType,
                        mandatory: false,
                        visible: true,
                        mandatoryIfVisible: false,
                        hasValueMandatory : false
                    }
                    scope.columns.push(column);
                    scope.datatableTemplate.columnName = undefined;
                    scope.datatableTemplate.columnType = undefined;
                } else if (!scope.datatableTemplate.columnName) {
                    scope.columnnameerror = true;
                    scope.labelerror = "columnnameerr";
                } else if (scope.datatableTemplate.columnName) {
                    scope.columntypeerror = true;
                    scope.labelerror = "columntypeerr";
                }
            };

            scope.removeColumn = function (index) {
                if (scope.columns[index].originalName) {
                    scope.dropColumns.push({name: scope.columns[index].originalName});
                }
                scope.columns.splice(index, 1);
            };

            scope.updateDepenedencies = function (index) {
                if (scope.columns[index].type != 'string') {
                    scope.columns[index].length = undefined;
                }
                if (scope.columns[index].type != 'dropdown') {
                    scope.columns[index].code = undefined;
                }
            };

             scope.addSectionName = function () {
            	if(scope.sectionList.indexOf(scope.section.value) < 0){
                    scope.sectionList.push(scope.section.value);
                    var tempNewSection ={
                        displayPosition: scope.sectionList.length,
                        displayName: scope.section.value
                    }
                    scope.addSections.push(tempNewSection);
                }
                scope.section.value = undefined;
            };
            
            scope.shiftSectionDown = function(index){
            	var temp = scope.sectionList[index];
            	scope.sectionList[index] = scope.sectionList[index+1];
            	scope.sectionList[index+1] = temp;
            };
            
            scope.shiftSectionUp = function(index){
            	var temp = scope.sectionList[index];
            	scope.sectionList[index] = scope.sectionList[index-1];
            	scope.sectionList[index-1] = temp;
            };
            
            scope.removeSection = function(index){
            	var removeSectionName = scope.sectionList[index];
            	scope.dropSections.push(scope.sectionList[index]);
            	scope.sectionList.splice(index,1);
            	for (var i in scope.columns ){
            		if(scope.columns[i].sectionName == removeSectionName){
            			scope.columns[i].sectionName = scope.sectionList[0];
            		}
            	}
            };

            scope.submit = function () {

                scope.formData.addColumns = [];
                scope.formData.changeColumns = [];

                if (scope.dropColumns.length > 0) {
                    scope.formData.dropColumns = scope.dropColumns;
                }
                if(scope.sectionList.length > 0){
                	for(var i in scope.sectionList){
                		var tempSection = {
                            displayPosition: parseInt(i) + 1,
                            displayName: scope.sectionList[i],
                            changeColumns: [],
                            addColumns: []
                		}
                		scope.sections.push(tempSection);
                	}
                }

                if (this.formData.restrictscope && this.selected != '' && this.selected != undefined) {
                    this.formData.scope = {};
                    this.formData.scope.id = scope.id;
                    this.formData.scopingCriteriaEnum = scope.id;
                    this.formData.scope.allowedValues = [];
                    for (var i = 0; i < scope.selected.length; i++) {
                        this.formData.scope.allowedValues.push(this.selected[i].id);
                    }
                } else if(this.formData.scope) {
                    delete this.formData.scope.id;
                    delete this.formData.scopingCriteriaEnum;
                    delete this.formData.scope.allowedValues;
                }
                delete this.formData.restrictscope;
                delete this.formData.clientscopetype;

                for (var i in scope.columns) {

                    if(scope.columns[i].when == null){
                        delete scope.columns[i].when;
                        delete scope.columns[i].when;
                        scope.hasValueMandatory = false;
                    }
                    if (scope.columns[i].when != undefined && scope.columns[i].value != undefined) {
                        scope.columns[i].visibilityCriteria = [];
                        var json = {
                            columnName: scope.columns[i].when,
                            value: scope.columns[i].value
                        };
                        scope.columns[i].visibilityCriteria.push(json);
                        delete scope.columns[i].when;
                        delete scope.columns[i].value;
                        scope.columns[i].hasValueMandatory = false;
                    }
                     var displayPosition = null;
                     if(scope.allowSections){
                        if(scope.columns[i].sectionName != " "){
                            var name = scope.columns[i].sectionName;
                            var displayPosition = null;
                            for(var j=0; j< scope.sectionList.length;j++){
                                if(name == scope.sectionList[j]){
                                    displayPosition = j;
                                    break;
                                }
                            }   
                        }
                     }
                     delete scope.columns[i].sectionName;
                    if (scope.columns[i].originalName) {
                        //This value should be updated based on the configuration
                        /*if (scope.columns[i].newName) {
                         if (scope.columns[i].type == "dropdown") {
                         scope.columns[i].columnName = scope.columns[i].originalName;
                         scope.columns[i].newName = scope.columns[i].columnCode + "_cd_" + scope.columns[i].newName;
                         }
                         }*/

                        delete scope.columns[i].originalName;
                        delete scope.columns[i].type;

                        if (scope.columns[i].code) {
                            scope.columns[i].newCode = scope.columns[i].newCode || scope.columns[i].code;
                        }

                        if (scope.columns[i].name) {
                            scope.columns[i].newName = scope.columns[i].newName || scope.columns[i].name;
                        }
                        scope.formData.changeColumns.push(scope.columns[i]);
                        
                        if(this.allowSections){
                            if(displayPosition!=null){
                                 scope.sections[displayPosition].changeColumns.push(scope.columns[i]);
                            }
                        }
                    } else {
                        if(this.allowSections){
                            if(displayPosition!=null){
                                scope.sections[displayPosition].addColumns.push(scope.columns[i]);
                            }
                        }
                        else{
                        	scope.formData.addColumns.push(scope.columns[i]);
                        }
                    }
                    delete scope.columns[i].hasValueMandatory;
                }

                if (scope.formData.addColumns.length == 0){
                    delete scope.formData.addColumns;
                }
                if (scope.formData.changeColumns.length == 0){
                    delete scope.formData.changeColumns;
                }
                if(this.allowSections){
                    for (var i in scope.sections) {
                        if(scope.sections[i].addColumns.length == 0)
                            delete scope.sections[i].addColumns;
                        if(scope.sections[i].changeColumns.length == 0)
                            delete scope.sections[i].changeColumns;
                    }
                    scope.formData.sections = scope.sections;
                }
                else{
                	if(scope.sectionList != undefined && scope.sectionList != null && scope.sectionList.length > 0){
                		for(var i in scope.sectionList){
                			scope.dropSections.push(scope.sectionList[i]);
                		}
                		delete scope.sectionList; 
                	}
                }
               
                if(scope.sectionList != undefined && scope.sectionList != null && scope.sectionList.length > 0){
                    for(var k in scope.sectionList){
                		var tempName = scope.sectionList[k];
                		var found = false;
                		for(var j in scope.addSections){
                			if(tempName == scope.addSections[j].displayName){
                				found = true;
                				scope.addSections[j].displayPosition = parseInt(k)+1;
                				break;	
                			}
                		}
                		if(!found){
                			var tempChangedSection ={
                		        displayPosition: parseInt(k) +1,
                		        displayName: scope.originalSections[k]
                		    }
                			scope.changeSections.push(tempChangedSection);
                		}
                	}
                }
                scope.formData.addSections = scope.addSections;
                scope.formData.changeSections = scope.changeSections;
                scope.formData.dropSections = scope.dropSections;
                resourceFactory.DataTablesResource.update({datatablename: routeParams.tableName}, this.formData, function (data) {
                location.path('/viewdatatable/' + data.resourceIdentifier);
                });
            };
        }
    });
    mifosX.ng.application.controller('EditDataTableController', ['$scope', '$routeParams', 'ResourceFactory', '$location', mifosX.controllers.EditDataTableController]).run(function ($log) {
        $log.info("EditDataTableController initialized");
    });
}(mifosX.controllers || {}));
