(function (module) {
    mifosX.controllers = _.extend(module, {
        EditSurveyController: function (scope, routeParams, resourceFactory, location,$modal) {
            scope.surveyId = routeParams.surveyId;
            scope.formData = {};

            scope.resetAll = function(){
                resourceFactory.surveyTemplateResource.get({}, function (data) {
                    scope.surveyEntityTypes = data.surveyEntityTypes;
                    resourceFactory.surveyResource.getBySurveyId({surveyId: scope.surveyId}, function (data) {
                        scope.surveyData =  {};
                        angular.copy(data,scope.surveyData);
                        scope.formData.key = scope.surveyData.key;
                        scope.formData.name = scope.surveyData.name;
                        scope.formData.entityTypeId = scope.surveyData.entityTypeId;
                        if(!_.isUndefined(data.componentDatas)){
                            if(data.componentDatas.length > 0){
                                scope.formData.componentDatas = scope.surveyData.componentDatas || [];
                            }
                        }
                        if(!_.isUndefined(data.questionDatas)){
                            for(var i in scope.formData.componentDatas){
                                var componentKey = scope.formData.componentDatas[i].key;
                                for(var j in data.questionDatas){
                                    if(componentKey === data.questionDatas[j].componentKey){
                                        if(_.isUndefined(scope.formData.componentDatas[i].questionDatas)){
                                            scope.formData.componentDatas[i].questionDatas = [];
                                        }
                                        scope.formData.componentDatas[i].questionDatas.push(data.questionDatas[j]);
                                    }
                                }
                            }
                        }
                        scope.formData.active = scope.surveyData.active;
                        scope.formData.coOfficerRequired = scope.surveyData.coOfficerRequired;
                    });
                });
            };

            scope.resetAll();

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


            scope.onFileSelect = function ($files, componentIndex, questionIndex, optionIndex) {

                var files= $files;
                if (files.length > 0)
                {
                    var file = files[0];
                    var MAX_SIZE = 5120;
                    var MAX_HEIGHT = 60;
                    var MAX_WIDTH = 60;
                    var parent = scope;
                    var fileSize = file.size;

                    if(fileSize <= MAX_SIZE){
                        var fileReader = new FileReader();
                        fileReader.onload = function(fileLoadedEvent) {
                        
                            var srcData = fileLoadedEvent.target.result; // <--- data: base64
                            var image = document.createElement("img");
                            image.src = fileLoadedEvent.target.result; 

                            image.onload = function () {
                                var height = this.height;
                                var width = this.width;
                                if (height > MAX_HEIGHT || width > MAX_WIDTH) {
                                    parent.fileUploadError();
                                } else{
                                    if(parent.formData.componentDatas[componentIndex].questionDatas[questionIndex].responseDatas[optionIndex]){
                                        parent.formData.componentDatas[componentIndex].questionDatas[questionIndex].responseDatas[optionIndex].image = srcData;
                                    }  
                                }
                            };
                            
                        }
                 
                        fileReader.readAsDataURL(file) ;
                    }
                    else{
                        scope.fileUploadError();
                    } 
                }
            };

            scope.fileUploadError = function () {
                $modal.open({
                    templateUrl: 'fileuploaderror.html',
                    controller: FileUploadErrorCtrl
                });
            };


            var FileUploadErrorCtrl = function ($scope, $modalInstance) {
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
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
                //console.log(JSON.stringify(scope.reqFormData));
                resourceFactory.surveyResource.update({surveyId: scope.surveyId},scope.reqFormData, function (data) {
                    location.path('/admin/system/surveys/view/'+scope.surveyId);
                });
            }
        }
    });
    mifosX.ng.application.controller('EditSurveyController', ['$scope', '$routeParams', 'ResourceFactory', '$location','$modal', mifosX.controllers.EditSurveyController]).run(function ($log) {
        $log.info("EditSurveyController initialized");
    });
}(mifosX.controllers || {}));