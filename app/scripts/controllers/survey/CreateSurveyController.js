(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateSurveyController: function (scope, resourceFactory, location, $modal) {
            scope.formData = {};
            resourceFactory.surveyTemplateResource.get({}, function (data) {
                scope.surveyEntityTypes = data.surveyEntityTypes;
            });

            scope.addNewComponent = function () {
                if (_.isUndefined(scope.formData.componentDatas)){
                    scope.formData.componentDatas = [];
                }
                scope.formData.componentDatas.push({});
            };

            scope.addNewQuestion = function (index) {
                var questionData = {};
                if (_.isUndefined(scope.formData.componentDatas[index].questionDatas)) {
                    scope.formData.componentDatas[index].questionDatas = [];
                }
                questionData.componentKey = scope.formData.componentDatas[index].key;
                scope.formData.componentDatas[index].questionDatas.push(questionData);
            };

            scope.addNewQuestionOptions = function (componentIndex, questionIndex) {
                if (_.isUndefined(scope.formData.componentDatas[componentIndex].questionDatas[questionIndex].responseDatas)) {
                    scope.formData.componentDatas[componentIndex].questionDatas[questionIndex].responseDatas = [];
                }
                scope.formData.componentDatas[componentIndex].questionDatas[questionIndex].responseDatas.push({});
            };

            scope.deleteData = function () {
                scope.isDeleteCalled = true;
                $modal.open({
                    templateUrl: 'deletedata.html',
                    controller: DeleteDataCtrl
                });
            };

            var DeleteDataCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    if(scope.isDeleteCalled && scope.dataToBeDelete){
                        if(scope.dataToBeDelete == 'component'){
                            scope.formData.componentDatas.splice(scope.deleteComponentIndex, 1);
                        }else if(scope.dataToBeDelete == 'question'){
                            scope.formData.componentDatas[scope.deleteComponentIndex].questionDatas.splice(scope.deleteQuestionIndex, 1);
                        }else if(scope.dataToBeDelete == 'option'){
                            scope.formData.componentDatas[scope.deleteComponentIndex].questionDatas[scope.deleteQuestionIndex].responseDatas.splice(scope.deleteOptionIndex,1);
                        }
                    }
                    $modalInstance.close('delete');
                    scope.isDeleteCalled = false;
                    scope.dataToBeDelete = undefined;
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                    scope.isDeleteCalled = false;
                    scope.dataToBeDelete = undefined;
                };
            };

            scope.isDeleteCalled = false;
            scope.deleteComponent = function (index) {
                if(!scope.isDeleteCalled){
                    scope.dataToBeDelete = "component";
                    if (_.isUndefined(scope.formData.componentDatas)){
                        scope.formData.componentDatas = [];
                    }else{
                        scope.deleteComponentIndex = index;
                    }
                }
                scope.deleteData();
            };

            scope.deletQuestion = function (componentIndex, questionIndex) {
                if(!scope.isDeleteCalled){
                    scope.dataToBeDelete = "question";
                    if (_.isUndefined(scope.formData.componentDatas[componentIndex].questionDatas)) {
                        scope.formData.componentDatas[componentIndex].questionDatas = [];
                    }else{
                        scope.deleteComponentIndex = componentIndex;
                        scope.deleteQuestionIndex = questionIndex;
                    }
                }
                scope.deleteData();
            };

            scope.deleteQuestionOptions = function (componentIndex, questionIndex, optionIndex) {
                if(!scope.isDeleteCalled){
                    scope.dataToBeDelete = "option";
                    if (_.isUndefined(scope.formData.componentDatas[componentIndex].questionDatas[questionIndex].responseDatas)) {
                        scope.formData.componentDatas[componentIndex].questionDatas[questionIndex].responseDatas = [];
                    }else{
                        scope.deleteComponentIndex = componentIndex;
                        scope.deleteQuestionIndex = questionIndex;
                        scope.deleteOptionIndex = optionIndex;
                    }
                }
                scope.deleteData();
            };

            var componentDataSequenceNo = 0;
            var questionSequenceNo = 0;
            var questionResponseSequenceNo = 0;
            scope.submit = function () {
                scope.reqFormData = {};
                angular.copy(scope.formData,scope.reqFormData);
                for (var i in scope.reqFormData.componentDatas) {
                    if (!_.isUndefined(scope.reqFormData.componentDatas[i]) && (_.isUndefined(scope.reqFormData.componentDatas[i].key) || _.isUndefined(scope.reqFormData.componentDatas[i].text))) {
                        delete scope.reqFormData.componentDatas[i];
                    } else {
                        componentDataSequenceNo++;
                        scope.reqFormData.componentDatas[i].sequenceNo = componentDataSequenceNo;
                        scope.reqFormData.componentDatas[i].description = null;
                        for (var j in scope.reqFormData.componentDatas[i].questionDatas) {
                            if( _.isUndefined(scope.reqFormData.questionDatas)){
                                scope.reqFormData.questionDatas = [];
                            }
                            if (!_.isUndefined(scope.reqFormData.componentDatas[i].questionDatas[j]) && ( _.isUndefined(scope.reqFormData.componentDatas[i].questionDatas[j].key) || _.isUndefined(scope.reqFormData.componentDatas[i].questionDatas[j].text))) {
                                delete scope.reqFormData.componentDatas[i].questionDatas[j];
                            } else {
                                questionSequenceNo++;
                                scope.reqFormData.componentDatas[i].questionDatas[j].sequenceNo = questionSequenceNo;
                                for (var k in scope.reqFormData.componentDatas[i].questionDatas[j].responseDatas) {
                                    if (!_.isUndefined(scope.reqFormData.componentDatas[i].questionDatas[j].responseDatas[k]) && (_.isUndefined(scope.reqFormData.componentDatas[i].questionDatas[j].responseDatas[k].text) || _.isUndefined(scope.reqFormData.componentDatas[i].questionDatas[j].responseDatas[k].value))) {
                                        delete scope.reqFormData.componentDatas[i].questionDatas[j].responseDatas[k];
                                    }else{
                                        questionResponseSequenceNo++;
                                        scope.reqFormData.componentDatas[i].questionDatas[j].responseDatas[k].sequenceNo = questionResponseSequenceNo;
                                    }
                                }
                            }
                        }
                        if( !_.isUndefined(scope.reqFormData.componentDatas[i].questionDatas)){
                            var questionDatas = [];
                            angular.copy(scope.reqFormData.componentDatas[i].questionDatas,questionDatas);
                            for(var z in questionDatas){
                                scope.reqFormData.questionDatas.push(questionDatas[z]);
                            }
                        }
                    }
                }
                for (var jj in scope.reqFormData.componentDatas) {
                    delete scope.reqFormData.componentDatas[jj].questionDatas;
                }
                resourceFactory.surveyResource.save(scope.reqFormData, function (data) {
                    location.path('/admin/system/surveys');
                });
            }
        }
    });
    mifosX.ng.application.controller('CreateSurveyController', ['$scope', 'ResourceFactory', '$location','$modal', mifosX.controllers.CreateSurveyController]).run(function ($log) {
        $log.info("CreateSurveyController initialized");
    });
}(mifosX.controllers || {}));