(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateCreditBureauLoanProductController: function (scope, routeParams, resourceFactory, location) {
            scope.availableOffices = [];
            scope.selectedOffices = [];
            scope.formData = {};
            scope.formData.isCreditcheckMandatory = true;
            scope.formData.skipCreditcheckInFailure = true;
            scope.formData.isActive = true;
            resourceFactory.loanProductResource.getAllLoanProducts(function (data) {
                scope.products = data;
            });
            resourceFactory.creditBureauResource.get(function (data) {
                scope.creditBureauProducts = data;
            });
            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.availableOffices = data;
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
                if(scope.selectedOffices != null && scope.selectedOffices.length > 0){
                    scope.formData.offices = [];
                    for(var i in scope.selectedOffices){
                        scope.formData.offices.push(scope.selectedOffices[i].id);
                    }
                }
                resourceFactory.creditBureauLoanProductResource.save({productId: scope.formData.loanProductId},this.formData, function (data) {
                    location.path('/viewcreditbureauloanproduct/' + data.resourceId);
                });
            };
        }
    });
    mifosX.ng.application.controller('CreateCreditBureauLoanProductController', ['$scope', '$routeParams', 'ResourceFactory', '$location', mifosX.controllers.CreateCreditBureauLoanProductController]).run(function ($log) {
        $log.info("CreateCreditBureauLoanProductController initialized");
    });
}(mifosX.controllers || {}));