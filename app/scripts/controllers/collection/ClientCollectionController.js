(function (module) {
    mifosX.controllers = _.extend(module, {
        ClientCollectionController: function (scope, resourceFactory,routeParams,route, location) {
            scope.allCategory =[];
            scope.reportData = [];
            scope.allClient =[];//b sud be caps
            scope.officeId = routeParams.branchId;
            scope.staffId =  routeParams.staffId;
            scope.entityTypeId = 7;
            if(scope.staffId == "null"){
                scope.staffId = -1;
            }
            resourceFactory.runReportsResource.getReport({reportSource: 'Client_Wise_Collection',R_officeId: scope.officeId,R_staffId:scope.staffId}, function (collection) {
                scope.reportData = collection.data;
                    for(var i in scope.reportData){
                        scope.reportData[i].row[9] = parseFloat(scope.reportData[i].row[9]).toFixed(2);
                        scope.reportData[i].row[10] = parseFloat(scope.reportData[i].row[10]).toFixed(2);
                    }
            });

            scope.routeToAddFollowUp = function(id){
                location.path('/collectionfollowup/'+scope.entityTypeId+'/'+id+'/add').search({officeId:scope.officeId,staffId:scope.staffId});
            };
            scope.routeToViewFollowUp = function(id){
                location.path('/collectionfollowup/'+scope.entityTypeId+'/'+id).search({officeId:scope.officeId,staffId:scope.staffId});
            };
            scope.routeTo = function(id){
                location.path('/viewloanaccount/'+id);
            };

            scope.routeToAddTask = function(officeId,clientId,loanId){
                location.path('/taskcreate').search({officeId:officeId,clientId:clientId,loanId:loanId});
            };

        }
    });
    mifosX.ng.application.controller('ClientCollectionController', ['$scope', 'ResourceFactory','$routeParams','$route','$location', mifosX.controllers.ClientCollectionController]).run(function ($log) {
        $log.info("ClientCollectionController initialized");
    });
}(mifosX.controllers || {}));