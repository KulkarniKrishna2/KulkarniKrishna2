
(function (module) {
    mifosX.controllers = _.extend(module, {
        EodFinancialSummaryController: function ($controller,scope,$modal, routeParams, resourceFactory,location,dateFilter,popUpUtilService) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));
            scope.eodProcessId = scope.taskconfig.eodProcessId;
            scope.requestBody = {};
            scope.requestBody.locale = scope.optlang.code;
            scope.requestBody.dateFormat = scope.df;
            scope.cashAccounts = [];
            scope.highLightedType = [0,1,4];
            scope.isFinancialClosureDone = false;
            scope.isFinancialStepDone = false;
            
            scope.init =function(){
                resourceFactory.eodSummaryResource.get({eodProcessId:scope.eodProcessId,resourceName:'financial'},
                    function(financialData){
                        scope.eodFinancialSummary = financialData.eodFinancialData;
                        scope.officeId = financialData.eodProcessData.officeData.id;
                        scope.constructData();
                        scope.isFinancialClosureDone = financialData.eodProcessData.isFinancialClosureDone;
                        scope.isFinancialStepDone =  financialData.eodProcessData.isFinancialStepDone;
                    });
            }

            scope.constructData = function(){
                scope.eodCashSummary = [];
                scope.eodBankSummary = [];
                for(var i in scope.eodFinancialSummary){
                    var data = {};
                    data.account = scope.eodFinancialSummary[i].account;
                    data.transactionType = scope.eodFinancialSummary[i].transactionType;
                    if(scope.eodFinancialSummary[i].transactionType == 1){
                        var nameData = {};
                        var account = {};
                        account.id = scope.eodFinancialSummary[i].account.id;
                        account.name = scope.eodFinancialSummary[i].account.name;
                        nameData.account = account;
                        data.account.name = 'Openning Balance';
                        nameData.transactionType = 0;
                        if(scope.eodFinancialSummary[i].type=='CASH'){
                            scope.eodCashSummary.push(nameData);
                        }else{
                            scope.eodBankSummary.push(nameData);
                        }
                    }else if(scope.eodFinancialSummary[i].transactionType==4){
                        data.account.name = 'Closing Balance';
                    }
                    data.balanceAmount = scope.eodFinancialSummary[i].balanceAmount;
                    data.inAmount = scope.eodFinancialSummary[i].inAmount;
                    data.outAmount = scope.eodFinancialSummary[i].outAmount;
                    if(scope.eodFinancialSummary[i].type=='CASH'){
                        scope.eodCashSummary.push(data);
                    }else{
                        scope.eodBankSummary.push(data);
                    }
                }
                scope.constructCashMapData();
                scope.constructBankMapData();
            }

            scope.constructCashMapData = function(){
                scope.cashMapData = {};
                for(var i in scope.eodCashSummary){
                    if(scope.cashMapData[scope.eodCashSummary[i].account.id]==undefined){
                       scope.cashMapData[scope.eodCashSummary[i].account.id]  = [];
                    }                    
                    if(scope.eodCashSummary[i].transactionType==0){
                        scope.cashMapData[scope.eodCashSummary[i].account.id].push(scope.eodCashSummary[i]);
                    }else{
                        scope.cashMapData[scope.eodCashSummary[i].account.id].push(scope.eodCashSummary[i]);
                    }

                }
                scope.cashAccounts =  Object.keys(scope.cashMapData);
            }
            scope.constructBankMapData = function(){
                scope.bankMapData = {};
                for(var i in scope.eodBankSummary){
                    if(scope.bankMapData[scope.eodBankSummary[i].account.id]==undefined){
                       scope.bankMapData[scope.eodBankSummary[i].account.id] = [];
                    }                    
                    if(scope.eodBankSummary[i].transactionType==0){
                        scope.bankMapData[scope.eodBankSummary[i].account.id].push(scope.eodBankSummary[i]);
                    }else{
                        scope.bankMapData[scope.eodBankSummary[i].account.id].push(scope.eodBankSummary[i]);
                    }
                }
                scope.bankAccounts =  Object.keys(scope.bankMapData);
            }
            scope.init();
            scope.createJournalVoucher = function(){
                scope.popUpHeaderName = "label.heading.frequentpostings"
                scope.includeHTML = 'views/accounting/eodprocess/createjournalvoucher.html';
                var templateUrl = 'views/common/openpopup.html';
                var controller = 'CreateJournalVoucherController';
                popUpUtilService.openFullScreenPopUp(templateUrl, controller, scope);
                scope.init();
            };
            
            scope.submit = function(){
                scope.constructRequestBody(scope.eodFinancialSummary);
                resourceFactory.eodSummaryResource.save({eodProcessId:scope.eodProcessId,resourceName:'financial'},scope.requestBody,
                    function(data){
                        scope.init();
                    });
            }

            scope.constructRequestBody = function(financialData){
                scope.requestBody.financialData = [];
                for(var i in financialData){
                    var data = {};
                    data.accountId = financialData[i].account.id;
                    data.transactionTypeId = financialData[i].transactionType;
                    data.inAmount = financialData[i].inAmount;
                    data.outAmount = financialData[i].outAmount;
                    data.balanceAmount = financialData[i].balanceAmount;
                    data.type = financialData[i].type;
                    scope.requestBody.financialData.push(data);
                }
            }
            scope.cancel = function(){
                location.path('/eodprocess');
            }
        }
    });

    mifosX.ng.application.controller('EodFinancialSummaryController', ['$controller','$scope','$modal', '$routeParams', 'ResourceFactory','$location','dateFilter','PopUpUtilService', mifosX.controllers.EodFinancialSummaryController]).run(function ($log) {
        $log.info("EodFinancialSummaryController initialized");
    });
}(mifosX.controllers || {}));