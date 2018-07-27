(function(module) {
    mifosX.controllers = _.extend(module, {
        CreateSequenceEntityAssociationController: function(scope, routeParams, resourceFactory, location, route) {

            scope.formData = {};
            scope.formData.locale = scope.optlang.code;
            scope.selectedSequences = [];
            scope.productIdApplicableFor = [7,10,201];
            scope.staffIdApplicableFor = [6]

            resourceFactory.sequenceAssociationTemplateResource.get(function(data) {
                scope.entityTypes = data.applicableOnEntities;
                scope.applicableColumns = data.applicableColumns;
                scope.formData.applicableColumn = data.applicableColumns[0].id;
                scope.sequenceDetails = data.sequenceDetails;
            });

            scope.getData = function(entityType){
                if(scope.productIdApplicableFor.indexOf(scope.formData.entityType)>-1){
                    resourceFactory.loanProductResource.getAllLoanProducts(function(data) {
                        scope.products = data;
                    });
                } else if(scope.staffIdApplicableFor.indexOf(scope.formData.entityType)>-1){
                    resourceFactory.employeeResource.getAllEmployees(function(data) {
                        scope.employees = data.pageItems;
                    });
                }
            }            

            scope.addSequence = function() {
                for (var i in this.selectedSequence) {
                    for (var j in scope.sequenceDetails) {
                        if (scope.sequenceDetails[j].id == this.selectedSequence[i]) {
                            var temp = {};
                            temp.id = this.selectedSequence[i];
                            temp.name = scope.sequenceDetails[j].name;
                            scope.selectedSequences.push(temp);
                            scope.sequenceDetails.splice(j, 1);
                        }
                    }
                }

                for (var i in this.selectedSequence) {
                    for (var j in scope.selectedSequences) {
                        if (scope.selectedSequences[j].id == this.selectedSequence[i]) {
                            scope.selectedSequence.splice(i, 1);
                        }
                    }
                }
            };

            scope.removeSequence = function(index) {
                var temp = scope.selectedSequences[index];
                scope.sequenceDetails.push(temp);
                scope.selectedSequences.splice(index, 1);
            };

            scope.submit = function() {
                scope.formData.selectedSequences = scope.selectedSequences;
                for (var i = 0; i < scope.formData.selectedSequences.length;) {
                    delete scope.formData.selectedSequences[i].name;
                    scope.formData.selectedSequences[i].order = ++i;
                }
                resourceFactory.customSequenceAssociationResource.save(this.formData, function(data) {
                    location.path('/sequenceassociations/' + data.resourceId);
                });
            };

            scope.cancel = function() {
                location.path('/sequenceassociations');
            };

        }
    });
    mifosX.ng.application.controller('CreateSequenceEntityAssociationController', ['$scope', '$routeParams', 'ResourceFactory', '$location','$route', mifosX.controllers.CreateSequenceEntityAssociationController]).run(function($log) {
        $log.info("CreateSequenceEntityAssociationController initialized");
    });
}(mifosX.controllers || {}));