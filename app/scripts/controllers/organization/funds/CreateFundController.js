(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateFundController: function (scope, resourceFactory, location, dateFilter, routeParams) {

            scope.formData = {};
            scope.fundSourceOptions = [];
            scope.facilityTypeOptions = [];
            scope.repaymentFequencyOptions = [];
            scope.categoryOptions = [];
            scope.periodOptions = [];
            scope.isOwn = true;
            scope.fundLoanPurposes = [];
            resourceFactory.fundTemplateResource.getTemplate(function (data) {
                scope.periodOptions = data.repaymentFrequencyTypeOptions;
                scope.fundSourceOptions = data.fundSourceOptions ;
                scope.facilityTypeOptions = data.facilityTypeOptions ;
                scope.formData.facilityType = {};
                for(var i=0;i<scope.facilityTypeOptions.length;i++){
                    if(scope.facilityTypeOptions[i].name =='Own'){
                        scope.isOwn = true; 
                        scope.formData.facilityType =  scope.facilityTypeOptions[i].id;  
                        break;           
                    }
                }
                scope.categoryOptions = data.categoryOptions ;
                scope.repaymentFequencyOptions = data.fundRepaymentFrequencyOptions ;
                scope.loanPurposeOptions = data.loanPurposeOptions;
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
                }  
                                           
                resourceFactory.fundsResource.save(this.formData, function (data) {
                    location.path('/managefunds/');
                });
            };

            scope.isOwnType = function(data){
                for(var i=0;i<scope.facilityTypeOptions.length;i++){
                    if(scope.facilityTypeOptions[i].id == this.formData.facilityType){
                        scope.isOwn = (scope.facilityTypeOptions[i].name =='Own');  
                        break;                   
                    }
                }
            };

            scope.updatePercentAmount = function(sanctionedAmount){
                if(sanctionedAmount && scope.fundLoanPurposes.length>0){
                    for (var i = scope.fundLoanPurposes.length - 1; i >= 0; i--) {
                        scope.fundLoanPurposes[i].totalAmount = scope.getPercentage(sanctionedAmount, scope.fundLoanPurposes[i].loanPurposeAmount);
                    };
                }
            };
            scope.getPercentage = function(sanctionedAmount, percentage){
                if(sanctionedAmount && percentage){
                    var amount = parseFloat(sanctionedAmount/100);
                    totalAmount = parseFloat(amount*percentage);
                    return totalAmount.toFixed(2);
                }
                return 0;
            };
            
            scope.addLoanPurpose = function(lp, amount){
                var loanPurpose = JSON.parse(lp);
                scope.loanPurposes = undefined;
                scope.loanPurposeAmount = undefined;
                var totalAmount = scope.getPercentage(scope.formData.sanctionedAmount, amount);
                scope.fundLoanPurposes.push({'loanPurposeId':loanPurpose.id,'loanPurposeName':loanPurpose.name,'loanPurposeAmount':amount, 'totalAmount': totalAmount });
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
    mifosX.ng.application.controller('CreateFundController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$routeParams', mifosX.controllers.CreateFundController]).run(function ($log) {
        $log.info("CreateFundController initialized");
    });
}(mifosX.controllers || {}));
