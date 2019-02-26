(function (module) {
    mifosX.controllers = _.extend(module, {
        ClientDeduplicationCheckController: function (scope, resourceFactory, dateFilter, route) {

            scope.uiData = {};
            scope.uiData.forceActivate = false;

            resourceFactory.clientResourceTemplate.getActivateTemplate({clientId: scope.dedupeClientId, command : 'activate'}, function (data) {
                scope.client = data;
                if(scope.client.possibleClientMatches){
                    resourceFactory.clientIdenfierResource.getAll({clientId: scope.dedupeClientId}, function(data){
                        if(data){
                            scope.clientIdentities = data.sort(function(a,b) {
                                return (a.documentType.id > b.documentType.id) ? 1
                                    : ((b.documentType.id > a.documentType.id) ? -1 : 0);} );
                            scope.client.identitiesCompiled = compileDocuments(scope.clientIdentities);
                        }
                    });
                }
            });

            function compileDocuments(data) {
                var len = data.length;
                var str = "";
                for (var i = 0; i < len; i++) {
                    str = str.concat('<b>', data[i].documentType.name, '</b> : ', data[i].documentKey,'<br/>');
                }
                return str;
            }

            scope.matchClient = function(clientId){
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

            function containsDocumentType(a, obj) {
                for (var i = 0; i < a.length; i++) {
                    if (a[i].documentType.id === obj.documentType.id) {
                        return i;
                    }
                }
                return -1;
            }

            scope.activateClient = function () {
                var activationFormData = {};
                activationFormData.activationDate = dateFilter(new Date(), scope.df);
                activationFormData.locale = scope.optlang.code;
                activationFormData.dateFormat = scope.df;
                var queryParams = {clientId: scope.dedupeClientId, command: 'forceActivate'};
                resourceFactory.clientResource.save(queryParams, activationFormData, function (data) {
                    scope.close();
                    route.reload();
                });
            };

            scope.cancel = function(){
                scope.close();
            }
            scope.tagClientToMatchedClientId = function () {
                var tagFormData = {};
                tagFormData.clientDedupeId = scope.uiData.matchClientId;
                resourceFactory.clientDedupetagsResource.save({clientId: scope.dedupeClientId},tagFormData, function (data) {
                    scope.close();
                    route.reload();
                });
            };

        }
    });
    mifosX.ng.application.controller('ClientDeduplicationCheckController', ['$scope', 'ResourceFactory', 'dateFilter', '$route', mifosX.controllers.ClientDeduplicationCheckController]).run(function ($log) {
        $log.info("ClientDeduplicationCheckController initialized");
    });
}(mifosX.controllers || {}));