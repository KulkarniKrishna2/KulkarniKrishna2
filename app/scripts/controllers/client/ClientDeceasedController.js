(function (module) {
    mifosX.controllers = _.extend(module, {
        ClientDeceasedController: function ($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope,CommonUtilService, $modal) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));
            scope.deceasedReasonOptions = [];
            scope.deceasedPersonOptions = [];
            scope.formData = {};
            scope.formData.locale = scope.optlang.code;
            scope.formData.dateFormat = scope.df;
            scope.isDeceasedDetailsCreated = false;
            scope.isCreateDeceasedDetailsShow = false;
            scope.clientId = routeParams.clientId;
            scope.deceasedDetailsData = [{"clientType" : "INSURED"}, {"clientType" : "CO-INSURED"}];

            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.createClient &&
                scope.response.uiDisplayConfigurations.createClient.isValidMobileNumber && scope.response.uiDisplayConfigurations.createClient.isValidMobileNumber.mobileNumberPattern) {
                scope.mobileNumberPattern = scope.response.uiDisplayConfigurations.createClient.isValidMobileNumber.mobileNumberPattern;
            }
            
            scope.getDeceasedDetails = function () {
                resourceFactory.getDeceasedDetailsResource.getDeceasedDetails({ clientId: routeParams.clientId }, {},
                    function (data) {
                        if (angular.isDefined(data) ) {
                            scope.deceasedDetails = data.insuranceClientDeceasedData;
                            scope.clientData = data.clientData;
                            if(scope.deceasedDetails.length > 0) {
                                scope.isDeceasedDetailsCreated = true;
                            }
                            for(var i=0;i<scope.deceasedDetails.length;i++) {
                                if(scope.deceasedDetails[i].clientType.value == 'INSURED') {
                                    var index = scope.deceasedDetailsData.map(function(item) { return item.clientType; }).indexOf('INSURED');
                                    scope.deceasedDetailsData.splice(index,1);
                                }
                                if(scope.deceasedDetails[i].clientType.value == 'CO-INSURED') {
                                    var index = scope.deceasedDetailsData.map(function(item) { return item.clientType; }).indexOf('CO-INSURED');
                                    scope.deceasedDetailsData.splice(index,1);
                                }
                            }
                            if(scope.deceasedDetailsData.length > 0) {
                                scope.isCreateDeceasedDetailsShow= true;
                            } else {
                                scope.isCreateDeceasedDetailsShow= false;
                            }
                        }
                    });
            }

          
            scope.init = function () {
                scope.getDeceasedDetails();
            }
            
            scope.init();

            scope.submit = function () {
                scope.clientDeceased = {};
                scope.clientDeceased.clientId =  routeParams.clientId;
                scope.clientDeceased.locale = scope.formData.locale;
                scope.clientDeceased.dateFormat = scope.formData.dateFormat;
                scope.clientDeceased.contactNumber = scope.formData.mobileNo;
                scope.clientDeceased.clientDeceasedData = [];
                for(var i = 0 ; i < scope.deceasedDetailsData.length; i++) {
                    if(scope.deceasedDetailsData[i].selected == true) {
                        scope.deceasedDetailsData[i].deathDate =  dateFilter(new Date(scope.deceasedDetailsData[i].deathDate), scope.df);
                        scope.deceasedDetailsData[i].deathIntimationDate =  dateFilter(new Date(scope.deceasedDetailsData[i].deathIntimationDate), scope.df);
                        delete scope.deceasedDetailsData[i].selected;
                        scope.clientDeceased.clientDeceasedData.push(scope.deceasedDetailsData[i]);
                    }
                }
                resourceFactory.postDeceasedDetailsResource.save(scope.clientDeceased, function (data) {
                    scope.init();
                });

            }

            scope.editDeceasedDetails = function () {
                scope.getTemplate();
                scope.announceDate = dateFilter(new Date(scope.deceasedDetailsData.announceDate), scope.df);
                scope.deceasedDate = new Date(scope.deceasedDetailsData.deceasedDate);
                scope.formData.deceasedPerson = scope.deceasedDetailsData.deceasedPerson.id;
                scope.formData.deceasedReason = scope.deceasedDetailsData.deceasedReason.id;
                scope.isDeceasedDetailsCreated = false;
            }
        }
    });
    mifosX.ng.application.controller('ClientDeceasedController', ['$controller', '$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'CommonUtilService', '$modal', mifosX.controllers.ClientDeceasedController]).run(function ($log) {
        $log.info("ClientDeceasedController initialized");
    });
}(mifosX.controllers || {}));