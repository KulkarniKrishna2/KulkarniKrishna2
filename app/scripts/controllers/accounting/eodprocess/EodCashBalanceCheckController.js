(function (module) {
    mifosX.controllers = _.extend(module, {
        EodCashBalanceCheckController: function ($controller,scope,$modal, routeParams, resourceFactory,location,dateFilter) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));
            scope.eodProcessId = scope.taskconfig.eodProcessId;

            scope.requestBody = {};
            scope.requestBody.locale = scope.optlang.code;
            scope.date = dateFilter(new Date(), scope.df);
            scope.msg = "";
            scope.isValidate = false;
            scope.amountMatched = false;

            scope.initDefaultValue =function(){
            	scope.physicalAmount = 0;
	            scope.totalCount = 0;
	            scope.showPreview = false;
	            scope.systemAmount = 0;
	            scope.isBalanceCheckClosureDone = false;
	            scope.denominationsOptions = [];
	            scope.eodBalanceCheckData = {};
	            scope.officeName = '';
	            scope.msg = "";
	            scope.isValidate = false;
            	scope.amountMatched = false;

            }
            scope.validate = function(){
            	scope.isValidate = true;
                if(scope.systemAmount==scope.totalAmount){
					scope.msg = "System amount and physical amount matched.";
            		scope.amountMatched = true;
            	}else if(scope.totalAmount==undefined){
					scope.msg = "System amount ("+scope.systemAmount+") not matching to physical amount 0. Diffrence amount is = "+(scope.systemAmount);
            		scope.amountMatched = false;
            	}else{
                    scope.msg = "System amount ("+scope.systemAmount+") not matching to physical amount "+scope.totalAmount+". Diffrence amount is = "+(scope.systemAmount-scope.totalAmount);
                    scope.amountMatched = false;
                }
            }

            scope.init =function(){
            	scope.initDefaultValue();
                resourceFactory.eodSummaryResource.get({eodProcessId:scope.eodProcessId,resourceName:'cashbalancecheck'},
                    function(data){
                        scope.eodSummary = data;
                        scope.denominationsOptions = scope.eodSummary.eodBalanceCheckData.denominationsOptions;
                        scope.isBalanceCheckClosureDone = scope.eodSummary.eodProcessData.isBalanceCheckClosureDone;
						if(scope.isBalanceCheckClosureDone==true){
                        	scope.eodBalanceCheckData = scope.eodSummary.eodBalanceCheckData;
                        }else{
							scope.systemAmount = data.eodBalanceCheckData.systemAmount;                        	
                        }
                        scope.officeName = scope.eodSummary.eodProcessData.officeData.name;
                        scope.date = dateFilter(scope.eodSummary.eodProcessData.eodDate, scope.df);					
                        
                 });
            }

            scope.init();

            scope.submit = function(){
            	scope.requestBody.systemAmount = scope.systemAmount;
            	scope.requestBody.note = scope.note;
            	scope.requestBody.physicalAmount = scope.totalAmount;
                scope.denominationDetails = [];
                for(var i in scope.denominationsOptions){
                    if(scope.denominationsOptions[i].count){
                        var data = {};
                        data.denominationId = scope.denominationsOptions[i].id;
                        data.denominationCount = scope.denominationsOptions[i].count;
                        scope.denominationDetails.push(data);
                    }
                }
                scope.requestBody.denominationDetails = scope.denominationDetails;
                resourceFactory.eodSummaryResource.save({eodProcessId:scope.eodProcessId,resourceName:'cashbalancecheck'},scope.requestBody,
                    function(data){
                        scope.init();
                });
            }

            scope.togglePreview = function(){
            	if(scope.showPreview==true){
					scope.showPreview = false;
            	}else{
            		scope.showPreview = true;
            	}
            	
            }

            scope.getAmount = function(index,count,amount){
                scope.denominationsOptions[index].actualAmount = parseInt(count)*parseInt(amount);
            	scope.getTotalCount();
            	scope.getTotalAmount();
            };

            scope.getTotalCount = function(){
            	scope.totalCount = 0;
            	for(var i in scope.denominationsOptions){
            		if(scope.denominationsOptions[i].count && scope.denominationsOptions[i].count>0){
						scope.totalCount = scope.totalCount+parseInt(scope.denominationsOptions[i].count);
            		}
            	}
            };

            scope.getTotalAmount = function(){
            	scope.totalAmount = 0;
            	for(var i in scope.denominationsOptions){
            		if(scope.denominationsOptions[i].actualAmount && scope.denominationsOptions[i].actualAmount>0){
						scope.totalAmount = scope.totalAmount+parseInt(scope.denominationsOptions[i].actualAmount);
            		}
            	}
            };

           

        }
    });

    mifosX.ng.application.controller('EodCashBalanceCheckController', ['$controller','$scope','$modal', '$routeParams', 'ResourceFactory','$location','dateFilter', mifosX.controllers.EodCashBalanceCheckController]).run(function ($log) {
        $log.info("EodCashBalanceCheckController initialized");
    });
}(mifosX.controllers || {}));
