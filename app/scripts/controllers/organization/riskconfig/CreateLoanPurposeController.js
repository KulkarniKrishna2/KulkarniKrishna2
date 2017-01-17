(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateLoanPurposeController: function (scope, routeParams, resourceFactory, location, $modal, route) {

            scope.uiData = {};
            scope.entityType = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            scope.formData = {};
            scope.formData.isActive = true;
            scope.formData.loanPurposeGroupIds = [];
            scope.categoryOptions = [];
            scope.classificationOptions = [];

            if(scope.entityId != undefined) {
                resourceFactory.loanPurposeGroupResource.get({
                    loanPurposeGroupsId: scope.entityId
                }, function (data) {
                    scope.loanPurposeGroupData = data;
                });
            } else {
                resourceFactory.loanPurposeGroupTemplateResource.get(function (dataType) {
                    scope.categoryOptions = dataType.loanPurposeGroupTypeOptions;
                    resourceFactory.loanPurposesTemplate.get(function (data) {
                        scope.loanPurposeGroupDatas = data.loanPurposeGroupDatas;
                    });
                });
            }

            scope.populateClassificationOption = function () {
                scope.classificationOptions = [];
                scope.classificationId = undefined;
                for(var i in scope.loanPurposeGroupDatas){
                    if(scope.loanPurposeGroupDatas[i].loanPurposeGroupType.id == scope.uiData.categoryId){
                        scope.classificationOptions.push(scope.loanPurposeGroupDatas[i]);
                    }
                }
            };

            scope.submit = function () {
                if (scope.uiData.classificationId != null) {
                    scope.formData.loanPurposeGroupIds.push(scope.uiData.classificationId);
                }else if (scope.entityId != undefined) {
                    scope.formData.loanPurposeGroupIds.push(scope.entityId);
                }
                if (scope.formData.loanPurposeGroupIds.length == 0) {
                    delete scope.formData.loanPurposeGroupIds;
                }
                scope.formData.locale = "en";
                resourceFactory.loanPurposeResource.save(scope.formData, function (data) {
                    location.path('/loanpurpose');
                });
            }

        }
    });
    mifosX.ng.application.controller('CreateLoanPurposeController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', mifosX.controllers.CreateLoanPurposeController]).run(function ($log) {
        $log.info("CreateLoanPurposeController initialized");
    });

}(mifosX.controllers || {}));