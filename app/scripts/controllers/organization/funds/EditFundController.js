(function (module) {
    mifosX.controllers = _.extend(module, {
        EditFundController: function (scope, resourceFactory, location, dateFilter, routeParams) {

            scope.formData = {};
            scope.fundSourceOptions = [];
            scope.facilityTypeOptions = [];
            scope.repaymentFequencyOptions = [];
            scope.categoryOptions = [];
            scope.periodOptions = [];
            scope.isLoanAssigned = false;
            scope.fundId = routeParams.fundId;
            scope.isOwn = false;
            scope.loanPurposeOptions = [];
            scope.fundLoanPurposes = [];

            scope.fundSourceTypeName = "";
            scope.fundRepaymentFrequencyTypeName = "";
            scope.fundCategoryTypeName = "";
            scope.morotoriumFrequencyTypeName = "";
            scope.facilityTypeName = "";
            scope.tenureFrequencyTypeName = "";
            scope.fundCategoryTypeName = "";
                           
            resourceFactory.fundTemplateResource.getTemplate(function (data) {
                scope.periodOptions = data.repaymentFrequencyTypeOptions;
                scope.fundSourceOptions = data.fundSourceOptions ;
                scope.facilityTypeOptions = data.facilityTypeOptions ;
                scope.categoryOptions = data.categoryOptions ;
                scope.repaymentFequencyOptions = data.fundRepaymentFrequencyOptions ;
                scope.loanPurposeOptions = data.loanPurposeOptions;
            });
            scope.isOwnType = function(id){
                for(var i=0;i<scope.facilityTypeOptions.length;i++){
                            if(scope.facilityTypeOptions[i].id == id){
                                scope.isOwn = (scope.facilityTypeOptions[i].name =='Own');                     
                            }
                        }
            };
            resourceFactory.fundsResource.get({'fundId': routeParams.fundId},{}, function (data) {                
                resourceFactory.fundTemplateResource.getTemplate(function (tempData) {
                        scope.isLoanAssigned = data.isLoanAssigned;
                        if(scope.isLoanAssigned==true){

                           scope.facilityTypeName = data.facilityType.name;
                           if(data.fundSource){
                                scope.fundSourceTypeName = data.fundSource.name;
                           }
                           if(data.fundRepaymentFrequency){
                                scope.fundRepaymentFrequencyTypeName = data.fundRepaymentFrequency.name;
                           }
                           if(data.fundCategory){
                                scope.fundCategoryTypeName = data.fundCategory.name;
                           }
                           if(data.tenureFrequency){
                                scope.tenureFrequencyTypeName = data.tenureFrequency.value;
                           }
                           if(data.morotoriumFrequency){
                                scope.morotoriumFrequencyTypeName = data.morotoriumFrequency.value;
                           }
                           if(data.fundSource){
                                scope.fundSourceTypeName = data.fundSource.name;
                           }
                        }
                        scope.periodOptions = tempData.repaymentFrequencyTypeOptions;
                        scope.fundSourceOptions = tempData.fundSourceOptions ;
                        scope.facilityTypeOptions = tempData.facilityTypeOptions ;
                        scope.categoryOptions = tempData.categoryOptions ;
                        scope.repaymentFequencyOptions = tempData.fundRepaymentFrequencyOptions ;
                        scope.formData = data;
                        scope.formData.facilityType = data.facilityType.id;
                        scope.isOwnType(data.facilityType);
                        
                        if(scope.isOwn==false){
                            scope.formData.fundSource = data.fundSource.id;
                            scope.formData.fundCategory = data.fundCategory.id;
                            scope.formData.fundRepaymentFrequency = data.fundRepaymentFrequency.id;
                            scope.formData.tenureFrequency = data.tenureFrequency.id;
                            scope.formData.morotoriumFrequency = data.morotoriumFrequency.id;
                            scope.formData.assignmentStartDate = new Date(dateFilter(data.assignmentStartDate, scope.df));
                            scope.formData.assignmentEndDate = new Date(dateFilter(data.assignmentEndDate, scope.df));
                            scope.formData.disbursedDate = new Date(dateFilter(data.disbursedDate, scope.df));
                            scope.formData.sanctionedDate = new Date(dateFilter(data.sanctionedDate, scope.df));
                            scope.formData.maturityDate = new Date(dateFilter(data.maturityDate, scope.df));
                            if(scope.formData.fundLoanPurposeData.length>0){
                                for(var i=0; i< scope.formData.fundLoanPurposeData.length;i++){
                                    scope.fundLoanPurposes.push({'loanPurposeId':scope.formData.fundLoanPurposeData[i].loanPurpose.id,
                                        'loanPurposeName':scope.formData.fundLoanPurposeData[i].loanPurpose.name,
                                        'loanPurposeAmount':scope.formData.fundLoanPurposeData[i].loanPurposeAmount});
                                }
                                
                            }
                        }else{
                            scope.formData.fundSource = undefined;
                            scope.formData.fundCategory = undefined;
                            scope.formData.fundRepaymentFrequency = undefined;
                            scope.formData.assignmentStartDate = undefined;
                            scope.formData.assignmentEndDate = undefined;
                            scope.formData.disbursedDate = undefined;
                            scope.formData.sanctionedDate = undefined;
                            scope.formData.maturityDate = undefined;
                            scope.formData.tenureFrequency = undefined;
                            scope.formData.tenure = undefined;
                            scope.formData.morotoriumFrequency = undefined;
                            scope.formData.morotorium = undefined;
                        }

                        scope.formData.fundLoanPurposeData = undefined;
                        scope.formData.isLoanAssigned = undefined;
                        scope.formData.id = undefined;
                });
                
            });

            scope.submit = function () {
                if(scope.isOwn==false){
                    this.formData.dateFormat = scope.df;
                    this.formData.locale = scope.optlang.code;
                    this.formData.sanctionedDate  = dateFilter(scope.formData.sanctionedDate, scope.df);
                    this.formData.maturityDate  = dateFilter(scope.formData.maturityDate, scope.df);
                    this.formData.disbursedDate  = dateFilter(scope.formData.disbursedDate, scope.df);
                    this.formData.assignmentEndDate  = dateFilter(scope.formData.assignmentEndDate, scope.df);
                    this.formData.assignmentStartDate  = dateFilter(scope.formData.assignmentStartDate, scope.df);
                    this.formData.fundLoanPurpose  = scope.fundLoanPurposes;
                }else{
                   this.formData.fundLoanPurpose  = undefined; 
                }
                
                resourceFactory.fundsResource.update({'fundId': scope.fundId}, this.formData, function (data) {
                    location.path('/viewfund/'+routeParams.fundId);
                });
            };

            scope.addLoanPurpose = function(lp, amount){
                var loanPurpose = JSON.parse(lp);
                scope.loanPurposes = undefined;
                scope.loanPurposeAmount = undefined;
                scope.fundLoanPurposes.push({'loanPurposeId':loanPurpose.id,'loanPurposeName':loanPurpose.name,'loanPurposeAmount':amount});
            };

            scope.removeLoanPurpose = function(index){
                scope.fundLoanPurposes.splice(index,1);
            };

            scope.isLoanPurposeSelected = function(id){
                for (var i = 0; i< scope.fundLoanPurposes.length; i++) {
                    if(scope.fundLoanPurposes[i].loanPurposeId == id){
                        return true;
                    }
                }
                return false;
            };

        }
    });
    mifosX.ng.application.controller('EditFundController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$routeParams', mifosX.controllers.EditFundController]).run(function ($log) {
        $log.info("EditFundController initialized");
    });
}(mifosX.controllers || {}));
