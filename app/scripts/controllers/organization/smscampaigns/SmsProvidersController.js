(function (module) {
    mifosX.controllers = _.extend(module, {
        SmsProvidersController: function (scope, routeParams, location, resourceFactory, $modal, dateFilter, route, paginatorService) {
            scope.providers = [];
            scope.defaultProvider = {};
            scope.providerId = {};
            scope.formData = {};
            scope.getTemplate = function(){
                resourceFactory.smsProviderTemplateResource.get({}, function (data) {
                    scope.providers = data.smsProviderOptions;
                    if(data.defaultProviderId){
                        scope.providerId = data.defaultProviderId;
                        scope.setDefaultProvider(data.defaultProviderId);
                    }
                });
            }           
            scope.getTemplate();
            scope.setDefaultProvider = function(providerId){
                scope.defaultProvider = {};
                for(i in scope.providers){
                    if(scope.providers[i].id==providerId){
                        scope.defaultProvider = scope.providers[i];
                        return ;
                    }
                }
            }
            scope.setChoice = function(providerId){
                scope.providerId = providerId;
            };
            scope.updateProvider = function(){
                scope.formData = {};
                scope.formData.providerId = scope.providerId;
                resourceFactory.smsProviderResource.update({},this.formData, function (data) {
                    scope.getTemplate();
                });
            }
        }
    });
    mifosX.ng.application.controller('SmsProvidersController', ['$scope', '$routeParams', '$location', 'ResourceFactory', '$modal', 'dateFilter', '$route', 'PaginatorService', mifosX.controllers.SmsProvidersController]).run(function ($log) {
        $log.info("SmsProvidersController initialized");
    });
}(mifosX.controllers || {}));
