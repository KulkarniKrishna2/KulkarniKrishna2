(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewAuditReportController: function (scope, resourceFactory, routeParams) {
            scope.getData = function(){
                resourceFactory.reportAuditResource.get({id: routeParams.id},function(data){
                    scope.reportAudit = data;
                    scope.getParameters(data.reportParameters);
                });
            };
            scope.getData();
            scope.getParameters = function(data){
                data = data.replace(/{|}|$| /g, "");
                var parameters = data.split(',');
                scope.params = [];
                for(var i=0;i<parameters.length;i++){
                    var parameter = parameters[i].split('=');
                    scope.params[i] = {};
                    scope.params[i].parameter = parameter[0];
                    scope.params[i].value = parameter[1];
                }
            }
        }
    });
    mifosX.ng.application.controller('ViewAuditReportController', ['$scope', 'ResourceFactory', '$routeParams', mifosX.controllers.ViewAuditReportController]).run(function ($log) {
        $log.info("ViewAuditReportController initialized");
    });
}(mifosX.controllers || {}));