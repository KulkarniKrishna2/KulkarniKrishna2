(function(module) {
    mifosX.controllers = _.extend(module, {
        SequenceEntityAssociationCommonController: function(scope, routeParams, resourceFactory, location, route) {
            scope.formData = {};
            scope.sequenceAssociationsDetails = {};
            scope.sequenceEntityAssociationId = routeParams.id;
            scope.formData.locale = scope.optlang.code;
            scope.selectedSequences = [];
            scope.productIdApplicableFor = [7,10,201];
            scope.staffIdApplicableFor = [6];

            scope.getAllActiveLoanProducts = function(){
                resourceFactory.loanProductResource.getAllLoanProducts(function(data) {
                    scope.products = data;
                });
            };

            scope.populateDetails = function() {
                scope.labelStatus = "activate";
                resourceFactory.customSequenceAssociationResource.get({
                    sequenceEntityAssociationId: scope.sequenceEntityAssociationId,'command' :'template'
                }, function(data) {
                    scope.entityTypes = [data.entityType];
                    scope.sequenceAssociationsDetails = data;
                    if(data.entityType){
                        scope.entityType = data.entityType.id;
                        scope.entityNames = [data.entityName];
                        scope.entityName = data.entityName;
                        if(data.product){
                            if(scope.productIdApplicableFor.indexOf(scope.entityType)>-1){
                                scope.getAllActiveLoanProducts();
                            }
                            scope.productId = data.product.id;
                        }
                        
                    }
                    scope.applicableColumns = [data.sequenceForField];
                    if(data.sequenceForField){
                        scope.applicableColumn = data.sequenceForField.id;
                    }
                    scope.availableSequences = scope.sequenceAssociationsDetails.availableSequences;
                    scope.selectedSequences = scope.sequenceAssociationsDetails.selectedSequences;
                    
                });
            };

            scope.populateDetails();

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