(function (module) {
    mifosX.controllers = _.extend(module, {
        AdvancedSearchController: function (scope, routeParams, dateFilter, location, resourceFactory) {
            scope.formData = {};
            scope.showResults = false;
            scope.showClientResults = false;
            scope.totalPrincipalOutstanding = 0;
            scope.totaldisburementAmount = 0;
            scope.totalPrincipalRepaid = 0;
            scope.totalArrearsAmount = 0;
            scope.totalInterestOutstanding = 0;
            scope.totalInterestRepaid = 0;
            scope.csvData = [];
            scope.formData.locale = scope.optlang.code;
            scope.formData.dateFormat = "yyyy-MM-dd";
            /*--------------*/
            scope.offices = [];
            scope.loanProducts = [];
            scope.genderOptions = [];
            scope.clientTypeOptions = [];
            scope.clientClassificationOptions = [];
            scope.loanPurposeCategoryOptions = [];
            scope.loanPurposeOptions = [];
            scope.fundOptions = [];
            scope.selectedCriteriaList = [];
            scope.conditionalOperatorOptions = [];
            scope.stateOptions = [];
            scope.districtOptions = [];
            scope.view = 'search';
            scope.adHocQueryBUilder = {};
            scope.isCsvAvailable = false;
            scope.criteriaLength = 0;
            scope.totalLoanCount = 0;
            scope.totalDisbursedAmount = 0;
            scope.totalPOS = 0;
            
            scope.staticHeaders = ['Loan Id','Client Name','Disbursed Amount','Principal Oustanding'];
            scope.headerMap = {'clientClassifications' : 'Client Classification','clientTypes' : 'Client Type','districts' : 'District','funds' : 'Fund Name',
            'genders' : 'Gender','loanProducts' : 'Product Name','loanPurposeCategories' : 'Loan Purpose Group','loanPurposes':'Loan Purpose',
            'offices' : 'Office','states' : 'State','approvedDate' : 'Approved Date','disbursementDate' : 'Disbursement Date','pendingRepayment' : 'Pending Repayment', 'paidRepayment' : 'Paid Repayment',
            'trancheDisburse' : 'Is Tranche','overDueFromDays' : 'Overdue From days'};
            scope.headers = [];
            scope.fileName = 'searchresult('+dateFilter(new Date(), scope.formData.dateFormat)+').csv';
            scope.staticOrder = ['loanId','clientName','Principal Oustanding','Client Name'];
            scope.hiddenCriteriaList = ['approvedDate', 'disbursementDate','pendingRepayment','paidRepayment','principalOutstanding','overDueFromDays'];

            scope.orderMap = {'Loan Id' : 'loanId','Client Name' : 'clientName','Disbursed Amount' : 'disbursedAmount',
            'Principal Oustanding' : 'principalOutstandingAmount','Client Classification' : 'clientClassificationName','Client Type' : 'clientTypeName',
            'District':'districtName','Gender' : 'genderName','Product Name' : 'loanProductName',
'Loan Purpose Group':'loanPurposeGroup','Loan Purpose' : 'loanPurposeName','Office' : 'officeName','State' : 'stateName','Fund Name' : 'fundName',
'Approved Date' : 'approvedDate' , 'Disbursement Date' :'disbursementDate','Pending Repayment' : 'pendingRepayment', 'Paid Repayment' : 'paidRepayment' ,
'Is Tranche' : 'trancheDisburse','Overdue From days' : 'overDueFromDays'
            };

            scope.addParameter = function(isSelected, searchParam){
                if(isSelected == true){
                  scope.selectedCriteriaList.push(searchParam);
                }else{
                  var index = scope.selectedCriteriaList.indexOf(searchParam);
                  if(index>-1){
                     scope.selectedCriteriaList.splice(index, 1);
                  }
                }
            };

            var adHocQuery;
            resourceFactory.fundTemplateResource.getTemplate({command:'search'}, {},function (data) {
                scope.offices = data.offices;
                scope.loanProducts = data.loanProducts;
                scope.genderOptions = data.genderOptions;
                scope.clientTypeOptions = data.clientTypeOptions;
                scope.clientClassificationOptions = data.clientClassificationOptions;
                scope.loanPurposeCategoryOptions = data.loanPurposeCategoryOptions;
                scope.loanPurposeOptions = data.loanPurposeOptions;
                scope.fundOptions = data.fundOptions;
                scope.conditionalOperatorOptions = data.conditionalOperatorOptions;
            });
            resourceFactory.countryResource.getCountryData({countryId : 101},{}, function (data) {
                scope.stateOptions = data.statesDatas;
            });

            scope.getDistrictOptions = function(states){
              scope.districtOptions = [];
                  for(var i=0;i<states.length;i++){
                      for(var j=0;j<scope.stateOptions.length;j++){
                        if(states[i]==scope.stateOptions[j].stateId && scope.stateOptions[j].districtDatas && scope.stateOptions[j].districtDatas.length>0){
                          Array.prototype.push.apply(scope.districtOptions, scope.stateOptions[j].districtDatas);
                        }
                        
                      }
                  }
            };

            scope.submit = function () {
                scope.formData.selectedCriteriaList = scope.selectedCriteriaList.sort() ;
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = "yyyy-MM-dd";
                if(scope.formData.approvedDate){
                    if(scope.formData.approvedDate.min){
                      scope.formData.approvedDate.min = dateFilter(scope.formData.approvedDate.min, scope.formData.dateFormat);
                    }
                    if(scope.formData.approvedDate.max){
                      scope.formData.approvedDate.max = dateFilter(scope.formData.approvedDate.max, scope.formData.dateFormat);
                    }
                }
                if(scope.formData.disbursementDate){
                    if(scope.formData.disbursementDate.min){
                      scope.formData.disbursementDate.min = dateFilter(scope.formData.disbursementDate.min, scope.formData.dateFormat);
                    }
                    if(scope.formData.disbursementDate.max){
                      scope.formData.disbursementDate.max = dateFilter(scope.formData.disbursementDate.max, scope.formData.dateFormat);
                    }
                }
                scope.setCriteriaLength(scope.formData.selectedCriteriaList);
                resourceFactory.fundMappingSearchResource.search({isSummary : true},scope.formData, function (data) {
                    scope.searchResults = data.fundMappingSearchData;  
                    scope.view = 'summary';
                    scope.totalLoanCount = 0;
                    scope.totalDisbursedAmount = 0;
                    scope.totalPOS = 0;
                    for(var i=0;i<scope.searchResults.length;i++){
                      scope.totalLoanCount = scope.totalLoanCount + parseInt(scope.searchResults[i].loanCount);
                      scope.totalDisbursedAmount = scope.totalDisbursedAmount + scope.searchResults[i].disbursedAmount;
                      scope.totalPOS = scope.totalPOS + scope.searchResults[i].principalOutstandingAmount;
                    }
                    scope.fundSearchQueryBuilder = data.fundSearchQueryBuilder;
                });
            };

            scope.setCriteriaLength = function(criteriaList){
                scope.criteriaLength = criteriaList.length;
                for(var i = 0;i < scope.hiddenCriteriaList.length;i++){
                  if(criteriaList.indexOf(scope.hiddenCriteriaList[i])>=0){
                      scope.criteriaLength = (scope.criteriaLength-1);
                  }
                }
            }

            scope.getDetails = function () {
                resourceFactory.fundMappingSearchResource.search({isSummary : false},scope.fundSearchQueryBuilder, function (data) {
                    scope.csvData = data.fundMappingSearchData;  
                    scope.isCsvAvailable = true;
                    return scope.csvData;
                });
            };
            
            scope.getHeader = function(){
              scope.headers = scope.staticHeaders;
              if(scope.formData.selectedCriteriaList){
                  for(var i=0;i<scope.formData.selectedCriteriaList.length;i++){
                    scope.headers.push(scope.headerMap[scope.formData.selectedCriteriaList[i]]);
                  }
              }

              return scope.headers;
            };
            scope.assignFund = function(){
              resourceFactory.fundsResource.assign({'fundId': scope.fundId},scope.fundSearchQueryBuilder, function (data) {
                 location.path('/managefunds/');
              });
            };

            scope.getOrder = function(){
              scope.order = [];
              if(scope.headers){
                  for(var i=0;i<scope.headers.length;i++){
                    scope.order.push(scope.orderMap[scope.headers[i]]);
                  }
              }
              return scope.order;
            };

            scope.cancel = function(){
              scope.view = 'search';
            };


        }
    });
    mifosX.ng.application.controller('AdvancedSearchController', ['$scope', '$routeParams', 'dateFilter', '$location', 'ResourceFactory', mifosX.controllers.AdvancedSearchController]).run(function ($log) {
        $log.info("AdvancedSearchController initialized");
    });
}(mifosX.controllers || {}));
