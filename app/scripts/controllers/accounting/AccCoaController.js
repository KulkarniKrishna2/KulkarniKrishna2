(function (module) {
    mifosX.controllers = _.extend(module, {
        AccCoaController: function (scope,$rootScope, translate, resourceFactory, location) {
			
			$rootScope.tempNodeID = -100; // variable used to store nodeID (from directive), so it(nodeID) is available for detail-table
			
            scope.coadata = [];
            scope.isTreeView = false;
            scope.accountsPerPage = 100;

            resourceFactory.codeValueByCodeNameResources.get({codeName: 'company code for gl accounts',searchConditions:'{"codeValueIsActive":true}'}, function (data) {
                scope.companyCodeForGlaccountCodeValues = data;
            });
            
            resourceFactory.accountCoaTemplateResource.get({type: '0'}, function (data) {
                scope.accountData = data;
                scope.glClassifications = data.glClassificationTypeOptions;
                scope.accountTypes = data.accountTypeOptions;
                scope.usageTypes = data.usageOptions;

            });

            scope.searchAccounts = function () {
                var searchParams = {
                    offset: 0,
                    limit: scope.accountsPerPage,
                    isPagination: true,
                    type: scope.accountType,
                    usage: scope.usageType,
                    classificationType: scope.classification,
                    companyCode:scope.companyCode
                };
                if(scope.searchText){
                    var searchString = scope.searchText.replace(/(^"|"$)/g, '');
                    searchParams.searchParam = searchString.trim().replace(" ", "%");
                }
                resourceFactory.accountCoaResource.getAllAccountCoasPage(searchParams, function (data) {
                    scope.totalAccounts = data.totalFilteredRecords;
                    scope.coadatasList = data.pageItems;

                });
            };

            scope.getResultsPage = function (pageNumber) {
                var searchParams = {
                    offset: ((pageNumber - 1) * scope.accountsPerPage),
                    limit: scope.accountsPerPage,
                    isPagination: true,
                    type: scope.accountType,
                    usage: scope.usageType,
                    classificationType: scope.classification
                };
                if(scope.searchText){
                    var searchString = scope.searchText.replace(/(^"|"$)/g, '');
                    searchParams.searchParam = searchString.trim().replace(" ", "%");
                }
                var items = resourceFactory.accountCoaResource.getAllAccountCoasPage(searchParams, function (data) {
                    scope.coadatasList = data.pageItems;

                });
            };

            scope.changeType = function () {
                scope.accountType = scope.formData.type;
            };

            scope.changeUsage = function () {
                scope.usageType = scope.formData.usage;
            };

            scope.changeClassificationType = function () {
                scope.classification = scope.formData.glClassificationType;
            };

            scope.changecompanyCode = function () {
                scope.companyCode = scope.formData.companyCode;
            };

            scope.routeTo = function (id) {
                location.path('/viewglaccount/' + id);
            };

            if (!scope.searchCriteria.acoa) {
                scope.searchCriteria.acoa = null;
                scope.saveSC();
            }
            scope.filterText = scope.searchCriteria.acoa;

            scope.onFilter = function () {
                scope.searchCriteria.acoa = scope.filterText;
                scope.saveSC();
            };

            scope.deepCopy = function (obj) {
                if (Object.prototype.toString.call(obj) === '[object Array]') {
                    var out = [], i = 0, len = obj.length;
                    for (; i < len; i++) {
                        out[i] = arguments.callee(obj[i]);
                    }
                    return out;
                }
                if (typeof obj === 'object') {
                    var out = {}, i;
                    for (i in obj) {
                        out[i] = arguments.callee(obj[i]);
                    }
                    return out;
                }
                return obj;
            };

            scope.treeView = function() {
                resourceFactory.accountCoaResource.getAllAccountCoas(function (data) {
                    scope.coadatas = scope.deepCopy(data);
                    scope.ASSET = translate('ASSET');
                    scope.LIABILITY = translate('LIABILITY');
                    scope.EQUITY = translate('EQUITY');
                    scope.INCOME = translate('INCOME');
                    scope.EXPENSE = translate('EXPENSE');
                    scope.Accounting = translate('Accounting');

                    var assetObject = {id: -1, name: scope.ASSET, parentId: -999, children: []};
                    var liabilitiesObject = {id: -2, name: scope.LIABILITY, parentId: -999, children: []};
                    var equitiyObject = {id: -3, name: scope.EQUITY, parentId: -999, children: []};
                    var incomeObject = {id: -4, name: scope.INCOME, parentId: -999, children: []};
                    var expenseObject = {id: -5, name: scope.EXPENSE, parentId: -999, children: []};
                    var rootObject = {id: -999, name: scope.Accounting, children: []};
                    var rootArray = [rootObject, assetObject, liabilitiesObject, equitiyObject, incomeObject, expenseObject];

                    var idToNodeMap = {};
                    for (var i in rootArray) {
                        idToNodeMap[rootArray[i].id] = rootArray[i];
                    }

                    for (i = 0; i < data.length; i++) {
                        if (data[i].type.value == "ASSET") {
                            if (data[i].parentId == null)  data[i].parentId = -1;
                        } else if (data[i].type.value == "LIABILITY") {
                            if (data[i].parentId == null)  data[i].parentId = -2;
                        } else if (data[i].type.value == "EQUITY") {
                            if (data[i].parentId == null)  data[i].parentId = -3;
                        } else if (data[i].type.value == "INCOME") {
                            if (data[i].parentId == null)  data[i].parentId = -4;
                        } else if (data[i].type.value == "EXPENSE") {
                            if (data[i].parentId == null)  data[i].parentId = -5;
                        }
                        delete data[i].disabled;
                        delete data[i].manualEntriesAllowed;
                        delete data[i].type;
                        delete data[i].usage;
                        delete data[i].description;
                        delete data[i].nameDecorated;
                        delete data[i].tagId;
                        data[i].children = [];
                        idToNodeMap[data[i].id] = data[i];
                    }

                    function sortByParentId(a, b) {
                        return a.parentId - b.parentId;
                    }

                    function sortGlCode(a, b) {
                        if (a.glCode < b.glCode) {
                            return -1;
                        }
                        if (a.glCode > b.glCode) {
                            return 1;
                        }
                        return 0;
                    }

                    data.sort(sortByParentId);
                    var glAccountsArray = rootArray.concat(data);

                    var root = [];
                    for (var i = 0; i < glAccountsArray.length; i++) {
                        var currentObj = glAccountsArray[i];
                        if (typeof currentObj.parentId === "undefined") {
                            root.push(currentObj);
                        } else {
                            parentNode = idToNodeMap[currentObj.parentId];
                            parentNode.children.push(currentObj);
                            currentObj.collapsed = "true";
                            parentNode.children.sort(sortGlCode);
                        }
                    }
                    scope.treedata = root;
                });
            }
			
        }
    });
    mifosX.ng.application.controller('AccCoaController', ['$scope','$rootScope', '$translate', 'ResourceFactory', '$location', mifosX.controllers.AccCoaController]).run(function ($log) {
        $log.info("AccCoaController initialized");
    });
}(mifosX.controllers || {}));
