(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewMandatesSummaryController: function (scope, resourceFactory, location, paginatorService, dateFilter) {
            scope.requesttypes = ["mandates","transactions"];
            scope.formData = {};
            scope.formData.includeChildOffices = false;
            scope.entries = [];
            scope.type = "mandates";
            scope.nodata = false;

            resourceFactory.mandatesTemplateResource.get({command: "MANDATES_DOWNLOAD"}, function (data) {
                scope.officeOptions = data.officeOptions;
            });

            scope.submit = function(){
                scope.type = scope.formData.type;
                scope.officeId = scope.formData.officeId;
                scope.includeChildOffices = scope.formData.includeChildOffices;
                scope.requestFromDate = scope.formData.requestFromDate;
                scope.requestToDate = scope.formData.requestToDate;
                scope.entries = {};
                scope.entries.currentPageItems = [];
                scope.summary = [];
                scope.nodata = false;

                var params = {};
                params.type = scope.type;
                params.officeId = scope.officeId;
                params.includeChildOffices = scope.includeChildOffices;
                params.requestFromDate = dateFilter(scope.requestFromDate, scope.df);
                params.requestToDate = dateFilter(scope.requestToDate, scope.df);
                params.offset = 0;
                params.limit = 25;
                params.locale = scope.optlang.code;
                params.dateFormat = scope.df;
                resourceFactory.mandatesSummaryResource.get(params, function(data){
                    scope.summary = data;
                    if(data && data.length < 1){
                        scope.nodata = true;
                    }
                }) ;
                paginatorService.currentOffset = 0 ;
                scope.entries = paginatorService.paginate(fetchFunction, 25);
            }

            var fetchFunction = function (offset, limit, callback) {
                var params = {};
                params.type = scope.type;
                params.officeId = scope.officeId;
                params.includeChildOffices = scope.includeChildOffices;
                params.requestFromDate = dateFilter(scope.requestFromDate, scope.df);
                params.requestToDate = dateFilter(scope.requestToDate, scope.df);
                params.offset = offset;
                params.limit = limit;
                params.locale = scope.optlang.code;
                params.dateFormat = scope.df;
                scope.saveSC();
                resourceFactory.mandatesListResource.get(params, callback) ;
            };

        }
    });

    mifosX.ng.application.controller('ViewMandatesSummaryController', ['$scope', 'ResourceFactory', '$location', 'PaginatorService', 'dateFilter', mifosX.controllers.ViewMandatesSummaryController]).run(function ($log) {
        $log.info("ViewMandatesSummaryController initialized");
    });
}(mifosX.controllers || {}));
