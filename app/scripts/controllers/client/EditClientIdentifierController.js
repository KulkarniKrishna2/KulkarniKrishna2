(function (module) {
    mifosX.controllers = _.extend(module, {
        EditClientIdentifierController: function (scope, routeParams, location, resourceFactory, dateFilter, $filter) {
            scope.clientId = routeParams.clientId;
            scope.id = routeParams.id;
            scope.formData = {};
            scope.first = {};
            scope.formData.locale = scope.optlang.code;
            scope.documenttypes = [];
            scope.statusTypes =[];
            if(scope.response){
                scope.isHideDocumentIssueDate=scope.response.uiDisplayConfigurations.clientIdentifier.hiddenFields.documentIssueDate;
                scope.isHideDocumentExpiryDate=scope.response.uiDisplayConfigurations.clientIdentifier.hiddenFields.documentExpiryDate;
            }
            
            resourceFactory.clientIdenfierResource.get({ clientId: routeParams.clientId, id: routeParams.id, template: true }, function (data) {
                if (data) {
                    scope.documenttypes = data.allowedDocumentTypes;
                    scope.allowedDocumentTypesSubCategories = data.allowedDocumentTypesSubCategories;
                    scope.formData.documentTypeId = data.allowedDocumentTypes[0].id;
                    scope.statusTypes = data.clientIdentifierStatusOptions;
                    if (data.clientIdentifierStatusOptions && scope.response &&
                        scope.response.uiDisplayConfigurations.clientIdentifier.hiddenFields.status) {
                        scope.formData.status = data.clientIdentifierStatusOptions[1].id;
                    }
                    scope.formData.documentTypeId = data.documentType.id;
                    if (data.subCategoryType) {
                        scope.formData.subCategoryTypeId = data.subCategoryType.id;
                    }
                    scope.documentCategories = scope.fetchDocumentCategories();
                    for (var index in scope.statusTypes) {
                        if (data.status == scope.statusTypes[index].code) {
                            scope.formData.status = scope.statusTypes[index].id;
                            break;
                        }
                    }
                    scope.formData.documentKey = data.documentKey;
                    if (data.description) {
                        scope.formData.description = data.description;
                    }
                    if(data.documentIssueDate){
                        var issueDate = dateFilter(data.documentIssueDate, scope.df);
                        scope.first.documentIssueDate = new Date(issueDate);
                    }
                    if(data.documentExpiryDate){
                         var expiryDate = dateFilter(data.documentExpiryDate, scope.df);
                        scope.first.documentExpiryDate = new Date(expiryDate);
                    }
                }
            });

            scope.fetchDocumentCategories = function () {
                var documentCategories = [];
                if (!_.isUndefined(scope.formData.documentTypeId)) {
                    var columnIndex = scope.documenttypes.findIndex(x => x.id == scope.formData.documentTypeId) || 0;
                    var docType = scope.documenttypes[columnIndex];
                    _.each(scope.allowedDocumentTypesSubCategories, function (categories) {
                        var matchedSubTypes = ($filter('filter')(categories, {
                            'name': docType.name
                        }));
                        if (matchedSubTypes.length > 0) {
                            documentCategories = matchedSubTypes[0].values;
                        }
                    });
                } else {
                    scope.formData.subCategoryTypeId = "";
                }
                return documentCategories;
            };

            scope.validateRsaIdnumber=function()
            {
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

            scope.submit = function () {
                 this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
               if(scope.first.documentIssueDate){
                    this.formData.documentIssueDate = dateFilter(scope.first.documentIssueDate, scope.df);
                }
               if(scope.first.documentExpiryDate){
                    this.formData.documentExpiryDate = dateFilter(scope.first.documentExpiryDate, scope.df);
                }
                if(this.formData.documentTypeId){
                    for(var i in scope.documenttypes){
                        if(scope.documenttypes[i].name === "Aadhaar"){
                            this.formData.documentKey = this.formData.documentKey.replace(/ +/g, "");
                            break;
                        }
                    }
                }
                resourceFactory.clientIdenfierResource.update({clientId: scope.clientId, id: scope.id}, this.formData, function (data) {
                    location.path('/viewclient/' + data.clientId);
                });
            };

        }
    });
    mifosX.ng.application.controller('EditClientIdentifierController', ['$scope', '$routeParams', '$location', 'ResourceFactory', 'dateFilter', '$filter', mifosX.controllers.EditClientIdentifierController]).run(function ($log) {
        $log.info("EditClientIdentifierController initialized");
    });
}(mifosX.controllers || {}));

