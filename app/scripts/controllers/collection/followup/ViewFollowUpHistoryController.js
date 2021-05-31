 (function (module) {
    mifosX.controllers = _.extend(module, {
        ViewFollowUpHistoryController: function (scope, resourceFactory, location, dateFilter, http, routeParams) {
            scope.urlParam = location.search();
            scope.officeId = scope.urlParam.officeId;
            scope.staffId = scope.urlParam.staffId;
            scope.entityTypeId = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            scope.followUpDatas =[];
            scope.reportData = [];
            scope.formData = {};
            scope.formData.locale = scope.optlang.code;
            scope.formData.dateFormat = scope.df;
            resourceFactory.followUpResource.getAll({officeId:scope.officeId,staffId: scope.staffId,entityTypeId:scope.entityTypeId,entityId:scope.entityId}, function (data) {
                scope.followUpDatas = data;
            });

             resourceFactory.runReportsResource.getReport({reportSource: 'LoanApplication_wise_collection',R_officeId: scope.officeId,R_staffId:scope.staffId,R_entityId:scope.entityId}, function (collection) {
                        scope.reportData = collection.data;
                        for(var i in scope.reportData){
                           scope.reportData[i].row[9] = parseFloat(scope.reportData[i].row[9]).toFixed(2);
                           scope.reportData[i].row[10] = parseFloat(scope.reportData[i].row[10]).toFixed(2);
                           scope.reportData[i].row[12] = new Date(scope.reportData[i].row[12]);
                        }
                        scope.report = scope.reportData[0];
            });

             scope.getTruncatedText = function(text){
                if(text  != undefined && text.length>50){
                    return text.substring(0,50)+"...";
                }
                return text;
             }

             scope.routeTo = function(id){
                 location.path('/collectionfollowup/'+scope.entityTypeId+'/'+scope.entityId+'/'+id).search({officeId:scope.officeId,staffId:scope.staffId});
            };
            scope.routeToAddFollowUp = function(){
                location.path('/collectionfollowup/'+scope.entityTypeId+'/'+scope.entityId +'/add').search({officeId:scope.officeId,staffId:scope.staffId});
            };
               
        }
    });
    mifosX.ng.application.controller('ViewFollowUpHistoryController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', mifosX.controllers.ViewFollowUpHistoryController]).run(function ($log) {
        $log.info("ViewFollowUpHistoryController initialized");
    });
}(mifosX.controllers || {}));