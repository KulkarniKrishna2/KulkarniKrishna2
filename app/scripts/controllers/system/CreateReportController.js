(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateReportController: function (scope, resourceFactory, location) {
            scope.formData = {};
            scope.reportParameters = [];
            scope.flag = false;
            scope.available = [];
            scope.selected = [];
            scope.selectedCategories = [] ;
            scope.availablCategories = [];

            resourceFactory.codeValueByCodeNameResources.get({codeName: "Report Classification"}, function (codeValueData) {
                scope.availablCategories = codeValueData;
            });

            resourceFactory.reportsResource.getReportDetails({resourceType: 'template'}, function (data) {
                scope.reportdetail = data;
                scope.formData.reportType = data.allowedReportTypes[0];
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
                scope.flag = true;
                for (var i in scope.reportdetail.allowedParameters) {
                    if (scope.reportdetail.allowedParameters[i].id == allowedParameterId) {
                        scope.reportParameters.push({parameterId: allowedParameterId,
                            id: "",
                            allowedParameterName: scope.reportdetail.allowedParameters[i].parameterName
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
                scope.reportParameters.splice(index, 1);
            }

            scope.submit = function () {
                scope.formData.reportClassifications = [] ;
                for (var i in scope.selectedCategories) {
                    scope.formData.reportClassifications.push(scope.selectedCategories[i].id) ;
                }
                scope.temp = deepCopy(scope.reportParameters);
                for (var i in scope.temp) {
                    delete scope.temp[i].allowedParameterName;
                }
                this.formData.reportParameters = scope.temp;
                resourceFactory.reportsResource.save(this.formData, function (data) {
                    location.path('/system/viewreport/' + data.resourceId);
                });
            };
        }
    });
    mifosX.ng.application.controller('CreateReportController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.CreateReportController]).run(function ($log) {
        $log.info("CreateReportController initialized");
    });
}(mifosX.controllers || {}));
