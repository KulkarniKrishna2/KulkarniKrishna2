(function (module) {
    mifosX.controllers = _.extend(module, {
        CoApplicantActivityController: function ($controller,scope, routeParams, resourceFactory, dateFilter, location, $q, $modal) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.loanApplicationReferenceId = scope.taskconfig['loanApplicationId'];
            scope.restrictDate = new Date();
            scope.formData = {};
            
            function init(){
                scope.showSummary=true;
                scope.addExistingClient=false;
                scope.addNewClientForm=false;
                resourceFactory.loanCoApplicantsResource.getAll({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (data) {
                    scope.coapplicants = data;
                });
            };

            init();

            scope.addExistingClients=function(){
                scope.available=undefined;
                scope.addExistingClient=true;
                scope.showSummary=false;
                scope.addNewClientForm=false;
            }

            scope.addNewClient=function(){
                scope.addNewClientForm=true;
                scope.showSummary=false;
                scope.addExistingClient=false;
                scope.offices = [];
                scope.staffs = [];
                scope.savingproducts = [];
                scope.first = {};
                scope.first.date = new Date();
                scope.first.submitondate = new Date ();
                scope.formData = {};
                scope.clientNonPersonDetails = {};
                scope.restrictDate = new Date();
                scope.showSavingOptions = false;
                scope.opensavingsproduct = false;
                scope.forceOffice = null;
                scope.showNonPersonOptions = false;
                scope.clientPersonId = 1;
                scope.isFamilyMembers = true;

                var requestParams = {staffInSelectedOfficeOnly:true};
                if (scope.taskconfig['groupId']) {
                    requestParams.groupId = scope.taskconfig['groupId'];
                }
                if (scope.taskconfig['officeId']) {
                    requestParams.officeId = scope.taskconfig['officeId'];
                }
                resourceFactory.clientTemplateResource.get(requestParams, function (data) {
                    scope.offices = data.officeOptions;
                    scope.staffs = data.staffOptions;
                    scope.formData.officeId = scope.offices[0].id;
                    scope.savingproducts = data.savingProductOptions;
                    scope.genderOptions = data.genderOptions;
                    scope.clienttypeOptions = data.clientTypeOptions;
                    scope.clientClassificationOptions = data.clientClassificationOptions;
                    scope.clientNonPersonConstitutionOptions = data.clientNonPersonConstitutionOptions;
                    scope.clientNonPersonMainBusinessLineOptions = data.clientNonPersonMainBusinessLineOptions;
                    scope.clientLegalFormOptions = data.clientLegalFormOptions;
                    if (data.savingProductOptions.length > 0) {
                        scope.showSavingOptions = true;
                    }
                    if(scope.taskconfig['officeId']) {
                        scope.formData.officeId = scope.taskconfig['officeId'];
                        for(var i in data.officeOptions) {
                            if(data.officeOptions[i].id == scope.taskconfig['officeId']) {
                                scope.forceOffice = data.officeOptions[i];
                                break;
                            }
                        }
                    }
                    if(scope.taskconfig['groupId']) {
                        if(typeof data.staffId !== "undefined") {
                            scope.formData.staffId = data.staffId;
                        }
                    }
                    if(scope.taskconfig['staffId']) {
                        for(var i in scope.staffs) {
                            if (scope.staffs[i].id == scope.taskconfig['staffId']) {
                                scope.formData.staffId = scope.staffs[i].id;
                                break;
                            }
                        }
                    }
                });
            }

            scope.viewClient = function (item) {
                scope.client = item;
            };

            scope.clientOptions = function(value){
                var deferred = $q.defer();
                resourceFactory.clientResource.getAllClientsWithoutLimit({displayName: value, orderBy : 'displayName',
                    sortOrder : 'ASC', orphansOnly : false}, function (data) {
                    removeExistingClients(data.pageItems);
                    deferred.resolve(data.pageItems);
                });
                return deferred.promise;
            };

            removeExistingClients = function(data){
                var len = data.length;
                for(var i=0; i < len; i++){
                    var client = data[i];
                    var clientPresent = false;
                    var coApplicantsLen = scope.coapplicants.length;
                    for(var j=0; j < coApplicantsLen; j++){
                        if(client.id === scope.coapplicants[j].clientId){
                            clientPresent = true;
                            break;
                        }
                    }
                    if(clientPresent){
                        data.splice(i,1);
                        i--;
                        len = data.length;
                    }
                }
            };

            scope.add = function (available) {
                if(available != undefined){
                    resourceFactory.loanCoApplicantsResource.add({loanApplicationReferenceId: scope.loanApplicationReferenceId, clientId: available.id}, function (data) {
                        init();
                    });
                }
            };

            scope.remove = function (id) {
                scope.idToBeDeleted = id;
                $modal.open({
                    templateUrl: 'delete.html',
                    controller: MemberDeleteCtrl
                });
            };

            var MemberDeleteCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    resourceFactory.loanCoApplicantsResource.delete({loanApplicationReferenceId: scope.loanApplicationReferenceId, coApplicantId: scope.idToBeDeleted}, function (data) {
                        resourceFactory.loanCoApplicantsResource.getAll({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (data) {
                            scope.coapplicants = data;
                            $modalInstance.close('delete');
                        });
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.displayPersonOrNonPersonOptions = function (legalFormId) {
                if(legalFormId == scope.clientPersonId || legalFormId == null) {
                    scope.showNonPersonOptions = false;
                }else {
                    scope.showNonPersonOptions = true;
                }
            };

            scope.changeOffice = function (officeId) {
                resourceFactory.clientTemplateResource.get({staffInSelectedOfficeOnly:true, officeId: officeId
                }, function (data) {
                    scope.staffs = data.staffOptions;
                    scope.savingproducts = data.savingProductOptions;
                });
            };

            scope.setChoice = function () {
                if (this.formData.active) {
                    scope.choice = 1;
                }
                else if (!this.formData.active) {
                    scope.choice = 0;
                }
            };
            
            scope.cancel=function(){
                init();
            };

            scope.submit = function () {
                var reqDate = dateFilter(scope.first.date, scope.df);

                this.formData.locale = scope.optlang.code;
                this.formData.active = this.formData.active || false;
                this.formData.dateFormat = scope.df;
                this.formData.activationDate = reqDate;

                if (routeParams.groupId) {
                    this.formData.groupId = routeParams.groupId;
                }

                if (routeParams.officeId) {
                    this.formData.officeId = routeParams.officeId;
                }

                if (scope.first.submitondate) {
                    reqDate = dateFilter(scope.first.submitondate, scope.df);
                    this.formData.submittedOnDate = reqDate;
                }

                if (scope.first.dateOfBirth) {
                    this.formData.dateOfBirth = dateFilter(scope.first.dateOfBirth, scope.df);
                }

                if (this.formData.legalFormId == scope.clientPersonId || this.formData.legalFormId == null) {
                    delete this.formData.fullname;
                } else {
                    delete this.formData.firstname;
                    delete this.formData.middlename;
                    delete this.formData.lastname;
                }

                if(scope.first.incorpValidityTillDate) {
                    this.formData.clientNonPersonDetails.locale = scope.optlang.code;
                    this.formData.clientNonPersonDetails.dateFormat = scope.df;
                    this.formData.clientNonPersonDetails.incorpValidityTillDate = dateFilter(scope.first.incorpValidityTillDate, scope.df);
                }

                if (!scope.opensavingsproduct) {
                    this.formData.savingsProductId = null;
                }

                resourceFactory.clientResource.save(this.formData, function (data) {
                    if(routeParams.pledgeId)
                    {
                        var updatedData = {};
                        updatedData.clientId = data.clientId;
                        resourceFactory.pledgeResource.update({ pledgeId : routeParams.pledgeId}, updatedData, function(pledgeData){
                        });
                    }
                    scope.available={};
                    scope.available.id=data.clientId;
                    scope.add(scope.available);
                });
            };

        }
    });
    mifosX.ng.application.controller('CoApplicantActivityController', ['$controller','$scope', '$routeParams', 'ResourceFactory', 'dateFilter', '$location', '$q', '$modal', mifosX.controllers.CoApplicantActivityController]).run(function ($log) {
        $log.info("CoApplicantActivityController initialized");
    });
}(mifosX.controllers || {}));