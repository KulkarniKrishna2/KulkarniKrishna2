(function (module) {
    mifosX.controllers = _.extend(module, {
        CodeController: function (scope, resourceFactory, location) {
            scope.codes = [];
            scope.requestoffset=0;
            scope.limit = 15;
            
            scope.routeTo = function (id) {
                location.path('/viewcode/' + id);
            }

            if (!scope.searchCriteria.codes) {
                scope.searchCriteria.codes = null;
                scope.saveSC();
            }
            scope.filterText = scope.searchCriteria.codes;

            scope.onFilter = function () {
                scope.searchCriteria.codes = scope.filterText;
                scope.saveSC();
            };

            scope.init = function(){
                resourceFactory.codeResource.getAll({
                    offset: scope.requestoffset,
                    limit: scope.limit,
                }, function(data){
                    scope.codes = data;
                    
                });
            }
            scope.init();

            scope.previousCodesRequest= function(){
                if(scope.requestoffset != 0){
                    scope.requestoffset = scope.requestoffset - scope.limit;
                    if(scope.requestoffset <= 0){
                        scope.requestoffset = 0;
                    }
                    scope.init();
                }
            } 

            scope.nextCodesRequest= function(){
                if(scope.codes.length == scope.limit){
                    scope.requestoffset = scope.requestoffset + scope.limit;
                    scope.init();
                }
            } 
        }
    });
    mifosX.ng.application.controller('CodeController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.CodeController]).run(function ($log) {
        $log.info("CodeController initialized");
    });
}(mifosX.controllers || {}));