(function (module) {
    mifosX.controllers = _.extend(module, {
        LoanApplicationWorkflowController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {

            scope.datatabledetails = "";
            scope.status = 'CREATE';
            scope.view_tab = "tab1";
            scope.resourceId = routeParams.loanApplicationId;
            scope.loanApplicationId = routeParams.loanApplicationId;
            scope.masterconfig = {"loanApplicationId": routeParams.loanApplicationId};
            scope.loanApplicationData = {};


            resourceFactory.loanApplicationReferencesResource.getByLoanAppId({loanApplicationReferenceId: scope.loanApplicationId}, function (data) {
                scope.loanApplicationData = data;
                scope.formData = data;
                scope.loanProductChange(scope.formData.loanProductId);
                scope.masterconfig["clientId"] = scope.loanApplicationData.clientId;
                resourceFactory.loanapplicationWorkflowResource.get({loanApplicationId: scope.loanApplicationId}, function (data) {
                    console.log(data);
                    var workflowExecutionData = data;
                    scope.$broadcast('initworkflow', {"workflowExecutionData": workflowExecutionData});
                });

            });

            scope.loanProductChange = function (loanProductId) {

                scope.inparams = {resourceType: 'template', activeOnly: 'true'};
                if (scope.formData.clientId && scope.formData.groupId) {
                    scope.inparams.templateType = 'jlg';
                } else if (scope.formData.groupId) {
                    scope.inparams.templateType = 'group';
                } else if (scope.formData.clientId) {
                    scope.inparams.templateType = 'individual';
                }
                if (scope.formData.clientId) {
                    scope.inparams.clientId = scope.formData.clientId;
                }
                if (scope.formData.groupId) {
                    scope.inparams.groupId = scope.formData.groupId;
                }
                scope.inparams.staffInSelectedOfficeOnly = true;
                scope.inparams.productId = loanProductId;

                resourceFactory.loanResource.get(scope.inparams, function (data) {
                    scope.loanaccountinfo = data;
                    if (data.clientName) {
                        scope.clientName = data.clientName;
                    }
                    if (data.group) {
                        scope.groupName = data.group.name;
                    }
                });
            };


            // resourceFactory.loanapplicationWorkflowResource.get({loanApplicationId: scope.resourceId},
            //     function (data) {
            //         scope.data1 = data;
            //
            //         console.log(scope.data1);
            //     }
            // );
            // scope.data1 = {"id":1, "name":"tractor workflow",
            //         stepsList: [
            //             {"id":1,"name":"credit bureo details","task":{"id":1,"name":"creditbureodetail","type":"view"}},
            //             {"id":2,"name":"occupation details","task":{"id":1,"name":"occupationdetails","type":"datatable"}},
            //             {"id":3,"name":"background verification","task":{"id":1,"name":"backgroundverification","type":"form"}}
            //         ]
            //     };
            //
            //     scope.data2 = {"id":1, "name":"home loan workflow",
            //         "stepsList": [
            //             {"id":1,"name":"credit bureo details","task":{"id":1,"name":"creditbureodetail","type":"view"}},
            //             {"id":2,"name":"credit approval memo",task:{"id":1,"name":"income detail","type":"datatable"}},
            //             {"id":3,"name":"insurance and nominee",task:{"id":1,"name":"income detail","type":"form"}}
            //         ]
            //     };




                /*resourceFactory.DataTablesResource.getTableDetails({datatablename: 'family_details',
                    entityId: 1, genericResultSet: 'true'}, function (data) {
                    console.log(data);
                    scope.datatabledetails = data;
                    scope.datatabledetails.isData = data.data.length > 0 ? true : false;
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
                                row.value = data.data[0].row[i];
                                scope.singleRow.push(row);
                            }
                        }
                    }
                });*/



            // if not data get the create template
            /*if (scope.datatabledetails.isData) {

                resourceFactory.DataTablesResource.getTableDetails({ datatablename: 'family_details', entityId: 1, genericResultSet: 'true' }, function (data) {

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
                        if(scope.columnHeaders[i].columnDisplayType == 'DATETIME') {
                            return scope.df + " " + scope.tf;
                        }
                    }
                    return scope.df;
                };

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
                        var destination = "";
                        if (data.loanId) {
                            destination = '/viewloanaccount/' + data.loanId;
                        } else if (data.savingsId) {
                            destination = '/viewsavingaccount/' + data.savingsId;
                        } else if (data.clientId) {
                            destination = '/viewclient/' + data.clientId;
                        } else if (data.groupId) {
                            if (scope.isCenter) {
                                destination = '/viewcenter/' + data.groupId;
                            } else {
                                destination = '/viewgroup/' + data.groupId;
                            }
                        } else if (data.officeId) {
                            destination = '/viewoffice/' + data.officeId;
                        }
                        location.path(destination);
                    });
                };












            };*/








        }
    });
    mifosX.ng.application.controller('LoanApplicationWorkflowController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.LoanApplicationWorkflowController]).run(function ($log) {
        $log.info("LoanApplicationWorkflowController initialized");
    });
}(mifosX.controllers || {}));