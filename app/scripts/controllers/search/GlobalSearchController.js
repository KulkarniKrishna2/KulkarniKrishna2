(function (module) {
    mifosX.controllers = _.extend(module, {
        GlobalSearchController: function (scope, resourceFactory, location, $modal) {
            scope.formData = {};
            scope.currentScope = "clients";
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
                if (scope.search.quer == '') {
                    scope.search.quer = undefined;
                }
                if (scope.search.externalId == '') {
                    scope.search.externalId = undefined;
                }
                if (scope.search.refno == '') {
                    scope.search.refno = undefined;
                }
                if (scope.search.mobileNo == '') {
                    scope.search.mobileNo = undefined;
                }
                if (scope.search.accountno == '') {
                    scope.search.accountno = undefined;
                }
                if (scope.search.quer == undefined && scope.search.externalId == undefined && scope.search.refno == undefined && scope.search.mobileNo == undefined && scope.search.accountno == undefined && scope.formData.identityId == undefined) {
                    scope.minsearchfield = true;
                }else {
                    scope.minsearchfield = false;
                    scope.search();
                }
            };


            scope.search = function () {
                var resource;
                var searchString = scope.search.quer;
                var refnum = scope.search.refno;
                if (searchString != null) {
                    searchString = searchString.replace(/(^"|"$)/g, '');
                }
                location.path('/search/' + searchString).search({ resource: scope.currentScope, officeId: scope.formData.officeId, referenceNumber: refnum, externalId: scope.search.externalId, mobileNo: scope.search.mobileNo, staffId: scope.formData.staffId, accountNo : scope.search.accountno,identityId: scope.formData.identityId, identityNumber: scope.search.identityNumber });
                scope.modalInstance.dismiss('');
            };

            scope.isValidForm = function () {
                if (scope.minsearchfield && scope.search.quer == undefined && scope.search.externalId == undefined && scope.search.refno == undefined && scope.search.accountno == undefined && scope.formData.identityId == undefined && scope.search.mobileNo == undefined) {
                    return true;
                }
                return false;
            };

            scope.searchnew = function (searchScope) {
                scope.selectedsearch = searchScope;
                scope.currentScope = searchScope;

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
