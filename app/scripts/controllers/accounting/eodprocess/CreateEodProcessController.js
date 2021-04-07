(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateEodProcessController: function (scope, routeParams, resourceFactory,location,dateFilter) {
            scope.formData = {};
            scope.first = {};
            scope.first.date = new Date();
            scope.eodClosureTypeOptions = [];
            resourceFactory.eodProcessTemplateResource.get(function (data) {
                scope.offices = data.officeOptions;
                console.log(data);
                scope.formData.officeId=scope.offices[0].id;
                scope.eodClosureTypeOptions = data.eodClosureTypeOptions;
                scope.formData.eodClosureTypeId = data.eodClosureTypeOptions[0].id;
            });

            scope.submit = function(){
                var reqDate = dateFilter(scope.first.date, scope.df);
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.eodDate = reqDate;
                resourceFactory.eodProcessResource.initiate(this.formData, function (data) {
                    location.path('/vieweodprocess/' + data.resourceId);
                });
            }


        }
    });

    mifosX.ng.application.controller('CreateEodProcessController', ['$scope', '$routeParams', 'ResourceFactory','$location','dateFilter', mifosX.controllers.CreateEodProcessController]).run(function ($log) {
        $log.info("CreateEodProcessController initialized");
    });
}(mifosX.controllers || {}));
