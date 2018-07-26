(function(module) {
    mifosX.controllers = _.extend(module, {
        CreateSequencePattrenController: function(scope, routeParams, resourceFactory, location, route) {

            scope.patterns = [];
            scope.pattern = {};
            scope.formData = {};
            scope.formData.locale = scope.optlang.code;

            resourceFactory.sequencePatternTemplateResource.get(function(data) {
                    scope.data = data;
                    scope.entityTypeOptions = data.entityTypeOptions;
                    scope.entityTypeOptions.splice(0, 1);
                });

            scope.getPrefixTypeOptions = function(entityType){
                if(entityType.id == 1){
                    scope.prefixTypeOptions = scope.data.sequencePatternPrefixTypeOptions["accountType.client"];
                }
                if(entityType.id == 2){
                    scope.prefixTypeOptions = scope.data.sequencePatternPrefixTypeOptions["accountType.staff"];
                }
                if(entityType.id == 3){
                    scope.prefixTypeOptions = scope.data.sequencePatternPrefixTypeOptions["accountType.office"];
                }
            }

            scope.addPattern = function (pattern) {
                pattern.order = scope.patterns.length + 1;
                if(pattern.entityType != undefined && pattern.fieldName != undefined && pattern.length != undefined && pattern.order != undefined) {
                    var pattern = {"entityType" : pattern.entityType.value, "fieldName" : pattern.fieldName.value, "length": pattern.length, "order": pattern.order};                    
                    scope.patterns.push(pattern);
                }
            }

            scope.deletePattern = function (pattern) {
                var index = scope.patterns.indexOf(pattern);
                scope.patterns.splice(index, 1);
            };

            scope.submit = function() {
                scope.formData.patterns = scope.patterns;
                resourceFactory.sequencePatternResource.save(scope.formData, function(data) {
                    location.path('/sequencepattern');
                });
            };

        }
    });
    mifosX.ng.application.controller('CreateSequencePattrenController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.CreateSequencePattrenController]).run(function($log) {
        $log.info("CreateSequencePattrenController initialized");
    });
}(mifosX.controllers || {}));