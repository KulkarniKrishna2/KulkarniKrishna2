(function (module) {
    mifosX.controllers = _.extend(module, {
        ClientDeDuplicationActivityController: function ($controller, scope, resourceFactory, location, routeParams, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.taskId = routeParams.id;
            scope.formData = {};
            scope.restrictDate = new Date();
            scope.taskPermissionName = 'ALL_FUNCTIONS';
            scope.forcedSubmit = false;
            scope.forceActivateClientPermission = 'FORCE_ACTIVATE_CLIENT';
            scope.clientId = scope.taskconfig['clientId'];
            resourceFactory.clientResourceTemplate.getActivateTemplate({clientId:scope.clientId, command : 'activate'}, function (data) {
                        scope.client = data;
                        if(scope.client.possibleClientMatches){
                            resourceFactory.clientIdenfierResource.getAll({clientId:scope.client.id}, function(data){
                                if(data){
                                    scope.clientIdentities = data.sort(function(a,b) {
                                        return (a.documentType.id > b.documentType.id) ? 1
                                            : ((b.documentType.id > a.documentType.id) ? -1 : 0);} );
                                    scope.client.identitiesCompiled = compileDocuments(scope.clientIdentities);
                                }
                            });
                        }
                    });
                    scope.labelName = 'label.input.activationdate';
                    scope.breadcrumbName = 'label.anchor.activate';
                    scope.modelName = 'activationDate';
                    scope.showActivationDateField = true;
                    scope.showDateField = false;
                    scope.taskPermissionName = 'ACTIVATE_CLIENT';

                scope.cancel=function()
                {
                }
               
               scope.matchClient = function(clientId)
               {
                if(scope.client.possibleClientMatches){
                    var len = scope.client.possibleClientMatches.length;
                    for(var i=0; i<len; i++){
                        if(scope.client.possibleClientMatches[i].id === clientId){
                            scope.possibleMatch = scope.client.possibleClientMatches[i];
                            break;
                        }
                    }
                }
                if(scope.possibleMatch){
                    scope.client.identitiesCompiled = compileDocuments(scope.clientIdentities);
                    resourceFactory.clientIdenfierResource.getAll({clientId:scope.possibleMatch.id}, function(data){
                        if(data){
                            scope.possibleMatchIdentities = data.sort(function(a,b) {
                                return (a.documentType.id > b.documentType.id) ? 1
                                    : ((b.documentType.id > a.documentType.id) ? -1 : 0);} );
                            scope.possibleMatch.identitiesCompiled = "";
                            var len = scope.possibleMatchIdentities.length;
                            for(var i=0; i<scope.clientIdentities.length; i++){
                                var index = containsDocumentType(scope.possibleMatchIdentities,scope.clientIdentities[i]);
                                if(index < 0){
                                    scope.possibleMatch.identitiesCompiled += "&nbsp;<br/>";
                                }else{
                                    scope.possibleMatch.identitiesCompiled = scope.possibleMatch.identitiesCompiled
                                        .concat('<b>',scope.possibleMatchIdentities[index].documentType.name, '</b> : ',
                                            scope.possibleMatchIdentities[index].documentKey, '<br/>');
                                    scope.possibleMatchIdentities.splice(index,1);
                                }
                            }
                            scope.possibleMatch.identitiesCompiled += compileDocuments(scope.possibleMatchIdentities);
                            for(var i=0; i < scope.clientIdentities.length; i++){
                                if(scope.possibleMatch.identitiesCompiled.indexOf(scope.clientIdentities[i].documentKey) >= 0){
                                    scope.possibleMatch.identitiesCompiled = scope.possibleMatch.identitiesCompiled
                                        .replace(scope.clientIdentities[i].documentKey,
                                        '<span class=highlight>'+scope.clientIdentities[i].documentKey+'</span>');
                                    scope.client.identitiesCompiled = scope.client.identitiesCompiled
                                        .replace(scope.clientIdentities[i].documentKey,
                                        '<span class=highlight>'+scope.clientIdentities[i].documentKey+'</span>');
                                }
                            }
                        }
                    });
                }
            }

                    
            function compileDocuments(data) {
                var len = data.length;
                var str = "";
                for (var i = 0; i < len; i++) {
                    str = str.concat('<b>', data[i].documentType.name, '</b> : ', data[i].documentKey,'<br/>');
                }
                return str;
            }

            function containsDocumentType(a, obj) {
                for (var i = 0; i < a.length; i++) {
                    if (a[i].documentType.id === obj.documentType.id) {
                        return i;
                    }
                }
                return -1;
            }
        }

    });
    mifosX.ng.application.controller('ClientDeDuplicationActivityController', ['$controller','$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.ClientDeDuplicationActivityController]).run(function ($log) {
        $log.info("ClientDeDuplicationActivityController initialized");
    });
}(mifosX.controllers || {}));
