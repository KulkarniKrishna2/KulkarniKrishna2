(function (module) {
    mifosX.controllers = _.extend(module, {
        ManageCoApplicantsController: function (scope, routeParams, resourceFactory, location, $q, $modal) {

            scope.loanApplicationReferenceId = routeParams.loanApplicationReferenceId;

            scope.restrictDate = new Date();
            scope.formData = {};
            scope.chargeFormData = {}; //For charges
            scope.charges = [];

            resourceFactory.loanApplicationReferencesResource.getByLoanAppId({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (applicationData) {
                scope.applicationData = applicationData;
                scope.formData.clientId = applicationData.clientId;
                scope.formData.groupId = applicationData.groupId;
                if(scope.applicationData.expectedDisbursalPaymentType){
                    scope.formData.expectedDisbursalPaymentType = scope.applicationData.expectedDisbursalPaymentType.id;
                }
                if(scope.applicationData.expectedRepaymentPaymentType){
                    scope.formData.expectedRepaymentPaymentType = scope.applicationData.expectedRepaymentPaymentType.id;
                }
                scope.loanProductChange(applicationData.loanProductId, false);
            });

            resourceFactory.loanCoApplicantsResource.getAll({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (data) {
                scope.coapplicants = data;
            });

            scope.loanProductChange = function (loanProductId, isNewCall) {
                scope.inparams = {resourceType: 'template', activeOnly: 'true'};
                if (scope.formData.clientId && scope.formData.groupId) {
                    scope.inparams.templateType = 'jlg';
                } else if (scope.formData.groupId) {
                    scope.inparams.templateType = 'group';
                } else if (scope.formData.clientId) {
                    scope.inparams.templateType = 'individual';
                }
                if (scope.formData.clientId) {
                    scope.inparams.clientId = scope.formData.clientId;
                }
                if (scope.formData.groupId) {
                    scope.inparams.groupId = scope.formData.groupId;
                }
                scope.inparams.staffInSelectedOfficeOnly = true;


                scope.inparams.productId = loanProductId;

                resourceFactory.loanResource.get(scope.inparams, function (data) {
                    scope.loanaccountinfo = data;
                    if (data.clientName) {
                        scope.clientName = data.clientName;
                    }
                    if (data.group) {
                        scope.groupName = data.group.name;
                    }
                });
            };

            scope.viewClient = function (item) {
                scope.client = item;
            };

            scope.clientOptions = function(value){
                var deferred = $q.defer();
                resourceFactory.clientResource.getAllClientsWithoutLimit({displayName: value, orderBy : 'displayName',
                    sortOrder : 'ASC', orphansOnly : false,limit:15}, function (data) {
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

            scope.add = function () {
                if(scope.available != ""){
                    resourceFactory.loanCoApplicantsResource.add({loanApplicationReferenceId: scope.loanApplicationReferenceId, clientId: scope.available.id}, function (data) {
                        scope.addExistingClients = false;
                        scope.available = "";
                        resourceFactory.loanCoApplicantsResource.getAll({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (data) {
                            scope.coapplicants = data;
                        });
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
            scope.routeToMem = function (id) {
                location.path('/viewclient/' + id + '/' + scope.loanApplicationReferenceId);
            };
        }
    });
    mifosX.ng.application.controller('ManageCoApplicantsController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$q', '$modal', mifosX.controllers.ManageCoApplicantsController]).run(function ($log) {
        $log.info("ManageCoApplicantsController initialized");
    });
}(mifosX.controllers || {}));