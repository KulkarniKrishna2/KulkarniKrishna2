(function (module) {
    mifosX.controllers = _.extend(module, {
        GstInvoicingController: function (scope, routeParams, paginatorService, dateFilter, resourceFactory, location, $modal) {
            scope.formData = {
                locale: scope.optlang.code,
                dateFormat: scope.df
            };
            scope.states = [];
            scope.tillTime = {};
            scope.restrictDate = new Date();
            scope.show = false;
            resourceFactory.addressTemplateResource.get({}, function (data) {
                scope.addressType = data.addressTypeOptions;
                scope.countries = data.countryDatas;
                scope.setDefaultGISConfig();
            });
            scope.setDefaultGISConfig = function () {
                if (scope.responseDefaultGisData && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address) {
                    if (scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.countryName) {

                        var countryName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.countryName;
                        scope.defaultCountry = _.filter(scope.countries, function (country) {
                            return country.countryName === countryName;

                        });
                        scope.states = scope.defaultCountry[0].statesDatas;
                    }
                }
            };
            resourceFactory.taxInvoiceTemplate.get(function (data) {
                scope.tillTime = data.tilldate;
            });
            scope.create = function () {
                var queryParams = { toDate: dateFilter(scope.formData.toDate, scope.df), stateId: scope.formData.stateId, locale: scope.optlang.code, dateFormat: scope.df };
                resourceFactory.taxInvoice.query(queryParams, function (data) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].officeType && data[i].officeType.name == 'Urban') {
                            scope.urbanInvoiceData = data[i];
                        } else if (data[i].officeType && data[i].officeType.name == 'Rural') {
                            scope.ruralInvoiceData = data[i];
                        }
                    }
                    if (data.length > 0) {
                        scope.show = true;
                    }
                });
            };

            scope.submit = function () {
                this.formData.toDate = dateFilter(scope.formData.toDate, scope.df);
                scope.show = false;
                resourceFactory.taxInvoice.save(scope.formData, function (data) {
                    location.path('/bc');
                });

            }


        }
    });
    mifosX.ng.application.controller('GstInvoicingController', ['$scope', '$routeParams', 'PaginatorService', 'dateFilter', 'ResourceFactory', '$location', '$modal', mifosX.controllers.GstInvoicingController]).run(function ($log) {
        $log.info("GstInvoicingController initialized");
    });
}(mifosX.controllers || {}));

