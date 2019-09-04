(function (module) {
    mifosX.controllers = _.extend(module, {
        AccountingClosureController: function (scope, resourceFactory, location, translate, routeParams, dateFilter, $rootScope, paginatorService, route) {
            scope.first = {};
            scope.formData = {};
            scope.first.date = new Date();
            scope.accountClosures = [];
            scope.restrictDate = new Date();
            scope.isTreeView = false;
            var idToNodeMap = {};
            scope.showclosure = true;
            scope.getFetchData = true;
            scope.tempOfficeId = {};
            var params = {}
            scope.showClosure = false;
            scope.accountClosurePerPage = 10;
            scope.limitToOne = false;
            var officeIdArray = [];
            scope.isBulkCreate = false;

            if (routeParams.officeId != undefined) {
                params.officeId = routeParams.officeId;
            }
            resourceFactory.officeResource.getAllOffices({onlyActive:true}, function (data) {
                scope.offices = data;
                for (var i in data) {
                    data[i].children = [];
                    idToNodeMap[data[i].id] = data[i];
                }
                function sortByParentId(a, b) {
                    return a.parentId - b.parentId;
                }

                data.sort(sortByParentId);

                var root = [];
                for (var i = 0; i < data.length; i++) {
                    var currentObj = data[i];
                    if (currentObj.children) {
                        currentObj.collapsed = "true";
                    }
                    if (currentObj.id === data[0].id) {
                        root.push(currentObj);
                    } else {
                        if(!(typeof idToNodeMap[currentObj.parentId] === "undefined")) {
                            parentNode = idToNodeMap[currentObj.parentId];
                            parentNode.children.push(currentObj);
                        }
                    }
                }
                scope.treedata = root;
            });

            scope.routeTo = function (id) {
                location.path('/view_close_accounting/' + id);
            };

            scope.submit = function () {
                var reqDate = dateFilter(scope.first.date, scope.df);
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.closingDate = reqDate;
                if(scope.isBulkCreate){
                    this.formData.officeIds = officeIdArray;
                    resourceFactory.accountingBulkClosureResource.save(this.formData, function (data) {
                        location.path('/accounts_closure');
                    });
                }else{                    
                    resourceFactory.accountingClosureResource.save(this.formData, function (data) {
                        location.path('/view_close_accounting/' + data.resourceId);
                    });
                }
                

                
            }
            
            scope.updateLastClosed = function (officeId) {
                resourceFactory.accountingClosureByOfficeResource.getView({officeId: officeId, limitToOne: false}, function (data) {
                    scope.accountClosures = data;
                    scope.lastClosed = undefined;
                    if (data) {
                        scope.lastClosed = data.closingDate;
                    }
                });
            }

            scope.fetchFunction = function (offset, limit, callback) {
                var params = {};
                params.offset = offset;
                params.limit = limit;
                params.paged ='true';
                params.orderBy = 'name';
                params.officeId = scope.formData.officeId;
                params.limitToOne = scope.limitToOne;
                params.sortOrder = 'ASC';
                resourceFactory.accountingClosureResource.getView(params, callback);
            }

            scope.resetoffice = function(){
                scope.error = false;
                scope.formData.officeId = '';
                route.reload();

            }

            scope.closedAccountingDetails = function (limitToOne) {
                if( scope.formData.officeId) {
                    scope.error = false;

                scope.limitToOne = limitToOne;
                scope.accountClosures = paginatorService.paginate(scope.fetchFunction, scope.accountClosurePerPage);
                }

                else {
                    scope.error = true;
                }
            }

            scope.fetchData = function (officeId) {
                scope.error = false;
                scope.limitToOne = scope.formData.limitToOne;
                scope.formData.officeId = officeId;
                scope.accountClosures = paginatorService.paginate(scope.fetchFunction, scope.accountClosurePerPage);
                if( scope.accountClosures) {
                    scope.showClosure = true;
                }else{
                        scope.showClosure = false;
                }
            }

            scope.holidayApplyToOffice = function (node) {
                if (node.selectedCheckBox === 'true') {
                    recurHolidayApplyToOffice(node);
                    officeIdArray = _.uniq(officeIdArray);
                } else {
                    node.selectedCheckBox = 'false';
                    recurRemoveHolidayAppliedOOffice(node);

                }
            };

            function recurHolidayApplyToOffice(node) {
                node.selectedCheckBox = 'true';
                officeIdArray.push(node.id);
                if (node.children.length > 0) {
                    for (var i = 0; i < node.children.length; i++) {
                        node.children[i].selectedCheckBox = 'true';
                        officeIdArray.push(node.children[i].id);
                        if (node.children[i].children.length > 0) {
                            recurHolidayApplyToOffice(node.children[i]);
                        }
                    }
                }
            }

            function recurRemoveHolidayAppliedOOffice(node) {
                officeIdArray = _.without(officeIdArray, node.id);
                if (node.children.length > 0) {
                    for (var i = 0; i < node.children.length; i++) {
                        node.children[i].selectedCheckBox = 'false';
                        officeIdArray = _.without(officeIdArray, node.children[i].id);
                        if (node.children[i].children.length > 0) {
                            recurRemoveHolidayAppliedOOffice(node.children[i]);
                        }
                    }
                }
            }



        }
    });
    mifosX.ng.application.controller('AccountingClosureController', ['$scope', 'ResourceFactory', '$location', '$translate', '$routeParams', 'dateFilter', '$rootScope', 'PaginatorService', mifosX.controllers.AccountingClosureController]).run(function ($log) {
        $log.info("AccountingClosureController initialized");
    });
}(mifosX.controllers || {}));
