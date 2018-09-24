(function (module) {
    mifosX.controllers = _.extend(module, {
        AssignTaskController: function (scope, resourceFactory, location, routeParams) {
        	scope.formData = {};
            scope.assignData = {};
            scope.enableSearchButtoun = true;
        	resourceFactory.officeResource.getAllOffices({}, function(data) {
        		scope.offices = data;
        	});
        	scope.getCenters = function(officeId){
        		resourceFactory.centerResource.getAllCenters({officeId: officeId},function(data){
        			scope.centers = data.pageItems;
        		});
        	} 
        	scope.getUsers = function(){
        		resourceFactory.userResource.getAllUsers({},function(data){
        			scope.users = data;
        		});
        	}
            scope.getSameRoleUsers = function(){
                scope.enableSearchButtoun = false;
                resourceFactory.sameRoleUserResource.getAllUsers({userId:scope.formData.userId},function(data){
                    scope.assignUsers = data;
                });
            }
            scope.getAllTasks = function(){
                resourceFactory.assignTaskResource.getAllTasks({officeId:scope.formData.officeId,centerId:scope.formData.centerId,userId:scope.formData.userId},function(data){
                    scope.assignTaskList = data;
                });
            }
            scope.assignTask = function(){
                scope.errorDetails = [];
                scope.assignData.fromUserId = this.formData.userId;
                scope.assignData.taskList = [];
                angular.forEach(scope.assignTaskList, function(itm){
                    if(itm.selected == true){
                        scope.assignData.taskList.push(itm.taskId);
                    }
                });
                if(_.isUndefined(scope.assignData.toUserId) || scope.assignData.toUserId == null){
                    return scope.errorDetails.push([{code: 'error.msg.select.assign.to'}])
                }
                if(scope.assignData.taskList.length>0){
                    resourceFactory.taskListResource.update({command:"reassign"}, scope.assignData,function (data) {
                        location.path('/tasklist');
                    });
                }else{
                    return scope.errorDetails.push([{code: 'error.msg.select.atleast.one.task'}])
                }

            }
            scope.toggleAll = function() {
                var toggleStatus = scope.formData.isAllSelected;
                angular.forEach(scope.assignTaskList, function(itm){ itm.selected = toggleStatus; });
            }
            scope.taskToggled = function(){
                 scope.formData.isAllSelected = scope.assignTaskList.every(function(itm){ return itm.selected; })
            }
            scope.cancel = function(){
                location.path('/tasklist');
            }
   
        }
    });
    mifosX.ng.application.controller('AssignTaskController', ['$scope', 'ResourceFactory','$location', '$routeParams', mifosX.controllers.AssignTaskController]).run(function ($log) {
        $log.info("AssignTaskController initialized");
    });
}(mifosX.controllers || {}));