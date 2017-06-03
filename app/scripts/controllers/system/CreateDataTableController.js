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
                if (scope.datatableTemplate.columnName && scope.datatableTemplate.columnType) {
                    scope.columnnameerror = false;
                    scope.columntypeerror = false;
                    var column = {
                        name: scope.datatableTemplate.columnName,
                        type: scope.datatableTemplate.columnType,
                        mandatory: false,
                        visible: true,
                        mandatoryIfVisible: false,
                        hasValueMandatory :false
                    }
                    scope.columns.push(column);
                    scope.datatableTemplate.columnName = undefined;
                    scope.datatableTemplate.columnType = undefined;
                } else if (!scope.datatableTemplate.columnName) {
                    scope.errorDetails = [];
                    scope.columnnameerror = true;
                    scope.labelerror = "columnnameerr";
                } else if (scope.datatableTemplate.columnName) {
                    scope.errorDetails = [];
                    scope.columntypeerror = true;
                    scope.labelerror = "columntypeerr";
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

            scope.submit = function () {
                if (scope.columns.length == 0) {
                    scope.errorDetails = [];
                    scope.errorDetails.push({code: 'error.msg.click.on.add.to.add.columns'});
                } else {
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
