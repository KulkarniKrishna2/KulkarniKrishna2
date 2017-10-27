(function (module) {
    mifosX.controllers = _.extend(module, {
        ClientController: function (scope, resourceFactory, location) {
            scope.clients = [];
            scope.actualClients = [];
            scope.searchText = "";
            scope.searchResults = [];
            scope.displayNameInReverseOrder = false;
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.viewClient.isHiddenField.displayNameInReverseOrder) {
                scope.displayNameInReverseOrder = scope.response.uiDisplayConfigurations.viewClient.isHiddenField.displayNameInReverseOrder;
            }
            scope.routeTo = function (id) {
                location.path('/viewclient/' + id);
            };

            scope.clientsPerPage = 15;

            scope.getResultsPage = function (pageNumber) {
                if(scope.searchText){
                    var startPosition = (pageNumber - 1) * scope.clientsPerPage;
                    scope.clients = scope.actualClients.slice(startPosition, startPosition + scope.clientsPerPage);
                    return;
                }
                var items = resourceFactory.clientResource.getAllClients({
                    offset: ((pageNumber - 1) * scope.clientsPerPage),
                    limit: scope.clientsPerPage
                }, function (data) {
                    scope.clients = data.pageItems;
                });
            }
            scope.initPage = function () {

                var items = resourceFactory.clientResource.getAllClients({
                    offset: 0,
                    limit: scope.clientsPerPage
                }, function (data) {
                    scope.totalClients = data.totalFilteredRecords;
                    scope.clients = data.pageItems;
                });
            }
            scope.initPage();

            scope.search = function () {
                scope.actualClients = [];
                scope.searchResults = [];
                scope.filterText = "";
                var searchString = scope.searchText;
                searchString = searchString.replace(/(^"|"$)/g, '');
                var exactMatch=false;
                var n = searchString.localeCompare(scope.searchText);
                if(n!=0)
                {
                    exactMatch=true;
                }

                if(!scope.searchText){
                    scope.initPage();
                } else {
                    searchString = searchString.trim().replace(" ", "%")
                    resourceFactory.globalSearch.search({query: searchString , resource: "clients,clientIdentifiers",exactMatch: exactMatch}, function (data) {
                        var arrayLength = data.length;
                        for (var i = 0; i < arrayLength; i++) {
                            var result = data[i];
                            var client = {};
                            client.status = {};
                            client.subStatus = {};
                            client.status.value = result.entityStatus.value;
                            client.status.code  = result.entityStatus.code;
                            if(result.entityType  == 'CLIENT'){

                                client.displayName = result.entityName;
                                client.accountNo = result.entityAccountNo;
                                client.id = result.entityId;
                                client.officeName = result.parentName;
                                client.externalId = result.entityExternalId;
                            }else if (result.entityType  == 'CLIENTIDENTIFIER'){
                                numberOfClients = numberOfClients + 1;
                                client.displayName = result.parentName;
                                client.id = result.parentId;

                            }
                            scope.actualClients.push(client);
                        }
                        var numberOfClients = scope.actualClients.length;
                        scope.totalClients = numberOfClients;
                        scope.clients = scope.actualClients.slice(0, scope.clientsPerPage);
                    });
                }
            }

            scope.reverseDisplayName = function(client){
                if(client.lastname != undefined){
                     client.displayNameInReverseOrder = client.lastname.concat(" ");
                }
                if(client.middlename != undefined){
                    client.displayNameInReverseOrder = client.displayNameInReverseOrder.concat(client.middlename).concat(" ");
                }
                if(client.firstname != undefined){
                     client.displayNameInReverseOrder = client.displayNameInReverseOrder.concat(client.firstname);
                }
                if(client.lastname == undefined && client.middlename == undefined && client.firstname == undefined){
                    client.displayNameInReverseOrder = client.displayName;
                }
            }

        }
    });



    mifosX.ng.application.controller('ClientController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.ClientController]).run(function ($log) {
        $log.info("ClientController initialized");
    });
}(mifosX.controllers || {}));