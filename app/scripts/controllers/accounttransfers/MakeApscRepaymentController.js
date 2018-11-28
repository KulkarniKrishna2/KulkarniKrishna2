(function (module) {
    mifosX.controllers = _.extend(module, {
    	MakeApscRepaymentController: function (scope, routeParams, resourceFactory, location, route, http, $modal, dateFilter, API_VERSION, $sce, $rootScope) {
    		scope.formData = {};
    		scope.repaymentData = [];
            scope.formData.apscRepaymentDetails = [];
            scope.fromAccountType = 2;
            scope.toAccountType = 1;
            scope.transferDescription = "APSC Repayment";
            scope.transferData = new Date();
            scope.centerId = routeParams.centerId;
    		resourceFactory.apscRepaymentResource.getAll({centerId: routeParams.centerId}, function (data) {
    			scope.repaymentDatas = data;
                for(var i in scope.repaymentDatas){
                    if(scope.repaymentDatas[i].payableFromApscBalance > 0){
                        scope.repaymentDatas[i].disableTransfer = false;
                    }else{
                       scope.repaymentDatas[i].disableTransfer = true; 
                    }
                }             
    		});

            scope.validateAllPayment = function(memberOverDueDatas,allChecked){
                if(allChecked){
                    for(var i = 0; i < memberOverDueDatas.length;i++){
                        if(!memberOverDueDatas[i].disableTransfer){
                            if(!memberOverDueDatas[i].isMemberChecked){
                                memberOverDueDatas[i].isMemberChecked = true; 
                                scope.validatePayment(memberOverDueDatas[i],memberOverDueDatas[i].isMemberChecked);
                            }
                        }else{
                            memberOverDueDatas[i].isMemberChecked = false;
                        }
                    }   
                }else{
                    for(var i = 0; i < memberOverDueDatas.length;i++){
                        if(!memberOverDueDatas[i].disableTransfer){
                           memberOverDueDatas[i].isMemberChecked = false; 
                        }
                    }    
                    scope.formData.apscRepaymentDetails = [];
                }
            }

            scope.validatePayment = function(memberOverDueData,checked){
                if(checked){
                    var apscRepaymentData = {};
                    apscRepaymentData.fromAccountId = memberOverDueData.memberSavingData.id;
                    apscRepaymentData.fromAccountType = scope.fromAccountType
                    apscRepaymentData.fromClientId = memberOverDueData.id;
                    apscRepaymentData.fromOfficeId = memberOverDueData.officeId;

                    apscRepaymentData.toAccountId = memberOverDueData.memberLoanData.id;
                    apscRepaymentData.toAccountType = scope.toAccountType;
                    apscRepaymentData.toOfficeId = memberOverDueData.officeId;
                    apscRepaymentData.toClientId = memberOverDueData.id;

                    apscRepaymentData.transferAmount = memberOverDueData.payableFromApscBalance;
                    apscRepaymentData.transferDescription = scope.transferDescription ;
                    apscRepaymentData.locale = scope.optlang.code;
                    apscRepaymentData.dateFormat = scope.df;
                    apscRepaymentData.transferDate = dateFilter(scope.transferData, scope.df)

                    scope.formData.apscRepaymentDetails.push(apscRepaymentData);
                    if(scope.repaymentDatas.length == scope.formData.apscRepaymentDetails.length){
                       scope.repaymentDatas.isAllChecked = true; 
                    }
                }else{
                    var idx = scope.formData.apscRepaymentDetails.findIndex(x => x.fromClientId == memberOverDueData.id);
                    if(idx >= 0){
                        scope.formData.apscRepaymentDetails.splice(idx,1);
                        scope.repaymentDatas.isAllChecked = false;
                    }
                }
            }

            scope.transfer = function(){
                resourceFactory.apscTransactionResource.doBulkTransaction(scope.formData,function(data){
                    location.path('/viewcenter/' + routeParams.centerId);
                });
            }

    	}
    });
     mifosX.ng.application.controller('MakeApscRepaymentController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', '$http', '$modal', 'dateFilter', 'API_VERSION', '$sce', '$rootScope', mifosX.controllers.MakeApscRepaymentController]).run(function ($log) {
        $log.info("MakeApscRepaymentController initialized");
    });
}(mifosX.controllers || {}));   	