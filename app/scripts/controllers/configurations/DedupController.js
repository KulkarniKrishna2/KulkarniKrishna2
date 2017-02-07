(function (module) {
    mifosX.controllers = _.extend(module, {
        DedupController: function (scope, resourceFactory, location, route) {
            scope.data = {};
            scope.editPerson = false;
            scope.editEntity = false;
            resourceFactory.dedupResource.get(function (data) {
                scope.data = data;
                if(data[0].legalForm === 1){
                    scope.person = data[0];
                }else{
                    scope.entity = data[0];
                }

                if(data[1].legalForm === 1){
                    scope.person = data[1];
                }else{
                    scope.entity = data[1];
                }
            });

            scope.updatePerson = function () {
                scope.person.locale = scope.optlang.code;
                resourceFactory.dedupResource.update({id:1}, scope.person, function(data){
                    route.reload();
                })
            };

            scope.updateEntity = function () {
                scope.entity.locale = scope.optlang.code;
                resourceFactory.dedupResource.update({id:2}, scope.entity, function(data){
                    route.reload();
                })
            };

        }
    });
    mifosX.ng.application.controller('DedupController', ['$scope', 'ResourceFactory', '$location', '$route', mifosX.controllers.DedupController]).run(function ($log) {
        $log.info("DedupController initialized");
    });
}(mifosX.controllers || {}));
