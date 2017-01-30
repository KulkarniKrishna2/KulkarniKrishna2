(function (module) {
    mifosX.controllers = _.extend(module, {
        ManageFundsController: function (scope, location, resourceFactory) {

            scope.funds = [];
            scope.getData = function(){
                resourceFactory.fundsResource.getAllFunds(function (data) {
                    scope.funds = data;
                });
            };
            scope.getData();
            scope.changeStatus = function (fundId,isActive) {                
              if(isActive==true){
                  resourceFactory.fundsResource.deactivate({'fundId': fundId}, {},function (data) {
                     scope.getData();
                  });

              }else{
                  resourceFactory.fundsResource.activate({'fundId': fundId},{}, function (data) {
                     scope.getData();
                  });
              }
            };

            scope.routeToFund = function(id){
                var uri = '/viewfund/'+id;
                location.path(uri);
            }

        }
    });
    mifosX.ng.application.controller('ManageFundsController', ['$scope', '$location', 'ResourceFactory', mifosX.controllers.ManageFundsController]).run(function ($log) {
        $log.info("ManageFundsController initialized");
    });
}(mifosX.controllers || {}));
