(function (module) {
    mifosX.controllers = _.extend(module, {
        kycActivityController: function ($controller, scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION, $upload, $rootScope) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            function initTask(){
                scope.clientId = scope.taskconfig['clientId'];
                getClientIdentifiers();
            };
            initTask();

            scope.formData = {};
            scope.documenttypes = [];
            scope.statusTypes =[];
            function getClientIdentifiers() {
                resourceFactory.clientIdenfierTemplateResource.get({clientId: scope.clientId}, function (data) {
                    scope.documenttypes = data.allowedDocumentTypes;
                    scope.formData.documentTypeId = data.allowedDocumentTypes[0].id;
                    scope.statusTypes = data.clientIdentifierStatusOptions;
                });
            };

            scope.validateRsaIdnumber=function() {
                var invalid = 0;
                if (scope.formData.documentTypeId == 2) {
                    var idnumber = scope.formData.documentKey;
                    if (isNaN(idnumber)) {
                        scope.error = "label.error.LuhnsAlgorithm.notvalidnumber";
                        invalid++;
                    }

                    // check length of 13 digits
                    if (idnumber.length != 13) {
                        scope.error = "label.error.LuhnsAlgorithm.numberdosenothave13digits";
                        invalid++;
                    }
                    else {
                        // check that YYMMDD group is a valid date
                        var yy = idnumber.substring(0, 2),
                            mm = idnumber.substring(2, 4),
                            dd = idnumber.substring(4, 6);

                        var dob = new Date(yy, (mm - 1), dd);

                        // check values - add one to month because Date() uses 0-11 for months
                        if (!(((dob.getFullYear() + '').substring(2, 4) == yy) && (dob.getMonth() == mm - 1) && (dob.getDate() == dd))) {
                            scope.error = "label.error.LuhnsAlgorithm.firstdigitsinvalid";
                            invalid++;
                        }

                        else {
                            // evaluate GSSS group for gender and sequence
                            var gender = parseInt(idnumber.substring(6, 10), 10) > 5000 ? "M" : "F";

                            // determine citizenship from third to last digit (C)
                            var saffer = parseInt(idnumber.substring(10, 11), 10) === 0 ? "C" : "F";

                            // ensure third to last digit is a 1 or a 0
                            if (idnumber.substring(10, 11) > 2) {
                                scope.error = "label.error.LuhnsAlgorithm.thirddigitshouldbe1or0";
                                invalid++;
                                /*return (ncheck % 10) === 0;*/
                            }
                            else {
                                // ensure second to last digit is a 8 or a 9
                                if (idnumber.substring(11, 12) < 8) {
                                    scope.error = "label.error.LuhnsAlgorithm.secondlastdigitshould8or9r1";
                                    invalid++;
                                }
                                else {
                                    // calculate check bit (Z) using the Luhn algorithm
                                    var ncheck = 0,
                                        beven = false;

                                    for (var c = idnumber.length - 1; c >= 0; c--) {
                                        var cdigit = idnumber.charAt(c),
                                            ndigit = parseInt(cdigit, 10);

                                        if (beven) {
                                            if ((ndigit *= 2) > 9) ndigit -= 9;
                                        }

                                        ncheck += ndigit;
                                        beven = !beven;
                                    }

                                    if ((ncheck % 10) !== 0) {
                                        scope.error = "label.error.LuhnsAlgorithm.checkbitincorrect";
                                        invalid++;
                                        return (ncheck % 10) === 0;
                                    }

                                    // if one or more checks fail, display details
                                    if (invalid <= 0) {
                                        scope.error = "label.error.LuhnsAlgorithm.idnumbervalid";
                                    }
                                }
                            }
                        }
                    }
                }
                else {
                    scope.error = "label.error.LuhnsAlgorithm.selecId";
                }
            };

            scope.isAddIdentifiers = false;
            scope.getClientIdentityDocuments = function () {
                resourceFactory.clientResource.getAllClientDocuments({clientId: scope.clientId, anotherresource: 'identifiers'}, function (data) {
                    scope.identitydocuments = data;
                    for (var i = 0; i < scope.identitydocuments.length; i++) {
                        resourceFactory.clientIdentifierResource.get({clientIdentityId: scope.identitydocuments[i].id}, function (data) {
                            for (var j = 0; j < scope.identitydocuments.length; j++) {
                                if (data.length > 0 && scope.identitydocuments[j].id == data[0].parentEntityId) {
                                    for (var l in data) {

                                        var loandocs = {};
                                        loandocs = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                                        data[l].docUrl = loandocs;
                                    }
                                    scope.identitydocuments[j].documents = data;
                                }
                            }
                        });
                    }
                });
            };

            scope.getClientIdentityDocuments();

            scope.submit = function () {
                resourceFactory.clientIdenfierResource.save({clientId: scope.clientId}, this.formData, function (data) {
                    scope.isAddIdentifiers = false;
                    scope.getClientIdentityDocuments();
                });
            };

            scope.deleteClientIdentifierDocument = function (clientId, entityId, index) {
                resourceFactory.clientIdenfierResource.delete({clientId: clientId, id: entityId}, '', function (data) {
                    scope.identitydocuments.splice(index, 1);
                });
            };

            scope.changeValue = function(isAddIdentifiers){
                scope.isAddIdentifiers = isAddIdentifiers;
            };
        }
    });
    mifosX.ng.application.controller('kycActivityController', ['$controller','$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.kycActivityController]).run(function ($log) {
        $log.info("kycActivityController initialized");
    });
}(mifosX.controllers || {}));