(function(module) {
    mifosX.controllers = _.extend(module, {
        CreateSequenceEntityAssociationController: function(scope, routeParams, resourceFactory, location, route) {

            scope.formData = {};
            scope.formData.locale = scope.optlang.code;
            scope.selectedSequences = [];

            resourceFactory.sequenceAssociationTemplateResource.get(function(data) {
                scope.entityTypes = data.applicableOnEntities;
                scope.entityType = scope.entityTypes[scope.entityTypes.findIndex(x => x.value === 'Loan Products')];
                scope.sequenceDetails = data.sequenceDetails;
            });

            resourceFactory.loanProductResource.getAllLoanProducts(function(data) {
                scope.products = data;
            });

            resourceFactory.loanApplicationSequenceTemplateResource.get(function(data) {
                scope.loanSequenceTemplateData = data;
                scope.loanEntityTypes = scope.loanSequenceTemplateData.loanEntityTypes;
                scope.subEntityType = scope.loanEntityTypes[scope.loanEntityTypes.findIndex(x => x.value === 'Loan Applications')];
                scope.applicableColumns = scope.loanSequenceTemplateData.applicableColumns;
                scope.applicableColumn = scope.applicableColumns[0];

            });

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
                scope.formData.entityType = scope.entityType.id;
                scope.formData.subEntityType = scope.subEntityType.id;
                scope.formData.applicableColumn = scope.applicableColumn.id;
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