(function (module) {
    mifosX.controllers = _.extend(module, {
        InitiateEodProcessController: function (scope, routeParams, resourceFactory,location,dateFilter) {
            scope.formData = {};
            scope.first = {};
            scope.first.date = new Date();

            resourceFactory.eodProcessTemplateResource.get(function (data) {
                scope.offices = data.officeOptions;
                scope.formData.officeId=scope.offices[0].id;
            });

            scope.submit = function(){
                var reqDate = dateFilter(scope.first.date, scope.df);
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.eodDate = reqDate;
                resourceFactory.eodProcessResource.initiate(this.formData, function (data) {
                    if(data.changes.isWorkflowCreated === true){
                        location.path('/eodonboarding/create/'+ data.resourceId+'/workflow');
                    }else{
                        location.path('/view_close_accounting/' + data.resourceId);
                    }
                });
            }


        }
    });

    mifosX.ng.application.controller('InitiateEodProcessController', ['$scope', '$routeParams', 'ResourceFactory','$location','dateFilter', mifosX.controllers.InitiateEodProcessController]).run(function ($log) {
        $log.info("InitiateEodProcessController initialized");
    });
}(mifosX.controllers || {}));
