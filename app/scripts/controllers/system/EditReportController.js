(function (module) {
    mifosX.controllers = _.extend(module, {
        EditReportController: function (scope, resourceFactory, location, routeParams) {
            scope.formData = {};
            scope.available = [];
            scope.selected = [];
            scope.selectedCategories = [] ;
            scope.availablCategories = [];
            scope.isReplaceExistingPentaho = false;

            var existingreportdetail = {};
            resourceFactory.reportsResource.getReportDetails({id: routeParams.id, template: 'true'}, function (data) {
                angular.copy(data, existingreportdetail);
                scope.reportdetail = data;
                scope.reportdetail.reportParameters = data.reportParameters || [];
                scope.formData.useReport = data.useReport;
                scope.formData.trackUsage = data.trackUsage;
                scope.formData.reportType = data.reportType;
                scope.disableFields = false;
                if(data.embeddedReportType){
                    scope.reportdetail.embeddedReportType = data.embeddedReportType;
                    scope.reportdetail.isEmbeddedReport = true;
                }

                if(scope.reportdetail.coreReport == true){
                    scope.disableFields = true;
                }
                scope.selectedCategories=data.selectedCategories;
                scope.availablCategories = data.availableCategories ;
            });

            scope.addCategory = function () {
                for (var i in this.available) {
                    for (var j in scope.availablCategories) {
                        if (scope.availablCategories[j].id == this.available[i]) {
                            var temp = {};
                            temp.id = this.available[i];
                            temp.name = scope.availablCategories[j].name;
                            scope.selectedCategories.push(temp);
                            scope.availablCategories.splice(j, 1);
                        }
                    }
                }
                for (var i in this.available) {
                    for (var j in scope.selectedCategories) {
                        if (scope.selectedCategories[j].id == this.available[i]) {
                            scope.available.splice(i, 1);
                        }
                    }
                }
            };
            scope.removeCategory = function () {
                for (var i in this.selected) {
                    for (var j in scope.selectedCategories) {
                        if (scope.selectedCategories[j].id == this.selected[i]) {
                            var temp = {};
                            temp.id = this.selected[i];
                            temp.name = scope.selectedCategories[j].name;
                            scope.availablCategories.push(temp);
                            scope.selectedCategories.splice(j, 1);
                        }
                    }
                }
                for (var i in this.selected) {
                    for (var j in scope.availablCategories) {
                        if (scope.availablCategories[j].id == this.selected[i]) {
                            scope.selected.splice(i, 1);
                        }
                    }
                }
            };
            scope.parameterSelected = function (allowedParameterId) {
                for (var i in scope.reportdetail.allowedParameters) {
                    if (scope.reportdetail.allowedParameters[i].id == allowedParameterId) {
                        scope.reportdetail.reportParameters.push({parameterId: allowedParameterId,
                            id: "",
                            parameterName: scope.reportdetail.allowedParameters[i].parameterName
                        });
                    }
                }
                scope.allowedParameterId = '';
            }



            function deepCopy(obj) {
                if (Object.prototype.toString.call(obj) === '[object Array]') {
                    var out = [], i = 0, len = obj.length;
                    for (; i < len; i++) {
                        out[i] = arguments.callee(obj[i]);
                    }
                    return out;
                }
                if (typeof obj === 'object') {
                    var out = {}, i;
                    for (i in obj) {
                        out[i] = arguments.callee(obj[i]);
                    }
                    return out;
                }
                return obj;
            }

            scope.deleteParameter = function (index) {
                scope.reportdetail.reportParameters.splice(index, 1);
            }

            scope.onFileSelect = function ($files) {
                scope.errorDetails = [];
                var isValidFile = false;
                var isValidFileName = false;
                scope.file = $files[0];
                if(scope.file.name && scope.file.name != ""){
                    var fileName = scope.file.name;
                    var ext = fileName.substr(fileName.lastIndexOf('.') + 1);
                    if("prpt" === ext.toLowerCase()){
                        isValidFile = true;
                    }
                    fileName = fileName.substr(0, fileName.lastIndexOf('.'));
                    if(fileName === scope.reportdetail.reportName){
                        isValidFileName = true;
                    }
                }
                if (!isValidFile) {
                    var errorObj = new Object();
                    errorObj.args = {
                        params: []
                    };
                    errorObj.args.params.push({ value: 'error.msg.invalid.prpt.file.extension' });
                    scope.errorDetails.push(errorObj);
                    scope.file = undefined;
                }else if (!isValidFileName) {
                    var errorObj = new Object();
                    errorObj.args = {
                        params: []
                    };
                    errorObj.args.params.push({ value: 'error.msg.invalid.prpt.file.name' });
                    scope.errorDetails.push(errorObj);
                    scope.file = undefined;
                }
            };

            scope.submit = function () {
                scope.errorDetails = [];
                scope.reportClassifications = [] ;
                for (var i in scope.selectedCategories) {
                    scope.reportClassifications.push(scope.selectedCategories[i].id) ;
                }
                if (scope.reportdetail.coreReport === true) {
                    this.formData.reportParameters = scope.temp;
                    this.formData.useReport = scope.reportdetail.useReport;
                    this.formData.trackUsage = scope.reportdetail.trackUsage;
                    this.formData.reportClassifications = scope.reportClassifications ;
                } else {
                    scope.temp = deepCopy(scope.reportdetail.reportParameters);
                    scope.reportdetail.reportParameters = scope.temp;

                    for (var i in scope.temp) {
                        delete scope.temp[i].parameterName;
                    }

                    this.formData = {
                        reportName: scope.reportdetail.reportName,
                        reportType: scope.reportdetail.reportType,
                        reportSubType: scope.reportdetail.reportSubType,
                        reportCategory: scope.reportdetail.reportCategory,
                        useReport: scope.reportdetail.useReport,
                        description: scope.reportdetail.description,
                        reportSql: scope.reportdetail.reportSql,
                        reportParameters: scope.reportdetail.reportParameters,
                        trackUsage: scope.reportdetail.trackUsage,
                        reportClassifications:scope.reportClassifications,
                        embeddedReportType:scope.reportdetail.embeddedReportType
                    }
                }
                if(!scope.reportdetail.isEmbeddedReport){
                    delete this.formData.embeddedReportType;
                }
                this.formData.locale = "en";

                if(_.isUndefined(scope.file) && this.formData.reportType==='Pentaho' && existingreportdetail.reportName !== this.formData.reportName){
                    scope.errorDetails = [];
                    var errorObj = new Object();
                    errorObj.args = {
                        params: []
                    };
                    errorObj.args.params.push({ value: 'error.msg.invalid.prpt.file.not.found' });
                    scope.errorDetails.push(errorObj);
                    return;
                }
                if(!_.isUndefined(scope.file) && this.formData.reportType==='Pentaho'){
                    if(scope.file.name && scope.file.name != ""){
                        var fileName = scope.file.name.substr(0, scope.file.name.lastIndexOf('.'));
                        if(fileName !== this.formData.reportName){
                            scope.errorDetails = [];
                            var errorObj = new Object();
                            errorObj.args = {
                                params: []
                            };
                            errorObj.args.params.push({ value: 'error.msg.invalid.prpt.file.name' });
                            scope.errorDetails.push(errorObj);
                            return;
                        }
                    }
                }

                var formData = new FormData();
                formData.append('formDataJson', JSON.stringify(this.formData));
                if(!_.isUndefined(scope.file) && this.formData.reportType==='Pentaho'){
                    formData.append('files', scope.file); 
                }

                resourceFactory.reportsResource.update({id: routeParams.id}, formData, function (data) {
                    location.path('/system/viewreport/' + data.resourceId);
                });
            };
        }
    });
    mifosX.ng.application.controller('EditReportController', ['$scope', 'ResourceFactory', '$location', '$routeParams', mifosX.controllers.EditReportController]).run(function ($log) {
        $log.info("EditReportController initialized");
    });
}(mifosX.controllers || {}));
