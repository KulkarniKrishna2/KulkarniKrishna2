(function (module) {
    mifosX.controllers = _.extend(module, {
        NachMandateRequestActivityController: function ($controller, scope, resourceFactory, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));
            scope.nachMandateRequests = [];
            scope.nachMandateEntityType = 'loanapplications';
            scope.nachMandateEntityId = scope.taskconfig['loanApplicationId'];
            var activeRequestStatus = ['PENDING', 'ERROR', 'INITIATED', 'SUCCESS'];

            function initTask() {
                scope.formData = {};
                scope.nachRequestDetails = {};
                scope.showform = false;
                scope.showNachRequestDetails = false;
                scope.showInitiateRequestButton = true;
                scope.showRequestsList = true;
                resourceFactory.nachMandateRequestResource.getAll({
                    entityType: scope.nachMandateEntityType,
                    entityId: scope.nachMandateEntityId
                }, function (data) {
                    scope.nachMandateRequests = data;
                    canInitiateNewRequest();
                });
            }

            var canInitiateNewRequest = function () {
                for (var i = 0; i < scope.nachMandateRequests.length; i++) {
                    if (activeRequestStatus.indexOf(scope.nachMandateRequests[i].status) !== -1) {
                        scope.showInitiateRequestButton = false;
                    }
                }
            }

            scope.canRefresh = function (nachMandateRequest) {
                if (nachMandateRequest && nachMandateRequest.status == 'PENDING') {
                    return true;
                }
                return false;
            }

            scope.canCancel = function (nachMandateRequest) {
                if (nachMandateRequest && nachMandateRequest.status == 'PENDING') {
                    return true;
                }
                return false;
            }

            scope.canReject = function (nachMandateRequest) {
                if (nachMandateRequest && nachMandateRequest.status == 'ERROR') {
                    return true;
                }
                return false;
            }

            scope.refreshRequest = function (nachRequestId) {
                resourceFactory.nachMandateRequestResource.refresh({
                    entityType: scope.nachMandateEntityType,
                    entityId: scope.nachMandateEntityId,
                    requestId: nachRequestId
                }, function (data) {
                    initTask();
                });
            }

            scope.rejectRequest = function (nachRequestId) {
                resourceFactory.nachMandateRequestResource.reject({
                    entityType: scope.nachMandateEntityType,
                    entityId: scope.nachMandateEntityId,
                    requestId: nachRequestId
                }, function (data) {
                    initTask();
                });
            }

            scope.cancelRequest = function (nachRequestId) {
                resourceFactory.nachMandateRequestResource.cancel({
                    entityType: scope.nachMandateEntityType,
                    entityId: scope.nachMandateEntityId,
                    requestId: nachRequestId
                }, function (data) {
                    initTask();
                });
            }

            scope.initiateRequest = function () {
                scope.showform = true;
                scope.formData = {};
                scope.bankAccountDetails = [];
                scope.debitTypeOptions = [];
                scope.debitFrequencyOptions = [];
                scope.showInitiateRequestButton = false;
                scope.showNachRequestDetails = false;
                scope.showRequestsList = false;
                resourceFactory.nachMandateRequestResource.template({
                    entityType: scope.nachMandateEntityType,
                    entityId: scope.nachMandateEntityId,
                }, function (data) {
                    if (data.fromDate) {
                        scope.formData.fromDate = dateFilter(new Date(data.fromDate), scope.df);
                    }
                    if (data.toDate) {
                        scope.formData.toDate = dateFilter(new Date(data.toDate), scope.df);
                    }
                    scope.formData.amount = data.amount;
                    scope.debitTypeOptions = data.debitTypeOptions;
                    scope.debitFrequencyOptions = data.debitFrequencyOptions;
                    scope.bankAccountDetails = data.bankAccountDetails;
                    scope.formData.debitType = data.debitType.id;
                    scope.formData.debitFrequency = data.debitFrequency.id;
                    if (scope.bankAccountDetails.length > 0) {
                        scope.formData.bankAccountDetailId = scope.bankAccountDetails[0].id;
                    }
                });
            }

            scope.submitRequest = function () {
                var requestBody = {}
                requestBody.amount = scope.formData.amount;
                requestBody.fromDate = dateFilter(new Date(scope.formData.fromDate), 'yyyy-MM-dd');
                if (scope.formData.toDate) {
                    requestBody.toDate = dateFilter(new Date(scope.formData.toDate), 'yyyy-MM-dd');
                }
                requestBody.debitType = scope.formData.debitType;
                requestBody.debitFrequency = scope.formData.debitFrequency;
                requestBody.bankAccountDetailId = scope.formData.bankAccountDetailId;
                resourceFactory.nachMandateRequestResource.initiateRequest({
                    entityType: scope.nachMandateEntityType,
                    entityId: scope.nachMandateEntityId
                }, requestBody, function (data) {
                    initTask();
                });
            }

            scope.back = function () {
                initTask();
            }

            scope.showMandateRequestDetails = function (nachMandateRequest) {
                scope.showform = false;
                scope.showInitiateRequestButton = false;
                scope.showRequestsList = false;
                scope.showNachRequestDetails = true;
                scope.nachRequestDetails = nachMandateRequest;
            }
            initTask();

        }
    });
    mifosX.ng.application.controller('NachMandateRequestActivityController', ['$controller', '$scope', 'ResourceFactory', 'dateFilter', mifosX.controllers.NachMandateRequestActivityController]).run(function ($log) {
        $log.info("NachMandateRequestActivityController initialized");
    });
}(mifosX.controllers || {}));