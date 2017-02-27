(function (module) {
    mifosX.controllers = _.extend(module, {
        existingLoanActivityController: function ($controller,scope, routeParams, resourceFactory, location, $modal, route, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.addExistingLoan = false;
            scope.formData = {};
            scope.editExistingLoan=false;

            function initTask(){
                scope.clientId = scope.taskconfig['clientId'];
                existingLoans();
                scope.activityDone();
            };

            initTask();

            function existingLoans(){
              resourceFactory.clientExistingLoan.getAll({clientId: scope.clientId}, function(data){
                        scope.existingLoans = data;
              });
            };
            scope.showEditClientExistLoan=function(existingloanId){
                scope.addExistingLoan=false;
                scope.editExistingLoan=true;
                scope.clientId = scope.clientId;
                scope.existingloanId = existingloanId;
                scope.formData = {};

            resourceFactory.clientExistingLoanTemplate.get({clientId: scope.clientId}, function (data) {
                scope.existingLoanSourceOption = data.existingLoanSourceOption;
                scope.creditBureauProductsOption = data.creditBureauProductsOption;
                scope.lenderOption = data.lenderOption;
                scope.loanTypeOption = data.loanTypeOption;
                scope.externalLoanPurposeOption = data.externalLoanPurposeOption;
                scope.loanTenaureOption = data.loanTenaureOption;
                scope.termPeriodFrequencyType = data.termPeriodFrequencyType;
                scope.loanStatusOption = data.loanStatusOption;
                scope.getExistingLoan(); 
            });   
            };
            scope.getExistingLoan = function(){
                resourceFactory.clientExistingLoan.get({
                    clientId: scope.clientId,
                    existingloanId: scope.existingloanId
                }, function (data) {
                    if (!_.isUndefined(data.source)) {
                        scope.formData.sourceId = data.source.id;
                    }
                    if (!_.isUndefined(data.creditBureauProductData)) {
                        scope.formData.creditBureauProductId = data.creditBureauProductData.id;
                    }
                    if (!_.isUndefined(data.lender)) {
                        scope.formData.lenderId = data.lender.id;
                    }
                    scope.formData.lenderName = data.lenderName;
                    if (!_.isUndefined(data.loanType)) {
                        scope.formData.loanTypeId = data.loanType.id;
                    }
                    if (!_.isUndefined(data.externalLoanPurpose)) {
                        scope.formData.externalLoanPurposeId = data.externalLoanPurpose.id;
                    }
                    if (!_.isUndefined(data.disbursedDate)) {
                        scope.formData.disbursedDate = dateFilter(new Date(data.disbursedDate), scope.df);
                    }
                    if(!_.isUndefined(data.loanStatus.id) && !_.isNull(data.loanStatus.id)){
                        scope.formData.loanStatusId = data.loanStatus.id;
                    }
                    scope.formData.amountBorrowed = data.amountBorrowed;
                    scope.formData.gt0dpd3mths = data.gt0Dpd3Mths;
                    scope.formData.dpd30mths12 = data.dpd30Mths12;
                    scope.formData.dpd30mths24 = data.dpd30Mths24;
                    scope.formData.dpd60mths24 = data.dpd60Mths24;
                    scope.formData.currentOutstanding = data.currentOutstanding;
                    scope.formData.amtOverdue = data.amtOverdue;
                    scope.formData.writtenOffAmount = data.writtenOffAmount;
                    scope.formData.installmentAmount = data.installmentAmount;
                    scope.formData.loanTenure = data.loanTenure;
                    if (!_.isUndefined(data.loanTenurePeriodType)) {
                        scope.formData.loanTenurePeriodType = data.loanTenurePeriodType.id;
                    }
                    scope.formData.repaymentFrequencyMultipleOf = data.repaymentFrequencyMultipleOf;
                    if (!_.isUndefined(data.repaymentFrequency)) {
                        scope.formData.repaymentFrequency = data.repaymentFrequency.id;
                    }
                    scope.formData.archive = data.archive;
                });
            };

            scope.submitUpdate=function(){
                this.formData.clientId = scope.clientId;
                //this.formData.id = scope.existingloanId;
                this.formData.archive = "1";
                if (!_.isUndefined(scope.formData.disbursedDate)) {
                    this.formData.disbursedDate = dateFilter(scope.formData.disbursedDate, scope.df);
                }
                this.formData.dateFormat = scope.df;
                this.formData.locale = scope.optlang.code;
                resourceFactory.clientExistingLoan.update({
                    clientId: scope.clientId,
                    existingloanId: scope.existingloanId
                }, this.formData, function (data) {
                    scope.editExistingLoan=false;
                    initTask();
                });
            };
            scope.addLoan = function () {
                resourceFactory.clientExistingLoanTemplate.get({clientId: scope.clientId}, function (data) {
                    scope.existingLoanSourceOption = data.existingLoanSourceOption;
                    scope.creditBureauProductsOption = data.creditBureauProductsOption;
                    scope.lenderOption = data.lenderOption;
                    scope.loanTypeOption = data.loanTypeOption;
                    scope.externalLoanPurposeOption = data.externalLoanPurposeOption;
                    scope.loanTenaureOption = data.loanTenaureOption;
                    scope.termPeriodFrequencyType = data.termPeriodFrequencyType;
                    scope.loanStatusOption = data.loanStatusOption;
                    scope.addExistingLoan = true;
                });
            };

            scope.submit = function () {
                scope.formData.archive = "1";
                if (!_.isUndefined(scope.formData.disbursedDate)) {
                    this.formData.disbursedDate = dateFilter(scope.formData.disbursedDate, scope.df);
                }
                this.formData.dateFormat = scope.df;
                this.formData.locale = scope.optlang.code;
                resourceFactory.clientExistingLoan.save({clientId: scope.clientId}, this.formData, function (data) {
                    existingLoans();
                    scope.addExistingLoan = false;
                });
            };

            scope.cancel = function () {
                scope.addExistingLoan = false;
                scope.editExistingLoan=false;
            };

        }
    });
    mifosX.ng.application.controller('existingLoanActivityController', ['$controller','$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', 'dateFilter', mifosX.controllers.existingLoanActivityController]).run(function ($log) {
        $log.info("existingLoanActivityController initialized");
    });

}(mifosX.controllers || {}));