(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewGroupBankAccountController: function (scope, routeParams, resourceFactory, location, route) {
            scope.formData = {};
            scope.repeatFormData = {};
            scope.bankAccountTypeOptions = [];
            scope.bankAccountDetails ={};
            scope.fileError=false;
            scope.loanPurposes = [];
            scope.groupData = {};
            scope.groupId = routeParams.groupId;
            scope.allowBankAccountForGroups = scope.isSystemGlobalConfigurationEnabled('allow-bank-account-for-groups');
            scope.bankAccountDetailAssociationId = routeParams.groupBankAccountDetailAssociationId;
            scope.approved = false;
            scope.isEdit = false;

            function populateDetails(){
               resourceFactory.groupBankAccountDetailsResource.get({
                    groupId: scope.groupId, bankAccountDetailAssociationId:scope.bankAccountDetailAssociationId
                }, function(data) {
                    scope.groupData = data.groupData;
                    scope.bankAccountData = data.bankAccountDetails;
                    if(scope.bankAccountData.status.id==200){
                            scope.approved=true;
                    }
                    scope.purpose = data.loanPurpose;
                    scope.purposeId = data.loanPurposeId;
                    scope.bankAccountTypeOptions = data.bankAccountTypeOptions;
                    scope.loanPurposes = data.loanPurposeOptions;
                });
            };

            function init() {
                populateDetails();
            };

            init();

            function isFormValid(){
                if(scope.formData.ifscCode != scope.repeatFormData.ifscCodeRepeat){
                    return false;
                } else if(scope.formData.accountNumber != scope.repeatFormData.accountNumberRepeat){
                    return false;
                }
                return true;
            };

            scope.submit = function () {
                if(!isFormValid()){
                    return false;
                }
                scope.formData.locale=scope.optlang.code;
                resourceFactory.groupBankAccountResource.create({groupId: scope.groupId}, scope.formData,
                    function (data) {
                         location.path('/groups/'+scope.groupId+'/bankaccountdetails');
                    });
            };


            scope.editable = function(){
               return !scope.approved;
            };

            scope.approvable = function(){
                return !scope.approved;
            };

            scope.deletable = function(){
                return scope.approved;
            };

            scope.edit = function(){
               	scope.isEdit = true;
                scope.formData = scope.bankAccountData;
                scope.formData.status = scope.bankAccountData.status
                scope.formData.accountTypeId =  scope.bankAccountData.accountType.id;
                scope.formData.purposeId = scope.purposeId; 
                scope.repeatFormData = {
                    accountNumberRepeat: scope.formData.accountNumber,
                    ifscCodeRepeat: scope.formData.ifscCode
                };
            };

             scope.delete = function () {
                resourceFactory.groupBankAccountDetailsResource.delete({groupId: scope.groupId, bankAccountDetailAssociationId:scope.bankAccountDetailAssociationId}, function (data) {
                    location.path('/groups/'+scope.groupId+'/bankaccountdetails');
                });
            };

            scope.activate = function () {
                resourceFactory.groupBankAccountDetailActivateResource.activate({groupId: scope.groupId, bankAccountDetailAssociationId:scope.bankAccountDetailAssociationId},
                    function (data) {
                        populateDetails();
                    }
                );
            };

            function isFormValid(){
                if(scope.formData.ifscCode != scope.repeatFormData.ifscCodeRepeat){
                    return false;
                }
              
                if(scope.formData.accountNumber != scope.repeatFormData.accountNumberRepeat){
                    return false;
                }
                return true;
            };

            scope.update = function () {
            	if(!isFormValid()){
                    return false;
                }
                
                delete scope.formData.id;
                delete scope.formData.status;
                delete scope.formData.accountType;
                scope.formData.locale=scope.optlang.code;
                resourceFactory.groupBankAccountDetailsResource.update({groupId: scope.groupId, bankAccountDetailAssociationId:scope.bankAccountDetailAssociationId},scope.formData,
                    function (data) {
                    	scope.isEdit = false;
                        populateDetails();
                    }
                );
            };

            scope.cancel = function(){
                location.path('/groups/'+scope.groupId+'/bankaccountdetails');
            };
        }
    });
    mifosX.ng.application.controller('ViewGroupBankAccountController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.ViewGroupBankAccountController]).run(function ($log) {
        $log.info("ViewGroupBankAccountController initialized");
    });
}(mifosX.controllers || {}));
