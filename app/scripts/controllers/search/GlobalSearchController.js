(function (module) {
    mifosX.controllers = _.extend(module, {
        GlobalSearchController: function (scope, resourceFactory, location, $modal) {
            scope.formData = {};
            scope.currentScope = "clients";
            scope.groups=false;
            scope.savings=false;
            scope.loanApplication=false;
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.globalSearch.hiddenFields.groups) {
                scope.groups = scope.response.uiDisplayConfigurations.globalSearch.hiddenFields.groups;
             }
             if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.globalSearch.hiddenFields.savings) {
                scope.savings = scope.response.uiDisplayConfigurations.globalSearch.hiddenFields.savings;
             }
             if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.globalSearch.hiddenFields.loanApplication) {
                scope.loanApplication = scope.response.uiDisplayConfigurations.globalSearch.hiddenFields.loanApplication;
             }
            resourceFactory.userTemplateResource.get(function (data) {
                scope.offices = data.allowedOffices;
                scope.availableRoles = data.availableRoles;
            });
            resourceFactory.codeValueByCodeNameResources.get({ codeName: 'Customer Identifier' }, function (codeValueData) {
                scope.documentTypeOptions = codeValueData;
            });

            scope.getOfficeStaff = function () {
                resourceFactory.employeeResource.getAllEmployees({ officeId: scope.formData.officeId }, function (data) {
                    scope.staffs = data.pageItems;
                });
            };
            scope.showoffice = true;
            scope.showstaff = true;
            scope.showreferenceno = true;
            scope.showexternalid = true;
            scope.showmobile = true;
            scope.identity = true;
            scope.showname = true;
            scope.showaccountno = true;


            scope.validate = function () {

                scope.submitted = true;
                if (scope.formData.quer == '') {
                    scope.formData.quer = undefined;
                }
                if (scope.formData.externalId == '') {
                    scope.formData.externalId = undefined;
                }
                if (scope.formData.refno == '') {
                    scope.formData.refno = undefined;
                }
                if (scope.formData.mobileNo == '') {
                    scope.formData.mobileNo = undefined;
                }
                if (scope.formData.accountno == '') {
                    scope.formData.accountno = undefined;
                }
                if (scope.formData.identityNumber == '') {
                    scope.formData.identityNumber = undefined;
                }
                if (scope.formData.quer == undefined && scope.formData.externalId == undefined && scope.formData.refno == undefined && scope.formData.mobileNo == undefined && scope.formData.accountno == undefined && scope.formData.identityNumber == undefined) {
                    scope.minsearchfield = true;
                }else {
                    scope.minsearchfield = false;
                    scope.search();
                }
            };


            scope.search = function () {
                var resource;
                var searchString = scope.formData.quer;
                if (searchString != null) {
                    searchString = searchString.replace(/(^"|"$)/g, '');
                }
                location.path('/search/' + searchString).search({ resource: scope.currentScope, officeId: scope.formData.officeId, referenceNumber: scope.formData.refno, externalId: scope.formData.externalId, mobileNo: scope.formData.mobileNo, staffId: scope.formData.staffId, accountNo : scope.formData.accountno,identityId: scope.formData.identityId, identityNumber: scope.formData.identityNumber });
                scope.modalInstance.dismiss('');
            };

            scope.isValidForm = function () {
                if (scope.minsearchfield && scope.formData.quer == undefined && scope.formData.externalId == undefined && scope.formData.refno == undefined && scope.formData.accountno == undefined && scope.formData.identityNumber == undefined && scope.formData.mobileNo == undefined) {
                    return true;
                }
                return false;
            };

            scope.searchnew = function (searchScope) {
                scope.selectedsearch = searchScope;
                scope.currentScope = searchScope;
                scope.formData = {} ;

                if (scope.selectedsearch == "groups" || scope.selectedsearch == "centers") {
                    scope.showoffice = true;
                    scope.showstaff = true;
                    scope.showreferenceno = true;
                    scope.showexternalid = true;
                    scope.showmobile = false;
                    scope.identity = false;
                    scope.showname = true;
                    scope.showaccountno = true;

                }
                if (scope.selectedsearch == "savings" || scope.selectedsearch == "loans") {
                    scope.showoffice = true;
                    scope.showstaff = true;
                    scope.showreferenceno = false;
                    scope.showexternalid = true;
                    scope.showmobile = false;
                    scope.identity = false;
                    scope.showname = false;
                    scope.showaccountno = true;
                }
                if (scope.selectedsearch == "clients") {
                    scope.showoffice = true;
                    scope.showstaff = true;
                    scope.showreferenceno = true;
                    scope.showexternalid = true;
                    scope.showmobile = true;
                    scope.identity = true;
                    scope.showname = true;
                    scope.showaccountno = true;
                }

                if (scope.selectedsearch == "loanapplications") {
                    scope.showoffice = true;
                    scope.showstaff = true;
                    scope.showreferenceno = true;
                    scope.showexternalid = true;
                    scope.showmobile = false;
                    scope.identity = false;
                    scope.showname = false;
                    scope.showaccountno = false;
                }


            };
        }
    });
    mifosX.ng.application.controller('GlobalSearchController', ['$scope', 'ResourceFactory', '$location', '$modal', mifosX.controllers.GlobalSearchController]).run(function ($log) {
        $log.info("GlobalSearchController initialized");
    });
}(mifosX.controllers || {}));
