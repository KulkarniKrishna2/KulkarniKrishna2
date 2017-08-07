(function (module) {
    mifosX.controllers = _.extend(module, {
        EditCreditbureauLoanProductController: function (scope, routeParams, resourceFactory, location) {
                scope.formData = {};
                resourceFactory.creditBureauResource.get(function (data) {
                    scope.creditBureauProducts = data;
                    resourceFactory.loanProductResource.getCreditbureauLoanProducts({loanProductId: routeParams.loanProductId,associations: 'creditBureaus'},function (data) {
                        scope.creditBureauId = data.id;
                        scope.formData.creditBureauProductId = data.creditBureauData.creditBureauId;
                        scope.formData.loanProductId = data.loanProductId;
                        scope.formData.stalePeriod = data.stalePeriod;
                        scope.formData.isCreditcheckMandatory = data.isCreditcheckMandatory;
                        scope.formData.skipCreditcheckInFailure = data.skipCreditcheckInFailure;
                        scope.formData.isActive = data.isActive;
                        scope.availableOffices = data.availableOfficeList;
                        scope.selectedOffices = data.selectedOfficeList;
                        for(var i in scope.selectedOffices){
                            if(scope.selectedOffices[i].id == 0){
                                scope.selectedOffices.splice(i,1);
                            }
                        }
                        scope.loanProductName = data.loanProductName;
                    });
                });

                scope.addOffice = function () {
                    for (var i in this.office) {
                        for (var j in scope.availableOffices) {
                            if (scope.availableOffices[j].id == this.office[i]) {
                                var temp = {};
                                temp.id = this.office[i];
                                temp.name = scope.availableOffices[j].name;
                                scope.selectedOffices.push(temp);
                                scope.availableOffices.splice(j, 1);
                            }
                        }
                    }
    
                    for (var i in this.office) {
                        for (var j in scope.selectedOffices) {
                            if (scope.selectedOffices[j].id == this.office[i]) {
                                scope.office.splice(i, 1);
                            }
                        }
                    }
                };

                scope.removeOffice = function () {
                    for (var i in this.selected) {
                        for (var j in scope.selectedOffices) {
                            if (scope.selectedOffices[j].id == this.selected[i]) {
                                var temp = {};
                                temp.id = this.selected[i];
                                temp.name = scope.selectedOffices[j].name;
                                scope.availableOffices.push(temp);
                                scope.selectedOffices.splice(j, 1);
                            }
                        }
                    }
               
                    for (var i in this.selected) {
                        for (var j in scope.availableOffices) {
                            if (scope.availableOffices[j].id == this.selected[i]) {
                                scope.selected.splice(i, 1);
                            }
                        }
                    }
                };

            scope.cancel = function () {
                location.path('/creditbureauloanproducts');
            };

            scope.submit = function () {
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;
                scope.formData.offices = [];
                for(var i in scope.selectedOffices){
                   if(scope.selectedOffices[i].id == 0){
                        scope.selectedOffices.splice(i,1);
                   }
                }
                for(var i in scope.selectedOffices){
                    scope.formData.offices.push(scope.selectedOffices[i].id);
                }
                resourceFactory.creditBureauLoanProductResource.update({productId: scope.formData.loanProductId, creditBureauId:scope.creditBureauId},this.formData, function (data) {
                    location.path('/viewcreditbureauloanproduct/' + data.resourceId);
                });
            };
        }
    });
    mifosX.ng.application.controller('EditCreditbureauLoanProductController', ['$scope', '$routeParams', 'ResourceFactory', '$location', mifosX.controllers.EditCreditbureauLoanProductController]).run(function ($log) {
        $log.info("EditCreditbureauLoanProductController initialized");
    });
}(mifosX.controllers || {}));