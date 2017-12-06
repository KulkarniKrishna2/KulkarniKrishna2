(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateGroupController: function ($q,scope, resourceFactory, location, dateFilter, routeParams) {
            scope.offices = [];
            scope.staffs = [];
            scope.data = {};
            scope.choice = 0;
            scope.first = {};
            scope.first.submitondate = new Date();
            scope.first.date = new Date();
            scope.restrictDate = new Date();
            scope.addedClients = [];
            scope.available = [];
            scope.added = [];
            scope.formData = {};
            scope.formData.clientMembers = [];
            scope.forceOffice = null;

            var requestParams = {orderBy: 'name', sortOrder: 'ASC', staffInSelectedOfficeOnly: true};
            if (routeParams.centerId) {
                requestParams.centerId = routeParams.centerId;
            }
            resourceFactory.groupTemplateResource.get(requestParams, function (data) {
                scope.offices = data.officeOptions;
                scope.staffs = data.staffOptions;
                scope.clients = data.clientOptions;
                scope.isWorkflowEnabled = data.isWorkflowEnabled;
                if(routeParams.officeId) {
                    scope.formData.officeId = routeParams.officeId;
                    for(var i in data.officeOptions) {
                        if(data.officeOptions[i].id == routeParams.officeId) {
                            scope.forceOffice = data.officeOptions[i];
                            break;
                        }
                    }
                }
                if(routeParams.groupId) {
                    if(typeof data.staffId !== "undefined") {
                        scope.formData.staffId = data.staffId;
                    }
                }
                if(routeParams.staffId) {
                    for(var i in scope.staffs) {
                        if (scope.staffs[i].id == routeParams.staffId) {
                            scope.formData.staffId = scope.staffs[i].id;
                            break;
                        }
                    }
                }
                if(scope.response.uiDisplayConfigurations.createGroup.isAutoPopulate.active){
                    scope.formData.active = true;
                    scope.choice = 1;
                }
                 if(scope.response.uiDisplayConfigurations.createGroup){
                    scope.showGroupExternalId = !scope.response.uiDisplayConfigurations.createGroup.isHiddenMenu.groupExternalId;
                    scope.showSubmittedOn = !scope.response.uiDisplayConfigurations.createGroup.isHiddenMenu.submittedOn;
                    scope.showStaff = !scope.response.uiDisplayConfigurations.createGroup.isHiddenMenu.staff;
                    scope.addclients = !scope.response.uiDisplayConfigurations.createGroup.isHiddenMenu.addclients;
                    
                }

            });

            scope.viewClient = function (item) {
                scope.client = item;
            };

            scope.add = function () {
            	if(scope.available != ""){
            		var temp = {};
                    temp.id = scope.available.id;
                    temp.displayName = scope.available.displayName;
                    var uniqueClient = true;
                    if (scope.addedClients.length > 0) {
                        for (var i = 0; i < scope.addedClients.length; i++) {
                            if (scope.addedClients[i].id == temp.id) {
                                var uniqueClient = false;
                                break;
                            }
                        }
                    }
                    if (uniqueClient) {
                        scope.addedClients.push(temp);
                    }
                }

            };
            scope.sub = function (id) {
            	for (var i = 0; i < scope.addedClients.length; i++) {
                    if (scope.addedClients[i].id == id) {
                        scope.addedClients.splice(i, 1);
                        break;
                    }
                }
            };
            scope.changeOffice = function (officeId) {
                scope.addedClients = [];
                scope.available = [];
                resourceFactory.groupTemplateResource.get({staffInSelectedOfficeOnly: false, officeId: officeId,staffInSelectedOfficeOnly:true
                }, function (data) {
                    scope.staffs = data.staffOptions;
                });
                resourceFactory.groupTemplateResource.get({officeId: officeId}, function (data) {
                    scope.clients = data.clientOptions;
                });
            };
            scope.addClients = function(clientName){
                var deferred = $q.defer();
                resourceFactory.clientResource.getAllClientsWithoutLimit({displayName: clientName, orderBy : 'displayName', officeId : scope.formData.officeId,
                    sortOrder : 'ASC', orphansOnly : true}, function (data) {
                    deferred.resolve(data.pageItems);
                });
                return deferred.promise;
            };
            scope.setChoice = function () {
                if (this.formData.active) {
                    scope.choice = 1;
                }
                else if (!this.formData.active) {
                    scope.choice = 0;
                }
            };

            if(routeParams.centerId) {
            	scope.cancel = '#/viewcenter/' + routeParams.centerId
            	scope.centerid = routeParams.centerId;
        	}else {
        		scope.cancel = "#/groups"
        	}

            scope.submit = function () {
                for (var i in scope.addedClients) {
                    scope.formData.clientMembers[i] = scope.addedClients[i].id;
                }
                if (this.formData.active) {
                    var reqDate = dateFilter(scope.first.date, scope.df);
                    this.formData.activationDate = reqDate;
                }
                if (routeParams.centerId) {
                    this.formData.centerId = routeParams.centerId;
                }
                if (routeParams.officeId) {
                    this.formData.officeId = routeParams.officeId;
                }
                if (scope.first.submitondate) {
                    reqDat = dateFilter(scope.first.submitondate, scope.df);
                    this.formData.submittedOnDate = reqDat;
                }
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.active = this.formData.active || false;
                resourceFactory.groupResource.save(this.formData, function (data) {
                    if(data.changes.isWorkflowCreated === true){
                        location.path('/grouponboarding/' + data.resourceId+'/workflow');
                    }else{
                        location.path('/viewgroup/' + data.resourceId);
                    }
                });
            };
        }
    });
    mifosX.ng.application.controller('CreateGroupController', ['$q','$scope', 'ResourceFactory', '$location', 'dateFilter', '$routeParams', mifosX.controllers.CreateGroupController]).run(function ($log) {
        $log.info("CreateGroupController initialized");
    });
}(mifosX.controllers || {}));
