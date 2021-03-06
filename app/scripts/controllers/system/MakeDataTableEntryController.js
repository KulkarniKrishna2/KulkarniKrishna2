(function (module) {
    mifosX.controllers = _.extend(module, {
        MakeDataTableEntryController: function (scope, location, routeParams, resourceFactory, dateFilter, $rootScope, $filter) {
            scope.tableName = routeParams.tableName;
            scope.entityId = routeParams.entityId;
            scope.fromEntity = routeParams.fromEntity;
            scope.columnHeaders = [];
            scope.formData = {};
            scope.formDat = {};
            scope.tf = "HH:mm";
	        scope.columnValueLookUp = [];
	        scope.newcolumnHeaders = [];
	        scope.enableDependency = true;
            scope.client=false;
            scope.group=false;
            scope.center=false;
            scope.office=false;
            scope.savingsaccount=false;
            scope.loanproduct = false;
            scope.village=false;
            scope.showSelect = true;
            scope.villageName;
            scope.dataTableName = '';
            scope.tableDisplayName = scope.tableName;
			scope.isSectioned = false;
            scope.sectionedColumnHeaders = [];
            scope.associateAppTable = null;
            scope.count = 0;
            scope.issubmitcontinue = false ;
            scope.fixedDeposit = false;
            scope.recurringDeposit = false;
            var  idList = ['client_id', 'office_id', 'group_id', 'center_id', 'loan_id', 'savings_account_id', 'gl_journal_entry_id', 'loan_application_reference_id', 'journal_entry_id', 'district_id', 'villages_id', 'staff_id'];

            if (routeParams.fromEntity == 'client') {
                scope.clientName = $rootScope.clientname;
                scope.client=true;
            }else if (routeParams.fromEntity == 'group') {
                scope.groupName = $rootScope.groupNameDataParameter;
                scope.group=true;
            }else if (routeParams.fromEntity == 'center') {
                scope.centerName = $rootScope.centerName;
                scope.center=true;
            }else if (routeParams.fromEntity == 'loan') {
                scope.loanproductName = $rootScope.loanproductName;
                scope.loanproduct = true;
                scope.clientId = $rootScope.clientId;
                scope.LoanHolderclientName = $rootScope.LoanHolderclientName;
                scope.associateAppTable = 'm_loan';
            }else if (routeParams.fromEntity == 'office') {
                scope.officeName =  $rootScope.officeName;
                scope.office=true;
            }else if (routeParams.fromEntity == 'savings') {
                scope.savingsAccount =  $rootScope.savingsAccount;
                scope.savingsaccount=true;
                scope.clientId=$rootScope.clientId;
                scope.savingsaccountholderclientName=$rootScope.savingsaccountholderclientName;
            }else if(routeParams.fromEntity == 'village'){
                scope.village=true;
                scope.villageName = $rootScope.villageNameDataParameter;
            }else if (routeParams.fromEntity == 'staff') {
                scope.staffId = scope.entityId;
            } else if (routeParams.fromEntity == 'fixeddeposit') {
                scope.fixedDeposit = true;
            } else if (routeParams.fromEntity == 'recurringdeposit') {
                scope.recurringDeposit = true;
            }
            if(scope.tableName =='Address' && scope.fromEntity == 'client'){
                scope.showSelect=false;
            }
            
            resourceFactory.DataTablesResource.getTableDetails({ datatablename: scope.tableName, entityId: scope.entityId, genericResultSet: 'true',associateAppTable: scope.associateAppTable}, function (data) {

                scope.tableDisplayName = data.registeredDataTableDisplayName != null ? data.registeredDataTableDisplayName: scope.tableName;
                scope.isMultirow = data.columnHeaders[0].columnName == "id" ? true : false;
                var colName = data.columnHeaders[0].columnName;
                if (colName == 'id') {
                    data.columnHeaders.splice(0, 1);
                }
                colName = data.columnHeaders[0].columnName;
                if (colName == 'journal_entry_id') {
                    data.columnHeaders.splice(0, 1);
                    scope.dataTableName = 'f_journal_entry';
                }
                for (var i in data.columnHeaders){
                    var colName = data.columnHeaders[i].columnName;
                    if(idList.indexOf(colName) >= 0 ){
                        data.columnHeaders.splice(i, 1);
                        scope.isCenter = colName == 'center_id' ? true : false;
                    } 
                }

                scope.rowstosplice = [];
                for (var i in data.columnHeaders) {
                    if (data.columnHeaders[i].visible != undefined && !data.columnHeaders[i].visible) {
                        scope.rowstosplice.push(i);
                    } else {
                        if (data.columnHeaders[i].columnDisplayType == 'DATETIME') {
                            scope.formDat[data.columnHeaders[i].columnName] = {};
                        }
                        if ((data.columnHeaders[i].columnDisplayType == 'CODELOOKUP' || data.columnHeaders[i].columnDisplayType == 'MULTISELECTCODELOOKUP' )&& data.columnHeaders[i].columnValues) {
                            scope.columnValueLookUp = data.columnHeaders[i].columnValues;
                            scope.newcolumnHeaders = angular.fromJson(data.columnHeaders);
                            for (var j in data.columnHeaders[i].columnValues) {
                                scope.newcolumnHeaders[i].columnValuesLookup = scope.columnValueLookUp;
                            }

                        }
                    }
                }
                for(var i in scope.rowstosplice){
                    data.columnHeaders.splice(data.columnHeaders.indexOf(scope.rowstosplice[i]), 1);
                }
                if(scope.newcolumnHeaders != ""){
                    scope.columnHeaders = scope.newcolumnHeaders;
                }else{
                    scope.columnHeaders = data.columnHeaders;
                }

                _.each(scope.columnHeaders, function(columnHeader){
                    scope.showVisibleCriterialFields(columnHeader.columnName);
                    if(columnHeader.visibilityCriteria.length > 0){
                        columnHeader.hideElement = true;
                    }else{
                        columnHeader.hideElement = false;
                    }
                });
                
                if(data.sectionedColumnList != null && data.sectionedColumnList.length > 0){
                    for (var i in data.sectionedColumnList) {
                        for(var j in data.sectionedColumnList[i].columns){
                            if (data.sectionedColumnList[i].columns[j].visible != undefined && !data.sectionedColumnList[i].columns[j].visible) {
                                data.sectionedColumnList[i].columns.splice(j, 1);
                            }
                        }
                    }
                	scope.isSectioned = true;
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
                    _.each(data.sectionedColumnList[i].columns, function(columnHeader){
                        scope.showVisibleCriterialFields(columnHeader.columnName);
                        if(columnHeader.visibilityCriteria.length > 0){
                            columnHeader.hideElement = true;
                        }else{
                            columnHeader.hideElement = false;
                        }
                    });
                }	 
                scope.sectionedColumnHeaders = data.sectionedColumnList;
            }
        });


            scope.showVisibleCriterialFields = function(registeredColumnName){
                var columnName = $filter("prettifyDataTableColumn")(registeredColumnName);
                _.each(scope.columnHeaders, function(column){
                    if(column.visibilityCriteria.length > 0){
                        _.each(column.visibilityCriteria, function(criteria){
                            if(criteria.columnName == columnName){
                                _.each(criteria.columnValue, function(value){
                                    if(scope.formData[registeredColumnName] == value.id){
                                        column.hideElement = false;
                                    }else{
                                        column.hideElement = true;
                                        scope.formData[column.columnName] = undefined;
                                    }
                                });
                            }
                        });
                    }
                });
            }

            // this function fetch all data of particular village id and assign new value to column name of address table

            scope.changeVillage = function(id) {
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

            scope.getDependencyColumns = function (codeId){
                for(var i in scope.columnHeaders){
                    if (scope.columnHeaders[i].visibilityCriteria != "") {
                        for(var j in scope.columnHeaders[i].visibilityCriteria){
                            for(var k in scope.columnHeaders[i].visibilityCriteria[j].columnValue){
                                if(Boolean(scope.columnHeaders[i].visibilityCriteria[j].columnValue[k].value) == codeId){
                                    if(!codeId){
                                        this.formData[scope.columnHeaders[i].columnName] = '';
                                        this.formDat[scope.columnHeaders[i].columnName] = '';
                                    }
                                    scope.enableDependency = codeId;
                                    scope.columnHeaders[i].visibilityCriteria[j].columnValue[k].value = !codeId;
                                }
                            }
                        }
                    }
                }
            }

            //return input type
            scope.fieldType = function (type) {
                var fieldType = "";
                if (type) {
                    if (type == 'CODELOOKUP' || type == 'CODEVALUE') {
                        fieldType = 'SELECT';
                    }  else {
                        fieldType = type;
                    }
                }
                return fieldType;
            };

            scope.dateTimeFormat = function () {
                for (var i in scope.columnHeaders) {
                    if(scope.columnHeaders[i].columnDisplayType == 'DATETIME') {
                        return scope.df + " " + scope.tf;
                    }
                }
                return scope.df;
            };
            scope.isShowfieldType = function(type){
                var isfieldType = false;
                if(type == 'STRING' || type == 'INTEGER' || type == 'DECIMAL'){
                    isfieldType = true;
                }
                return isfieldType;
            }

            scope.cancel = function () {
                if (scope.fromEntity == 'client') {
                    location.path('/viewclient/' + routeParams.entityId).search({});
                } else if (scope.fromEntity == 'group') {                    
                    location.path('/viewgroup/' + routeParams.entityId).search({});
                } else if (scope.fromEntity == 'center') {                    
                    location.path('/viewcenter/' + routeParams.entityId).search({});
                } else if (scope.fromEntity == 'loan') {                    
                    location.path('/viewloanaccount/' + routeParams.entityId).search({});
                } else if (scope.fromEntity == 'savings') {
                    location.path('/viewsavingaccount/' + routeParams.entityId).search({});
                } else if (scope.fromEntity == 'office') {
                    location.path('/viewoffice/' + routeParams.entityId).search({});
                } else if (scope.fromEntity == 'journalentry') {
                    location.path('/viewtransactions/' + routeParams.entityId).search({});
                } else if(scope.fromEntity == 'village'){
                    location.path('/viewvillage/' + routeParams.entityId).search({});
                }else if(scope.fromEntity == 'employee'){
                    location.path('/viewemployee/' + routeParams.entityId).search({});
                } else if(scope.fixedDeposit){
                    location.path('/viewfixeddepositaccount/' + routeParams.entityId).search({});
                } else if(scope.recurringDeposit){
                    location.path('/viewrecurringdepositaccount/' + routeParams.entityId).search({});
                };
            };
            scope.submit = function () {
                if(scope.showSelect==false){
                    for(var i in scope.columnHeaders){
                        if(scope.columnHeaders [i].columnName == "Village Name"){
                            this.formData[scope.columnHeaders[i].columnName] = scope.villageName;
                        }
                    }
                }
                if(scope.fromEntity == 'loan'){
                    this.formData.appTable = 'm_loan';
                }
                var params = {datatablename: scope.tableName, entityId: scope.entityId, genericResultSet: 'true', command: scope.dataTableName};
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
                        if(this.formDat[scope.columnHeaders[i].columnName].date == undefined || this.formDat[scope.columnHeaders[i].columnName].time == undefined){
                            this.formData[scope.columnHeaders[i].columnName] = null;
                        }
                        else{
                            this.formData[scope.columnHeaders[i].columnName] = dateFilter(this.formDat[scope.columnHeaders[i].columnName].date, scope.df)
                        + " " + dateFilter(this.formDat[scope.columnHeaders[i].columnName].time, scope.tf);
                        }  
                    } else if(scope.columnHeaders[i].columnDisplayType == 'MULTISELECTCODELOOKUP'){
                        var multiSelectAsValuesArray = this.formData[scope.columnHeaders[i].columnName];
                        this.formData[scope.columnHeaders[i].columnName] = multiSelectAsValuesArray.toString(); 
                    }
                }


                resourceFactory.DataTablesResource.save(params, this.formData, function (data) {
                    if(scope.issubmitcontinue)
                    {
                        scope.formData={};
                        scope.formDat = {};
                        scope.count=++scope.count;
                        scope.issubmitcontinue = false ;
                    }
                    else{
                    var destination = "";
                    if(scope.staffId){
                        destination = '/viewemployee/' + scope.staffId;
                    } else if (data.loanId) {
                        destination = '/viewloanaccount/' + data.loanId;
                    }else if(scope.village){
                        destination = '/viewvillage/'+ routeParams.entityId;
                    }else if (scope.savingsaccount) {
                        destination = '/viewsavingaccount/' + data.savingsId;
                    } else if (scope.fixedDeposit) {
                        destination = '/viewfixeddepositaccount/' + data.savingsId;
                    } else if (scope.recurringDeposit) {
                        destination = '/viewrecurringdepositaccount/' + data.savingsId;
                    } else if (data.clientId) {
                        destination = '/viewclient/' + data.clientId;
                    } else if (data.groupId) {
                        if (scope.isCenter) {
                            destination = '/viewcenter/' + data.groupId;
                        } else {
                            destination = '/viewgroup/' + data.groupId;
                        }
                    } else if (data.transactionId) {
                        destination = '/viewtransactions/' + data.transactionId;
                    } else if (data.officeId) {
                        destination = '/viewoffice/' + data.officeId;
                    } 
                    location.path(destination);
                }
                });
            };

            scope.submitcontinue = function () {
                scope.issubmitcontinue = true ;
                scope.submit();
                };

            scope.hideField = function(data){
               if(idList.indexOf(data.columnName) >= 0) {
                return true;
               }
               return false;
            }

        }
    });
    mifosX.ng.application.controller('MakeDataTableEntryController', ['$scope', '$location', '$routeParams', 'ResourceFactory', 'dateFilter', '$rootScope', '$filter', mifosX.controllers.MakeDataTableEntryController]).run(function ($log) {
        $log.info("MakeDataTableEntryController initialized");
    });
}(mifosX.controllers || {}));
