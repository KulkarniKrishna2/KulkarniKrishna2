(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateTaskController: function (scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION, $upload, $rootScope, dateFilter) {
            
            scope.formData={};
            scope.urlParam = location.search();
            console.log(scope.urlParam);
            function init() 
            {
                resourceFactory.taskAssignTemplateResource.get(function (data) {
                scope.tasks=data.taskConfigTemplateObject;
                scope.users=data.user;
                scope.first={};
                scope.restrictDate = new Date();
                scope.dueTime = new Date();
                scope.first.date = new Date();
                scope.taskCategoryOptions = data.taskCategoryOptions;
                scope.offices = data.officeOptions;
                scope.clientOffices = data.officeOptions;
                scope.formData.clientOfficeId = parseInt(scope.urlParam.officeId);
                scope.onOfficeChange(scope.formData.clientOfficeId);
                });
            }
            
            init();

            scope.onOfficeChange = function(officeId){
                if(_.isUndefined(officeId) || isNaN(officeId)){
                    return ;
                }
                resourceFactory.clientsSearchResource.getAllClients({officeId : officeId,
                    sortOrder : 'ASC', orphansOnly : true},function(data){
                    scope.clients=data;
                    if(scope.urlParam != undefined && scope.urlParam.clientId != undefined){
                       scope.formData.clientId = parseInt(scope.urlParam.clientId); 
                       scope.onClientChange(scope.formData.clientId);
                    }

                });
            }
            scope.onClientChange = function(clientId){
               resourceFactory.clientAccountResource.get({clientId: clientId}, function (data)
                {
                    scope.loans=data.loanAccounts;
                    for(var i in scope.loans){
                            scope.loans[i].loanName = scope.loans[i].productName+'('+scope.loans[i].accountNo+')';
                    }
                    if(scope.urlParam != undefined && scope.urlParam.loanId != undefined){
                        scope.formData.entityId = parseInt(scope.urlParam.loanId);
                    }

                });
            }
            scope.onCategoryChange = function(categoryId){
                scope.tasksbycategory =[];
                for(var i in scope.tasks){
                    if(scope.tasks[i].taskCategoryId == categoryId){
                        scope.tasksbycategory.push(scope.tasks[i]);
                    }
                }
            }
            scope.onUserOfficeChange = function(userOfficeId){
                scope.usersbyoffice =[];
                for(var i in scope.users){
                    if(scope.users[i].officeId == userOfficeId){
                        scope.usersbyoffice.push(scope.users[i]);
                    }
                }
            }

            scope.submit=function() 
            {
                
                scope.first.date.setHours(scope.dueTime.getHours());
                scope.first.date.setMinutes(scope.dueTime.getMinutes());
                scope.first.date.setSeconds(scope.dueTime.getSeconds());
                var reqDate = dateFilter(scope.first.date, 'dd MMMM yyyy HH:mm:ss');
                this.formData.duedate = reqDate;
                this.formData.dateFormat = 'dd MMMM yyyy HH:mm:ss';
                this.formData.locale = scope.optlang.code;
                this.formData.timeFormat='dd MMMM yyyy HH:mm:ss';
                resourceFactory.taskAssignResource.save(this.formData, function (response) {
                    location.path('/tasklist')
                });
            }; 
            scope.showEntityIdAsLoanId = true;
            scope.onChangeTask = function(id){
                scope.showEntityIdAsLoanId = false;
                scope.showEntityIdAsClientId = false;
                scope.showEntityIdAsOfficeId = false;
                for(var i in scope.tasks){
                    if(scope.tasks[i].id == id){
                        if(scope.tasks[i].entity == 'LOAN'){
                            scope.showEntityIdAsLoanId = true;
                            break;
                        }
                        else if(scope.tasks[i].entity == 'CLIENT'){
                            scope.showEntityIdAsClientId = true;
                            break;
                        }
                        else if(scope.tasks[i].entity == 'OFFICE'){
                            scope.showEntityIdAsOfficeId = true;
                            break
                        }else{
                            break;
                        }
                    }
                }
            }
        }
    });
    mifosX.ng.application.controller('CreateTaskController', ['$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope' ,'dateFilter', mifosX.controllers.CreateTaskController]).run(function ($log) {
        $log.info("CreateTaskController initialized");
    });
}(mifosX.controllers || {}));
