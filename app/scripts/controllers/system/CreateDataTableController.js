(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateDataTableController: function (scope, routeParams, resourceFactory, location) {

            scope.columns = [];
            scope.columnnameerror = false;
            scope.columntypeerror = false;
            scope.datatableTemplate = {};
            scope.labelerror = "requiredfield";
            scope.columnsMetadata = [];
            scope.dropdownColumns = [];
            scope.columnArray =[];
            scope.scopeOptions = {};
            scope.available = [];
            scope.selected = [];
            scope.id = {};
            scope.hasValueMandatory = false;
            scope.codeValues = [];
			scope.allowSections = false;
            scope.section = {};
            scope.sectionArray = [];
            scope.sections = [];
            scope.columnNotMappedToSectionError = false;
            scope.isEmptyDatatable = false;
            scope.isDuplicateColumnName = false;
            scope.labelColumnError = "";

            resourceFactory.codeResources.getAllCodes({}, function (data) {
                scope.codes = data;
            });

            resourceFactory.DataTablesTemplateResource.get({}, function (data) {
                scope.scopeOptions = data;
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

            scope.addColumn = function () {   
                if (scope.datatableTemplate.columnName && scope.datatableTemplate.columnType && (scope.columns.findIndex(x => x.name.toLowerCase() == scope.datatableTemplate.columnName.toLowerCase()) < 0)) {
                    scope.columnnameerror = false;
                    scope.columntypeerror = false;
                    scope.isDuplicateColumnName = false;
                    var column = {
                        name: scope.datatableTemplate.columnName,
                        type: scope.datatableTemplate.columnType,
                        mandatory: false,
                        visible: true,
                        mandatoryIfVisible: false,
                        hasValueMandatory :false,
						sectionName: " "
                    }
                    scope.columns.push(column);
                    scope.datatableTemplate.columnName = undefined;
                    scope.datatableTemplate.columnType = undefined;
                } else if (!scope.datatableTemplate.columnName) {
                    scope.errorDetails = [];
                    scope.columnnameerror = true;
                    scope.labelerror = "columnnameerr";
                } else if (!scope.datatableTemplate.columnType) {
                    scope.errorDetails = [];
                    scope.columntypeerror = true;
                    scope.labelerror = "columntypeerr";
                }else{
                    scope.errorDetails = [];
                    scope.isDuplicateColumnName = true;
                    scope.labelerror = "duplicatte.column.name.error";
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
                        for (var j in valueObject) {
                            if (clientScopeType != '' && clientScopeType == valueObject[j].name) {
                                scope.available = [];
                                scope.selected = [];
                                scope.available = valueObject[j].allowedValueOptions;
                                scope.id = valueObject[j].id;
                                break;
                            } else {
                                scope.available = valueObject[j].allowedValueOptions;
                                scope.id = valueObject[j].id;
                            }

                        }
                    }
                }
            }

            scope.removeColumn = function (index) {
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


            scope.getDependentCodeValues = function (column,index) {
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

            scope.addSectionName = function () {
                if(scope.section.value != undefined &&  scope.section.value != null && scope.section.value.trim().length > 0 && scope.sectionArray.indexOf(scope.section.value) < 0 ){ 
                	scope.sectionArray.push(scope.section.value);
                
                var tempSection = {
                    displayPosition: scope.sectionArray.length,
                    displayName: scope.section.value,
                    columns: []
                }
                scope.sections.push(tempSection);
              }
              scope.section.value = undefined;
            };
            
            scope.shiftSectionDown = function(index){
            	var temp = scope.sectionArray[index];
            	scope.sectionArray[index] = scope.sectionArray[index+1];
            	scope.sectionArray[index+1] = temp;
            };
            
            scope.shiftSectionUp = function(index){
            	var temp = scope.sectionArray[index];
            	scope.sectionArray[index] = scope.sectionArray[index-1];
            	scope.sectionArray[index-1] = temp;
            };
            
            scope.removeSection = function(index){
            	scope.sectionArray.splice(index,1);
            };

            scope.validateNewColumn = function(){
                return scope.columnnameerror || scope.columntypeerror || scope.isDuplicateColumnName;
            };

            scope.submit = function () {
                if (scope.columns.length == 0) {
                    scope.isEmptyDatatable = true;
                    scope.columnNotMappedToSectionError = false;
                    scope.labelColumnError = "not.found";
                    return false;
                } else {
                    scope.isEmptyDatatable = false;
                    scope.columnNotMappedToSectionError = false;
                    delete scope.errorDetails;
                    scope.formData.multiRow = scope.formData.multiRow || false;
                    scope.formData.columns = scope.columns;
                    for (var i in scope.formData.columns) {
                        if(scope.formData.columns[i].when == null){
                            delete scope.formData.columns[i].when;
                            delete scope.formData.columns[i].value;
                        }
                        if (scope.formData.columns[i].when != undefined && scope.formData.columns[i].value != undefined ) {
                            scope.formData.columns[i].visibilityCriteria = [];
                            var json = {
                                columnName: scope.formData.columns[i].when,
                                value: scope.formData.columns[i].value
                            };
                            scope.formData.columns[i].visibilityCriteria.push(json);
                            delete scope.formData.columns[i].when;
                            delete scope.formData.columns[i].value;
                            scope.hasValueMandatory = false;
                        }
                        delete scope.formData.columns[i].hasValueMandatory;
                    }
                    if(this.formData.restrictscope && this.selected != '' && this.selected != undefined) {
                        this.formData.scope = {};
                        this.formData.scope.id = scope.id;
                        this.formData.scopingCriteriaEnum = scope.id;
                        this.formData.scope.allowedValues = [];
                        for (var i = 0; i < scope.selected.length; i++) {
                            this.formData.scope.allowedValues.push(this.selected[i].id);
                        }
                    }
                    delete this.formData.restrictscope;
                    delete this.formData.clientscopetype;

                    if(this.allowSections){
                    	scope.sectionedColumns = [];
                    	for(var k in scope.sections){
                    		scope.sections[k].displayPosition = scope.sectionArray.indexOf(scope.sections[k].displayName) + 1;
                    	} 
                        for (var i in scope.formData.columns) {
                            if(scope.formData.columns[i].sectionName != " "){
                                var name = scope.formData.columns[i].sectionName;
                                for(var j=0; j< scope.sections.length;j++)
                                {
                                    if(name == scope.sections[j].displayName){
                                    	scope.sections[j].columns.push(scope.formData.columns[i]);
                                    	scope.sectionedColumns.push(scope.formData.columns[i]);
                                    	delete this.formData.columns[i].sectionName;
                                    	break;
                                    }
                                }
                            }else{
                                scope.columnNotMappedToSectionError = true;
                                scope.labelColumnError = "not.mapped.to.section";
                                return false;
                            }
                        }
                        
                        for(var i in scope.sectionedColumns){
                        	for(var j in scope.formData.columns){
                        		if(scope.sectionedColumns[i] == scope.formData.columns[j]){
                        			scope.formData.columns.splice(j,1);
                        			break;
                        		}
                        	}
                        }
                        scope.formData.sections = scope.sections;
                    }
                    else{
                        for (var i in scope.formData.columns) { 
                            delete this.formData.columns[i].sectionName;
                        }
                    }

                    resourceFactory.DataTablesResource.save(this.formData, function (data) {
                        location.path('/viewdatatable/' + data.resourceIdentifier);
                    });
                }
            };
        }
    });
    mifosX.ng.application.controller('CreateDataTableController', ['$scope', '$routeParams', 'ResourceFactory', '$location', mifosX.controllers.CreateDataTableController]).run(function ($log) {
        $log.info("CreateDataTableController initialized");
    });
}(mifosX.controllers || {}));
