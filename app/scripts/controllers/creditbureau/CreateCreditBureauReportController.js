(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateCreditBureauReportController: function (scope, resourceFactory, location, routeParams) {
            scope.entityType = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            scope.formData = {};

            resourceFactory.creditBureauReportTemplateResource.template(function (data) {
                scope.template = data;
            });

            scope.formData.locale = scope.optlang.code;
            scope.submit = function () {
                resourceFactory.clientCreditBureauEnquiry.save({'clientId':scope.entityId},scope.formData, function (data) {
                    location.path('/viewclient/' + scope.entityId);
                });
            };

            scope.cancel = function () {
                location.path('/viewclient/' + scope.entityId);
            };
        }
    });
    mifosX.ng.application.controller('CreateCreditBureauReportController', ['$scope', 'ResourceFactory', '$location', '$routeParams', mifosX.controllers.CreateCreditBureauReportController]).run(function ($log) {
        $log.info("CreateCreditBureauReportController initialized");
    });
}(mifosX.controllers || {}));