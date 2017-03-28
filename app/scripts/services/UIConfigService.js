(function (module) {
    mifosX.services = _.extend(module, {

        UIConfigService: function ($q,$http) {

            this.init  = function(scope, tenantIdentifier) {
                $http.get('scripts/config/'+tenantIdentifier+'_UiConfig.json').success(function(data) {
                          checkAndAssignData(data);
                }).error(function(data) {
                    assignDefaultData();
                }).catch(function(e){
                   assignDefaultData();
                });

                assignDefaultData = function (){
                         $http.get('scripts/config/default_UiConfig.json').success(function(data){
                            checkAndAssignData(data);
                               }).error(function(data) {
                                 console.log("Configuration file not found");
                               }).catch(function(e){
                                console.log("Configuration file not found");
                               });
                      };
                      checkAndAssignData = function(data){
                        if(data != 'undefined' && data != null && data != '' ){
                        if(data.enableUIDisplayConfiguration != null && data.enableUIDisplayConfiguration == true){
                         scope.response = data;
                            scope.responseDefaultGisData = data;
                        }
                    }
                      };
      };
        }



    });

    mifosX.ng.services.service('UIConfigService', ['$q','$http',mifosX.services.UIConfigService]).run(function ($log) {
        $log.info("UIConfigService initialized");

    });

}(mifosX.services || {}));
