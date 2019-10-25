(function (module) {
    mifosX.controllers = _.extend(module, {
        ClientController: function (scope, resourceFactory, location, paginatorUsingOffsetService) {
            scope.isSearchData = true;
            scope.clientsPerPage = 15;
            scope.isWorkflowEnabled = scope.isSystemGlobalConfigurationEnabled('work-flow');
            scope.isHideCreateEntity = false;
            scope.searchConditions = {};
            scope.serachParameter = ['firstName','middleName','lastName','mobileNo','officeId','referenceNumber','isFilter','documentTypeId','documentNumber'];
            if(scope.response && scope.response.uiDisplayConfigurations){
                if(scope.response.uiDisplayConfigurations.viewClient && 
                    scope.response.uiDisplayConfigurations.viewClient.isHiddenField){
                        if(scope.response.uiDisplayConfigurations.viewClient.isHiddenField.createClient){
                            scope.hideCreateClient = scope.response.uiDisplayConfigurations.viewClient.isHiddenField.createClient;
                        }
                        if(scope.response.uiDisplayConfigurations.viewClient.isHiddenField.referenceNo){
                            scope.refNo = scope.response.uiDisplayConfigurations.viewClient.isHiddenField.referenceNo;
                        }
                }
                if(scope.response.uiDisplayConfigurations.createClient.defaultMobileNumber){
                    scope.defaultMobileNumber = scope.response.uiDisplayConfigurations.createClient.defaultMobileNumber;                        
                }
            }
            if(scope.isWorkflowEnabled && scope.hideCreateClient){
                scope.isHideCreateEntity = true;
            }
            
            scope.isFilter = false;
            /**
             * Get the record based on the offset limit
             */
            var fetchFunction = function (offset, limit, callback) {
                //REMOVE unused parameter
                for(var i in scope.serachParameter){     
                    var param =  scope.serachParameter[i];
                    if(scope.searchConditions[param]==undefined || scope.searchConditions[param]==null || scope.searchConditions[param]==''){
                        delete scope.searchConditions[param];
                    }
                }
                resourceFactory.clientsSearchResource.getAllClients({                    
                    searchConditions: scope.searchConditions,
                    offset: offset,
                    limit: limit,
                    isFilter: scope.searchConditions.isFilter
                }, callback);
            };
            
            scope.searchData = function () {
                scope.clients = paginatorUsingOffsetService.paginate(fetchFunction, scope.clientsPerPage);
                scope.isSearchData = true;
            };
            scope.searchData();

            scope.back = function () {
                scope.isSearchData = true;
                scope.searchConditions = {};
            };

            scope.newSearch = function () {
                scope.isSearchData = false;
                if(_.isUndefined(scope.officeOptions)){
                    resourceFactory.clientSearchTemplateResource.get(function (data) {
                        scope.officeOptions = data.officeOptions;
                        scope.documentTypeOptions = data.documentTypeOptions;
                    });
                }
            };

            scope.resetSearchData = function () {
                scope.isSearchData = false;
                scope.searchConditions = {};
            };


            scope.displayNameInReverseOrder = false;
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.viewClient.isHiddenField.displayNameInReverseOrder) {
                scope.displayNameInReverseOrder = scope.response.uiDisplayConfigurations.viewClient.isHiddenField.displayNameInReverseOrder;
            }

            scope.routeTo = function (id) {
                location.path('/viewclient/' + id);
            };

            scope.reverseDisplayName = function (client) {
                if (client.lastname != undefined) {
                    client.displayNameInReverseOrder = client.lastname.concat(" ");
                }
                if (client.middlename != undefined) {
                    client.displayNameInReverseOrder = client.displayNameInReverseOrder.concat(client.middlename).concat(" ");
                }
                if (client.firstname != undefined) {
                    client.displayNameInReverseOrder = client.displayNameInReverseOrder.concat(client.firstname);
                }
                if (client.lastname == undefined && client.middlename == undefined && client.firstname == undefined) {
                    client.displayNameInReverseOrder = client.displayName;
                }
            }
        }
    });

    mifosX.ng.application.controller('ClientController', ['$scope', 'ResourceFactory', '$location', 'PaginatorUsingOffsetService', mifosX.controllers.ClientController]).run(function ($log) {
        $log.info("ClientController initialized");
    });
}(mifosX.controllers || {}));