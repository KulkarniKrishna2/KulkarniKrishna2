(function(module) {
    mifosX.controllers = _.extend(module, {
        SequenceEntityAssociationCommonController: function(scope, routeParams, resourceFactory, location, route) {
            scope.formData = {};
            scope.sequenceAssociationsDetails = {};
            scope.sequenceEntityAssociationId = routeParams.id;
            scope.formData.locale = scope.optlang.code;
            scope.selectedSequences = [];

            function populateDetails() {
                scope.labelStatus = "activate";
                resourceFactory.customSequenceAssociationResource.get({
                    sequenceEntityAssociationId: scope.sequenceEntityAssociationId
                }, function(data) {
                    scope.sequenceAssociationsDetails = data;
                    scope.availableSequences = scope.sequenceAssociationsDetails.availableSequences;
                    scope.entityType = scope.sequenceAssociationsDetails.entityType;
                    scope.selectedSequences = scope.sequenceAssociationsDetails.selectedSequences;

                    if (scope.sequenceAssociationsDetails.status.toUpperCase() === 'ACTIVE') {
                        scope.labelStatus = "inactivate";
                    }
                    if (scope.sequenceAssociationsDetails.entityType === 'LOAN_PRODUCTS') {
                        resourceFactory.loanProductResource.getAllLoanProducts(function(data) {
                            scope.products = data;
                            scope.productName = scope.products[scope.products.findIndex(x => x.id == scope.sequenceAssociationsDetails.entityId)].name;
                            scope.entityId = scope.productName;
                        });

                        resourceFactory.loanApplicationSequenceTemplateResource.get(function(data) {
                            scope.loanSequenceTemplateData = data;
                            scope.loanEntityTypes = scope.loanSequenceTemplateData.loanEntityTypes;
                            scope.subEntityType = scope.loanEntityTypes[scope.loanEntityTypes.findIndex(x => x.id === scope.sequenceAssociationsDetails.subEntityType)].value;
                            scope.applicableColumns = scope.loanSequenceTemplateData.applicableColumns;
                            scope.applicableColumn = scope.applicableColumns[scope.applicableColumns.findIndex(x => x.id == scope.sequenceAssociationsDetails.sequenceForFieldId)].value;
                        });

                    }
                });
            };

            populateDetails();

            scope.addSequence = function() {
                for (var i in this.selectedSequence) {
                    for (var j in scope.availableSequences) {
                        if (scope.availableSequences[j].id == this.selectedSequence[i]) {
                            var temp = {};
                            temp.id = this.selectedSequence[i];
                            temp.name = scope.availableSequences[j].name;
                            scope.selectedSequences.push(temp);
                            scope.availableSequences.splice(j, 1);
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
                scope.availableSequences.push(temp);
                scope.selectedSequences.splice(index, 1);
            };

            scope.changeStatus = function() {
                if (scope.labelStatus === 'inactivate') {
                    scope.formData.status = scope.sequenceAssociationsDetails.availableStatus[scope.sequenceAssociationsDetails.availableStatus.findIndex(x => x.value.toLowerCase() == 'inactive')].id;
                } else {
                    scope.formData.status = scope.sequenceAssociationsDetails.availableStatus[scope.sequenceAssociationsDetails.availableStatus.findIndex(x => x.value.toLowerCase() == 'active')].id;
                }
                scope.formData.locale = scope.optlang.code;

                resourceFactory.customSequenceAssociationResource.updateStatus({
                        sequenceEntityAssociationId: scope.sequenceEntityAssociationId
                    }, scope.formData,
                    function(data) {
                        populateDetails();
                    }
                );
            };

            scope.removeSequence = function(index) {
                var temp = scope.selectedSequences[index];
                scope.availableSequences.push(temp);
                scope.selectedSequences.splice(index, 1);
            };

            scope.edit = function() {
                location.path('/editSequenceEntityAssociation/' + scope.sequenceEntityAssociationId)
            };

            scope.submit = function() {
                scope.formData.selectedSequences = scope.selectedSequences;
                for (var i = 0; i < scope.formData.selectedSequences.length;) {
                    delete scope.formData.selectedSequences[i].name;
                    if (scope.formData.selectedSequences[i].sequenceDetailsId) {
                        scope.formData.selectedSequences[i].id = scope.formData.selectedSequences[i].sequenceDetailsId;
                        delete scope.formData.selectedSequences[i].sequenceDetailsId;
                    }
                    scope.formData.selectedSequences[i].order = ++i;

                }
                resourceFactory.customSequenceAssociationResource.update({
                    sequenceEntityAssociationId: scope.sequenceEntityAssociationId
                }, this.formData, function(data) {
                    location.path('/sequenceassociations/' + scope.sequenceEntityAssociationId);
                });
            };

            scope.cancel = function() {
                location.path('/sequenceassociations/' + scope.sequenceEntityAssociationId)
            };

        }
    });
    mifosX.ng.application.controller('SequenceEntityAssociationCommonController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.SequenceEntityAssociationCommonController]).run(function($log) {
        $log.info("SequenceEntityAssociationCommonController initialized");
    });
}(mifosX.controllers || {}));