(function (module) {
    mifosX.controllers = _.extend(module, {
        EditUserController: function (scope, routeParams, resourceFactory, location, dateFilter) {

            scope.formData = {};
            scope.offices = [];
            scope.available = [];
            scope.selected = [];
            scope.selectedRoles = [] ;
            scope.availableRoles = [];

            scope.user = [];
            scope.formData.roles = [] ;

            scope.isExternalIdRequired = false;
            scope.isExternalIdReadOnly = true; 
            scope.isExternalIdMandatory = false;
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.user) {
                if(scope.response.uiDisplayConfigurations.user.isReadOnlyField){
                    scope.isExternalIdReadOnly = scope.response.uiDisplayConfigurations.user.isReadOnlyField.externalId; 
                }
                if(scope.response.uiDisplayConfigurations.user.isMandatory){
                    scope.isExternalIdMandatory = scope.response.uiDisplayConfigurations.user.isMandatory.externalId;  
                }
            }

            resourceFactory.userListResource.get({userId: routeParams.id, template: 'true'}, function (data) {
                scope.formData.username = data.username;
                scope.formData.firstname = data.firstname;
                scope.formData.lastname = data.lastname;
                scope.formData.email = data.email;
                scope.formData.officeId = data.officeId;
                scope.getOfficeStaff();
                if(data.staff){
                    scope.staffName = data.staff.displayName;
                    scope.formData.isLoanOfficer = data.staff.isLoanOfficer;
                    scope.formData.mobileNo = data.staff.mobileNo;
                    scope.formData.isActive = data.staff.isActive;
                    scope.formData.externalId = data.staff.externalId;
                    if (data.staff.joiningDate) {
                        var editDate = dateFilter(data.staff.joiningDate, scope.df);
                        scope.formData.joiningDate = new Date(editDate);
                    }
                }
                scope.selectedRoles=data.selectedRoles;
                scope.availableRoles = data.availableRoles ;


                scope.userId = data.id;
                scope.offices = data.allowedOffices;
                //scope.availableRoles = data.availableRoles.concat(data.selectedRoles);
                scope.formData.passwordNeverExpires = data.passwordNeverExpires;
            });
            scope.getOfficeStaff = function(){
                resourceFactory.employeeResource.getAllEmployees({officeId:scope.formData.officeId},function (staffs) {
                    scope.staffs = staffs.pageItems;
                });
            };

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

            scope.submit = function () {
                for (var i in scope.selectedRoles) {
                    scope.formData.roles.push(scope.selectedRoles[i].id) ;
                }
                scope.isExternalIdRequired = scope.isExternalIdMandatory && !scope.staffName ? (scope.formData.externalId == undefined || scope.formData.externalId.length==0 ) : false;
                if(scope.isExternalIdRequired) {
                    return;
                }
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;
                if (scope.formData.joiningDate) {
                    scope.formData.joiningDate = dateFilter(scope.formData.joiningDate, scope.df);
                }
                resourceFactory.userListResource.update({'userId': scope.userId}, this.formData, function (data) {
                    location.path('/viewuser/' + data.resourceId);
                });
            };
        }
    });
    mifosX.ng.application.controller('EditUserController', ['$scope', '$routeParams', 'ResourceFactory', '$location', 'dateFilter', mifosX.controllers.EditUserController]).run(function ($log) {
        $log.info("EditUserController initialized");
    });
}(mifosX.controllers || {}));
