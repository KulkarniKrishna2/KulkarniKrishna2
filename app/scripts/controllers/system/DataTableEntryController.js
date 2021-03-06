(function (module) {
    mifosX.controllers = _.extend(module, {
        DataTableEntryController: function (scope, location, routeParams, route, resourceFactory, $modal, dateFilter, $rootScope) {

            if (routeParams.tableName) {
                scope.tableName = routeParams.tableName;
            }
            if (routeParams.entityId) {
                scope.entityId = routeParams.entityId;
            }
            if (routeParams.resourceId) {
                scope.resourceId = routeParams.resourceId;
            }
            scope.formDat = {};
            scope.columnHeaders = [];
            scope.formData = {};
            scope.isViewMode = true;
            scope.tf = "HH:mm";
	        scope.columnValueLookUp = [];
	        scope.enableDependency = true;
            scope.client=false;
            scope.group=false;
            scope.center=false;
            scope.office=false;
            scope.savingsaccount=false;
            scope.loanproduct = false;
            scope.village = false;
            scope.showSelect = true; //
            scope.villageName;
            scope.isJournalEntry = false;
            scope.dataTableName = '';
            
            scope.isSectioned = false;
            scope.isEditSections = false;
            scope.sectionedColumnHeaders = [];
            scope.columnValueEntries = {};
            scope.associateAppTable = null;
            scope.fixedDeposit = false;
            scope.recurringDeposit = false;
            var reqparams = {};
            var  idList = ['client_id', 'office_id', 'group_id', 'center_id', 'loan_id', 'savings_account_id', 'gl_journal_entry_id', 'loan_application_reference_id', 'journal_entry_id', 'villages_id', 'staff_id'];

            if(routeParams.tableName =="Address"){
                scope.showSelect=false;
            }
            if(routeParams.mode && routeParams.mode == 'edit'){
                scope.isViewMode = false;
            }

            if (routeParams.fromEntity === 'client') {
                scope.clientName = $rootScope.clientname;
                scope.client=true;
            }else if (routeParams.fromEntity === 'group') {
                scope.groupName = $rootScope.groupNameDataParameter;
                scope.group=true;
            }else if (routeParams.fromEntity === 'center') {
                scope.centerName = $rootScope.centerName;
                scope.center=true;
            }else if (routeParams.fromEntity === 'loan') {
                scope.loanproductName = $rootScope.loanproductName;
                scope.loanproduct = true;
                scope.clientId = $rootScope.clientId;
                scope.LoanHolderclientName = $rootScope.LoanHolderclientName;
                scope.fromEntity = routeParams.fromEntity;
                scope.associateAppTable = 'm_loan';
            }else if (routeParams.fromEntity === 'office') {
                scope.officeName =  $rootScope.officeName;
                scope.office=true;
            }else if (routeParams.fromEntity === 'savings') {
                scope.savingsAccount =  $rootScope.savingsAccount;
                scope.savingsaccount=true;
                scope.clientId=$rootScope.clientId;
                scope.savingsaccountholderclientName=$rootScope.savingsaccountholderclientName;
            }else if(routeParams.fromEntity === 'village'){
                scope.villageName = $rootScope.villageNameDataParameter;
                scope.village=true;
                scope.villageId = $rootScope.villageId;
            }else if (routeParams.fromEntity === 'staff') {
                scope.staffId =  scope.entityId;
            } else if (routeParams.fromEntity == 'fixeddeposit') {
                scope.fixedDeposit = true;
            } else if (routeParams.fromEntity == 'recurringdeposit') {
                scope.recurringDeposit = true;
            }
            var reqparams = {datatablename: scope.tableName, entityId: scope.entityId.toString(), genericResultSet: 'true', command: scope.dataTableName,associateAppTable: scope.associateAppTable};
            if (scope.resourceId) {
                reqparams.resourceId = scope.resourceId;
            }
            resourceFactory.DataTablesResource.getTableDetails(reqparams, function (data) {
                scope.isJournalEntry = data.columnHeaders.findIndex(x=>x.columnName == 'journal_entry_id') >= 0 ? true : false;
                if(scope.isJournalEntry){
                       reqparams.command = 'f_journal_entry';
                }else{
                     scope.isCenter = data.columnHeaders.findIndex(x => x.columnName == 'center_id') >= 0 ? true : false;
                }
                for (var i in data.columnHeaders) {
                    var colName = data.columnHeaders[i].columnName;
                    if( colName == 'id' ){
                        data.columnHeaders.splice(i, 1);
                        colName = data.columnHeaders[i].columnName;
                    }
                     if(idList.indexOf(colName) >= 0 ){
                        data.columnHeaders.splice(i, 1);
                    }
                }

                    for (var i in data.columnHeaders) {
                    var index = data.columnData[0].row.findIndex(x => x.columnName==data.columnHeaders[i].columnName);
                    if(index > 0){
                        data.columnHeaders[i].value = data.columnData[0].row[index].value; 
                        
                    }

                    if (data.columnHeaders[i].columnCode) {
                        //logic for display codeValue instead of codeId in view datatable details
                        for (var j in data.columnHeaders[i].columnValues) {
                            if(data.columnHeaders[i].columnDisplayType=='CODELOOKUP'){
                                if (data.data[0].row[i] == data.columnHeaders[i].columnValues[j].id) {
                                    data.columnHeaders[i].value = data.columnHeaders[i].columnValues[j].value;
                                }
                                if(data.columnData[0].row[index].value == data.columnHeaders[i].columnValues[j].id){
                                     data.columnHeaders[i].value = data.columnHeaders[i].columnValues[j].value;
                                }

                            } else if(data.columnHeaders[i].columnDisplayType=='CODEVALUE'){
			    	            if (data.data[0].row[i] == data.columnHeaders[i].columnValues[j].value) {
                                    data.columnHeaders[i].value = data.columnHeaders[i].columnValues[j].value;
                                }
                                if(data.columnData[0].row[index].value == data.columnHeaders[i].columnValues[j].value){
                                     data.columnHeaders[i].value = data.columnHeaders[i].columnValues[j].value;
                                }
                            }
                        }
                    }   
                    
                }
                scope.columnHeaders = data.columnHeaders;
                
                if(data.sectionedColumnList != undefined && data.sectionedColumnList != null && data.sectionedColumnList.length >0){
                	scope.isSectioned = true;
                }
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
                if(routeParams.mode && routeParams.mode == 'edit'){
                    scope.editDatatableEntry();
                }
            });


            // this function fetch all data of particular village id and assign new value to column name of address table

            scope.changeVillage = function(id) {
                scope.villageId = id.id;
                scope.villageName = id.value;
                if (scope.tableName == "Address") {
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
            };


            //return input type
            scope.fieldType = function (type) {
                var fieldType = "";
                if (type) {
                    if (type == 'CODELOOKUP' || type == 'CODEVALUE'||type == 'MULTISELECTCODELOOKUP') {
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
                    if(scope.columnHeaders[i].columnDisplayType == 'DATETIME') {
                        return scope.df + " " + scope.tf;
                    }
                }
                
                for(var i in scope.sectionedColumnHeaders){
               	    for (var j in scope.sectionedColumnHeaders[i].columns) { 
               		    if(scope.sectionedColumnHeaders[i].columns[j].columnDisplayType == 'DATETIME') {
                            return scope.df + " " + scope.tf;
               	        }
                    }
                }
                return scope.df;
            };

            scope.editDatatableEntry = function () {
                scope.isViewMode = false;
                for (var i in scope.columnHeaders) {
                    var colName = scope.columnHeaders[i].columnName;
                    if(colName === 'id'){
                        scope.columnHeaders.splice(i, 1);
                        colName = scope.columnHeaders[i].columnName;
                    }else if(colName === 'journal_entry_id'){
                        scope.dataTableName = 'f_journal_entry';
                    }
                    if(idList.indexOf(colName) >= 0 ){
                        scope.columnHeaders.splice(i, 1);
                    }
                }
                scope.getDependencyColumns(true);
                for (var i in scope.columnHeaders) {
                    if (scope.columnHeaders[i].columnDisplayType == 'DATE') {
                        scope.formDat[scope.columnHeaders[i].columnName] = scope.columnHeaders[i].value;
                    } else if (scope.columnHeaders[i].columnDisplayType == 'DATETIME') {
                        scope.formDat[scope.columnHeaders[i].columnName] = {};
                        if(scope.columnHeaders[i].value != null) {
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
                                if(scope.columnHeaders[i].columnDisplayType=='CODELOOKUP'|| scope.columnHeaders[i].columnDisplayType == 'MULTISELECTCODELOOKUP'){
                                    if(scope.columnHeaders[i].value != undefined  && scope.columnHeaders[i].value == scope.columnHeaders[i].columnValues[j].value) {
                                        scope.formData[scope.columnHeaders[i].columnName] = scope.columnHeaders[i].columnValues[j].id;
                                    }
                                    scope.columnValueLookUp = scope.columnHeaders[i].columnValues
                                    var obj = angular.fromJson(scope.columnHeaders);
                                    for(var j in scope.columnHeaders[i].columnValues){
                                        obj[i].columnValuesLookup = scope.columnValueLookUp;
                                    }
                                } else if(scope.columnHeaders[i].columnDisplayType=='CODEVALUE'){
                                    if(scope.columnHeaders[i].value != undefined  && scope.columnHeaders[i].value == scope.columnHeaders[i].columnValues[j].value) {
                                        scope.formData[scope.columnHeaders[i].columnName] = scope.columnHeaders[i].columnValues[j].value;
                                    }
                                    scope.columnValueLookUp = scope.columnHeaders[i].columnValues
                                    var obj = angular.fromJson(scope.columnHeaders);
                                    for(var j in scope.columnHeaders[i].columnValues){
                                        obj[i].columnValuesLookup = scope.columnValueLookUp;
                                    }
                                }
                        }
                    }
                    if (scope.columnHeaders[i].visibilityCriteria != "" && scope.columnHeaders[i].visibilityCriteria != null) {
                        for(var j in scope.columnHeaders[i].visibilityCriteria){
                            for(var k in scope.columnHeaders[i].visibilityCriteria[j].columnValue){
                                if(scope.columnHeaders[i].visibilityCriteria[j].columnValue[k].value == "true"){
                                    scope.enableDependency = false;
                                }else{
                                    scope.enableDependency = true;
                                }
                            }

                        }
                    }
                }
                if(obj != "" && obj != undefined){
                    scope.columnHeaders = obj;
                }
                
                if(scope.sectionedColumnHeaders != null && scope.sectionedColumnHeaders != undefined && scope.sectionedColumnHeaders.length > 0){
                	scope.isEditSections = true;
                	scope.isSectioned = false;
                }
                
                for (var i in scope.sectionedColumnHeaders) {
            	   for (var j in scope.sectionedColumnHeaders[i].columns){
                        if (scope.sectionedColumnHeaders[i].columns[j].columnDisplayType == 'DATE') {
                            scope.formDat[scope.sectionedColumnHeaders[i].columns[j].columnName] = scope.sectionedColumnHeaders[i].columns[j].value;
                        } 
                        else if (scope.sectionedColumnHeaders[i].columns[j].columnDisplayType == 'DATETIME') {
                            scope.formDat[scope.sectionedColumnHeaders[i].columns[j].columnName] = {};
                            if(scope.sectionedColumnHeaders[i].columns[j].value != null) {
                                scope.formDat[scope.sectionedColumnHeaders[i].columns[j].columnName] = {
                                    date: dateFilter(new Date(scope.sectionedColumnHeaders[i].columns[j].value), scope.df),
                                    time: dateFilter(new Date(scope.sectionedColumnHeaders[i].columns[j].value), scope.tf)
                                };
                            }
                        } 
                        else {
                            scope.formData[scope.sectionedColumnHeaders[i].columns[j].columnName] = scope.sectionedColumnHeaders[i].columns[j].value;
                        }
                        
                        if (scope.sectionedColumnHeaders[i].columns[j].columnCode) {
                            for (var k in scope.sectionedColumnHeaders[i].columns[j].columnValues) {
                                if(scope.sectionedColumnHeaders[i].columns[j].columnDisplayType=='CODELOOKUP'){
                                    if(scope.sectionedColumnHeaders[i].columns[j].value != undefined  && scope.sectionedColumnHeaders[i].columns[j].value == scope.sectionedColumnHeaders[i].columns[j].columnValues[k].value) {
                                        scope.formData[scope.sectionedColumnHeaders[i].columns[j].columnName] = scope.sectionedColumnHeaders[i].columns[j].columnValues[k].id;
                                    }
                                    scope.columnValueLookUp = scope.sectionedColumnHeaders[i].columns[j].columnValues;
                                    var obj = angular.fromJson(scope.sectionedColumnHeaders[i].columns[j]);
                                    scope.sectionedColumnHeaders[i].columns[j].columnValuesLookup = scope.columnValueLookUp;
                                } 
                                else if(scope.sectionedColumnHeaders[i].columns[j].columnDisplayType=='CODEVALUE'){
                                    if(scope.sectionedColumnHeaders[i].columns[j].value != undefined  && scope.sectionedColumnHeaders[i].columns[j].value == scope.sectionedColumnHeaders[i].columns[j].columnValues[k].value) {
                                        scope.formData[scope.sectionedColumnHeaders[i].columns[j].columnName] = scope.sectionedColumnHeaders[i].columns[j].columnValues[k].value;
                                    }
                                    scope.columnValueLookUp = scope.sectionedColumnHeaders.columns[j].columnValues;
                                    scope.sectionedColumnHeaders[i].columns[j].columnValuesLookup = scope.columnValueLookUp;
                                }
                            }
                        }
                        if (scope.sectionedColumnHeaders[i].columns[j].visibilityCriteria != "" && scope.sectionedColumnHeaders[i].columns[j].visibilityCriteria != null) {
                            for(var k in scopesectionedColumnHeaders[i].columns[j].visibilityCriteria){
                                for(var l in scope.sectionedColumnHeaders[i].columns[j].visibilityCriteria[k].columnValue){
                                    if(scope.sectionedColumnHeaders[i].columns[j].visibilityCriteria[k].columnValue[l].value == "true"){
                                        scope.enableDependency = false;
                                    }
                                    else{
                                        scope.enableDependency = true;
                                    }
                                }
                            }
                        }
                    }
                }
            };

            scope.getDependencyList = function(codeId) {
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
                            var obj = angular.fromJson(scope.columnHeaders);
                            for (var j in scope.columnHeaders[i].columnValues) {
                                obj[i].columnValuesLookup = scope.columnValueLookUp;
                            }
                        }
                    }
                    scope.columnHeaders = obj;
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

            scope.deleteDatatableEntry = function () {
                $modal.open({
                    templateUrl: 'deletedatatable.html',
                    controller: DatatableDeleteCtrl
                });
            };
            var DatatableDeleteCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    resourceFactory.DataTablesResource.delete(reqparams, {}, function (data) {
                        var destination = "";
                        if(scope.staffId){
                            destination = '/viewemployee/' + scope.staffId;
                        } else if (data.loanId) {
                            destination = '/viewloanaccount/' + data.loanId;
                        } else if (scope.savingsaccount) {
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
                        } else if(scope.village){
                            destination = '/viewvillage/' + scope.villageId;
                        } else if (data.officeId) {
                            destination = '/viewoffice/' + data.officeId;
                        }
                        $modalInstance.close('delete');
                        location.path(destination);
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.backButton = function () {
                window.history.back();
            };

            scope.cancel = function () {
                if(routeParams.mode){
                    window.history.back();
                } else{
                    route.reload();
                }

            };

            scope.submit = function () {
                if(scope.showSelect==false){
                    for(var i in scope.columnHeaders){
                        if(scope.columnHeaders [i].columnName == "Village Name"){
                            this.formData[scope.columnHeaders[i].columnName] = scope.villageName;
                        }
                    }
                }
                this.formData.Id = scope.entityId.toString()
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.dateTimeFormat();
                for (var i = 0; i < scope.columnHeaders.length; i++) {
                    if (!_.contains(_.keys(this.formData), scope.columnHeaders[i].columnName)) {
                        this.formData[scope.columnHeaders[i].columnName] = "";
                    }
                    if (scope.columnHeaders[i].columnDisplayType == 'DATE') {
                        this.formData[scope.columnHeaders[i].columnName] = dateFilter(this.formDat[scope.columnHeaders[i].columnName], this.formData.dateFormat);
                    } else if(scope.columnHeaders[i].columnDisplayType == 'DATETIME') {
                        if(this.formDat[scope.columnHeaders[i].columnName].date == undefined || this.formDat[scope.columnHeaders[i].columnName].time == undefined){
                            this.formData[scope.columnHeaders[i].columnName] = null;
                        }
                        else{
                            this.formData[scope.columnHeaders[i].columnName] = dateFilter(this.formDat[scope.columnHeaders[i].columnName].date, scope.df) + " " +
                        dateFilter(this.formDat[scope.columnHeaders[i].columnName].time, scope.tf);
                        }
                        
                    }
                    else if(scope.columnHeaders[i].columnDisplayType == 'MULTISELECTCODELOOKUP'){
                        var multiSelectAsValuesArray = this.formData[scope.columnHeaders[i].columnName];
                        this.formData[scope.columnHeaders[i].columnName] = multiSelectAsValuesArray.toString(); 
                    }
                }
                if(scope.fromEntity == 'loan'){
                    this.formData.appTable = 'm_loan';
                }
                resourceFactory.DataTablesResource.update(reqparams, this.formData, function (data) {
                    var destination = "";
                    if(scope.staffId){
                        destination = '/viewemployee/' + scope.staffId;
                    } else if (data.loanId) {
                        destination = '/viewloanaccount/' + data.loanId;
                    } else if(scope.village){
                        destination = '/viewvillage/' + $rootScope.villageId;
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
                    } else if (scope.isJournalEntry) {
                        destination = '/viewtransactions/' + scope.entityId.toString();
                    } else if (data.officeId) {
                        destination = '/viewoffice/' + data.officeId;
                    } else if (data.staffId) {
                        destination = '/viewemployee/' + data.staffId;
                    }
                    location.path(destination);
                });   
            };
            scope.hideField = function(data){
               if(idList.indexOf(data.columnName) >= 0) {
                return true;
               }
               return false;
            }

        }
    });
    mifosX.ng.application.controller('DataTableEntryController', ['$scope', '$location', '$routeParams', '$route', 'ResourceFactory', '$modal', 'dateFilter','$rootScope', mifosX.controllers.DataTableEntryController]).run(function ($log) {
        $log.info("DataTableEntryController initialized");
    });
}(mifosX.controllers || {}));
