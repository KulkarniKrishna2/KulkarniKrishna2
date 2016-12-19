(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateAdhocTaskController: function (scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION, $upload, $rootScope, dateFilter) {

            resourceFactory.clientTemplateResource.get(requestParams, function (data) {
                scope.offices = data.officeOptions;
                scope.staffs = data.staffOptions;
                scope.formData.officeId = scope.offices[0].id;
            });

            scope.changeOffice = function (officeId) {
                resourceFactory.clientTemplateResource.get({staffInSelectedOfficeOnly:true, officeId: officeId
                }, function (data) {
                    scope.staffs = data.staffOptions;
                });
            };


        }
    });
    mifosX.ng.application.controller('CreateAdhocTaskController', ['$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope' ,'dateFilter', mifosX.controllers.CreateAdhocTaskController]).run(function ($log) {
        $log.info("CreateAdhocTaskController initialized");
    });
}(mifosX.controllers || {}));
