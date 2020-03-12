(function (module) {
    mifosX.controllers = _.extend(module, {
        ReviewBankAccountCommonController: function ($controller, scope, routeParams, resourceFactory, location, $modal, route, $window, dateFilter,$upload,$rootScope,API_VERSION,$http,commonUtilService) {
            angular.extend(this, $controller('defaultUIConfigController', {$scope: scope,$key:"bankAccountDetails"}));
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));

            scope.viewConfig = {
                showSummary:false,
                hasData:false
            };
            scope.formData = {};
            scope.bankAccountData = {};
            scope.docData = {};
            scope.repeatFormData = {};
            scope.bankAccountTypeOptions = [];
            scope.deFaultBankName = null;
            scope.bankAccountDocuments= [];
            scope.clientBankAccountDetailAssociationId = routeParams.clientBankAccountDetailAssociationId;
            scope.isMakerTwoStepPresent = false;
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.bankAccountDetails.isMakerTwoStepPresent) {
                scope.isMakerTwoStepPresent = scope.response.uiDisplayConfigurations.bankAccountDetails.isMakerTwoStepPresent;
            }

            function getEntityType(){
               return scope.commonConfig.bankAccount.entityType;
            }

            function getEntityId(){
                return scope.commonConfig.bankAccount.entityId;
            }

            function getClientBankAccountDetailAssociationId() {
                if (!_.isUndefined(scope.clientBankAccountDetailAssociationId)) {
                    return scope.clientBankAccountDetailAssociationId;
                } else {
                    resourceFactory.bankAccountDetailResource.getAll({
                        entityType: scope.entityType,
                        entityId: scope.entityId
                    }, function(data) {
                        if (!_.isUndefined(data[0])) {
                            scope.clientBankAccountDetailAssociationId = data[0].bankAccountAssociationId;
                            populateDetails();
                        }
                    });
                    return scope.clientBankAccountDetailAssociationId;
                }
            }

            function populateDetails(){
                resourceFactory.bankAccountDetailResource.get({entityType: getEntityType(),entityId: getEntityId(), clientBankAccountDetailAssociationId: getClientBankAccountDetailAssociationId()}, function (data) {
                    scope.externalservices = data.externalServiceOptions;
                    scope.bankAccountTypeOptions = data.bankAccountTypeOptions;
                    scope.bankAccountData = data;
                    if(scope.bankAccountData.status.id == 200){
                        scope.viewConfig.showSummary= true;
                    }
                    if(data.checkerInfo!=undefined){
                        scope.checkerBankAccountData = JSON.parse(data.checkerInfo);
                        if(scope.checkerBankAccountData.accountType){
                            scope.formData.accountTypeId = scope.checkerBankAccountData.accountType.id;
                        }else{
                            scope.formData.accountTypeId = scope.bankAccountTypeOptions[0].id;
                        }
                        scope.repeatFormData = {
                            accountNumberRepeat:  scope.checkerBankAccountData.accountNumber,
                            ifscCodeRepeat:  scope.checkerBankAccountData.ifscCode
                        };
                        if(scope.checkerBankAccountData.accountNumber !=undefined) {
                            scope.viewConfig.hasData = true;
                        }
                    }

                    if(!_.isUndefined(data.bankAccountDocuments) && data.bankAccountDocuments.length > 0){
                        scope.bankAccountDocuments = data.bankAccountDocuments;
                        for (var i = 0; i < scope.bankAccountDocuments.length; i++) {
                            var docs = {};
                            if(scope.bankAccountDocuments[i].storage && scope.bankAccountDocuments[i].storage.toLowerCase()=='s3'){
                                docs = $rootScope.hostUrl + API_VERSION + '/' + getEntityType() + '/' + getEntityId() + '/documents/' + scope.bankAccountDocuments[i].id + '/downloadableURL';
                            }else {
                                docs = $rootScope.hostUrl + API_VERSION + '/' + getEntityType() + '/' + getEntityId() + '/documents/' + scope.bankAccountDocuments[i].id + '/download';
                            }
                            scope.bankAccountDocuments[i].docUrl = docs;
                        }
                        scope.viewDocument(scope.bankAccountDocuments[0]);
                    }

                });
            }

            scope.submit = function () {
                scope.setTaskActionExecutionError(null);
                if(scope.checkerBankAccountData){
                    if(!isFormValid()){
                      return false;
                    }
                }
                if(scope.errorDetails){
                    delete scope.errorDetails;
                }
                resourceFactory.bankAccountDetailActionResource.doAction({entityType: getEntityType(),entityId: getEntityId(), clientBankAccountDetailAssociationId: getClientBankAccountDetailAssociationId(), command:'activate'},scope.formData,
                    function (data) {
                        scope.viewConfig.showSummary=true;
                        scope.doActionAndRefresh('activitycomplete');
                    }
                );
            };

            function isFormValid(){
                var errorArray = new Array();
                var arrayIndex = 0;
                var isBankDetailsNotMatched = false;
                var isBankAcountHolderNameNotMatched = true;
                if(scope.bankAccountData.name && scope.checkerBankAccountData.name){
                    if(scope.bankAccountData.name.toString().toLowerCase().trim() === scope.checkerBankAccountData.name.toString().toLowerCase().trim()){
                        isBankAcountHolderNameNotMatched = false;
                    }
                }
                if(isBankAcountHolderNameNotMatched){
                    isBankDetailsNotMatched = true;
                    var errorObj = new Object();
                    errorObj.code = 'error.msg.maker.checker.bank.account.holder.name.not.matched';
                    errorArray[arrayIndex] = errorObj;
                    arrayIndex++;
                }

                var isAccountNumberNotMatched = true;
                if(scope.bankAccountData.accountNumber && scope.checkerBankAccountData.accountNumber){
                    if(scope.bankAccountData.accountNumber.toString().toLowerCase().trim() === scope.checkerBankAccountData.accountNumber.toString().toLowerCase().trim()){
                        isAccountNumberNotMatched = false;
                    }
                }
                if(isAccountNumberNotMatched){
                    isBankDetailsNotMatched = true;
                    var errorObj = new Object();
                    errorObj.code = 'error.msg.maker.checker.bank.account.number.not.matched';
                    errorArray[arrayIndex] = errorObj;
                    arrayIndex++;
                }

                var isIfscCodeNotMatched = true;
                if(scope.bankAccountData.ifscCode && scope.checkerBankAccountData.ifscCode){
                    if(scope.bankAccountData.ifscCode.toString().toLowerCase().trim() === scope.checkerBankAccountData.ifscCode.toString().toLowerCase().trim()){
                        isIfscCodeNotMatched = false;
                    }
                }
                if(isIfscCodeNotMatched){
                    isBankDetailsNotMatched = true;
                    var errorObj = new Object();
                    errorObj.code = 'error.msg.maker.checker.bank.account.ifsc.code.not.matched';
                    errorArray[arrayIndex] = errorObj;
                    arrayIndex++;
                }

                /*var isAccountTypeNotMatched = true;
                if(scope.bankAccountData.accountType.code && scope.checkerBankAccountData.accountType.code){
                    if(scope.bankAccountData.accountType.code.toString() === scope.checkerBankAccountData.accountType.code.toString()){
                        isAccountTypeNotMatched = false;
                    }
                }
                if(isAccountTypeNotMatched){
                    isBankDetailsNotMatched = true;
                    errorObj.args.params.push({value: 'error.msg.maker.checker.bank.account.type.not.matched'});
                }

                var isBankNameNotMatched = true;
                if(scope.bankAccountData.bankName && scope.checkerBankAccountData.bankName){
                    if(scope.bankAccountData.bankName.toString() === scope.checkerBankAccountData.bankName.toString()){
                        isBankNameNotMatched = false;
                    }
                }
                if(isBankNameNotMatched){
                    isBankDetailsNotMatched = true;
                    errorObj.args.params.push({value: 'error.msg.maker.checker.bank.name.not.matched'});
                }

                var isBranchNameNotMatched = true;
                if(scope.bankAccountData.branchName && scope.checkerBankAccountData.branchName){
                    if(scope.bankAccountData.branchName.toString() === scope.checkerBankAccountData.branchName.toString()){
                        isBranchNameNotMatched = false;
                    }
                }
                if(isBranchNameNotMatched){
                    isBankDetailsNotMatched = true;
                    errorObj.args.params.push({value: 'error.msg.maker.checker.bank.branch.name.not.matched'});
                }

                var isBankCityNotMatched = true;
                if(scope.bankAccountData.bankCity && scope.checkerBankAccountData.bankCity){
                    if(scope.bankAccountData.bankCity.toString() === scope.checkerBankAccountData.bankCity.toString()){
                        isBankCityNotMatched = false;
                    }
                }
                if(isBankCityNotMatched){
                    isBankDetailsNotMatched = true;
                    errorObj.args.params.push({value: 'error.msg.maker.checker.bank.city.name.not.matched'});
                }*/

                if(isBankDetailsNotMatched){
                    scope.errorDetails = [];
                    scope.errorDetails.push(errorArray);
                    return false;
                }
                return true;
            }

            function init() {
                populateDetails();
            }

            scope.doPreTaskActionStep = function(actionName){
                if(actionName === 'activitycomplete') {
                    if (!scope.viewConfig.showSummary) {
                        scope.setTaskActionExecutionError("error.message.bank.account.details.activity.cannot.complete.before.approve");
                        return;
                    } else {
                        scope.doActionAndRefresh(actionName);
                    }
                }

            };

            init();
            scope.viewDocument = function(document){
                var url = document.docUrl;
                $http({
                    method: 'GET',
                    url: url
                }).then(function (documentImage) {
                    scope.documentImg = documentImage.data;
                });
            }

        }
    });
    mifosX.ng.application.controller('ReviewBankAccountCommonController', ['$controller','$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route','$window','dateFilter','$upload', '$rootScope','API_VERSION', '$http', 'CommonUtilService', mifosX.controllers.ReviewBankAccountCommonController]).run(function ($log) {
        $log.info("ReviewBankAccountCommonController initialized");
    });
}(mifosX.controllers || {}));
