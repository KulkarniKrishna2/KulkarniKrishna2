(function (module) {
    mifosX.controllers = _.extend(module, {
        MandateController: function (scope, location, resourceFactory, http, routeParams, dateFilter, $rootScope,API_VERSION, $sce) {
            scope.loanId = routeParams.loanId;
            scope.mandateId = routeParams.mandateId;
            scope.command = routeParams.command;
            scope.formData = {};
            scope.showDoc = false;
            scope.showBankDetails = false ;
            if(scope.command === 'CREATE'){
                scope.isCreate = true;
            }else if(scope.command === 'UPDATE'){
                scope.isUpdate = true;
            }else if(scope.command === 'CANCEL'){
                scope.isCancel = true;
            }else if(scope.command === 'EDIT'){
                scope.isEdit = true;
            }

            if(scope.isCreate){
                resourceFactory.mandateTemplateResource.getCreateTemplate({loanId:scope.loanId}, function (data) {
                    scope.populate(data);
                    if(data.bankAccountDetails) {
                        scope.showBankDetails = true ;
                    }
                });
            }else if(scope.isUpdate){
                resourceFactory.mandateTemplateResource.getUpdateTemplate({loanId:scope.loanId}, function (data) {
                    scope.populate(data);
                });
            }else if(scope.isCancel){
                resourceFactory.mandateTemplateResource.getCancelTemplate({loanId:scope.loanId}, function (data) {
                    scope.populate(data);
                });
            }else if(scope.isEdit){
                resourceFactory.mandateResource.getOne({loanId:scope.loanId, mandateId: scope.mandateId}, function (data) {
                    scope.populate(data);
                });
            }

            scope.populateBankDetails = function() {
                scope.formData.bankAccountHolderName = scope.mandate.bankAccountDetails.name || '';
                scope.formData.bankName = scope.mandate.bankAccountDetails.bankName || '';
                scope.formData.branchName = scope.mandate.bankAccountDetails.branchName || '';
                scope.formData.bankAccountNumber = scope.mandate.bankAccountDetails.accountNumber || '';
                scope.formData.micr = scope.mandate.bankAccountDetails.micrCode || '';
                scope.formData.ifsc = scope.mandate.bankAccountDetails.ifscCode || '';
                scope.formData.accountType = scope.mandate.bankAccountDetails.accountType.id;
            }

            scope.populate = function(data){
                scope.mandate = data;
                scope.accountTypeOptions = data.accountTypeOptions;
                scope.debitTypeOptions = data.debitTypeOptions;
                scope.debitFrequencyOptions = data.debitFrequencyOptions;
                scope.scannedDocumentOptions = data.scannedDocumentOptions;

                scope.formData.requestDate = data.requestDate? new Date(data.requestDate): '';
                scope.formData.periodFromDate = data.periodFromDate? new Date(data.periodFromDate):'';
                scope.formData.periodToDate = data.periodToDate? new Date(data.periodToDate):'';
                scope.formData.umrn = data.umrn || '';
                scope.formData.bankAccountHolderName = data.bankAccountHolderName || '';
                scope.formData.bankName = data.bankName || '';
                scope.formData.branchName = data.branchName || '';
                scope.formData.bankAccountNumber = data.bankAccountNumber || '';
                scope.formData.micr = data.micr || '';
                scope.formData.ifsc = data.ifsc || '';
                scope.formData.accountType = data.accountType.id;
                scope.formData.periodUntilCancelled = data.periodUntilCancelled || true;
                scope.formData.debitType = data.debitType.id;
                scope.formData.amount = data.amount  || '';
                scope.formData.debitFrequency = data.debitFrequency.id;
                scope.formData.scannedDocumentId = data.scannedDocumentId || '';
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;
            }

            scope.onDocumentChange = function(id){
                var url = $rootScope.hostUrl + API_VERSION + '/loans/'+scope.loanId+'/documents/' + id + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                url = $sce.trustAsResourceUrl(url);

                http.get(url, {responseType: 'arraybuffer'}).
                success(function(data, status, headers, config) {
                    var supportedContentTypes = ['image/jpeg','image/jpg','image/png','image/gif','application/pdf'];
                    var contentType = headers('Content-Type');
                    var file = new Blob([data], {type: contentType});
                    var fileContent = URL.createObjectURL(file);

                    if(supportedContentTypes.indexOf(contentType) > -1){
                        scope.docURL = $sce.trustAsResourceUrl(fileContent);
                        scope.showDoc = true;
                    } else {
                        scope.showDoc = false;
                    }
                });

            }

            scope.submit = function () {
                if(scope.formData.requestDate){
                    scope.formData.requestDate = dateFilter(scope.formData.requestDate,scope.df);
                }
                if(scope.formData.periodFromDate){
                    scope.formData.periodFromDate = dateFilter(scope.formData.periodFromDate,scope.df);
                }
                if(scope.formData.periodToDate){
                    scope.formData.periodToDate = dateFilter(scope.formData.periodToDate,scope.df);
                }
                if(scope.formData.periodUntilCancelled == true){
                    delete scope.formData.periodToDate;
                }else{
                    delete scope.formData.periodUntilCancelled;
                }
                if(scope.isCreate || scope.isUpdate || scope.isCancel){
                    if(scope.isCreate){
                        delete scope.formData.umrn;
                    }
                    resourceFactory.mandateResource.post({loanId:scope.loanId, command:scope.command}, scope.formData, function (data) {
                        location.path('/viewloanaccount/' + scope.loanId);
                    });
                }else{
                    delete scope.formData.umrn;
                    resourceFactory.mandateResource.put({loanId:scope.loanId, mandateId:scope.mandateId}, scope.formData, function (data) {
                        location.path('/viewloanaccount/' + scope.loanId);
                    });
                };
            };
        }
    });
    mifosX.ng.application.controller('MandateController', ['$scope', '$location', 'ResourceFactory','$http', '$routeParams', 'dateFilter', '$rootScope', 'API_VERSION', '$sce',mifosX.controllers.MandateController]).run(function ($log) {
        $log.info("MandateController initialized");
    });
}(mifosX.controllers || {}));