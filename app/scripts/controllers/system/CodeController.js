(function (module) {
    mifosX.controllers = _.extend(module, {
        CodeController: function (scope, resourceFactory, location) {
            scope.codes = [];
            scope.requestoffset=0;
            scope.limit = 15;
            scope.inparams = {};
            
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
                scope.inparams.offset = scope.requestoffset;
                scope.inparams.limit = scope.limit;
                resourceFactory.codeResource.getAll(scope.inparams, function(data){
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
            
            scope.searchData = function(){
                scope.requestoffset=0;
                scope.limit = 15;
                scope.init();
            }

            scope.newSearch = function(){
                if(!_.isUndefined(scope.searchText) && scope.searchText !== ""){
                    scope.filterText = undefined;
                    var codeName = scope.searchText.replace(/(^"|"$)/g, '');
                    scope.inparams.codeName = codeName;
                }else{
                    delete scope.inparams.codeName;
                }
                scope.searchData();
            }
        }
    });
    mifosX.ng.application.controller('CodeController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.CodeController]).run(function ($log) {
        $log.info("CodeController initialized");
    });
}(mifosX.controllers || {}));