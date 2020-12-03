(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateUserCommonController: function (scope, resourceFactory, location, dateFilter) {
            scope.offices = [];
            scope.available = [];
            scope.selected = [];
            scope.selectedRoles = [] ;
            scope.availableRoles = [];
            scope.formData = {
                sendPasswordToEmail: true,
                isActive: true,
                roles: []
            };
            scope.isExternalIdRequired = false;
            scope.isExternalIdMandatory = true; 
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.user) {
                scope.isExternalIdMandatory = scope.response.uiDisplayConfigurations.user.isMandatory.externalId; 
            }
            resourceFactory.userTemplateResource.get(function (data) {
                scope.offices = data.allowedOffices;
                scope.availableRoles = data.availableRoles;
            });

            scope.addRole = function () {
                for (var i in this.available) {
                    for (var j in scope.availableRoles) {
                        if (scope.availableRoles[j].id == this.available[i]) {
                            var temp = {};
                            temp.id = this.available[i];
                            temp.name = scope.availableRoles[j].name;
                            scope.selectedRoles.push(temp);
                            scope.availableRoles.splice(j, 1);
                        }
                    }
                }
                //We need to remove selected items outside of above loop. If we don't remove, we can see empty item appearing
                //If we remove available items in above loop, all items will not be moved to selectedRoles
                for (var i in this.available) {
                    for (var j in scope.selectedRoles) {
                        if (scope.selectedRoles[j].id == this.available[i]) {
                            scope.available.splice(i, 1);
                        }
                    }
                }
            };
            scope.removeRole = function () {
                for (var i in this.selected) {
                    for (var j in scope.selectedRoles) {
                        if (scope.selectedRoles[j].id == this.selected[i]) {
                            var temp = {};
                            temp.id = this.selected[i];
                            temp.name = scope.selectedRoles[j].name;
                            scope.availableRoles.push(temp);
                            scope.selectedRoles.splice(j, 1);
                        }
                    }
                }
                //We need to remove selected items outside of above loop. If we don't remove, we can see empty item appearing
                //If we remove selected items in above loop, all items will not be moved to availableRoles
                for (var i in this.selected) {
                    for (var j in scope.availableRoles) {
                        if (scope.availableRoles[j].id == this.selected[i]) {
                            scope.selected.splice(i, 1);
                        }
                    }
                }
            };

            scope.getOfficeStaff = function(){
                resourceFactory.employeeResource.getAllEmployees({officeId:scope.formData.officeId},function (data) {
                    scope.staffs = data.pageItems;
                });
            };

            scope.submit = function () {
                for (var i in scope.selectedRoles) {
                    scope.formData.roles.push(scope.selectedRoles[i].id) ;
                }
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;
                if (scope.formData.joiningDate) {
                    scope.formData.joiningDate = dateFilter(scope.formData.joiningDate, scope.df);
                }
                scope.isExternalIdRequired = scope.isExternalIdMandatory ? ((scope.formData.externalId == undefined || scope.formData.externalId.length==0 ) && scope.formData.staffId == undefined) : false;
                if(scope.isExternalIdRequired) {
                    return;
                }
                resourceFactory.userListResource.save(this.formData, function (data) {
                    scope.$emit("submitPerformed", data);
                });
            };

            scope.cancel = function(){
                scope.$emit("cancelPerformed", {});
            };

            scope.resetExternalId = function () {
                if(scope.formData.staffId== null)
                {
                    scope.isStaffSelected = false;
                    
                }
                else{
                    scope.isStaffSelected = true ;
                    scope.formData.externalId = undefined;
                }
                if(scope.formData.staffId == null)
                {
                    scope.formData.staffId = undefined;
                }

            };
        }
    });
    mifosX.ng.application.controller('CreateUserCommonController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', mifosX.controllers.CreateUserCommonController]).run(function ($log) {
        $log.info("CreateUserCommonController initialized");
    });
}(mifosX.controllers || {}));
