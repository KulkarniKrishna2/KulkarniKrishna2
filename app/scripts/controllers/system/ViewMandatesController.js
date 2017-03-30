(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewMandatesController: function (scope, routeParams, resourceFactory, location, route, http, $modal, dateFilter, API_VERSION, $sce, $rootScope) {
            scope.requesttypes = ["MANDATES_DOWNLOAD","MANDATES_UPLOAD","TRANSACTIONS_DOWNLOAD","TRANSACTIONS_UPLOAD"];
            scope.formData = {};

            resourceFactory.mandatesTemplateResource.get({command: "MANDATES_DOWNLOAD"}, function (data) {
                scope.officeOptions = data.officeOptions;
            });

            resourceFactory.mandatesResource.getAll(function (data) {
                scope.copyMandates(data);
            });

            scope.copyMandates = function(data){
                var len = data.length;
                if(len > 0){
                    for(var i=0; i<len; i++){
                        var d = data[i];
                        d.requestDate = new Date(d.requestDate);
                        d.docUrl = API_VERSION + '/mandates/1/documents/' + d.documentId + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                    }
                }
                scope.mandates = data;
            };
            scope.search = function () {
                if(scope.formData.type === ""){
                    delete scope.formData.type;
                }
                if(scope.formData.officeId < 1){
                    delete scope.formData.officeId;
                }
                if(scope.formData.requestDate === ""){
                    delete scope.formData.requestDate;
                }
                resourceFactory.mandatesResource.getAll({type: scope.formData.type, requestDate: dateFilter(scope.formData.requestDate, scope.df), dateFormat: scope.df, officeId:scope.formData.officeId},function (data) {
                    scope.copyMandates(data);
                });
            };
            scope.formatDate = function(date){
                if(date != undefined){
                    var d = new Date();
                    var month = parseInt(date[1])-1;
                    d.setFullYear(date[0], month, date[2]);
                    var sentdate = dateFilter(d,scope.df);
                    return sentdate;
                }else{
                    return "";
                }
            };


        }
    });

    mifosX.ng.application.controller('ViewMandatesController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', '$http', '$modal', 'dateFilter', 'API_VERSION', '$sce', '$rootScope', mifosX.controllers.ViewMandatesController]).run(function ($log) {
        $log.info("ViewMandatesController initialized");
    });
}(mifosX.controllers || {}));
