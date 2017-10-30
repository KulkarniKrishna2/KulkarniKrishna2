
(function (module) {
    mifosX.controllers = _.extend(module, {
        AddWorkflowStepsController: function (scope, resourceFactory, location, routeParams, dateFilter) {
                 scope.formData = {};
                 scope.taskConfigStepsTemplate = {};
                 scope.riskCriterias = [];
                 scope.taskActivities = [];
                 scope.taskActionGroups = [];
                 scope.taskConfig = {};
                 scope.datatableName="";
                 scope.riskCriteriaMap = {};
                 scope.criteriaData = {};
                 scope.riskCriteriaId= null;
                 scope.configValues = {};
                 scope.activityData = {};
                 scope.taskConfigStepsData = {};
                 scope.entityTypes = [];

                 scope.comparators = {
                        "STRING": [
                            {display: "==", value: "eq"},
                            {display: "!=", value: "ne"},
                            {display: "contains", value: "contains"},
                            {display: "Starts With", value: "startswith"}
                        ],
                        "NUMBER": [
                            {display: "==", value: "eq"},
                            {display: "!=", value: "ne"},
                            {display: ">", value: "gt"},
                            {display: "<", value: "lt"},
                            {display: ">=", value: "ge"},
                            {display: "<=", value: "le"}
                        ],
                        "BOOLEAN": [
                            {display: "==", value: "eq"},
                            {display: "!=", value: "ne"}
                        ]
                 };

                if(routeParams.taskConfigId){
                   resourceFactory.workflowConfigStepsTemplateResource.get({taskConfigId:routeParams.taskConfigId}, function (data) {
                        scope.taskConfigStepsTemplate = data;
                        if(scope.taskConfigStepsTemplate){
                            if(scope.taskConfigStepsTemplate.rules){
                                scope.riskCriterias  = scope.taskConfigStepsTemplate.rules.slice();
                                populateRiskCriteriaMap();
                            }
                            if(scope.taskConfigStepsTemplate.taskActivities){
                                scope.taskActivities = scope.taskConfigStepsTemplate.taskActivities.slice();
                            }
                            if(scope.taskConfigStepsTemplate.taskActionGroups){
                                scope.taskActionGroups = scope.taskConfigStepsTemplate.taskActionGroups.slice();
                            }
                            if(scope.taskConfigStepsTemplate.taskConfig){
                                scope.taskConfig = scope.taskConfigStepsTemplate.taskConfig;
                            }

                            if(scope.taskConfigStepsTemplate.entityTypes){
                                scope.entityTypes = scope.taskConfigStepsTemplate.entityTypes;
                            }

                            if(routeParams.taskConfigStepId){
                                   resourceFactory.workflowConfigStepsResource.get({taskConfigId:routeParams.taskConfigId,taskConfigStepId:routeParams.taskConfigStepId}, function (data) {
                                        scope.taskConfigStepsData = data;
                                        if(scope.taskConfigStepsData){ 
                                          for(var i = 0; i < scope.taskActivities.length; i++){
                                               if(scope.taskActivities[i].id == scope.taskConfigStepsData.taskActivityId){
                                                 scope.activityData = scope.taskActivities[i];
                                               }
                                           }
                                           scope.formData.id = scope.taskConfigStepsData.id;
                                           scope.formData.name = scope.taskConfigStepsData.name;
                                           scope.formData.shortName = scope.taskConfigStepsData.shortName;
                                           scope.riskCriteriaId = scope.taskConfigStepsData.criteriaId;
                                           scope.criteriaData.approvalLogic = scope.taskConfigStepsData.approvalLogic;
                                           scope.criteriaData.rejectionLogic = scope.taskConfigStepsData.rejectionLogic;
                                           scope.formData.actionGroupId = scope.taskConfigStepsData.actionGroupId;
                                           if(scope.taskConfigStepsData.configValues){
                                               if(scope.taskConfigStepsData.configValues.datatablename){
                                                   scope.configValues = scope.taskConfigStepsData.configValues;
                                               } 
                                               if(scope.taskConfigStepsData.configValues.surveryId){
                                                   scope.configValues.datatablename = scope.taskConfigStepsData.configValues.surveryId;
                                               }
                                           }
                                        } 
                                    });
                            }
                        }
                   });
                }

                 function populateRiskCriteriaMap () {
                    scope.riskCriterias.forEach(function (item) {
                        if(item.valueType == 'BOOLEAN' && item.options == undefined){
                            item.options = [{key:"true",value:"true"},{key:"false",value:"false"}];
                        }
                        if(item.options !== undefined && item.options.length > 0 && item.valueType != 'NUMBER'){
                            item.comparators = [{display: "==", value: "eq"},
                                {display: "!=", value: "ne"}];
                        }else{
                            item.comparators = scope.comparators[item.valueType];
                        }
                        scope.riskCriteriaMap[item.id] = item;
                    });
                };

              scope.changeInCriteria = function(){
                    var riskCriteria;
                    var valueType;
                    var defaultValue;
                    var criteriaId = scope.riskCriteriaId;
                    if(criteriaId !== undefined){
                        riskCriteria = scope.riskCriteriaMap[criteriaId];
                        if(riskCriteria!== undefined){
                            defaultValue = riskCriteria.possibleOutputs[0].key;
                            valueType = riskCriteria.valueType;
                        }
                    }
                    var newCriteria = {
                        riskCriteriaId: scope.riskCriteriaId,
                        approvalLogic: {expression:{parameter:"criteria",comparator:"eq",valueType:valueType,value:defaultValue}},
                        rejectionLogic: {expression:{parameter:"criteria",comparator:"eq",valueType:valueType,value:defaultValue}}
                    };
                    scope.criteriaData = newCriteria;
                }
                   
                 scope.submit = function(){
                    this.formData.locale = scope.optlang.code;
                    //TaskType.WORKFLOW = 1; TaskType.SINGLE = 2;
                        this.formData.taskType = 2;
                        this.formData.isActive = true;
                        this.formData.parentId = routeParams.taskConfigId;
                    if(this.activityData.id){
                        this.formData.activityId = this.activityData.id;
                        //TaskActivityType.SURVERY = 1;  TaskActivityType.DATATABLE = 2;
                        if(this.activityData.type.id == 1){
                            scope.errorDetails=[];
                            if(scope.configValues.datatablename == undefined){
                                return scope.errorDetails.push([{code: 'error.msg.validation.input.surveryid'}]);
                            }    
                            this.formData.configValues = {};
                            this.formData.configValues.surveryId=scope.configValues.datatablename; 
                        }
                        if(this.activityData.type.id == 2){
                            scope.errorDetails=[];
                            if(scope.configValues.datatablename == undefined){
                                return scope.errorDetails.push([{code: 'error.msg.validation.input.datatablename'}]);
                            }
                            if(scope.configValues.entityType == undefined){
                                return scope.errorDetails.push([{code: 'error.msg.validation.select.enitytype'}]);
                            }  
                            this.formData.configValues = this.configValues;     
                        }

                    }
                    if(scope.criteriaData.riskCriteriaId){
                            this.formData.criteriaId = scope.criteriaData.riskCriteriaId;
                            this.formData.approvalLogic = scope.criteriaData.approvalLogic;
                            this.formData.rejectionLogic = scope.criteriaData.rejectionLogic;
                    }
                    if(routeParams.taskConfigStepId){
                          resourceFactory.workflowConfigStepsResource.update({taskConfigId:routeParams.taskConfigId,taskConfigStepId:routeParams.taskConfigStepId},this.formData,function (data) {
                            location.path('/viewworkflowstep/'+routeParams.taskConfigId+'/'+routeParams.taskConfigStepId)
                           });
                    }else{           
                        resourceFactory.workflowConfigStepsResource.save({taskConfigId:routeParams.taskConfigId},this.formData,function (data) {
                            location.path('/viewworkflowstep/'+routeParams.taskConfigId+'/'+data.resourceId)
                        });
                    }
                  
                } 
               
        }
    });
    mifosX.ng.application.controller('AddWorkflowStepsController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.AddWorkflowStepsController]).run(function ($log) {
        $log.info("AddWorkflowStepsController initialized");
    });
}(mifosX.controllers || {}));