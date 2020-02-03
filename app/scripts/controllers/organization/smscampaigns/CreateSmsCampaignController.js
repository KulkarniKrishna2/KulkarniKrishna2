(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateSmsCampaignController: function (scope, WizardHandler, resourceFactory, location, dateFilter) {

            scope.reportParams = new Array();
            scope.reportDateParams = new Array();
            scope.reqFields = new Array();
            scope.reportTextParams = new Array();
            scope.reportData = {};
            scope.reportData.columnHeaders = [];
            scope.reportData.data = [];
            scope.submissionData = {};
            scope.minDate = new Date();
            scope.restrictDate = new Date();
            scope.offices = [];
            scope.staffs = [];
            scope.selectedObjects = {};
            scope.formData = {};
            scope.formData.client = {};
            scope.today = new Date();
            scope.isButtonDisabled = false;
            scope.triggerTypeOptions = [] ;
            scope.campaignTypeOptions = [];
            scope.providerOptions = [] ;
            scope.businessRules = [] ;
            scope.campaignData = {};
            scope.campaignData.campaignMessage = "";
            scope.previewData = {};
            scope.filteredBusinessRules = [];
            var triggeredBusinessRule = [];
            var nonTriggeredBusinessRule = [];
            scope.simpleDate = new Date();
            var simpleTime = new Date(scope.simpleDate.getTime());
            scope.campaignData.time = new Date(0, 0, 0, simpleTime.getHours(), simpleTime.getMinutes(), simpleTime.getSeconds());
            scope.dft = 'yyyy-MM-dd HH:mm:ss';
            scope.selectedOffices = [];
            scope.selectedProducts = [];

            scope.buildMessageTemplate = function (paramName) {
                scope.campaignData.campaignMessage += " " + "{{" + paramName + "}}";
            }

            scope.reportSelected = function (reportName) {
                scope.reqFields = [] ;
                scope.reportParams = [] ;
                scope.reportDateParams = [] ;
                scope.reportTextParams  = [] ;

                resourceFactory.runReportsResource.getReport({reportSource: 'FullParameterList', parameterType: true, R_reportListing: "'" + reportName + "'"}, function (data) {
                    for (var i in data.data) {
                        var temp = {
                            name: data.data[i].row[0],
                            variable: data.data[i].row[1],
                            label: data.data[i].row[2],
                            displayType: data.data[i].row[3],
                            formatType: data.data[i].row[4],
                            defaultVal: data.data[i].row[5],
                            selectOne: data.data[i].row[6],
                            selectAll: data.data[i].row[7],
                            parentParameterName: data.data[i].row[8],
                            inputName: "R_" + data.data[i].row[1] //model name
                        };
                        scope.reqFields.push(temp);
                        if (temp.displayType == 'select' && temp.parentParameterName == null) {
                            intializeParams(temp, {});
                        } else if (temp.displayType == 'date') {
                            scope.reportDateParams.push(temp);
                        } else if (temp.displayType == 'text') {
                            scope.reportTextParams.push(temp);
                        }
                    }
                });

            } ;
            scope.getBusinessRule = function() {
                if (!_.isUndefined(scope.campaignData.triggerType.value) && scope.campaignData.triggerType.value === 'Triggered') {
                    scope.filteredBusinessRules = triggeredBusinessRule;
                } else {
                    scope.filteredBusinessRules =  nonTriggeredBusinessRule;
                }
            };

            scope.filterBusinessRule = function() {
                triggeredBusinessRule = [];
                nonTriggeredBusinessRule = [];
                angular.forEach(scope.businessRuleOptions, function (businessRule) {
                    if (!_.isNull(businessRule.reportSubType) && !_.isUndefined(businessRule.reportSubType) && businessRule.reportSubType === 'Triggered') {
                        triggeredBusinessRule.push(businessRule);
                    } else {
                        nonTriggeredBusinessRule.push(businessRule);
                    }
                });
            };

            function intializeParams(paramData, params) {
                scope.errorStatus = undefined;
                scope.errorDetails = [];
                params.reportSource = paramData.name;
                params.parameterType = true;
                var successFunction = getSuccuessFunction(paramData);
                resourceFactory.runReportsResource.getReport(params, successFunction);
            }

            function getSuccuessFunction(paramData) {
                var tempDataObj = new Object();
                var successFunction = function (data) {
                    var selectData = [];
                    var isExistedRecord = false;
                    for (var i in data.data) {
                        selectData.push({id: data.data[i].row[0], name: data.data[i].row[1]});
                    }
                    for (var j in scope.reportParams) {
                        if (scope.reportParams[j].name == paramData.name) {
                            scope.reportParams[j].selectOptions = selectData;
                            isExistedRecord = true;
                        }
                    }
                    if (!isExistedRecord) {
                        if(paramData.selectAll == 'Y'){
                            selectData.push({id: "-1", name: "All"});
                        }
                        paramData.selectOptions = selectData;
                        scope.reportParams.push(paramData);
                    }
                };
                return successFunction;
            }

            scope.getDependencies = function (paramData) {
                for (var i = 0; i < scope.reqFields.length; i++) {
                    var temp = scope.reqFields[i];
                    if (temp.parentParameterName == paramData.name) {
                        if (temp.displayType == 'select') {
                            var parentParamValue = this.formData[paramData.inputName];
                            if (parentParamValue != undefined) {
                                eval("var params={};params." + paramData.inputName + "='" + parentParamValue + "';");
                                intializeParams(temp, params);
                            }
                        } else if (temp.displayType == 'date') {
                            scope.reportDateParams.push(temp);
                        }
                    }
                }
                resourceFactory.reportsResource.get({id: scope.campaignData.report.reportId, fields: 'reportParameters'}, function (data) {
                    scope.smsReportParameters = data.reportParameters || [];
                });
            };

            scope.getColumnHeaders = function () {
                for (var i in scope.reportDateParams) {
                    if (scope.formData[scope.reportDateParams[i].inputName]) {
                        scope.formData[scope.reportDateParams[i].inputName] = dateFilter(scope.formData[scope.reportDateParams[i].inputName], 'yyyy-MM-dd');
                    }
                }
                parameterValidationErrors();
                if (scope.errorDetails.length === 0) {
                    scope.formData.reportSource = scope.campaignData.report.reportName;

                    for (var i = 0; i < scope.reqFields.length; i++) {
                        var tempForm = {};
                        var tempParam = scope.reqFields[i];
                        if (tempParam.displayType == 'none') {
                            var paramName = tempParam.variable;
                            scope.formData[tempParam.inputName] = -1;
                        }
                    }
                    resourceFactory.runReportsResource.getReport(scope.formData, function (data) {
                        scope.reportData.columnHeaders = data.columnHeaders;
                    });
                }
            };

            function buildPreviewParms() {
                var reportParams = {};
                for (var i = 0; i < scope.reqFields.length; i++) {
                    var reqField = scope.reqFields[i];
                    if (scope.smsReportParameters) {
                        for (var j = 0; j < scope.smsReportParameters.length; j++) {
                            var tempParam = scope.smsReportParameters[j];
                            if (reqField.name == tempParam.parameterName) {
                                reportParams[reqField.variable] = scope.formData[scope.reqFields[i].inputName];
                            }
                        }
                    }
                    if (scope.reportDateParams) {
                        for (var j = 0; j < scope.reportDateParams.length; j++) {
                            var tempParam = scope.reportDateParams[j];
                            if (reqField.name == tempParam.name) {
                                reportParams[reqField.variable] = scope.formData[scope.reqFields[i].inputName];
                            }
                        }
                    }
                    if (scope.reportTextParams) {
                        for (var j = 0; j < scope.reportTextParams.length; j++) {
                            var tempParam = scope.reportTextParams[j];
                            if (reqField.name == tempParam.name) {
                                reportParams[reqField.variable] = scope.formData[scope.reqFields[i].inputName];
                            }
                        }
                    }
                }
                return reportParams;
            };

            scope.previewMessage = function() {
                scope.paramValues = buildPreviewParms();
                scope.paramValues.reportName = scope.formData.reportSource;
                scope.previewData = {
                    message: scope.campaignData.campaignMessage,
                    paramValue: scope.paramValues
                };
                    resourceFactory.smsCampaignResource.preview({additionalParam: 'preview'}, scope.previewData, function (data) {
                        scope.previewMessage = data.campaignMessage;
                        scope.totalNumberOfMessages = data.totalNumberOfMessages;
                    });
            }

            scope.showOfficeDetails = function () {
                scope.showOfficeDetails = !scope.showOfficeDetails;

                resourceFactory.officeResource.getAllOfficesInAlphabeticalOrder(function (data) {
                    scope.offices = data;
                    var allOffice = {
                        'name' : 'Select all Offices',
                        'id' : -1
                    }
                    scope.offices.splice( 0, 0, allOffice );
                });
            }

            scope.addOffice = function() {
                for (var i in this.selectedOffice) {
                    for (var j in scope.offices) {
                        if (scope.offices[j].id == this.selectedOffice[i]) {
                            var temp = {};
                            temp.id = this.selectedOffice[i];
                            temp.name = scope.offices[j].name;
                            scope.selectedOffices.push(temp);
                            scope.offices.splice(j, 1);
                        }
                    }
                }

                for (var i in this.selectedOffice) {
                    for (var j in scope.selectedOffices) {
                        if (scope.selectedOffices[j].id == this.selectedOffice[i]) {
                            scope.selectedOffice.splice(i, 1);
                        }
                    }
                }
            };

            scope.removeOffice = function(index) {
                var temp = scope.selectedOffices[index];
                scope.offices.push(temp);
                scope.selectedOffices.splice(index, 1);
            };

            scope.showProductDetails = function () {
                scope.showProductDetails = !scope.showProductDetails;

                resourceFactory.loanProductAssociationResource.getAll(function (data) {
                    scope.products = data;
                    var allProduct = {
                        'name' : 'Select all Products',
                        'id' : -1
                    }
                    scope.products.splice( 0, 0, allProduct );
                });
            }

            scope.addProduct = function() {
                for (var i in this.selectedProduct) {
                    for (var j in scope.products) {
                        if (scope.products[j].id == this.selectedProduct[i]) {
                            var temp = {};
                            temp.id = this.selectedProduct[i];
                            temp.name = scope.products[j].name;
                            scope.selectedProducts.push(temp);
                            scope.products.splice(j, 1);
                        }
                    }
                }

                for (var i in this.selectedProduct) {
                    for (var j in scope.selectedProducts) {
                        if (scope.selectedProducts[j].id == this.selectedProduct[i]) {
                            scope.selectedProduct.splice(i, 1);
                        }
                    }
                }
            };

            scope.removeProduct = function(index) {
                var temp = scope.selectedProducts[index];
                scope.products.push(temp);
                scope.selectedProducts.splice(index, 1);
            };

            function buildReportParms() {
                var paramCount = 1;
                var reportParams = "";
                for (var i = 0; i < scope.reqFields.length; i++) {
                    var reqField = scope.reqFields[i];
                    for (var j = 0; j < scope.smsReportParameters.length; j++) {
                        var tempParam = scope.smsReportParameters[j];
                        if (reqField.name == tempParam.parameterName) {
                            if(reqField.displayType == 'none') {
                                var paramName = 'R_' + tempParam.reportParameterName;
                                if (paramCount > 1) reportParams += ","
                                reportParams += encodeURIComponent(paramName) + ":" + encodeURIComponent("-1");
                                paramCount = paramCount + 1;
                            }else {
                                var paramName = 'R_' + tempParam.reportParameterName;
                                if (paramCount > 1) reportParams += ","
                                reportParams += encodeURIComponent(paramName) + ":" + encodeURIComponent(scope.formData[scope.reqFields[i].inputName]);
                                paramCount = paramCount + 1;
                            }
                        }
                    }
                }
                /*for (var i = 0; i < scope.reqFields.length; i++) {
                    var tempParam = scope.reqFields[i];
                    if (tempParam.displayType == 'none') {
                        reportParams += ","
                        reportParams += encodeURIComponent(tempParam.inputName) + ":" + encodeURIComponent("-1");
                    }
                }*/
                return reportParams;
            };

            function invalidDate(checkDate) {
                // validates for yyyy-mm-dd returns true if invalid, false is valid
                var dateformat = /^\d{4}(\-|\/|\.)\d{1,2}\1\d{1,2}$/;

                if (!(dateformat.test(checkDate))) {
                    return true;
                } else {
                    var dyear = checkDate.substring(0, 4);
                    var dmonth = checkDate.substring(5, 7) - 1;
                    var dday = checkDate.substring(8);

                    var newDate = new Date(dyear, dmonth, dday);
                    return !((dday == newDate.getDate()) && (dmonth == newDate.getMonth()) && (dyear == newDate.getFullYear()));
                }
            }

            function parameterValidationErrors() {
                var tmpStartDate = "";
                var tmpEndDate = "";
                scope.errorDetails = [];
                for (var i in scope.reqFields) {
                    var paramDetails = scope.reqFields[i];
                    switch (paramDetails.displayType) {
                        case "select":
                            var selectedVal = scope.formData[paramDetails.inputName];
                            if (selectedVal == undefined || selectedVal == 0) {
                                var fieldId = '#' + paramDetails.inputName;
                                $(fieldId).addClass("validationerror");
                                var errorObj = new Object();
                                errorObj.field = paramDetails.inputName;
                                errorObj.code = 'error.message.report.parameter.required';
                                errorObj.args = {params: []};
                                errorObj.args.params.push({value: paramDetails.label});
                                scope.errorDetails.push(errorObj);
                            }
                            break;
                        case "date":
                            var tmpDate = scope.formData[paramDetails.inputName];
                            if (tmpDate == undefined || !(tmpDate > "")) {
                                var fieldId = '#' + paramDetails.inputName;
                                $(fieldId).addClass("validationerror");
                                var errorObj = new Object();
                                errorObj.field = paramDetails.inputName;
                                errorObj.code = 'error.message.report.parameter.required';
                                errorObj.args = {params: []};
                                errorObj.args.params.push({value: paramDetails.label});
                                scope.errorDetails.push(errorObj);
                            }
                            if (tmpDate && invalidDate(tmpDate) == true) {
                                var fieldId = '#' + paramDetails.inputName;
                                $(fieldId).addClass("validationerror");
                                var errorObj = new Object();
                                errorObj.field = paramDetails.inputName;
                                errorObj.code = 'error.message.report.invalid.value.for.parameter';
                                errorObj.args = {params: []};
                                errorObj.args.params.push({value: paramDetails.label});
                                scope.errorDetails.push(errorObj);
                            }

                            if (paramDetails.variable == "startDate") tmpStartDate = tmpDate;
                            if (paramDetails.variable == "endDate") tmpEndDate = tmpDate;
                            break;
                        case "text":
                            var selectedVal = scope.formData[paramDetails.inputName];
                            if (selectedVal == undefined) {
                                var fieldId = '#' + paramDetails.inputName;
                                $(fieldId).addClass("validationerror");
                                var errorObj = new Object();
                                errorObj.field = paramDetails.inputName;
                                errorObj.code = 'error.message.report.parameter.required';
                                errorObj.args = {params: []};
                                errorObj.args.params.push({value: paramDetails.label});
                                scope.errorDetails.push(errorObj);
                            }
                            break;
                    }
                }

                if (tmpStartDate > "" && tmpEndDate > "") {
                    if (tmpStartDate > tmpEndDate) {
                        var errorObj = new Object();
                        errorObj.field = paramDetails.inputName;
                        errorObj.code = 'error.message.report.incorrect.values.for.date.fields';
                        errorObj.args = {params: []};
                        errorObj.args.params.push({value: paramDetails.label});
                        scope.errorDetails.push(errorObj);
                    }
                }
            }

            resourceFactory.smsCampaignTemplateResource.get(function (data) {
                console.log(data);
                scope.triggerTypeOptions = data.triggerTypeOptions ;
                scope.campaignTypeOptions = data.campaignTypeOptions;
                scope.providerOptions = data.smsProviderOptions ;
                scope.businessRuleOptions = data.businessRulesOptions ;
                scope.frequencyTypeOptions = data.frequencyTypeOptions;
                scope.weekDays = data.weekDays;
                scope.filterBusinessRule();
            });

            scope.changeStaff = function (staffId) {
                resourceFactory.employeeResource.get({staffInSelectedOfficeOnly:true, associations:'all', staffId: staffId}, function (data) {
                    scope.linkedvillages = data.linkedVillages;
                });
            };

            scope.selectedPeriod = function (period) {
                if (period == 1) {
                    scope.repeatsEveryOptions = ["1", "2", "3"];
                    scope.periodValue = "day(s)"
                }
                if (period == 2) {
                    scope.repeatsEveryOptions = ["1", "2", "3"];
                    scope.periodValue = "week(s)";
                    scope.campaignData.repeatsOnDay = '1';
                    scope.repeatsOnOptions = scope.weekDays;
                }
                if (period == 3) {
                    scope.periodValue = "month(s)";
                    scope.repeatsEveryOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
                }
                if (period == 4) {
                    scope.periodValue = "year(s)";
                    scope.repeatsEveryOptions = ["1", "2", "3", "4", "5"];
                }
            };

            scope.noOfTabs = 3;
            scope.step = '-';

            scope.submit = function () {
                //onclick Disable proceed button to avoid multiple cilent creation
                setDisableTimeout();

                if (WizardHandler.wizard().getCurrentStep() != scope.noOfTabs) {
                    WizardHandler.wizard().next();
                    /*if (WizardHandler.wizard().getCurrentStep() == 2) {
                     if (scope.validateFiles())
                     WizardHandler.wizard().next();
                     } else {
                     WizardHandler.wizard().next();
                     }*/
                    return;
                }

                if (scope.campaignData.triggerType.value === 'Scheduled') {
                    scope.scheduledDateTime = scope.campaignData.recurrenceStartDate;
                    scope.scheduledDateTime.setHours(scope.campaignData.time.getHours());
                    scope.scheduledDateTime.setMinutes(scope.campaignData.time.getMinutes());
                    scope.scheduledDateTime.setSeconds(scope.campaignData.time.getSeconds());
                    scope.scheduledDateTime = dateFilter(scope.scheduledDateTime, scope.dft);
                }
                scope.getSelectedOfficeProduct();
                    //dateFilter(scope.campaignData.recurrenceStartDate, scope.df) + ' ' + scope.campaignData.time.getHours() + ':' + scope.campaignData.time.getMinutes() + ':' + scope.campaignData.time.getSeconds();
                scope.submissionData = {
                    providerId: scope.campaignData.smsProvider.id,
                    //runReportId: scope.campaignData.report.reportId,
                    triggerType: scope.campaignData.triggerType.id,
                    campaignName: scope.campaignData.campaignName,
                    campaignType: 1,
                    message: scope.campaignData.campaignMessage,
                    //paramValue: scope.paramValues,
                    dateFormat: scope.df,
                    locale: scope.optlang.code,
                    submittedOnDate: dateFilter(new Date(), scope.df),
                    recurrenceStartDate: scope.scheduledDateTime,
                    dateTimeFormat: scope.dft,
                    frequency: scope.campaignData.frequency,
                    interval: scope.campaignData.repeatsEvery,
                    repeatsOnDay: scope.campaignData.repeatsOnDay,
                    selectedEntityConfig : {'selectedOffices' : scope.selectedOffices,
                    'selectedProducts' : scope.selectedProducts}
                }

                scope.submissionData.runReportId = scope.campaignData.report.reportId;
                scope.submissionData.paramValue = scope.paramValues;

                resourceFactory.smsCampaignResource.save(scope.submissionData, function(data) {
                    location.path('/viewsmscampaign/' + data.resourceId);
                });

            };

            scope.getSelectedOfficeProduct = function () {
                for (var i = 0; i < scope.selectedOffices.length; i++) {
                    if (scope.selectedOffices[i].id == -1) {
                        scope.selectedOffices = [];
                        break;
                    }
                }
                for (var i = 0; i < scope.selectedProducts.length; i++) {
                    if (scope.selectedProducts[i].id == -1) {
                        scope.selectedProducts = [];
                        break;
                    }
                }
            }

            var setDisableTimeout = function(){
                scope.isButtonDisabled = true;
                setTimeout(function(){
                    scope.isButtonDisabled = false;
                }, 5000);
            }
        }
    });
    mifosX.ng.application.controller('CreateSmsCampaignController', ['$scope', 'WizardHandler', 'ResourceFactory', '$location', 'dateFilter', mifosX.controllers.CreateSmsCampaignController]).run(function ($log) {
        $log.info("CreateSmsCampaignController initialized");
    });
}(mifosX.controllers || {}));
