(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateGroupBankAccountController: function (scope, routeParams, resourceFactory, location, route) {
            scope.formData = {};
            scope.repeatFormData = {};
            scope.bankAccountTypeOptions = [];
            scope.fileError=false;
            scope.loanPurposes = [];
            scope.groupData = {};
            scope.groupId = routeParams.groupId;
            scope.isEdit = false;
            scope.allowBankAccountForGroups = scope.isSystemGlobalConfigurationEnabled('allow-bank-account-for-groups');

            function populateDetails(){
               resourceFactory.groupBankAccountResourceTemplate.get({
                    groupId: scope.groupId
                }, function(data) {
                    scope.groupData = data.groupData;
                    scope.bankAccountTypeOptions = data.bankAccountTypeOptions;
                    scope.loanPurposes = data.loanPurposeOptions;
                });
            };

            populateDetails();

            function isFormValid(){
                if(scope.formData.ifscCode != scope.repeatFormData.ifscCodeRepeat){
                    return false;
                }
                else if(scope.formData.accountNumber != scope.repeatFormData.accountNumberRepeat){
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

            scope.cancel = function(){
                location.path('/groups/'+scope.groupId+'/bankaccountdetails');
            };
        }
    });
    mifosX.ng.application.controller('CreateGroupBankAccountController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.CreateGroupBankAccountController]).run(function ($log) {
        $log.info("CreateGroupBankAccountController initialized");
    });
}(mifosX.controllers || {}));
